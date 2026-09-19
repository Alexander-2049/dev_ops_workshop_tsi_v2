# AGENTS.md — Implementation brief for Codex

## Mission
Turn the existing, text-only `index.html` into a polished, surprising, fully working single-page presentation of **William Shakespeare's “Hamlet, Act III, Scene I [To be, or not to be]”**. The central creative tension is intentional: present a grave existential soliloquy inside an exuberant, playful, candy-colored retro-web / arcade interface. Treat the poem with respect; the joke belongs to the interface, never to altered literary text.

Read `DESIGN.md` before planning or coding. First inspect the actual repository, its existing `index.html`, and any existing configuration. Make a short implementation plan, then implement it and verify it. These instructions are requirements, not a request to stop after producing a plan.

## Source and content integrity
- Use the existing `index.html` as the authoritative source for the poem and its page metadata. Preserve the full supplied poem, title, author name, and lifespan **1564–1616**. Do not shorten, paraphrase, rewrite, randomly reorder, or silently modernize the poem. Preserve punctuation and wording as found in the repo unless repairing an obvious encoding/rendering defect; mention any such repair in the final report.
- The source may contain flattened interface labels mixed into the poem. Distinguish the poem itself from the following UI actions: **Share on Facebook**, **Share on Twitter**, **Share on Tumblr**, **View print mode**, **Copy embed code**, and **Add this poem to an anthology**. Render these as controls, not as poem lines.
- Present the poem in its original order with legible verse line breaks. If the source truly has no line breaks, reconstruct them from the supplied poem without changing words. Keep title and author separate from the verse.
- Do not add fabricated quotes, fake statistics, unrelated filler paragraphs, or an invented Shakespeare endorsement. Any extra playful microcopy must be clearly outside the poem.

## General TODO — mandatory
1. Add semantic HTML.
2. Add CSS.
3. Add styling **and working buttons** for social media.

## Deliverable and runtime constraints
- Build a static site that works directly on **GitHub Pages** from the repository root, with `index.html` as entry point. No backend, authentication, API keys, environment variables, build step, or framework required. Vanilla HTML, CSS, and optional plain JavaScript are preferred.
- Keep all project assets local where practical and use relative URLs (`./...`), not absolute root URLs (`/...`), so the site also works under `https://USERNAME.github.io/REPOSITORY/`.
- External fonts, images, or libraries are optional, but the core experience must remain functional if they do not load. Prefer CSS-generated decoration and system font fallbacks. Do not depend on third-party APIs for core UI.
- Keep implementation small and maintainable. Suggested structure: `index.html`, `styles.css`, `script.js`; additional assets only if justified. Avoid modifying unrelated files.
- No need to configure GitHub Actions or a custom domain. Provide short, accurate publication instructions if Pages is not already configured: Settings → Pages → Deploy from a branch → chosen branch → `/ (root)`.

## Content structure and UX
- Use an expressive header with a clear title, a William Shakespeare byline, and lifespan; an unmistakable reading area with the entire poem; a functional action bar; and a restrained footer.
- The contrast must be visible immediately, but typography and line rhythm must keep the text readable. On small screens, verse must wrap gracefully without horizontal scrolling or clipped text.
- Consider a playful, compact interactive flourish inspired by the phrase “To be, or not to be” (for example, an optional two-state visual switch). It must be nonessential, must not change or hide the poem, and must not be an inert gimmick.
- Avoid fake controls, dead links, misleading success toasts, auto-playing sounds, obstructive overlays, and animations that interrupt reading.

## Required actions: behavior, not decoration
Implement accessible, styled buttons or links with the following behavior:

1. **Facebook share:** open Facebook's web share endpoint using an encoded canonical page URL. Open safely in a new tab (`noopener,noreferrer`) where applicable.
2. **Twitter / X share:** open a web intent with the encoded page URL and a concise, accurate title. Preserve the source label “Share on Twitter” or make the X naming clear without misrepresenting the original action.
3. **Tumblr share:** open Tumblr's share flow with encoded URL and appropriate title/description, using its supported web-share URL format. If that flow changes or cannot be reliably confirmed, provide a clear functional fallback such as copying the page URL; never claim a share completed when it did not.
4. **View print mode:** use a real print-friendly CSS layout and trigger `window.print()` from the control. Printing must remove decorative UI, actions, and unrelated copy while preserving the full poem and attribution.
5. **Copy embed code:** copy a safe, valid iframe HTML snippet targeting the page's canonical URL. Include a descriptive `title`, responsive-friendly dimensions, and appropriate iframe attributes. Use the Clipboard API with a reasonable fallback when available; show truthful success or failure feedback. Do not pretend the clipboard worked.
6. **Add this poem to an anthology:** because GitHub Pages is static and no account/backend is available, implement this honestly as a **local saved-poem/bookmark feature** using `localStorage` where permitted. Indicate that the saved state is limited to this browser/device; allow toggling remove/save, expose the current state to assistive technology (`aria-pressed` or equivalent), and handle blocked storage gracefully. Do not imply a cloud anthology exists.

For the share/embed URL, prefer a canonical URL when the page is published; otherwise use the current page URL without query/hash. Never hardcode a personal GitHub username or repository name. Keep all URL parameters properly encoded. Do not claim network sharing is guaranteed; opening the provider's sharing flow is the successful local action.

## Accessibility and resilience
- Semantic landmarks and heading hierarchy; descriptive button labels; keyboard operability; visible focus indicators; useful status announcements through a polite live region when state changes.
- Adequate contrast for actual reading text and controls. Decorative pastel/neon backgrounds must not compromise legibility. Buttons must be comfortably tappable.
- Support narrow mobile screens, tablet, and desktop; test at approximately 320px, 768px, and 1440px. Prevent overflow and overlapping fixed elements.
- Respect `prefers-reduced-motion`; no essential information may depend on animation. Keep motion subtle and opt-in by default where practical.
- Escape or safely construct all dynamic content. No `eval`, no injection of untrusted HTML, no unsafe `target="_blank"` usage.
- Basic functionality should survive JavaScript failure: poem remains readable; ordinary share links can have valid href fallbacks when feasible. JS-enhanced features should degrade without corrupting layout.

## Verification checklist
Before marking the task complete:
- Confirm the poem is complete, in order, and visually separated from the six source UI labels.
- Verify HTML structure and CSS/JS file paths work in a GitHub Pages **project subpath**, not only at `/`.
- Exercise all six actions. For third-party share services, verify the constructed URLs and safe fallback behavior; do not assert that external services accepted the share without testing that.
- Test print styling, clipboard success/failure handling, and anthology save/remove including storage-blocked behavior.
- Check keyboard navigation, focus, mobile overflow, readable contrast, and reduced-motion mode.
- Report files changed, design decisions, tests actually performed, any remaining limitations, and the steps to enable Pages if needed. Do not claim tests were run unless they were.

## Working approach
Inspect → plan → implement → test → report. Make sensible decisions autonomously when details are unspecified. Prefer a memorable, cohesive execution over feature sprawl; do not ask for a new content brief or wait for permission to implement the already-specified site.
