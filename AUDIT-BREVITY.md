# Brevity audit

Read against the Apple/Tesla/Meta standard: every sentence justifies its place, or it goes. Ordered heaviest cut first. `model-picker.html`, `chain-comparer.html`, `the-instrument.html` excluded per instructions. The `kips.html` DAGKnight demo (fixed vs. adjustable margin) excluded, it's being rebuilt.

Where the weight actually is, across all ten pages: **the same fact stated more than once in different words, in different sections of the same page.** Not padding inside a sentence, padding across sentences. Every page below shows this pattern at least once, and it is the dominant recoverable cut on eight of the ten pages. A distant second: a handful of self-referential sentences that describe what the page/site is doing instead of just doing it ("this page reads live," "this site does not dress that up..."), and two or three genuine hedge-stacks where a caveat gets re-qualified twice more after it has already landed.

The prior pass's failure mode (141/143 KEEP, changed nothing) came from scoring sentences in isolation. Scored that way, almost every sentence here also passes: each one is well-formed, sourced, non-hedgy. The fat only shows up at the page level, when the same claim registers twice on a read-through. That is the level this pass worked at.

---

## 1. kaspa-mining.html (664 words open-on-arrival; largest file on the site, 207 KB)

Heaviest page by volume, but nearly all of it is load-bearing: formulas, exact figures, source citations, working demo state. Cutting numbers or sourced claims here is out of scope. The one real, repeated pattern is the "two clocks" thesis, stated as new information four separate times:

1. Lede: "Price can fall while hash rate climbs. A coin market reprices in minutes; a machine market (ASIC orders, shipping, hosting, wiring) answers weeks or months later."
2. Section intro: "A proof-of-work coin runs two markets on two clocks: one reprices in minutes, the other answers months later."
3. Visual-shelf figcaption: "Two markets, two clocks. The coin price moves in minutes. ASIC orders, freight, hosting, and difficulty catch up weeks to months later."
4. Visual-shelf figcaption: "Price and hash rate. The two lines diverge because hardware answers the coin market late. Neither line is wrong."

By the second instance the reader already has the thesis. The two figcaptions exist to label different charts, not to re-teach the concept; right now they do both.

