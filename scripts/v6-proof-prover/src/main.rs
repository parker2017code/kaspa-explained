use std::io::{self, Read};

use serde_json::{json, Value};
use v6_proof_prover::{generate_proof, verify_proof, ProveRequest, VerifyRequest};

const MAX_REQUEST_BYTES: usize = 1_000_000;

fn main() {
    let mut input = String::new();
    // Read one byte past the accepted limit so oversized requests are
    // rejected without buffering an unbounded stdin stream.
    if io::stdin().take((MAX_REQUEST_BYTES + 1) as u64).read_to_string(&mut input).is_err() || input.len() > MAX_REQUEST_BYTES {
        eprintln!("request is missing or too large");
        std::process::exit(2);
    }
    let request: Value = match serde_json::from_str(&input) {
        Ok(value) => value,
        Err(error) => {
            eprintln!("invalid JSON request: {error}");
            std::process::exit(2);
        }
    };
    let operation = request.get("operation").and_then(Value::as_str).unwrap_or("prove");
    let result = match operation {
        "prove" => serde_json::from_value::<ProveRequest>(request)
            .map_err(|error| error.to_string())
            .and_then(|request| generate_proof(&request).map(|bundle| serde_json::to_value(bundle).expect("proof bundle JSON"))),
        "verify" => serde_json::from_value::<VerifyRequest>(request)
            .map_err(|error| error.to_string())
            .and_then(|request| verify_proof(&request).map(|response| serde_json::to_value(response).expect("verify response JSON"))),
        _ => Err(format!("unsupported operation '{operation}'")),
    };
    match result {
        Ok(value) => println!("{}", serde_json::to_string(&value).expect("JSON output")),
        Err(error) => {
            println!("{}", json!({"error": error}));
            std::process::exit(1);
        }
    }
}
