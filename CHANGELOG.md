Changelog
=========

## [38.2.0-alpha.1](https://github.com/ckeditor/ckeditor5/compare/v38.2.0-alpha.0...v38.2.0-alpha.1) (2023-07-17)

### Release highlights

This release is intended to improve compatibility with Vite and Vitest by correctly reporting CKEditor packages as ESM modules.

Please note that this release is based on `v38.1.0` and is marked as alpha, which means that it is an experimental version and some unexpected results may occur when using it.

We appreciate any feedback that will help us improve the final form of the project.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: The `ColorTableView` class has been moved to the `ckeditor5-ui` package and remains available as a public `ColorSelectorView` component.
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: CSS classes such as `.ck-color-table__remove-color` or `.ck-color-table__color-picker` (prefixed with `.ck-color-table`) are now prefixed with `.ck-color-selector`. For instance, `.ck-color-selector__remove-color` or `.ck-color-selector__color-picker`.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Color pickers are now displayed by default for all color fields in the table and table cell properties UI. In places where users should use a limited number of colors, it is possible to disable the color picker using a configuration option. See the configuration reference of [table properties](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tableconfig-TablePropertiesConfig.html) and [table cell properties](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tableconfig-TableCellPropertiesConfig.html) features to learn more.

### Features

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: `CKBoxUploadAdapter` looks for categories using file extension case-insensitively. Closes [#13751](https://github.com/ckeditor/ckeditor5/issues/13751). ([commit](https://github.com/ckeditor/ckeditor5/commit/1c0c04832a41b108c617541f950a8b5b91f1d014))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Introduced configuration option to allow empty inline elements. Closes [#9888](https://github.com/ckeditor/ckeditor5/issues/9888). ([commit](https://github.com/ckeditor/ckeditor5/commit/899250e595965e18eeafc8499ac859118f195de0))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Brought color pickers to color fields in table properties and table cell properties UI. Closes [#14500](https://github.com/ckeditor/ckeditor5/issues/14500). ([commit](https://github.com/ckeditor/ckeditor5/commit/97f5af2b4d0b488c31421775f14d14a781dc7a98))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added track changes data support for multi-root editor without a need to specify a custom callback.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Extracted the `ColorTableView` UI from `ckeditor5-font` as a public `ColorSelectorView` component (see [#14500](https://github.com/ckeditor/ckeditor5/issues/14500)). ([commit](https://github.com/ckeditor/ckeditor5/commit/97f5af2b4d0b488c31421775f14d14a781dc7a98))

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: A comment thread annotation will no longer disappear after clicking on a mention hint.
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Don't throw an error when an item with the incorrect index is set to active.
* **[paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph)**: The `insertParagraph` command won't insert two paragraphs when position is at the edge of the block. Closes [#13866](https://github.com/ckeditor/ckeditor5/issues/13866). ([commit](https://github.com/ckeditor/ckeditor5/commit/44e8373ba4a847aa1f9da5adc2ae12a236b7760c))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Fixes infinite loop in source editing mode. Closes [#14469](https://github.com/ckeditor/ckeditor5/issues/14469). ([commit](https://github.com/ckeditor/ckeditor5/commit/ee693e6d405fc3170e336e339252a79ef475f721))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Roots attributes will now be passed to internal editor in track changes data plugin. This may solve some errors with custom plugins using root attributes.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed the sticky panel behavior in overflowing containers. Closes [#5465](https://github.com/ckeditor/ckeditor5/issues/5465). ([commit](https://github.com/ckeditor/ckeditor5/commit/73a0b8dc4945aba14e1dd26df82b888d89a7fb15))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Dropdowns will stay open after clicking on an HTML element added to the dropdown's focus tracker. ([commit](https://github.com/ckeditor/ckeditor5/commit/5c241d08066dd483c2fe6615a14297a5d6963591))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DomConverter` should allow registering custom matchers to detect inline object elements. See [#9888](https://github.com/ckeditor/ckeditor5/issues/9888). ([commit](https://github.com/ckeditor/ckeditor5/commit/899250e595965e18eeafc8499ac859118f195de0))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Fixed formatting of `<br>` elements in source editing. Whitespaces before `<br>` element should not be added. ([commit](https://github.com/ckeditor/ckeditor5/commit/899250e595965e18eeafc8499ac859118f195de0))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added `DescriptionItem` type.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v38.2.0-alpha.0 => v38.2.0-alpha.1

Releases containing new features:

* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v38.2.0-alpha.0 => v38.2.0-alpha.1

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v38.2.0-alpha.0 => v38.2.0-alpha.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v38.2.0-alpha.0 => v38.2.0-alpha.1
</details>


## [38.2.0-alpha.0](https://github.com/ckeditor/ckeditor5/compare/v38.1.0...v38.2.0-alpha.0) (2023-06-29)

### Release highlights

This release is intended to improve compatibility with Vite and Vitest by correctly reporting CKEditor packages as ESM modules.

Please note that this release is based on `v38.1.0` and is marked as alpha, which means that it is an experimental version and some unexpected results may occur when using it.

We appreciate any feedback that will help us improve the final form of the project.

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Sidebar `min-height` should be correctly updated after switching between various annotations display modes.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Fix HTML structure in sent requests. Closes [#3364](https://github.com/cksource/ckeditor5-internal/issues/3364).
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fix of rendering thin space when content is pasted from MSWord. Closes [#12562](https://github.com/ckeditor/ckeditor5/issues/12562). ([commit](https://github.com/ckeditor/ckeditor5/commit/0dd197bef21ce1bb0dd2115645a36e0e131f92cf))
* **[table-of-contents](https://www.npmjs.com/package/@ckeditor/ckeditor5-table-of-contents)**: Focus editing view after button click. Closes [#3391](https://github.com/cksource/ckeditor5-internal/issues/3391).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v38.1.0 => v38.2.0-alpha.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v38.1.0 => v38.2.0-alpha.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v38.1.0 => v38.2.0-alpha.0
</details>


## [38.1.1](https://github.com/ckeditor/ckeditor5/compare/v38.1.0...v38.1.1) (2023-07-10)

### Release highlights

In light of a recently identified vulnerability in the `protobufjs` package ([CVE-2023-36665](https://github.com/advisories/GHSA-h755-8qp9-cq85)), we've rolled out an update to CKEditor 5 packages. This vulnerability is pertinent to [real-time collaboration](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/collaboration.html) services.

Please note, our investigation has shown that our setup does not incorporate the affected `protobufjs` code. However, to ensure a smooth and secure installation and update experience, we've updated our dependencies.

While the specific vulnerability doesn't impact our use-case, we still encourage an update to the latest CKEditor 5 version as a general security practice.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v38.1.0 => v38.1.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v38.1.0 => v38.1.1
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v38.1.0 => v38.1.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v38.1.0 => v38.1.1
</details>


## [38.1.0](https://github.com/ckeditor/ckeditor5/compare/v38.0.1...v38.1.0) (2023-06-23)

### Release highlights

#### Show blocks

[The show blocks feature](https://ckeditor.com/docs/ckeditor5/latest/features/show-blocks.html) allows the content creators to visualize all block-level elements (except for widgets) by surrounding them with an outline and displaying their element name at the top-left corner of the box.

![image](https://github.com/ckeditor/ckeditor5/assets/9881379/c3569142-052a-4708-976d-0593f9997e3c)

#### Adjacent lists support

CKEditor 5 introduces an opt-in feature specifically for list handling during Word import or pasting. This feature influences how adjacent lists of the same type (either ordered or unordered) are processed. By default, such lists merge together, but you can prevent this.

To enable this feature, the `AdjacentListsSupport` plugin [needs to be added to your CKEditor 5 configuration](https://ckeditor.com/docs/ckeditor5/latest/features/lists/document-lists.html#list-merging). This allows you to maintain distinct lists, even when they are of the same type and positioned adjacently. However, please note that this feature only works with the `DocumentLists` implementation. We are considering making it the default setting in future updates, based on user feedback and experience we collect. Let us know your opinion on the https://github.com/ckeditor/ckeditor5/issues/14478 issue.

#### Comments archive integration guide

We released [a new guide](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments-archive.html) showcasing how you can customize comments archive UI to display the archive panel in a custom container, to better fit your application layout.

#### Fixing API scrolling integration with custom viewport offsets

We introduced a significant UX improvement that enhances the scrolling behavior of the Document Outline and Table of Contents features in the organization's documentation. Now, clicking on a heading in the Document Outline and Table of Contents displays a collapsed caret, which was previously located under the header section. Additionally, the fix improves other cases, such as proper scrolling when pressing enter while the editor is focused and scrolled away.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The `htmlAttributes` model property has been replaced by `html*Attributes`, where the `*` represents the name of the view element. Clients will need to modify their code accordingly by replacing all instances of `htmlAttributes` with `html*Attributes` for the respective view elements.

### Features

* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Added support for resolved comment threads in the Export to Word feature.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Changing a list type now removes styles inherited from the previous type. Closes [#14216](https://github.com/ckeditor/ckeditor5/issues/14216). ([commit](https://github.com/ckeditor/ckeditor5/commit/02822b0f7a945712385e20335dc7666a811ff381))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Added the `AdjacentListsSupport` plugin to separate lists of the same type. Closes [#12738](https://github.com/ckeditor/ckeditor5/issues/12738). ([commit](https://github.com/ckeditor/ckeditor5/commit/574c9345f484ae3cb163a71fbd60d2327b36b3e2))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: `BodyCollection.bodyCollectionContainer` is now a public property. Closes [#13928](https://github.com/ckeditor/ckeditor5/issues/13928). ([commit](https://github.com/ckeditor/ckeditor5/commit/1f5c8d023876f54993e71c873bc3a7201c2c7cc4))

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The editor should no longer crash after resolving multiple comment threads from multiple editor instances inside one `Context`.
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Fixed a randomly failing Table of Contents editing test (before each).
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: The document outline feature should respect the `config.ui.viewportOffset` configuration.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The editor should no longer crash while pressing backspace in an empty editor (in Firefox). Closes [#14411](https://github.com/ckeditor/ckeditor5/issues/14411), [#14050](https://github.com/ckeditor/ckeditor5/issues/14050). ([commit](https://github.com/ckeditor/ckeditor5/commit/402e866e785e7bf97120bc80d469d58b3fe72272))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed the shallow view and model TreeWalkers returning elements outside of specified boundaries. ([commit](https://github.com/ckeditor/ckeditor5/commit/c519feb0f4c0129f4fbf492b69440199af9b4312))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The CSS shorthand value normalizer should work for values with white spaces. Closes [#14309](https://github.com/ckeditor/ckeditor5/issues/14309). ([commit](https://github.com/ckeditor/ckeditor5/commit/c14cdff9717634bdebabee1d6da068f084bbf5d9))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `View#scrollToTheSelection()` should respect the `config.ui.viewportOffset` configuration and consider the geometry of a classic editor's toolbar to assure the caret is always visible to the user. Closes [#13730](https://github.com/ckeditor/ckeditor5/issues/13730). ([commit](https://github.com/ckeditor/ckeditor5/commit/d65f4862e9baad74ab7b7ca5355e290d68f96593))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Font attributes are preserved after inserting inline widgets. Closes [#14106](https://github.com/ckeditor/ckeditor5/issues/14106). ([commit](https://github.com/ckeditor/ckeditor5/commit/30c31b6bfa10816cc44287842874b768d6d3ca59))
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Text will no longer go beyond its cell when columns are resized by the resize handler in exported PDFs. Closes [#3355](https://github.com/ckeditor/ckeditor5/issues/3355). ([commit](https://github.com/ckeditor/ckeditor5/commit/a5908d4dd10faae3fcc37658a3c44fd3026858fa))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: The accept button in the color picker will no longer submit forms. Closes [#14361](https://github.com/ckeditor/ckeditor5/issues/14361). ([commit](https://github.com/ckeditor/ckeditor5/commit/eff5ccac9759f97d32ac1c7ff8812c177876cd5b))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: GHS should allow linking of custom elements. Closes [#13803](https://github.com/ckeditor/ckeditor5/issues/13803). ([commit](https://github.com/ckeditor/ckeditor5/commit/371ae0bd057c0120fbf3e1f7581c8390bdf65364))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Preserve HTML attributes when a list is split or its item is removed. Closes [#14346](https://github.com/ckeditor/ckeditor5/issues/14346) and [#14349](https://github.com/ckeditor/ckeditor5/issues/14349). ([commit](https://github.com/ckeditor/ckeditor5/commit/c519feb0f4c0129f4fbf492b69440199af9b4312))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Remove unrelated `html*Attributes` from elements. See [#14216](https://github.com/ckeditor/ckeditor5/issues/14216). ([commit](https://github.com/ckeditor/ckeditor5/commit/80daee5bdf4cea27a318f8472d5146e56d680a22))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Multiple mentions in the last table cell should not result in a selection error. Closes [#14025](https://github.com/ckeditor/ckeditor5/issues/14025). ([commit](https://github.com/ckeditor/ckeditor5/commit/39c2d9121966d020a3f57caa7d428fb0a0459e0b))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Remove the `<style>` tag that comes with the table pasted from Google Sheets. Closes [#14131](https://github.com/ckeditor/ckeditor5/issues/14131). ([commit](https://github.com/ckeditor/ckeditor5/commit/8208af13b7d9cbbe4dab1d399e2f9bd7c7601d2d))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: List markers should be displayed correctly after pasting a list from MS Word. Closes [#12361](https://github.com/ckeditor/ckeditor5/issues/12361). ([commit](https://github.com/ckeditor/ckeditor5/commit/066b69b79cf6da80d44148ac6d1af0f07a31766d))
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: Styles dropdown should allow styling `<div>` elements. Closes [#13341](https://github.com/ckeditor/ckeditor5/issues/13341). ([commit](https://github.com/ckeditor/ckeditor5/commit/4b44f58c8dd280cafaadb10b2d099423fce054b9))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Text will no longer go beyond its cell when columns are resized by resize handler in Firefox. Closes [#14386](https://github.com/ckeditor/ckeditor5/issues/14386). ([commit](https://github.com/ckeditor/ckeditor5/commit/a5908d4dd10faae3fcc37658a3c44fd3026858fa))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Removed an unnecessary request to the token URL when using the `TrackChangesData` plugin.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed a styling issue that would cause some toolbar dropdowns to be shrunk. ([commit](https://github.com/ckeditor/ckeditor5/commit/53f0dc2f9d75031113803791e3051b5b9c422560))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed the arrow keys behavior in the color picker component. Closes [#14218](https://github.com/ckeditor/ckeditor5/issues/14218). ([commit](https://github.com/ckeditor/ckeditor5/commit/29be557777337dc9f9b44fa120cbeec65f0e6a97))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The "Powered by" logo should not shake on the first show. Closes [cksource/ckeditor5-internal#3289](https://github.com/cksource/ckeditor5-internal/issues/3289). ([commit](https://github.com/ckeditor/ckeditor5/commit/48fa3444fe85bc424ddbf5314fbc540c3d4497d7))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed the way code exports the `colorPaletteIcon` icon, which could result in a broken build. Closes [#14205](https://github.com/ckeditor/ckeditor5/issues/14205). ([commit](https://github.com/ckeditor/ckeditor5/commit/046e379d4d7c02dfbc4183819b70d6535776c733))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: `Rect#getVisible()` should not consider ancestors when the target is an element with `position: absolute`. Closes [#14107](https://github.com/ckeditor/ckeditor5/issues/14107). ([commit](https://github.com/ckeditor/ckeditor5/commit/8b1ede7c4ed1b03905e6fbf822248992c0c84821))
* Added multi-root support for: title, HTML comments, table resize, word count and block toolbar. ([commit](https://github.com/ckeditor/ckeditor5/commit/95ef94b2263e82ed570d8b29293e07d4bc89eef4))
* Fixed editor crash that happened when `TrackChangesData` or revision history was used in setup with `Context` if `CloudServices` was set only in the `Context` configuration (and not in the editor configuration).

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The resolve button will now be disabled instead of hidden when the editor is in read-only mode for better UI consistency.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Exports `ViewTreeWalker` from `ckeditor5-engine/src/index.ts`. Closes [#14158](https://github.com/ckeditor/ckeditor5/issues/14158). ([commit](https://github.com/ckeditor/ckeditor5/commit/e72b49a90d39bcca578681f43b338f350238d3f1))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Changed `htmlAttributes` to `html*Attributes` where `*` represents the name of the view element. See [#14216](https://github.com/ckeditor/ckeditor5/issues/14216). ([commit](https://github.com/ckeditor/ckeditor5/commit/a04cbd3dcb6581916019ad94b9a7f78d5ce4a568))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added a configuration option that forces the "Powered by" logo to show up despite a valid license key being used. Closes [#14235](https://github.com/ckeditor/ckeditor5/issues/14235). ([commit](https://github.com/ckeditor/ckeditor5/commit/b577283c1c1c4f5649864529cf859ba0e03654ab))
* Optimized icons. ([commit](https://github.com/ckeditor/ckeditor5/commit/34ba6c86b560662a209d44c798d1c4372459c7ab))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/2add9a2e521cf19d9651463fa3c5bdfd07c32045), [commit](https://github.com/ckeditor/ckeditor5/commit/9eea4bfeb7ff3807ad17af926a62376855cbc0d2))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks): v38.1.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v38.0.1 => v38.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v38.0.1 => v38.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v38.0.1 => v38.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v38.0.1 => v38.1.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v38.0.1 => v38.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v38.0.1 => v38.1.0
</details>


## [38.0.1](https://github.com/ckeditor/ckeditor5/compare/v38.0.0...v38.0.1) (2023-05-23)

### Release highlights

This is a patch release that resolves an incorrect import issue that resulted in a ["Cannot find module" error when using CKEditor 5 in a TypeScript environment](https://github.com/ckeditor/ckeditor5/issues/14205).

Due to that and the [CKEditor 5 versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html), we released all packages once again.

Check out the highlights of the original [v38.0.0 release](https://github.com/ckeditor/ckeditor5/releases/tag/v38.0.0).

### Bug fixes

* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed how the code exports the `colorPaletteIcon` icon, which could result with a broken build. Closes [#14205](https://github.com/ckeditor/ckeditor5/issues/14205). ([commit](https://github.com/ckeditor/ckeditor5/commit/42001f77e84f5d453e81cbcc3ebf69972a90ad8d))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v38.0.0 => v38.0.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v38.0.0 => v38.0.1
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v38.0.0 => v38.0.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v38.0.0 => v38.0.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
