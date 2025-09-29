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

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For optimal results, ensure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v47.0.0

Released on 1 October, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.0.0))

### CKEditor AI (early access)

We are introducing {@link features/ckeditor-ai-overview **CKEditor AI**}, an AI-powered writing assistant that integrates directly into CKEditor 5. It brings generation, summarization, correction, and contextual chat help right into the editor, reducing the need to switch between tools.

Three features are available in this early access phase:

* **Chat:** a conversational AI for dynamic, multi-turn interactions that support context setting and model selection.
* **Quick actions:** one-click transformations and instant insights for selected text.
* **Review:** automatic checks for grammar, tone, and style with in-editor suggestions.

Each feature is powered by our state-of-the-art AI service, available in the Cloud today and coming soon for on-premises deployments. This makes CKEditor AI a true plug-and-play solution that works out of the box, eliminating the need for months of custom development.

CKEditor AI is available as part of our **free trial** in early access.

### Long-Term Support (⭐)

With this release, we are introducing the **LTS version (Long-Term Support)** of CKEditor 5.

Every 2 years, one major version (starting now with **v47.0.0**) will become an **LTS version**, maintained for up to 3 years. It will receive regular updates for 6 months as Active, then will enter the Maintenance phase with security and critical compatibility fixes.

The Maintenance phase of the LTS version is available exclusively to our **premium customers**. It enables teams to:

* Stick to one stable version without frequent migrations.
* Receive guaranteed security fixes and compatibility updates.
* Plan long-term projects with fewer risks and lower maintenance expenses.

If you are interested, [contact us](https://ckeditor.com/contact/).

### Updated content navigation with <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>

Starting with {@link updating/update-to-41#updated-keyboard-navigation version 41.3.0}, we have disabled the default browser <kbd>tab</kbd> behavior for cycling nested editable elements inside the editor. We decided back then that the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) keystroke should navigate to the next focusable field or element outside the editor so the users can quickly navigate fields or links on the page.

There was one exception to this <kbd>Tab</kbd> behavior, however. When a user selected a widget, the <kbd>Tab</kbd> key would move the selection to the first nested editable, such as the caption of an image. Pressing the <kbd>Esc</kbd> key while inside a nested editable will move the selection to the closest ancestor widget, for example, moving from an image caption to selecting the whole image widget.

The above exception was limited as it supported only the first nested editable in a widget (the table was an exception that had custom <kbd>Tab</kbd> support implemented).

The current release extends the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handling to include all nested editable areas in the editor content. It also includes the content between block widgets as a separate editable area. Thanks to this, the original behavior of jumping away from the editor while pressing <kbd>Tab</kbd> inside an image caption is now tuned to jump just after that image. This way, the flow of <kbd>Tab</kbd> behavior is more linear and predictable to the user. Also, the custom widgets with multiple nested editable elements are now handled out of the box and require no custom code for <kbd>Tab</kbd> handling.

Please make sure that if you had a custom <kbd>Tab</kbd> handling implementation in your editor, it does not collide with the default one. Note that generic <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handlers are registered on the `low` priority bubbling event in the `context` of widgets and editable elements. For more details on bubbling events and contexts, please see {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} guide.

### Bubbling events priorities fix

The {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} now trigger all event handlers according to the registered priorities, even if multiple custom callback contexts are provided. Previously, not all custom callback contexts were evaluated for a given element. The custom callback contexts were also triggered after the view element name handlers. Now those are all triggered according to the registered priority, regardless of context: element name-based or callback-based.

### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **UI:** dialogs in custom features can now be positioned programmatically with more flexible options (`Dialog#show()`).
* **Comments:** confirmation views for deleting comments and threads now use simplified CSS selectors (`.ck-confirm-view`). You may need to adjust custom styles accordingly.

### Major breaking changes in this release

* list

### Minor breaking changes in this release

* list
