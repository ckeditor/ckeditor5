Changelog
=========

## [44.3.0](https://github.com/ckeditor/ckeditor5/compare/v44.2.1...v44.3.0) (March 5, 2025)

We are happy to announce the release of CKEditor 5 v44.3.0.

### Release Highlights

This release brings a couple of minor improvements and bug fixes:

* **Link Decorators:** We fixed the behavior of the multiple manual link decorators that set the `rel` attribute. The fix happened so deep in the engine that we improved the overall performance of the editor slightly as well.
* **Added a new `EmptyBlock` plugin:** From now on, new plugin prevents adding `&nbsp;` to the output data of blocks, works similarly to the [`fillEmptyBlocks`](https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fillEmptyBlocks) configuration in CKEditor 4.
* **Support for the `<hr>` element in the [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) plugin enhanced:** attributes of the `<hr>` element are now properly preserved if configuration allows it.
* **Emoji:** We enhanced emoji support for better compatibility with users' older devices.

For more details, see the changelog below.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ViewConsumable.consumablesFromElement()` is removed and replaced with the `view.Element#_getConsumables()` internal method. You should use `ViewConsumable.createFrom()` to create consumables if needed.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ViewElementConsumables` now accepts and outputs only normalized data. The `ViewConsumable` still accepts normalized or non-normalized input.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `Matcher#match()` and `Matcher#matchAll()` output is now normalized. The `MatchResult#match` now contains normalized data compatible with changes in the `ViewConsumable`.

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Export the `SchemaContext` class from package. Closes https://github.com/ckeditor/ckeditor5/issues/18003. ([commit](https://github.com/ckeditor/ckeditor5/commit/4d64fda926e490151ef84eb8dc1c6d86d8eb69ad))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added support for the `<hr>` element. Closes [#12973](https://github.com/ckeditor/ckeditor5/issues/12973). ([commit](https://github.com/ckeditor/ckeditor5/commit/d6e50d1317d9290fe14fd8a63ff024888f7a84ee))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Add the `EmptyBlock` plugin that prevents adding `&nbsp;` to output data. ([commit](https://github.com/ckeditor/ckeditor5/commit/602d4e1fcbe78ce9fd2fa02435995346aaea70eb))

### Bug fixes

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: User initials will now be generated based on the words that start with letters, ensuring that only valid alphabetic characters are used in the initials.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Annotations will no longer be lost during real-time collaboration when a user removes and immediately reverts (undo) content containing comment markers.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The editor will no longer crash when one user removes content containing a comment that another user is editing.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The link `[rel]` attribute will now allow mixing manual link decorators for the same attribute, as it will be now handled as a token list. Closes [#13985](https://github.com/ckeditor/ckeditor5/issues/13985), Closes [#6436](https://github.com/ckeditor/ckeditor5/issues/6436). ([commit](https://github.com/ckeditor/ckeditor5/commit/3107be3d8485898621796b1e85d18472a8d64bb3))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Mention should not be wrapped with an additional `<span>` when GHS is enabled. Closes [#15329](https://github.com/ckeditor/ckeditor5/issues/15329). ([commit](https://github.com/ckeditor/ckeditor5/commit/3107be3d8485898621796b1e85d18472a8d64bb3))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed an issue where the first selected color was applied instead of the second selected color when using the font color picker for the first time after loading the page. Closes [#17069](https://github.com/ckeditor/ckeditor5/issues/17069). ([commit](https://github.com/ckeditor/ckeditor5/commit/a0b28c0dcd0d324ea33ee6fd55989fa95a079437))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Removing a nested editable does not remove an entire widget when the selection is placed at the beginning of that element. ([commit](https://github.com/ckeditor/ckeditor5/commit/1ef174c225aa9564472053713fe0933c49b35441))

### Other changes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Export the `viewToPlainText()` function. Closes [#17950](https://github.com/ckeditor/ckeditor5/issues/17950). ([commit](https://github.com/ckeditor/ckeditor5/commit/5616486488353c9f872b3a5e52d4cd4af2de08fc))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Introduced a new configuration option: `config.users.getInitialsCallback`. It allows providing a custom callback function for user initials generation.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Improved emoji support by expanding the range of versions compatible with users' devices. Closes [#18014](https://github.com/ckeditor/ckeditor5/issues/18014). ([commit](https://github.com/ckeditor/ckeditor5/commit/73193609a468a256e3b7bf300311ba94dad74cb0))
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Icons representing categories in the grid come from the same Unicode version to avoid rendering the non-supported ones. ([commit](https://github.com/ckeditor/ckeditor5/commit/73193609a468a256e3b7bf300311ba94dad74cb0))
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Introduced the `emoji.useCustomFont` option to disable the filtering mechanism. Closes [#18029](https://github.com/ckeditor/ckeditor5/issues/18029). ([commit](https://github.com/ckeditor/ckeditor5/commit/1bff10827168e85766835ad9e5776929ddd4ce08))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The whitespaces around a block filler (`&nbsp;`) are ignored while loading editor data. ([commit](https://github.com/ckeditor/ckeditor5/commit/602d4e1fcbe78ce9fd2fa02435995346aaea70eb))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/44.3.0): v44.2.1 => v44.3.0

Releases containing new features:

* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/44.3.0): v44.2.1 => v44.3.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/44.3.0): v44.2.1 => v44.3.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/44.3.0): v44.2.1 => v44.3.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/44.3.0): v44.2.1 => v44.3.0
</details>


