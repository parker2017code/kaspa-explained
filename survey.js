(function () {
  const roots = Array.from(document.querySelectorAll("[data-fit-survey]"));
  if (!roots.length) return;
  const reviewEmail = "parker2017@gmail.com";

  function fieldLabel(input) {
    const label = input.closest("label");
    if (!label) return input.name || "Field";
    const span = label.querySelector("span");
    return (span ? span.textContent : label.textContent).replace(/\s+/g, " ").trim();
  }

  function valuesFor(form) {
    const grouped = new Map();
    const controls = Array.from(form.querySelectorAll("input, textarea"));
    controls.forEach((control) => {
      const name = control.name || fieldLabel(control);
      if (!name) return;
      if ((control.type === "checkbox" || control.type === "radio") && !control.checked) return;
      const value = control.type === "checkbox" || control.type === "radio" ? control.value : control.value.trim();
      if (!value) return;
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name).push(value);
    });
    return grouped;
  }

  function scoreFor(form) {
    return Array.from(form.querySelectorAll("input:checked"))
      .reduce((total, input) => total + Number(input.dataset.score || 0), 0);
  }

  function textBonus(grouped) {
    let bonus = 0;
    ["Problem", "User", "Help needed", "Profile", "Intro rule"].forEach((name) => {
      const text = (grouped.get(name) || []).join(" ");
      if (text.length >= 80) bonus += 4;
      else if (text.length >= 35) bonus += 2;
    });
    if ((grouped.get("Evidence link") || [""])[0].startsWith("http")) bonus += 4;
    return Math.min(bonus, 16);
  }

  function verdict(score) {
    if (score >= 78) return "High routing readiness. Verify claims and consent next.";
    if (score >= 56) return "Useful submission. Add evidence, risk, or next action.";
    if (score >= 34) return "Early idea. Clarify user, Kaspa reason, and proof path.";
    return "Needs sharper user, job, evidence, and status labels.";
  }

  function buildSummary(root, grouped, score, maxScore) {
    const type = root.dataset.surveyType === "supporter" ? "Kaspa supporter survey" : "Kaspa builder fit survey";
    const lines = [
      type,
      `Score: ${Math.min(score, maxScore)}/${maxScore}`,
      `Verdict: ${verdict(Math.min(score, maxScore))}`,
      "",
      "Fields:"
    ];
    grouped.forEach((values, name) => {
      lines.push(`- ${name}: ${values.join(", ")}`);
    });
    lines.push("", "Review route: send by email for private approval before any public card or intro.");
    lines.push("Consent check before sharing: confirm public-card permission and contact rule.");
    lines.push("Status check before posting: use https://kaspaexplained.com/status and https://kaspaexplained.com/toccata-status.");
    return lines.join("\n");
  }

  roots.forEach((root) => {
    const form = root.querySelector("form");
    const scoreEl = root.querySelector("[data-survey-score]");
    const verdictEl = root.querySelector("[data-survey-verdict]");
    const summaryEl = root.querySelector("[data-survey-summary]");
    const copyButton = root.querySelector("[data-survey-copy]");
    const mailLink = root.querySelector("[data-survey-mail]");
    const statusEl = root.querySelector("[data-survey-status]");
    const maxScore = Number(root.dataset.scoreMax || 100);

    function render() {
      const grouped = valuesFor(form);
      const score = Math.min(scoreFor(form) + textBonus(grouped), maxScore);
      const summary = buildSummary(root, grouped, score, maxScore);
      scoreEl.textContent = `${score}/${maxScore}`;
      verdictEl.textContent = verdict(score);
      summaryEl.value = summary;
      if (mailLink) {
        const subject = root.dataset.surveyType === "supporter" ? "Kaspa supporter survey" : "Kaspa builder fit submission";
        mailLink.href = `mailto:${reviewEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
      }
    }

    form.addEventListener("input", render);
    form.addEventListener("change", render);
    copyButton?.addEventListener("click", async () => {
      render();
      try {
        await navigator.clipboard.writeText(summaryEl.value);
        statusEl.textContent = "Survey summary copied.";
      } catch (error) {
        summaryEl.focus();
        summaryEl.select();
        statusEl.textContent = "Summary selected. Copy it if clipboard access is blocked.";
      }
    });
    render();
  });
})();
