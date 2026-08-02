# Handoff: Banheiros — public bathroom review app

## Overview
Banheiros lets users find and review publicly-accessible bathrooms (fast food, retail, municipal, parks) on a map, rating them on accessibility, lighting, odor, maintenance and cleanliness. Users can favorite bathrooms, submit moderated reviews under a real or hidden username, sign in with email/password or Google, and (later) enable 2FA. Bathroom location data and store "has a bathroom" flags are meant to come from OpenStreetMap in production.

## About the Design Files
The files in `prototype/` are **design references built in HTML/React (Babel-in-browser), not production code**. They demonstrate layout, states, copy and interaction timing. The task is to **recreate this design in the target codebase's real stack** (native iOS/Android, React Native, or a web framework — whichever the project uses, or the best fit if none exists yet), using that codebase's real navigation, state management, networking and auth libraries. Do not ship the prototype's HTML/inline-Babel/React-via-CDN approach as-is.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii and component states are final and drawn from the bound "Organic" design system (see Design Tokens below). Recreate pixel-close using the design system's tokens translated into the target platform's styling approach (CSS variables → theme constants, Sass tokens, SwiftUI extensions, etc). Copy (Portuguese/English strings) is final and should be lifted into the app's real i18n system.

## Internationalization
The prototype ships a minimal from-scratch i18n layer (`js/i18n.js`): a flat `key → string` dictionary per language (`pt`, `en`), a `t(lang, key, vars)` lookup with `{{var}}` interpolation, and a single `banned` word list used for moderation (see below). In the real app, replace this with the codebase's real i18n library (e.g. i18next, react-intl, or platform-native localization), but **keep the same key structure** (dot-namespaced: `auth.*`, `nav.*`, `map.*`, `bathroom.*`, `category.*`, `ratingCat.*`, `review.*`, `favorites.*`, `profile.*`, `addPin.*`, `common.*`) — it was designed so adding a third language is just adding one more top-level object. All strings currently in the dictionary are enumerated in `prototype/js/i18n.js` and should be migrated verbatim into translation files. Note: user-generated content (review comments) is NOT translated — only interface chrome is.

## Screens / Views

### 1. Auth — Login / Signup (`js/AuthScreen.jsx`)
- Single screen, two modes toggled by a text link at the bottom ("Não tem conta? Criar conta" / "Já tem conta? Entrar").
- Layout: vertical stack, left-aligned, `padding: 44px 17.6px 26.4px` (uses design system space tokens), max width matches the mobile shell (480px).
- Top-right: a circular ghost icon button (globe icon) toggling PT/EN immediately, pre-login — demonstrates language switch is available before sign-in.
- Brand row: 40px circular accent-colored badge with a map-pin icon + wordmark in the heading font.
- Title (H1, 26px) + one-line subtitle (14px, 75% opacity).
- **Login fields**: email (text input), password (password input with an eye/eye-off toggle button absolutely positioned inside the field, right-aligned), a right-aligned ghost "Forgot password?" link (non-functional in prototype — wire to real flow), primary full-width "Entrar" button (disabled until email length > 3 and password length ≥ 4 in the prototype — replace with real validation), an "ou" divider (line—text—line), a secondary full-width "Continuar com Google" button with the real 4-color Google "G" mark, a small note about 2FA being available after account creation, and the mode-switch link.
- **Signup fields**: name, username (optional, with helper text "Aparece nas avaliações somente se você optar por isso"), email, password + confirm (both with show/hide), a terms checkbox, primary "Criar conta" (disabled until name present, email present, password ≥ 6 chars, password === confirm, checkbox checked), same Google button, same 2FA note, mode-switch link back to login.
- **Google auth**: in the prototype, clicking the Google button logs in immediately with a mock user — in production wire to real Google OAuth (the design system doc calls out this needs a real Google API integration) and populate the account's email from the Google profile.
- **2FA**: intentionally NOT built at signup — only mentioned via the note above the Google button. Full enrollment happens in Profile (see below).

