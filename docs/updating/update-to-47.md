---
category: update-guides
meta-title: Update to version 47.x | CKEditor 5 Documentation
menu-title: Update to v47.x
order: 77
modified_at: 2025-09-24
---

# Update to CKEditor&nbsp;5 v47.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v47.0.0

Released on 1 October, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.0.0))

This release introduces the new CKEditor AI feature.

### Updated content navigation with <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>

Starting with {@link updating/update-to-41#updated-keyboard-navigation version 41.3.0}, we have disabled the default browser <kbd>tab</kbd> behavior for cycling nested editable elements inside the editor. We have decided back then that the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) keystroke should navigate to the next focusable field or element outside the editor so that the users can quickly navigate fields or links on the page.

There was one exception to this <kbd>Tab</kbd> behavior, however. When user selected a widget, the <kbd>Tab</kbd> key would move the selection to the first nested editable, such as the caption of an image. Pressing the <kbd>Esc</kbd> key, while inside a nested editable, will move the selection to the closest ancestor widget, for example: moving from an image caption to selecting the whole image widget.

The above exception was somehow limited as it supported only the first nested editable in a widget (with an exception to the table widget that had custom <kbd>Tab</kbd> support implemented).

The current release extends the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handling to include all nested editable areas in the editor content. It also includes the content between block widgets as a separate editable area. Thanks to this, the original behavior of jumping away from the editor while pressing <kbd>Tab</kbd> inside an image caption is now tuned to jump just after that image. This way, the flow of <kbd>Tab</kbd> behavior is more linear and predictable to the user. Also, the custom widgets with multiple nested editable elements are now handled out-of-the-box and require no custom code for <kbd>Tab</kbd> handling.

Please make sure that if you had a custom <kbd>Tab</kbd> handling implementation in your editor, it does not collide with the default one. Note that generic <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handlers are registered on the `low` priority bubbling event in the `context` of widgets and editable elements. For more details on bubbling events and contexts, please see {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} guide. 

### Bubbling events priorities fix

The {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} now trigger all event handlers according to the registered priorities, even if multiple custom callback contexts are provided. Previously, not all custom callback contexts were evaluated for a given element. The custom callback contexts were also triggered after the view element name handlers. Now those are all triggered according to the registered priority, no matter whether element name-based context or callback-based context.  

### Table default styles

Starting with {@link updating/update-to-45#update-to-ckeditor-5-v4500 version 45.0.0}, we have introduced layout tables. This feature is an extension to the already existing table feature. As such, it shares most of the code, but it had to have separate styles as this type of table should not be affected by any opinionated defaults. This required a change in the table CSS selectors so they would not affect the new layout tables. The side effect of this change was the increased specificity of CSS selectors for tables.  

In the current version, thanks to CSS4 pseudo-class `:where()`, we reduced the specificity of the table default styles selector in content styles, so now it is easier to provide custom {@link features/tables-styling#default-table-and-table-cell-styles default table styles}.

### Major breaking changes in this release

* list

### Minor breaking changes in this release

* list
