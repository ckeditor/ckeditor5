Changelog
=========

## [48.0.0](https://github.com/ckeditor/ckeditor5/compare/v47.6.1...v48.0.0) (March 31, 2026)

We are happy to announce the release of CKEditor 5 v48.0.0.

### Release highlights

This major release improves CKEditor AI and tables, completes the sunset of old installation methods, changes the default `Export to PDF` converter API version, and introduces a unified structure for root-related configuration.

#### Old installation methods sunset

With this release, we've officially completed the transition to our modern installation methods — a milestone we're excited to reach! 🎉

First [introduced in CKEditor 5 v42.0.0 in June 2024](https://ckeditor.com/blog/ckeditor-42-0-0-release-highlights/), these new methods were designed to simplify the developer workflow, reduce configuration overhead, and unlock faster, more consistent updates. With the old methods now fully retired, we can focus all our energy on delivering new features, improving performance, and moving the platform forward.

If your project still relies on old installation methods, migrate to the [new installation methods](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html) to continue updating to this and later versions of CKEditor 5. 

If migrating in the near term is not feasible, you can extend support for legacy installation methods with [CKEditor 5 Long Term Support (LTS)](https://ckeditor.com/ckeditor-5-lts/).

#### ⭐ CKEditor AI improvements

The styling of suggestion previews in [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html), [AI Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html), [AI Quick Actions](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-actions.html), and [AI Translate](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html) now more closely matches the content in the editing area, providing a more consistent visual experience. Initialization has also been optimized by caching model requests, reducing redundant network calls.

Colors used across the AI package are now available through a shared CSS variable palette, making AI components easier to customize. A new [programmatic API guide](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html) also describes how to interact with AI features from code.

#### Table improvements

The editor now recognizes legacy HTML table attributes during upcasting, preserving styling from older HTML content and improving compatibility with CKEditor 4.

* The `<table border="N">` attribute is now converted to `tableBorderWidth`.
* The `<table cellpadding="N">` attribute is now converted to `tableCellPadding`.

Several default table behaviors have also been updated:

* Conversion of `border="0"` to borderless tables is now enabled by default.
* Table alignment is now output as CSS classes by default. Using inline styles is still possible with the `useInlineStyles` option.
* Support for the `scope` attribute in table header cells is now enabled by default.
* Added support for table footers, thanks to a community contribution from [@star-szr](https://github.com/star-szr).

#### Export to PDF default version change

The Export to PDF feature now defaults to version 2 of the converter API, so you'll enjoy a range of [powerful enhancements](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#new-features-in-v2) right out of the box — including advanced header and footer configurations, flexible page sizing, PDF metadata editing, owner password protection, and digital signature support. 

Since the new version may produce slightly different output than version 1, we recommend reviewing the new [default configuration](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#default-configuration). 

If you need to keep the previous behavior, simply set the `version` property in the `exportPdf` configuration object. See the [feature documentation](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#configuration) for full details on both API versions.

#### Unified root configuration structure

Editor configuration options related to roots, such as `initialData`, `placeholder`, and `label`, are now grouped under `config.root` for single-root editors and `config.roots` for multi-root editors. This provides a more consistent structure for configuring editor roots.

The previous top-level configuration options remain functional but are now deprecated. See the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#root-configuration-migration-and-deprecated-top-level-options) for migration details.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html) to learn more about these changes.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Simplified AI and Uploadcare configuration structures by replacing enums with plain string values. Refer to the official updating guide for [AI](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#use-of-string-values-instead-of-enums) and [Uploadcare](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#removal-of-enum-as-uploadcare-source-type).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Renamed the `check` property to `commandId` in the `ai.chat.shortcuts` configuration. Refer to the [official updating guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#ai-chat-shortcuts).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the `label` property in place of `displayedPrompt` in the `ai.quickActions.extraCommands` configuration. The `displayedPrompt` property is now required only for extra commands with type `'chat'`. Refer to the [official updating guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#ai-quick-actions).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed the `type` property values in the `ai.quickActions.extraCommands` configuration from uppercase to lowercase. Refer to the [official updating guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#ai-quick-actions).
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: The `config.rootsAttributes` and `config.lazyRoots` multi-root editor config options have been removed. See [#19885](https://github.com/ckeditor/ckeditor5/issues/19885).

  The `config.roots` option should be used instead to define the editor roots and their attributes.

  The `config.roots.<rootName>.modelAttributes` property should be used to define the attributes of a root, while
  the `config.roots.<rootName>.lazyLoad` property should be used to define whether a root should be lazy loaded or not.

  Note that `config.roots.<rootName>.lazyLoad` property is now deprecated and will be removed in the future.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table alignment is now output as CSS classes instead of inline styles by default. See [#3225](https://github.com/ckeditor/ckeditor5/issues/3225).

  It can be reverted to the previous behaviour by setting the `useInlineStyles` configuration option to `true`.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Changed the default value of `table.tableLayout.stripFigureFromContentTable` from `true` to `false`. See [#19771](https://github.com/ckeditor/ckeditor5/issues/19771).

  As a result, the `<figure>` wrapper is now preserved on content tables by default when the layout tables feature is enabled.
* CKEditor 5 DLL builds are no longer available due to the deprecation of legacy installation methods. See the [migration path](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/dll-builds.html). See [#17779](https://github.com/ckeditor/ckeditor5/issues/17779).
* CKEditor 5 packages no longer ship the `src/`, `theme/` and `lang/` directories on npm due to the deprecation of legacy installation methods. See the [migration path](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/customized-builds.html). See [#17779](https://github.com/ckeditor/ckeditor5/issues/17779).
* All styles previously shipped in `@ckeditor/ckeditor5-theme-lark` have been redistributed to the appropriate packages, which now provide those CSS assets directly.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: The editor no longer updates `config.initialData` during startup. Use `config.roots.main.initialData` for single-root editors and `config.roots.<rootName>.initialData` for multi-root editors. See [#19885](https://github.com/ckeditor/ckeditor5/issues/19885).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Moved the public API from `AIChat` to `AIChatController`. This affects integrations that use the `AIChat` API.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The default word breaking behavior in the content area has been updated to prevent unwanted breaks in tables. If you customized the `--ck-content-word-break` CSS variable in your integration, migrate to the new `--ck-content-overflow-wrap` variable to retain the same effect. See [#19986](https://github.com/ckeditor/ckeditor5/issues/19986).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Deep schema verification during `model.insertContent()` is now enabled by default. It is no longer behind an experimental flag. See [#19217](https://github.com/ckeditor/ckeditor5/issues/19217).

  Previously, this behavior required opting in via `config.experimentalFlags.modelInsertContentDeepSchemaVerification: true`. Now it is always active, ensuring that all elements and attributes in inserted content follow the schema - including deeply nested structures.

  If needed, you can temporarily opt out by setting `config.experimentalFlags.modelInsertContentDeepSchemaVerification: false`. Note that this option is **deprecated** and will be removed in a future release.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: `Export to PDF` now uses version `2` of the converter API by default. This may produce slightly different output, so update any converter options to match the new API. To keep version `1`, set the `version` property in the `exportPdf` configuration object.
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: The `ImportWordEditing#getToken()` method is now asynchronous and returns a promise.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The improved handling of table heading rows is now enabled by default. Rows are no longer incorrectly marked or moved as header rows when earlier rows are not header rows. See [#19431](https://github.com/ckeditor/ckeditor5/issues/19431).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added new block-level left and right alignment options. The editor also recognizes equivalent inline margin styles and converts them to these alignment types. See [#3225](https://github.com/ckeditor/ckeditor5/issues/3225).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `shallow` option used with `TableUtils#setHeadingRows` and `TableUtils#setHeadingColumns` has been renamed to `updateCellType`. See [#19431](https://github.com/ckeditor/ckeditor5/issues/19431).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for importing HTML tables with the legacy `border="0"` attribute as borderless tables. Closes [#19038](https://github.com/ckeditor/ckeditor5/issues/19038).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The experimental handling of the legacy `border="0"` HTML attribute is now enabled by default. If you had `config.experimentalFlags.upcastTableBorderZeroAttributes` in your configuration, remove it because the flag is no longer recognized. See [#19038](https://github.com/ckeditor/ckeditor5/issues/19038).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Moved `TrackChangesEditing#registerBlockAttribute()` and `TrackChangesEditing#registerInlineAttribute()` to the `SuggestionConversion` plugin in the `ckeditor5-collaboration-core` package.

  The purpose and behavior of these methods remains the same.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Suggestion marker DOM elements now use the `data-suggestion` attribute consistently.

  This may affect custom code or CSS that relies on `data-suggestion-id`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The scope of the `.ck-reset_all-excluded` class has been expanded to also include the container wearing that class (e.g. to limit inheritance of font properties).

  Because of this, elements of the CKEditor user interface excluded from the CSS reset by the usage of the `.ck-reset_all-excluded` class may be prone to unexpected styling. Please make sure to verify the visual styling of such UI elements after updating to this version.
* Updated to TypeScript `5.5.4`.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChatController` plugin now fires `replyCreated` and `interactionCreated` events when a new `AIReply` or `AIChatInteraction` is created.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the `ai.chat.context.alwaysAddSelection` configuration option. When enabled, the document selection is added to the AI Chat context automatically. This option is disabled by default.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: `Export to PDF` now uses version `2` of the converter API by default. To keep version `1`, set the `version` property in the `exportPdf` configuration object.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Added support for configuring the items available in the footnotes list styles dropdown. Pass the `listStyles` array in the configuration to choose which list styles are shown.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Added support for the `arabic-indic` list style in footnotes. It is not shown in the dropdown by default, but it can be added to the list of available styles using the `listStyles` configuration option.
* **[remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format)**: The remove format feature now clears inherited formatting from empty paragraphs and other block elements. Closes [#19851](https://github.com/ckeditor/ckeditor5/issues/19851).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced support for changing table cell types between `data` and `header`. Closes [#16730](https://github.com/ckeditor/ckeditor5/issues/16730).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced support for the `scope` attribute in table header cells to improve semantic markup and screen reader accessibility. This feature is enabled by default and can be disabled by setting `config.table.tableCellProperties.scopedHeaders` to `false`. Closes [#3175](https://github.com/ckeditor/ckeditor5/issues/3175).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for table footers. You can now specify the number of footer rows in a table. The table row context menu has been updated with a new `Footer row` toggle to control this setting. Closes [#12952](https://github.com/ckeditor/ckeditor5/issues/12952).

  This feature is disabled by default and can be enabled by setting `config.table.enableFooters` to `true`.

  Thanks to [@star-szr](https://github.com/star-szr).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Preserved table borders from legacy HTML content. Closes [#19633](https://github.com/ckeditor/ckeditor5/issues/19633).

  When loading HTML content that uses the deprecated `border` attribute on tables, the editor now keeps the original border width instead of ignoring it.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Preserved table cell padding from legacy HTML content. Closes [#19634](https://github.com/ckeditor/ckeditor5/issues/19634).

  When loading HTML content that uses the deprecated `cellpadding` attribute on tables, the editor now keeps the original cell padding instead of ignoring it.

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where new lines were ignored in the user message displayed in the AI Chat feed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Reset the "Show changes" button state after the balloon for an AI Quick Action is displayed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed the incorrect order of user messages and AI agent responses in the AI Chat feed when loading a conversation from history.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an error thrown when the user stopped an ongoing AI Chat interaction and the remaining replies were not flushed to the UI.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed inline annotations so they stay attached to the target element when it scrolls inside its parent container.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Fixed excessive word breaking in tables rendered in the content area. Words will now only break when they genuinely overflow their container, preventing awkward splits in narrow table columns. Closes [#19986](https://github.com/ckeditor/ckeditor5/issues/19986).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Removed the unintended public exports `autoParagraphEmptyRoots`, `isParagraphable`, and `wrapInParagraph`.

  These utilities were not part of the supported public API.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Gradients in background styles are no longer ignored and are properly normalized. Closes [#19787](https://github.com/ckeditor/ckeditor5/issues/19787).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed background normalization so it no longer drops layers from the `background` CSS shorthand. Multi-layer backgrounds are now parsed and serialized correctly. See [#19787](https://github.com/ckeditor/ckeditor5/issues/19787).
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed the footnotes configuration typings to use `defaultListStyle` instead of `defaultStyle`.
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: Improved the initialization time of the `ImportWordEditing` plugin. Token retrieval now runs in the background, so it does not block editor startup.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Removed the unintended public export `ensureSafeUrl`.

  This utility was not part of the supported public API.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Fixed the inconsistent font family in collaboration user markers.
* **[show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks)**: Fixed the `Show blocks` feature so block labels render in all editor types when the `dir` attribute is present either on the editable element itself or on its ancestor wrapper. Closes [#19866](https://github.com/ckeditor/ckeditor5/issues/19866).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed suggestion marker DOM elements that used `data-suggestion-id` instead of `data-suggestion`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Updated the CSS reset rules so `.ck-reset_all-excluded` also applies to the container that uses this class. Closes [#19967](https://github.com/ckeditor/ckeditor5/issues/19967).

  This change reduces the impact of the CKEditor's `.ck-reset_all` class in DOM elements that are explicitly excluded from the reset by the `.ck-reset_all-excluded` class.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Disabling a menu bar menu now also closes it if it was open, preventing an open panel from remaining in a non-interactive state. Closes [#18214](https://github.com/ckeditor/ckeditor5/issues/18214).

### Other changes

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root), [watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Reorganized root-related editor configuration under `config.root` for single-root editors and `config.roots` for multi-root editors. Closes [#19885](https://github.com/ckeditor/ckeditor5/issues/19885).

  The `config.initialData`, `config.placeholder`, and `config.label` options are deprecated in favor of `config.root.initialData`, `config.root.placeholder`, and `config.root.label`.
  In multi-root editors, define these options per root using `config.roots.<rootName>.initialData`, `config.roots.<rootName>.placeholder`, and `config.roots.<rootName>.label`.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced new table block alignments, `blockLeft` and `blockRight`, allowing tables to be aligned to the left or right without text wrapping. The table properties balloon now includes two new buttons to easily apply these alignments. Closes [#3225](https://github.com/ckeditor/ckeditor5/issues/3225), [#6174](https://github.com/ckeditor/ckeditor5/issues/6174), [#8412](https://github.com/ckeditor/ckeditor5/issues/8412), [#8752](https://github.com/ckeditor/ckeditor5/issues/8752), [#9982](https://github.com/ckeditor/ckeditor5/issues/9982), [#10867](https://github.com/ckeditor/ckeditor5/issues/10867), [#14921](https://github.com/ckeditor/ckeditor5/issues/14921), [#17932](https://github.com/ckeditor/ckeditor5/issues/17932), [#19337](https://github.com/ckeditor/ckeditor5/issues/19337).

  Added additional spacing between a table and the surrounding text when wrapping is enabled. This prevents issues such as list markers overlapping with the table when placed next to each other.

  Added support for pasting to and from MS Word for all table alignment types: `left`, `right`, `center`, `blockLeft`, and `blockRight`.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Moved `TrackChangesEditing#registerBlockAttribute()` and `TrackChangesEditing#registerInlineAttribute()` to the `SuggestionConversion` plugin in the `ckeditor5-collaboration-core` package.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChatController` is now a public class. Moved public API from `AIChat` to `AIChatController` to avoid duplication.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Decreased the line height in the AI Chat prompt input field to match feed messages.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChat#addSelectionToChatContext()` now returns `void` instead of `Promise`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Suggestion previews in AI features now follow the styling of the content in the editing area more closely.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Optimized AI features initialization by caching model requests, reducing redundant network calls and improving load performance.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved handling of agent responses in the Markdown format.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Marked selected AI programmatic APIs as experimental. These APIs are production-ready but may change in minor releases without the standard deprecation policy.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a shared CSS variable palette for colors used across the `ckeditor5-ai` package.

  This makes AI components easier to customize.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Fixed an issue where the CKBox dialog was not visible in fullscreen mode. Closes [#19290](https://github.com/ckeditor/ckeditor5/issues/19290).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Model#hasContent()` can now check `ModelSelection` and `ModelDocumentSelection` instances. See [#19847](https://github.com/ckeditor/ckeditor5/issues/19847).
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Enhanced `MarkdownGfmMdToHtml` to support custom plugins and to export the default plugin chain used by the Markdown parser.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced `Rect.getDomElementRects()` method that conveniently retrieves all `Rects` of a DOM element while preserving their source for further processing (e.g. `Rect#getVisible()`).
* Replaced string-based soft requirements with plugin constructors across selected packages to improve developer experience and align plugin dependency handling across repositories. This update also adjusts package metadata and dependencies to match the new constructor-based requirements. See [#17779](https://github.com/ckeditor/ckeditor5/issues/17779). Closes [#19747](https://github.com/ckeditor/ckeditor5/issues/19747).

  The following dependencies no longer rely on soft requirements:

  * `ckeditor5-ai`: `CloudServices`.
  * `ckeditor5-ckbox`: `LinkEditing`, `PictureEditing`, `ImageUtils`, `ImageEditing`, `ImageUploadEditing`, `ImageUploadProgress`, `CloudServices`.
  * `ckeditor5-ckfinder`: `Link`, `LinkEditing`, `CKFinderUploadAdapter`.
  * `ckeditor5-easy-image`: `CloudServices`, `ImageUpload`.
  * `ckeditor5-emoji`: `Mention`.
  * `ckeditor5-export-pdf`: `CloudServices`.
  * `ckeditor5-export-word`: `CloudServices`.
  * `ckeditor5-heading`: `Paragraph`.
  * `ckeditor5-import-word`: `CloudServices`.
  * `ckeditor5-link`: `ImageEditing`, `ImageUtils`, `ImageBlockEditing`.
  * `ckeditor5-list-multi-level`: `ListEditing`.
  * `ckeditor5-merge-fields`: `ImageUtils`, `ImageEditing`, `Mention`.
  * `ckeditor5-paste-from-office-enhanced`: `PasteFromOffice`.
  * `ckeditor5-real-time-collaboration`: `Comments`, `CommentsRepository`, `CloudServices`, `RevisionHistory`, `TrackChanges`, `TrackChangesEditing`.
  * `ckeditor5-revision-history`: `Users`.
  * `ckeditor5-slash-command`: `Mention`.
  * `ckeditor5-style`: `GeneralHtmlSupport`.
  * `ckeditor5-track-changes`: `Comments`, `CommentsRepository`, `Annotations`, `EditorAnnotations`.
  * `ckeditor5-typing`: `Delete`, `Input`.
  * `ckeditor5-uploadcare`: `PictureEditing`, `ImageUploadEditing`, `ImageUploadProgress`, `ImageEditing`, `ImageUtils`.
* Updated `es-toolkit` to `v1.45.1`.
* Updated translations.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.0.0): v47.6.1 => v48.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.0.0): v47.6.1 => v48.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.0.0): v47.6.1 => v48.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.0.0): v47.6.1 => v48.0.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.0.0): v47.6.1 => v48.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.0.0): v47.6.1 => v48.0.0
</details>


## [47.6.1](https://github.com/ckeditor/ckeditor5/compare/v47.6.0...v47.6.1) (March 11, 2026)

We are releasing CKEditor 5 v47.6.1, a patch that fixed three regressions discovered after v47.6.0.

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: Fixed undo marker restoration for markers spanning multiple paragraphs. Previously, comments and suggestions could be restored to incorrect ranges. Closes [#19916](https://github.com/ckeditor/ckeditor5/issues/19916).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Resolved an issue where AI Chat would crash when attempting to open a past conversation that was created by a model no longer available.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Fixed a regression where the caret (`|`) jumped over an empty paragraph when navigating with arrow keys near widgets. Closes [#19812](https://github.com/ckeditor/ckeditor5/issues/19812).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.6.1): v47.6.0 => v47.6.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.6.1): v47.6.0 => v47.6.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.6.1): v47.6.0 => v47.6.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.6.1): v47.6.0 => v47.6.1
</details>


## [47.6.0](https://github.com/ckeditor/ckeditor5/compare/v47.5.0...v47.6.0) (March 4, 2026)

We are excited to announce the release of CKEditor 5 v47.6.0.

### Security update

A Cross-Site Scripting (XSS) vulnerability has been discovered in the General HTML Support feature ([CVE-2026-28343](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-jrqm-vmqc-gm93)). This vulnerability could be triggered by inserting specially crafted markup, leading to unauthorized JavaScript code execution if the editor instance used an unsafe General HTML Support configuration.

This vulnerability affects only installations where the editor configuration meets the following criteria:

* [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) is enabled,
* General HTML Support configuration allows inserting unsafe markup (see [Security](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html#security) section to learn more).

You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-jrqm-vmqc-gm93) and [contact us](mailto:security@cksource.com) if you have more questions.

### Release highlights

This release introduces new list indentation capabilities and expands the customization options for CKEditor AI, giving integrators more control over the AI-powered editing experience.

#### ⭐ CKEditor AI On-premises available

CKEditor AI is now available as an **on-premises deployment**, giving you full control over the AI service by running it on your infrastructure. The on-premises version supports everything the cloud option offers, plus:

* **Custom AI models and providers** — use your models from OpenAI, Google Cloud, Microsoft Azure, or self-hosted solutions.
* **MCP (Model Context Protocol) support** — extend the AI with custom external tools by connecting MCP servers, enabling use cases like searching internal knowledge bases or querying company databases directly from the AI chat.

Learn more about [deployment options](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-deployment.html) and [MCP support](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-mcp.html).

#### ⭐ Custom AI Review checks

The [AI Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html) feature now supports **custom review commands** defined by integrators. Until now, the review was limited to built-in commands like proofreading, clarity, readability, and tone adjustment. With this release, you can create review commands tailored to your editorial guidelines, brand voice, or domain-specific quality standards.

Custom commands are registered via `config.ai.review.extraCommands` and made visible in the UI through `config.ai.review.availableCommands`. The same option lets you reorder, filter, or shorten the list of built-in commands to match your needs. See the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html#adding-extra-commands) for details.

#### ⭐ AI Chat Shortcuts

We are introducing **AI Chat Shortcuts**, a new opt-in plugin that displays configurable shortcut buttons in the [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) panel before the first message is sent. Shortcuts provide clear, actionable entry points that guide users toward the most useful AI capabilities. From launching a predefined prompt to starting a specific review or translation flow to navigating directly to the Review or Translate tab.

Integrators define shortcuts with a name, icon, and an action. Each shortcut can also configure which AI capabilities (model, web search, reasoning) are active for the prompt. Learn more in the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html#chat-shortcuts).

#### List indentation improvements

We're streamlining and standardizing the way list indentation is handled. With improved UX, it's now possible to indent whole lists and also individual list items with consistent styling and no custom implementation required.

This improvement is compatible with Paste from Office, Export to Word, Export to PDF, and Track Changes plugins. It also provides RTL support.

#### Upgrade `@aws-sdk/client-bedrock-runtime` to the latest version

We upgraded `@aws-sdk/client-bedrock-runtime` to the latest version to address a recently disclosed security vulnerability in the `fast-xml-parser` dependency. We marked this update as a minor breaking change due to the use of dynamic imports in one of the underlying packages, which may impact certain build environments.

> [!WARNING]
> The action is required only if you use the legacy CKEditor AI Assistant with a dedicated [editor bundle](https://ckeditor.com/docs/cs/latest/guides/collaboration/editor-bundle.html).

If you use `webpack` to build an editor bundle, configure it to bundle dynamic imports eagerly:

```js
module: {
  parser: {
    javascript: {
      dynamicImportMode: 'eager'
    }
  }
}
```

If you do not use CKEditor AI with a dedicated bundle, no action is required.

#### Incoming old installation methods sunset reminder

Please note that the old installation methods will only remain available up to CKEditor 5 v48.0.0, which is planned for release at the beginning of Q2 2026. For more timeline details, refer to the [dedicated GitHub issue](https://github.com/ckeditor/ckeditor5/issues/17779).

In CKEditor 5 v42.0.0 in June 2024, we [introduced new installation methods](https://ckeditor.com/blog/ckeditor-5-new-era-installation-simplicity/) designed to improve and simplify the developer workflow. Soon, they will be the only available paths to install and use CKEditor 5.

If your project still relies on old installation methods, now is a good time to plan your next steps. We recommend choosing between these two options:

1. [Migrate to the new installation methods](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html), which are the recommended path for most users. The new installation methods provide a cleaner setup, easier upgrades, and better alignment with future CKEditor 5 releases.
2. Consider [CKEditor 5 Long-Term Support (LTS)](https://ckeditor.com/ckeditor-5-lts/). If migrating in the near term is not feasible, you can extend support for legacy installation methods.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Simplified the default greeting message shown when starting a new AI Chat conversation. To restore the previous message content, set `config.ai.chat.welcomeMessage` to the following:

  "Hi, I'm your AI assistant. Think of me as your writing buddy, reviewer, or research partner. I can suggest changes to your document, help generate ideas, offer feedback, discuss attached files, and much more!"
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Updated `@aws-sdk/client-bedrock-runtime` to version `3.994.0`. This update introduced dynamic imports in a dependency, which may affect some build environments.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the `config.ai.review.availableCommands` configuration option to customize which review commands are shown in the AI Review tab.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the `AIChatShortcuts` plugin, which displays configurable shortcuts in the AI Chat feed when starting a new conversation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added support for custom AI Review commands. Custom commands can now be configured using `config.ai.review.extraCommands`.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Added the `enable_mirror_margins` option to the V2 PDF export converter API, allowing margins to alternate between odd and even pages for double-sided layouts.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added support for the `[sandbox]` attribute on `<iframe>` elements rendered in the editing view. Filtering rules can be adjusted using the `htmlSupport.htmlIframeSandbox` configuration option.
* **[indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent)**: Added list indentation integration to the `IndentBlock` feature (enabled by default). Closes [#19490](https://github.com/ckeditor/ckeditor5/issues/19490).

  Added commands for whole-list indentation (`indentBlockList` and `outdentBlockList`) and list-item indentation (`indentBlockListItem` and `outdentBlockListItem`). Indentation can be rendered using `margin-left`/`margin-right` styles (offset-based) or CSS classes (class-based).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Added support for the `arabic-indic` list style type in the list properties plugin. Closes [#19802](https://github.com/ckeditor/ckeditor5/issues/19802).

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where using DLLs for the `AI` package together with the `TrackChanges` plugin could fail due to a `SuggestionConversion` plugin conflict.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where AI Quick Actions content overflowed in the preview window.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Starting or loading an AI chat conversation no longer closes unrelated open dialogs in the editor.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Displayed the `Selected content` label instead of `""` when the `Ask AI` action is used on selections that include non-text content, such as an image without a caption.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Displayed text from all selected table cells in the chat context pill after using `Ask AI` on a selection inside a table.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review and AI Translate no longer throw errors when users click "Stop generating" after some changes have already been generated.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Treated the `[srcdoc]` attribute of `<iframe>` elements as unsafe and sanitized it in the editing pipeline. Restricted the `[src]` attribute of `<iframe>` elements to disallow `javascript:` and `data:` URLs containing whitespace characters.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Added support for defining multiple manual link decorators that operate on the same attributes. If an automatic decorator conflicts with a manual one, only the manual one is used. Closes [#19695](https://github.com/ckeditor/ckeditor5/issues/19695).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved accessibility by reflecting table captions in the figure element `aria-labelledby` attribute. This change improves screen reader labeling for tables. Closes [#15979](https://github.com/ckeditor/ckeditor5/issues/15979).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Preserved the `<figure>` wrapper on content tables when `table.tableLayout.stripFigureFromContentTable` is set to `false` and the layout tables plugin is enabled. Closes [#19771](https://github.com/ckeditor/ckeditor5/issues/19771).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed an issue causing plugin conflicts when using the `TrackChanges` DLL together with certain features, such as `AI`.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the `config.ai.chat.welcomeMessage` configuration option to customize the greeting message shown in the AI Chat feed when starting a new conversation.
* Updated translations.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.6.0): v47.5.0 => v47.6.0

Releases containing new features:

* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.6.0): v47.5.0 => v47.6.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.6.0): v47.5.0 => v47.6.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.6.0): v47.5.0 => v47.6.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.6.0): v47.5.0 => v47.6.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.6.0): v47.5.0 => v47.6.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.6.0): v47.5.0 => v47.6.0
</details>


## [47.5.0](https://github.com/ckeditor/ckeditor5/compare/v47.4.0...v47.5.0) (February 11, 2026)

We are happy to announce the release of CKEditor 5 v47.5.0.

### Release highlights

CKEditor 5 v47.5.0 is a minor update that improves AI-assisted editing workflows and provides access to the new version of the Export to PDF feature.

#### AI Translate

The [AI Translate feature](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html) of CKEditor AI allows users to translate entire documents on the go. It provides a user interface similar to AI Review, but with translation-specific actions to streamline the process. The translation view displays the final translated document, with original snippets shown on the side for review and comparison.

#### Multiple Changes revamp and other AI improvements

We improved how multiple changes proposed by the [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) feature are presented. Suggested changes now appear as cards that can be previewed in the content and applied consistently in both single-change and multi-change scenarios. This release also includes several under-the-hood improvements.

#### Export to PDF v2

The [export to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html) feature now supports version 2 of the HTML to PDF converter API, bringing several [powerful enhancements](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#new-features-in-v2) to document generation.

Advanced header and footer configurations allow for different content on first, odd, and even pages, with support for images. Page sizes can now be set using predefined formats or custom width and height values. The new converter API also enables editing of PDF metadata fields such as title, subject, and author.

Security capabilities have been expanded with owner password protection for controlling permissions and digital signature support using PKCS#12 certificates for authenticity verification. Additional improvements include compression control for specific use cases, more precise rendering options, and experimental automatic outline generation for creating a table of contents.

#### Incoming old installation methods sunset reminder

Please note that the old installation methods will no longer be available with CKEditor 5 v48.0.0, which is planned for release at the beginning of Q2 2026. For more timeline details, refer to the [dedicated GitHub issue](https://github.com/ckeditor/ckeditor5/issues/17779).

In CKEditor 5 v42.0.0 in June 2024, we [introduced new installation methods](https://ckeditor.com/blog/ckeditor-5-new-era-installation-simplicity/) designed to improve and simplify the developer workflow. Soon, they will be the only available paths to install and use CKEditor 5.

If your project still relies on old installation methods, now is a good time to plan your next steps. We recommend choosing between these two options:

1. [Migrate to the new installation methods](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html), which are the recommended path for most users. The new installation methods provide a cleaner setup, easier upgrades, and better alignment with future CKEditor 5 releases.
2. Consider [CKEditor 5 Long Term Support (LTS)](https://ckeditor.com/ckeditor-5-lts/). If migrating in the near term is not feasible, you can extend support for legacy installation methods.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-42.html) to learn more about these changes.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The `ai.reviewMode.translations` configuration option has been moved to `ai.translate.languages`. The `ai.reviewMode` configuration namespace has been removed.

  Together with the introduction of AI Translate feature and a separate translation tab, the configuration option to define a custom language list
  has been moved to a related `ai.translate` namespace.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The `AIEditorIntegration` plugin is now required to preview the changes suggested by the AI Chat feature in a dialog window. Previously, this functionality was enabled by just loading the main `AIChat` plugin. Please make sure your integration loads the `AIEditorIntegration` plugin in order to use this functionality.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The DOM structure of the AI Chat suggestions in conversation has been changed, which may affect integrations that customized the UI and/or rely on specific CSS selectors.

  Please make sure to update your integrations to use the new DOM structure. Learn more about the changes in the migration guide provided in the project documentation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The DOM structure of the AI Chat suggestion preview dialog window has been changed which may affect integrations that customized the UI and/or rely on specific CSS selectors.

  Please make sure to update your integrations to use the new DOM structure. Learn more about the changes in the migration guide provided in the project documentation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChat#sendMessage()` takes `attributes: Record<string, unknown>` as one of its parameters now, in place of former `quickActionData`. This affects you only if you provided some customizations for the CKEditor AI chat feature.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Already existing chat conversations, which were created through AI Quick Action (e.g. "Explain" or "Summarize"), when loaded from chat history, will now display a full prompt instead of the short version. This affects only already created conversations.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Replaced `ai.chat.models.modelSelectorAlwaysVisible` configuration option with `ai.chat.models.showModelSelector`. The behavior has also been slightly updated. When set to `true` (default), the model selector dropdown is shown (when multiple models are available), or the model name is displayed (when only one model is available). When set to `false`, the selector is hidden, regardless of the number of available models.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The model's configuration options have been moved from `config.ai.chat.models` to `config.ai.models` to ensure consistent model configuration across all AI features. The model configuration is now applied uniformly in both AI Chat and AI Review Mode.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the AI Translation tab.

  A new tab dedicated to translating content has been introduced to CKEditor 5 AI. It focuses on working with translated content, streamlining
  the process of applying translation and making the whole process easier and faster for end users.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced a new look and improved operation of the AI Chat sidebar.

  * The list of changes proposed by the AI now features a sleeker design and includes a button to apply individual changes.
  * You can now preview suggested changes in a dialog window by clicking on a change in the sidebar.
  * The AI suggestion preview dialog window has been made more compact for enhanced usability.
  * Various bug fixes and other improvements.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced `AIChat#registerToolDataCallback()`. It allows for handling custom data generated by your AI tools connected to CKEditor AI backend.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced an API to allow inserting arbitrary HTML into the AI Chat feed, during AI response streaming.

  The API is passed as one of the parameters to the callback registered using `AIChat#registerToolDataCallback()`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced configuration option `ai.chat.initialConversation` that manages whether a new, or an existing past conversation is initially loaded in the AI Chat.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a new configuration option, `ai.chat.context.customItems`, that allows using external context providers and custom context items (for example, IDs instead of actual files).
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Add support for version 2 of the HTML to PDF converter API.

### Bug fixes

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image), [paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Images aligned left or right with wrapped text around them should now be correctly pasted and imported from Word into the editor. Previously, such images were incorrectly aligned using block left or block right styles. Closes [#19636](https://github.com/ckeditor/ckeditor5/issues/19636).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review active suggestion highlight in the editor content no longer disappears due to content changes made by other users in RTC.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review suggestions content in the sidebar is styled the same way as the editor content, giving it a uniform look.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where web search sources were not displayed correctly when loading conversations from chat history.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The "Add context" button in AI chat will no longer be disabled if the only available context are external resources.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an error when custom AI Quick Actions used a model that was not available in AI Chat.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Accepting suggestions from conversations loaded via chat history no longer throws errors in the console.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where messages loaded from chat history could be incorrectly duplicated in a conversation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIQuickActionsUI` now requires `AIConnector` to prevent authentication bugs when run standalone.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed an issue where inline annotations were not displayed correctly when the editor was initialized in a hidden container.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Table block alignment now behaves as expected in Microsoft Outlook, preventing text from wrapping around the table when it shouldn't.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: An inline content (`<img>`) should not be stripped out of `<div>` inside of `<dd>` tag. Closes [#19709](https://github.com/ckeditor/ckeditor5/issues/19709).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Resizing the last column of a layout table no longer increases the column size more than expected. Closes [#19644](https://github.com/ckeditor/ckeditor5/issues/19644).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed parsing units of deprecated table width attribute. Closes [#19665](https://github.com/ckeditor/ckeditor5/issues/19665).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: `BalloonToolbar` will no longer reposition itself when invisible in the `ContextualBalloon` stack. Closes [#19696](https://github.com/ckeditor/ckeditor5/issues/19696).

  This prevents interfering with other features that might be using the `ContextualBalloon` stack.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: `Rect#getDomRangeRects()` now sets the DOM Range as a source for each returned `Rect`, improving visibility and positioning of floating UIs that depend on `Rect#getVisible()`. Closes [#19705](https://github.com/ckeditor/ckeditor5/issues/19705).
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: `Rect#getVisible()` should better discover relationships between positioned and clipping parents. Closes [#19707](https://github.com/ckeditor/ckeditor5/issues/19707).

  This avoids issues with floating UIs that depend on `Rect#isVisible()` and do not hide when they should.

### Other changes

* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles), [engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font), [highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight), [language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language)**: Fixed a discrepancy where applying a text attribute (such as bold) to a selection that included empty paragraphs did not set stored selection attributes on those paragraphs. See [#19664](https://github.com/ckeditor/ckeditor5/issues/19664). Closes [#18430](https://github.com/ckeditor/ckeditor5/issues/18430).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Suggestions shown in AI Review sidebar now include all formatting (bold, italics, etc.) and non-plain text elements (for example, links).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChat#sendMessage()` now allows passing `attributes` (arbitrary custom metadata) together with the submitted user message. You can also pass `attributes.displayedPrompt` to display a different prompt instead of the one used to query the AI model (`userMessage`).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: If there is only one source of AI chat context available, it will be automatically selected when the "Add context" button is pressed instead of showing a dropdown with only one option.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: As more models are supported by the AI feature, only a set of recommended models will be displayed in the AI chat models dropdown. You can configure the list of displayed models via `ai.chat.models.displayedModels` in the config.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Conversations loaded from chat history are no longer blocked for models that are not recommended or not displayed, as long as the provider supports the model.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Replaced `ai.chat.models.modelSelectorAlwaysVisible` configuration option with `ai.chat.models.showModelSelector`. When set to `true` (default), the model selector dropdown is shown (when multiple models are available), or the model name is displayed (when only one model is available). When set to `false`, the selector is hidden, regardless of the number of available models.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a clear explanation in AI Chat for conversations loaded from history, explaining why AI proposals (document modifications) for past conversations cannot be applied or added as suggestions.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The model's configuration options have been moved from `config.ai.chat.models` to `config.ai.models` to ensure consistent model configuration across all AI features. The model configuration is now applied uniformly in both AI Chat and AI Review Mode.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Upgrade `fast-xml-parser` to version `5.3.4` to address security advisories reported by automated scanners. CKEditor 5 does not rely on the affected code paths and is not impacted.
* **[icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons)**: Added new icons: `IconBoxWithCheck`, `IconBoxWithCross`, `IconBoxWithPin`.
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: Added the `undoStepBatch` property to the `dataInsert` event. It allows including custom model changes (side effects) in the same undo step as the import operation.
* Optimized compression and decompression mechanisms used in real-time collaboration to avoid delays when a user joins a document that was heavily edited.
* Update [`diff`](https://www.npmjs.com/package/diff) dependency to address security advisories reported by automated scanners.

  The affected functions (`parsePatch()`, `applyPatch()`) **are not used** in this project (we only rely on `diffArrays()`), so this change is released primarily to reduce false-positive security alerts.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.5.0): v47.4.0 => v47.5.0

Releases containing new features:

* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.5.0): v47.4.0 => v47.5.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.5.0): v47.4.0 => v47.5.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.5.0): v47.4.0 => v47.5.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.5.0): v47.4.0 => v47.5.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.5.0): v47.4.0 => v47.5.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.5.0): v47.4.0 => v47.5.0
</details>


## [47.4.0](https://github.com/ckeditor/ckeditor5/compare/v47.3.0...v47.4.0) (January 14, 2026)

We are happy to announce the release of CKEditor 5 v47.4.0.

### Release highlights

This is a minor update focused on improving content editing workflows and data compatibility. We are introducing better visualization for table borders, enhanced image alignment handling, and several improvements to AI and email features.

#### Experimental table cell type support

We are introducing an experimental `tableCellTypeSupport` flag that enables changing table cell types between data and header cells (`th`). This feature provides more flexibility when working with complex table structures. Read more about how to enable it in the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-47.html#experimental-table-cell-type-support).

#### Hidden table borders visualization

We are introducing a new `config.table.showHiddenBorders` configuration option (enabled by default) that helps editors work with tables that have hidden borders. When the editor detects inline `border:none` or `border-style:none` declarations on table and cell elements, it renders dashed helper borders in the editing view. This makes it easier to see the table structure while editing without affecting the output data. For strict WYSIWYG scenarios where you want the editing view to match the output exactly, this visualization can be disabled.

#### Email compatibility improvements

We improved the [email styles transformation](https://ckeditor.com/docs/ckeditor5/latest/features/email-editing/email.html#email-specific-style-transformations) with better appearance of resized inline images in classic Outlook clients. Additionally, the new optional `useFigureToTableFallback` flag in the email styles transformers can replace `figure` (block images) with tables to improve alignment and width handling in older email clients with limited CSS support.

#### Other improvements and fixes

* Fixed multiple issues in the [AI features](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html), including improved tooltips for web search sources in AI Chat, proper handling of Quick Actions when opening the AI Chat panel, resolved loading state issues in the AI Review sidebar, and others.
* The editor now recognizes CSS `float` style on images (e.g., `style="float: left"` or `style="float: right"`) and automatically maps it to left/right image alignment. This works for both inline and block images, improving compatibility when pasting content from external sources or loading legacy content. If custom image styles are configured, they take precedence over the float style.
* The Emoji plugin can now be used with the [Emoji v17.0 dataset](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-47.html#updated-the-emoji-plugin-dataset), which has been uploaded to the CKEditor CDN. This update does not change the default emoji version used by CKEditor.

#### Incoming old installation methods sunset reminder

Please note that the old installation methods will only remain available up to CKEditor 5 v48.0.0, which is planned for release at the beginning of Q2 2026. For more timeline details, refer to the [dedicated GitHub issue](https://github.com/ckeditor/ckeditor5/issues/17779).

In CKEditor 5 v42.0.0 in June 2024, we [introduced new installation methods](https://ckeditor.com/blog/ckeditor-5-new-era-installation-simplicity/) designed to improve and simplify the developer workflow. Soon, they will be the only available paths to install and use CKEditor 5.

If your project still relies on old installation methods, now is a good time to plan your next steps. We recommend choosing between these two options:

1. [Migrate to the new installation methods](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html), which are the recommended path for most users. The new installation methods provide a cleaner setup, easier upgrades, and better alignment with future CKEditor 5 releases.
2. Consider [CKEditor 5 Long Term Support (LTS)](https://ckeditor.com/ckeditor-5-lts/). If migrating in the near term is not feasible, you can extend support for legacy installation methods.

### Features

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Added support for visualizing hidden table and table cell borders through a new configuration option: `table.showHiddenBorders` (enabled by default). The editor now detects inline `border:none` and `border-style:none` declarations on table and cell elements and renders dashed helper borders in the editing view. This visualization can be disabled for strict WYSIWYG scenarios. Closes [#19039](https://github.com/ckeditor/ckeditor5/issues/19039).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a new tooltip for web search sources in the AI Chat.

  The tooltip now displays the full link, favicon, and link title.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Added an inline-styles transformation that improves the appearance of resized inline images in classic Outlook clients.

  Additionally, introduced an optional `useFigureToTableFallback` flag in the email inline-styles transformers. When enabled, figures (block images) are replaced with tables to improve alignment and width handling in older email clients that have limited CSS support. This enhances compatibility but adds extra markup, which may affect layout in some cases.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: The Emoji plugin can now be used together with the [Emoji v17.0](https://emojipedia.org/emoji-17.0/) dataset, which has been uploaded to the CKEditor CDN. This update does not change the default emoji version used by CKEditor. Closes [#19394](https://github.com/ckeditor/ckeditor5/issues/19394).

### Bug fixes

* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles), [icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons)**: Fixed the superscript and footnote icons to properly inherit colors from CSS instead of using hardcoded fill values. Closes [#19464](https://github.com/ckeditor/ckeditor5/issues/19464).
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email), [export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Fixed incorrect table alignment in Classic Outlook when exporting inline styles with `getEmailInlineStylesTransformations`.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The editor no longer crashes when calling `getData()` on content containing a table with custom styling, provided that the `TablePropertiesEditing` and `PlainTableOutput` plugins are loaded without the `TableProperties` plugin. Closes [#19512](https://github.com/ckeditor/ckeditor5/issues/19512).
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block), [typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Fixed an error thrown when creating a code block via backticks on some keyboard layouts (e.g. US International). Closes [#18926](https://github.com/ckeditor/ckeditor5/issues/18926).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: Fixed a bug where undoing changes to root attributes (e.g. the `order` attribute) would not restore the correct value. Closes [#19483](https://github.com/ckeditor/ckeditor5/issues/19483).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review sidebar is no longer stuck in loading state for specific AI API responses with no real changes in the content.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat related Quick Actions now open the AI Chat if it is closed or if another tab is currently active.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI feature now functions correctly when used with the Title plugin.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The document will no longer be added to the context automatically when it is disabled via the `ai.chat.context.document.enabled` config.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Quick Actions that use AI Chat are now hidden when the document context is disabled via the `ai.chat.context.document.enabled` config, as they require the document to function properly.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Editor toolbar is now always visible when AI Review suggestion is accepted or dismissed.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: The footnotes' definitions are no longer lost when pasting content that lacks the `application/ckeditor5-footnotes` data but contains footnote references and definitions. The plugin now extracts and merges footnote definitions from the pasted content, ensuring that existing footnotes are preserved and new ones are added correctly.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The editor and its UI now recognize the CSS `float` style on images (e.g. `style="float: left"` or `style="float: right"`) and map it to left/right image alignment. This applies to both inline and block images. If custom image styles are configured, then the `float` style is ignored. Closes [#19521](https://github.com/ckeditor/ckeditor5/issues/19521).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed an issue where setting editor data with multiple images or images mixed with text inside a single link would result in only the first image being preserved and the rest of the content being removed. Closes [#18961](https://github.com/ckeditor/ckeditor5/issues/18961).
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Added a `strict-origin-when-cross-origin` attribute to the `iframe` tag when embedding YouTube videos. It corresponds with the YouTube documentation and resolves occurrences of error 153 when embedding YouTube videos.

  Thanks to [@ampaze](https://github.com/ampaze).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Fixed a crash in pagination that occurred when a to-do list item was the first element in the editor.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Fixed an issue with the incorrect order of page breaks for tables containing specific data.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Stopped the revision history loading overlay spinner from animating while hidden. Closes [ckeditor/ckeditor5#19558](https://github.com/ckeditor/ckeditor5/issues/19558).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed incorrect table rows moving as header row when preceding rows are not header rows. Closes [#19431](https://github.com/ckeditor/ckeditor5/issues/19431).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The default alignment for table headers in the output has been set to left to match the editing view and ensure consistent rendering across all browsers. Closes [#19454](https://github.com/ckeditor/ckeditor5/issues/19454).
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Disable text transformations inside inline code so automatic text transformation does not convert typed text. Closes [#19557](https://github.com/ckeditor/ckeditor5/issues/19557).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Guarded dropdown panel selection handling against non-element targets to avoid errors when selecting text. Closes [#19565](https://github.com/ckeditor/ckeditor5/issues/19565).

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The Track Changes suggestion markers are always grayed out in AI review, even if active.

  This makes it easier to navigate when review check is active in content with many Track Changes suggestions and keeps full focus on changes created by AI.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI models displayed in Review and Chat are now sorted by their model family.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The `Editor` class constructor now detects if the provided `EditorConfig` is not an object. Closes [#18072](https://github.com/ckeditor/ckeditor5/issues/18072).

  The common source of this error is when an editor class (e.g., `ClassicEditor`) is mistakenly included in the plugins list when initializing Editor.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced the experimental `tableCellTypeSupport` flag to enable changing table cell types between `data` and `header`. To use this change, besides the flag, the `TablePropertiesUIExperimental` and `TableCellPropertiesUIExperimental` plugins must be used. See [#16730](https://github.com/ckeditor/ckeditor5/issues/16730).
* Removes operation and time limits from trial license.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.4.0): v47.3.0 => v47.4.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.4.0): v47.3.0 => v47.4.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.4.0): v47.3.0 => v47.4.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.4.0): v47.3.0 => v47.4.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.4.0): v47.3.0 => v47.4.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.4.0): v47.3.0 => v47.4.0
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
