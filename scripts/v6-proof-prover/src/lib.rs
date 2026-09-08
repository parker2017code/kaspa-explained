//! The deliberately small Groth16 circuit used by the V6 Observatory lesson.
//!
//! The relation is intentionally bounded and easy to explain:
//!
//! * `allocation * rate = task_score`
//! * `allocation + rate = reward_units`
//! * both private operands are in the inclusive range 1..=15
//!
//! The recipient and nonce are public Fr values represented as exact 128-bit
//! halves. They are copied into private variables and constrained equal to
//! their public counterparts so a proof cannot be replayed with another
//! recipient or nonce. The contract separately checks that those halves are
//! the full x-only owner key and that all field encodings are canonical.

use ark_bn254::{Bn254, Fr};
use ark_crypto_primitives::snark::SNARK;
use ark_ff::{Field, PrimeField};
use ark_groth16::{Groth16, Proof, ProvingKey, VerifyingKey};
use ark_relations::{
    gr1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError, Variable},
    lc,
};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize, Compress, Validate};
use ark_std::rand::{rngs::StdRng, SeedableRng};
use serde::{Deserialize, Serialize};

pub const MAX_OPERAND: u64 = 15;
pub const MIN_OPERAND: u64 = 1;
pub const DEFAULT_TASK_SCORE: u64 = 42;
pub const DEFAULT_REWARD_UNITS: u64 = 13;
pub const DEFAULT_ALLOCATION: u64 = 6;
pub const DEFAULT_RATE: u64 = 7;
pub const PUBLIC_INPUT_COUNT: usize = 5;
pub const PUBLIC_INPUT_ORDER: [&str; PUBLIC_INPUT_COUNT] = [
    "taskScore",
    "rewardUnits",
    "recipientLo128",
    "recipientHi128",
    "taskNonce128",
];

