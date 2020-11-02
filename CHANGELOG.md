Changelog
=========

## [23.1.0](https://github.com/ckeditor/ckeditor5/compare/v23.0.0...v23.1.0) (2020-10-29)

### Release highlights

We are happy to announce the release of CKEditor 5 v23.1.0.

This release introduces a new HTML embed feature and adds the list style feature to the document editor build.

It also comes with new API features:

* [The `data-cke-ignore-events` attribute in view element](https://github.com/ckeditor/ckeditor5/issues/4600) that prevents CKEditor from handling events fired in this element.
* [The `triggerBy` option](https://github.com/ckeditor/ckeditor5/issues/7956) that triggers element re-render.

Other than that, this release brings several bug fixes, to name a few:

* [Unsupported element causes a JavaScript error instead of being filtered out](https://github.com/ckeditor/ckeditor5/issues/8098).
* [<kbd>Backspace</kbd> does not remove all blocks in rare cases](https://github.com/ckeditor/ckeditor5/issues/8145).
* [List conversion throws an error if the list element is surrounded by raw text nodes](https://github.com/ckeditor/ckeditor5/issues/8262).
* [Opening the upload panel should focus the URL input](https://github.com/ckeditor/ckeditor5/issues/7896).
* [Validation for empty URL in the "Insert image via URL" dropdown](https://github.com/ckeditor/ckeditor5/issues/7917).
* [URLs with a `%` character are not transformed into media embeds](https://github.com/ckeditor/ckeditor5/issues/7488).

Please note that there are some **minor breaking changes**. Be sure to review them before upgrading.

<!-- TODO: Add a link to the blog post. -->

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Removed the `ensureParagraphInTableCell()` converter that corrected the model state after the conversion process. Now the model will be fixed (if needed) by the post-fixer (`injectTableCellParagraphPostFixer()`).
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `attachLinkToDocumentation()` helper was removed. To log errors with an attached documentation link to the console, use `logWarning()` and `logError()`.

### Features

* **[build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)**: Added the list style feature to the document editor build. Closes [#7941](https://github.com/ckeditor/ckeditor5/issues/7941). ([commit](https://github.com/ckeditor/ckeditor5/commit/606a44b1575a5ba6c7be7b0e2c89907d151c2742))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Elements with the `data-cke-ignore-events` attribute will not propagate their events to the CKEditor 5 API. Closes [#4600](https://github.com/ckeditor/ckeditor5/issues/4600). ([commit](https://github.com/ckeditor/ckeditor5/commit/04207f93f00a668bbe031d70ae7230f892428115))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced an automatic model-to-view reconversion by defining the `triggerBy` option for the `elementToElement()` conversion helper. Closes [#7956](https://github.com/ckeditor/ckeditor5/issues/7956). ([commit](https://github.com/ckeditor/ckeditor5/commit/a7c99732fd63008ada4f13c187df552a989291e1))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Introduced the HTML embed feature. Closes [#8204](https://github.com/ckeditor/ckeditor5/issues/8204). ([commit](https://github.com/ckeditor/ckeditor5/commit/b529537086966ac908a163bf9373d67d43383586))

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Model#deleteContent()` should properly remove content with multiple blocks selected. Closes [#8145](https://github.com/ckeditor/ckeditor5/issues/8145). ([commit](https://github.com/ckeditor/ckeditor5/commit/c4b3182722a8eea68d00b0250c8ac9388723a1b5))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Removed focus outline in the "insert image via URL" form. Closes [#7973](https://github.com/ckeditor/ckeditor5/issues/7973). ([commit](https://github.com/ckeditor/ckeditor5/commit/d3975f8436cee3f0e4c4cd39b4ee8c7816f15784))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The insert button in the insert image dropdown is now disabled when the URL input is empty. Closes [#7917](https://github.com/ckeditor/ckeditor5/issues/7917). ([commit](https://github.com/ckeditor/ckeditor5/commit/608baa9be5a1c8ae5600e8df9627c4f5b2cecef7))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The URL input field is now focused when the image dropdown is opened. Closes [#7896](https://github.com/ckeditor/ckeditor5/issues/7896). ([commit](https://github.com/ckeditor/ckeditor5/commit/25b3aec03dae39cfd68b039b6704ef2670ccbfda))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Improved the look of link balloon button separators on mobiles. Closes [#7704](https://github.com/ckeditor/ckeditor5/issues/7704). ([commit](https://github.com/ckeditor/ckeditor5/commit/6aecaf89c656f2fff126185833b8030618109f7d))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Pressing <kbd>Ctrl/Cmd</kbd>+<kbd>K</kbd> when `LinkCommand` is disabled no longer shows the link UI. Closes [#7919](https://github.com/ckeditor/ckeditor5/issues/7919). ([commit](https://github.com/ckeditor/ckeditor5/commit/242d21c67ecf71781beae4494472538d78c9636d))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The autolink feature now uses `link.defaultProtocol` if set. Closes [#8079](https://github.com/ckeditor/ckeditor5/issues/8079). ([commit](https://github.com/ckeditor/ckeditor5/commit/9a9f9c3671f1427c0c32784e43a3b1e5c0a5e6b7))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: List conversion does not throw an error if the list element is being surrounded by raw text nodes. Closes [#8262](https://github.com/ckeditor/ckeditor5/issues/8262). ([commit](https://github.com/ckeditor/ckeditor5/commit/e8b6f519d40bb0f18de988c82e72f023fba2ddfe))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Disabled the save button in the insert media dropdown when the input is empty. See [#7917](https://github.com/ckeditor/ckeditor5/issues/7917). ([commit](https://github.com/ckeditor/ckeditor5/commit/608baa9be5a1c8ae5600e8df9627c4f5b2cecef7))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: URLs with the `%` character are now allowed for embedding media. Closes [#7488](https://github.com/ckeditor/ckeditor5/issues/7488). ([commit](https://github.com/ckeditor/ckeditor5/commit/5f4c9b581c36bbe0c47782039f6d9376e408d638))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Enabled the media embed command when the selected media is in a table cell. Closes [#7604](https://github.com/ckeditor/ckeditor5/issues/7604). ([commit](https://github.com/ckeditor/ckeditor5/commit/f36fcba2cfde0d97c481bbedbbfe6b3d49f0b74a))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Pasting nested tables with content unsupported by the editor elements no longer throws an exception. Closes [#8098](https://github.com/ckeditor/ckeditor5/issues/8098). ([commit](https://github.com/ckeditor/ckeditor5/commit/c8e3a9480fbe2d638ac986f8d723aa89e62a82bc))

### Other changes

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table cell's content refreshing for the editing view now makes fewer view updates. ([commit](https://github.com/ckeditor/ckeditor5/commit/a7c99732fd63008ada4f13c187df552a989291e1))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Improved the readability of custom errors in the console. Closes [#8140](https://github.com/ckeditor/ckeditor5/issues/8140). ([commit](https://github.com/ckeditor/ckeditor5/commit/40801bae032916b99e3ea838543ef95045a481a6))
* Optimized icons. ([commit](https://github.com/ckeditor/ckeditor5/commit/dfc73c9875768d09ad1a64d68ec14ec15f9b0f66))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/6ec37b150ba09c3ad50a8e52fa1b594d58ae6d0d), [commit](https://github.com/ckeditor/ckeditor5/commit/445944d9b084c38a7366ce714017af8bea0ae70d))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v23.1.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v23.0.0 => v23.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v23.0.0 => v23.1.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v23.0.0 => v23.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v23.0.0 => v23.1.0
</details>


## [23.0.0](https://github.com/ckeditor/ckeditor5/compare/v22.0.0...v23.0.0) (2020-09-29)

### Release highlights

We are happy to announce the release of CKEditor 5 v23.0.0.

This release brings the new [pagination feature](https://ckeditor.com/blog/How-to-create-ready-to-print-documents-with-page-structure-in-WYSIWYG-editor---CKEditor-5-pagination-feature/).

Other than that, we focused on bug fixes and stability improvements. Some highlights are listed below:

* [Five bug fixes for list and list style plugins](https://github.com/ckeditor/ckeditor5/issues?q=is%3Aissue+milestone%3A%22iteration+36%22+label%3Atype%3Abug+label%3Apackage%3Alist).
* [The "upload image via URL" feature was extracted into a separate image insert plugin](https://github.com/ckeditor/ckeditor5/issues/7890).
* [Improvements for pasting as plain text using <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd>](https://github.com/ckeditor/ckeditor5/issues/7799).
* Fixed [a case where the link balloon toolbar would be mispositioned](https://github.com/ckeditor/ckeditor5/issues/7926) in some rare cases.

Please note that there are some **major breaking changes**. Be sure to review them before upgrading.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v23.0.0-with-pagination-feature-list-styles-and-improved-image-upload/

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: In order to use the "insert image via URL" feature you now need to load the `ImageInsert` plugin and use the `imageInsert` button instead of the `imageUpload` button that implemented this functionality previously.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: When pasting plain text, each double line break is now treated as a paragraph separator, while a single line break is converted into a soft break. Formerly, every single line break was treated as paragraph separation.

### Features

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Improved line to paragraph/soft break retention when pasting as plain text. Closes [#7884](https://github.com/ckeditor/ckeditor5/issues/7884). ([commit](https://github.com/ckeditor/ckeditor5/commit/a4b89965e8b156ee4ed67df9d4a634c0e6deac01))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Added a user-agent check for the Blink engine to the [`env`](https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_env-env.html) module. ([commit](https://github.com/ckeditor/ckeditor5/commit/a5a4b933e8ecef2b25ddbf03d371b89f26490025))
* Introduced the `PastePlainText` feature that detects pasting with <kbd>Ctrl/cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> keystroke. Closes [#7799](https://github.com/ckeditor/ckeditor5/issues/7799). ([commit](https://github.com/ckeditor/ckeditor5/commit/ab7bce94ebb7b6d59c5f3ea2d9433f71ddd864d2))

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The editor now properly places soft breaks in the plain text clipboard data representation. Closes [#8045](https://github.com/ckeditor/ckeditor5/issues/8045). ([commit](https://github.com/ckeditor/ckeditor5/commit/92ace8d7f3abe4c8247ca18697984eb538f3f5ec))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `model.History#getOperations()` method was returning incorrect values if history had operations with negative version numbers or version numbers differing by more than one. Closes [#8143](https://github.com/ckeditor/ckeditor5/issues/8143). ([commit](https://github.com/ckeditor/ckeditor5/commit/3433e9a8ad64cc971cdfa4658a84585b4e23f19e))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Aligned and fixed the styling for the split button in the `ImageInsert` dropdown. Closes [#7986](https://github.com/ckeditor/ckeditor5/issues/7986), [#7927](https://github.com/ckeditor/ckeditor5/issues/7927). ([commit](https://github.com/ckeditor/ckeditor5/commit/4671ed10a4af4c507abd594414771b714ff31cf7))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Manual decorators will no longer be corrupted by the link image plugin. Closes [#7975](https://github.com/ckeditor/ckeditor5/issues/7975). ([commit](https://github.com/ckeditor/ckeditor5/commit/73eacd641f38ee261cd43ddfdf98df5e22eb2fdd))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Prevented throwing an error when creating a link from a multi-block selection. Closes [#7907](https://github.com/ckeditor/ckeditor5/issues/7907). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb92cfb7377fa066a4cb08163ade33a73639aab1))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Pressing the <kbd>Enter</kbd> key should not throw an error when a non-collapsed selection ends with a valid URL. Closes [#7983](https://github.com/ckeditor/ckeditor5/issues/7983). ([commit](https://github.com/ckeditor/ckeditor5/commit/bcf3af6bee1edbd3a6d0c6874e0ad0518f73f518))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link balloon positioning should be correct when the selection is collapsed in some rare cases. Closes [#7926](https://github.com/ckeditor/ckeditor5/issues/7926). ([commit](https://github.com/ckeditor/ckeditor5/commit/b532a8ec55e1e1506b6f8030f944559b1cf0761d))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The list style plugin will no longer cause the editor to crash when indenting a list item that is the last element in the editor. Closes [#8072](https://github.com/ckeditor/ckeditor5/issues/8072). ([commit](https://github.com/ckeditor/ckeditor5/commit/3e6ea99fe28225c52092b621c3593748bb1c168e))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Undo will restore a proper value of the `list-style-type` attribute in the view element after undoing list merge. Closes [#7930](https://github.com/ckeditor/ckeditor5/issues/7930). ([commit](https://github.com/ckeditor/ckeditor5/commit/3e6ea99fe28225c52092b621c3593748bb1c168e))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Fixed a bug that prevented using the same list style for nested lists. Closes [#8081](https://github.com/ckeditor/ckeditor5/issues/8081). ([commit](https://github.com/ckeditor/ckeditor5/commit/3e6ea99fe28225c52092b621c3593748bb1c168e))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `listStyle` attribute should be inherited when inserting or replacing a `listItem` with the same list type (the `listType` attribute for the inserted or modified item is equal to the next or previous sibling list). Closes [#7932](https://github.com/ckeditor/ckeditor5/issues/7932). ([commit](https://github.com/ckeditor/ckeditor5/commit/03bf7211b1efc94ba087750f77006d534fdbaa5d))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: When removing the content between two lists items, these lists will be merged into a single list. The second list should adjust its `listStyle` attribute to the first list. Closes [#7879](https://github.com/ckeditor/ckeditor5/issues/7879). ([commit](https://github.com/ckeditor/ckeditor5/commit/7aa952823a8b182dc41075fa8cf4cc3a452eb78b))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fixed pasting a list with an empty item from Google Docs. Closes [#7958](https://github.com/ckeditor/ckeditor5/issues/7958). ([commit](https://github.com/ckeditor/ckeditor5/commit/ebf6bb798cb274c840df86de073cf511c66d876c))

### Other changes

* **[cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core)**: Change the token refreshing mechanism to depend on the token expiration time. ([commit](https://github.com/ckeditor/ckeditor5/commit/501490a5729c413ee00311fe3c9a965fab2bb2ad))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `config.image.upload.panel.items` option does not need to be set anymore in order to show the "insert image via URL form". It is enough to load the new `ImageInsert` plugin and use the new `imageInsert` button. See [#8034](https://github.com/ckeditor/ckeditor5/issues/8034). ([commit](https://github.com/ckeditor/ckeditor5/commit/48a9e943122e4cdd0e2647f03ebc7b17c402710e))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced `ImageInsert` as a standalone plugin that contains the `ImageUpload` functionality. Closes [#7890](https://github.com/ckeditor/ckeditor5/issues/7890). ([commit](https://github.com/ckeditor/ckeditor5/commit/4671ed10a4af4c507abd594414771b714ff31cf7))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `ImageUploadPanelView` form label should change depending on whether the image is selected or not. Closes [#7878](https://github.com/ckeditor/ckeditor5/issues/7878). ([commit](https://github.com/ckeditor/ckeditor5/commit/288fb97e00181a130dd2833d6e3aa74bdab5b7cc))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link plugin now comes with the autolink feature enabled by default. Closes [#7682](https://github.com/ckeditor/ckeditor5/issues/7682). ([commit](https://github.com/ckeditor/ckeditor5/commit/c9533f1752057fd833998a356282f8a625f4e39c))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Balloon panel arrows pointing down should have realistic shadows. Closes [#7928](https://github.com/ckeditor/ckeditor5/issues/7928). ([commit](https://github.com/ckeditor/ckeditor5/commit/1c0b5c978fc23f3ca5cccba7b89711469838c315))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/9256cbee9dc2173e1f1756fa566ba92a2d4bd6bc), [commit](https://github.com/ckeditor/ckeditor5/commit/08fc2a54b8953fe6000c900d8f1270b86edc1590))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v22.0.0 => v23.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v22.0.0 => v23.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v22.0.0 => v23.0.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v22.0.0 => v23.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v22.0.0 => v23.0.0
</details>


## [22.0.0](https://github.com/ckeditor/ckeditor5/compare/v21.0.0...v22.0.0) (2020-08-26)

### Release highlights

We are happy to announce the release of CKEditor 5 v22.0.0.

This release brings a few new features:

* The [list style plugin](https://github.com/ckeditor/ckeditor5/issues/7801).
* The [Markdown plugin](https://github.com/ckeditor/ckeditor5/issues/6007).
* [Inserting image with URL](https://github.com/ckeditor/ckeditor5/issues/7794).
* [A new event-based conversion API](https://github.com/ckeditor/ckeditor5/issues/7336).

Please note that there are some **major breaking changes**. Be sure to review them before upgrading.

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v22.0.0-with-inserting-images-via-url-list-styles-and-markdown-plugin/

### Collaboration features

The CKEditor 5 Collaboration Features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `view` and `model` callbacks of all one-way converter helpers (such as `editor.conversion.for( 'upcast' ).elementToElement()`, `editor.conversion.for( 'downcast' ).attributeToElement()`) now take the `conversionApi` as their second parameter. Previously, the second parameter was the downcast or upcast writer instance. Now, the writer needs to be retrieved from `conversionApi.writer`.<br><br>
An example migration snippet can be found in a [GitHub comment](https://github.com/ckeditor/ckeditor5/issues/7334#issuecomment-670450941).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `config.view` parameter for upcast element-to-element conversion helper configurations is now mandatory. You can retain the previous "catch-all" behavior for the upcast converter using the `config.view = /[\s\S]+/` value.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `tableCell` model element brought by the `TableEditing` plugin is no longer an object (`SchemaItemDefinition#isObject`) in the `Schema` but a selectable (`SchemaItemDefinition#isSelectable`). Please update your integration code accordingly. See [#6432](https://github.com/ckeditor/ckeditor5/issues/6432).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: It is now possible to override existing components when [adding new ones](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_componentfactory-ComponentFactory.html#function-add) to the [component factory](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_componentfactory-ComponentFactory.html) (previously an error was thrown). See [#7803](https://github.com/ckeditor/ckeditor5/issues/7803).

### Features

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Pasting a plain text will inherit selection attributes. Closes [#1006](https://github.com/ckeditor/ckeditor5/issues/1006). ([commit](https://github.com/ckeditor/ckeditor5/commit/2a163e389a6b22b1e5590fe6a2ed8204387d4350))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Options passed to `Editor#getData()` and `DataController#get()` are now available in downcast conversion under the `conversionApi.options` object. Closes [#7628](https://github.com/ckeditor/ckeditor5/issues/7628). ([commit](https://github.com/ckeditor/ckeditor5/commit/0a5d07e3c9a5cef51ebfb4a5819b5118ad9ae115))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the conversion API to upcast and downcast helpers. Closes [#7334](https://github.com/ckeditor/ckeditor5/issues/7334). ([commit](https://github.com/ckeditor/ckeditor5/commit/16c971198971b770d4e7aff4ea8eec7a88a6fcdb))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `SchemaItemDefinition#isSelectable` and `SchemaItemDefinition#isContent` properties. Closes [#6432](https://github.com/ckeditor/ckeditor5/issues/6432). ([commit](https://github.com/ckeditor/ckeditor5/commit/579c1c851ca33c78de60c98777684f8ee5ceb26e))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced new upcast `ConversionApi` helper methods: `conversionApi.safeInsert()` and `conversionApi.updateConversionResult()`. The new methods are intended to simplify writing event-based element-to-element converters. Closes [#7336](https://github.com/ckeditor/ckeditor5/issues/7336). ([commit](https://github.com/ckeditor/ckeditor5/commit/8d84af1610089ea7916401ecf6f636c9d330b459))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced the insert image via URL feature. Closes [#7794](https://github.com/ckeditor/ckeditor5/issues/7794). ([commit](https://github.com/ckeditor/ckeditor5/commit/bb00c23f6234751666e859e6e5d7e909f194e375))
* **[indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent)**: Block indentation is now recognized as a formatting attribute. Closes [#2358](https://github.com/ckeditor/ckeditor5/issues/2358). ([commit](https://github.com/ckeditor/ckeditor5/commit/6b2cc25dd717eb22caf7189d8cf33511397179c0))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introduced the list style feature that allows customizing the list marker. Closes [#7801](https://github.com/ckeditor/ckeditor5/issues/7801). ([commit](https://github.com/ckeditor/ckeditor5/commit/137dd2856aecaa8f9c023e6ca9d01592707137a0))
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Introduced the `Markdown` plugin. Closes [#6007](https://github.com/ckeditor/ckeditor5/issues/6007). ([commit](https://github.com/ckeditor/ckeditor5/commit/7cd5fc198e1977ecefbf0e455f4b514b467e7775))
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: The Markdown data processor was revamped and got the dependencies updated. Closes [#5988](https://github.com/ckeditor/ckeditor5/issues/5988). ([commit](https://github.com/ckeditor/ckeditor5/commit/3881349eae0c9a862e76487f8eb117d6ca3e38b0))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced the `Rect#getBoundingRect()` method that returns a `Rect` instance containing all the rectangles passed as an argument. Closes [#7858](https://github.com/ckeditor/ckeditor5/issues/7858). ([commit](https://github.com/ckeditor/ckeditor5/commit/ccfaf5e54854cc8a62ebbc005e35676f77be37c4))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced the `passive` option support in the `DomEmitterMixin#listenTo()` method. Closes [#7828](https://github.com/ckeditor/ckeditor5/issues/7828). ([commit](https://github.com/ckeditor/ckeditor5/commit/a7ef65c8246b9591a9a2081cfb19266de0c6194b))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Keyboard vertical navigation in text lines next to objects should move the caret to the position closest to the object. Closes [#7630](https://github.com/ckeditor/ckeditor5/issues/7630). ([commit](https://github.com/ckeditor/ckeditor5/commit/7984a14a411416634d64d405da2d6d18a314e947))

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Upcast conversion will now try to wrap text or inline elements in a paragraph in a place where they are not allowed but a paragraph is allowed. Closes [#7753](https://github.com/ckeditor/ckeditor5/issues/7753), [#6698](https://github.com/ckeditor/ckeditor5/issues/6698). ([commit](https://github.com/ckeditor/ckeditor5/commit/5e857fd0ec6f4dc9e86dec0bf9c5b87289eedf8b))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The selection will no longer inherit attributes from an empty inline element. Closes [#7459](https://github.com/ckeditor/ckeditor5/issues/7459). ([commit](https://github.com/ckeditor/ckeditor5/commit/1ddb955cc667ad16b41521762f77b95382f467da))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed a case where the link balloon would point to an invalid place after the browser scroll or resize. Closes [#7705](https://github.com/ckeditor/ckeditor5/issues/7705). ([commit](https://github.com/ckeditor/ckeditor5/commit/5158209e2a39884a3015e317f17f33a340e2502d))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Dropdown panels from the editor's main toolbar should always float above the contextual balloons from the editor's content. Closes [#7874](https://github.com/ckeditor/ckeditor5/issues/7874). ([commit](https://github.com/ckeditor/ckeditor5/commit/57d3f02958ad32b8c774dbdc38e1a1210e75af1f))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Balloon toolbar should reposition and ungroup items correctly when the window resizes. Closes [#6444](https://github.com/ckeditor/ckeditor5/issues/6444). ([commit](https://github.com/ckeditor/ckeditor5/commit/32523780fa27146d4f74b538af4831d8b9683bd9))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `Rect` utility returns wrong sizes in case of a sequenced range. Closes [#7838](https://github.com/ckeditor/ckeditor5/issues/7838). ([commit](https://github.com/ckeditor/ckeditor5/commit/ccfaf5e54854cc8a62ebbc005e35676f77be37c4))

### Other changes

* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Upgraded to Marked v1.1.1. Closes [#7850](https://github.com/ckeditor/ckeditor5/issues/7850). ([commit](https://github.com/ckeditor/ckeditor5/commit/d6c8731a33f3402b8bd71b987b762116efd3898a))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: The <kbd>Space</kbd> key will not confirm a mention selection from the list. Closes [#6394](https://github.com/ckeditor/ckeditor5/issues/6394). ([commit](https://github.com/ckeditor/ckeditor5/commit/a8d41ecbbeb5d36694ba74d0391805cfaa5214e7))
* **[remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format)**: Block formatting should be removed if the selection is inside that block. ([commit](https://github.com/ckeditor/ckeditor5/commit/6b2cc25dd717eb22caf7189d8cf33511397179c0))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `tableCell` model element brought by the `TableEditing` plugin is no longer an object (`SchemaItemDefinition#isObject`) in the `Schema` but a selectable (`SchemaItemDefinition#isSelectable`) (see [#6432](https://github.com/ckeditor/ckeditor5/issues/6432)). ([commit](https://github.com/ckeditor/ckeditor5/commit/579c1c851ca33c78de60c98777684f8ee5ceb26e))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Pressing <kbd>Shift</kbd>+<kbd>Tab</kbd> in the first table cell now selects the entire table. Closes [#7535](https://github.com/ckeditor/ckeditor5/issues/7535). ([commit](https://github.com/ckeditor/ckeditor5/commit/3064c64733145b40290480f3299e168b74380d04))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `clickOutsideHandler()` function will take into consideration that the editor can be placed in a shadow root while detecting a click. Closes [#7743](https://github.com/ckeditor/ckeditor5/issues/7743). ([commit](https://github.com/ckeditor/ckeditor5/commit/2dc026409051828618c274ae62ce331fe05681fe))

  Thanks to [@ywsang](https://github.com/ywsang).
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/fb260219a41e9342646878e619ddac17f680eabe), [commit](https://github.com/ckeditor/ckeditor5/commit/090c9f03d937998046d6fd27b6bbd1eaf101a8a0))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v21.0.0 => v22.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v21.0.0 => v22.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v21.0.0 => v22.0.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v21.0.0 => v22.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v21.0.0 => v22.0.0
</details>


## [21.0.0](https://github.com/ckeditor/ckeditor5/compare/v20.0.0...v21.0.0) (2020-07-28)

### Release highlights

We are happy to announce the release of CKEditor 5 v21.0.0.

This release packs quite a few all-around improvements, including:

* [A convenient UI for changing the image width to a predefined size](https://github.com/ckeditor/ckeditor5/issues/5201).
* [Autolinking URLs and e-mails in the editor content](https://github.com/ckeditor/ckeditor5/issues/4715).
* [Distinguishing between the inside and the outside of `<code>`](https://github.com/ckeditor/ckeditor5/issues/6722).
* [Better experience when replacing (typing over) a link text](https://github.com/ckeditor/ckeditor5/issues/4762).

We have also fixed a handful of bugs, for example:

* Calling the [`editor.setData()` method will now also clear the undo stack](https://github.com/ckeditor/ckeditor5/issues/4060).
* [Linking to a part of a to-do list item](https://github.com/ckeditor/ckeditor5/issues/5779).
* [Automatic link decorators in case of a linked image](https://github.com/ckeditor/ckeditor5/issues/7519).

Finally, we also took care of some of the developer experience-oriented improvements:

* [We changed marker conversion so that it does not break the HTML structure in some cases](https://github.com/ckeditor/ckeditor5/issues/7556).
* Introduced a new [`RawElement`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_rawelement-RawElement.html) class to make it simpler to [implement features like "embedding raw HTML"](https://github.com/ckeditor/ckeditor5/issues/4469).

Please note that there are some **major breaking changes**. Be sure to review them before upgrading.

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v21.0.0-with-autolink-and-export-to-word-released/

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* The `editor.setData()` method now clears the undo and redo stacks.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The [`Text#is()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_text-Text.html#function-is) and [`TextProxy#is()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_textproxy-TextProxy.html#function-is) methods (in the model and the view) now expect to be called with `'$text'` instead of `'text'` and `'$textProxy'` instead of `'textProxy'`.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `is()` method (e.g. [`Element#is()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_element-Element.html#function-is), [`Text#is()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_text-Text.html#function-is), [`AttributeElement#is()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_attributeelement-AttributeElement.html#function-is) or [`ContainerElement#is()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_containerelement-ContainerElement.html#function-is)) in both the model and the view no longer treats the first argument as an element name. To check the element name, use the second argument instead (`node.is( 'element', 'paragraph' )` instead of `node.is( 'paragraph' )`).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The marker-to-data conversion was revamped. The data format changed, the new conversion helpers were introduced and a new rule was implemented that a comma (`,`) is not allowed in the marker name. See the GitHub issue for a [walkthrough and example migration path](https://github.com/ckeditor/ckeditor5/issues/7556#issuecomment-665579653).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DomConverter#getParentUIElement()` method was renamed to [`DomConverter#getHostViewElement()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_domconverter-DomConverter.html#function-getHostViewElement) because now it supports both `UIElement` and `RawElement` (see [#4469](https://github.com/ckeditor/ckeditor5/issues/4469)).

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `bindTwoStepCaretToAttribute()` utility function was removed. Use `editor.plugins.get( TwoStepCaretMovement ).registerAttribute()` instead.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `findAncestor()` utility function was removed.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The parameters of `TableUtils#createTable()` have changed. Use the `options` object to pass the number of `rows` and `columns`.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `removeEmptyRows()` and `removeEmptyRowsColumns()` utility functions do not require the `batch` parameter anymore.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `downcastTableHeadingRowsChange()` downcast converter was removed. It is no longer possible to override the `headingRows` attribute change in a single converter. This behavior can be customized using the table downcast converter. See [#7601](https://github.com/ckeditor/ckeditor5/issues/7601).

### Features

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Block autoformat can also be triggered in blocks other than a paragraph. Closes [#6170](https://github.com/ckeditor/ckeditor5/issues/6170). ([commit](https://github.com/ckeditor/ckeditor5/commit/5866d4199dad1b70b5329c83dd4b3974716f04a5))
* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Enabled the autoformatting feature also for blocks that are not empty. ([commit](https://github.com/ckeditor/ckeditor5/commit/5866d4199dad1b70b5329c83dd4b3974716f04a5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Implemented the view `RawElement`. Added the `DowncastWriter#createRawElement()` method. Closes [#4469](https://github.com/ckeditor/ckeditor5/issues/4469). ([commit](https://github.com/ckeditor/ckeditor5/commit/bff38e366517a2801ffdd136bcff3afbfe671fd6))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DataController#set()` method is now decorated so plugins can listen to `editor.setData()` calls. ([commit](https://github.com/ckeditor/ckeditor5/commit/4a12d38094803f62d351e467a37ecba2b9c957fd))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced new marker conversion helpers that produce semantic HTML data output. See `DowncastHelpers#markerToData()` and `UpcastHelpers#dataToMarker()`. Closes [#7556](https://github.com/ckeditor/ckeditor5/issues/7556). ([commit](https://github.com/ckeditor/ckeditor5/commit/b68d310d7ca779c2e6da5072e46fb5a13fb1e4f0))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added model `Position#findAncestor()` and `Element#findAncestor()` methods. Closes [#3233](https://github.com/ckeditor/ckeditor5/issues/3233). ([commit](https://github.com/ckeditor/ckeditor5/commit/a349af57c6a0ceeea1f7cfebf28a138065f15189))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Changed the visibility scope of `Mapper#findPositionIn()` from `private` to `public`. ([commit](https://github.com/ckeditor/ckeditor5/commit/3d260151f833e84cbdccc9deeff6415ae8b0c6e1))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the `Range#getJoined()` method for joining ranges. ([commit](https://github.com/ckeditor/ckeditor5/commit/1264e63947c88123fdb2b9a8c301d100476e83a8))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced the UI for manual image resizing via a dropdown or standalone buttons. Closes [#5201](https://github.com/ckeditor/ckeditor5/issues/5201). ([commit](https://github.com/ckeditor/ckeditor5/commit/70e0b4102511a272cfef710379e8fcde40e53ac6))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced the UI for restoring the original image size.  Closes [#5197](https://github.com/ckeditor/ckeditor5/issues/5197). ([commit](https://github.com/ckeditor/ckeditor5/commit/70e0b4102511a272cfef710379e8fcde40e53ac6))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Added an icon in the top-right corner of an image indicating that the image is linked. Closes [#7457](https://github.com/ckeditor/ckeditor5/issues/7457). ([commit](https://github.com/ckeditor/ckeditor5/commit/9887b7fcf148a72ad393c05f7278cf572c62a31a))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Typing over the selected link will not remove the link itself. Instead, the typed text will replace the link text. Closes [#4762](https://github.com/ckeditor/ckeditor5/issues/4762). ([commit](https://github.com/ckeditor/ckeditor5/commit/de476bb365aabb17d81f18cbe27d47b4baa32a0d))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Added the `AutoLink` feature which replaces a plain text with a URL or e-mail address if the typed or pasted content is a link. Closes [#4715](https://github.com/ckeditor/ckeditor5/issues/4715). ([commit](https://github.com/ckeditor/ckeditor5/commit/c3f307848dbefdd943376d06dcdc750e1f97eed9))
* **[page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break)**: Added support for pasting page breaks from Microsoft Word. Closes [#2508](https://github.com/ckeditor/ckeditor5/issues/2508). ([commit](https://github.com/ckeditor/ckeditor5/commit/d921aabf5e57e0daafec4e0be086b4ff18493c2d))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added an option to set heading rows and columns for the `insertTable` command and `TableUtils#createTable()`. Closes [#6768](https://github.com/ckeditor/ckeditor5/issues/6768). ([commit](https://github.com/ckeditor/ckeditor5/commit/392f61ffd1681ad6c5d7994d2339f46e317064bb))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Introduced the `TwoStepCaretMovement` plugin. See [#7444](https://github.com/ckeditor/ckeditor5/issues/7444). ([commit](https://github.com/ckeditor/ckeditor5/commit/d40bd5832084821b54c6962462ec909e47e28168))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced the `Collection#addMany()` method for adding multiple items in a single call. Closes [#7627](https://github.com/ckeditor/ckeditor5/issues/7627). ([commit](https://github.com/ckeditor/ckeditor5/commit/a1f0efd3c09fe52b73dca92107ef035175704d31))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced the `Collection#change` event. See [#7627](https://github.com/ckeditor/ckeditor5/issues/7627). ([commit](https://github.com/ckeditor/ckeditor5/commit/a1f0efd3c09fe52b73dca92107ef035175704d31))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Made it possible to disable the `WidgetTypeAround` plugin on the fly. Closes [#6774](https://github.com/ckeditor/ckeditor5/issues/6774). ([commit](https://github.com/ckeditor/ckeditor5/commit/8cecf39f064647aa8a5c54e062f729cb981c1d67))

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed incorrect selection fixing in some multi-cell selection scenarios. Closes [#7659](https://github.com/ckeditor/ckeditor5/issues/7659). ([commit](https://github.com/ckeditor/ckeditor5/commit/43862d6e57bf4359f0d328c878b97888b6c1f9dd))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: After backspacing into a link, the caret should still stay outside the link. Closes [#7521](https://github.com/ckeditor/ckeditor5/issues/7521). ([commit](https://github.com/ckeditor/ckeditor5/commit/c175e1c62d358a58dddd24e048cf71aa1603781e))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Manual and automatic decorators will work properly with a link on an image. Closes [#7519](https://github.com/ckeditor/ckeditor5/issues/7519). ([commit](https://github.com/ckeditor/ckeditor5/commit/d38b5e526709d69024df3bc1ca0ebf7cf10306b0))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fake visual selection should not be added to the editor's data. Closes [#7614](https://github.com/ckeditor/ckeditor5/issues/7614). ([commit](https://github.com/ckeditor/ckeditor5/commit/84e2042181fdff0d60d97e6bcbf0a6d26a9c9f41))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The editor should not crash on the <kbd>Enter</kbd> keypress inside a to-do list item containing soft-breaks. Closes [#5866](https://github.com/ckeditor/ckeditor5/issues/5866), [#6585](https://github.com/ckeditor/ckeditor5/issues/6585). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d260151f833e84cbdccc9deeff6415ae8b0c6e1))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Links inside a to-do list item should be properly converted to HTML. Closes [#5779](https://github.com/ckeditor/ckeditor5/issues/5779). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d260151f833e84cbdccc9deeff6415ae8b0c6e1))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: The editor's placeholder should disappear after inserting media into an empty editor. Closes [#1684](https://github.com/ckeditor/ckeditor5/issues/1684). ([commit](https://github.com/ckeditor/ckeditor5/commit/bff38e366517a2801ffdd136bcff3afbfe671fd6))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Pasting a table into an existing table should not set the multi-cell selection if the `TableSelection` plugin is disabled. Closes [#7486](https://github.com/ckeditor/ckeditor5/issues/7486). ([commit](https://github.com/ckeditor/ckeditor5/commit/e50a4e19ddbdf2e90f08da0f568916d117f1fdea))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Pasting a table into an existing table with headings should not break the table layout. Closes [#7453](https://github.com/ckeditor/ckeditor5/issues/7453). ([commit](https://github.com/ckeditor/ckeditor5/commit/df4485fb17e28f2ddb2d3c24253c2b23c9e11249))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table structure should not be changed when removing the heading row. Closes [#7454](https://github.com/ckeditor/ckeditor5/issues/7454), [#7601](https://github.com/ckeditor/ckeditor5/issues/7601). ([commit](https://github.com/ckeditor/ckeditor5/commit/8b83c9bcdd09e5d66c66df35fd2ee8252cecc26e))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Merging cells of multiple whole rows or columns should not crash the editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/8b83c9bcdd09e5d66c66df35fd2ee8252cecc26e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Removing the first hidden (grouped) toolbar button should not throw an exception. Closes [#7655](https://github.com/ckeditor/ckeditor5/issues/7655). ([commit](https://github.com/ckeditor/ckeditor5/commit/266dfda77fe51ca824195e22d84ad7517840777d))
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: Undo/redo stacks should be cleared on `DataController#set()`. Closes [#4060](https://github.com/ckeditor/ckeditor5/issues/4060). ([commit](https://github.com/ckeditor/ckeditor5/commit/4a12d38094803f62d351e467a37ecba2b9c957fd))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: `Resizer#redraw()` should not change the editing view unless a different size should be set. Closes [#7633](https://github.com/ckeditor/ckeditor5/issues/7633). ([commit](https://github.com/ckeditor/ckeditor5/commit/978dd711c9db4022cfc89eff4a1de4f148bd65c8))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Triple-clicking inside an image caption should not crash the editor in Firefox. Closes [#7542](https://github.com/ckeditor/ckeditor5/issues/7542). ([commit](https://github.com/ckeditor/ckeditor5/commit/ef4b1f92dbd5a816a6be49f997726df1fd7d6eae))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Triple-clicking a link inside an image caption should not crash the editor in Safari. Closes [#6021](https://github.com/ckeditor/ckeditor5/issues/6021). ([commit](https://github.com/ckeditor/ckeditor5/commit/ef4b1f92dbd5a816a6be49f997726df1fd7d6eae))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The resizing mechanism will not trigger other `view.Document#mousedown` events. Thanks to that, when resizing an image inside a cell, the mouse will not trigger the table's actions. Closes [#6755](https://github.com/ckeditor/ckeditor5/issues/6755). ([commit](https://github.com/ckeditor/ckeditor5/commit/27fce4e3c37bd52da6cad913defa6571618bd350))

### Other changes

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Added icons that represent different sizes of an object (`object-size-*.svg`) (see [#7559](https://github.com/ckeditor/ckeditor5/issues/7559)). ([commit](https://github.com/ckeditor/ckeditor5/commit/565628a6e6faa0efdeb4aee7c6a9b63e8a429dd7))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The `Editor`, `CommandCollection` and `MultiCommand`'s `execute()` method will return the result of the called `command.execute()`. Closes [#7647](https://github.com/ckeditor/ckeditor5/issues/7647). ([commit](https://github.com/ckeditor/ckeditor5/commit/152ffc911c5345c8a5ac8536a48458847414c72c))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Changed arguments of the `Element#is()`, `Text#is()`, `TextProxy#is()`, `AttributeElement#is()`, `ContainerElement#is()`, `EditableElement#is()`, `EmptyElement#is()`, `UIElement#is()` methods and all their usages. Closes [#7608](https://github.com/ckeditor/ckeditor5/issues/7608). ([commit](https://github.com/ckeditor/ckeditor5/commit/dbee47989aad166fff054e55cd294446772153af))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the `model.Schema` instance to the downcast conversion API, available under `conversionApi.schema`. ([commit](https://github.com/ckeditor/ckeditor5/commit/b68d310d7ca779c2e6da5072e46fb5a13fb1e4f0))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `UpcastHelpers#elementToMarker()` is now deprecated. Use `UpcastHelpers#dataToMarker()` instead. `DowncastHelpers#markerToElement()` should only be used for editing downcast. ([commit](https://github.com/ckeditor/ckeditor5/commit/b68d310d7ca779c2e6da5072e46fb5a13fb1e4f0))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Table cells should not be filled with single spaces when pasting a table with empty cells. Closes [#7487](https://github.com/ckeditor/ckeditor5/issues/7487). ([commit](https://github.com/ckeditor/ckeditor5/commit/284c7c1b4f3fba9d4133db273706a15db7454725))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `bindTwoStepCaretToAttribute()` engine's utility was removed. See [#7444](https://github.com/ckeditor/ckeditor5/issues/7444). ([commit](https://github.com/ckeditor/ckeditor5/commit/d40bd5832084821b54c6962462ec909e47e28168))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Allow to configure `ImageResize` in a more granular way. For example, by combining `ImageResizeEditing` with `ImageResizeHandles` or `ImageResizeButtons` to resize an image with handles or with the image toolbar UI components (dropdown or standalone buttons) respectively. Closes [#7579](https://github.com/ckeditor/ckeditor5/issues/7579). ([commit](https://github.com/ckeditor/ckeditor5/commit/3396d4e4c0e481b6c7927c73b88e065d61e81e49))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Image alignment styles (`alignLeft`, `alignCenter` and `alignRight`) no longer set `max-width: 50%` of the `<figure>` element.  If you wish them to still do so, add [these styles](https://github.com/ckeditor/ckeditor5/pull/7625/files#diff-960e3b5e24794dab54cce5dd955c2db2L11-L16) to your content styles. ([commit](https://github.com/ckeditor/ckeditor5/commit/a4cbcf11c0f387ad815a94b6a39b8932387d9ec8))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Restoring the document selection to the ranges as they were before undoing table cells merge. Closes [#6639](https://github.com/ckeditor/ckeditor5/issues/6639). ([commit](https://github.com/ckeditor/ckeditor5/commit/1264e63947c88123fdb2b9a8c301d100476e83a8))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Improved toolbar rendering time when multiple items are added or removed at once (e.g. during the editor initialization). Closes [#6194](https://github.com/ckeditor/ckeditor5/issues/6194). ([commit](https://github.com/ckeditor/ckeditor5/commit/266dfda77fe51ca824195e22d84ad7517840777d))
* Link's attribute element highlight is now `inlineHighlight()` - a public utility. ([commit](https://github.com/ckeditor/ckeditor5/commit/fc59dc4f9790c709fda493e00e6db41f4a1ae6be))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v20.0.0 => v21.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v20.0.0 => v21.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v20.0.0 => v21.0.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v20.0.0 => v21.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v20.0.0 => v21.0.0
</details>


## [20.0.0](https://github.com/ckeditor/ckeditor5/compare/v19.1.1...v20.0.0) (2020-06-24)

### Release highlights

We are happy to announce the release of CKEditor 5 v20.0.0.

This release brings some highly anticipated features:

* Support for [linking images](https://github.com/ckeditor/ckeditor5/issues/702).
* [Typing around widgets](https://github.com/ckeditor/ckeditor5/issues/407).
* An option to [automatically set link protocol](https://github.com/ckeditor/ckeditor5/issues/4858).
* [Improved selection handling when working with links](https://github.com/ckeditor/ckeditor5/issues/1016).

New features were also accompanied by a set of bug fixes, to name a few:

* [Autoformatting will no longer change formatting when typing in an inline code](https://github.com/ckeditor/ckeditor5/issues/1239).
* Editor will no longer [crash if there's a HTML comment in the source data](https://github.com/ckeditor/ckeditor5/issues/5734).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v20.0.0-with-linking-images-and-multi-cell-comments-released/

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Node `>=12.0.0` is required now.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `TableNavigation` plugin was renamed to `TableKeyboard`.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The values returned by the `TableWalker` iterator have changed. See [#6785](https://github.com/ckeditor/ckeditor5/issues/6785).
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Removed the `getWidgetTypeAroundPositions()` helper since the "Insert new paragraph" buttons are now visible regardless of the widget location in the document
* The `isTableWidget()` and `toTableWidget()` utility functions were removed.
* The functions `getSelectedTableWidget()` and `getTableWidgetAncestor()` from `table/utils` module were moved to the `table/utils/widget` module.
* The functions `getSelectedTableCells()`, `getTableCellsContainingSelection()`, `getSelectionAffectedTableCells()`, `getRowIndexes()`, `getColumnIndexes()`, and `isSelectionRectangular()` from `table/utils` module were moved to `table/utils/selection` module.
* The functions `getVerticallyOverlappingCells()`, `splitHorizontally()`, `getHorizontallyOverlappingCells()`, and `splitVertically()` from `table/utils` module were moved to `table/utils/structure` module.
* The functions `findAncestor()`, `updateNumericAttribute()`, `createEmptyTableCell()`, and `isHeadingColumnCell()` from `table/commands/utils` module were moved to `table/utils/common` module.
* The functions `getSingleValue()` and `addDefaultUnitToNumericValue()` from `table/commands/utils` module were moved to `table/utils/table-properties` module.
* The functions `cropTableToDimensions()` and `trimTableCellIfNeeded()` from `table/tableselection/croptable` module were moved to `table/utils/structure` module.
* The functions `repositionContextualBalloon()`, `getBalloonTablePositionData()`, and `getBalloonCellPositionData()` from `table/ui/utils` module were moved to `table/utils/ui/contextualballoon` module.
* The functions `getBorderStyleLabels()`, `getLocalizedColorErrorText()`, `getLocalizedLengthErrorText()`, `colorFieldValidator()`, `lengthFieldValidator()`, `lineWidthFieldValidator()`, `getBorderStyleDefinitions()`, `fillToolbar()`, and `getLabeledColorInputCreator()` from `table/ui/utils` module were moved to `table/utils/ui/table-properties` module.
* The `defaultColors` constant from `table/ui/utils` module was moved to `table/utils/ui/table-properties` module.

### Features

* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Introduced the linking images feature. Closes [#7330](https://github.com/ckeditor/ckeditor5/issues/7330). ([commit](https://github.com/ckeditor/ckeditor5/commit/cc0e69478e00012089857ba9ddf871aefa065677))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Introduced the `LinkImageUI` plugin that brings a UI to wrap images in links. Closes [#7331](https://github.com/ckeditor/ckeditor5/issues/7331). ([commit](https://github.com/ckeditor/ckeditor5/commit/878257e43d9b0135aacec841ed5e085ca8b5c3df))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: A fake caret (selection) should be displayed in the content when the link input has focus and the browser does not render the native caret (selection). Closes [#4721](https://github.com/ckeditor/ckeditor5/issues/4721). ([commit](https://github.com/ckeditor/ckeditor5/commit/ffac139a3e16dd013b68dfc1da34aba7bbd5b685))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Introduced the `config.link.defaultProtocol` option for adding it automatically to the links when it's not provided by the user in the link form. Closes [#4858](https://github.com/ckeditor/ckeditor5/issues/4858). ([commit](https://github.com/ckeditor/ckeditor5/commit/76c762e5a6549cb20de4331046bd324c992e95a0))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Added styles for the fake link caret (selection) (see [#4721](https://github.com/ckeditor/ckeditor5/issues/4721)). ([commit](https://github.com/ckeditor/ckeditor5/commit/ffac139a3e16dd013b68dfc1da34aba7bbd5b685))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Added styles for a "fake caret" brought by the `WidgetTypeAround` plugin (see [#6693](https://github.com/ckeditor/ckeditor5/issues/6693)). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb8dd9f0e616cd5d15c3dc673508679d3061f547))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Created a public `isNonTypingKeystroke()` helper (see [#6693](https://github.com/ckeditor/ckeditor5/issues/6693)). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb8dd9f0e616cd5d15c3dc673508679d3061f547))
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: Introduced the `config.simpleUpload.withCredentials` request configuration. Closes [#7282](https://github.com/ckeditor/ckeditor5/issues/7282). ([commit](https://github.com/ckeditor/ckeditor5/commit/5a34216fadebeaf3acc5b88002eec4b841a1b17d))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Created `isArrowKeyCode()`, `getLocalizedArrowKeyCodeDirection()`, and `isForwardArrowKeyCode()` helpers (see [#6693](https://github.com/ckeditor/ckeditor5/issues/6693)). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb8dd9f0e616cd5d15c3dc673508679d3061f547))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Implemented keyboard support for inserting paragraphs around block widgets using a "fake horizontal caret" (`WidgetTypeAround`). Both "Insert new paragraph" buttons are now always displayed for all block widgets regardless of their location in the document. Closes [#6693](https://github.com/ckeditor/ckeditor5/issues/6693), [#6825](https://github.com/ckeditor/ckeditor5/issues/6825), [#6694](https://github.com/ckeditor/ckeditor5/issues/6694). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb8dd9f0e616cd5d15c3dc673508679d3061f547))

### Bug fixes

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Autoformatting should not occur inside an existing text with a model `code` attribute. Closes [#1239](https://github.com/ckeditor/ckeditor5/issues/1239). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad3562a2d3b6d5a1e8de276e7f032371ba260d63))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The editor should not crash when the initial data includes HTML comments. Closes [#5734](https://github.com/ckeditor/ckeditor5/issues/5734). ([commit](https://github.com/ckeditor/ckeditor5/commit/377d142d9089e92a83d27eb386a3ef722fce847f))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The model selection post-fixer should not set a new selection if the ranges before and after post-fixing are the same (see [#6693](https://github.com/ckeditor/ckeditor5/issues/6693)). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb8dd9f0e616cd5d15c3dc673508679d3061f547))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Backspace will no longer change the type of the trailing block. Closes [#6680](https://github.com/ckeditor/ckeditor5/issues/6680). ([commit](https://github.com/ckeditor/ckeditor5/commit/a87b364cce3fc70412031243ea0123333a91b821))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: The Font Family feature should apply the complete family value from the configuration when `config.fontFamily.supportAllValues` is `true`. Closes [#7285](https://github.com/ckeditor/ckeditor5/issues/7285). ([commit](https://github.com/ckeditor/ckeditor5/commit/c7b8f037891b885ae9d5d8c483747550ea8d6bd9))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The widget toolbar won't be shown if an empty collection of items was provided in the editor's configuration. Closes [#5857](https://github.com/ckeditor/ckeditor5/issues/5857). ([commit](https://github.com/ckeditor/ckeditor5/commit/64e53153737458bb0e64db16049b581e0ff8aae9))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `src` and `alt` attributes for the image element will be always added to the editor's data. Even if they are empty. Closes [#5033](https://github.com/ckeditor/ckeditor5/issues/5033). ([commit](https://github.com/ckeditor/ckeditor5/commit/e81cbbba4bd0ccddc4ce0e59260c8f733bf12ca4))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table multi-cell selection should not be possible with the keystrokes when the `TableSelection` plugin is disabled. Closes [#7483](https://github.com/ckeditor/ckeditor5/issues/7483). ([commit](https://github.com/ckeditor/ckeditor5/commit/2fee736a59ee6e1da2b85aff429398d96fd5c57b))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Copied and pasted table fragment should maintain the proper structure when the fragment contains merged table cells. Closes [#7245](https://github.com/ckeditor/ckeditor5/issues/7245). ([commit](https://github.com/ckeditor/ckeditor5/commit/17d7bd7390aeae841f6d2116a3528ea288367b3f))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Removing empty rows will no longer produce an invalid table model in certain scenarios. Closes [#6609](https://github.com/ckeditor/ckeditor5/issues/6609). ([commit](https://github.com/ckeditor/ckeditor5/commit/11d69fc808b4db5184ff90e0d0a2756761db4707))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `BalloonToolbar` should not show up when multiple objects (for instance, table cells) are selected at a time. Closes [#6443](https://github.com/ckeditor/ckeditor5/issues/6443). ([commit](https://github.com/ckeditor/ckeditor5/commit/6036d4a4983aba4f5e43704300dc38aeba7369f3))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the `ignoreMarkers` option to the `Model#hasContent()` method. ([commit](https://github.com/ckeditor/ckeditor5/commit/61a6110dc204717bce88367b94a0287cc9d57816))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added Writer#cloneElement(). Closes [#6819](https://github.com/ckeditor/ckeditor5/issues/6819). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c7114014afcfd06a304183a3b077d84dec6db3e))
* **[horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line)**: Improved the look of horizontal lines in the editor content. Closes [#7418](https://github.com/ckeditor/ckeditor5/issues/7418). ([commit](https://github.com/ckeditor/ckeditor5/commit/e8bff81931d31fb341cd88f87977d6ef7db45a74))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The selection after inserting a link will land after the inserted element. Thanks to that a user will be able to type directly after the link without extending the link element. Closes [#1016](https://github.com/ckeditor/ckeditor5/issues/1016). ([commit](https://github.com/ckeditor/ckeditor5/commit/0bf66e47ee02484d694d786023cc153312409287))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: After clicking at the beginning or end of the link element, the selection will land before/after the clicked element. Thanks to that a user will be able to typing before or after the link element as normal text without extending the link. See [#1016](https://github.com/ckeditor/ckeditor5/issues/1016). ([commit](https://github.com/ckeditor/ckeditor5/commit/0bf66e47ee02484d694d786023cc153312409287))
* **[paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph)**: The `InsertParagraphCommand` should split ancestors of the `Position` to find a parent that allows `'paragraph'` (see [#6693](https://github.com/ckeditor/ckeditor5/issues/6693)). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb8dd9f0e616cd5d15c3dc673508679d3061f547))
* **[select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all)**: Improved the select-all feature so that it includes more and more content if the selection was anchored in a nested editable. Closes [#6621](https://github.com/ckeditor/ckeditor5/issues/6621). ([commit](https://github.com/ckeditor/ckeditor5/commit/6f59c78eb88335cabf0d39612b40c3b50fade41f))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Removed `options.asWidget` from most of the table converters which are never run in data pipeline. ([commit](https://github.com/ckeditor/ckeditor5/commit/b127f41163559b4c12ccf100be309c0dbf7c2355))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Marker on table cells should be downcasted to CSS classes on cells (instead of wrapping the content). Closes [#7360](https://github.com/ckeditor/ckeditor5/issues/7360). ([commit](https://github.com/ckeditor/ckeditor5/commit/48d80cb955eecae9e9f0afad51ac1c5cdc7c00c1))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Pasting a table into a table is more tolerant for whitespaces around a pasted table. Closes [#7379](https://github.com/ckeditor/ckeditor5/issues/7379). ([commit](https://github.com/ckeditor/ckeditor5/commit/669d54f688bf1017cb6c09c557cee084ea01be90))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Extracted `TableMouse` plugin from `TableSelection` plugin. Closes [#6757](https://github.com/ckeditor/ckeditor5/issues/6757). ([commit](https://github.com/ckeditor/ckeditor5/commit/4d2f5f9b9f298601b332f304da66333c52673cb8))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Refactor values returned by the `TableWalker` iterator. Closes [#6785](https://github.com/ckeditor/ckeditor5/issues/6785). ([commit](https://github.com/ckeditor/ckeditor5/commit/65cfa13ec9a3f983b94a27b5a86e031687fad25d))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Add `row`, `startColumn`, and `endColumn` options to `TableWalker` constructor. See [#6785](https://github.com/ckeditor/ckeditor5/issues/6785). ([commit](https://github.com/ckeditor/ckeditor5/commit/65cfa13ec9a3f983b94a27b5a86e031687fad25d))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v19.1.0 => v20.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v19.1.0 => v20.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v19.1.0 => v20.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v19.1.0 => v20.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v19.0.2 => v20.0.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v19.0.2 => v20.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v19.0.2 => v20.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v19.0.2 => v20.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v19.0.2 => v20.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v19.0.2 => v20.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v19.1.0 => v20.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v19.0.2 => v20.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v19.0.1 => v20.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v19.0.1 => v20.0.0
</details>


## [19.1.1](https://github.com/ckeditor/ckeditor5/compare/v19.1.0...v19.1.1) (2020-05-29)

### Bug fixes

* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: The paste from Office feature should retain background and font styles when pasting tables. Closes [#7275](https://github.com/ckeditor/ckeditor5/issues/7275). ([commit](https://github.com/ckeditor/ckeditor5/commit/67a469a555a47d9d29ddeab64bebfda9a9998bcc))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v19.0.1 => v19.0.2
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v19.0.1 => v19.0.2
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v19.0.1 => v19.0.2
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v19.0.1 => v19.0.2
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v19.0.1 => v19.0.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v19.0.1 => v19.0.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v19.0.1 => v19.0.2
</details>


## [19.1.0](https://github.com/ckeditor/ckeditor5/compare/v19.0.0...v19.1.0) (2020-05-27)

### Release highlights

We are happy to announce the release of CKEditor 5 v19.1.0.

This release further refines the table feature, brings a helper for convenient typing in tight places before or after widgets (such as images or tables) and brings a major change in our code infrastructure. Most notable enhancements are:

* Pasting a table into a selected table fragment &mdash; which marks the end of the [Table selection stage III](https://github.com/ckeditor/ckeditor5/issues/6297) task.
* A new [widget feature that allows typing before or after a widget](https://github.com/ckeditor/ckeditor5/issues/6689) when there is no space around it.
* [Project migration to a monorepo architecture](https://github.com/ckeditor/ckeditor5/issues/6466).

But we did not stop there, as the release comes with several bug fixes, too:

* [Entities handling in code blocks](https://github.com/ckeditor/ckeditor5/issues/5901).
* [Potential editor crash when removing a column](https://github.com/ckeditor/ckeditor5/issues/6789).
* [Editor crash when inserting a table row or column with another widget selected in the cell](https://github.com/ckeditor/ckeditor5/issues/6607).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v19.1.1-with-table-enhancements-typing-around-widgets-and-print-to-PDF-feature/

### Collaboration features

The CKEditor 5 collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: The `MediaEmbedUI#form` property was removed from the API.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `cropTable()` utility method was removed. Use the [`cropTableToDimensions()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tableselection_croptable.html#static-function-cropTableToDimensions) method instead.
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: A new custom `--ck-color-focus-border-coordinates` CSS property was added and the existing `--ck-color-focus-border` property now uses it internally. If your integration overrides the latter, we recommend you update the former to avoid compatibility issues with various editor UI features.

### Features

* **[paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph)**: Implemented the [`InsertParagraphCommand`](https://ckeditor.com/docs/ckeditor5/latest/api/module_paragraph_insertparagraphcommand-InsertParagraphCommand.html) registered as `'insertParagraph'` in the editor. Closes [#6823](https://github.com/ckeditor/ckeditor5/issues/6823), [#7229](https://github.com/ckeditor/ckeditor5/issues/7229). ([commit](https://github.com/ckeditor/ckeditor5/commit/126701895d2bff8fb0ded7b4f4bf5e26d36ba7d7))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced support for pasting tables into a selected table fragment. Closes [#6120](https://github.com/ckeditor/ckeditor5/issues/6120). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b426397f9e2d6762681abdef5e99e6e101e25fa))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced table cell selection using keyboard. Closes [#6115](https://github.com/ckeditor/ckeditor5/issues/6115), [#3203](https://github.com/ckeditor/ckeditor5/issues/3203). ([commit](https://github.com/ckeditor/ckeditor5/commit/b567de402d1438790c3e7314d5b7ed330b308d9d))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Brought styles for the feature allowing users to type in tight spots around block widgets (see [#407](https://github.com/ckeditor/ckeditor5/issues/407)). ([commit](https://github.com/ckeditor/ckeditor5/commit/dbf24a29ac64f52bceb2efc106b50c736c16f1c3))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Brought the feature allowing users to type in tight spots around block widgets where web browsers do not allow the caret to be placed (see [#407](https://github.com/ckeditor/ckeditor5/issues/407)). Closes [#6740](https://github.com/ckeditor/ckeditor5/issues/6740), [#6688](https://github.com/ckeditor/ckeditor5/issues/6688), [#6689](https://github.com/ckeditor/ckeditor5/issues/6689), [#6695](https://github.com/ckeditor/ckeditor5/issues/6695). ([commit](https://github.com/ckeditor/ckeditor5/commit/dbf24a29ac64f52bceb2efc106b50c736c16f1c3))

### Bug fixes

* **[cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services)**: A `Token` instance will be destroyed by the `CloudServices` context plugin. Closes [#7248](https://github.com/ckeditor/ckeditor5/issues/7248). ([commit](https://github.com/ckeditor/ckeditor5/commit/6b60cb630b72105577696b6ccc291c17cf230c40))
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Fixed conversion of some entities (like `&nbsp;`, `&amp;`) in a code block. Closes [#5901](https://github.com/ckeditor/ckeditor5/issues/5901). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad227917a6b85edbc41dca314d9d4caec97b56f5))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Made it possible to use the `mediaEmbed` button more than once (in more than one toolbar). Closes [#6333](https://github.com/ckeditor/ckeditor5/issues/6333). ([commit](https://github.com/ckeditor/ckeditor5/commit/3011e37768225dfe928f3e3321753fc04ca58ff2))
* **[media-mebed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-mebed)**: The media widget conversion will no longer discard widget internals (drag or resize handlers, buttons to insert paragraphs, etc.) injected by other features when converting the URL (see [#407](https://github.com/ckeditor/ckeditor5/issues/407)). ([commit](https://github.com/ckeditor/ckeditor5/commit/dbf24a29ac64f52bceb2efc106b50c736c16f1c3))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Setting the column as a header will now properly split column-spanned cells. Closes [#6658](https://github.com/ckeditor/ckeditor5/issues/6658). ([commit](https://github.com/ckeditor/ckeditor5/commit/9531af43623b6e15aff27872a83ac1dd22ea8654))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table properties balloon should always be visible if a table is bigger than the visible viewport. Closes [#6190](https://github.com/ckeditor/ckeditor5/issues/6190). ([commit](https://github.com/ckeditor/ckeditor5/commit/75d6912a3e667ef075f4283ec2d45de05d4da8b6))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: When the state is restored or the user enters a color value manually, the color input will now properly match the color label (if any is available). Closes [#6791](https://github.com/ckeditor/ckeditor5/issues/6791). ([commit](https://github.com/ckeditor/ckeditor5/commit/f18f4fd31e16a11b32dd433d3f40fd0933e2bf26))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The editor will not crash when removing columns next to row-spanned cells. Closes [#6789](https://github.com/ckeditor/ckeditor5/issues/6789). ([commit](https://github.com/ckeditor/ckeditor5/commit/84e3310c33c770489777906bc36fd037b5afc86b))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table properties button should not be enabled if all the property commands are disabled. Closes [#6679](https://github.com/ckeditor/ckeditor5/issues/6679). ([commit](https://github.com/ckeditor/ckeditor5/commit/056e06e1e552a609aaad4108e51272cf4a2644c0))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table heading rows should be properly updated after removing rows as a side effect of merging cells. Closes [#6667](https://github.com/ckeditor/ckeditor5/issues/6667). ([commit](https://github.com/ckeditor/ckeditor5/commit/72f6491b8dfd72f897904fbfad54310a0d2ef9b8))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Empty table rows are properly handled during the conversion and layout post-fixing. Closes [#3274](https://github.com/ckeditor/ckeditor5/issues/3274). ([commit](https://github.com/ckeditor/ckeditor5/commit/fb5fe8b8950cf11700d691bd4369b8bb8aa12cf2))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: <kbd>Shift</kbd>+click will now use an anchor cell if there is any. Closes [#6453](https://github.com/ckeditor/ckeditor5/issues/6453). ([commit](https://github.com/ckeditor/ckeditor5/commit/d799b9d148f2e8a10784e0cf5fd7ea3a69b93bd1))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed insert table row/column commands when a widget is selected inside a table cell. Closes [#6607](https://github.com/ckeditor/ckeditor5/issues/6607). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d85aca751f45be923210edfe598780eccacd0dc))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table keyboard navigation should not alter the native <kbd>Shift</kbd>+Arrow behavior inside a table cell. Closes [#6641](https://github.com/ckeditor/ckeditor5/issues/6641). ([commit](https://github.com/ckeditor/ckeditor5/commit/88543374bc1cac78e6bbc917759aa6a512cfad47))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Merging cells no longer wraps the text in a `<span>` element rather than paragraph in a certain scenario. Closes [#6260](https://github.com/ckeditor/ckeditor5/issues/6260). ([commit](https://github.com/ckeditor/ckeditor5/commit/fbec6b2af7a8a45c189388b537ed48d223b9f18a))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The widget toolbar should always be visible even if the widget is bigger than the visible viewport (see [#6190](https://github.com/ckeditor/ckeditor5/issues/6190)). ([commit](https://github.com/ckeditor/ckeditor5/commit/75d6912a3e667ef075f4283ec2d45de05d4da8b6))

### Other changes

* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Renamed `MentionAttribute._uid` to a `MentionAttribute.uid` as it needs to be used by integrators when implementing custom converters. Closes [#6587](https://github.com/ckeditor/ckeditor5/issues/6587). ([commit](https://github.com/ckeditor/ckeditor5/commit/94a6952a6a07146e5ac6daad8e836262d2381664))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Adding a new row in the table copies the structure of the selected row. Closes [#6549](https://github.com/ckeditor/ckeditor5/issues/6549). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f2091158ed8bfaba5ddf91f89308023a345351c))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Display a human readable color value in the color input field. Closes [#6241](https://github.com/ckeditor/ckeditor5/issues/6241). ([commit](https://github.com/ckeditor/ckeditor5/commit/af7928f1febebeef1f4b0243169dd01415531c1d))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Changed the insert row above/below buttons order in the table dropdown. Closes [#6702](https://github.com/ckeditor/ckeditor5/issues/6702). ([commit](https://github.com/ckeditor/ckeditor5/commit/a78bca8806064ca7acdd969222bb11b853ca4f0c))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v19.0.0 => v19.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v19.0.0 => v19.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v19.0.0 => v19.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v19.0.0 => v19.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v19.0.0 => v19.1.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v19.0.0 => v19.0.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v19.0.0 => v19.0.1
</details>


## [19.0.0](https://github.com/ckeditor/ckeditor5/compare/v18.0.0...v19.0.0) (2020-04-29)

We are happy to announce the release of CKEditor 5 v19.0.0.

This release is focused on [further improving the table selection plugin](https://github.com/ckeditor/ckeditor5/issues/6285) and includes following the enhancements:

* [An option to select an entire row or column](https://github.com/ckeditor/ckeditor5/issues/6500).
* [Custom keyboard handling in tables, allowing for consistent and more convenient navigation using the keyboard](https://github.com/ckeditor/ckeditor5/issues/3267).
* [Improved removing rows or columns from complex tables](https://github.com/ckeditor/ckeditor5/issues/6406).
* Fixed a few cases where an editor could be crashed.

We also introduced support for [plural forms in our translation API](https://github.com/ckeditor/ckeditor5/issues/6406), added the [select all feature](https://github.com/ckeditor/ckeditor5/issues/6536) and created the `supportAllValues` option to preserve any font family or size value.

We also did several performance tweaks to improve CKEditor 5 data processing and rendering time.

A few bugs have been fixed, most notably:

* [Font retention when pasting from Microsoft Word](https://github.com/ckeditor/ckeditor5/issues/6165).
* [Support for special characters in mention matching](https://github.com/ckeditor/ckeditor5/issues/6398).
* [Artifact characters produced when typing  after an emoji with text transformation enabled](https://github.com/ckeditor/ckeditor5/issues/6398).

Finally, this release comes with some **important breaking changes**. The most notable ones are:

* Make sure the latest version of the [`Essentials`](https://ckeditor.com/docs/ckeditor5/latest/api/essentials.html) plugin or the [`SelectAll`](https://ckeditor.com/docs/ckeditor5/latest/api/module_select-all_selectall-SelectAll.html) plugin is installed in your integration. Either is required for proper keystroke handling in editor widgets.
* The format of stored editor translations changed. If you use `window.CKEDITOR_TRANSLATIONS`, see [#334](https://github.com/ckeditor/ckeditor5-utils/issues/334).
* The `translate()` function from the `translation-service` was marked as protected. See [#334](https://github.com/ckeditor/ckeditor5-utils/issues/334).
* The `getPositionedAncestor()` helper will no longer return the passed element when it is positioned.
* The `ViewCollection` no longer has the `locale` property.
* The `ViewCollection#constructor()` no longer accepts the `locale` parameter.
* The `LabeledView` component was renamed to `LabeledFieldView`. Also, its instance of a labeled component's view is available through `LabeledFieldView#fieldView`. It replaced `LabeledView#view`.
* The `DropdownView#focusTracker` property was removed as it served no purpose.
* From now on, the `SpecialCharactersNavigationView` is an instance of the `FormHeaderView` and unnecessary `SpecialCharactersNavigationView#labelView` was removed.
* The `env.isEdge` property was removed. See [ckeditor/ckeditor5#6202](https://github.com/ckeditor/ckeditor5/issues/6202).

Check the list of packages below to learn more about these and other minor breaking changes.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v19.0.0-with-table-enhancements-improved-performance-and-select-all-feature/.

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### Dependencies

New packages:

* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): [v19.0.0](https://github.com/ckeditor/ckeditor5-select-all/releases/tag/v19.0.0)

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-special-characters/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v19.0.0)

Major releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v19.0.0)

Major releases (dependencies of those packages have breaking changes):

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor-cloud-services-core/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-code-block/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-horizontal-line/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-page-break/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v19.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v18.0.0 => [v19.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v19.0.0)


## [18.0.0](https://github.com/ckeditor/ckeditor5/compare/v17.0.0...v18.0.0) (2020-03-19)

We are happy to announce the release of CKEditor 5 v18.0.0. This release introduces support for [selecting multiple table cells, rows or columns](https://github.com/ckeditor/ckeditor5/issues/3202) and it improves [structure retention for lists pasted from Microsoft Word](https://github.com/ckeditor/ckeditor5/issues/2518).

We also modified our builds [to include the text transformation plugin](https://github.com/ckeditor/ckeditor5/issues/6304) and [enabled toolbar item grouping for the inline editor and balloon editor builds](https://github.com/ckeditor/ckeditor5/issues/5597).

As usual, we also fixed a couple of bugs and improved existing features, mostly in the table plugin.

Finally, this release comes with a couple of **important breaking changes**. The most notable ones are:

* Constructor for `EditingController`, `DataController` and `View` classes now require a `StylesProcessor` instance.
* Constructor for `DomConverter`, `HtmlDataProcessor` and `XmlDataProcessor` classes and the `createViewElementFromHighlightDescriptor()` function now require an instance of view document.
* The `#document` getter was removed from model nodes.
* The `GFMDataProcessor()` requires the view document instance as its first parameter.
* The `BalloonToolbar` plugin now groups the overflowing items by default.

Check the list of packages below to learn more about above and other minor breaking changes.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v18.0.0-with-custom-table-selection-and-pasting-nested-lists-from-Word/

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### Dependencies

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v18.0.0)

Major releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v18.0.0)

Major releases (dependencies of those packages have breaking changes):

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor-cloud-services-core/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-code-block/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-horizontal-line/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-page-break/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-special-characters/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v18.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v17.0.0 => [v18.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v18.0.0)


## [17.0.0](https://github.com/ckeditor/ckeditor5/compare/v16.0.0...v17.0.0) (2020-02-19)

We are happy to announce the release of CKEditor 5 v17.0.0.

From the end user perspective, this release introduces [support for styling tables and table cells](https://ckeditor.com/docs/ckeditor5/latest/features/table.html#table-and-cell-styling-tools) as well as a [new special characters picker](https://ckeditor.com/docs/ckeditor5/latest/features/special-characters.html) feature. We also worked on improving the editor initialization and data processing performance.

From the developer perspective, we added support for [editor contexts](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html), adjusted the watchdog to work with editor contexts (which introduced breaking changes in that package) and introduced an [extensible system for parsing and normalizing CSS properties](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_stylesmap-StylesMap.html) which main goal was to make the editor better pick up certain style names in pasted/loaded content.

As usual, we also fixed a couple of bugs and improved existing features. The two features which got most improvements are image resizing and the restricted editing feature.

Finally, this release comes with a couple of **important breaking changes**. The most notable ones are:

* The decoupled document build: the highlight plugin was replaced with font color and font background color features. The upgrade path requires performing data migration or customizing the build to use the highlight feature. Refer to https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v17.0.0 for more information.
* The watchdog package: the `Watchdog` class was renamed and moved to a new module. See https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v17.0.0 for more information.
* The restricted editing package: the class used by this feature to mark exceptions was changed from `ck-restricted-editing-exception` to `restricted-editing-exception`. The upgrade path requires performing data migration. Refer to https://github.com/ckeditor/ckeditor5-restricted-editing/releases/tag/v17.0.0 for more information.
* The restricted editing package: the class used by this feature to mark exceptions was changed from `ck-restricted-editing-exception` to `restricted-editing-exception`. The upgrade path requires performing data migration. Refer to https://github.com/ckeditor/ckeditor5-restricted-editing/releases/tag/v17.0.0 for more information.

Check the list of packages below to learn more about other breaking changes.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v17.0.0-with-table-styles-special-characters-and-performance-improvements/.

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### Dependencies

New packages:

* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): [v17.0.0](https://github.com/ckeditor/ckeditor5-special-characters/releases/tag/v17.0.0)

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v17.0.0)

Major releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v17.0.0)

Releases containing new features:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v17.0.0)

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor-cloud-services-core/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-code-block/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-horizontal-line/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-page-break/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v17.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v16.0.0 => [v17.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v17.0.0)


## [16.0.0](https://github.com/ckeditor/ckeditor5/compare/v15.0.0...v16.0.0) (2019-12-04)

We are happy to announce the release of CKEditor 5 v16.0.0. This release introduces one of the most community-requested features: [code blocks](https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html). We included a new [restricted editing](https://ckeditor.com/docs/ckeditor5/latest/features/restricted-editing.html) plugin, too.

We also did some changes in the default UI colors to improve accessibility. In addition to that, as always, the release contains many [more improvements and bug fixes](https://github.com/ckeditor/ckeditor5/issues?q=is%3Aissue+milestone%3A%22iteration+28%22+is%3Aclosed+-label%3Atype%3Adocs+-label%3Atype%3Atask+-label%3Apackage%3Arestricted-editing+-label%3Apackage%3Acode-block+-label%3Atype%3Afeature).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v16.0.0-with-code-blocks-and-restricted-editing/

### Dependencies

New packages:

* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): [v16.0.0](https://github.com/ckeditor/ckeditor5-code-block/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): [v16.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/releases/tag/v16.0.0)

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v16.0.0)

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor-cloud-services-core/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-horizontal-line/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-page-break/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v16.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v15.0.0 => [v16.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v16.0.0)


## [15.0.0](https://github.com/ckeditor/ckeditor5/compare/v12.4.0...v15.0.0) (2019-10-23)

We are happy to announce the release of CKEditor 5 v15.0.0. This editor version introduces support for inserting [horizontal lines](https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html), [page breaks](https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html) and [SVG images](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imageupload-ImageUploadConfig.html#member-types) into the WYSIWYG editor. It also allows you to define the [document title section](https://ckeditor.com/docs/ckeditor5/latest/features/title.html) thanks to the new title plugin. The editor toolbar is now responsive which improves the UX, especially for mobile devices.

Regarding the build itself, we added the [indentation](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html) button to the build's default setup. See [ckeditor/ckeditor5#1844](https://github.com/ckeditor/ckeditor5/issues/1844).

From other news, we changed the versioning policy. Now, all packages will have the same major version, hence, we needed to release this one as v15.0.0 (we skipped versions 13.0.0 and 14.0.0). Read more about the [new versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v15.0.0-with-horizontal-line-page-break-responsive-toolbar-and-SVG-upload-support/

### Dependencies

New packages:

* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): [v15.0.0](https://github.com/ckeditor/ckeditor5-horizontal-line/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): [v15.0.0](https://github.com/ckeditor/ckeditor5-page-break/releases/tag/v15.0.0)

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v15.0.0)

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v3.0.1 => [v15.0.0](https://github.com/ckeditor/ckeditor-cloud-services-core/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.2.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.3 => [v15.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.3.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.2.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.3.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.2.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v10.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v13.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.2.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.2.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v12.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v11.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v10.0.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v15.0.0)


## [12.4.0](https://github.com/ckeditor/ckeditor5/compare/v12.3.1...v12.4.0) (2019-08-26)

This release brings a huge set of new features: [image resizing](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/image.html#resizing-images), [to-do lists](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/todo-lists.html), [support for RTL languages](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/ui-language.html), [simple upload adapter](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/image-upload/simple-upload-adapter.html), [support for pasting from Google Docs](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/paste-from-office/paste-from-google-docs.html), [mathematic formulas](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/mathtype.html), and [spelling and grammar checking](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/spell-checker.html). In addition to that, as always, it contains many improvements and bug fixes.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.4.0-with-image-resizing-to-do-lists-RTL-language-support-and-more/

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.2.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v12.0.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.1.1 => [v12.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v13.0.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.3 => [v11.2.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.2.1 => [v12.3.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.2.1 => [v12.3.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.4 => [v12.1.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.1.1 => [v14.2.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.2.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.3 => [v11.1.4](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.4)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.1 => [v12.2.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.3 => [v12.1.4](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.4)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.2.1 => [v12.2.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.2.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.2.1 => [v11.2.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.2.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.3 => [v11.1.4](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.4)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v10.0.2)


## [12.3.1](https://github.com/ckeditor/ckeditor5/compare/v12.3.0...v12.3.1) (2019-07-10)

We are happy to report the release of CKEditor 5 v12.3.0 (and v12.3.1 with a [small fix](https://github.com/ckeditor/ckeditor5-typing/pull/209)). This release introduces several new features ([word count](https://ckeditor.com/docs/ckeditor5/latest/features/word-count.html), [automatic text transformations](https://ckeditor.com/docs/ckeditor5/latest/features/text-transformation.html), [ability to control link attributes such as `target`](https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators) and [block indentation](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html)). It also brings improvements to existing features (e.g. the ["document colors" section](https://ckeditor.com/docs/ckeditor5/latest/features/font.html#documents-colors) in the font color picker dropdowns) and many bug fixes.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.3.0-with-word-count-autocorrect-link-attributes-and-new-upload-adapter-released/

### Dependencies

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.2 => [v12.1.3](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.3)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.2.0 => [v13.2.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.2.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.2.0 => [v11.2.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.2.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.1 => [v13.1.2](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.2)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.3 => [v12.0.4](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.4)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.1 => [v13.0.2](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.2)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.1.0 => [v14.1.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.1.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.1 => [v13.0.2](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v10.0.1)


## [12.3.0](https://github.com/ckeditor/ckeditor5/compare/v12.2.0...v12.3.0) (2019-07-04)

### Dependencies

New packages:

* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): [v10.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): [v10.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): [v10.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v11.0.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.1.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v13.0.0)

Minor releases:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.1.1 => [v13.2.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.2.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.2 => [v11.1.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.0.0 => [v14.1.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.1.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.2 => [v12.1.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.2 => [v11.1.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.1 => [v12.1.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.0 => [v13.1.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.2 => [v12.0.3](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.3)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.3)


## [12.2.0](https://github.com/ckeditor/ckeditor5/compare/v12.1.0...v12.2.0) (2019-06-05)

We are happy to report the release of CKEditor 5 v12.2.0. This is a minor release with many bug fixes and a new UI feature which allows to navigating between multiple balloons.

**Note:** The `config.table.toolbar` property that had been deprecated last year has now been completely removed. Use [`config.table.contentToolbar`](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_table-TableConfig.html#member-contentToolbar) instead.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.2.0-with-mobile-friendly-comments-mode/

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v12.0.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v13.0.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v12.1.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.0)

Minor releases:

* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.0.1 => [v13.1.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.1.0 => [v13.1.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.1.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.2)


## [12.1.0](https://github.com/ckeditor/ckeditor5/compare/v12.0.0...v12.1.0) (2019-04-10)

We are happy to report the release of CKEditor 5 v12.1.0. This release introduces 3 new features ([mentions](https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html), [font color and background color](https://ckeditor.com/docs/ckeditor5/latest/features/font.html) and [remove format](https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html)).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.1.0-with-mentions-font-color-and-remove-formatting-released/

### Dependencies

New packages:

* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): [v10.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): [v10.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.0)

Minor releases:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.0.0 => [v13.1.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.1.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.1)


## [12.0.0](https://github.com/ckeditor/ckeditor5/compare/v11.2.0...v12.0.0) (2019-02-28)

We are happy to report the release of CKEditor 5 v12.0.0. This release introduces a new editor (called "[Balloon block editor](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/balloon-block-editor.html)"), the [editor content placeholder](https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html) and support for inline widgets (watch [this PR](https://github.com/ckeditor/ckeditor5/pull/1587) for updates). In addition to that we enabled media embeds and images in tables and resolved the issue where `editor.getData()` returned `<p>&nbsp;</p>` for empty content (now it returns an empty string in this case).

Besides new features, this release contains many improvements to stability, [performance](https://github.com/ckeditor/ckeditor5-utils/issues/269) and API. The last group of changes contain many breaking ones. Make sure to read the notes below.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.0.0-with-inline-widgets-and-distraction-free-editor-released/

**Important information for integration developers:** The `editor.getData()` method will return an empty string if the editor is empty (instead of returning `<p>&nbsp;</p>`). Also, if you relied on `editor.ui.view.editable`, you will now need to use `editor.ui.getEditableElement()` instead. You may also want to read the below sections and the [Migration guide](https://github.com/ckeditor/ckeditor5/issues/1582) to learn more.

**Important information for plugin developers:** The most important change that will affect your plugins is the removal of the `upcast-converters.js` and `downcast-converters.js` modules. You can now find those methods directly on the object returned by [`editor.conversion.for()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_conversion-Conversion.html#function-for). Other than that, see the changes described in the next section, the [engine's changelog](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.0.0) and read the [Migration guide](https://github.com/ckeditor/ckeditor5/issues/1582) for the details.

**Important information for custom editor developers:** We cleaned up the base editor interfaces and classes (`EditorWithUI`, `EditorUI`, `EditorUIView`, `EditableUIView`) and straightened responsibilities between the UI and the engine (the engine is now the one responsible for managing editable element classes). These changes means that your custom editor implementations will need to be updated. Read more in the [Migration guide](https://github.com/ckeditor/ckeditor5/issues/1582).

### Dependencies

New packages:

* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): [v12.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v10.0.2 => [v11.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.1.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.1.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v11.1.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v12.0.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.3 => [v11.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.3 => [v11.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.1.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v12.0.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.3 => [v12.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v11.0.1 => [v12.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v12.0.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v11.1.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.3.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.0)

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [11.2.0](https://github.com/ckeditor/ckeditor5/compare/v11.1.1...v11.2.0) (2018-12-05)

We are happy to report the release of CKEditor 5 v11.2.0. This editor version brings the long-awaited [support for paste from Office](https://ckeditor.com/docs/ckeditor5/latest/features/paste-from-word.html) (e.g. from Microsoft Word), [integration with CKFinder file manager](https://ckeditor.com/docs/ckeditor5/latest/features/ckfinder.html), improved [image upload documentation](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload.html), improved [editor UI on mobile devices](https://github.com/ckeditor/ckeditor5/issues/416#issuecomment-430246472), as well as many smaller features and improvements.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v11.2.0-with-paste-from-Word-and-file-manager-support-released/

**Important information for plugin developers:** We would like to let you know about imporant breaking changes in the `@ckeditor/ckeditor5-engine` package. Read more about them in the [`@ckeditor/ckeditor5-engine@v12.0.0` release notes](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v12.0.0).

### Dependencies

New packages:

* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): [v10.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): [v10.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v11.0.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v11.0.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v11.1.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v12.0.0)

Minor releases:

* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.3 => [v10.1.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.4 => [v10.1.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v11.1.0 => [v11.2.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.2 => [v10.1.3](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.3)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.2 => [v10.1.3](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.3)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.3.0 => [v10.3.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.3.1)


## [11.1.1](https://github.com/ckeditor/ckeditor5/compare/v11.1.0...v11.1.1) (2018-10-11)

This releases fixes the README of the below listed 4 builds on npm.

### Dependencies

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.1.1)


## [11.1.0](https://github.com/ckeditor/ckeditor5/compare/v11.0.1...v11.1.0) (2018-10-08)

We are happy to report the release of CKEditor 5 v11.1.0. This editor version brings the long-awaited [media embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html) feature, [support for block content in tables](https://ckeditor.com/docs/ckeditor5/latest/features/table.html#block-vs-inline-content-in-table-cells), tables available in real-time collaboration, as well as many smaller features and improvements.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v11.1.0-released/

### Dependencies

New packages:

* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): [v10.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v10.2.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v10.2.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.0.2 => [v10.1.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.2.0 => [v10.3.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.3.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.1 => [v10.1.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.1 => [v10.1.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.2)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v10.2.1 => [v10.2.2](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.2.2)


## [11.0.1](https://github.com/ckeditor/ckeditor5/compare/v11.0.0...v11.0.1) (2018-07-18)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5/compare/v10.1.0...v11.0.0) (2018-07-18)

### Release notes

This is a major releases that introduces two new plugins ([autosave](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/saving-data.html) and [block toolbar](https://ckeditor.com/docs/ckeditor5/latest/features/blocktoolbar.html)), many smaller features, dozens of bug fixes and a couple of infrastructure changes (an upgrade to `webpack@4` and simplified structure of build repositories). Additionally, the `Editor#element` property was renamed to `Editor#sourceElement` and the `Editor#updateElement()` method was renamed to `Editor#updateSourceElement()`.

If you maintain a [custom build of CKEditor 5](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html) or [integrate CKEditor 5 from source](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#scenario-2-building-from-source), we recommend reading the [migration guide](https://github.com/ckeditor/ckeditor5/issues/1136).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v11.0.0-released/

### Dependencies

New packages:

* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): [v10.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v10.0.2 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v10.2.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v10.2.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.2.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.2.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.2)

### Features

Besides new features introduced by the dependencies, this version also introduces the following features:

* Introduced the [`@ckeditor/ckeditor5-autosave`](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave) package. ([bac9671](https://github.com/ckeditor/ckeditor5/commit/bac9671))

### Other changes

* Updated `webpack` to version 4. ([7390460](https://github.com/ckeditor/ckeditor5/commit/7390460))

### BREAKING CHANGES

If you maintain a custom build or integrate CKEditor 5 from source, we recommend reading the [migration guide](https://github.com/ckeditor/ckeditor5/issues/1136). Closes [ckeditor/ckeditor5#1038](https://github.com/ckeditor/ckeditor5/issues/1038).

* CKEditor 5 environment was updated to use `webpack@4`. `webpack@4` introduced major changes in its configuration and plugin system. CKEditor 5 tools and build configuration were updated to work with `webpack@4` and will not work with `webpack@3`.
* The structure of build repositories was changed. The `build-config.js` files were removed and the build configuration is now kept only in the `src/ckeditor.js` files.


## [10.1.0](https://github.com/ckeditor/ckeditor5/compare/v10.0.1...v10.1.0) (2018-06-21)

This is a minor release that introduces many bug fixes and new features. Most notable ones are the table plugin and support for inserting soft breaks with <kbd>Shift</kbd>+<kbd>Enter</kbd>.

You can read more in the [blog post](https://ckeditor.com/blog/CKEditor-5-v10.1.0-released/).

### Dependencies

New packages:

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): [v10.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.1)

### Features

Besides new features introduced by the dependencies, this version also introduces the following features:

* Introduced the `@ckeditor/ckeditor5-table` package. ([e4b9a72](https://github.com/ckeditor/ckeditor5/commit/e4b9a72))

### Bug fixes

Besides changes in the dependencies, this version also contains the following bug fixes:

* The editor buttons in the document editor guide should not wrap to the next line. Closes [#1077](https://github.com/ckeditor/ckeditor5/issues/1077). ([61c6ad6](https://github.com/ckeditor/ckeditor5/commit/61c6ad6))
* The table dropdown in the document editor snippet should not be cut off. Closes [#1069](https://github.com/ckeditor/ckeditor5/issues/1069). ([bed8e70](https://github.com/ckeditor/ckeditor5/commit/bed8e70))


## [10.0.1](https://github.com/ckeditor/ckeditor5/compare/v10.0.0...v10.0.1) (2018-05-22)

## Release notes

We would like to announce the release of CKEditor 5 v10.0.1 that contains a security fix for the [Link package](http://npmjs.com/package/@ckeditor/ckeditor5-link), so an upgrade is highly recommended for all CKEditor 5 installations that include it. Additionally, this release fixes an issue with the decoupled editor that blocked enabling real-time collaboration in this editor.

You can read more in the [blog post](https://ckeditor.com/blog/CKEditor-5-v10.0.1-released/).

### Dependencies

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.1)


## [10.0.0](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Release notes

The first stable release of CKEditor 5 🎉🎉🎉

You can read a summary blog post here: https://ckeditor.com/blog/CKEditor-5-v10.0.0-the-future-of-rich-text-editing-looks-stable/.

PS. We decided to skip version numbers lower than v5.0.0 to avoid collisions with [CKEditor 3-4](http://github.com/ckeditor/ckeditor-dev).

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.0.0)


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Release notes

This is a minor release that mainly focuses on stabilizing the [two-step caret movement around links](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/whats-new.html#caret-movement-around-links).

A breaking change was introduced in the [document editor build](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#document-editor) – refer to its [changelog](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.4) for more information.

Finally, two new plugins were introduced – [`ParagraphButtonUI`](https://ckeditor.com/docs/ckeditor5/latest/api/module_paragraph_paragraphbuttonui-ParagraphButtonUI.html) and [`HeadingButtonsUI`](https://ckeditor.com/docs/ckeditor5/latest/api/module_heading_headingbuttonsui-HeadingButtonsUI.html) which make it possible to replace the `headings` dropdown with separate buttons for each heading level.

PS. The `1.0.0-beta.3` version number was skipped in order to align the project version number which diverged from builds version numbers

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-font/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-beta.4)


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-beta.2)

### Other changes

* `@ckeditor/ckeditor5-cloudservices` was renamed to `@ckeditor/ckeditor5-cloud-services` and `@ckeditor/ckeditor-cloudservices-core` to `@ckeditor/ckeditor-cloud-services-core`. ([65380a0](https://github.com/ckeditor/ckeditor5/commit/65380a0))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Dependencies

New packages:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v1.0.0-beta.1)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-cloudservices](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloudservices): v1.0.0-alpha.1 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-cloudservices/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-beta.1)


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5.git/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Dependencies

New packages:

* [@ckeditor/ckeditor5-cloudservices](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloudservices): [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-cloudservices/releases/tag/v1.0.0-alpha.1)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-alpha.2)

### Bug fixes

Besides changes in the dependencies, this version also contains the following bug fixes:

* Brought back `@ckeditor/ckeditor5-editor-classic` which got mistakenly removed from the main `package.json` just before the release. Closes [#585](https://github.com/ckeditor/ckeditor5/issues/585). ([c2d246b](https://github.com/ckeditor/ckeditor5/commit/c2d246b))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5/compare/v0.11.0...v1.0.0-alpha.1) (2017-10-03)

New packages:

* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-alpha.1)

Major releases (possible breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v0.1.1 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v0.3.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.7.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.8.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.11.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v0.3.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.7.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.8.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.7.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.4 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-alpha.1)

BREAKING CHANGES:

Besides breaking changes introduced in the dependencies, the following breaking changes were introduced:

* The `@ckeditor/ckeditor5-build-balloon-toolbar` package was renamed to `@ckeditor/ckeditor5-build-balloon`.
* The `@ckeditor/ckeditor5-editor-balloon-toolbar` package was renamed to `@ckeditor/ckeditor5-editor-balloon`.
* The `@ckeditor/ckeditor5-presets` package was renamed to `@ckeditor/ckeditor5-essentials` and the `Article` preset plugin was made a development util. See [ckeditor/ckeditor5-essentials#1](https://github.com/ckeditor/ckeditor5-presets/issues/1).


## [0.11.0](https://github.com/ckeditor/ckeditor5/compare/v0.10.0...v0.11.0) (2017-09-03)

New packages:

* [@ckeditor/ckeditor5-build-balloon-toolbar](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-toolbar): [v0.1.0](https://github.com/ckeditor/ckeditor5-build-balloon-toolbar/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): [v0.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-editor-balloon-toolbar](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon-toolbar): [v0.1.0](https://github.com/ckeditor/ckeditor5-editor-balloon-toolbar/releases/tag/v0.1.0)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.5.1 => [v0.6.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.8.1 => [v0.9.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v0.2.0 => [v0.3.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v0.3.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.8.1 => [v0.9.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.3 => [v0.8.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.10.0 => [v0.11.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.11.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.6.1 => [v0.7.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): v0.2.2 => [v0.3.0](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.3.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.9.0 => [v0.10.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.8.1 => [v0.9.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v0.1.0 => [v0.2.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v0.2.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v0.1.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.3 => [v0.4.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.4)


## [0.10.0](https://github.com/ckeditor/ckeditor5/compare/v0.9.0...v0.10.0) (2017-05-07)

New packages:

* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): [v0.1.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v0.1.0)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.5.0 => [v0.6.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.9.0 => [v0.10.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.5.0 => [v0.6.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.9.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.5.0 => [v0.5.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.5.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.8.0 => [v0.8.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.8.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v0.1.1)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.8.0 => [v0.8.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.8.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.2 => [v0.7.3](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.7.3)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v0.1.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.6.0 => [v0.6.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.6.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.2 => [v0.4.3](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.3)
* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): v0.2.1 => [v0.2.2](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.2.2)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.8.0 => [v0.8.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.8.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v0.1.1)


## [0.9.0](https://github.com/ckeditor/ckeditor5/compare/v0.8.0...v0.9.0) (2017-04-05)

New packages:

* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): [v0.1.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): [v0.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): [v0.1.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): [v0.1.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v0.1.0)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.4.1 => [v0.5.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.5.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.7.1 => [v0.8.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.4.1 => [v0.5.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.5.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.4.0 => [v0.5.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.5.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.5.1 => [v0.6.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.5.1 => [v0.6.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.6.1 => [v0.7.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.6.1 => [v0.7.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.7.1 => [v0.8.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.7.1 => [v0.8.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.9.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.1 => [v0.7.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.7.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.1 => [v0.4.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.2)


## [0.8.0](https://github.com/ckeditor/ckeditor5/compare/v0.7.0...v0.8.0) (2017-03-06)

New packages:

* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): [v0.1.1](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.1.1)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.3.0 => [v0.4.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.4.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.8.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.4.0 => [v0.4.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.4.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.7.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.4.0 => [v0.4.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.4.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.7.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.5.0 => [v0.5.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.5.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.5.0 => [v0.5.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.5.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.0 => [v0.4.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.6.0 => [v0.6.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.6.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.6.0 => [v0.6.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.6.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.7.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.7.1)
