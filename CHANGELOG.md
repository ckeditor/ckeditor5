Changelog
=========

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


## [46.0.2](https://github.com/ckeditor/ckeditor5/compare/v46.0.1...v46.0.2) (August 19, 2025)

We are happy to announce the release of CKEditor 5 v46.0.2.

### Release highlights

This hotfix release resolves an issue where archived comment threads could incorrectly appear in the sidebar, ensuring they remain properly contained in the comments archive.

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `Annotation#isVisible` property of archived comment thread annotations can no longer be modified. This prevents archived comment threads from being incorrectly displayed in the sidebar and ensures they remain properly contained within the archive.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.0.2): v46.0.1 => v46.0.2
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.0.2): v46.0.1 => v46.0.2
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.0.2): v46.0.1 => v46.0.2
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.0.2): v46.0.1 => v46.0.2
</details>


## [46.0.1](https://github.com/ckeditor/ckeditor5/compare/v46.0.0...v46.0.1) (August 11, 2025)

We are happy to announce the release of CKEditor 5 v46.0.1.

### Release highlights

#### Complete documentation redesign is here

We have prepared a new theme for our documentation to enhance its quality. The new look improves readability and addresses several accessibility issues for a better experience. The redesigned navigation bar gives more useful access to various sections of the documentation, making it easier to reference guides for all our products. Improved table of contents makes browsing and finding guides easier, paired with updated search functionality. Check out the new experience yourself!

#### The pagination plugin just got better

This release introduces a significant pagination update, along with numerous fixes. Page breaks are now calculated taking into account the content styles, bookmark markers, and with better tolerance calculation. Pagination now also finds the correct breakpoint for large tables of contents and images taller than the page.

#### Table handling with pagination and export to PDF

The pagination and export to PDF features now better support tables containing one or more paragraphs. Cell margins are now correctly applied in exported tables, which improves the precision of pagination rendering.

### Bug fixes

* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word), [list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level), [real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration), [revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a bug that caused TypeScript to report compilation errors in `.d.ts` files (e.g. `Module has no exported member`) when adding the `ckeditor5-premium-features` dependency to a project that installs CKEditor 5. The issue was caused by TypeScript compilation problems in the `ckeditor5-premium-features` package and affected users who didn't have `"skipLibCheck": true` set in their `tsconfig.json`.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf), [pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination and export to PDF features now better support tables containing one or more paragraphs. Cell margins are now correctly applied in exported tables, which improves the precision of pagination rendering.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Annotations will now be hidden in the sidebar when the target element is not a valid DOM element, preventing sidebar flickering and the appearance of orphaned annotations.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Resolved comment thread highlight will now be properly removed from the editing area when the comments archive is closed while the editor is in read-only mode.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed `CommentsEditing` being exported as type instead of value.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Fixed following plugins being exported as types instead of values: `CodeBlockElementSupport`, `CustomElementSupport`, `ListElementSupport`, `DualContentModelElementSupport`, `HeadingElementSupport`, `ImageElementSupport`, `MediaEmbedElementSupport`, `ScriptElementSupport`, `StyleElementSupport`, `TableElementSupport`, `HorizontalLineElementSupport`. Closes [#18855](https://github.com/ckeditor/ckeditor5/issues/18855).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Fix the vertical spacing of a single paragraph in the list item with a nested list. Closes [#18831](https://github.com/ckeditor/ckeditor5/issues/18831).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination correctly handles content styles like `.ck-content > :first-child`.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination lines do not change position depending on user selection.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination correctly finds page breaks on a large table of contents.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination line is correctly positioned when there is a bookmark element at the start of the block.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination can find page breaks on images taller than a page height.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Clean the `width: 0` attribute when tables are pasted from Word.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed `RevisionViewerIntegration` being exported as type instead of value.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Tables should not be stretched to full page width when printed.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table caption should not be scrambled when the document is printed. Closes [#18903](https://github.com/ckeditor/ckeditor5/issues/18903).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed multiple cases where suggestion markers were created on incorrect ranges, causing sidebar flickering.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed `TrackChangesUI` missing an export.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Fixed the `Identifier 'global' has already been declared.` error being thrown in some environments due to the global variable name in the `@ckeditor/ckeditor5-utils` package. Closes [#18856](https://github.com/ckeditor/ckeditor5/issues/18856).

### Other changes

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Make `CollaborationUserColor#id` a public readonly property.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Improve the initialization performance of the Emoji feature by optimizing the `EmojiUtils#isEmojiSupported()` method. Closes [#18822](https://github.com/ckeditor/ckeditor5/issues/18822).
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Added width constraint for content exported to PDF.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Image caption should be printed on the same page as the image.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination uses `0.5mm` tolerance while calculating line breaks.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.0.1): v46.0.0 => v46.0.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.0.1): v46.0.0 => v46.0.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.0.1): v46.0.0 => v46.0.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.0.1): v46.0.0 => v46.0.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
