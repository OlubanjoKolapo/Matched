# Contributing to Matched

Thanks for helping. The most useful contributions are **style rules**, **lessons** and **womenswear coverage**, which is marked early. Bug fixes and accessibility improvements are always welcome too.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # run before every PR
npm run typecheck && npm run lint
```

Use **Try a sample wardrobe** during onboarding to get 14 tagged pieces without taking any photos.

## Where things live

| Folder | What's in it |
| --- | --- |
| `rules/` | Style knowledge as data and rules: colors, garment volumes, tuning, per-track rules, Gap Finder candidates |
| `lib/rules/` | The engine that runs the rules: context, scoring, outfit generation |
| `content/lessons/` | Lesson JSON, tagged by track, height band and goal |
| `lib/avatar/`, `components/avatar/` | The parametric mannequin and its garments |
| `components/ui/` | Small, token-only primitives. Start here before writing new UI. |
| `styles/tokens.css` | Every design value. Components must not contain raw colors or sizes. |

## Adding a style rule

See [Add a style rule](README.md#add-a-style-rule) in the README for a worked example. The checklist:

- [ ] The id is `<area>.<name>` and unique.
- [ ] The sentence is in the Matched voice: one sentence, friendly, specific to the pieces, never about bodies being wrong.
- [ ] Thresholds go in `rules/tuning.ts`, `rules/colors.ts` or `rules/garments.ts`, not inline.
- [ ] There's a test case in `lib/rules/rules.test.ts` that fires and one that misses.
- [ ] `lib/rules/outfits.test.ts` still passes, or the PR explains why an expected verdict changed.
- [ ] If it's track-specific, it's in `menswear.ts` or `womenswear.ts`.

## Adding a lesson

Each lesson is one rule taught once:

```json
{
  "id": "shoes-match-trousers",
  "title": "Match your shoes to your trousers",
  "rule": "Same color from hem to sole makes the leg look longer.",
  "body": "Two or three sentences of why and how.",
  "kind": "color",
  "tracks": [],
  "bands": ["shorter"],
  "goals": ["taller"],
  "ruleIds": ["color.leg-line"],
  "look": [
    { "category": "top", "subtype": "t-shirt", "fit": "regular", "color": "white", "formality": 2 },
    { "category": "bottom", "subtype": "jeans", "fit": "straight", "color": "black", "material": "denim", "formality": 2 },
    { "category": "shoes", "subtype": "chelsea boot", "shoeProfile": "boot", "color": "black", "formality": 4 }
  ]
}
```

Empty `tracks`, `bands` or `goals` means everyone. `color` must be a family from `rules/colors.ts`. The tests reject a lesson unless its look:

- matches the schema,
- can be drawn on the mannequin,
- scores 62 or more for the audience it's written for, and
- fires at least one of its `ruleIds`.

## Design and UI

- Mobile first. Check every change at 390px wide, and make sure nothing scrolls sideways. A transient overflow makes phones zoom out.
- Use tokens and `components/ui` primitives. If you need a new value, add a token.
- Use Motion springs from `lib/motion.ts`. Anything that moves must respect reduced motion; Motion handles transforms automatically, and anything else needs a check.
- Accessibility: real buttons and links, visible focus, labels on icon buttons, and color never used alone to carry meaning.

## Pull requests

- Keep PRs focused. One rule, one lesson set or one fix is ideal.
- Describe the change in plain language. For rule changes, include a before-and-after outfit and score.
- By contributing you agree your work is licensed under AGPL-3.0.
