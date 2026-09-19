# DESIGN.md — Creative direction: EXISTENTIAL CRISIS™ FUN ZONE

## Creative premise
**A tragedy presented as a relentlessly cheerful 1990s–2000s web arcade.** Imagine a bubblegum-colored, arcade-prize landing page that has accidentally been assigned the most famous meditation on mortality in English drama. The visual voice says “YOU GOT THIS! ✨”; the poem quietly asks whether existence is bearable. This contrast should feel clever and art-directed rather than a random collection of memes.

**Conceptual tagline:** `TO BE? / NOT TO BE? / PRESS START.` Use it only as interface copy, never as a replacement for Shakespeare's words. The original title, attribution, and complete poem remain prominent and dignified.

## Explicit anti-reference
Do **not** make a conventional Hamlet/Shakespeare-themed website. Avoid black-and-gold luxury styling, candlelight, skulls, blood, parchment, quills, medieval emblems, gloomy theater photography, generic dark academia, and faux Elizabethan ornaments. Avoid a predictable plain black-and-white poetry blog. The interface aesthetic should be the *opposite* of the text's atmosphere.

## Visual system
- **Mood:** sunny, absurdly optimistic, knowingly overenthusiastic, polished, tactile, and slightly nostalgic. Think collectible stickers + arcade UI + editorial art direction, not chaotic clip-art.
- **Palette:** warm off-white/vanilla for the primary reading surface (`#FFFDF4`); ink-like deep navy for the poem (`#202044`); electric cobalt (`#4545FF`), bubblegum pink (`#FF66B3`), acid lime (`#DFFF58`), and tangerine (`#FF964A`) for interface accents. Adjust exact values if needed for accessible contrast. Use strong color in framing and actions; never set long poem passages in low-contrast candy colors.
- **Type:** a playful heavy display sans for headlines (rounded or grotesk, system fallback acceptable); a genuinely readable serif or refined text face for the soliloquy. The type contrast is the joke. Do not use a novelty font for the full poem. Preserve line breaks and use generous line height.
- **Surfaces:** oversized rounded panels, confident borders, sharp offset shadows, pill badges, sticker-like corners, crisp geometric patterns. Use decoration sparingly around—not behind—the verse.
- **Illustration:** create small CSS/SVG geometric doodles (stars, smiley, sunburst, pixel sparkle, ticket stub). Prefer original, lightweight vector/CSS elements over stock Shakespeare imagery or remote images. Any decorative SVG must be marked appropriately for assistive tech.

## Suggested page composition
1. **Hero / arcade marquee:** high-impact, graphic introduction with `TO BE?` and `NOT TO BE?` displayed like two playful arcade options. Place the actual work title and Shakespeare attribution in clear proximity. Include one restrained invitation to scroll/read. The hero should not consume the entire mobile viewport or bury the poem.
2. **Reading card:** the centerpiece. A large, warm light panel on a spirited background, with a small editorial metadata row and the full poem in its own uninterrupted reading column. Keep the verse aligned consistently, with deliberate whitespace. Avoid confining the poem inside a tiny scrollable box.
3. **Action bar:** six distinctly functional actions grouped by intent (social sharing; utilities; save). Social buttons should feel like satisfying arcade tokens or sticker buttons, not default browser links. Use recognizable text labels; icons are optional, never icon-only without accessible names. On mobile, arrange into a clear grid or wrapping stack.
4. **Footer:** one brief playful sign-off or small badge, plus sober attribution if needed. No invented endorsements, fake counters, or unrelated content sections.

## Interaction direction
- Buttons may have crisp hover lift, offset shadow shift, and short pressed states; keyboard focus is even more apparent than hover.
- Optional playful switch/toggle: `TO BE` / `NOT TO BE` changes **only** decorative interface treatment (for example the hero badge or background pattern), not the poem text, reading contrast, accessibility, or saved state. It is extra polish, not a requirement to understand the page.
- Show small, truthful confirmation when embed code is copied or the poem is saved locally. Keep notifications quiet, short, and non-obstructive.
- No autoplay audio, flashing lights, excessive parallax, forced scrolling, cursor trails, confetti explosions over the poem, fake progress bars, or interruptive modals.
- Under `prefers-reduced-motion: reduce`, remove nonessential transitions and animation.

## Responsive and accessible art direction
- **Desktop:** asymmetrical, poster-like framing with hero and poem card; text stays at a comfortable reading width rather than stretching across the screen.
- **Mobile:** one-column flow, tighter decorative accents, no sideways scrolling, readable poem with natural wrapping and clear action buttons. Avoid relying on two-column verse layouts.
- Keep long-form text dark on the light reading panel, with generous line height and sensible font sizing. Protect the poem from overlays, textures, stickers, and background shapes.
- Print stylesheet is deliberately the *opposite of the screen theme*: clean black text on white, title/author and complete poem, no decorative elements or buttons.

## Quality bar and decision rule
Make the experience feel like a coherent tiny digital art piece, not a generic template wearing bright colors. Prioritize, in order: **complete faithful poem → usable accessible interactions → strong concept → expressive details**. If an embellishment makes reading or GitHub Pages deployment harder, remove the embellishment.

## Content and implementation boundaries
Use the text already in `index.html` and the functional requirements in `AGENTS.md`. English is the language of the site because the supplied literary content is English. No backend, fabricated social metrics, remote dependency required for core behavior, or gratuitous copy that competes with the soliloquy.
