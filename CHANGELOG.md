Changelog
=========

## [45.1.0](https://github.com/ckeditor/ckeditor5/compare/v45.0.0...v45.1.0) (May 14, 2025)

We are happy to announce the release of CKEditor 5 v45.1.0.

### Release highlights

#### Typing Improvements

The typing behavior has been improved for plain text typing. This adjustment allows the web browser to handle text insertion before the editor processes it, enhancing typing reliability across various scenarios, especially on Safari and iOS devices. Issues related to track changes, autocorrect, automatic text replacement, and other input methods have been addressed.

#### Track Changes Enhancements

A new method to start a "tracking session" has been introduced, preventing automatic merging of adjacent suggestions. This allows for more precise control over individual changes, catering to workflows that require selective acceptance of edits.

#### Miscellaneous improvements

* Sticky toolbars and balloons are now better aligned with the visual viewport on iOS and Safari, ensuring correct positioning when zooming.
* The fullscreen plugin has been improved to maintain scroll position when exiting fullscreen, avoiding unexpected jumps on smooth-scrolling pages. Layout consistency has been refined by adjusting margins and editable width. Errors related to the Content minimap plugin in fullscreen mode have also been resolved.
* Introduced a fix which ensures that the `data-author-id` and `data-suggestion` attributes are preserved in non-block suggestions when retrieving data with `showSuggestionHighlights: true`.
* We improved the algorithm for images detection in the Paste from Office feature, in scenarios of mixed local and online images from Microsoft Word. Paste no longer causes some images not to appear.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* The default behavior of the `beforeinput` DOM events is no longer prevented in plain text typing scenarios. Now, the engine waits for DOM mutations and applies changes to the model afterward. This should not affect most integrations however, it may affect custom modifications to text insertion into the editor.

### Features

