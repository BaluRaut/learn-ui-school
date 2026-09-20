# 🎽 Lesson 08 — Design systems & tokens: the school uniform

**📍 You are here:** Lesson **08** of 12 · Previous: `lesson-07-frameworks` · Next: `lesson-09-performance`

---

## 📦 What's in this branch

Lessons 01–07, **plus** how a board stays consistent while many people edit
it: **design tokens** (named decisions), **scales** for spacing and type, and
**dark mode as a token swap**.

## 🧒 Explain like I'm 5

Give five people a board and no rules and you get five blues, four shades of
grey, spacing of 7px, 13px and 18px, and three button styles. Nothing is
*wrong*; the board just looks like five boards.

A **uniform** fixes it 🎽. Not "everyone wears the same thing", but "every
decision is made once and given a name":

```css
:root {
  --bg: #f8fafc;  --ink: #0f172a;  --accent: #db2777;
  --space-1: 6px; --space-2: 12px; --space-3: 20px;
  --radius: 12px;
}
```

Now nothing in the stylesheet says `#db2777` — it says `var(--accent)`.
Change the token once and the whole board changes. These named decisions are
**design tokens**, and they are the smallest useful design system.

The best part is **dark mode** 🌙: because every component asks for
`var(--bg)` and `var(--ink)` rather than for a colour, switching themes is
*redefining six tokens*. Not a second stylesheet. Not JavaScript editing
elements. Six lines.

And the board respects the reader twice: it follows the system setting
(`prefers-color-scheme`) and lets the person override it with the toggle
(`data-theme` on `<html>`), remembered in `localStorage`.

## 🗺️ Diagram

```mermaid
flowchart TB
    tok[":root tokens — --bg --ink --accent --space-2 --radius --font"]
    comp["components only use var(--token) — never a raw colour"]
    sys["@media (prefers-color-scheme: dark) → redefine 6 tokens"]
    user[':root[data-theme="dark"] → the toggle wins, saved in localStorage']
    tok --> comp
    tok --> sys --> comp
    tok --> user --> comp
    note["change --accent once → the whole board changes"]
```

## ❓ What

- **Token** = a named design decision: colour, spacing step, radius, font,
  shadow, motion duration. CSS custom properties (`--name`) are the native
  way; design tools and multi-platform systems export the same names to
  Figma, iOS and Android.
- **Scales, not numbers**: spacing 6/12/20, type 0.85/1/1.15/1.5rem. Picking
  from a scale removes a hundred small decisions.
- **Theming**: define the light palette on `:root`; redefine only the colour
  tokens under `@media (prefers-color-scheme: dark)` and under a
  `[data-theme="dark"]` attribute so an explicit choice wins both ways.
- **Contrast is part of the token**: check each pair (ink on bg, muted on
  card) once at 4.5:1 — then every component inherits a passing choice
  (lesson 06).
- **A design system** = tokens + components + usage rules + an owner. Tokens
  are step one and give most of the benefit for a small board.
- **Utility CSS** (Tailwind) solves the same drift problem differently:
  classes generated from a token config. Same idea, different surface.

## 🤔 Why

Because consistency is a feature users feel as "this is well made", and
because a token sheet turns a redesign from "edit 300 places" into "edit six
values". Dark mode, brand changes and accessibility fixes all become one-line
operations.

## 🔧 How (in this repo)

The top of [ui/styles.css](../../ui/styles.css): a `:root` block of tokens,
then the dark-mode override under `prefers-color-scheme`, then the explicit
`[data-theme="dark"]` block. Every rule below uses `var(--…)`. The toggle in
[ui/app.js](../../ui/app.js) section 5 sets `data-theme`, flips
`aria-pressed`, and saves the choice.

## 🧪 Try it

```bash
python3 ui/mock_api.py
# 1) one-line rebrand: change --accent to #0d9488 in styles.css, reload — buttons, links, focus rings, grades, all of it
# 2) dark mode three ways: the 🌙 toggle · your OS setting (system → dark, with the toggle unset) · DevTools → Rendering → Emulate prefers-color-scheme
# 3) break the uniform on purpose: set .card .grade { color: #ff00aa } and see how a raw colour survives the theme switch badly
# 4) add a token: --shadow: 0 1px 3px rgb(0 0 0 / .08); use it on .card, and add a darker one under the dark blocks
# 5) check contrast: DevTools → inspect .status → colour swatch shows the ratio (aim ≥ 4.5:1)
```

## ✅ Verify — what you should see

One token change repaints the whole board's accent. Dark mode works from the
toggle *and* from the OS setting, and the toggle wins when set — while every
component's code is untouched. Your raw pink `.grade` stays pink in dark mode:
that is exactly the drift tokens prevent.

## 🏁 What you just proved

Every look decision lives in one place, themes are a token swap, and a
component never needs to know which theme is active.

## ⚠️ Common mistakes

- raw colours and magic numbers sprinkled through components
- a separate dark stylesheet that drifts from the light one
- JavaScript setting inline colours for theming
- tokens with meaningless names (`--blue-2`) instead of roles (`--accent`, `--muted`)
- forgetting to re-check contrast for the dark palette

> 🏭 **Why this matters in production:** design systems exist because consistency does not survive headcount. Tokens are the cheapest 80% — one file, no tooling, works in every framework and in plain CSS.

## ⏭️ Next

It looks right — now make it arrive quickly: **performance** — bytes,
images, caching and Core Web Vitals.

```bash
git checkout lesson-09-performance
```