## [44.2.1](https://github.com/ckeditor/ckeditor5/compare/v44.2.0...v44.2.1) (February 20, 2025)

We are happy to announce the release of CKEditor 5 v44.2.1.

During a recent internal audit, we identified a cross-site scripting (XSS) vulnerability in the CKEditor 5 real-time collaboration package ([`CVE-2025-25299`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-j3mm-wmfm-mwvh)). This vulnerability can lead to unauthorized JavaScript code execution and affects user markers, which represent users' positions within the document.

This vulnerability affects only installations with [real-time collaborative editing](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html) enabled.

You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-j3mm-wmfm-mwvh) and [contact us](mailto:security@cksource.com) if you have more questions.

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed a few scenarios for which creating a new comment thread was impossible (for example, when a selection was made on multiple table cells). This was a regression introduced in [v44.2.0](https://github.com/ckeditor/ckeditor5/releases/tag/v44.2.0).

### Other changes

* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Improved displaying usernames in the user marker.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/44.2.1): v44.2.0 => v44.2.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/44.2.1): v44.2.0 => v44.2.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/44.2.1): v44.2.0 => v44.2.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/44.2.1): v44.2.0 => v44.2.1
</details>


## [44.2.0](https://github.com/ckeditor/ckeditor5/compare/v44.1.0...v44.2.0) (February 12, 2025)

We are happy to announce the release of CKEditor 5 v44.2.0.

### Release Highlights

#### 🖥️ Enhanced Source Code Editing (⭐)

