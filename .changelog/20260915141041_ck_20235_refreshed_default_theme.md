---
type: Major breaking change
scope:
  - ckeditor5
  - ckeditor5-ui
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20235
---

The editor now ships a refreshed, more modern default look, expressed entirely through the new tiered design tokens. Every integration that uses the default theme gets the new appearance.

The previous look remains available as an opt-in legacy theme - a single stylesheet you load - so integrations that prefer the old appearance can keep it with a one-line change.

Some of the refreshed styles also apply to `.ck-content`, so already-published documents render slightly differently - for example comment and suggestion markers, block quotes, code blocks, and horizontal lines. Rollback snippets that restore the previous content colors ship with this release.

Custom themes are largely unaffected: CSS that reads the previous token names keeps working through backward-compatible aliases. Overriding a legacy name to re-skin the editor's internals is the part that changes - use the new tokens or the legacy theme instead. See the theme migration guide for the upgrade path.
