Changelog
=========

## [44.0.0](https://github.com/ckeditor/ckeditor5/compare/v43.3.1...v44.0.0) (December 2, 2024)

### Release Highlights

We are excited to introduce CKEditor 5 v44.0.0, a release packed with high impact updates designed to enhance your editing experience and simplify access to our premium offers. Here's what’s new:

#### 🚀 Self-service plans: Simplified access to premium features

We are introducing flexible self-service plans that put you in control with full transparency. Now, you can:

* [Choose the plan](https://ckeditor.com/pricing/) that fits your needs, pay only for what you use, and get started instantly with [a commitment-free trial](https://portal.ckeditor.com/checkout?plan=free).
* Seamlessly manage your license keys, track usage, and more in the new [**Customer Portal**](https://portal.ckeditor.com/).

💡 **Important for current users:**

If you are upgrading to v44.0.0+, ensure a smooth transition by updating your license keys in the editor, as we implemented a new format of the key. To get the new key, visit the [Customer Portal](https://portal.ckeditor.com/). You can also refer to our [license key and activation guide](https://ckeditor.com/docs//ckeditor5/latest/getting-started/licensing/license-key-and-activation.html) for help with logging in to the portal.

📣 The open-source licensing remains unchanged. However, `config.licenseKey` is now a required property in the editor configuration. Use `'GPL'` for installations under the GPL terms. Read more in the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-44.html).

#### 🔖 Bookmarks: Organize your content with ease

Say hello to [**Bookmarks**](https://ckeditor.com/docs/ckeditor5/latest/features/bookmarks.html), a long-awaited feature that simplifies content navigation within the editor. With this release, you can:

* Add anchors as reference points within text.
* Link to the newly created bookmarks in the editor to navigate to specific locations within complex documents, such as contracts or technical manuals.

📍 Future updates to Bookmarks and the linking experience are planned for the upcoming releases. Follow progress and share your feedback on [GitHub](https://github.com/ckeditor/ckeditor5/issues/17230).

#### ⚡ Performance improvements: Faster table rendering

The current release includes another stride towards improving the performance aspect of the editor, this time focusing on how tables are handled in the content. Implemented optimizations have made table rendering 3x faster, with the average load time of a document with a very long, complex tables dropping from around 4.5 seconds to just 1.5 seconds.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* `config.licenseKey` is now a required property in the editor configuration. Use `'GPL'` for installations under the GPL terms. See [#17317](https://github.com/ckeditor/ckeditor5/issues/17317).

### Features

* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: Introduced the Bookmarks feature. Closes [#1944](https://github.com/ckeditor/ckeditor5/issues/1944). ([commit](https://github.com/ckeditor/ckeditor5/commit/21c6f46f47a95866e759e0ce7834e1c91a9a92bf))

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: An in-text drop of an inline object with elements inside should be possible. Closes [#16101](https://github.com/ckeditor/ckeditor5/issues/16101). ([commit](https://github.com/ckeditor/ckeditor5/commit/e1093ebe9b029bf8fbc158470079b90e335b763c))
* **[cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services)**: Handle refresh token when editor destroyed during token fetching. Closes [#17462](https://github.com/ckeditor/ckeditor5/issues/17462). ([commit](https://github.com/ckeditor/ckeditor5/commit/9bd899ec20dbc21922cf46caa59f4d9dce100331))
* **[editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic)**: Excluded modal windows from the Classic Editor's integration between dialogs and the sticky toolbar. Closes [#17339](https://github.com/ckeditor/ckeditor5/issues/17339). ([commit](https://github.com/ckeditor/ckeditor5/commit/3ef74d9f3f44e866a93f747527f24af4bf6e2f1c))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: List markers should be visible after changing the list type from multi-level to numbered. Closes [#17488](https://github.com/ckeditor/ckeditor5/issues/17488). ([commit](https://github.com/ckeditor/ckeditor5/commit/e1e85cb4ac7d99db2b343b208d5d643a5dc47627))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed an editor crash after pasting over previously pasted content and undoing both actions. Closes [#17267](https://github.com/ckeditor/ckeditor5/issues/17267). ([commit](https://github.com/ckeditor/ckeditor5/commit/0a8d9d523a908a32f11ca322ed36dc6d75d8061c))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Find and replace no longer randomly jumps to the first found item after the replace operation. Closes [#16648](https://github.com/ckeditor/ckeditor5/issues/16648). ([commit](https://github.com/ckeditor/ckeditor5/commit/686f41636329f204b34a483ee091d2bdddc8750f))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Inserting or dropping a paragraph after the end of a list should not convert the paragraph to a list item. Closes [#17224](https://github.com/ckeditor/ckeditor5/issues/17224). ([commit](https://github.com/ckeditor/ckeditor5/commit/21c6f46f47a95866e759e0ce7834e1c91a9a92bf))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination line should be rendered properly on tables. Closes [ckeditor/ckeditor5#17158](https://github.com/ckeditor/ckeditor5/issues/17158).
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Remove existing restricted editing markers when setting new data to prevent marker resurrection. Closes [#9646](https://github.com/ckeditor/ckeditor5/issues/9646), [#16721](https://github.com/ckeditor/ckeditor5/issues/16721). ([commit](https://github.com/ckeditor/ckeditor5/commit/c66459d5013eab429b66196ca4463491e6f99a3f))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Letter descenders should not be clipped in the top-level menu bar categories. Closes [#17422](https://github.com/ckeditor/ckeditor5/issues/17422). ([commit](https://github.com/ckeditor/ckeditor5/commit/b8f2f87cb4230aee5060e6120a97e7c5013de1ee))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Export the `AttributeData`, `FormatData` and `Description` typings from package.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The menu or dropdown panels will no longer be placed in an incorrect position when a optimal position cannot be found. Closes [#17220](https://github.com/ckeditor/ckeditor5/issues/17220). ([commit](https://github.com/ckeditor/ckeditor5/commit/00e9a7f8dff63e789a35f0123eb99889dbbe69f9))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The dialog plugin should not handle <kbd>Esc</kbd> key press when default-prevented by the guest view. Closes [#17343](https://github.com/ckeditor/ckeditor5/issues/17343). ([commit](https://github.com/ckeditor/ckeditor5/commit/bf148979a2cf72c1f90dbc1254e642a3e6e072f4))
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: Editor should no longer crash when executing undo while an image is still being uploaded. ([commit](https://github.com/ckeditor/ckeditor5/commit/e29811f4919175f1aa02a0510b93936c9334b2d1))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Use binary search in `insertToPriorityArray()` for better performance when handling big tables. ([commit](https://github.com/ckeditor/ckeditor5/commit/2e416d27116121e190a605b51b0ec78ead4c4382))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: No longer scroll to the top of the document if pasted element is larger than scrollable editable. Closes [#17079](https://github.com/ckeditor/ckeditor5/issues/17079). ([commit](https://github.com/ckeditor/ckeditor5/commit/5cf9f9184f8e3c4b485ee6a119bb951a0c247aac))

### Other changes

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: The types of publicly exported plugins will now be correctly resolved when accessed using `editor.plugins.get`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The types of publicly exported plugins will now be correctly resolved when accessed using `editor.plugins.get`.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Editor will be switched to read-only mode when an unrecoverable error will be returned by Cloud Services server during real-time editing.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The types of publicly exported plugins will now be correctly resolved when accessed using `editor.plugins.get`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The types of publicly exported plugins will now be correctly resolved when accessed using `editor.plugins.get`.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The types of publicly exported plugins will now be correctly resolved when accessed using `editor.plugins.get`.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The `descriptionFactory` property will now be accessible publicly.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Suggestions of the same type that are not directly next to each other will no longer be represented as one suggestion in the UI.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Improved the performance of the `BodyCollection` DOM wrapper lookup by replacing `document.querySelector()` with a static element reference. ([commit](https://github.com/ckeditor/ckeditor5/commit/ce735cc8cb818c5d06cc192b2276e0d93c371843))

  Huge thanks to [Ben Demboski](https://github.com/bendemboski) for this contribution!
* Changes related to the introduction of self-service channel for CKEditor 5 Premium Features. See [#17317](https://github.com/ckeditor/ckeditor5/issues/17317). ([commit](https://github.com/ckeditor/ckeditor5/commit/5d0fe1e75677b63577d96cbecb1300284c76b24c))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/847a87991359156697047e31d266c828f8437aa0))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/44.0.0): v44.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/44.0.0): v43.3.1 => v44.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/44.0.0): v43.3.1 => v44.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/44.0.0): v43.3.1 => v44.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/44.0.0): v43.3.1 => v44.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/44.0.0): v43.3.1 => v44.0.0
</details>


## [43.3.1](https://github.com/ckeditor/ckeditor5/compare/v43.3.0...v43.3.1) (November 6, 2024)

We are happy to announce the release of CKEditor 5 v43.3.1.

### Release highlights

We had to revert a change introduced in `v43.3.0` related to the icons export in one of our packages. This was due to unforeseen TypeScript issues in some setups.

### Bug fixes

* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Reverted a change related to adding icons re-export. See [#17358](https://github.com/ckeditor/ckeditor5/issues/17358). ([commit](https://github.com/ckeditor/ckeditor5/commit/0eb14bee2c5250096f3dd718be599a0188437531))

### Other changes

* **[cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services)**: The `Token` class is now exported as a value instead of a type only. ([commit](https://github.com/ckeditor/ckeditor5/commit/b11d58b3cc235396ee9ab15f9b79daa6a1b04ee0))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/43.3.1): v43.3.0 => v43.3.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/43.3.1): v43.3.0 => v43.3.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/43.3.1): v43.3.0 => v43.3.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/43.3.1): v43.3.0 => v43.3.1
</details>


## [43.3.0](https://github.com/ckeditor/ckeditor5/compare/v43.2.0...v43.3.0) (October 29, 2024)

We are happy to announce the release of CKEditor 5 v43.3.0.

### Release highlights

#### Performance improvements

We have improved how the editor handles the document structure by making it more reliable and efficient to access specific elements and verify their positions.

* **Node index and offset caching**: The `Node` and `NodeList` elements now cache index and offset values, reducing the need for recalculations and significantly boosting overall performance during model operations.
* **Selection range validation**: The newly implemented `Position#isValid()` method is also utilized to better validate selection ranges, ensuring more consistent behavior in various editing scenarios.
* **Performance improvements in numbers**: The editor now loads content between **3x and, in some cases, up to 6x faster, depending on the type and size of the content**. For instance, where a specific 200-page document previously took almost 25 seconds to load, the time has now been reduced to just 3.5 seconds.

**We’re committed to ongoing performance enhancements**, so you can expect even faster, smoother experience in future updates.

#### **Export to Word watermark support**

A new configuration option has been added to include a watermark when exporting documents to Word, providing additional flexibility in document branding and protection.

#### Notable bug fixes and improvements

* **Suggestions retention on revision restore**: Suggestions are no longer lost in specific cases when restoring revisions with changes from multiple users. The revision tracking process has been improved to ensure that all operations, including markers, are handled and saved correctly during synchronization. This fix resolves issues where markers were previously not retained, ensuring consistent data handling in collaborative editing scenarios.
* **Action dropdown visibility fix**: Resolved an issue where the action dropdown remained hidden after permission changes on comments. The dropdown now properly reflects updated permissions, allowing users to interact with the available actions seamlessly.
* **AI command enhancements**:
	* Custom AI Commands are now correctly applied to individual dropdowns when only one group of comments is present, instead of the entire group.
	* Empty comment groups no longer render, improving UI clarity.
	* Fixed an issue where nested AI command menus would close unexpectedly when used within a balloon toolbar, preventing unintended behavior during selection.

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `getChildAtOffset()` method for `model.Element` and `model.DocumentFragment`. ([commit](https://github.com/ckeditor/ckeditor5/commit/d874050e08510019487e2f8cd7ebf7e1ad7a137e))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `Position#isValid()` method to check whether the position exists in the current model tree. ([commit](https://github.com/ckeditor/ckeditor5/commit/d874050e08510019487e2f8cd7ebf7e1ad7a137e))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Added a configuration setting for adding a watermark to generated documents.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Introduced the `RevisionTracker#getRevisionDocumentData()` and `RevisionTracker#getRevisionRootsAttributes()` methods to the public scope of the editor API. You can use them to retrieve document data saved with the revision.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Made `FocusTracker` extendable with other `FocusTracker` instances to allow logical focus tracking across separate DOM sub-trees (see [#17277](https://github.com/ckeditor/ckeditor5/issues/17277)). ([commit](https://github.com/ckeditor/ckeditor5/commit/8ca7301b8029967603ed744433740d9a0cde36fe))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Empty AI Assistant command groups should not render in the UI.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant command list should be flat when only one command group is available.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed an issue where the action dropdown remained hidden when permissions allowing actions on a comment changed.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The content of an inline object should be handled as a flow root so whitespaces should be trimmed as the content of an inline object element is inside a block element. Closes [#17199](https://github.com/ckeditor/ckeditor5/issues/17199). ([commit](https://github.com/ckeditor/ckeditor5/commit/9c8f6871c106c5e71ebaf7516d5ee05d7ceebeee))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Handle existing picture element correctly on `sources` downcast. ([commit](https://github.com/ckeditor/ckeditor5/commit/6257c7888b0c1ade3b8357081cf7d6895b73ae92))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: No longer crash editor after removing link from image when `LinkConfig#addTargetToExternalLinks: true` is set. Closes https://github.com/ckeditor/ckeditor5/issues/17252. ([commit](https://github.com/ckeditor/ckeditor5/commit/45523b7e348c5831a87823ba53d34903d01ce87c))
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Multi-level lists should display correctly in RTL mode for Decoupled Editor.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Improved pagination of large tables that are followed by block elements.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Suggestions are no longer lost in some scenarios when restoring revisions in real-time collaboration.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The dropdown menu component should not cause editor blur if used in a `BalloonToolbar` while the user hovers a nested menu. Closes [#17277](https://github.com/ckeditor/ckeditor5/issues/17277). ([commit](https://github.com/ckeditor/ckeditor5/commit/8ca7301b8029967603ed744433740d9a0cde36fe))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Made the page unscrollable while the modal is visible. Closes [#17093](https://github.com/ckeditor/ckeditor5/issues/17093). ([commit](https://github.com/ckeditor/ckeditor5/commit/926400fc56753731257cd7e79cf140260241387d))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Node index and offset related values are now cached in model `Node` and `NodeList` to improve performance. ([commit](https://github.com/ckeditor/ckeditor5/commit/d874050e08510019487e2f8cd7ebf7e1ad7a137e))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Exported link and unlink icons from the `ckeditor5-link` package. Closes [#17304](https://github.com/ckeditor/ckeditor5/issues/17304). ([commit](https://github.com/ckeditor/ckeditor5/commit/9decc1e96e35a4ecb5587b669b68a24de99764bb))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Disabled dragging support for modal windows in the `Dialog` plugin. Closes [#17290](https://github.com/ckeditor/ckeditor5/issues/17290). ([commit](https://github.com/ckeditor/ckeditor5/commit/6c160735b43ffb401577a50e63410da7cbc920c4))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Disabled positioning restrictions for modal windows caused by `config.ui.viewportOffset`. Closes [#17290](https://github.com/ckeditor/ckeditor5/issues/17290). ([commit](https://github.com/ckeditor/ckeditor5/commit/6c160735b43ffb401577a50e63410da7cbc920c4))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/43.3.0): v43.2.0 => v43.3.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/43.3.0): v43.2.0 => v43.3.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/43.3.0): v43.2.0 => v43.3.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/43.3.0): v43.2.0 => v43.3.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/43.3.0): v43.2.0 => v43.3.0
</details>


## [43.2.0](https://github.com/ckeditor/ckeditor5/compare/v43.1.1...v43.2.0) (October 2, 2024)

We are happy to announce the release of CKEditor 5 v43.2.0.

### Release highlights

#### Notable improvements

* **Operational Transformation Stability**: Significant changes have been made to the OT system, enhancing the undo functionality and real-time collaboration, especially in conflict resolution scenarios. These improvements ensure smoother editor operations during complex interactions.
* **Performance Improvements**: We have merged several community-driven performance enhancements (thanks @sunesimonsen), that optimize the editor’s core engine. While no changes to the editor’s logic were made, these updates improve overall efficiency and responsiveness.

#### More imports available via `ckeditor5` and `ckeditor5-premium-features` indexes

As users transition to new installation methods (v42.0.0+) with `ckeditor5` and `ckeditor5-premium-features` as the main packages, we are continuously addressing missing imports for less common classes, functions, types, and utilities, broadening their availability. Since our TypeScript rewrite (v37.0.0), imports can now be made directly through the package indexes, simplifying integration. As many users historically imported from `src`, we encourage you to try the new version and report any missing imports. In the future, we are considering removing `src` from published packages to reduce package size, so the more feedback we receive, the better and more stable API we will provide.

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the `usePassive` option to `DomEventObserver` that enables listening to passive events. Closes [#16412](https://github.com/ckeditor/ckeditor5/issues/16412). ([commit](https://github.com/ckeditor/ckeditor5/commit/a4882635f3654d578ee04fd0125f8c9f34feef7e))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: It is now possible to embed YouTube shorts. Closes [#17090](https://github.com/ckeditor/ckeditor5/issues/17090). ([commit](https://github.com/ckeditor/ckeditor5/commit/2b74a8aeb69e8e01823d6cb1d0fb752f1480ee4d))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Updated the "Powered by" link. ([commit](https://github.com/ckeditor/ckeditor5/commit/5c02fd75fb4f3b2e900fad2e08a6c9017e71fa97))

### Bug fixes

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Editing inline images using `CKBox` no longer changes and reinserts them simultaneously. Closes [#17056](https://github.com/ckeditor/ckeditor5/issues/17056). ([commit](https://github.com/ckeditor/ckeditor5/commit/90d69bffea3c7b7e77b0c83f2ff52d5843735047))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed incorrect marker handling in some scenarios involving undo and real-time collaboration, which earlier led to a `model-nodelist-offset-out-of-bounds` error. See [#9296](https://github.com/ckeditor/ckeditor5/issues/9296). ([commit](https://github.com/ckeditor/ckeditor5/commit/a639c3556e2ed73280b695f8c85ac3bcfc18286a))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed incorrect handling of merge changes during undo in some scenarios involving real-time collaboration, which earlier led to a `model-nodelist-offset-out-of-bounds` error. See [#9296](https://github.com/ckeditor/ckeditor5/issues/9296). ([commit](https://github.com/ckeditor/ckeditor5/commit/a639c3556e2ed73280b695f8c85ac3bcfc18286a))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed conflict resolution error, which led to editor crash in some scenarios where two users removed larger intersecting part of the content and used undo. See [#9296](https://github.com/ckeditor/ckeditor5/issues/9296). ([commit](https://github.com/ckeditor/ckeditor5/commit/a639c3556e2ed73280b695f8c85ac3bcfc18286a))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed incorrect undo behavior leading to an editor crash when a user pressed <kbd>Enter</kbd> key multiple times, then pressed backspace that many times, then undid all the changes. Closes [#9296](https://github.com/ckeditor/ckeditor5/issues/9296). ([commit](https://github.com/ckeditor/ckeditor5/commit/a639c3556e2ed73280b695f8c85ac3bcfc18286a))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Increased the specificity of the dropdown menu panel styles to address issues with incorrect `z-index` ordering. ([commit](https://github.com/ckeditor/ckeditor5/commit/3df198a12a50845dad58fd7cd31e54e670960579))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed scrolling in dropdowns when a block toolbar button is active. Closes [#17067](https://github.com/ckeditor/ckeditor5/issues/17067). ([commit](https://github.com/ckeditor/ckeditor5/commit/9bc0e49bc737b647621ecf1b1e980046a97ed0ca))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Increased the specificity of the dropdown menu panel styles to address issues with incorrect `z-index` ordering. ([commit](https://github.com/ckeditor/ckeditor5/commit/3df198a12a50845dad58fd7cd31e54e670960579))

### Other changes

* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles)**: Exported the `AttributeCommand` class. Closes [#17105](https://github.com/ckeditor/ckeditor5/issues/17105). ([commit](https://github.com/ckeditor/ckeditor5/commit/01d1396b5ae697aadcfe5e14867093229d396006))
* **[ckeditor5-premium-features](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckeditor5-premium-features)**: Marked the `ckeditor5` package as `peerDependencies`.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Performance improvements. Avoided creating unnecessary arrays. Closes [#17143](https://github.com/ckeditor/ckeditor5/issues/17143). ([commit](https://github.com/ckeditor/ckeditor5/commit/8a0dd4bd26f265a48bd8721107e847f2e5edd652))
* Exported several classes and utilities from various packages ([commit](https://github.com/ckeditor/ckeditor5/commit/84914c158e7245fde265b7cf18eec87e03b3301a)).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/43.2.0): v43.1.1 => v43.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/43.2.0): v43.1.1 => v43.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/43.2.0): v43.1.1 => v43.2.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/43.2.0): v43.1.1 => v43.2.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/43.2.0): v43.1.1 => v43.2.0
</details>


## [43.1.1](https://github.com/ckeditor/ckeditor5/compare/v43.1.0...v43.1.1) (September 25, 2024)

We are happy to announce the release of CKEditor 5 v43.1.1.

During a recent internal audit, we identified a Cross-Site Scripting (XSS) vulnerability in the CKEditor 5 clipboard package ([`CVE-2024-45613`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-rgg8-g5x8-wr9v)). This vulnerability could be triggered by a specific user action, leading to unauthorized JavaScript code execution, if the attacker managed to insert malicious content into the editor, which might happen with a very specific editor configuration.

This vulnerability affects **only** installations where the editor configuration meets the following criteria:

1. The [**Block Toolbar**](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#block-toolbar) plugin is enabled.
2. One of the following plugins is also enabled:
	* [**General HTML Support**](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) with a configuration that permits unsafe markup.
	* [**HTML Embed**](https://ckeditor.com/docs/ckeditor5/latest/features/html/html-embed.html).

You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-rgg8-g5x8-wr9v) and [contact us](https://ckeditor.com/contact/) if you have more questions.

Taking the occasion, we decided to introduce additional hardening to some parts of our codebase that introduce **theoretical and unexploitable issues**. Our security team confirmed that none of these issues were exploitable in a real scenario, however, we decided to fix them, in order to increase the overall security posture of our software.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/43.1.1): v43.1.0 => v43.1.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/43.1.1): v43.1.0 => v43.1.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/43.1.1): v43.1.0 => v43.1.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/43.1.1): v43.1.0 => v43.1.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