Introducing new premium feature: [Enhanced Source Code Editing](https://ckeditor.com/docs/ckeditor5/latest/features/source-editing/source-editing-enhanced.html). It displays the source code in a dialog and is compatible with all editor types. It offers syntax highlighting, code completion, code folding, and other advanced functionalities. Additionally, it supports both HTML and Markdown formats.

#### 📤 Uploadcare and image optimizer (⭐)

We have integrated the [Uploadcare](https://uploadcare.com/) image manager service, enabling you to upload and edit images to their cloud environment. You can upload files from various sources, including local devices, social media, or online drives ensuring rapid uploads. The integration takes care of efficient media delivery with responsive images mechanism, making sure your users will save bandwidth and have faster website loading. You can also optimize images with the built-in image editor which offers a range of features, such as cropping, rotating, flipping, photo filters and more. All this directly from the editor, [try it out](https://ckeditor.com/docs/ckeditor5/latest/features/file-management/uploadcare.html)!

#### 🖼️ Image Merge Fields (⭐)

[Image merge fields](https://ckeditor.com/docs/ckeditor5/latest/features/merge-fields.html#template-editing) are a new type of merge fields, dedicated for image placeholders. They maintain all standard image interactions, like styling, resizing or captions (in which you can use merge fields too!) At the same time, they keep all merge fields functionalities, like data previews or document export integration. In the document data, image merge fields are represented like other images, however their `src` attribute is set to a respective merge field, for example, `src="{{CompanyLogo}}"`, making them easy to post-process!

#### 📝 Track Changes Preview (⭐)

We have added the [preview mode](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes-preview.html) that displays a document with all suggestions accepted. Accessible from the track changes dropdown, this modal preview helps check the final content without extensive markers.

#### 😀 Emoji support

[They are here!](https://ckeditor.com/docs/ckeditor5/latest/features/emoji.html) 🎉 🥳 🎊 Insert emojis effortlessly in the editor by typing `:` or through a user-friendly emoji picker. This feature enhances the richness of your content by allowing quick access to a wide range of emojis.

#### ⚡ Performance improvements: Part 4

Here comes the final batch of the planned performance improvements in the editor loading speed area, that we worked on through a couple of past [releases](https://github.com/ckeditor/ckeditor5/releases).

* A new caching mechanism in `Mapper` now handles model-to-view mappings, substantially improving performance for loading and saving data.
* Images with specified height and width automatically use `[loading="lazy"]` in the editing area, optimizing the loading time ([read more on MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes)). This attribute is only applied during editing to enhance the loading efficiency of images, and it does not reflect in the final data output.

We are greatly satisfied with the improved editor loading times. At the same time, we acknowledge some other problematic areas, and we will keep delivering more performance-related improvements in the future.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Mapper#registerViewToModelLength()` is now deprecated and will be removed in one of the upcoming releases. This method is useful only in obscure and complex converters, where model element, or a group of model elements, are represented very differently in the view. We believe that every feature using a custom view-to-model length callback can be rewritten in a way that this mechanism is no longer necessary. Note: if this method is used, the caching mechanism for `Mapper` will be turned off which may degrade performance when handling big documents. Note: this method is used by the deprecated legacy lists feature. As a result, you will not experience the performance improvements if you are still using the deprecated legacy lists feature.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Starting this release, images that have `[height]` and `[width]` attributes set will automatically receive the `[loading="lazy"]` attribute in the editing area. This happens only for the content loaded into the editor, the data output produced by the editor remains the same. The reason for this change is to improve user experience in documents that may contain hundreds of images.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `lower-alpha` and `upper-alpha` list styles are now upcasted to `lower-latin` and `upper-latin` styles.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: The `MergeFieldsEditing#getLabel()` method will now return `null` instead of the merge field id if the merge field definition was not found or it did not contain the `label` property.
* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles)**: Elements which contains the `[style]` attribute with `word-wrap: break-word` will not be converted to `<code>`. See [#17789](https://github.com/ckeditor/ckeditor5/issues/17789).

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Comment threads will now be preserved when AI Assistant processes selected content with comments. This can be disabled through the [`ai.aiAssistant.preserveComments`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ai_aiassistant-AIAssistantConfig.html#member-preserveComments) flag. Note, that the actual result depends on the response provided by the AI model (AI model has to keep the comments markup in the response). Additionally, the copy-paste comments functionality must be enabled (configured by [`comments.copyMarkers`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_config-CommentsConfig.html#member-copyMarkers)).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The [`ai.aiAssistant.removeCommands`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ai_aiassistant-AIAssistantConfig.html#member-removeCommands) configuration now allows removing entire command groups.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: It is now allowed to specify which files chosen from CKBox are downloadable. Closes [#15928](https://github.com/ckeditor/ckeditor5/issues/15928). ([commit](https://github.com/ckeditor/ckeditor5/commit/bf21d480c18316f419eb19a3ab3c07615264557f))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Added the ability to detect paste events originating from the editor. Closes [#15935](https://github.com/ckeditor/ckeditor5/issues/15935). ([commit](https://github.com/ckeditor/ckeditor5/commit/0eeccbe89c6e307e921d429aaccab5a98ca406d9))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Passed information to the downcast converter when clipboard pipeline is used to allow for customization. Closes [#17745](https://github.com/ckeditor/ckeditor5/issues/17745). ([commit](https://github.com/ckeditor/ckeditor5/commit/06cf625fe7e5ccb77d59da63b37c13a315f57ce8))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The `viewToPlainText()` helper will now parse the view `RawElement` instances. Closes [#17746](https://github.com/ckeditor/ckeditor5/issues/17746). ([commit](https://github.com/ckeditor/ckeditor5/commit/06cf625fe7e5ccb77d59da63b37c13a315f57ce8))
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Created the Emoji feature. Closes [#17361](https://github.com/ckeditor/ckeditor5/issues/17361). ([commit](https://github.com/ckeditor/ckeditor5/commit/a9734adcb668b59105c85990333694dec5ed34a6))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Added a possibility to break the current block by `InsertImageCommand` with the `breakBlock` flag. Closes [#17742](https://github.com/ckeditor/ckeditor5/issues/17742). ([commit](https://github.com/ckeditor/ckeditor5/commit/06cf625fe7e5ccb77d59da63b37c13a315f57ce8))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Allowed to specify which list style types are shown in list type selector dropdown. Closes [#17176](https://github.com/ckeditor/ckeditor5/issues/17176). ([commit](https://github.com/ckeditor/ckeditor5/commit/ce64b2c2426558f3626c6373d3d478f7a62815c4))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Added support for the `lower-alpha` and `upper-alpha` list type highlighting in the list style properties buttons. Closes [#17424](https://github.com/ckeditor/ckeditor5/issues/17424). ([commit](https://github.com/ckeditor/ckeditor5/commit/2b2923a2829f413ea6772226fbb2686acbc5744e))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Allowed the [mention marker](https://ckeditor.com/docs/ckeditor5/latest/api/module_mention_mentionconfig-MentionFeed.html#member-marker) to be longer than 1 character. Closes [#17744](https://github.com/ckeditor/ckeditor5/issues/17744). ([commit](https://github.com/ckeditor/ckeditor5/commit/06cf625fe7e5ccb77d59da63b37c13a315f57ce8))
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Introduced the image merge fields.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Added the `[data-merge-field-name]` attribute in the editing pipeline.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Use the actual merge field value when they are copied from the editor in preview mode other than `$labels`.
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: Introduced the Enhanced Source Code Editing feature.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improve aria attributes in the table and cell align toolbars. Closes [#17722](https://github.com/ckeditor/ckeditor5/issues/17722). ([commit](https://github.com/ckeditor/ckeditor5/commit/9333cc94fa3db9b9c249cc342f82b3ee6755aa3c))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Introduced the final document preview for track changes. It allows to display the document with all suggestions accepted in the modal.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `.ck-with-instant-tooltip` class may now be used to display the tooltip without the delay. Closes [#17743](https://github.com/ckeditor/ckeditor5/issues/17743). ([commit](https://github.com/ckeditor/ckeditor5/commit/06cf625fe7e5ccb77d59da63b37c13a315f57ce8))
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: Added support for passing a callback to the `SimpleUploadConfig#headers` property. Closes [#15693](https://github.com/ckeditor/ckeditor5/issues/15693). ([commit](https://github.com/ckeditor/ckeditor5/commit/4517b1c97c4d7e0ca1bf5d0d6538227e5b7fe331))
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Introduced the Uploadcare integration.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Added a `collectStylesheets()` helper function to retrieve style sheets from the provided URLs. ([commit](https://github.com/ckeditor/ckeditor5/commit/5cda75f9dba03138e9d483e0287ef33f7fe59017))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The content generated by the AI Assistant will now be correctly inserted into tables when both "Replace" and "Insert below" actions are used.
* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles)**: The `Code` feature should not convert element with the `word-wrap: break-word`  style into the `<code>` tag. Closes [#17789](https://github.com/ckeditor/ckeditor5/issues/17789). ([commit](https://github.com/ckeditor/ckeditor5/commit/0b637cdda6fd13e0808fcbd43ea7ccc6d37de974))
* **[cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services)**: No longer keep refreshing token if the [`cloudServices.tokenUrl`](https://ckeditor.com/docs/ckeditor5/latest/api/module_cloud-services_cloudservicesconfig-CloudServicesConfig.html#member-tokenUrl) method failed in the initialization of the plugin. Closes [#17531](https://github.com/ckeditor/ckeditor5/issues/17531). ([commit](https://github.com/ckeditor/ckeditor5/commit/4896a62395ca5a64e4c2e03c0e121df1a3c82b88))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Unlinked comment threads created before the editor initialization are now correctly handled and displayed in the comments archive. This error was experienced in asynchronous integrations which are using the `Context` mechanism.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Do not allow editing content source via the source mode in the comments-only mode.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the name field tooltip in comments UI.
* **[editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic)**: Export `ClassicEditorUIView` from package. ([commit](https://github.com/ckeditor/ckeditor5/commit/9a8e24f0c88955f55432db802aa6f4d4f8101853))
* **[editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline)**: No longer crash while destroying the editor when the editable was manually detached before destroying. Closes [#16561](https://github.com/ckeditor/ckeditor5/issues/16561). ([commit](https://github.com/ckeditor/ckeditor5/commit/0a7cf7f618b72b2387e4632383c77cf817eb3c27))
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: No longer crash while destroying the editor when the editable was manually detached before destroying. Closes [#16561](https://github.com/ckeditor/ckeditor5/issues/16561). ([commit](https://github.com/ckeditor/ckeditor5/commit/0a7cf7f618b72b2387e4632383c77cf817eb3c27))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The insert image via URL dialog can now be submitted by pressing the <kbd>Enter</kbd> key. Closes [#16902](https://github.com/ckeditor/ckeditor5/issues/16902). ([commit](https://github.com/ckeditor/ckeditor5/commit/aa1ea784172b9b30a9cda351bd753116c6d937b2))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Trailing punctuation is no longer included in an autolinked URL. Closes [#14497](https://github.com/ckeditor/ckeditor5/issues/14497). ([commit](https://github.com/ckeditor/ckeditor5/commit/3ba31a7daa8ea0af082316c1ffd0cb6a3d052740))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The list style buttons should show proper list type after clicking list for the first time. ([commit](https://github.com/ckeditor/ckeditor5/commit/2b2923a2829f413ea6772226fbb2686acbc5744e))
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Multi-level lists should work when typing in Japanese.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Do not automatically convert the merge-fields-like text containing disallowed characters.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Properly handle block merge fields mixed with text during data upcast and pasting.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The Revision history feature sidebar header height now matches the height of the editor toolbar.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The Revision history feature loading overlay now overlaps images correctly.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Prevent a table corruption when setting editor data with `<th>` cells following `colspan` rows. Closes [#17556](https://github.com/ckeditor/ckeditor5/issues/17556), [#17404](https://github.com/ckeditor/ckeditor5/issues/17404). ([commit](https://github.com/ckeditor/ckeditor5/commit/fa2e16949daee3a21d3d8030111de44ba302215b))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Introduced the name field tooltip in suggestions UI.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Fixed not working two-step caret movement on iOS devices. Closes [#17171](https://github.com/ckeditor/ckeditor5/issues/17171). ([commit](https://github.com/ckeditor/ckeditor5/commit/e228617c6c196b4fd806fb5b06eee18386173ccf))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Tooltip will no longer show after quickly hovering and moving the mouse away before the tooltip shows. Closes [#16949](https://github.com/ckeditor/ckeditor5/issues/16949). ([commit](https://github.com/ckeditor/ckeditor5/commit/06cf625fe7e5ccb77d59da63b37c13a315f57ce8))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Destroying another editor instance while a modal is open will no longer unlock page scroll. Closes [#17585](https://github.com/ckeditor/ckeditor5/issues/17585). ([commit](https://github.com/ckeditor/ckeditor5/commit/c5143d01e36fcd7c8b4af60bc7c1c63d27f90dbe))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Extended `getEnvKeystrokeText()` with option to use it in the context of specified environment which allows to generate keystrokes text for different OS than the host one. ([commit](https://github.com/ckeditor/ckeditor5/commit/c7e22bdcaaa1e513c49b17be422d5619e3a01689))
* Treat types as production dependencies. Fixes [#17213](https://github.com/ckeditor/ckeditor5/issues/17213). ([commit](https://github.com/ckeditor/ckeditor5/commit/9e9f49c6983d157aee99c0151cf81816cce8ff44))
* Unify TypeScript declaration files. Fixes [#17575](https://github.com/ckeditor/ckeditor5/issues/17575) and [#17533](https://github.com/ckeditor/ckeditor5/issues/17533). ([commit](https://github.com/ckeditor/ckeditor5/commit/417c26173aabfc94e542e716b0a1343d2bf5015d))

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Exported the `AIAssistantUI` class and the `AIAssistantConfig`, `CommandDefinition` and `GroupDefinition` types.
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Exported the `ViewDocumentPasteEvent` type from the `@ckeditor/ckeditor5-clipboard` package. ([commit](https://github.com/ckeditor/ckeditor5/commit/a6f927e4a3334e6b13dc2e642c618163b6d39375))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Exported the `AddCommentThreadEventData` type.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Activating an annotation now scrolls to the target if it is out of view.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed the wrong `filter()` callback signature in `AnnotationsUIs#activate()`.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced dynamic caching in `Mapper` to improve view-to-model mapping performance, and as a result improve editor data load and data save performance. Closes [#17623](https://github.com/ckeditor/ckeditor5/issues/17623). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc4d23830a8c9a0ddefd76c31ac319d01818b93b))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: A new parameter `data` was added for the `change:children` event fired by `ViewElement` and `ViewDocumentFragment` when their children change. The `data` parameter is an object with the `index` property, which says at which index the change happened. Related to [#17623](https://github.com/ckeditor/ckeditor5/issues/17623). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc4d23830a8c9a0ddefd76c31ac319d01818b93b))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Mapper#registerViewToModelLength()` is now deprecated and will be removed in one of upcoming releases. Note: if this method is used, the caching mechanism for `Mapper` will be turned off which may degrade performance when handling big documents. Note: this method is used by the deprecated legacy lists feature. See [#17623](https://github.com/ckeditor/ckeditor5/issues/17623). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc4d23830a8c9a0ddefd76c31ac319d01818b93b))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Export `SchemaCompiledItemDefinition` type. Closes [#17783](https://github.com/ckeditor/ckeditor5/issues/17783). ([commit](https://github.com/ckeditor/ckeditor5/commit/2877d4b59b912e71a63187af9cfd68f5b6849148))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Improve performance of the placeholders. ([commit](https://github.com/ckeditor/ckeditor5/commit/b5f5341b244b43a7bf1905848ef03d5b347161f2))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Do not store non-document operation with batches. This improves memory efficiency for huge documents. Closes [#17678](https://github.com/ckeditor/ckeditor5/issues/17678). ([commit](https://github.com/ckeditor/ckeditor5/commit/a7c5425dfb63b49f95b7a2a08251a1b393e299e7))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Improve performance of `Selection#getSelectedBlocks` when selection contains block elements with many blocks inside (such as table). Closes [#17629](https://github.com/ckeditor/ckeditor5/issues/17629). ([commit](https://github.com/ckeditor/ckeditor5/commit/2a114f4df11ae39acf27302424a5900036e1d98a))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: Export `ColorSelectorDropdownView` type. Closes [#17783](https://github.com/ckeditor/ckeditor5/issues/17783). ([commit](https://github.com/ckeditor/ckeditor5/commit/2877d4b59b912e71a63187af9cfd68f5b6849148))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `[loading="lazy"]` attribute will be automatically added in editing view to images with the `height` and `width` attributes set to improve loading performance. ([commit](https://github.com/ckeditor/ckeditor5/commit/b5f5341b244b43a7bf1905848ef03d5b347161f2))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Skip already visited list elements during reconversion and post fixing for better performance. Fixes [#17625](https://github.com/ckeditor/ckeditor5/issues/17625). ([commit](https://github.com/ckeditor/ckeditor5/commit/9fe9a589f6e893120ced6ccebfb8640c2e76f7cc))
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: The `MergeFieldsEditing#refreshMergeFields()` method is now public and available for external use.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Remove the default values preview mode if there is none or the merge fields has a default value configured.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Display ellipsis if the merge field name does not fit the dropdown.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Do not wait for images with `[width]` and `[height]` attributes.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Do not wait for loading images that have `[width]` and `[height]` attributes set when calculating pages.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Export the `Sessions` class.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Changed how errors related to real-time collaboration are handled. Previously, the original error was always logged on the console, and a `realtimecollaborationclient-` error was thrown without information related to the original error. Now, the original error is not logged anymore. Instead, the `realtimecollaborationclient-` error includes the `data.originalError` property with the original error message. This way it is possible to save error details through a custom error logging mechanism. Note, that without any custom mechanism, the `realtimecollaborationclient-` error will still be unhandled and logged to the console.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The editor now switches to read-only mode if the real-time collaboration client crashes, ensuring that the user cannot further edit the document and no data is accidentally lost.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added Enhanced Source Code Editing as a default menu bar item, making it visible in the menu bar when the plugin is present in the editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/c7e22bdcaaa1e513c49b17be422d5619e3a01689))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Extended the dialog API to support custom keystroke handler options, allowing to override priorities of the keystroke callback and filter keystrokes based on arbitrary criteria. ([commit](https://github.com/ckeditor/ckeditor5/commit/546751c5aff50b89596638c1cffe017ed37792cc))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `ImageInsertUI#registerIntegration` method now supports handling an array of views for a specific integration type. This allows, for example, registering an `assetManager` integration with multiple sources like `Facebook` and `Instagram`, where each source has its own dedicated button. ([commit](https://github.com/ckeditor/ckeditor5/commit/546751c5aff50b89596638c1cffe017ed37792cc))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Exported the `DocumentColorCollection` class. Closes [#17783](https://github.com/ckeditor/ckeditor5/issues/17783). ([commit](https://github.com/ckeditor/ckeditor5/commit/2877d4b59b912e71a63187af9cfd68f5b6849148))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Extended key codes with the `End` and `Home` keys, enabling the use and display of shortcuts containing these keys in the UI. ([commit](https://github.com/ckeditor/ckeditor5/commit/c7e22bdcaaa1e513c49b17be422d5619e3a01689))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Exported the `add()` function. Closes [#17783](https://github.com/ckeditor/ckeditor5/issues/17783). ([commit](https://github.com/ckeditor/ckeditor5/commit/2877d4b59b912e71a63187af9cfd68f5b6849148))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/44.2.0): v44.2.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/44.2.0): v44.2.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/44.2.0): v44.2.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/44.2.0): v44.1.0 => v44.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/44.2.0): v44.1.0 => v44.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/44.2.0): v44.1.0 => v44.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/44.2.0): v44.1.0 => v44.2.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/44.2.0): v44.1.0 => v44.2.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/44.2.0): v44.1.0 => v44.2.0
</details>


## [44.1.0](https://github.com/ckeditor/ckeditor5/compare/v44.0.0...v44.1.0) (December 16, 2024)

We are pleased to announce the latest CKEditor 5 release, focusing on performance enhancements and key bug fixes to improve your editing and collaboration experience.

### Release Highlights

#### ⚡ **Performance enhancements: Part 3**

This release introduces another set of performance related improvements, focused on faster editor initialization for huge documents. The initialization time was lowered by further 15% to 45%, depending on the tested sample.

The combined improvements introduced in recent releases amount to around 65%-80% lower loading time in total, which means the editor will load 3-5x faster. As the gain is not linear, bigger documents see even better improvement (more than 10x faster).

Moreover, all these improvements positively impact document save time (`editor.getData()`), which should help with autosave issues, among others.

We still actively work in this area, so you may expect even more editor load and save efficiency improvements in the upcoming releases.

#### 🔨 **Bug Fixes and improvements**

* **Comments enhancements**:
    * **Data export options**: We introduced the `showCommentHighlights` option in `editor.getData()`, that changes the comment marker conversion, allowing for styling comments in the output. Perfect for showing what was commented in [Export to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html), for example.
    * **Inline mode improvements**: We addressed a problem where comment annotations in inline mode did not close properly when clicking elsewhere in the content.
    * **Thread management**: We resolved an issue where creating a new thread was not interrupted when the corresponding marker was removed from the content, ensuring better stability during collaborative editing.
* **Revision History update**:
    * **Restore functionality**: We disabled the ability to restore the current (edited, not saved) revision, as it represents current content, so there is nothing to restore. At the same time, using it led to some non-obvious behaviors.
* **Image handling**: We resolved an issue where images in the uploading state could be deleted when dragged and dropped within the editor. Keep dragging, even when it is not there 🙈.

### 🎄 **Happy holidays!**

As the holiday season approaches, we extend our warmest wishes to our community and users. Thank you for your continued support, and we look forward to bringing you further enhancements and exciting features in the coming year.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: `spliceArray` now modifies the target array and does not accept a fourth (`count`) argument.

### Features

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the `showCommentHighlights` option in `editor.getData()` method that changes the comment marker conversion and allows styling the comments in the output.

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Resolved an issue where creating a new thread was not interrupted when the corresponding marker was removed from the content, for example, by another user in real-time collaboration.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: When adding a comment in inline mode, the comment annotation will now close properly if you click elsewhere in the content.
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: It should be possible to search within content of inline widgets. Closes [#11162](https://github.com/ckeditor/ckeditor5/issues/11162). ([commit](https://github.com/ckeditor/ckeditor5/commit/f11133513d5dff837e71a4ba97b5b7d7ec7aa4e8))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Copying and pasting images in the uploading state is now possible. Closes [#16967](https://github.com/ckeditor/ckeditor5/issues/16967). ([commit](https://github.com/ckeditor/ckeditor5/commit/6c8c6bc8b4fb0a1b3a851258421f81fc8f41b312))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Surrounding spaces are no longer added to colors produced by hex inputs. Closes [#17386](https://github.com/ckeditor/ckeditor5/issues/17386). ([commit](https://github.com/ckeditor/ckeditor5/commit/e639cb6904b0459f239d84fedc2045b712019dd8))

### Other changes

* Introduced multiple general performance improvements in the [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list), and [`@ckeditor/ckeditor5-utils`](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils) packages, leading to 15%-45% lower editor loading time. Closes [#17641](https://github.com/ckeditor/ckeditor5/issues/17641).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Exported the `ensureSafeUrl()` function from the `@ckeditor/ckeditor5-link` package. ([commit](https://github.com/ckeditor/ckeditor5/commit/6e1d2898cda7ab518baaab77ef02360eb02a3284))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Disabled the ability to restore a currently edited (not saved) revision.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Icons (`IconView`) are no longer individually accessible by assistive technologies, improving overall accessibility. Closes [#17554](https://github.com/ckeditor/ckeditor5/issues/17554). ([commit](https://github.com/ckeditor/ckeditor5/commit/513f8d3f52b7ff3fdc80b89d4ca0cab06e65578a))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Change the implementation of `spliceArray()` to modify the target array for better performance. ([commit](https://github.com/ckeditor/ckeditor5/commit/fbf4a17f95bb48d8054c70e05012181edc766444))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/44.1.0): v44.0.0 => v44.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/44.1.0): v44.0.0 => v44.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/44.1.0): v44.0.0 => v44.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/44.1.0): v44.0.0 => v44.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/44.1.0): v44.0.0 => v44.1.0
</details>


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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
