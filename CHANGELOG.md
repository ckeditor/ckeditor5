Changelog
=========

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


## [41.2.1](https://github.com/ckeditor/ckeditor5/compare/v41.2.0...v41.2.1) (March 18, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.2.1.

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Fixed a recent regression where importing documents from Word with suggestions caused CKEditor 5 to crash. ([commit](https://github.com/ckeditor/ckeditor5/commit/6f0d0401e32232a3fae72a47f472dafc9f237e68))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Resolved a bug where loading the `ImageResize` plugin before `ImageBlock` or `ImageInline` caused the editor to crash. ([commit](https://github.com/ckeditor/ckeditor5/commit/de65bbde4b08529cbd0fcdbbca017b1b5243221b))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.2.1): v41.2.0 => v41.2.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.2.1): v41.2.0 => v41.2.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/41.2.1): v41.2.0 => v41.2.1
</details>


## [41.3.0-alpha.1](https://github.com/ckeditor/ckeditor5/compare/v41.3.0-alpha.0...v41.3.0-alpha.1) (March 11, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.3.0-alpha.1.

This release is intended to address various styling issues we have found with the new installation methods.

For instructions on how to use the new installation methods, see the [v41.3.0-alpha.0 Release Notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.3.0-alpha.0).

For more general information about the new installation methods, see the [announcement post](https://github.com/ckeditor/ckeditor5/issues/15502).

### Bug fixes

* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Fix displaying icons in the editor's toolbar.
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Fix styling of the dialog component.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.3.0-alpha.1): v41.3.0-alpha.0 => v41.3.0-alpha.1
</details>


## [41.3.0-alpha.0](https://github.com/ckeditor/ckeditor5/compare/v41.2.0...v41.3.0-alpha.0) (March 7, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.3.0-alpha.0.

This release is intended for testing new installation methods [announced in this post](https://github.com/ckeditor/ckeditor5/issues/15502).

It contains two builds that can be found in the `dist` folder.

The first build is a **browser build** that can be run directly in the browser without a build step. It contains the files `index.browser.js` and `index.browser.css`. For editor- or content-only styles, use the `editor-index.browser.css` or `content-index.browser.css` files.

<details>
<summary>Code snippet</summary>

```html
<link rel="stylesheet" href="<PATH_TO_THE_CKEDITOR5>/dist/index.browser.css">

<script type="importmap">
{
  "imports": {
    "ckeditor5": "<PATH_TO_THE_CKEDITOR5>/dist/index.browser.js",
    "ckeditor5/": "<PATH_TO_THE_CKEDITOR5>/",
  }
}
</script>
<script type="module">
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import translations from 'ckeditor5/dist/translations/pl.js';

await ClassicEditor.create( document.querySelector( '#editor' ), {
  plugins: [
    Essentials,
    Paragraph,
  ],
  toolbar: {
    items: [ 'undo', 'redo' ]
  },
  translations
} );
</script>
```

</details>

The second build is an **NPM build**. It includes the files `index.js` and `index.bundled.css`. For editor- or content-only styles, use the `editor-index.bundled.css` or `content-index.bundled.css` files.

<details>
<summary>Code snippet</summary>

```js
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import translations from 'ckeditor5/dist/translations/pl.js';

import 'ckeditor5/dist/index.bundled.css';

await ClassicEditor.create( document.querySelector( '#editor' ), {
  plugins: [
    Essentials,
    Paragraph,
  ],
  toolbar: {
    items: [ 'undo', 'redo' ]
  },
  translations
} );
```

</details>

Please note that this release is based on `v41.2.0` and is marked as alpha, which means that it is an experimental release and some unexpected results may occur when using it.

We appreciate any feedback that will help us improve the final form of the project.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.3.0-alpha.0): v41.2.0 => v41.3.0-alpha.0
</details>


## [41.2.0](https://github.com/ckeditor/ckeditor5/compare/v41.1.0...v41.2.0) (March 6, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.2.0.

### Copy-paste comments

Since the beginning, collaboration has been a focal point for CKEditor 5. This release brings another highly anticipated improvement for the popular Comments feature!

Now, when you cut-paste, copy-and-paste, or drag around a piece of content that includes comments, the comments will be retained. The improvement allows users to restructure their content without losing the information or discussion available in the comments.

By default, the comments are retained only on cut-and-paste and drag-and-drop actions. You can configure this behavior to be applied also on copy-paste or you can turn it off.

### Accessibility Help Dialog

CKEditor 5 v41.2.0 introduces the [Accessibility Help Dialog](https://ckeditor.com/docs/ckeditor5/latest/features/keyboard-support.html#displaying-keyboard-shortcuts-in-the-editor). With the hit of <kbd>Alt</kbd>/<kbd>Option</kbd>+<kbd>0</kbd> in the editor, users can now access the full list of available keyboard shortcuts. A toolbar button is available as well. This feature further improves the editor's usability and accessibility. It allows all users to navigate and operate CKEditor 5 more efficiently, thereby promoting a more inclusive user experience.

The Accessibility Help Dialog is enabled by default in the `Essentials` plugin pack, making it available straight away in most integrations. If your editor build does not use the `Essentials` pack, make sure that you add the `AccessibilityHelp` plugin in your configuration.

We would also like to mention that there are further accessibility support improvements in the pipeline, so keep your eyes peeled for news in the upcoming months.

### Other improvements and bug fixes

* AI Assistant will now try to retain comments on the processed content. The comments’ markup will be included in the data passed to the AI model. The result will depend on the response generated by the AI model.
* Added the ability to declare allowed URL protocols for links, like `tel` or `sms` , by introducing the `link.allowedProtocols` configuration property. After setting up your custom protocols, your users will easily navigate to specific resources from the inside of the editor.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Comments will now be retained in the clipboard and pasted into the content when the user performs a cut-and-paste operation. To revert to previous behavior (with no retaining), set the `comments.copyMarkers` configuration property to an empty array.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The contents of the `BlockToolbar` and `BalloonToolbar` toolbars are now filled on the `EditorUIReadyEvent` instead of `Plugin#afterInit()`.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Assistant will now try to retain comments on the processed content. The comments markup will be included in the data passed to the AI model. The result will depend on the response generated by the AI model.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI pre-defined commands that require context will now be disabled when the selection is within an empty block. The toolbar dropdown will be disabled if all pre-defined commands are disabled.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the copy-paste and cut-and-paste functionalities for comment markers. By default, comment markers will be retained on cut-and-paste actions. See documentation for the new `comments.copyMarkers` configuration property to learn more.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Brought the `editor.accessibility` namespace to the base `Editor` class as a container for accessibility-related features and systems. See [#1014](https://github.com/ckeditor/ckeditor5/issues/1014). ([commit](https://github.com/ckeditor/ckeditor5/commit/e2b2f9dc33b395e151b6c36d79b8011cdb4458f1))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Translations can now be passed as an object in the configuration. Closes [#15713](https://github.com/ckeditor/ckeditor5/issues/15713). ([commit](https://github.com/ckeditor/ckeditor5/commit/8561da714754529b26d53ad0d0bf0d50467609b0))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The find and replace feature will dynamically update the search results when the document content changes. Closes [#15680](https://github.com/ckeditor/ckeditor5/issues/15680). ([commit](https://github.com/ckeditor/ckeditor5/commit/c66bb4dba7b04553780bfe4bfe3f6b20ac3282b0))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Added the ability to specify allowed URL protocols by introducing the `link.allowedProtocols` configuration property. Closes [#14304](https://github.com/ckeditor/ckeditor5/issues/14304). ([commit](https://github.com/ckeditor/ckeditor5/commit/fe4a56bb98785cc633679b5897e97706a256fe4c))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Added the `revisionHistory.requireRevisionName` configuration option which makes the revision name required.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Long revision names in the sidebar will now be indicated with ellipsis and will display a tooltip when the user hovers it.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Implemented the `AccessibilityHelp` plugin that brings a dialog displaying keyboard shortcuts available in the editor. Closes [#1014](https://github.com/ckeditor/ckeditor5/issues/1014). ([commit](https://github.com/ckeditor/ckeditor5/commit/e2b2f9dc33b395e151b6c36d79b8011cdb4458f1))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a few scenarios where AI Assistant was incorrectly showing empty responses.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Custom functions passed in the `ai.openAI.requestParameters` configuration will no longer be overwritten by default parameters.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The selected widgets (for instance, images) will now be correctly highlighted while using AI Assistant.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Incorrect Markdown syntax should be stripped from the AI responses.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Plugin order should not matter when it comes to registering schema for the `ckboxImageId` attribute. Closes [#15581](https://github.com/ckeditor/ckeditor5/issues/15581). ([commit](https://github.com/ckeditor/ckeditor5/commit/38ff3f11e4641c5c0306870c77eaa60fad8c0a0e))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Use `translations` from the `defaultConfig` if they were not provided in the `create` method. Closes [#15902](https://github.com/ckeditor/ckeditor5/issues/15902). ([commit](https://github.com/ckeditor/ckeditor5/commit/39c3fa7298bd515e41c329f63dcad1aa1a5ccce0))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Background color style should be properly preserved by GHS while the `FontBackgroundColor` plugin is enabled. It should also be able to preserve a partly defined style. Closes [#15757](https://github.com/ckeditor/ckeditor5/issues/15757), [#10399](https://github.com/ckeditor/ckeditor5/issues/10399). ([commit](https://github.com/ckeditor/ckeditor5/commit/00b00d42986d7d6f93ea09d893057990d547ee97))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Fixes the initialization of `ImageInsertViaUrlUI` so it does not depend on the configured plugins order. Closes [#15869](https://github.com/ckeditor/ckeditor5/issues/15869). ([commit](https://github.com/ckeditor/ckeditor5/commit/a201aed2400179f7c91bcb9fa7ad72626c1224c5))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Fixed an issue with inline images where resizing an image to reduce its dimensions resulted in the opposite effect. Closes [#10267](https://github.com/ckeditor/ckeditor5/issues/10267). ([commit](https://github.com/ckeditor/ckeditor5/commit/44e3c434bd725a828bfcedcd5fa3f70812b40702))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: An error message will be displayed when numbered list start index input field has an incorrect value. Closes [#14939](https://github.com/ckeditor/ckeditor5/issues/14939). ([commit](https://github.com/ckeditor/ckeditor5/commit/6fa4a521c030f23ba6f6fa33d0b0c4f4b86411db))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Inserting a mention should not append an extra white space if there was one already present in the content. A white space should not follow a mention inserted inside a pair of empty matching brackets. Closes [#4651](https://github.com/ckeditor/ckeditor5/issues/4651). ([commit](https://github.com/ckeditor/ckeditor5/commit/048a6ce4e4606e70ee4b8348c041feeeac96eb9b))
* **[minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap)**: The Minimap feature should not throw an error if an editing view rendering is performed while the editor is getting destroyed (for example, a cleanup rendering). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c08d35c2e7dc5fef4fe2cbc97c5db7e72d3a7a2))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Fixed `model-position-before-root` error thrown sometimes by the `Pagination` plugin, especially when loading big content in real-time-editing integration.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: It now should be possible to paste charts from Microsoft Word. Closes [#15758](https://github.com/ckeditor/ckeditor5/issues/15758). ([commit](https://github.com/ckeditor/ckeditor5/commit/9a14ebfda25e8f4d20e7186c3b41129457714a75))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Source editing should not add whitespaces to the pre-formatted code lines. Closes [#15084](https://github.com/ckeditor/ckeditor5/issues/15084). ([commit](https://github.com/ckeditor/ckeditor5/commit/2d829980767722370afdb4e2719628c31da7fcd6))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: `TableUtils#getColumns()` should exclude elements other than `tableCell` (for example, marker elements) while counting. ([commit](https://github.com/ckeditor/ckeditor5/commit/36b6108805d4aaef083997ac686f4365d96b132c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `BlockToolbar` and `BalloonToolbar` plugins order should not matter when it comes to registering toolbar items. Closes [#15581](https://github.com/ckeditor/ckeditor5/issues/15581). ([commit](https://github.com/ckeditor/ckeditor5/commit/38ff3f11e4641c5c0306870c77eaa60fad8c0a0e))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The exported `keyCodes` object should contain correct codes for keys related to punctuation, brackets, braces, etc. See [#1014](https://github.com/ckeditor/ckeditor5/issues/1014). ([commit](https://github.com/ckeditor/ckeditor5/commit/e2b2f9dc33b395e151b6c36d79b8011cdb4458f1))

### Other changes

* **[case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change)**: Registered the case change keystroke in the accessibility help dialog. See [ckeditor/ckeditor5#1014](https://github.com/ckeditor/ckeditor5/issues/1014).
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Deprecated the `DataApiMixin` and moved the `setData()` and `getData()` methods directly to the `Editor` class. ([commit](https://github.com/ckeditor/ckeditor5/commit/b1d801d1ec77e8ab82fcd80a08642ca9e04b1b81))
* **[essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials)**: Enabled the `AccessibilityHelp` plugin by default. See [#1014](https://github.com/ckeditor/ckeditor5/issues/1014). ([commit](https://github.com/ckeditor/ckeditor5/commit/e2b2f9dc33b395e151b6c36d79b8011cdb4458f1))
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: Adjusted the types in heading configuration options to enable passing of custom heading elements. ([commit](https://github.com/ckeditor/ckeditor5/commit/83fc67fbc3b8d9f5a092833484f5098b08881834))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Mutli-line tooltips will now have `max-width` set to `200px` by default. ([commit](https://github.com/ckeditor/ckeditor5/commit/153c26dc1306fbff88cb9ce7efc96d2bb80c354d))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Tooltip will now hide if `data-cke-tooltip-text` is removed while the tooltip is open. ([commit](https://github.com/ckeditor/ckeditor5/commit/039b302d9cbbda37e83a9dcaf4c6dead47e02194))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Tooltip position will be updated if `data-cke-tooltip-position` changes while the tooltip is open. ([commit](https://github.com/ckeditor/ckeditor5/commit/039b302d9cbbda37e83a9dcaf4c6dead47e02194))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/25e58716964c255bd1ca6bc6f0d78d76405177fa), [commit](https://github.com/ckeditor/ckeditor5/commit/7f6c80c8d09c71c9206470a1d1bfff42ae16b107), [commit](https://github.com/ckeditor/ckeditor5/commit/4a217d1c9e04048985cc99921f48b0e000fea2e0), [commit](https://github.com/ckeditor/ckeditor5/commit/f47c1bd2fee7b06149c42e78d43ce93202791652))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.2.0): v41.1.0 => v41.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.2.0): v41.1.0 => v41.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.2.0): v41.1.0 => v41.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.2.0): v41.1.0 => v41.2.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/41.2.0): v41.1.0 => v41.2.0
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
