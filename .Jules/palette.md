## 2026-01-08 - [Accessible Notification Dropdowns]
**Learning:** Custom dropdowns using divs for items exclude keyboard users.
**Action:** Always use button or a elements for interactive list items and ensure aria-expanded and role="menu" are present.

## 2026-01-08 - [Accessible Error Messages]
**Learning:** Dynamic error messages are often missed by screen readers if they don't use `role="alert"` or `aria-live`.
**Action:** Wrap dynamic error containers in `role="alert" aria-live="assertive"` to ensure immediate announcement.