### 2. Map (`js/MapScreen.jsx`)
- Full-bleed screen (minus the bottom nav) containing:
  - An illustrated map background (stylized SVG standing in for real map tiles — in production this whole area is replaced by an OpenStreetMap-based map view, e.g. MapLibre GL / Leaflet with an OSM tile source, plus a geocoding search).
  - A floating top bar: search box (icon + text input, placeholder "Buscar endereço ou local") + a circular "filter" icon button that toggles a legend/filter popover.
  - A horizontally scrollable chip row for category filtering: Todos / Público / Comercial / Pago.
  - A legend popover (opens from the filter button): 4 rows, each a small colored dot + icon + label, explaining pin color/badge meaning (see Pins below).
  - Map pins: absolutely positioned (percentage coordinates in the prototype; real geo lat/lng in production), 38px "map pin" teardrop shape, rotated square with rounded corners, colored by category:
    - Public / public-paid bathrooms: solid `--color-accent` (terracotta) background, a "building" icon.
    - In-store / in-store-paid bathrooms: solid `--color-accent-2-700` (dark sage) background, a "store" icon.
    - Paid variants get a small circular badge (bottom-right, dollar-sign icon, `--color-accent-2-600`) overlaid on the pin.
    - Favorited bathrooms get a small circular badge (top-left, star icon, `--color-accent-700`) overlaid on the pin — this is the "favorite version of each pin" the app spec calls for; it's a badge/overlay rather than a separate icon set, applied to any of the 4 base categories.
    - Selected pin gets a 3px sage outline ring.
  - A floating action button (FAB, bottom-right, 54px circle, primary accent, plus icon) opens the "Add bathroom" dialog.
- Tapping a pin opens the Bathroom Detail bottom sheet (below) for that bathroom.