* **[ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckeditor5-code-block)**: The `Go`/`Golang` programming language was added to the `@ckeditor/ckeditor5-code-block` package. Closes [#18403](https://github.com/ckeditor/ckeditor5/issues/18403). ([commit](https://github.com/ckeditor/ckeditor5/commit/c8d1d5090641f83df71ccdade204a90363532d3a))

  Thanks to [@abdorrahmani](https://github.com/abdorrahmani)!
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Exported the `ClipboardObserver` class from the package. Closes [#18385](https://github.com/ckeditor/ckeditor5/issues/18385). ([commit](https://github.com/ckeditor/ckeditor5/commit/711b611b32b7e3a0d556158613c5f7552edf3785))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added a method for starting a new tracking session in track changes.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Recognize Urdu as an RTL language. Closes [#16900](https://github.com/ckeditor/ckeditor5/issues/16900). ([commit](https://github.com/ckeditor/ckeditor5/commit/69b959d63ff9656e3039fd40a9d8d3b669c5b46d))

  Thanks to [@smtaha512](https://github.com/smtaha512)!

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed a crash happening for some asynchronous collaboration integrations, when the `TrackChangesData` plugin was used while there was a resolved comment thread in the document's initial data.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Fixed incorrect documentation links in the email configuration helper.
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Minor styling improvements. Closes [#18470](https://github.com/ckeditor/ckeditor5/issues/18470). ([commit](https://github.com/ckeditor/ckeditor5/commit/021e0e01acfd5f4aae2ca81afa33d4562780c8f0))
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Changed the method use to recognize the editor type in fullscreen. Closes [#18395](https://github.com/ckeditor/ckeditor5/issues/18395). ([commit](https://github.com/ckeditor/ckeditor5/commit/71660caa05777121cd456f23ac1187fe609a934c))
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Fixed restoring scroll position after leaving fullscreen mode for containers with `scroll-behavior: smooth`. Closes [#18378](https://github.com/ckeditor/ckeditor5/issues/18378). ([commit](https://github.com/ckeditor/ckeditor5/commit/6924bea187886abaffac37a98cff35b1f58ff5c1))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Removing formatting from empty HTML no longer crashes the editor. Closes [#18089](https://github.com/ckeditor/ckeditor5/issues/18089). ([commit](https://github.com/ckeditor/ckeditor5/commit/6390434b1b4672f6da414f382bd02e42ac832b83))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Pasting an empty HTML element no longer crashes the editor. Closes [#18100](https://github.com/ckeditor/ckeditor5/issues/18100). ([commit](https://github.com/ckeditor/ckeditor5/commit/6390434b1b4672f6da414f382bd02e42ac832b83))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Consume the `.image_resize` class and the `[aspect-ratio]` style during the upcast of the images. Closes [#18287](https://github.com/ckeditor/ckeditor5/issues/18287). ([commit](https://github.com/ckeditor/ckeditor5/commit/361134da02ea753bca3d5ef3d916582485cfcb52))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed a bug where the editor would crash or do nothing when pressing the enter key in newline-suppressed scenarios (such as limit elements). Closes [#15862](https://github.com/ckeditor/ckeditor5/issues/15862). ([commit](https://github.com/ckeditor/ckeditor5/commit/44264dd9fad31888bec8c6a48b5ddd9cdd07e881))

  Thanks [@jonscheiding](https://github.com/jonscheiding)!
* **[minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap)**: The plugin no longer throws errors when entering the fullscreen mode. Closes [#18472](https://github.com/ckeditor/ckeditor5/issues/18472). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c3e42a216afeeb61eacaa71ad1f8aa2d9697d7c))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Mixed local and online images from Microsoft Word paste no longer cause some images to disappear. Closes [#18180](https://github.com/ckeditor/ckeditor5/issues/18180). ([commit](https://github.com/ckeditor/ckeditor5/commit/6252bc6b3cfc6ef0671e7a65565cd00fd1e2d94c))
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: When the Enhanced Source Editing dialog is open, all editor commands are now disabled to prevent accidental content edits and unintended UI interactions.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table selector regarding margins should not override the style created during integrations. Closes [#18428](https://github.com/ckeditor/ckeditor5/issues/18428). ([commit](https://github.com/ckeditor/ckeditor5/commit/dedbc4b3b69c70ecd34664161f8dc838c2fb04b9))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed insertion suggestion not restored on undo after it was rejected. This affected specific suggestions which included pressing the enter key. Closes [#18449](https://github.com/ckeditor/ckeditor5/issues/18449). ([commit](https://github.com/ckeditor/ckeditor5/commit/97b504905aa29e3ab2cca11602ab71ef8f8ccb63))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a crash happening for some asynchronous collaboration integrations, when `TrackChangesData` plugin was used while there was a resolved comment thread in the document's initial data.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: An empty element was incorrectly left when an insertion suggestion that ended on "enter key press" was discarded. Also fixed the same error in a case where a similar deletion suggestion was accepted. Related to https://github.com/ckeditor/ckeditor5/issues/18448.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added missing `[data-suggestion]` and `[data-author-id]` attributes to all suggestion types in editing and data pipelines.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Typing in track changes mode no longer reverses typed letters in Safari. ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The Mac VoiceOver now reads typed characters when typing. Closes [#15436](https://github.com/ckeditor/ckeditor5/issues/15436). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Mac text replacement shortcuts will now correctly replace text in Safari. Closes [#13428](https://github.com/ckeditor/ckeditor5/issues/13428). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The list items and headings at the beginning of the editable area can be changed to a plain paragraph on backspace keypress. Closes [#18356](https://github.com/ckeditor/ckeditor5/issues/18356). ([commit](https://github.com/ckeditor/ckeditor5/commit/6a1dae99b11f1386bc718027eba55f1f6acc3483))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Ensure the table properties form is fully visible within the viewport. Closes [#16133](https://github.com/ckeditor/ckeditor5/issues/16133). ([commit](https://github.com/ckeditor/ckeditor5/commit/80856dac483ab49a06362ad8ff70703350a50500))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Optimized performance of dropdowns when opening with many items. Closes [#18094](https://github.com/ckeditor/ckeditor5/issues/18094). ([commit](https://github.com/ckeditor/ckeditor5/commit/06345033ac054968c9b1e0da52134d5692af8157))
* The sticky toolbar and inline editor toolbar should maintain their visual position relative to the editing area, no matter the visual viewport scale or scroll in Safari on desktop and mobile devices. The contextual balloon position should be aware of the part of the top viewport offset visible in the visual viewport on Safari on desktop and mobile. Closes [#7718](https://github.com/ckeditor/ckeditor5/issues/7718). ([commit](https://github.com/ckeditor/ckeditor5/commit/3b538345dcf80502bdde524cc762c0670e4b9d60))

### Other changes

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Non-production license notifications should only be displayed once per page load. Closes [#18179](https://github.com/ckeditor/ckeditor5/issues/18179). ([commit](https://github.com/ckeditor/ckeditor5/commit/922fb1c7c48463134a8359ce9709b0ee0ca552c3))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `doNotFixSelection` option for `model.deleteContent()` which can be used to force making deletion exactly on the provided selection. Closes [#18448](https://github.com/ckeditor/ckeditor5/issues/18448). ([commit](https://github.com/ckeditor/ckeditor5/commit/b80b369ef320b094343b41250fe9df25dac4682a))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed an incorrect French translation in the Track changes feature.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Improved typing performance in large documents. ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/45.1.0): v45.0.0 => v45.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/45.1.0): v45.0.0 => v45.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/45.1.0): v45.0.0 => v45.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/45.1.0): v45.0.0 => v45.1.0
</details>


## [45.0.0](https://github.com/ckeditor/ckeditor5/compare/v44.3.0...v45.0.0) (April 7, 2025)

The CKEditor 5 v45.0.0 release brings powerful new features and improvements, making content creation smoother and more versatile. From enhanced email editing to a refined linking experience and a brand-new full-screen mode, this update is packed with valuable upgrades.

### Release highlights

#### Email editing enhancements

We are making it easier to create and edit emails directly in CKEditor 5 with several enhancements. This release introduces the following new features:

* [**Export with Inline Styles**](https://ckeditor.com/docs/ckeditor5/latest/features/export-with-inline-styles.html) (⭐) provides the ability to export email content with automatically inlined styles, ensuring compatibility and proper rendering across different email clients.
* [**Email Configuration Helper**](https://ckeditor.com/docs/ckeditor5/latest/features/email-editing/email-configuration-helper.html) (⭐) is a new configuration helper plugin that provides guidance for integrators to correctly set up an email-friendly editor while avoiding common pitfalls.
* [**Layout tables:**](https://ckeditor.com/docs/ckeditor5/latest/features/tables/layout-tables.html) are a new type of tables that has been introduced to simplify the creation of structured email designs, offering better control over layout, alignment and spacing.

Apart from these new features, this update also brings various fixes and improvements related to table behavior, enhanced HTML support, and better handling of complex email structures. These refinements help ensure a more seamless email editing experience, reducing inconsistencies and improving compatibility with external email clients.

#### The fullscreen feature

A long-requested feature has finally arrived with the [introduction of full-screen editing](https://ckeditor.com/docs/ckeditor5/latest/features/fullscreen.html) for the classic and decoupled editor types. This new mode provides a focused writing experience by making the editor the centerpiece of the screen. The expanded screen space allows for better visibility of content in sidebars such as comments, suggestions, and document outlines, enhancing your overall workflow.

#### Improved linking experience

Linking in CKEditor 5 has been significantly [upgraded with a redesigned user interface](https://ckeditor.com/docs/ckeditor5/latest/features/link.html), making adding and editing links more intuitive. We added the possibility to add and edit the display text of a link. Users can now easily link to bookmarks within the document and select links from predefined lists (defined by the developer). These improvements make inserting and managing links faster and more flexible than ever before.

During this initiative, we also aligned visual and technical components of the editor. Each balloon got a header with the tile, we also unified the toolbar behavior and keystrokes of Link and Bookmarks with other widget’s toolbars like image and tables.

> [!NOTE]
> The UI got updated in several places: main view, link properties (decorators), and also its technical implementation changed. Make sure to give special attention to the update if you did any customizations to the link interface.

#### New installation methods improvements: icons replacement

We are continuing to strengthen the new installation methods while phasing out older solutions. We added one of the key components you asked for: replacing our icons with your custom ones. It is now possible to replace the icons via the [package’s override mechanism](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/customizing-icons.html).

> [!NOTE]
> To achieve a proper solution for icons replacement for the npm builds, we needed to introduce a breaking change. If you used our icons for any purposes, make sure to update their paths.

#### ⚠️ Deprecations in old installation methods: stage 1 completed

We are progressing with deprecation according to [our sunset plan](https://github.com/ckeditor/ckeditor5/issues/17779). From this release, predefined builds’ packages, such as `@ckeditor/ckeditor-build-classic`, are now officially deprecated.

We also dropped support for Webpack 4 in both the **old and new** installation methods. All packages and CDN from this version are now distributed with ES2022 as the target ECMAScript version, providing better compatibility with modern JavaScript features and improved performance.

By the end of 2025, custom builds that rely on webpack and DLL builds will also be deprecated. Refer to [our documentation and migration guides](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html) to ensure a smooth transition.

We are committed to making CKEditor 5 even better. Stay tuned for more improvements in upcoming releases! If you have any feedback, let us know — we are always listening.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-45.html) to learn more about these changes.

Happy editing!

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: The `BookmarkUI#actionsView` is no longer available. The bookmark feature is now using the `WidgetToolbarRepository` instead.
* **[build-*](https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor)**: CKEditor 5 predefined builds are no longer available.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `LinkUI#actionsView` is no longer available. The bookmark feature now uses the `LinkUI#toolbarView` (an instance of the `ToolbarView` class) instead of the custom `LinkActionsView`.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `createBookmarkCallbacks()` helper is now replaced by the `isScrollableToTarget()` and `scrollToTarget()` helpers.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `FormRowView` class was moved to the `@ckeditor/ckeditor5-ui` package.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `form.css` component was moved to the `@ckeditor/ckeditor5-theme-lark` package.
* All CKEditor 5 icons are now available in the `@ckeditor/ckeditor5-icons` package.

### DISTRIBUTION CHANGES

* All packages and CDN source code now target ES2022 as the ECMAScript version.

### Features

* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Introduced a new package to validate the editor configuration for email compatibility. It helps prevent misconfigurations by enforcing best practices and future-proof rules. Added utilities for post-processing CSS, improving support across various email clients by adjusting styles for better rendering consistency.
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Added a new package for exporting content with inline styles. Ensures CSS classes (`[class]`) and IDs (`[id]`) are inlined within elements, improving compatibility with email clients that strip external styles. It helps maintain consistent formatting across different email clients, reducing rendering issues.
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Introduced the fullscreen mode feature. Closes [#18026](https://github.com/ckeditor/ckeditor5/issues/18026). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Introduced the ability to render the`<style>` elements from the `<head>` section of editor data content using the `FullPage` plugin. See [#13482](https://github.com/ckeditor/ckeditor5/issues/13482). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Added a new property `RevisionHistory#isRevisionViewerOpen` that indicates whether the revision history is opened or not.
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: The [one-dark](https://www.npmjs.com/package/@codemirror/theme-one-dark) theme is now built-in and available via `config.sourceEditingEnhanced.theme` by passing the `'dark'` value. This change enables the use of the dark theme with the CDN installation method, which does not support external `CodeMirror` dependencies. Additionally, if you previously used the `oneDark` extension directly, you can now switch to `theme: 'dark'` for built-in support.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced the layout tables feature to enable constructing grids with tables, for example for email editing. These tables are designed for layout purposes, and include the `role="presentation"` parameter for accessibility. Users can insert layout tables via the editor toolbar and switch between content and layout tables. The editing view now closely matches the rendered output. Closes [#18132](https://github.com/ckeditor/ckeditor5/issues/18132). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added the ability to toggle between content tables and layout tables. Users can switch table types using a split button in the table properties UI. While captions and `<th>` elements may be lost, table structure remains intact. Closes [#18131](https://github.com/ckeditor/ckeditor5/issues/18131). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Dragging and dropping a table into another table no longer merges them. Instead, the dropped table is placed as a whole inside the target cell. Pasting tables remains unchanged. Closes [#18126](https://github.com/ckeditor/ckeditor5/issues/18126). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template)**: Inserting a template containing a table into another table no longer merges them. Instead, the template is placed as a whole inside the target cell. See [#18126](https://github.com/ckeditor/ckeditor5/issues/18126).
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Introduced the `form.css` component . ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `MenuBarView#disable()` and `MenuBarView#enable()` methods. They disable/enable all top-level menus in menu bar. Closes [#17940](https://github.com/ckeditor/ckeditor5/issues/17940). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `ToolbarView#switchBehavior()` method to switch toolbar behavior after the editor has been initialized. Closes [#18159](https://github.com/ckeditor/ckeditor5/issues/18159). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced the `FormRowView` class. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Moved all icons to the `@ckeditor/ckeditor5-icons` package. Related to [#16546](https://github.com/ckeditor/ckeditor5/issues/16546). ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Added the `@ckeditor/ckeditor5-icons` package to the core DLL package. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))

### Bug fixes

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Resolved an issue where images from private categories were not appearing in the selector. Closes [#18044](https://github.com/ckeditor/ckeditor5/issues/18044). ([commit](https://github.com/ckeditor/ckeditor5/commit/d7760d30194aef8e7af871e671ba2bc222ec3a24))
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Fixed the emoji panel not being visible while used in comments archive. Closes [#17964](https://github.com/ckeditor/ckeditor5/issues/17964). ([commit](https://github.com/ckeditor/ckeditor5/commit/ce9030014a6fcdde2c35e46f05f1e3d44655ae5a))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The selection should not move to another table row while switching heading rows. Closes [#17962](https://github.com/ckeditor/ckeditor5/issues/17962). ([commit](https://github.com/ckeditor/ckeditor5/commit/81dd6e85e42861e0e58180734174752a092e5b5a))
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: Added the missing `converterPriority` type definition to `HeadingOption` interface. Closes [#18182](https://github.com/ckeditor/ckeditor5/issues/18182). ([commit](https://github.com/ckeditor/ckeditor5/commit/de9e0520e3d756ae3d3acf60d7abf8d9e4c997a9))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The floated tables are now loaded and showed as expected in the editor's view. Closes [#18203](https://github.com/ckeditor/ckeditor5/issues/18203). ([commit](https://github.com/ckeditor/ckeditor5/commit/227ae01e6a4a2f92a3230a66a2fde511b60b8ed1))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `Autolink` feature will now correctly autolink `http://localhost` and `http://localhost:port`. Closes [#18185](https://github.com/ckeditor/ckeditor5/issues/18185). ([commit](https://github.com/ckeditor/ckeditor5/commit/aeb5747166f666fcd4acbe286bd923df89769825))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Fixed the mention panel not being visible while used in comments archive. Closes [#17964](https://github.com/ckeditor/ckeditor5/issues/17964). ([commit](https://github.com/ckeditor/ckeditor5/commit/ce9030014a6fcdde2c35e46f05f1e3d44655ae5a))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Revisions will now correctly retain data for HTML embed widget, as well as `<script>` and `<style>` tags enabled by the General HTML Support feature. Before, when revision was saved, these elements were saved empty, and this lead to data loss when such revision was restored. Note, that this will not fix revisions that are already affected by this error.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash when viewing a revision which had an HTML comment node in its data (reproducible with General HTML Support plugin).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed handling `UIElement`s and `RawElement`s by revision history (may concern third-party custom plugins).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash when viewing a revision which had a collapsed marker in its data (may concern third-party custom plugins).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Removed `[role="textbox"]` from the `<td>/`<th>` editables. Windows Narrator no longer reads table dimensions as 0 by 0. Closes [#16923](https://github.com/ckeditor/ckeditor5/issues/16923). ([commit](https://github.com/ckeditor/ckeditor5/commit/656d749880020f02a4b6c05571ce3a48038acc70))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The editor no longer crashes during initialization when the `ShiftEnter` plugin is removed.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Do not open disabled menu bar menu items on arrow down press. Closes [#17915](https://github.com/ckeditor/ckeditor5/issues/17915). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `ButtonView#icon` property can now be set/reset after the button's first render. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Widgets UI elements should be visible when they are inside tables. Closes [#18268](https://github.com/ckeditor/ckeditor5/issues/18268).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Nested tables outline should not be cut of at the bottom during hovering. Closes [#18262](https://github.com/ckeditor/ckeditor5/issues/18262).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Link balloon no longer disappears when scrolling the page slightly on iOS. Closes [#18022](https://github.com/ckeditor/ckeditor5/issues/18022).

### Other changes

* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: The Bookmark feature now uses the `WidgetToolbarRepository` instead of a custom `ActionsView` to display the bookmark toolbar in the contextual balloon. The new toolbar uses components registered in the `ComponentFactory`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: Form styles and structure are now unified with use of `ck-form` and `ck-form__row`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Translations are now supported in the date formatter used by comments and suggestions, allowing for localizing dates.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the read-only `DomConverter#domDocument` property. Closes [#18146](https://github.com/ckeditor/ckeditor5/issues/18146). ([commit](https://github.com/ckeditor/ckeditor5/commit/83c9a956ad2736aace2d969dc07bea266541de9c))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Image and custom resize form styles and structure now unified with use of `ck-form` and `ck-form__row`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link feature now uses the `ToolbarView` instead of a custom `LinkActionsView` to display the link toolbar in the contextual balloon. The new toolbar uses components registered in the `ComponentFactory`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Form styles and structure are now unified with use of `ck-form` and `ck-form__row`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Added a more modern look to the presence list collapsed view (used when many users are connected to the document).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The document outline will now be hidden when the revision history is opened.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Document outline and annotations will now be hidden when editor is in source editing mode. Closes [#17978](https://github.com/ckeditor/ckeditor5/issues/17978). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Extracted the `form.css` to `@ckeditor/ckeditor5-theme-lark` package. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Extracted the `FormRowView` to `@ckeditor/ckeditor5-ui` package. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `IconView` now throws a meaningful error if the provided icon content is not a valid SVG. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The `WidgetToolbarRepository#register()` now accepts a customized list of desired balloon positions. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Added the `Belarusian` language translations for CKEditor 5. Huge thanks to [@karavanjo](https://github.com/karavanjo). ([commit](https://github.com/ckeditor/ckeditor5/commit/49f5b1b08a66e3c68fea10ac84d3e5000ed8d479))
* Upgraded the minimal version of Node.js to 20.0.0 due to the end of LTS. ([commit](https://github.com/ckeditor/ckeditor5/commit/b47ca1e4fb7b014c1d52bc458d1dda9649e210fa))
* Updated TypeScript `target` to `es2022`. Closes [#17886](https://github.com/ckeditor/ckeditor5/issues/17886). ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Replaced `lodash-es` with `es-toolkit`. See [#16395](https://github.com/ckeditor/ckeditor5/issues/16395). ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* The `@ckeditor/ckeditor5-build-*` packages are no longer maintained. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/45.0.0): v45.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/45.0.0): v45.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/45.0.0): v45.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/45.0.0): v45.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/45.0.0): v44.3.0 => v45.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/45.0.0): v44.3.0 => v45.0.0

Other releases:

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/45.0.0): v44.3.0 => v45.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/45.0.0): v44.3.0 => v45.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/45.0.0): v44.3.0 => v45.0.0
</details>


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

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Export the `SchemaContext` class from package. Closes [#18003](https://github.com/ckeditor/ckeditor5/issues/18003). ([commit](https://github.com/ckeditor/ckeditor5/commit/4d64fda926e490151ef84eb8dc1c6d86d8eb69ad))
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
* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles)**: The `Code` feature should not convert element with the `word-wrap: break-word` style into the `<code>` tag. Closes [#17789](https://github.com/ckeditor/ckeditor5/issues/17789). ([commit](https://github.com/ckeditor/ckeditor5/commit/0b637cdda6fd13e0808fcbd43ea7ccc6d37de974))
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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
