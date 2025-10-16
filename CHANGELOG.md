Changelog
=========

## [47.1.0](https://github.com/ckeditor/ckeditor5/compare/v47.0.0...v47.1.0) (October 16, 2025)

We are happy to announce the release of CKEditor 5 v47.1.0.

### Release highlights

This release introduces a minor stability update, featuring focused fixes and UX improvements.

> [!NOTE]
> Breaking changes in CKEditor AI are allowed in the LTS Edition. [Learn more why.](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html#features-excluded-from-the-no-breaking-changes-guarantee-v47x)

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Simplified CSS for the CKEditor AI integration in a sidebar mode (`config.ai.container.type: 'sidebar'`) by removing default layout constraints:

  * Removed the default `min-height` from `.ck-ai-chat`,
  * Removed the default `height` from `.ck-tabs`,
  * Removed the default `width` from `.ck-ai-tabs`.

  Also, the `--ck-tabs-panels-container-width` custom property has been removed from the codebase.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the `config.ai.container.visibleByDefault` configuration option to allow for hiding the AI component on the editor initialization.

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed TypeScript errors when using the `AIChat` plugin caused by incompatible `constructor()` signatures.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The editor no longer throws an error when accepting or rejecting proposed changes in review mode for "Adjust length" and "Adjust tone and style" checks.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where balloons were displayed under the AI container in the overlay mode.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: "Chat commands" from AI Quick Actions could not be correctly used if the selection was collapsed (nothing was selected). Now, a collapsed selection is correctly expanded to the entire element, which includes the selection.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Quick Action buttons added to the editor toolbar and to the balloon toolbar will no longer gain focus on hover, which had led to incorrect UI behavior.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Changing the link's "displayed text" using the link contextual balloon resulted in incorrect changes if track changes were turned on. Closes [#19193](https://github.com/ckeditor/ckeditor5/issues/19193).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Images placed in tables should not affect the pagination calculations.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Revision history was showing incorrect revision data in a scenario where, for the same current revision, a user made a deletion before another user's deletion, in the same element.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved performance of the AI Chat prompt input field, which was lagging while typing if the AI Chat feed contained a very long conversation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Made the `config.ai.chat.models` configuration property optional because a default configuration is always provided by the plugin anyway.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Enabled keyboard navigation within the custom command form in AI Review.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added validation to the AI Review custom command form to disallow sending an empty prompt.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changes proposed by AI, which cannot be applied anymore due to other changes that happened in the document, will now be marked as outdated instead of throwing an error when interacted with.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved the title for AI Review parameterized and custom checks, so it is clear what parameters were used to run the review.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat will now display a message if the requested model is no longer available. This may happen, for example, when a conversation is loaded from the history.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIQuickActions` now adds `AIActions` plugin as its dependency. This is to ensure that the AI Quick Actions dropdown is populated by the default set of actions, without the need to add `AIActions` plugin manually.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.1.0): v47.0.0 => v47.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.1.0): v47.0.0 => v47.1.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.1.0): v47.0.0 => v47.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.1.0): v47.0.0 => v47.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.1.0): v47.0.0 => v47.1.0
</details>


## [47.0.0](https://github.com/ckeditor/ckeditor5/compare/v46.1.1...v47.0.0) (October 1, 2025)

We are happy to announce the release of CKEditor 5 v47.0.0.

### Release highlights

#### CKEditor AI (early access)

We are introducing [**CKEditor AI**](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html), a set of versatile AI-powered features that integrate directly into CKEditor 5. It brings generation, summarization, correction, contextual chat help, reviews, and many other capabilities, right into the editor. With **CKEditor AI**, users will no longer need to switch between the editor and AI tools.

Three features are available in this early access phase:

* **Chat:** a conversational AI for dynamic, multi-turn interactions that support various context sources, model selection, which can perform changes directly on the document.
* **Quick actions:** one-click transformations and instant insights for selected text.
* **Review:** automatic checks for grammar, tone, correctness, style, and more, with UX optimized for performing full-document review.

Each feature is powered by our state-of-the-art AI service, available in the Cloud today and coming soon for on-premises deployments. This makes CKEditor AI a true plug-and-play solution that works out of the box, eliminating the need for months of custom development.

CKEditor AI is available as part of our **free trial** in early access.

#### Long-term Support (⭐)

We are introducing the **CKEditor 5 LTS (Long-term Support) Edition**, giving teams up to 3 years of stability with guaranteed updates.

The first LTS release is **v47.0.0** (October 2025). It will receive **6 months of active development** with new features and fixes, then **2.5 years of maintenance** with security and critical compatibility updates.

For **v47.x**, the Maintenance phase starts in **April 2026**. From then, the next versions in the v47.x line will be available only under a **commercial LTS Edition license**. Therefore, starting in April, integrators without an LTS license should migrate to v48.x (the next regular release).

If you need long-term stability, [contact sales](https://ckeditor.com/contact-sales/) or read more about [CKEditor 5 LTS Edition](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html).

#### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **Widgets:** the default `Tab`/`Shift+Tab` navigation now works better inside nested editables, improving usability. This change is also reflected in the editor’s current widgets (like tables), leading to more intuitive keyboard navigation.
* **UI:** dialogs in custom features can now be positioned programmatically with more flexible options (`Dialog#show()`).
* **Comments:** confirmation views for deleting comments and threads now use simplified CSS selectors (`.ck-confirm-view`). You may need to adjust custom styles accordingly.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-47.html) to learn more about these changes.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Due to the release of the new AI feature, the `ai.*` configuration structure has changed. Until now, the configuration object was used for the former `AIAssistant` feature. Now, this configuration space is used for all AI related features. Configuration for the `AIAssistant` was moved. The changes are:
  * `ai.aiAssistant` -> `ai.assistant`,
  * `ai.useTheme` -> `ai.assistant.useTheme`,
  * `ai.aws` -> `ai.assistant.adapter.aws`,
  * `ai.openAI` -> `ai.assistant.adapter.openAI`.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The Widget feature implements the default handling for `Tab`/`Shift+Tab` to navigate nested editable elements in the editor content. Closes [#19083](https://github.com/ckeditor/ckeditor5/issues/19083). The listeners are registered on the `low` priority bubbling event in the context of widgets and editable elements. Please verify if your custom `Tab`/`Shift+Tab` handling does not collide with the default one.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The internal structure of the package has changed. Importing `AIAssistant` from the source should be done via `@ckeditor/ckeditor5-ai/src/aiassistant/aiassistant.js` path instead of the previous `@ckeditor/ckeditor5-ai/src/aiassistant.js`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Changed the CSS selectors used to style the confirmation view displayed when attempting to remove a comment or an entire comment thread. For now, CSS classes will be more generic, for example: `.ck-confirm-view` instead of `.ck-thread__remove-confirm`. If you override styles for these components, you will need to update the selectors.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: The `UndoCommandRevertEvent` type was renamed to `UndoRedoBaseCommandRevertEvent` and moved to the `basecommand.ts` file. Adjust your code if you have used this type in your custom integration. See [#19168](https://github.com/ckeditor/ckeditor5/issues/19168).
* Updated to TypeScript 5.3.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced **CKEditor AI**, a brand-new set of versatile AI-powered features, including: chat, quick actions, and document review capabilities.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `position` parameter in [`Dialog#show()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dialog_dialog-Dialog.html#function-show) now can be a function that takes `dialogRect` and `domRootRect` parameters and should return an object with `top` and `left` properties or `null`. It can be used to specify a custom positioning for the dialog. Closes [#19167](https://github.com/ckeditor/ckeditor5/issues/19167).

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The [`markerToHighlight()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcasthelpers-DowncastHelpers.html#function-markerToHighlight) converter did not clone the `view` configuration if passed as plain object leading to incorrect behavior. This affects only custom plugins that used this converter in the described way. Closes [#19105](https://github.com/ckeditor/ckeditor5/issues/19105).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The [bubbling events](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/event-system.html#listening-to-bubbling-events) now trigger event callbacks according to the registered priorities even if multiple custom contexts are provided. See [#19083](https://github.com/ckeditor/ckeditor5/issues/19083).
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Fix specificity calculation to handle `:where()` selectors correctly.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link manual decorators are no longer lost when caption is added to an image. Closes [#19024](https://github.com/ckeditor/ckeditor5/issues/19024).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination lines should calculate properly for pages with larger horizontal margins.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash which happened under specific circumstances when a revision was created when document was exported using the Cloud Services REST API (`GET /documents/` endpoint).

  Although the fix was necessary in Revision History feature code, it was only reproducible in scenarios involving using the mentioned export endpoint.

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Corrected types for the `resolvedBy` parameter in `CommentThread#resolve`. It was previously typed as `undefined | null`, and is now properly typed as `undefined | string`.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: `RedoCommand` will now fire `'revert'` event when executed, similarly to `UndoCommand`. Type `UndoCommandRevertEvent` was renamed to `UndoRedoBaseCommandRevertEvent` and moved to `basecommand.ts` file. Closes [#19168](https://github.com/ckeditor/ckeditor5/issues/19168).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.0.0): v46.1.1 => v47.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.0.0): v46.1.1 => v47.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.0.0): v46.1.1 => v47.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.0.0): v46.1.1 => v47.0.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.0.0): v46.1.1 => v47.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.0.0): v46.1.1 => v47.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.0.0): v46.1.1 => v47.0.0
</details>


## [46.1.1](https://github.com/ckeditor/ckeditor5/compare/v46.1.0...v46.1.1) (September 15, 2025)

We are happy to announce the release of CKEditor 5 v46.1.1.

### Release highlights

This is an internal release focused on improving our development infrastructure and the release process. These changes have no impact on integrators but represent significant improvements to our development workflow.

#### Development environment modernization

We have migrated our package management from Yarn Classic to pnpm, delivering substantial benefits:

* Faster installations through efficient linking mechanisms,
* Improved dependency management with stricter resolution and better peer dependency handling,
* Better disk efficiency by eliminating duplicate packages across projects.

We have also introduced dependency locking mechanisms that provide greater stability and predictability in our build process, ensuring consistent environments across development setups and CI/CD pipelines.

#### What this means for you

As an integrator, you will not notice any changes in functionality or API. This release maintains full backward compatibility while laying the foundation for more efficient development cycles and faster future releases.

If you fork the repository and develop using source code, you will need to update your development setup according to our [development environment guide](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/development-environment.html).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.1.1): v46.1.0 => v46.1.1

Releases containing new features:

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.1.1): v46.1.0 => v46.1.1

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.1.1): v46.1.0 => v46.1.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.1.1): v46.1.0 => v46.1.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.1.1): v46.1.0 => v46.1.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.1.1): v46.1.0 => v46.1.1
</details>


