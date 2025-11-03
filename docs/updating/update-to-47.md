---
category: update-guides
meta-title: Update to version 47.x | CKEditor 5 Documentation
menu-title: Update to v47.x
order: 77
modified_at: 2025-10-16
---

# Update to CKEditor&nbsp;5 v47.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For optimal results, ensure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v47.2.0

Released on 5 November, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.2.0))

This release introduces expanded CKEditor Ai feature, new Footnotes features and several improvements.

### CKEditor AI

We are introducing CKEditor AI, a powerful writing assistant that brings AI-powered content creation directly into CKEditor 5. It helps users create, review, and refine content without switching between tools, making the editing experience faster and more productive.

CKEditor AI includes three core capabilities:

* **Chat**: a conversational AI assistant for multi-turn interactions that supports context setting and model selection. All conversations are tracked in a persistent chat history, and suggestions are reviewable before being applied.
* **Quick actions**: one-click transformations for selected text, including rewriting, simplifying, expanding, summarizing, or adjusting tone. Changes appear inline with preview capabilities.
* **Review**: automatic quality assurance that checks grammar, tone, clarity, and style across the document. Suggested changes are presented in a visual review interface where users can accept or reject individual edits or apply all approved suggestions in bulk.

Power users can select their preferred model during sessions (GPT-5, Claude 3.5, Gemini 2.5, and more), while integrators maintain control over access rules and usage tiers. 

Built as a plugin for CKEditor 5, it integrates quickly into existing applications with minimal configuration, and all AI interactions are fully observable via audit logs and optional APIs.

CKEditor AI is available as a premium add-on to all paid CKEditor 5 plans with a transparent subscription-plus-usage pricing model. A 14-day trial is available with access to all premium features.

### Footnotes (⭐)

A brand-new {@link features/footnotes Footnotes} feature is here! It lets users insert and manage footnotes directly in their content, keeping references organized and readable. Footnotes stay linked to their source text and update automatically when edited, ideal for academic, legal, or technical writing. You can also **customize the numbering**, including the starting number and numbering style, to match your document’s formatting needs.

### Restricted editing for blocks (⭐)

{@link features/restricted-editing Restricted editing} now supports **block-level restrictions**, not just inline ones. This makes it easier to protect the entire content while still allowing controlled edits where required. A common use case is unlocking for editing template sections like paragraphs, tables, or structured document parts, and protecting the rest of the content.
to do

#### Legacy toolbar button for restricted editing

The version introduces new toolbar items for the {@link features/restricted-editing restricted editing} feature. The new available toolbar ites are `restrictedEditingException:dropdown` (for both inline and block types of editing fields), `restrictedEditingException:inline`, and `restrictedEditingException:block`.

