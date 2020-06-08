Changelog
=========

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
