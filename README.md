# Plan Model

A one-page, interactive retirement dashboard — built to feel calm about, not to study.

**Estimates only — not financial, tax, or investment advice.** All figures are illustrative projections based on user-entered inputs and historical asset-class return assumptions. They are not guarantees, recommendations, or personalized advice. Consult a licensed financial advisor before making investment decisions.

## What it shows

- **The verdict** — a plain-language read on whether the person is on track, based on the 4% rule as a reference point, with a live withdrawal-rate calculation.
- **Age / phase bar** — where someone sits across Build → Sharpen → Transition → Live, based on years to retirement.
- **Growth-rate slider** — cautious to aggressive, seeded by a risk-tolerance toggle (Conservative / Neutral / Aggressive) but manually overridable. Dragging it reshapes the underlying asset allocation to stay internally consistent, and the risk toggle auto-snaps to reflect wherever the current allocation actually lands.
- **Spending-in-retirement slider** — defaults to the 4%-rule number as a reference, fully adjustable, with the live withdrawal rate shown alongside it.
- **Projection chart** — a hover-interactive growth curve from today's age to 90. Hovering (or touch-dragging on mobile) shows the exact projected portfolio balance for any age along the way. Includes an optional "rough start in retirement" stress test.
- **Target mix** — today's allocation broken into Growth / Stable / Cash buckets, each shown with its percentage and dollar amount. The Growth bucket further breaks down into US stocks, international stocks, gold, and bitcoin, each with its own % and $.
- **How to run it** — a short list of maintenance principles (rebalancing cadence, when to trim, buffer sizing) and the core investing philosophy behind the model.

## How the numbers work

- Every control — risk toggle, growth-rate slider, spending slider, retirement-age slider, annual savings — feeds one shared calculation. Moving any one of them recalculates the verdict, projection, age bar, and bucket breakdown together, live.
- Return assumptions per asset class are defined once in `ASSET_RETURN` and blended according to the current allocation. These are planning assumptions, not predictions — actual future returns, especially for volatile assets like bitcoin, may differ substantially and are inherently uncertain.
- The 4% rule is used only as a starting reference point for retirement spending, not as a guarantee of portfolio longevity.

## Data & persistence

- All inputs are stored in the browser's `localStorage` so the person doesn't have to re-enter their information on repeat visits.
- No data is sent to a server — everything runs client-side.
- Number inputs accept comma formatting (e.g. `100,000`) for easier entry.
- A Reset control clears stored data and returns to the initial questionnaire.

## Disclaimer

This tool is illustrative and educational. It reflects one specific investing philosophy (diversification across US and international equities, gold, and bitcoin, with a bond/cash buffer) — not a universal recommendation. Nothing in this tool constitutes financial, tax, legal, or investment advice. Past performance and historical averages do not guarantee future results.