### 3. Bathroom Detail — bottom sheet (`js/BathroomModal.jsx`)
- A modal that slides up from the bottom over a dimmed backdrop; covers ≤88% of screen height; rounded top corners (2× the design system's large radius).
- **Close behavior** (as specified): an X button top-right of the sheet header, OR dragging the sheet down past ~110px via the drag handle area (a 42×5px pill at the top) triggers close; releasing before the threshold springs the sheet back to rest. Tapping the dimmed backdrop also closes it. Implement with a real gesture/pan-responder API on the target platform (React Native's `PanResponder`/`Reanimated`, or a bottom-sheet library) rather than raw pointer events.
- Content (scrollable within the sheet):
  - Category + free/paid tags.
  - Bathroom name (H3-ish, 21px, heading font).
  - Horizontally scrollable photo row (3 placeholder tiles in the prototype — production shows real user-submitted photos, falls back to a "no photos yet" state).
  - Address row (pin icon + address text).
  - Hours row (clock icon + "hoje: HH:MM – HH:MM" + a right-aligned status pill computed from current time vs hours: "Aberto agora" / "Fechado agora").
  - Overall score card: big number (`avg of the 5 category ratings`, 1 decimal, out of 3) in a tinted surface card.
  - Per-category rating rows: icon + label (Acessibilidade/Iluminação/Odor/Manutenção/Limpeza) + a 3-dot filled/unfilled indicator per category (rounded to nearest whole dot).
  - Actions row: a square "favorite" icon button (star, toggles filled/tinted state) + a primary "Escrever avaliação" button that switches the sheet into review-composer mode (in place, not a new screen — same sheet, with a back arrow returning to the detail view).
  - Reviews list: each entry shows author (username if the reviewer opted to show it, else "Usuário anônimo"), relative date, and the comment text. Newly-submitted reviews (this session) get a small "Hoje" tag.
  - A ghost "Reportar problema com este pin" link/button at the bottom (flag icon) — present as an affordance; wire to a real moderation/report flow.

### 4. Write a Review — composer (`js/ReviewComposer.jsx`, rendered inside the same sheet)
- Back arrow + "Nova avaliação" header.
- 5 rating pickers, one per category, each: icon + label above a row of three 30×30 circular buttons labeled 1/2/3 (selected = filled accent).
- Comment textarea (multiline, 4 rows), placeholder "Conte como estava o banheiro...".
- **Moderation**: as the user types, the comment is checked (case-insensitive substring match) against a banned-word list (`prototype/js/i18n.js` → `banned` array — a small placeholder list mixing mild PT/EN terms; replace with a real moderation service/model in production, e.g. a hosted profanity/toxicity API, plus the same block-before-submit UX). While flagged, a warning banner (alert-triangle icon + "Sua avaliação contém linguagem ofensiva ou proibida...") appears under the textarea and the submit button stays disabled.
- **Username visibility control**: a two-option radio group ("Manter anônimo" / "Mostrar meu usuário nesta avaliação (@handle)"), defaulting to the account's stored default-visibility preference, with a small note reminding the user they can change the account default in Profile. This is the per-review override the spec asked for ("deciding the user if this will be kept the default option or if it will change with ease").
- Submit is enabled only once all 5 categories are rated, the comment is non-trivial, and no banned word is present. On submit: the review is prepended to the bathroom's review list, the bathroom's aggregate category ratings are nudged toward the new review's values (simple weighted blend in the prototype — production should recompute a true average from all underlying reviews), the sheet returns to detail view, and a transient success banner ("Avaliação publicada!") shows for ~3s.

### 5. Favorites (`js/FavoritesScreen.jsx`)
- Simple vertical list of `.card`-styled rows for every bathroom the user has starred: category-colored icon circle, name, address + score, and a filled star button to unfavorite in place.
- Empty state: centered icon in a tinted circle + "Nenhum favorito ainda" + explanatory subtext.
- Tapping a row opens the same Bathroom Detail sheet as the map.

### 6. Profile (`js/ProfileScreen.jsx`)
- Avatar (initial letter in a tinted circle) + name + email.
- Editable username field.
- **Default username visibility** toggle ("Mostrar meu usuário nas avaliações, por padrão") — a custom on/off switch (see Design Tokens/Components note — the base design system has no switch component; one was built for this app using the system's accent/neutral tokens; reuse it or the target platform's native switch).
- Language section: a segmented control (native radio inputs) with one option per supported language — currently PT / EN.
- Security section: "Verificação em duas etapas" toggle. When turned on, an info panel appears explaining that the user needs to scan a QR code with an authenticator app. **This is intentionally a stub** — the real QR-provisioning + 6-digit code verification flow (TOTP secret generation, QR rendering, code confirmation, backup codes) is NOT built and needs full design + implementation.
- "Sair da conta" (logout) button at the bottom, secondary style, returns to the Auth screen.

### 7. Add a bathroom pin (`js/AddPinModal.jsx`)
- A lightweight centered dialog (not a full screen) reachable from the map's FAB: place name, category (segmented radios across the same 4 categories), address, and open/close time inputs. Submitting shows a short "sent for moderation" confirmation and auto-closes.
- This flow is deliberately minimal in the prototype (it wasn't a priority flow for this round) — production should expand it to actually drop a pin via a location picker on the real map, pull suggested name/hours from OSM/Overpass data when the tapped location matches an existing OSM POI, and route submissions through the same auto-moderation pipeline as reviews before publishing.

## Interactions & Behavior summary
- Bottom sheet: slide up on open, drag-to-dismiss with a release threshold, backdrop tap to dismiss, X button to dismiss — see Bathroom Detail above.
- Review submission is blocked client-side while the comment matches a banned-word list; this is a placeholder for real server-side auto-moderation (the app also needs to auto-moderate submitted pins, per the product spec — not just reviews).
- All primary actions use the design system's built-in hover/pressed/focus states (see design system CSS) — do not restyle per screen.
- Bottom navigation (Mapa / Favoritos / Perfil) is a persistent 3-tab bar; switching tabs preserves state (favorites, added reviews) in memory for the session.

## State Management
Needed top-level state (session/account-scoped):
- `lang`: current UI language code.
- `loggedIn`, `user` `{ name, email, username, defaultShowUsername }` — `defaultShowUsername` is the account-level default read by the review composer.
- `bathrooms`: list with `{ id, name, category, address, lat/lng, hours, ratings (per-category aggregate), reviews[] }`.
- `favorites`: set of bathroom ids the current user starred — should persist server-side per account, not just in memory.
- `selectedBathroomId` / sheet open state.
- Review draft state local to the composer (per-category ratings, comment text, visibility choice) — discarded on cancel.
- 2FA enrollment state (not built) — will need its own state machine (QR shown → code entered → verified → enabled).

Data that must come from real services in production:
- Bathroom locations + "does this business have a bathroom" flags: OpenStreetMap (Overpass API or a pre-synced extract) integration, per the product spec.
- Auth: real email/password backend, Google OAuth, TOTP-based 2FA.
- Moderation: a real text-moderation service for reviews and submitted pins (auto-moderation, not just the client-side word list shown here).

## Design Tokens
Sourced from the bound "Organic" design system (`prototype/_ds/.../styles.css`) — bring these into the target codebase's real theme/token layer rather than hardcoding hex values.

**Color**
- Background: `#f5ead8`, Surface: `#ebddc5`, Text: `#201e1d`
- Accent (terracotta): `#c67139`, ramp 100→900 from `#fff2eb` to `#402310`
- Accent-2 (sage): `#7a8a5e`, ramp 100→900 from `#f0fae1` to `#272e1b`
- Neutral ramp 100→900 from `#f9f4ed` to `#2e2b25`
- App-specific additions (not in the base system, derived in OKLCH to stay harmonious): `--map-water: oklch(78% 0.05 222)`, `--map-water-deep: oklch(58% 0.06 224)` — used only for the illustrated map's water, since the base palette has no blue.

**Typography**
- Headings: Caprasimo (weight 400) — display/titles only.
- Body: Figtree (400/600/700).
- Base body size 15px / line-height 1.55.

**Spacing scale**: 4.4 / 8.8 / 13.2 / 17.6 / 26.4 / 35.2px (`--space-1` … `--space-8`).

**Radius**: sm 8px, md 16px, lg 28px — this app pushes cards/dialogs/sheets to `lg × 1.15` and buttons/inputs/tags to fully pill (999px), per the design system's "over-round" direction.

**Shadow**: sm/md/lg tuned ink-tinted shadows (see stylesheet for exact values).

**Components reused as-is from the design system**: `.btn` (+ primary/secondary/ghost/icon/block), `.tag` (+ accent/accent-2/neutral/outline), `.field`/`.input`, `.radio`, `.seg`, `.card` (+ elevation utilities), `.dialog`/`.dialog-backdrop`.

**Components built new for this app** (not in the base system — recreate using the same token language on the target platform): the bottom sheet, map pins + legend, bottom tab bar, the on/off `.switch` toggle, the 3-dot rating indicator/picker, category filter chips, and the illustrated map background.

## Icons
Lucide icons (https://lucide.dev), stroke-width 2.75, inline SVG on `currentColor`, per the design system's icon guidance. The exact icon names used per UI element are enumerated in `prototype/js/Icons.jsx`. The Google "G" mark is the real 4-color Google brand asset (not a design-system token) and must stay as Google's official brand colors wherever "Sign in with Google" appears.

## Assets
No photography or external image assets — the map is an illustrated SVG standing in for real OSM map tiles, and bathroom photos are placeholder tiles (camera icon) pending real user uploads. All icons are inline SVG (Lucide paths), no icon font or external icon assets.

## Files
- `prototype/Banheiros.html` — entry point, loads the design system bundle + React/Babel-in-browser + all screen files below. Open this file directly in a browser to click through the whole prototype.
- `prototype/app.css` — app-specific layout on top of the design system's tokens (does not redefine colors/type/spacing — only layout).
- `prototype/js/i18n.js` — the PT/EN string dictionary + banned-word moderation list.
- `prototype/js/data.js` — mock bathroom/review data (fictional, standing in for OSM + backend data).
- `prototype/js/Icons.jsx` — the icon set (Lucide paths) + the Google logo mark.
- `prototype/js/AuthScreen.jsx` — Screen 1.
- `prototype/js/MapScreen.jsx` — Screen 2 (incl. the illustrated map + pins).
- `prototype/js/BathroomModal.jsx` — Screen 3 (the bottom sheet shell + detail view).
- `prototype/js/ReviewComposer.jsx` — Screen 4 (rendered inside the sheet).
- `prototype/js/FavoritesScreen.jsx` — Screen 5.
- `prototype/js/ProfileScreen.jsx` — Screen 6.
- `prototype/js/AddPinModal.jsx` — Screen 7.
- `prototype/js/App.jsx` — root component wiring all screens together, owns the state listed above.
- `prototype/_ds/organic-.../styles.css` + `_ds_bundle.js` — the bound Organic design system (tokens + a few shared React components used elsewhere in the design system, not directly used by this app's screens beyond the CSS classes).