**Cut:** keep instance 1 (lede) and instance 2 (section intro, since it functions as the section's actual claim). Replace the two figcaptions so each names only what its own chart shows, not the shared thesis:

- "Two markets, two clocks. The coin price moves in minutes. ASIC orders, freight, hosting, and difficulty catch up weeks to months later." → **"Coin demand moves first; hardware, hash rate, and difficulty follow on their own delay."**
- "Price and hash rate. The two lines diverge because hardware answers the coin market late. Neither line is wrong." → **"Divergence here is the lag working as expected, not a contradiction."**

Same pattern shows up once more, smaller: "Miner selling is a line item, the same as the power bill." directly follows a full paragraph that already made this exact point ("Thin margins turn a believer into a seller regardless of conviction"). Cut the kicker; the paragraph already earned it, the kicker adds nothing after it.

---

## 2. kaspa-origin-story.html (827 words open-on-arrival)

Two facts each get restated three to four times across the page, in different phrasing, as if arriving fresh each time.

**"Zero premine," stated four times:**
1. Intro: "...a fair-launched Proof-of-Work network with no premine, insider allocation, or pre-sales."
2. Chart caption: "Kaspa: 0%. No founder, company, or foundation has ever held a share."
3. Section caption: "Kaspa never had one: an empty genesis UTXO set, 0% held by founders, company, or foundation, ever."
4. Body: "Mainnet followed the April 2021 testnet within the year: a fair-launched Proof-of-Work network with no premine, insider allocation, or pre-sales."

Instances 1 and 4 are near-verbatim duplicates of each other (same sentence, two different sections). Cut instance 4 outright, the reader already has it from the intro. In the chart region, instances 2 and 3 are consecutive UI captions for the same visualization; collapse to one:

- "Kaspa: 0%. No founder, company, or foundation has ever held a share." + "Kaspa never had one: an empty genesis UTXO set, 0% held by founders, company, or foundation, ever." → **"Kaspa: 0%, an empty genesis UTXO set with no founder, company, or foundation share, ever."**

**The 2.5–3% early-miner figure, stated three times** (chart tracking note, "what a premine buys" caption, and the "early-miner share estimate" detail box), each time with the same number reworded. Keep the fullest sourced version (the detail box, which cites Yonatan's estimate against the Wiki's) and cut the other two down to a bare pointer: "DAGLabs' own early mining, below."

**Intro paragraph restates its own point mid-paragraph:**

> "Every earlier structure would have made Kaspa answer to something outside the protocol; the fair launch took that outside claim off the table before mainnet existed. It proved nothing about later adoption, price, or whether the tech would work; it only took the premine, the pre-sale, and the insider table off the starting line."

"took that outside claim off the table" and "took the premine, the pre-sale, and the insider table off the starting line" are the same claim twice. Cut to:

**"Every earlier structure would have made Kaspa answer to something outside the protocol. Fair launch took the premine, the pre-sale, and the insider table off the starting line before mainnet existed, and it proved nothing about later adoption, price, or whether the tech would work."**

---

## 3. why-kaspa-matters.html (692 words open-on-arrival)

**Throat-clearing before a definition:** "Every Nakamoto-style system carries Bitcoin's latency tradeoff by design. The goal Kaspa chases instead has a name. RTD, Real-Time Decentralization, is Hashdag's term for..."

"The goal Kaspa chases instead has a name." does no work; it just announces that a definition is coming. Cut it. The paragraph loses nothing: "Every Nakamoto-style system carries Bitcoin's latency tradeoff by design. RTD, Real-Time Decentralization, is Hashdag's term for a partially synchronous system that moves as fast as the network really allows..."

**Hedge-stack, three sentences doing the work of one:**

> "It likely understates Kaspa's real security, since a naive fast chain would waste a lot of honest work to collisions that GHOSTDAG does not waste. It may also understate how GHOSTDAG's bounded tolerance for parallel blocks affects very recent ordering. Net effect not established with confidence either way."

Three separate hedges on the same uncertainty, the third one somewhat undercutting the first two rather than adding to them. Compress to one sentence that keeps every real claim:

**"It likely understates Kaspa's real security, since a naive fast chain wastes honest work to collisions GHOSTDAG does not, though bounded tolerance for recent ordering may cut the other way, and the net effect isn't established."**

**Rhetorical-question setup, then a self-referential kicker that restates the sentence before it:**

> "Is 12 hours arbitrary? It is a chosen constant, not one derived from a security proof the way GHOSTDAG's own k parameter is. [...] It is a judgment call about how much margin is enough, held fixed in wall-clock time even as Kaspa's blocks per second have changed, and picked to sit well past the point where the curve above has already fallen close to zero for any attacker share worth trying. This site does not dress that up as derived math: it is a number someone chose."

Drop the question framing on the first sentence; state the fact. Drop the final sentence entirely, "a number someone chose" restates "a chosen constant" from four sentences earlier, and "this site does not dress that up" is the kind of self-referential hedge the site's own voice rules ban.

- "Is 12 hours arbitrary? It is a chosen constant..." → **"12 hours is a chosen constant, not one derived from a security proof the way GHOSTDAG's own k parameter is."**
- Cut: "This site does not dress that up as derived math: it is a number someone chose."

---

## 4. status.html (517 words open-on-arrival)

Mostly a status table; each row is one fact and there's little fat in the table itself. But the vProgs/ICC distinction is written out in full, twice, in near-identical language:

**Top of page:** "...Argent's Inter-Covenant Communication already composes separately compiled covenant apps atomically on Toccata, in unaudited offline demos only. What vProgs still add is shared mutable state, the case where many users change one app's state at once."

**Misconceptions table, several sections down:** "Argent's Inter-Covenant Communication composes separately compiled covenant apps atomically in one transaction, so far only in unaudited offline demos. vProgs still differs on shared mutable state, the case where many users change one app state at once."

Same claim, same clause order, reworded just enough to not be an exact string match. Keep the fuller top-of-page version (it's the reader's first exposure). In the misconceptions row, replace the restated paragraph with a pointer:

**"Composing atomically works today; see the note above for what vProgs would still add."**

---

## 5. argent-explained.html (657 words open-on-arrival)

**ICC gets defined twice**, once in the intro section and again verbatim-in-substance inside the collapsed "Language model" deep dive:

- Intro: "Argent's Inter-Covenant Communication lets an actor from one compiled app observe or authorize an actor from another inside a single transaction, so separately built apps still succeed or fail together."
- Deep dive: "Inter-Covenant Communication extends the same model across independently compiled applications, so an actor from one app can observe or authorize an actor from another inside a single atomic transaction."

The deep dive's version adds nothing the intro didn't already say. Cut the sentence and let the section head straight into what's actually new information:

**Cut:** "Inter-Covenant Communication extends the same model across independently compiled applications, so an actor from one app can observe or authorize an actor from another inside a single atomic transaction."
**Keep, unchanged, as the section's opening line:** "That is the piece that makes something like a mint controller possible: one app owns the asset rule, another owns the policy that decides when supply moves, and neither has to be recompiled into the other."

Two smaller defensive-register trims (the site's own "not a strawman" tell):

- "That's what makes something like Ethereum's account based virtual machine a good home for composable, broad logic. This is a real advantage of the account model, not a strawman." → cut ", not a strawman". The claim stands without pre-emptively defending against an objection nobody raised.

---

## 6. kips.html (1073 words open-on-arrival)

Excluding the DAGKnight demo (being rebuilt). Everything here is heavily sourced and quote-dense, correctly protected from cuts to numbers, dates, or quotations. The one real pattern: **"not yet adopted" gets said three times about the same three KCCs**, each time with the emphasis shifted slightly:

1. Eyebrow line: "Builder agreements on encoding, not protocol changes: three merged, all still marked draft."
2. Body: "A merged file in this repo is a checked-in draft, not an adopted standard: the README's own bar for acceptance is a Comments-URI discussion window and consensus among implementers, and none of the three has cleared that."
3. Body, two paragraphs later: "The four-digit repository numbering is canonical; forum shorthand like 'KCC20' is not the identifier in the repository, and nothing has been ratified."

Instance 3's trailing clause is the redundant one, it doesn't connect to the sentence's own subject (numbering format) and exists only to say "not ratified" a third time. Cut it:

**"The four-digit repository numbering is canonical; forum shorthand like 'KCC20' is not the identifier in the repository."**

One filler CTA sentence: "Eleven further KIPs sit open as pull requests. Read the repository for full text." The second sentence tells the reader nothing they couldn't infer; cut it.

---

## 7. start-here.html (585 words open-on-arrival)

Already close to the floor; four short sections, no restated facts found. One sentence is scaffold rather than content:

> "DAGKnight, vProgs, and native DeFi are still research or roadmap. How Kaspa compares and the status page carry the sourcing."

"carry the sourcing" describes what the linked pages do rather than doing anything itself, a small instance of the site talking about itself instead of the reader. Cut to a plain pointer:

**"DAGKnight, vProgs, and native DeFi are still research or roadmap. See how Kaspa compares, and the status page."**

That is the only defensible cut on this page. Everything else here is one clause per fact, no restatement, no throat-clearing. Flagged per the brief's instruction to argue explicitly when a page is already near the floor.

---

## 8. crypto-from-scratch.html (898 words open-on-arrival)

Almost entirely table cells, already single-clause and terse; there is very little sentence-level fat to find. One redundant pointer:

> "Kaspa's fair launch wasn't the plan from day one; it's what was left after DAGLabs, an April 2021 testnet, and several hardware, presale, and business-model paths that fell through. The origin page has the sourced version."

This restates a fact that has its own dedicated page (kaspa-origin-story.html) at a length this page doesn't need. Trim to:

**"Kaspa's fair launch is what was left after DAGLabs and several hardware, presale, and business-model paths fell through; the origin page has the sourced version."**

No other sentence-level cut found. This page is a strong counterexample to the idea that every page hides a large cut: it was clearly already compressed hard, and further cutting would start removing distinct facts (see the tradeoff table, the six-good/six-bad tables, the token-role table), not restatement.

---

## 9. utxo-vs-accounts.html (296-word floor page, protected)

This page is explicitly protected from a length cut without saying what breaks. It shouldn't be cut for length: the demo prose is dense, technical, and each sentence carries a distinct fact about consensus mechanics (why UTXO parallelizes, the honest cost to composability, exactly what Toccata and ICC do and don't reach). Cutting any paragraph here removes a specific claim, not filler.

What is real, and worth fixing, is defensive register, not length:

- "That's what makes something like Ethereum's account based virtual machine a good home for composable, broad logic. This is a real advantage of the account model, not a strawman." → cut ", not a strawman."
- "Writing a broad, composable smart contract platform directly on top of that is really harder, and Kaspa doesn't pretend otherwise." → cut ", and Kaspa doesn't pretend otherwise."

Both are the site pre-emptively defending against an objection nobody in the actual paragraph raised, the "defensive register is the tell" pattern. Removing them costs nothing and the claims stand on their own. This is the right kind of edit for this page: word-level, not sentence-level, and it does not touch the 296-word floor.

---

## 10. sources.html (697 words open-on-arrival)

This is a reference/link directory: a sourcing-hierarchy table, a giant flat list of implementation links, and a Kaspa.com article index. There is almost no narrative prose to cut, it's mostly link text and one-line table cells that are already at minimum length. The handful of actual sentences ("A branch is not an activation," "Kaspa.com Learn Kaspa: vocabulary and mechanics, not protocol status") are already single-clause kickers doing real disambiguating work, not restatement.

**No cut proposed for this page.** Its bulk is link inventory, which the audit's scope (prose, sentences, restatement) doesn't reach; cutting entries from the link list is a sourcing-completeness question, not a brevity one.

---

## Summary: where the weight actually is

The heaviest recoverable cut on the site is not inside any single sentence, it's the **same claim restated in a second location** once a reader has already been told it: the "two clocks" thesis on kaspa-mining.html (4x), "zero premine" on kaspa-origin-story.html (4x), the ICC/vProgs distinction on status.html (2x, near-verbatim) and argent-explained.html (2x), and the "still draft, not ratified" status on kips.html (3x). Fix those five and the site's heaviest real fat is gone. The remaining nine pages beyond those five have comparatively little left to cut: start-here.html, crypto-from-scratch.html, and sources.html were each already compressed to close to a floor, and utxo-vs-accounts.html is explicitly protected and correctly dense. The recoverable defensive-register trims ("not a strawman," "Kaspa doesn't pretend otherwise," "this site does not dress that up") are small in word count but worth doing regardless: they're the exact tell the site's own voice rules already ban, they were just missed on this surface.
