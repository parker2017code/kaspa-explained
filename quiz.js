(function () {
  const questions = [
    {
      category: "Custody",
      prompt: "A wallet popup asks for a Permit2 signature with a deadline far in the future. The site is real, but you reached it through an ad. What is the best read?",
      options: [
        "Permit signatures are off-chain, so the wallet balance cannot be affected.",
        "The real domain makes it safe; phishing only matters on fake domains.",
        "The signature can still create spending authority. Verify the exact spender, token, allowance, and route before signing.",
        "A hardware wallet makes the signature harmless."
      ],
      correct: 2,
      explanation: "Off-chain signatures can authorize later on-chain movement. Hardware wallets protect keys, not your judgment about what you authorize."
    },
    {
      category: "Tokenomics",
      prompt: "A token trades at $0.20 with 50M circulating supply, 2B total supply, and monthly investor unlocks. Which number is the trap?",
      options: [
        "The circulating market cap looks small while future supply can reprice the float.",
        "The total supply is irrelevant if today's chart is strong.",
        "The token price is low, so dilution is already priced in.",
        "Unlocks only matter if the team announces they are selling."
      ],
      correct: 0,
      explanation: "Low float can make market cap look cheap while FDV and unlocks create future supply pressure. The chart does not remove that risk."
    },
    {
      category: "Consensus",
      prompt: "Two chains both show a transaction quickly. One has probabilistic PoW confirmations; one has BFT-style finality after validator votes. What should you not collapse?",
      options: [
        "Inclusion latency, confirmation confidence, and the mechanism that makes reversal costly.",
        "Block explorers and wallet balances.",
        "Whether the transaction appears in a UI.",
        "Token price and transaction fee."
      ],
      correct: 0,
      explanation: "Fast inclusion is not the same as finality or economic security. The path to confidence depends on the consensus model."
    },
    {
      category: "Markets",
      prompt: "A token has $400M market cap, $900K daily volume, and a 2% order-book depth of $120K. What is the practical implication?",
      options: [
        "The market cap means large holders can exit near the displayed price.",
        "The chart is liquid enough if a major exchange lists it.",
        "The headline valuation may be much larger than realistic exit liquidity.",
        "Low depth proves the token is early, not risky."
      ],
      correct: 2,
      explanation: "Market cap is not exit liquidity. Depth, volume quality, venue concentration, and slippage matter."
    },
    {
      category: "DeFi",
      prompt: "A protocol pays high stablecoin yield from leveraged loop strategies against another yield-bearing asset. What is the least naive question?",
      options: [
        "Whether the APY is higher than Treasury yields.",
        "Whether the loop depends on oracle assumptions, borrow liquidity, liquidation mechanics, and correlated collateral risk.",
        "Whether the token has enough social engagement.",
        "Whether the pool says stablecoin, because stablecoin pools cannot depeg."
      ],
      correct: 1,
      explanation: "Structured DeFi yield often hides leverage, oracle, liquidation, depeg, and liquidity assumptions behind a simple APY."
    },
    {
      category: "Security",
      prompt: "A project says its contracts are audited, liquidity is locked, ownership is renounced, and the team is doxxed. What is still missing?",
      options: [
        "Nothing important; those four signals cover the main risks.",
        "Whether the system has economic demand, safe integrations, sane emissions, oracle risk, upgrade paths, and insider supply pressure.",
        "Only whether the website looks professional.",
        "Only whether the ticker is memorable."
      ],
      correct: 1,
      explanation: "Security theater often stacks real but incomplete signals. Audits and locked liquidity do not prove economic or systemic safety."
    },
    {
      category: "Claims",
      prompt: "A chain says it solved the trilemma because it has high throughput, low fees, and a large validator count. What is the stronger critique?",
      options: [
        "Ask about hardware requirements, state growth, bandwidth, validator distribution, client diversity, governance, and failure modes.",
        "High throughput alone proves centralization.",
        "Low fees prove decentralization.",
        "Validator count is the only decentralization metric that matters."
      ],
      correct: 0,
      explanation: "Trilemma claims require a threat model and resource-cost analysis, not a few favorable surface metrics."
    },
    {
      category: "Kaspa",
      prompt: "In Kaspa, why is 'blockDAG' alone not the whole innovation?",
      options: [
        "Because a DAG is only useful for consensus if there is a rule for selecting, ordering, and weighting blocks.",
        "Because the DAG removes the need for Proof of Work.",
        "Because parallel blocks are automatically final.",
        "Because a DAG means every block is equally blue."
      ],
      correct: 0,
      explanation: "The hard part is ordering and consensus over the graph. GHOSTDAG is the live ordering rule; the DAG shape by itself is not enough."
    },
    {
      category: "Kaspa",
      prompt: "What is the cleanest way to describe Kaspa's 10 BPS era?",
      options: [
        "Higher block production rate with live GHOSTDAG ordering, not proof of instant finality or unlimited throughput.",
        "DAGKnight mainnet activation.",
        "A guarantee that every transaction is final in 100 milliseconds.",
        "A sign that node resource costs no longer matter."
      ],
      correct: 0,
      explanation: "10 BPS is live block-rate behavior. It does not erase propagation, bandwidth, storage, fee, or confirmation tradeoffs."
    },
    {
      category: "Roadmap",
      prompt: "A project has a detailed research post, a testnet branch, and community demos. What public claim is still too strong?",
      options: [
        "It is being explored or implemented.",
        "It has public development evidence.",
        "It is live mainnet functionality.",
        "It deserves primary-source tracking."
      ],
      correct: 2,
      explanation: "Research, branches, and demos can be real progress without being live mainnet behavior."
    },
    {
      category: "Infrastructure",
      prompt: "An L2 inherits Ethereum data availability but has one centralized sequencer, upgradeable bridge contracts, and no live fraud proofs. What is the best classification?",
      options: [
        "Ethereum security, full stop.",
        "A system with Ethereum-adjacent settlement/data assumptions plus separate sequencer, bridge, proof, and governance risks.",
        "A sidechain, because all L2s are sidechains.",
        "Decentralized if transaction fees are paid in ETH."
      ],
      correct: 1,
      explanation: "L2 security is layered. Data availability, settlement, sequencing, bridge custody, proof systems, and admin powers should be separated."
    },
    {
      category: "Custody",
      prompt: "You revoke all ERC-20 approvals after using a DeFi app. Which risk remains?",
      options: [
        "Past malicious signatures or approvals on other chains/apps, seed compromise, and assets in contracts or bridges.",
        "No risk remains, because revoking approvals resets the wallet.",
        "Only market-price risk.",
        "Only risk from NFTs, not tokens."
      ],
      correct: 0,
      explanation: "Revoking approvals is useful but narrow. It does not unwind all signatures, bridges, contract deposits, or key compromise."
    },
    {
      category: "DeFi",
      prompt: "An AMM pool shows deep total liquidity, but most of it sits far outside the current price range. What can still happen?",
      options: [
        "Trades near the current price can still suffer high slippage.",
        "Concentrated liquidity removes impermanent loss.",
        "Depth outside the range guarantees tight execution.",
        "LPs cannot be adversely selected."
      ],
      correct: 0,
      explanation: "Displayed total liquidity can mislead if active liquidity near the execution range is thin."
    },
    {
      category: "Governance",
      prompt: "A DAO vote passes with 92% support, but 4 delegates control most voting power and a multisig executes upgrades. What should the headline be?",
      options: [
        "The community decided.",
        "Token-vote signaling happened, but control concentration and execution authority still matter.",
        "The protocol is now immutable.",
        "The vote proves legal decentralization."
      ],
      correct: 1,
      explanation: "Votes are not the same as broad control. Distribution, delegation, quorum, multisig powers, and execution mechanics matter."
    },
    {
      category: "Basics",
      prompt: "A startup wants to put supply-chain records on-chain so customers know products are authentic. What is the core weakness?",
      options: [
        "Blockchains cannot preserve records.",
        "The chain can preserve entered data, but cannot prove messy off-chain facts were true at entry.",
        "Supply-chain use cases always require Proof of Work.",
        "Tokens make all physical audits unnecessary."
      ],
      correct: 1,
      explanation: "On-chain records can improve auditability, but they do not solve the oracle problem or real-world inspection by themselves."
    },
    {
      category: "Risk",
      prompt: "A bridge uses a multisig of known ecosystem members and has never been hacked. What is the strongest remaining concern?",
      options: [
        "Known signers remove bridge risk.",
        "The trust model may still depend on signer honesty, key security, upgrade authority, monitoring, and withdrawal liquidity.",
        "Bridge risk only exists for anonymous teams.",
        "No hack history proves the design is secure."
      ],
      correct: 1,
      explanation: "Social trust and past uptime are not the same as minimized trust. Bridge assumptions should be explicit."
    },
    {
      category: "MEV",
      prompt: "A chain has low fees and fast blocks. Why can MEV still matter?",
      options: [
        "Because ordering power, private order flow, liquidation races, and validator/sequencer incentives can exist even when fees are low.",
        "MEV only exists on Ethereum mainnet.",
        "Fast blocks eliminate transaction ordering.",
        "Low fees mean users cannot be sandwiched."
      ],
      correct: 0,
      explanation: "MEV is about ordering and extraction opportunities. Fee level and speed do not erase it."
    },
    {
      category: "Kaspa",
      prompt: "Why is 'Kaspa is Bitcoin but faster' an incomplete description?",
      options: [
        "Because Kaspa keeps PoW instincts but changes the single-chain bottleneck with a blockDAG and GHOSTDAG ordering, while future app work is status-labeled.",
        "Because Kaspa is Proof of Stake.",
        "Because Bitcoin has no latency assumptions.",
        "Because Kaspa already has mature native DeFi."
      ],
      correct: 0,
      explanation: "The useful contrast is about blockDAG consensus and status-labeled programmability, not a slogan that hides the mechanism."
    },
    {
      category: "Roadmap",
      prompt: "A Kaspa roadmap discussion mentions Toccata, covenants, vProgs, native DeFi, and DAGKnight together. Which split is most disciplined?",
      options: [
        "They are all live because they belong to the same thesis.",
        "Toccata/covenants are near-term track, vProgs/native app rails are roadmap architecture, and DAGKnight remains research/upgrade direction until activation evidence changes.",
        "DAGKnight is live if 10 BPS is live.",
        "vProgs are ordinary rollups, so their status does not matter."
      ],
      correct: 1,
      explanation: "Bundling roadmap terms is how public explanations drift. Each claim needs its own status lane."
    },
    {
      category: "Markets",
      prompt: "A token's volume is high, but most trades are between two related market makers on one exchange. What should you infer?",
      options: [
        "Volume quality matters; wash-like or concentrated volume may not represent broad organic demand.",
        "High volume always means strong adoption.",
        "Market makers cannot influence perceived liquidity.",
        "Exchange volume is more important than order-book depth or holder distribution."
      ],
      correct: 0,
      explanation: "Volume can be low quality. Venue concentration, maker behavior, spread, depth, and real user flow all matter."
    }
  ];

  const confidenceScores = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4
  };

  const form = document.querySelector("[data-quiz-form]");
  const result = document.querySelector("[data-quiz-result]");
  const questionsRoot = document.querySelector("[data-quiz-questions]");

  if (!form || !result || !questionsRoot) return;

  questionsRoot.innerHTML = questions.map((question, index) => {
    const answers = question.options.map((option, optionIndex) => `
      <label class="quiz-option">
        <input type="radio" name="q${index}" value="${optionIndex}" required>
        <b>${String.fromCharCode(65 + optionIndex)}</b>
        <span>${option}</span>
      </label>
    `).join("");

    return `
      <fieldset class="quiz-question">
        <legend>
          <span class="quiz-number">${String(index + 1).padStart(2, "0")}</span>
          <strong>${question.prompt}</strong>
          <em>${question.category}</em>
        </legend>
        <div class="quiz-options">${answers}</div>
      </fieldset>
    `;
  }).join("");

  const getResultTitle = (score, confidenceGap) => {
    if (score >= 92) return "Actually Competent Operator";
    if (score >= 80 && confidenceGap <= 0) return "Quiet Builder";
    if (score >= 80) return "Mostly Calibrated";
    if (score >= 62 && confidenceGap >= 2) return "Whitepaper Skimmer";
    if (score >= 62) return "Halfway Dangerous";
    if (confidenceGap >= 2) return "Crypto Twitter Expert";
    return "Honest Beginner";
  };

  const getDiagnosis = (score, gap, weakest) => {
    if (score >= 92) return "You handled the traps that usually separate vocabulary from real judgment. Keep checking primary sources and threat models before making strong claims.";
    if (score >= 80) return "You have a workable model, but the missed questions are still the sort of details that create bad trades, bad claims, or bad wallet decisions.";
    if (score >= 62 && gap >= 2) return `You know the language, but your confidence is ahead of your model. Your weakest area was ${weakest}.`;
    if (score >= 62) return `You are not lost, but you are not ready to trust your instincts alone. Your weakest area was ${weakest}.`;
    if (gap >= 2) return `Your confidence is doing more work than your understanding. Your most visible weakness was ${weakest}.`;
    return `You are early in the learning curve, which is fine. Start with ${weakest}, then rebuild from custody, markets, and consensus.`;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const confidence = String(data.get("confidence") || "beginner");
    const confidenceValue = confidenceScores[confidence] || 1;
    const categoryStats = new Map();
    let correct = 0;

    questions.forEach((question, index) => {
      const selected = Number(data.get(`q${index}`));
      const isCorrect = selected === question.correct;
      if (isCorrect) correct += 1;

      const current = categoryStats.get(question.category) || { correct: 0, total: 0 };
      current.total += 1;
      if (isCorrect) current.correct += 1;
      categoryStats.set(question.category, current);
    });

    const score = Math.round((correct / questions.length) * 100);
    const knowledgeBand = score >= 90 ? 4 : score >= 78 ? 3 : score >= 58 ? 2 : 1;
    const confidenceGap = confidenceValue - knowledgeBand;
    const weakest = Array.from(categoryStats.entries())
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0][0];
    const title = getResultTitle(score, confidenceGap);
    const gapLabel = confidenceGap >= 2 ? "High overconfidence" : confidenceGap === 1 ? "Slight overconfidence" : confidenceGap === 0 ? "Calibrated" : "Underconfident";
    const confidenceLabel = confidence.charAt(0).toUpperCase() + confidence.slice(1);

    const categoryRows = Array.from(categoryStats.entries()).map(([category, stats]) => {
      const categoryScore = Math.round((stats.correct / stats.total) * 100);
      return `<li><strong>${category}</strong><span>${stats.correct}/${stats.total} correct - ${categoryScore}%</span></li>`;
    }).join("");

    const missed = questions.map((question, index) => {
      const selected = Number(data.get(`q${index}`));
      if (selected === question.correct) return "";
      return `
        <article>
          <h3>${question.category}: ${question.prompt}</h3>
          <p><strong>Better answer:</strong> ${question.options[question.correct]}</p>
          <p>${question.explanation}</p>
        </article>
      `;
    }).filter(Boolean).join("");

    result.hidden = false;
    result.innerHTML = `
      <div class="quiz-result-card">
        <p class="eyebrow">Your result</p>
        <h2>${title}</h2>
        <div class="result-metrics">
          <div><span>Self-rating</span><strong>${confidenceLabel}</strong></div>
          <div><span>Actual score</span><strong>${score}%</strong></div>
          <div><span>Confidence gap</span><strong>${gapLabel}</strong></div>
          <div><span>Main weakness</span><strong>${weakest}</strong></div>
        </div>
        <p>${getDiagnosis(score, confidenceGap, weakest)}</p>
      </div>
      <div class="quiz-breakdown">
        <h2>Category breakdown.</h2>
        <ul>${categoryRows}</ul>
      </div>
      ${missed ? `<div class="quiz-review"><h2>What you missed.</h2>${missed}</div>` : ""}
    `;

    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
