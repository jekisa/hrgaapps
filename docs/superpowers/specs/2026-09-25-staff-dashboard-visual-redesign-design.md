# STAFF Dashboard Visual Redesign — Design Specification

## Goal

Make the STAFF experience in HRGA Apps warmer, more personal, and visually modern while leaving ADMIN appearance, data visibility, routes, and API behavior unchanged.

## Approved visual direction

- Use a warm coral accent `#B54735` with white foreground contrast ratio 5.36:1 (WCAG AA for normal text). Use a pale coral tint such as `#FFF1ED` for surfaces and focus/selection backgrounds.
- Define the accent as a CSS custom property, scoped to STAFF-rendered surfaces. Do not replace or globally override existing primary-blue tokens.
- Keep the existing Inter typography, dark navy sidebar, and white/light workspace. Use rounded but restrained surfaces, soft borders, subtle lift on hover, and short motion that respects `prefers-reduced-motion`.
- Use a color-customized SVG illustration from unDraw (Trip/vacation theme) in the STAFF greeting. Treat the generated dashboard and form mockups from this session as visual references, not production assets; real copy and controls remain HTML/React.

## Scope and role isolation

- STAFF only: `/` dashboard presentation, active sidebar appearance, and `/cuti/saya/ajukan` form presentation.
- ADMIN dashboard, global blue design tokens, admin sidebar active styles, shared default `.btn-primary`, APIs, middleware/proxy guards, schemas, and data access must remain unchanged.
- Scope CSS through explicit STAFF classes/data attributes applied only when `session.user.role === 'STAFF'`; use the existing uppercase role values in code.
- No new dependency is required. The repo uses Tailwind plus `app/globals.css`, has no date-picker component/library, and already includes `date-fns`.

## STAFF dashboard

1. Replace the generic greeting with a greeting based on the local hour (Pagi/Siang/Sore/Malam) and the signed-in user's session name. Style its surface with a white-to-pale-coral gradient and a compact vacation/calendar unDraw illustration.
2. Redesign the four existing personal statistics: annual leave remaining, active personal reminders, unread personal notifications, and latest personal leave request status. Use distinct, harmonious colored icon tiles; subtle hover lift; and compact, accessible labels.
3. Show an annual leave progress visual for remaining versus used days. Since the STAFF dashboard already returns remaining days and the existing active leave-type endpoint returns `defaultQuotaPerYear`, derive the visual against the annual leave type's current default quota without modifying APIs. Clamp values to valid bounds, handle absent quota/remaining values, and label quota context clearly; do not present a negative used/remaining value.
4. Keep staff event filtering and current widget order/data sources. Apply coral to the selected calendar date and staff legend/event emphasis only.
5. Friendly empty states: zero active reminders, zero unread notifications, no upcoming personal events, and no leave activity. Include a small matching illustration/icon, warm copy, and a relevant working link/CTA. For notifications, say “no new/unread notifications,” not “no notifications exist,” because the existing dashboard returns only the unread count.
6. Preserve all existing personal links and do not add company-wide information or widgets.

## STAFF leave application form

- Keep current submission/upload APIs, validation, optional attachment behavior, required attachment for leave types marked `requiresAttachment`, success toast, and no history redirect.
- Replace the two browser-native date controls with a compact, keyboard-accessible calendar popover component using existing `date-fns` and Indonesian date formatting. Preserve date values submitted to the existing form and live business-day counting; do not silently introduce a new date restriction.
- Replace the browser-default file presentation with a custom drag/drop zone backed by the existing file input. Support keyboard activation, drag-over coral border, selected file name/size, remove/replace action, accepted PDF/JPG/PNG formats, and the current 5 MB limit. Keep the native input available to assistive technology.
- Style the total business-day count as a pill with a subtle transition and coral emphasis when greater than zero. Use a paper-plane icon in the STAFF primary submit button; do not globally restyle ADMIN buttons.

## Sidebar

- Apply the coral active treatment only to STAFF's existing Dashboard/Reminder/Notifikasi/Cuti Saya links. Preserve menu items, expanded/collapsed behavior, and all ADMIN styling.
- The optional profile illustration is omitted to avoid visual clutter; the existing avatar/profile block remains.

## Accessibility and motion

- Maintain readable text contrast (WCAG AA), visible keyboard focus, semantic labels, keyboard-operable date picker and dropzone, and useful screen-reader announcements for validation/selected files.
- Respect `prefers-reduced-motion` for card lifts, progress fill, and transitions.

## Data and verification notes

- No API, middleware, route-guard, or database changes are in scope.
- Earlier read-only verification found the local STAFF account does not match a Karyawan record by email, so `/api/dashboard` returns 422 in the current dataset. The account must be linked before real STAFF dashboard browser verification; this visual task must not mutate that account/employee data.
- Validate ADMIN visuals remain unchanged, STAFF desktop/mobile surfaces render without overflow, the date picker and file dropzone interactions work, attachment requirements and submission success still work, and all existing tests/build checks pass.
