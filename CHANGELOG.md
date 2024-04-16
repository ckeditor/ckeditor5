Changelog
=========

## [41.3.1](https://github.com/ckeditor/ckeditor5/compare/v41.3.0...v41.3.1) (April 16, 2024)

We are happy to announce the release of CKEditor 5 v41.3.1.

The release addresses a vulnerability identified in the [`protobuf.js`](https://www.npmjs.com/package/protobufjs) package ([`CVE-2023-36665`](https://nvd.nist.gov/vuln/detail/CVE-2023-36665)), used within our **[`@ckeditor/ckeditor5-operations-compressor`](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor)** package for real-time collaboration.

Our analysis confirms that **this vulnerability does not affect CKEditor 5**. None of the vulnerable code in the `protobuf.js` package is utilized in CKEditor 5, as we use protobuf’s `minimal` build type.

This release primarily aims to ensure that our customers using real-time collaboration features do not encounter unnecessary security alerts from their scanning tools. We are committed to maintaining the highest security standards, and this update reflects our ongoing efforts to safeguard user environments proactively.

### Bug fixes

* **[template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template)**: Fixed the `TemplateDefinition#data` type in the `@ckeditor/ckeditor5-template` config. Now, it should be possible to define a string or a function returning a string instead of just a function returning a string.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.3.1): v41.3.0 => v41.3.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.3.1): v41.3.0 => v41.3.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/41.3.1): v41.3.0 => v41.3.1
</details>


## [41.3.0](https://github.com/ckeditor/ckeditor5/compare/v41.2.1...v41.3.0) (April 10, 2024)

We are happy to announce the release of CKEditor 5 v41.3.0.

### Release highlights

#### Multi-level lists ⭐️

CKEditor 5's latest update brings a new premium feature: the [Multi-level lists](https://ckeditor.com/docs/ckeditor5/latest/features/lists/multi-level-lists.html) feature. It allows for easy creation and modification of numbered lists with counters (`1., 1.1., 1.1.1`), crucial for clear referencing and hierarchical organization in complex documents. The feature ensures compatibility with Microsoft Word. When lists with such formatting are pasted to the editor, the numbering format and counters are retained.

#### Paste from Office improvements for lists

No more breaking numbering of lists when they are pasted from Office. Previously whenever a list were split by paragraphs, the counter started again from 1. With our latest improvement, the counter is correctly preserved. Moreover, if you use Paste from Office Enhanced ⭐️, the paragraphs will be merged into list items, to ensure proper, semantic content.

⚠️ If you use the `LegacyList` plugin to prolong the migration to the new list implementation, bear in mind that from this release Paste from Office stops working for the lists' implementation you are using. Migrate to `List` to maintain pasting lists functionality.

#### Menu bar

The menu bar is a user interface component popular in large editing desktop and online packages. It gives you access to all features provided by the editor, organized in menus and categories and improves usability of the editor, keeping the toolbar can be simple and tidy. This is especially welcome in heavily-featured editor integrations. 

Current release bring this battle-hardened solution to CKEditor 5! The [menu bar](https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/menubar.html) can easily be enabled in selected editor types, comes with a handy features preset and is also highly configurable.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The CSS custom property `--ck-color-image-caption-highligted-background` has been renamed to `--ck-color-image-caption-highlighted-background`. Please make sure to update your custom CSS accordingly.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The username displayed next to the user marker in the edited content is no longer a CSS pseudo-element. Use the `.ck-user__marker-tooltip` CSS class to customize usernames instead.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: When `config.ai.openAI.requestParameters` or `config.ai.aws.requestParameters` are set, the set value will fully overwrite the default value. Most importantly, if you do not specify some properties in `requestParameters` they will not be set to default. For example, if you set `openAI.requestParameters` to `{ max_tokens: 1000 }`, the request parameters will be set exactly to that object. Make sure that you pass all necessary parameters in `requestParameters`. Important: this change happened in version 41.2.0 but has not been previously announced in the changelog.
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: The `FileDialogButtonView` class has been moved from `ckeditor5-upload` to `ckeditor5-ui`. Please update your import paths accordingly (was: `import { FileDialogButtonView } from 'ckeditor5/src/upload.js';`, is: `import { FileDialogButtonView } from 'ckeditor5/src/ui.js';`).
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The default vertical spacing around `ButtonView` in `ListItemView` (`--ck-list-button-padding`) has been reduced for better readability. This affects the presentation of various editor features that use this type of UI (headings, font size, font family, etc.). You can restore the previous value by setting `--ck-list-button-padding: calc(.2 * var(--ck-line-height-base) * var(--ck-font-size-base)) calc(.4 * var(--ck-line-height-base) * var(--ck-font-size-base));` in your custom styles sheet.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: From this release on, the UI of the Comments Archive feature is displayed in a dialog instead of a dropdown.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The UI for saving the new revision is displayed in a dialog instead of a dropdown.

