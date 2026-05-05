(function () {
  const questions = [
    {
      category: "Custody",
      prompt: "A wallet popup asks you to sign a message before claiming an airdrop. What is the safest first move?",
      options: [
        "Sign it because message signatures cannot move funds.",
        "Check what the signature authorizes, verify the site, and use a burner wallet if you still need to interact.",
        "Ask the project Telegram whether the popup is normal.",
        "Turn off your VPN and try again."
      ],
      correct: 1,
      explanation: "A signature can authorize more than a harmless login. The safe habit is to inspect intent, verify the app, and isolate risk."
    },
    {
      category: "Tokenomics",
      prompt: "A token has a $20M market cap and a $2B fully diluted valuation. What should that make you ask?",
      options: [
        "Whether future unlocks could dilute current holders or add sell pressure.",
        "Whether the token is guaranteed to reach $2B market cap.",
        "Whether the low market cap means it is early and therefore safe.",
        "Whether the contract is renounced."
      ],
      correct: 0,
      explanation: "Market cap and FDV can diverge when most supply is not circulating. Unlock schedule and insider allocation matter."
    },
    {
      category: "Consensus",
      prompt: "What does Proof of Work primarily make expensive?",
      options: [
        "Creating valid blocks and rewriting history without controlling enough work.",
        "Opening a wallet.",
        "Writing smart contracts.",
        "Sending transactions to a centralized exchange."
      ],
      correct: 0,
      explanation: "Proof of Work makes block production and reorganization costly through external energy and hardware competition."
    },
    {
      category: "Markets",
      prompt: "A coin has a $100M market cap. Does that mean $100M was invested into it?",
      options: [
        "Yes, market cap equals dollars deposited.",
        "No. Market cap is price times supply and can move on much less actual liquidity.",
        "Yes, unless the coin is proof-of-work.",
        "No, but only for meme coins."
      ],
      correct: 1,
      explanation: "Market cap is not a cash pile. Thin liquidity can produce large market-cap moves from much smaller flows."
    },
    {
      category: "DeFi",
      prompt: "A pool offers 2% daily yield with no clear source of revenue. What is the best interpretation?",
      options: [
        "High demand proves the protocol is strong.",
        "The yield probably comes from emissions, leverage, new deposits, or hidden risk until proven otherwise.",
        "APY is always safe if the contract is audited.",
        "Daily yield is safer than yearly yield."
      ],
      correct: 1,
      explanation: "Yield has to come from somewhere. If the source is unclear, assume risk is being hidden or transferred."
    },
    {
      category: "Security",
      prompt: "A token says its liquidity is locked. What does that prove?",
      options: [
        "The token cannot be rugged.",
        "Only that one rug path may be harder; contract controls, emissions, insiders, and demand still matter.",
        "The code has been audited.",
        "The token has real utility."
      ],
      correct: 1,
      explanation: "Locked liquidity is one signal, not a safety guarantee. Many other failure modes remain."
    },
    {
      category: "Claims",
      prompt: "A project claims it is infinitely scalable, fully decentralized, quantum-proof, AI-powered, and institution-ready. What is the main problem?",
      options: [
        "It uses too many bearish words.",
        "It makes broad claims without mechanisms or tradeoffs.",
        "It forgot to mention its ticker.",
        "It should use a higher APY."
      ],
      correct: 1,
      explanation: "Serious crypto claims should name the mechanism, limits, threat model, and tradeoffs."
    },
    {
      category: "Kaspa",
      prompt: "Kaspa's blockDAG design primarily changes what compared with a simple linear chain?",
      options: [
        "It removes Proof of Work.",
        "It lets honest blocks found in parallel be included and ordered instead of treated as ordinary wasted side branches.",
        "It makes transaction fees unnecessary forever.",
        "It turns Kaspa into a Proof-of-Stake network."
      ],
      correct: 1,
      explanation: "Kaspa keeps Proof of Work and uses a blockDAG plus GHOSTDAG ordering to include parallel blocks."
    },
    {
      category: "Kaspa",
      prompt: "What does Kaspa's 10 BPS era mean?",
      options: [
        "Roughly ten blocks per second, not unlimited throughput or instant finality.",
        "Ten guaranteed final transactions per second.",
        "Ten validators decide each block.",
        "DAGKnight is live."
      ],
      correct: 0,
      explanation: "Block rate is not the same as finality, capacity without limits, or activation of future consensus work."
    },
    {
      category: "Roadmap",
      prompt: "A roadmap feature is on testnet or in active development. How should you describe it publicly?",
      options: [
        "Live, because development is active.",
        "Guaranteed, because the community expects it.",
        "Status-labeled: targeted, roadmap, or research until primary sources confirm mainnet activation.",
        "Official, if enough influencers repeat it."
      ],
      correct: 2,
      explanation: "Status discipline is the difference between education and hype."
    },
    {
      category: "Infrastructure",
      prompt: "An L2 says it is decentralized, but one sequencer orders transactions and admin keys can upgrade contracts. What should you conclude?",
      options: [
        "It is automatically decentralized because it uses a blockchain.",
        "It may still be useful, but the trust assumptions need to be named.",
        "Admin keys are impossible on blockchains.",
        "Sequencers only matter for Proof of Work."
      ],
      correct: 1,
      explanation: "Useful systems can still have trust assumptions. The honest move is to name them."
    },
    {
      category: "Custody",
      prompt: "What does a hardware wallet protect you from?",
      options: [
        "All scams and every bad transaction.",
        "Private-key exposure on your computer, but not every malicious approval or misleading signature.",
        "Market losses.",
        "Bridge failures."
      ],
      correct: 1,
      explanation: "Hardware wallets reduce key-extraction risk. They do not make every signed action safe."
    },
    {
      category: "DeFi",
      prompt: "You provide liquidity to an AMM pair and one asset strongly outperforms the other. What risk should you understand?",
      options: [
        "Impermanent loss or opportunity cost versus simply holding the assets.",
        "Proof of Work failure.",
        "FDV compression only.",
        "That AMMs cannot charge fees."
      ],
      correct: 0,
      explanation: "Liquidity providers are exposed to price divergence. Fees may or may not compensate."
    },
    {
      category: "Claims",
      prompt: "A DAO vote exists. What does that prove about decentralization?",
      options: [
        "The system is decentralized by definition.",
        "Only that a voting mechanism exists; token distribution, admin powers, turnout, delegation, and execution control still matter.",
        "The project has no insiders.",
        "The token cannot be a security."
      ],
      correct: 1,
      explanation: "Governance theater is common. Real decentralization depends on who can actually decide and execute changes."
    },
    {
      category: "Basics",
      prompt: "When is crypto most useful?",
      options: [
        "Whenever a normal database exists.",
        "When credible shared state matters among parties that do not fully trust one another.",
        "Whenever a token can be launched.",
        "Only when price goes up."
      ],
      correct: 1,
      explanation: "The durable use case is credible shared state: ownership, settlement, programmability, and coordination without one trusted operator."
    },
    {
      category: "Risk",
      prompt: "A bridge offers unusually high incentives to attract deposits. What should you ask first?",
      options: [
        "Whether the incentive is high enough to ignore security.",
        "What assets are custodied, what verifies withdrawals, who can upgrade contracts, and what happens if the bridge breaks.",
        "Whether the Discord is active.",
        "Whether the token has a meme."
      ],
      correct: 1,
      explanation: "Bridge risk often combines smart-contract, validator, custody, upgrade, and liquidity risk."
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
        <span>${option}</span>
      </label>
    `).join("");

    return `
      <fieldset class="quiz-question">
        <legend><span>${String(index + 1).padStart(2, "0")}</span>${question.prompt}</legend>
        <div class="quiz-options">${answers}</div>
      </fieldset>
    `;
  }).join("");

  const getResultTitle = (score, confidenceGap) => {
    if (score >= 88) return "Actually Competent Operator";
    if (score >= 72 && confidenceGap <= 0) return "Quiet Builder";
    if (score >= 72) return "Mostly Calibrated";
    if (score >= 55 && confidenceGap >= 2) return "Whitepaper Skimmer";
    if (score >= 55) return "Halfway Dangerous";
    if (confidenceGap >= 2) return "Crypto Twitter Expert";
    return "Honest Beginner";
  };

  const getDiagnosis = (score, gap, weakest) => {
    if (score >= 88) return "You understand mechanisms, not just vocabulary. Keep checking primary sources and threat models before making strong claims.";
    if (score >= 72) return "You have a workable model, but a few blind spots could still cost money or lead to bad claims.";
    if (score >= 55 && gap >= 2) return `You know the language, but your confidence is ahead of your model. Your weakest area was ${weakest}.`;
    if (score >= 55) return `You are not lost, but you are not ready to trust your instincts alone. Your weakest area was ${weakest}.`;
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
    const knowledgeBand = score >= 85 ? 4 : score >= 70 ? 3 : score >= 50 ? 2 : 1;
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
