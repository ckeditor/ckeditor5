---
type: Fix
scope:
  - ckeditor5-ui
---

Every `aria-live` announcement now stays in its region for 5 seconds before it is removed. Previously, a single timer removed the oldest announcement every 5 seconds, so an announcement could be removed right after it was added, before a screen reader read it. The editor no longer runs this timer when there is nothing to remove, so an idle editor does not wake up the browser every 5 seconds.