### Features

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Partially selected comment markers will no longer be copied unless fully selected, regardless of the copy mode set in the configuration.
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Introduced the multi-level list with legal style list numbering.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Introduced the multi-level list with legal style list numbering.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `[tabindex]` DOM attribute support to the `InputBase` class. ([commit](https://github.com/ckeditor/ckeditor5/commit/5a399811c3c21644f1b6e782236b60e6d2097add))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `[aria-label]` attribute support to the `InputBase` class. ([commit](https://github.com/ckeditor/ckeditor5/commit/952cd7599bf623ea2a9be92dbde1a01e8ff73daa))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Implemented the application menu bar that contains various options and commands for controlling and navigating the editor. Closes [#15894](https://github.com/ckeditor/ckeditor5/issues/15894). ([commit](https://github.com/ckeditor/ckeditor5/commit/f072048026c5407467e343c116c71ff5a9d236b4))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Added the <kbd>Page Up</kbd> and <kbd>Page Down</kbd> keys to the keyboard utilities (`keyCodes`, `getEnvKeystrokeText()`). ([commit](https://github.com/ckeditor/ckeditor5/commit/0c64f2abda6a25ca0cd76c3ca7995b75f57d3104))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Increased the priority of AI selection markers to display them over the overlapping comments.
* **[alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment)**: Tooltips for buttons inside the alignment dropdown should not obscure adjacent buttons. Closes [#16109](https://github.com/ckeditor/ckeditor5/issues/16109). ([commit](https://github.com/ckeditor/ckeditor5/commit/64b51c47fe27354aac4795c699f7a19a86ac5242))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed issue causing the editor to throw `collection-add-item-invalid-index` error in some scenarios when some comment threads were resolved and some were unlinked (removed from content).
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Should not throw errors while pasting and cutting in document outline feature.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Copying the content with markers will no longer trigger the `change:data` event. Closes [#15943](https://github.com/ckeditor/ckeditor5/issues/15943). ([commit](https://github.com/ckeditor/ckeditor5/commit/39a77912905694a61e8da4c42dd1b36f76fde400))
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: An accessible button label should describe the state and the name of the feature for optimal UX. ([commit](https://github.com/ckeditor/ckeditor5/commit/571bcf5d0224ffe97037c92391cab3c78dc54820))
* **[language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language)**: An accessible button label should describe the state and the name of the feature for optimal UX. ([commit](https://github.com/ckeditor/ckeditor5/commit/571bcf5d0224ffe97037c92391cab3c78dc54820))
* **[minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap)**: The minimap should not steal DOM focus while tabbing across the document. ([commit](https://github.com/ckeditor/ckeditor5/commit/54eae6a1bb1a72d42f00b43fcf7f7f0b167507ba))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination navigation buttons should both scroll the document and move the selection (accessibility). Added keyboard shortcuts for navigating through the document.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination page number input should not participate in web page navigation on tab key press to comply with WCAG recommendations (see [ckeditor/ckeditor5#16025](https://github.com/ckeditor/ckeditor5/issues/16025)).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The current page input in the toolbar should be accessible to screen readers. See [ckeditor/ckeditor5#16028](https://github.com/ckeditor/ckeditor5/issues/16028).
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: The paste from Office feature should not break the list on the following blocks in the same list item or deduce a start attribute for a split list. Closes [#11210](https://github.com/ckeditor/ckeditor5/issues/11210), [#15964](https://github.com/ckeditor/ckeditor5/issues/15964). ([commit](https://github.com/ckeditor/ckeditor5/commit/a25e3f2a7e3c3d94ac04bbf900ff2de739c1939f))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Users should be able to move the mouse cursor to the user name displayed next to the user marker and dismiss it using the <kbd>Esc</kbd> key.
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: It should be possible to remove an image placed inside an editable field in restricted editing mode. Closes [#15521](https://github.com/ckeditor/ckeditor5/issues/15521). ([commit](https://github.com/ckeditor/ckeditor5/commit/b4f159c00831fefd3b99afd4c362a2f1d8f4aa63))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Users should be able to move the mouse cursor to a UI tooltip without closing it. ([commit](https://github.com/ckeditor/ckeditor5/commit/7df13e970b56542b43b723bec8b4cbcb877a32a4))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Users should be able to close UI tooltips using the <kbd>Esc</kbd> key. ([commit](https://github.com/ckeditor/ckeditor5/commit/7df13e970b56542b43b723bec8b4cbcb877a32a4))
* **[watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: `EditorWatchdog` will no longer crash when the application is refreshed before completing the editor initialization or destruction. Closes [#15980](https://github.com/ckeditor/ckeditor5/issues/15980). ([commit](https://github.com/ckeditor/ckeditor5/commit/90aeb2765b1f34f3894b4299ae805ef27869b6ff))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Native browser `tab` key support should be disabled for cycling nested editable elements inside the editor. Closes [#15506](https://github.com/ckeditor/ckeditor5/issues/15506). ([commit](https://github.com/ckeditor/ckeditor5/commit/e55c6c1cf7309584fa6babc214e6fa339f6b0798))

### Other changes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: By default, markers will not be copied if they are only partially selected. ([commit](https://github.com/ckeditor/ckeditor5/commit/39a77912905694a61e8da4c42dd1b36f76fde400))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: In the default copy comments mode, markers that have been copied will not be pasted if they already exist in the document.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Clarified the description of keystrokes that execute various buttons (Space, Enter) in the accessibility help dialog. ([commit](https://github.com/ckeditor/ckeditor5/commit/2b908136e567723ed7de86fb5642d22643be6c65))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Introduced the multi-level list with legal style list numbering. Closes [#10859](https://github.com/ckeditor/ckeditor5/issues/10859). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a4a8e5c91224f34088f8f38b5d489fa4c37d0a))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Fixed a typo in the name of CSS custom property for the highlighted state of an image caption. ([commit](https://github.com/ckeditor/ckeditor5/commit/e9f0c137619b828ccb5a8e1611f4076f2ec852a6))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introduced the multi-level list with legal style list numbering. Closes [#10859](https://github.com/ckeditor/ckeditor5/issues/10859). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a4a8e5c91224f34088f8f38b5d489fa4c37d0a))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Export MentionsView, MentionListItemView, DomWrapperView classes and MentionFeedObjectItem type. Closes [#16044](https://github.com/ckeditor/ckeditor5/issues/16044). ([commit](https://github.com/ckeditor/ckeditor5/commit/9a62fc866f34bf5846fabe9afa5069546e9b582a))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Introduced the multi-level list with legal style list numbering. Closes [#10859](https://github.com/ckeditor/ckeditor5/issues/10859). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a4a8e5c91224f34088f8f38b5d489fa4c37d0a))
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: Introduced the multi-level list with legal style list numbering. Closes [#10859](https://github.com/ckeditor/ckeditor5/issues/10859). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a4a8e5c91224f34088f8f38b5d489fa4c37d0a))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/3e535fd8762313e74d5701b2e3da8b1656d011b2), [commit](https://github.com/ckeditor/ckeditor5/commit/f4c1dfca44f78409b8ee5de6be99921fcecb6f9c))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/41.3.0): v41.3.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.3.0): v41.2.1 => v41.3.0

Releases containing new features:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.3.0): v41.2.1 => v41.3.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.3.0): v41.2.1 => v41.3.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.3.0): v41.2.1 => v41.3.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/41.3.0): v41.2.1 => v41.3.0
</details>


## [41.3.0-alpha.4](https://github.com/ckeditor/ckeditor5/compare/v41.3.0-alpha.1...v41.3.0-alpha.4) (April 2, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.3.0-alpha.4.

This release is intended to improve the build speed in bundlers when using the `ckeditor5` npm package and to improve typings for translations.

For instructions on how to use the new installation methods, see the [v41.3.0-alpha.0 Release Notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.3.0-alpha.0).

For more general information about the new installation methods, see the [announcement post](https://github.com/ckeditor/ckeditor5/issues/15502).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/41.3.0-alpha.4): v41.3.0-alpha.4

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.3.0-alpha.4): v41.2.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.3.0-alpha.4): v41.3.0-alpha.1 => v41.3.0-alpha.4
</details>


## [41.3.0-alpha.3](https://github.com/ckeditor/ckeditor5/compare/v41.3.0-alpha.1...v41.3.0-alpha.3) (April 2, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.3.0-alpha.3.

This release is intended to improve the build speed in bundlers when using the `ckeditor5` npm package and to improve typings for translations.

For instructions on how to use the new installation methods, see the [v41.3.0-alpha.0 Release Notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.3.0-alpha.0).

For more general information about the new installation methods, see the [announcement post](https://github.com/ckeditor/ckeditor5/issues/15502).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/41.3.0-alpha.3): v41.3.0-alpha.3

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.3.0-alpha.3): v41.2.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.3.0-alpha.3): v41.3.0-alpha.1 => v41.3.0-alpha.3
</details>


## [41.3.0-alpha.2](https://github.com/ckeditor/ckeditor5/compare/v41.3.0-alpha.1...v41.3.0-alpha.2) (April 2, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.3.0-alpha.2.

This release is intended to improve the build speed in bundlers when using the `ckeditor5` npm package and to improve typings for translations.

For instructions on how to use the new installation methods, see the [v41.3.0-alpha.0 Release Notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.3.0-alpha.0).

For more general information about the new installation methods, see the [announcement post](https://github.com/ckeditor/ckeditor5/issues/15502).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/41.3.0-alpha.2): v41.3.0-alpha.2

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.3.0-alpha.2): v41.2.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.3.0-alpha.2): v41.3.0-alpha.1 => v41.3.0-alpha.2
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