To retain full backwards compatibility, we have provided an alias toolbar item: `restrictedEditingException`. It is the old toolbar button call and it defaults to inline restricted editing field button. There is no need to change your configuration if you only want to use inline fields type. If you want to use both the block and inline type fields, please {@link features/restricted-editing#configuring-the-toolbar update your toolbar configuration}.

### Old installation methods sunset timelines

We are extending the sunset period for old installation methods ([#17779](https://github.com/ckeditor/ckeditor5/issues/17779)) to the **end of Q1 2026**. It is a good moment to consider switching to the {@link getting-started/setup/using-lts-edition LTS edition} for long-term stability and an additional 3 years of support for the old installation methods.

### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **View engine stability:** Fixed a bug where placeholders could remain visible after view changes, such as moving or replacing elements.
* **Downcast reliability:** The [`elementToStructure`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcasthelpers-DowncastHelpers.html#function-elementToStructure) helper now handles nested structures and list elements more consistently, ensuring correct reconversion and structure maintenance.

## Update to CKEditor&nbsp;5 v47.1.0

Released on 16 October, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.1.0))

This release introduces a minor stability update, featuring focused fixes and UX improvements.

### Minor breaking changes in this release

<info-box note>
Breaking changes in CKEditor AI are permitted during the Active phase of an LTS release. {@link getting-started/setup/using-lts-edition#features-excluded-from-the-no-breaking-changes-guarantee-v47x Learn more}.
</info-box>

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Simplified CSS for the CKEditor AI integration in a sidebar mode (`config.ai.container.type: 'sidebar'`) by removing default layout constraints:

  * Removed the default `min-height` from `.ck-ai-chat`,
  * Removed the default `height` from `.ck-tabs`,
  * Removed the default `width` from `.ck-ai-tabs`.

  Also, the `--ck-tabs-panels-container-width` custom property has been removed from the codebase.

## Update to CKEditor&nbsp;5 v47.0.0

Released on 1 October, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.0.0))

### CKEditor AI (early access)

We are introducing {@link features/ckeditor-ai-overview **CKEditor AI**}, a set of versatile AI-powered features that integrate directly into CKEditor 5. It brings generation, summarization, correction, contextual chat help, reviews, and many other capabilities, right into the editor. With **CKEditor AI**, users will no longer need to switch between the editor and AI tools.

Three features are available in this early access phase:

* **Chat:** a conversational AI for dynamic, multi-turn interactions that support various context sources, model selection, which can perform changes directly on the document.
* **Quick actions:** one-click transformations and instant insights for selected text.
* **Review:** automatic checks for grammar, tone, correctness, style, and more, with UX optimized for performing full-document review.

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

Please make sure that if you had a custom <kbd>Tab</kbd> handling implementation in your editor, it does not collide with the default one. Note that generic <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handlers are registered on the `low` priority bubbling event in the `context` of widgets and editable elements. For more details on bubbling events and contexts, please see the {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} guide.

### Bubbling events priorities fix

The {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} now trigger all event handlers according to the registered priorities, even if multiple custom callback contexts are provided. Previously, not all custom callback contexts were evaluated for a given element. The custom callback contexts were also triggered after the view element name handlers. Now those are all triggered according to the registered priority, regardless of context: element name-based or callback-based.

### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **UI:** dialogs in custom features can now be positioned programmatically with more flexible options (`Dialog#show()`).
* **Comments:** confirmation views for deleting comments and threads now use simplified CSS selectors (`.ck-confirm-view`). You may need to adjust custom styles accordingly.

### Major breaking changes in this release

With the release of {@link features/ckeditor-ai-overview **CKEditor AI**}, the `ai.*` configuration structure has changed. Until now, the configuration object was used for the former `AIAssistant` feature.

Now, this configuration space is used for all AI related features. Configuration for the `AIAssistant` was moved. The changes are: 
  * `ai.aiAssistant` -> `ai.assistant`,
  * `ai.useTheme` -> `ai.assistant.useTheme`,
  * `ai.aws` -> `ai.assistant.adapter.aws`,
  * `ai.openAI` -> `ai.assistant.adapter.openAI`.

### Minor breaking changes in this release

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The Widget feature implements the default handling for `Tab`/`Shift+Tab` to navigate nested editable elements in the editor content. Closes [#19083](https://github.com/ckeditor/ckeditor5/issues/19083). The listeners are registered on the `low` priority bubbling event in the context of widgets and editable elements.
  Please verify if your custom `Tab`/`Shift+Tab` handling does not collide with the default one.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The internal structure of the package has changed. Importing `AIAssistant` from the source should be done via `@ckeditor/ckeditor5-ai/src/aiassistant/aiassistant.js` path instead of the previous `@ckeditor/ckeditor5-ai/src/aiassistant.js`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Changed the CSS selectors used to style the confirmation view displayed when attempting to remove a comment or an entire comment thread. For now, CSS classes will be more generic, for example: `.ck-confirm-view` instead of `.ck-thread__remove-confirm`. If you override styles for these components, you will need to update the selectors.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: The `UndoCommandRevertEvent` type was renamed to `UndoRedoBaseCommandRevertEvent` and moved to the `basecommand.ts` file. Adjust your code if you have used this type in your custom integration. See [#19168](https://github.com/ckeditor/ckeditor5/issues/19168).
* Updated to TypeScript 5.3.