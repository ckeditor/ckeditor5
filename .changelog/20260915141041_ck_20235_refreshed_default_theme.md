---
type: Major breaking change
scope:
  - ckeditor5
  - ckeditor5-ui
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20235
---

The editor now ships a refreshed, more modern default look, expressed entirely through the new tiered design tokens. Every integration that uses the default theme gets the new appearance.

The previous look remains available as an opt-in legacy theme preset. Copy it from the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/migration-to-refreshed-theme.html#keeping-the-old-look) into your own stylesheet and load it after the editor styles.

Some of the refreshed styles also apply to `.ck-content`, so already-published documents render slightly differently - for example comment and suggestion markers, block quotes, code blocks, and horizontal lines. The migration guide includes rollback snippets that restore the previous content colors.

Custom themes are largely unaffected: overrides of the previous token names keep working, because the theme still reads each legacy name first. CSS that reads the previous names needs the opt-in aliases from the migration guide. See the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/migration-to-refreshed-theme.html) for the upgrade path and the few exceptions.