## [46.1.0](https://github.com/ckeditor/ckeditor5/compare/v46.0.3...v46.1.0) (September 10, 2025)

We are happy to announce the release of CKEditor 5 v46.1.0.

### Release highlights

#### Smoother drag & drop of widgets on iOS

We updated the implementation for more reliable drag-and-drop on iOS touch devices. The behavior on the desktop devices remains unchanged.

#### Pagination improvements

We reverted a low-level change to improve stability in pagination, especially in scenarios including long tables.

#### Hide a user in the Server-side editing API

[The Server-side editor API](https://ckeditor.com/docs/ckeditor5/latest/features/cloud-services/server-side-editor-api.html) now supports a `hidden_in_presence_list` user flag. You can use this mechanism to prevent automation script users from appearing in the editor’s presence list while scripts run.

### Comments’ markers clean up

We provided a better handling of edge cases where a marker points to a non-existing comment thread (for example, due to integrator mistakes). Such markers are now removed automatically to keep the editor stable.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: `CloudServicesCommentsAdapter#getCommentThread` no longer throws an error when a comment thread does not exist. Instead, it now returns `null`.

### Features

* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The user will not be displayed in the Presence List when a server-side editor API script is executed with the `hidden_in_presence_list` parameter.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table caption feature now has a configuration option [`table.tableCaption.useCaptionElement`](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tableconfig-TableCaptionConfig.html#member-useCaptionElement) that changes the HTML for table captions. With this option set to `true` the output HTML for table caption changes from `figure.table > figcaption` to `figure.table > table > caption`. Closes [#18988](https://github.com/ckeditor/ckeditor5/issues/18988).

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard), [engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Improved drag & drop of widgets with selection handle on iOS devices. Closes [#16335](https://github.com/ckeditor/ckeditor5/issues/16335).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Spaces at the end of list items are correctly preserved when saving and loading data. Closes [#18960](https://github.com/ckeditor/ckeditor5/issues/18960).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed an issue where the editor could crash if the selection was moved to a non-existent node during the blur event. Closes [#18744](https://github.com/ckeditor/ckeditor5/issues/18744).
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Editor no longer incorrectly adds an empty paragraph (that does not exist in data) when loaded data contains a block merge field with a marker (such as comment) on it.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Adjusted theme for `<caption>` vs `<figcaption>` element in tables. See [ckeditor/ckeditor5#18988](https://github.com/ckeditor/ckeditor5/issues/18988).
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Ensure consistent formatting of content pasted from Google Docs by replacing tab characters with spaces in preformatted text blocks. Closes [#18995](https://github.com/ckeditor/ckeditor5/issues/18995).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed an error that prevented previewing a revision that included a removed block merge field.
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Fixed an issue where the Uploadcare image uploader and editor did not work correctly with custom upload URLs or custom CDN canonical names.
* **[watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Fixed an issue where Watchdog incorrectly restored collaboration data (comment threads and suggestions) after a crash in load and save integrations. Closes [#19033](https://github.com/ckeditor/ckeditor5/issues/19033).
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Read-only mode no longer focuses the editor and displays UI when selecting nested editables. Closes [#18965](https://github.com/ckeditor/ckeditor5/issues/18965).

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Comment markers linked to non-existing threads are now removed automatically (instead of throwing an error) in real-time collaboration, ensuring the editor remains fully functional.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Error `track-changes-user-not-found` will now be thrown with additional data to help with debugging: `authorId` (the ID of the missing user) and `suggestionId` (the ID of the suggestion for which the error was thrown).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.1.0): v46.0.3 => v46.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.1.0): v46.0.3 => v46.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.1.0): v46.0.3 => v46.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.1.0): v46.0.3 => v46.1.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.1.0): v46.0.3 => v46.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.1.0): v46.0.3 => v46.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.1.0): v46.0.3 => v46.1.0
</details>


## [46.0.3](https://github.com/ckeditor/ckeditor5/compare/v46.0.2...v46.0.3) (September 3, 2025)

A Cross-Site Scripting (XSS) vulnerability has been discovered in the CKEditor 5 clipboard package (`CVE-2025-58064`). This vulnerability could be triggered by a specific user action, leading to unauthorized JavaScript code execution, if the attacker managed to insert malicious content into the editor, which might happen with a very specific editor configuration.

This vulnerability affects **only** installations where the editor configuration meets one of the following criteria:

* [HTML embed plugin](https://ckeditor.com/docs/ckeditor5/latest/features/html/html-embed.html) is enabled
* Custom plugin introducing an editable element which implements view [RawElement](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_rawelement-ViewRawElement.html) is enabled

You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-x9gp-vjh6-3wv6) and [contact us](https://ckeditor.com/contact/) if you have more questions.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.0.3): v46.0.2 => v46.0.3
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.0.3): v46.0.2 => v46.0.3
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.0.3): v46.0.2 => v46.0.3
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.0.3): v46.0.2 => v46.0.3
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
