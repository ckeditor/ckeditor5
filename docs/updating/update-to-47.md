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

### Long-term Support (⭐)

We are introducing the **CKEditor 5 LTS (Long-term Support) Edition**, giving teams up to 3 years of stability with guaranteed updates.

The first LTS release is **v47.0.0** (October 2025). It will receive **6 months of active development** with new features and fixes, then **2.5 years of maintenance** with security and critical compatibility updates.

For **v47.x**, the Maintenance phase starts in **April 2026**. From then the next versions in the v47.x line will be available only under a **commercial LTS Edition license**. Therefore, starting in April, integrators without an LTS license should migrate to v48.x (the next regular release).

If you need long-term stability, [contact sales](https://ckeditor.com/contact-sales/) or read more about the {@link getting-started/setup/using-lts-edition CKEditor 5 LTS Edition}.

### Updated content navigation with <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>

Starting with {@link updating/update-to-41#updated-keyboard-navigation version 41.3.0}, we have disabled the default browser <kbd>tab</kbd> behavior for cycling nested editable elements inside the editor. We decided back then that the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) keystroke should navigate to the next focusable field or element outside the editor so the users can quickly navigate fields or links on the page.

There was one exception to this <kbd>Tab</kbd> behavior, however. When a user selected a widget, the <kbd>Tab</kbd> key would move the selection to the first nested editable, such as the caption of an image. Pressing the <kbd>Esc</kbd> key while inside a nested editable will move the selection to the closest ancestor widget, for example, moving from an image caption to selecting the whole image widget.

The above exception was limited as it supported only the first nested editable in a widget (the table widget was an exception that had custom <kbd>Tab</kbd> support implemented).

The current release extends the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handling to include all nested editable areas in the editor content. It also includes the content between block widgets as a separate editable area. Thanks to this, the original behavior of jumping away from the editor while pressing <kbd>Tab</kbd> inside an image caption is now tuned to jump just after that image. This way, the flow of <kbd>Tab</kbd> behavior is more linear and predictable to the user. Also, the custom widgets with multiple nested editable elements are now handled out of the box and require no custom code for <kbd>Tab</kbd> handling.

Please make sure that if you had a custom <kbd>Tab</kbd> handling implementation in your editor, it does not collide with the default one. Note that generic <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handlers are registered on the `low` priority bubbling event in the `context` of widgets and editable elements. For more details on bubbling events and contexts, please see {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} guide.

### Bubbling events priorities fix

The {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} now trigger all event handlers according to the registered priorities, even if multiple custom callback contexts are provided. Previously, not all custom callback contexts were evaluated for a given element. The custom callback contexts were also triggered after the view element name handlers. Now those are all triggered according to the registered priority, regardless of context: element name-based or callback-based.

### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **UI:** dialogs in custom features can now be positioned programmatically with more flexible options (`Dialog#show()`).
* **Comments:** confirmation views for deleting comments and threads now use simplified CSS selectors (`.ck-confirm-view`). You may need to adjust custom styles accordingly.

### Major breaking changes in this release

With the release of {@link features/ckeditor-ai-overview **CKEditor AI**}, the `ai.`* configuration namespace has been updated to support all AI-related features. Previously, this namespace was dedicated exclusively to the `AIAssistant` feature. 

As a result of this change, **the `AIAssistant` configuration has been relocated to a new structure.** The changes are: 
  * `ai.aiAssistant` -> `ai.assistant`,
  * `ai.useTheme` -> `ai.assistant.useTheme`,
  * `ai.aws` -> `ai.assistant.adapter.aws`,
  * `ai.openAI` -> `ai.assistant.adapter.openAI`.

### Minor breaking changes in this release

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The Widget feature implements the default handling for `Tab`/`Shift+Tab` to navigate nested editable elements in the editor content. Closes [#19083](https://github.com/ckeditor/ckeditor5/issues/19083). The listeners are registered on the `low` priority bubbling event in the context of widgets and editable elements.
  Please verify if your custom `Tab`/`Shift+Tab` handling does not collide with the default one.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The internal structure of the package has changed. Importing `AIAssistant` from the source should be done via `@ckeditor/ckeditor5-ai/src/aiassistant/aiassistant.js` path instead of the previous `@ckeditor/ckeditor5-ai/src/aiassistant.js`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Changed the CSS selectors used to style the confirmation view displayed when attempting to remove a comment or an entire comment thread. For now, CSS classes will be more generic, for example: `.ck-confirm-view` instead of `.ck-thread__remove-confirm` . If you override styles for these components, you will need to update the selectors.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: The `UndoCommandRevertEvent` type was renamed to `UndoRedoBaseCommandRevertEvent` and moved to the `basecommand.ts` file. Adjust your code if you have used this type in your custom integration. See [#19168](https://github.com/ckeditor/ckeditor5/issues/19168).
* Updated to TypeScript 5.3.