// A fixed seed makes local fixtures reproducible. It is explicitly a
// development setup, never a production ceremony or a source of secrecy.
pub const DEVELOPMENT_SETUP_SEED: u64 = 0x5636_7072_6f6f_6656;
pub const CIRCUIT_ID: &str = "kaspa-explained:v6-bounded-work:v1";

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProveRequest {
    pub task_score: u64,
    pub reward_units: u64,
    /// Little-endian 128-bit recipient half, exactly 16 bytes.
    pub recipient_lo: [u8; 16],
    /// Little-endian 128-bit recipient half, exactly 16 bytes.
    pub recipient_hi: [u8; 16],
    /// Little-endian 128-bit task nonce, exactly 16 bytes.
    pub task_nonce: [u8; 16],
    pub allocation: u64,
    pub rate: u64,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PublicInputBytes {
    pub order: [String; PUBLIC_INPUT_COUNT],
    pub values: [String; PUBLIC_INPUT_COUNT],
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProofBundle {
    pub circuit: String,
    pub field: String,
    pub public_inputs: PublicInputBytes,
    pub verifying_key: String,
    pub proof: String,
    pub verified: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct VerifyRequest {
    pub verifying_key: String,
    pub proof: String,
    /// Canonical 32-byte little-endian Fr encodings in PUBLIC_INPUT_ORDER.
    pub public_inputs: [String; PUBLIC_INPUT_COUNT],
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct VerifyResponse {
    pub circuit: String,
    pub verified: bool,
}

#[derive(Clone)]
struct BoundedWorkCircuit {
    task_score: Option<Fr>,
    reward_units: Option<Fr>,
    recipient_lo: Option<Fr>,
    recipient_hi: Option<Fr>,
    task_nonce: Option<Fr>,
    allocation: Option<Fr>,
    rate: Option<Fr>,
}

fn field(value: u64) -> Fr {
    Fr::from(value)
}

fn enforce_equal<F: Field>(cs: &ConstraintSystemRef<F>, witness: Variable, public: Variable) -> Result<(), SynthesisError> {
    cs.enforce_r1cs_constraint(|| lc!() + witness, || lc!() + Variable::One, || lc!() + public)
}

fn enforce_range(cs: &ConstraintSystemRef<Fr>, variable: Variable, value: Option<Fr>) -> Result<(), SynthesisError> {
    // x = 1 + b0 + 2*b1 + 4*b2 + 8*b3, then exclude x=16 with an inverse
    // witness. The bit constraints make the representation unique and bound
    // the private operand to 1..=15 over the field rather than over integers.
    let value_for_bits = value;
    let bits: Vec<Variable> = (0..4)
        .map(|bit| {
            let expected = value_for_bits.map(|x| {
                let n = x.into_bigint().as_ref()[0] - 1;
                Fr::from((n >> bit) & 1)
            });
            cs.new_witness_variable(|| expected.ok_or(SynthesisError::AssignmentMissing))
        })
        .collect::<Result<_, _>>()?;

    for bit in &bits {
        cs.enforce_r1cs_constraint(
            || lc!() + *bit,
            || lc!() + *bit - (Fr::ONE, Variable::One),
            || lc!(),
        )?;
    }

    let mut decomposition = lc!() + (Fr::ONE, Variable::One);
    for (index, bit) in bits.iter().enumerate() {
        decomposition = decomposition + (Fr::from(1u64 << index), *bit);
    }
    cs.enforce_r1cs_constraint(|| decomposition, || lc!() + Variable::One, || lc!() + variable)?;

    let inverse = cs.new_witness_variable(|| {
        value
            .map(|x| (x - Fr::from(16u64)).inverse().unwrap_or_else(|| Fr::from(0u64)))
            .ok_or(SynthesisError::AssignmentMissing)
    })?;
    cs.enforce_r1cs_constraint(
        || lc!() + variable - (Fr::from(16u64), Variable::One),
        || lc!() + inverse,
        || lc!() + Variable::One,
    )
}

impl ConstraintSynthesizer<Fr> for BoundedWorkCircuit {
    fn generate_constraints(self, cs: ConstraintSystemRef<Fr>) -> Result<(), SynthesisError> {
        let task_score = cs.new_input_variable(|| self.task_score.ok_or(SynthesisError::AssignmentMissing))?;
        let reward_units = cs.new_input_variable(|| self.reward_units.ok_or(SynthesisError::AssignmentMissing))?;
        let recipient_lo = cs.new_input_variable(|| self.recipient_lo.ok_or(SynthesisError::AssignmentMissing))?;
        let recipient_hi = cs.new_input_variable(|| self.recipient_hi.ok_or(SynthesisError::AssignmentMissing))?;
        let task_nonce = cs.new_input_variable(|| self.task_nonce.ok_or(SynthesisError::AssignmentMissing))?;

        let allocation_value = self.allocation;
        let rate_value = self.rate;
        let allocation = cs.new_witness_variable(|| allocation_value.ok_or(SynthesisError::AssignmentMissing))?;
        let rate = cs.new_witness_variable(|| rate_value.ok_or(SynthesisError::AssignmentMissing))?;
        enforce_range(&cs, allocation, allocation_value)?;
        enforce_range(&cs, rate, rate_value)?;

        // The worker's private operands satisfy the public task and reward.
        cs.enforce_r1cs_constraint(|| lc!() + allocation, || lc!() + rate, || lc!() + task_score)?;
        cs.enforce_r1cs_constraint(
            || lc!() + allocation + rate,
            || lc!() + Variable::One,
            || lc!() + reward_units,
        )?;

        // Copies ensure every identity field participates in the relation.
        let recipient_lo_copy = cs.new_witness_variable(|| self.recipient_lo.ok_or(SynthesisError::AssignmentMissing))?;
        let recipient_hi_copy = cs.new_witness_variable(|| self.recipient_hi.ok_or(SynthesisError::AssignmentMissing))?;
        let task_nonce_copy = cs.new_witness_variable(|| self.task_nonce.ok_or(SynthesisError::AssignmentMissing))?;
        enforce_equal(&cs, recipient_lo_copy, recipient_lo)?;
        enforce_equal(&cs, recipient_hi_copy, recipient_hi)?;
        enforce_equal(&cs, task_nonce_copy, task_nonce)?;
        Ok(())
    }
}

fn circuit(request: &ProveRequest, with_witness: bool) -> BoundedWorkCircuit {
    let values = |bytes: &[u8; 16]| Fr::from_le_bytes_mod_order(bytes);
    BoundedWorkCircuit {
        task_score: Some(field(request.task_score)),
        reward_units: Some(field(request.reward_units)),
        recipient_lo: Some(values(&request.recipient_lo)),
        recipient_hi: Some(values(&request.recipient_hi)),
        task_nonce: Some(values(&request.task_nonce)),
        allocation: with_witness.then(|| field(request.allocation)),
        rate: with_witness.then(|| field(request.rate)),
    }
}

pub fn validate_request(request: &ProveRequest) -> Result<(), String> {
    if !(MIN_OPERAND..=MAX_OPERAND).contains(&request.allocation)
        || !(MIN_OPERAND..=MAX_OPERAND).contains(&request.rate)
    {
        return Err(format!("allocation and rate must each be between {MIN_OPERAND} and {MAX_OPERAND}"));
    }
    if request.allocation.saturating_mul(request.rate) != request.task_score {
        return Err("allocation * rate must equal taskScore".to_string());
    }
    if request.allocation.saturating_add(request.rate) != request.reward_units {
        return Err("allocation + rate must equal rewardUnits".to_string());
    }
    if request.task_score != DEFAULT_TASK_SCORE || request.reward_units != DEFAULT_REWARD_UNITS {
        return Err("the V6 lesson uses taskScore=42 and rewardUnits=13".to_string());
    }
    Ok(())
}

fn serialize_compressed<T: CanonicalSerialize>(value: &T) -> Result<String, String> {
    let mut bytes = Vec::new();
    value.serialize_with_mode(&mut bytes, Compress::Yes).map_err(|e| e.to_string())?;
    Ok(hex::encode(bytes))
}

fn serialize_fr(value: &Fr) -> Result<String, String> {
    let mut bytes = Vec::new();
    value.serialize_uncompressed(&mut bytes).map_err(|e| e.to_string())?;
    if bytes.len() != 32 {
        return Err("BN254 Fr did not serialize to 32 bytes".to_string());
    }
    Ok(hex::encode(bytes))
}

fn public_input_values(request: &ProveRequest) -> Result<[String; PUBLIC_INPUT_COUNT], String> {
    [
        field(request.task_score),
        field(request.reward_units),
        Fr::from_le_bytes_mod_order(&request.recipient_lo),
        Fr::from_le_bytes_mod_order(&request.recipient_hi),
        Fr::from_le_bytes_mod_order(&request.task_nonce),
    ]
    .map(|value| serialize_fr(&value))
    .into_iter()
    .collect::<Result<Vec<_>, _>>()?
    .try_into()
    .map_err(|_| "public input arity changed".to_string())
}

fn setup() -> Result<(ProvingKey<Bn254>, VerifyingKey<Bn254>), String> {
    let mut rng = StdRng::seed_from_u64(DEVELOPMENT_SETUP_SEED);
    Groth16::<Bn254>::circuit_specific_setup(circuit_for_setup(), &mut rng).map_err(|e| e.to_string())
}

fn circuit_for_setup() -> BoundedWorkCircuit {
    BoundedWorkCircuit {
        task_score: None,
        reward_units: None,
        recipient_lo: None,
        recipient_hi: None,
        task_nonce: None,
        allocation: None,
        rate: None,
    }
}

pub fn generate_proof(request: &ProveRequest) -> Result<ProofBundle, String> {
    validate_request(request)?;
    let (pk, vk) = setup()?;
    let public_inputs = [
        field(request.task_score),
        field(request.reward_units),
        Fr::from_le_bytes_mod_order(&request.recipient_lo),
        Fr::from_le_bytes_mod_order(&request.recipient_hi),
        Fr::from_le_bytes_mod_order(&request.task_nonce),
    ];
    let mut rng = StdRng::seed_from_u64(DEVELOPMENT_SETUP_SEED ^ 0x5052_4f4f_465f_7636);
    let proof = Groth16::<Bn254>::prove(&pk, circuit(request, true), &mut rng).map_err(|e| e.to_string())?;
    let verified = Groth16::<Bn254>::verify(&vk, &public_inputs, &proof).map_err(|e| e.to_string())?;
    if !verified {
        return Err("fresh proof did not verify against its public inputs".to_string());
    }
    let values = public_input_values(request)?;
    Ok(ProofBundle {
        circuit: CIRCUIT_ID.to_string(),
        field: "BN254 Fr (canonical 32-byte little-endian)".to_string(),
        public_inputs: PublicInputBytes {
            order: PUBLIC_INPUT_ORDER.map(str::to_string),
            values,
        },
        verifying_key: serialize_compressed(&vk)?,
        proof: serialize_compressed(&proof)?,
        verified,
    })
}

pub fn verify_proof(request: &VerifyRequest) -> Result<VerifyResponse, String> {
    let vk_bytes = hex::decode(&request.verifying_key).map_err(|e| format!("invalid verifying key hex: {e}"))?;
    let proof_bytes = hex::decode(&request.proof).map_err(|e| format!("invalid proof hex: {e}"))?;
    let vk = VerifyingKey::<Bn254>::deserialize_with_mode(vk_bytes.as_slice(), Compress::Yes, Validate::Yes)
        .map_err(|e| format!("invalid verifying key: {e}"))?;
    let proof = Proof::<Bn254>::deserialize_with_mode(proof_bytes.as_slice(), Compress::Yes, Validate::Yes)
        .map_err(|e| format!("invalid proof: {e}"))?;
    let mut inputs = Vec::with_capacity(PUBLIC_INPUT_COUNT);
    for value in &request.public_inputs {
        let bytes = hex::decode(value).map_err(|e| format!("invalid public input hex: {e}"))?;
        if bytes.len() != 32 {
            return Err("public inputs must be exactly 32 bytes".to_string());
        }
        inputs.push(Fr::deserialize_uncompressed(bytes.as_slice()).map_err(|e| format!("invalid public input Fr: {e}"))?);
    }
    let verified = Groth16::<Bn254>::verify(&vk, &inputs, &proof).map_err(|e| e.to_string())?;
    Ok(VerifyResponse { circuit: CIRCUIT_ID.to_string(), verified })
}

#[cfg(test)]
mod tests {
    use super::*;
    use ark_relations::gr1cs::ConstraintSystem;

    fn request(allocation: u64, rate: u64) -> ProveRequest {
        ProveRequest {
            task_score: allocation * rate,
            reward_units: allocation + rate,
            recipient_lo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            recipient_hi: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
            task_nonce: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
            allocation,
            rate,
        }
    }

    #[test]
    fn default_circuit_is_satisfied() {
        let request = request(6, 7);
        let cs = ConstraintSystem::<Fr>::new_ref();
        circuit(&request, true).generate_constraints(cs.clone()).unwrap();
        assert!(cs.is_satisfied().unwrap(), "unsatisfied at {:?}", cs.which_is_unsatisfied());
    }

    #[test]
    fn operand_sixteen_is_unsatisfied_by_the_r1cs_range_constraint() {
        let request = request(16, 7);
        let cs = ConstraintSystem::<Fr>::new_ref();
        circuit(&request, true).generate_constraints(cs.clone()).unwrap();
        assert!(!cs.is_satisfied().unwrap(), "operand 16 must fail the 1..=15 constraint");
    }

    #[test]
    fn every_public_input_is_bound_to_the_proof() {
        let request = request(6, 7);
        let bundle = generate_proof(&request).unwrap();
        for index in 0..PUBLIC_INPUT_COUNT {
            let mut values = bundle.public_inputs.values.clone();
            let mut first_byte = u8::from_str_radix(&values[index][..2], 16).unwrap();
            first_byte = first_byte.wrapping_add(1);
            values[index].replace_range(..2, &format!("{first_byte:02x}"));
            let result = verify_proof(&VerifyRequest {
                verifying_key: bundle.verifying_key.clone(),
                proof: bundle.proof.clone(),
                public_inputs: values,
            }).unwrap();
            assert!(!result.verified, "mutated public input {index} must invalidate the proof");
        }
    }
}
