# Matched — Build Brief

Oct 16, 2026 · Kolapo Olubanjo

This is the product and build brief Matched is implemented against. Build in the phases at the bottom; after each phase, commit, summarise, and stop for review.

## Assumptions

- Launch with menswear rules fully built. Womenswear is in the data model and onboarding from day one, marked "early", with a starter rule set and an open call for contributors.
- Web app first (installable PWA), no accounts, everything stored on the device.
- The maintainer's API key powers the hosted demo; the open-source version uses each user's own key.
- UI is polished in Dessn after each phase, so code must stay clean, token-based and component-driven.

## Product overview

Matched turns the clothes you already own into outfits that work, and tells you why they work. Pinterest shows you other people's outfits; Matched teaches the rules behind them using your own wardrobe.

The core promise: photograph your clothes once, and Matched shows what pairs with what, explained in one plain sentence. Example: "Wide-leg jeans need a chunky sneaker. A slim shoe gets swallowed by the extra fabric."

Who it's for: people who want to dress better without studying fashion. The first audience is young men who already scroll Pinterest for outfit ideas. Womenswear follows quickly and is a major growth audience.

What makes it different:

- **It explains.** Every match comes with a reason grounded in proportion, shoe weight, color or formality.
- **It uses what you own.** No shopping feed, no affiliate links.
- **It's personal.** Height and style goals change the advice (for example, tips for looking taller).
- **It's private.** No account, nothing leaves the device except a photo sent for tagging.
- **It's beautiful.** Editorial, fashion-magazine design, an animated avatar that wears your outfits, and interactions that feel like a premium app.

Name and voice: **Matched**. Tagline: "Your clothes, matched." The voice is a confident, friendly stylist friend: short sentences, no jargon, never judgemental about bodies.

## Scope for v1

v1 ships in about five working days. Depth beats breadth: every screen in scope should feel finished.

In scope:

- Onboarding: style track, optional height, style goals, avatar builder, sample wardrobe option.
- Wardrobe: add items by photo, in-browser background removal, AI tagging with editable chips, grid view.
- Rules engine with explanations, fully covering menswear; a starter womenswear set.
- Match screen: pick a piece and see what goes with it, or generate full outfits from the wardrobe.
- Avatar view and flat-lay view of every outfit.
- Retention: personalised Style Lessons, Today's Fit, Gap Finder, shareable outfit cards.
- PWA install, offline support, light and dark themes.
- README with screenshots, setup steps and a contributing guide for style rules.

Not in v1 (do not build): accounts or cloud sync, social feed, shopping or affiliate links, weather integration, outfit calendar, photo-realistic virtual try-on, native mobile apps, payments.

## Design direction

The bar is world-class: it should look like a fashion magazine that came to life, not a generic AI app. Avoid default component-library looks, purple gradients, glassmorphism everywhere and emoji icons.

Visual language:

