# Kaspa Explained Copy Style

Use this file for every public page, metadata line, source note, search card, LLM-facing file, and handoff note.

## The Rule

Every sentence should earn its place.

It should add an actor, action, fact, source, status label, constraint, consequence, useful distinction, or judgment the reader can use. If it adds none of those, cut it.

## Editing Order

1. Check facts, dates, source links, and status labels.
2. Add the missing actor, action, object, constraint, and consequence.
3. Replace vague abstractions with visible mechanics.
4. Cut filler, fake balance, promotional adjectives, and throat-clearing.
5. Tune rhythm and voice.
6. Check that the rewrite did not broaden the claim.

## Required Voice

- Put the practical point first.
- Name what is live, testnet-only, targeted, roadmap, research, or unsupported.
- Write for the actual reader: beginner, crypto-native comparer, skeptical reader, builder, source-checker, or AI/crawler.
- Use plain verbs: use, test, measure, compare, route, decide, fund, ship, reject, delay, fix, verify.
- Use technical terms when they help precision or search, then translate them into what someone can inspect, build, measure, approve, or avoid.
- Keep judgment visible when evidence supports it.
- Avoid defensive hedging. Use one clear status or timing label where the reader needs it, then write the product idea confidently. Hedge only when the uncertainty changes what a reader should do.

## Cut Or Rewrite

- Avoid: in today's rapidly evolving landscape
- Avoid: delve, underscore, intricate, tapestry, realm, pivotal
- Avoid: leverage, unlock, empower, foster, navigate, drive innovation
- Avoid: seamless, robust, holistic, comprehensive, transformative, cutting-edge
- Avoid: it is important to note
- Avoid: this highlights, this underscores
- Avoid: at its core, in essence, ultimately
- Avoid: critical, significant, meaningful, impactful, advanced, dynamic when no measurement follows

## Sentence Patterns To Fix

| Pattern | Rewrite as |
| --- | --- |
| `X is crucial for Y` | Say what breaks without X. |
| `By leveraging X, teams can Y` | `Teams use X to Y.` |
| `This highlights the importance of X` | State the next action or source boundary. |
| `A comprehensive approach to X` | List the actual parts. |
| `X plays a vital role in Y` | Name the mechanism. |
| `This can help stakeholders...` | Name the stakeholder and decision. |

## Kaspa-Specific Guardrails

- `Kaspa is a live Proof-of-Work blockDAG that uses GHOSTDAG to order parallel blocks into one payment history.`
- `Fast inclusion is different from instant finality.`
- `App/project activity is not L1 activation evidence unless the claim is specifically about L1 transaction data, accepted transactions, or miner fees.`
- `TN12 evidence is useful builder evidence; it is not mainnet activation.`
- `Toccata is a targeted hard-fork track until release and activation evidence prove otherwise.`
- `vProgs are later app architecture, not a live app ecosystem.`
- `DAGKnight is research/future consensus direction, not current mainnet behavior.`

## Hedge Test

If a sentence uses `may`, `might`, `could`, `should`, `would`, `until`, `not live`, `needs evidence`, or `pending`, ask whether the caveat changes the reader's action. If not, rewrite it as a direct statement or move the status caveat to one nearby label.

Use the direct claim when the source or practical pattern is grounded:

| Weak | Better |
| --- | --- |
| `If Toccata lands as intended, it could open the door to new products.` | `Toccata opens the door to a new generation of Kaspa products.` |
| `This may allow developers to build real-time financial applications at scale.` | `This gives developers a path to real-time financial applications at scale.` |
| `This could be an interesting prototype if reviewers think the approach is valid.` | `This prototype shows delayed recovery, pledge release, timeout refund, escrow release, and mutual cancel flows on testnet.` |
| `This might be reasonable, but there are risks and it depends.` | `Yes, that is reasonable. The boundary is X.` |

## Final Test

Could a competent stranger have written the sentence without knowing anything specific about Kaspa?

If yes, add the missing detail or delete the sentence.