- Editorial layouts: large type, generous whitespace, asymmetric grids, items shown as clean cutouts on soft paper-toned backgrounds.
- Palette: warm off-white paper, deep ink black, one confident accent (tailor's chalk red or deep olive). Clothing colors are the real color in the app, so the UI stays quiet.
- Typography: a high-contrast display serif for headlines and numbers, a clean grotesk for UI text. Large numerals for match scores.
- Subtle grain or paper texture, fine hairline rules, small caps labels, like a lookbook.
- Dark mode is "evening edition": same layouts, ink background, cream type.

Motion and interaction (this is the signature):

- **The "Matched" moment:** when two pieces pair well, they snap together with a spring, a short haptic tap on mobile, and the score ring fills. This is the brand's core animation; make it feel physical and satisfying.
- **Shared-element transitions:** tapping an item card morphs it into the detail view; items fly from the wardrobe onto the avatar.
- **Drag and swipe:** drag a piece onto the avatar to try it; swipe through alternative shoes or bottoms in a carousel and watch the avatar update live.
- **Garment morphing:** switching fit (slim to baggy) smoothly morphs the garment shape on the avatar.
- **Micro-interactions:** chips that pop when selected, a shimmer while AI tags, a cutout "peel" reveal after background removal.
- Respect `prefers-reduced-motion` everywhere with calm fallbacks.

Built for Dessn editing: every color, radius, spacing step, shadow and font lives in design tokens (CSS variables plus a Tailwind theme). Components are small, named clearly and live in `components/ui`. No magic numbers in components, so visual changes made in Dessn stay clean.

## The avatar system

The avatar is a stylised, illustrated figure that wears the user's outfits. It shows proportion and color, the two things Matched teaches. It is not a photo-realistic try-on.

How it works:

- Built as layered, parametric SVG in a flat editorial illustration style (fashion sketch meets modern flat illustration), rendered as a React component.
- Body: base figure for menswear and womenswear silhouettes. Height adjusts leg-to-torso ratio and overall scale; build (slim, average, broad) adjusts shoulder and waist width.
- Customisation: skin tone (at least 10 inclusive tones), hairstyle (8 to 12 options per track), hair color. Keep it to one fast screen.
- Garment layers: tops, bottoms, outerwear, shoes, each drawn as shape variants by fit. Bottoms: skinny, slim, straight, relaxed, wide, baggy. Tops: fitted, regular, oversized, cropped. Shoes: low-profile, standard, chunky, boot. Womenswear adds dresses, skirts (mini, midi, maxi) and heels.
- Each garment's fill comes from the item's tagged color, with soft gradient shading and a subtle fabric texture (denim, knit, leather) so it doesn't look flat.
- Layer order: shoes, bottoms, top, outerwear, so tucked and untucked states read correctly.

Motion:

- Idle loop: gentle breathing and an occasional weight shift.
- Changing fit morphs the path between variants (flubber, or matching-point paths with Motion).
- New items drop on with a small bounce; color changes cross-fade.

Fallback: if a garment type has no avatar shape, show the flat-lay view for that outfit. Every outfit has an Avatar / Flat-lay toggle; flat-lay arranges the user's real cutout photos in a magazine-style composition.

## Onboarding flow

Onboarding takes under 60 seconds and ends with the user seeing a real match. Show a progress bar, make every step after step 2 skippable, and let the avatar react live to each answer.

1. **Welcome.** Full-bleed editorial screen: the avatar cycles through three outfits with the Matched snap animation. Headline: "Your clothes, matched." Button: Get started.
2. **"What do you shop for?"** Menswear / Womenswear / Both. Large tappable cards with the avatar silhouette. Womenswear shows a small "Early — rules growing" tag. Never ask for gender.
3. **Height (optional).** A vertical ruler slider; the avatar grows and shrinks as you drag. Toggle between ft/in and cm. Below it: "Used only to tailor proportion tips." Skip link.
4. **"What do you want your outfits to do?"** Multi-select: Look taller · Look broader · Look leaner · Look more put-together · Just make it match. Each selection previews a one-line tip.
5. **Build your avatar.** Skin tone, hair, build. One screen, live preview. Defaults are fine; a "Randomise" button helps.
6. **Start your wardrobe.** Two big choices: "Snap my clothes" (camera/upload) or "Try a sample wardrobe" (preloads about 12 curated items so the app is useful instantly and the demo works without uploads). Recommend starting with 3 items: a top, a bottom, shoes.
7. **First match.** As soon as there's one top, one bottom and one pair of shoes, play the Matched moment and show the first outfit with its reasons.

On the height step and the final screen, show the privacy line: "Everything stays on this device." Don't ask for weight. Profile answers can be edited anytime in Settings.

## App structure and core screens

Mobile-first, with a four-tab bottom bar: Today · Wardrobe · Match · Learn. A floating "+" adds an item from anywhere. On desktop, the tab bar becomes a left rail and screens use a two-column editorial layout.

### Today (home)

- Today's Fit: one outfit generated from the wardrobe, shown on the avatar with its score and reasons. "Shuffle" gives another; "Wear this" marks it worn so it rotates.
- Lesson of the day card, personalised to height and goals.
- Gap Finder card when relevant.

### Wardrobe

- **Rail view (default, the signature screen).** The wardrobe is a clothes rail: one thin metallic rod across the full width, with each item hanging from a simple wire hanger hook. Tops, hoodies and outerwear hang naturally; trousers and jeans are shown folded over a hanger; shoes sit on a low shelf beneath the rail. Clean white or paper-toned background, soft drop shadows under each garment, lots of whitespace, a small-caps section label above the rail (e.g. "YOUR WARDROBE | 24 PIECES").
- **Rail behaviour.** Drag or swipe to scroll the rail sideways with momentum; hangers swing slightly with spring physics as they move and settle. The centred item is focused: slightly larger, outlined, with its name below in medium weight (e.g. "Forest Green Hoodie") and a pill button ("Find matches"). Small hang-tags on hangers carry status labels like "Most versatile", "New" or "Not worn in 30 days".
- **The match search moment.** Tapping "Find matches" lifts the selected item off the rail. The rail spins quickly and slows down like a closet being searched. Items that match swing forward and stay bright with a "Matched" hang-tag; the rest dim and slide back. The best bottom and shoes snap beside the selected item with the Matched animation and their reasons. Results are computed instantly by the rules engine; the spin is theatre, capped at about 1.2 seconds and skippable with a tap.
- **Grid view.** A Rail / Grid toggle in the header. Masonry layout of cutouts on paper-toned tiles, filterable by category (Tops, Bottoms, Shoes, Outerwear, Accessories) and color. Filters work in both views.
- **Item detail.** Big cutout, editable tag chips (category, subtype, fit, color, formality), and a "Goes with" rail of ranked matches from the wardrobe, each with its reason.
- An item without a clean cutout gets a neutral silhouette frame on the rail rather than a raw photo.

### Add item

1. Camera or upload.
2. Background removal with a peel-reveal animation.
3. AI tagging with a shimmer; results appear as chips.
4. User confirms or edits chips (always editable; AI is a helper, not the source of truth).
5. Saved, with a small fly-to-wardrobe animation. Offer "Add another" for batch adding.

Without an API key, step 3 is skipped and the user taps chips manually. This must feel just as smooth.

### Match

- Outfit builder: slots for top, bottom, shoes, outerwear on the left; the avatar on the right (stacked on mobile). Swipe each slot to cycle through owned items; the score updates live.
- "Match it for me" fills empty slots with the best options.
- Reasons panel: 2 to 4 short reasons, each tagged Proportion, Shoes, Color or Formality, positive or warning.
- "I own..." quick mode: pick a few items ("4 black tees and brown jeans") and get every outfit that works, ranked.
- Save outfit, share card.

### Learn

- Style Lessons feed: short swipeable cards, each with an illustration and one rule, personalised to height, goals and track.
- Every lesson ends with "Try it with your clothes", which opens Match pre-filled with owned items that demonstrate the rule.

### Settings

Profile (track, height, goals, avatar), API key field with a clear explanation, theme, export/import wardrobe as a file, clear all data.

## Retention hooks

All of this runs locally, with no backend.

1. **Personalised Style Lessons (the height hook).** Lessons are written content stored in `content/lessons/*.json`, tagged by track, height band and goal. Height bands are relative to the track's average: shorter, average, taller. Seed at least 30 lessons, for example:
   - Look taller (shorter band): tonal or monochrome outfits make one long vertical line · match shoes to trousers to extend the leg · high-rise bottoms with a tucked or half-tucked top raise the waistline · trousers with no break or a slight crop · shorter jackets that end at the hip · vertical details like a placket, open overshirt or long zip · avoid wide contrast belts and very long oversized tops that shorten the legs.
   - Taller band: you can carry volume, so wide-leg trousers and oversized outerwear work · break the line with contrast between top and bottom · longer coats sit in proportion · layering adds interest instead of bulk.
   - Look broader: structured shoulders, heavier knits and overshirts on top, slimmer bottoms to exaggerate the V shape.
   - Look leaner: darker tones, clean straight lines, one-color base with a single light layer.

   Show one lesson a day on Today, and the full feed in Learn. Each lesson links to Match with owned items that demonstrate it. Track lessons read with a simple local streak ("5 days of style").
2. **Today's Fit.** A fresh outfit every day from the wardrobe, avoiding recently worn items.
3. **Gap Finder.** Compute which single missing item would unlock the most new valid outfits: "A pair of white low-profile sneakers would unlock 9 new outfits." Phrase it as a suggestion, never as shopping pressure, and include no links.
4. **Share cards.** One tap exports an outfit as a 1080×1350 image (avatar or flat-lay, the reasons, the score, a small "Made with Matched" mark).
5. **Wardrobe stats.** A small "Your wardrobe" page: number of possible outfits, most versatile piece, color breakdown.

## The style rules engine

Matching is deterministic, explainable TypeScript, not an AI call. AI only tags photos. This keeps results instant, free, offline and testable.

Structure:

- `lib/rules/` holds pure functions; rule data lives in `rules/menswear.ts`, `rules/womenswear.ts` and `rules/shared.ts` so contributors can add rules without touching the engine.
- Each rule has an id, a category (Proportion, Shoes, Color, Formality), the conditions it checks, a score effect, and a plain-language reason with slots, e.g. "{bottom} has a lot of volume, so {shoe}'s chunky sole keeps it balanced."
- `scoreOutfit(items, profile)` returns a score from 0 to 100, a verdict (Matched ≥ 75, Works 55–74, Rethink < 55) and the top 2 to 4 reasons, positive and warnings.
- Profile modifiers adjust weights: "look taller" boosts tonal outfits and shoe–trouser color matches; the taller band softens penalties on volume.
- Vitest unit tests for every rule and for 20 or more known good and bad outfits.

Core menswear rules to seed:

- **Proportion:** balance volume. Oversized or relaxed top with slim or straight bottom ✓; fitted top with wide or baggy bottom ✓; oversized top with baggy bottom only works with a deliberate streetwear signal (cropped boxy top or chunky shoe), otherwise warn. Cropped or boxy tops pair best with higher-rise, wider bottoms.
- **Shoes match leg volume:** wide or baggy bottoms → chunky sneakers (AF1-style, Dunk-style, skate shoes) or boots. Slim or straight → low-profile sneakers, loafers, Chelsea boots, minimal leather sneakers. Skinny → sleek, low shoes; warn on very chunky soles. Tailored trousers → loafers, derbies, minimal sneakers; warn on running shoes.
- **Color:** neutrals (black, white, grey, navy, cream, beige) pair with anything. Earth tones (brown, olive, rust, tan) pair with denim, cream, white, black and each other. Limit to one statement color per outfit. Tonal outfits always score well. Warn on clashes like brown with black in similar weight unless one is clearly a small accent, and on two competing patterns.
- **Denim on denim:** allowed when the washes clearly contrast; warn when they nearly match.
- **Formality:** items carry a formality level from 1 (gym) to 5 (suit). Penalise gaps greater than 2, unless one piece is a deliberate smart-casual bridge like loafers with jeans.

Use color families, not raw hex math alone: map each tagged hex to a named family and look up a harmony table. Store the table in the rules data so contributors can tweak it.

Womenswear starter set: the same proportion and color logic, plus dresses as a single top-and-bottom piece, skirt lengths with shoe guidance (midi with flats or boots, mini with chunky sneakers or boots), heels vs flats by formality, and cropped tops with high-rise bottoms. Marked "early" in the app and README.

## Data model

All data lives in IndexedDB via Dexie. Images are stored as Blobs, never base64 strings in state. Types live in `lib/types.ts` (`Track`, `Category`, `Fit`, `ShoeProfile`, `Item`, `Profile`, `Outfit`).

A sample wardrobe ships in `public/sample/` (about 12 items with cutout images and pre-filled tags) for the "Try a sample wardrobe" option. Simple illustrated garment images are fine if real photos aren't available.

## Tech stack, AI tagging and API keys

Stack: Next.js (App Router) + TypeScript, Tailwind with a token-based theme, Motion for animation, Zustand for UI state, Dexie for IndexedDB, Vitest for tests, a service worker for offline and install. Deploy on Vercel's free tier. Keep dependencies few and well-known.

Background removal: runs in the browser (e.g. `@imgly/background-removal`), lazy-loaded only on the Add item screen. Check its license before choosing the repo license (some are AGPL). If removal fails, keep the original photo on a neutral tile.

AI tagging:

- Model: Claude Haiku (`claude-haiku-5-5`), vision input, strict JSON matching the Item tag fields plus a confidence per field.
- Resize images client-side to at most 1000px on the longest side, JPEG quality 0.8, before sending.
- Use the cutout if ready, otherwise the original. One item per photo; if several are detected, ask the user to pick one.
- Validate the JSON with Zod. Low-confidence fields are highlighted for the user to confirm.

API key handling:

- **User key (open-source mode):** pasted in Settings, stored only in IndexedDB on the device; calls go straight from the browser to Anthropic, so the key never touches our server.
- **Demo key (hosted demo):** an `/api/tag` route reads `ANTHROPIC_API_KEY` from server env, only active when `NEXT_PUBLIC_DEMO_MODE=true`. Basic per-IP rate limiting (e.g. 30 tags per hour) and a max image size.
- **Order:** user key first, then demo route if demo mode is on, otherwise manual chips.
- Never commit keys. Provide `.env.example`; `.env.local` is gitignored.

Quality bar: Lighthouse 90+ on performance and accessibility, keyboard navigable, visible focus states, alt text on cutouts, color names shown as text (not color alone), works at 360px wide.

## Build phases

| Phase | What gets built | Done when |
| --- | --- | --- |
| 0. Foundation | Next.js scaffold, tokens and theme (light and dark), fonts, `components/ui` primitives, tab bar, Dexie setup, types | App runs, theme toggles, a primitives showcase page renders |
| 1. Rules engine | Rules data, `scoreOutfit`, color families, reasons, tests, sample wardrobe | 20+ outfit tests pass; sample outfits score sensibly |
| 2. Avatar | Parametric SVG avatar, garment variants, color fills, idle and morph animations | Avatar renders any sample outfit and morphs between fits smoothly |
| 3. Onboarding | All 7 steps, live avatar, sample wardrobe path, first-match moment | New user reaches a scored outfit in under 60 seconds |
| 4. Wardrobe and Add item | Rail and grid views, match search moment, filters, item detail with Goes-with rail, camera/upload, background removal, AI tagging, manual chips | An item can be added with and without an API key |
| 5. Match and Today | Outfit builder, Match it for me, "I own..." mode, Today's Fit, Matched snap moment | Every outfit shows score, verdict and reasons |
| 6. Retention | Lessons content (30+), Learn feed, streak, Gap Finder, share card export, wardrobe stats | Lessons change with height and goals; share card exports as PNG |
| 7. Polish and ship | PWA, reduced motion, accessibility pass, empty and error states, README, CONTRIBUTING, license, deploy | Lighthouse 90+, deployed demo link, README has GIF and setup steps |

README must include: a hero image or GIF, what Matched does in two sentences, a live demo link, one-command local setup, how to add your own API key, how the rules engine works, and an "Add a style rule" contributor guide. Credit the tools used (Claude and Dessn) in a "Built with" section.

**Definition of done for v1:** a stranger can open the demo, pick the sample wardrobe, see a beautiful animated match with clear reasons within a minute, add their own clothes, and come back tomorrow to a new fit and a new lesson tailored to them.
