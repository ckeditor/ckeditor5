Changelog
=========

## [34.2.0](https://github.com/ckeditor/ckeditor5/compare/v34.1.0...v34.2.0) (2022-06-27)

### Release highlights

We are happy to announce the release of CKEditor 5 v34.2.0.

This release introduces the following new features:

* A unsaved revision will now be resumed when the editor is re-initialized (instead of creating a new revision). **Note, that currently, this feature does not work for real-time editing integrations that use an editor bundle uploaded to Cloud Services.**
* Integrated the track changes feature with the code block and HTML embed features.
* Integrated CKEditor 5 with the CKBox service.

<!-- TODO: Add a link to the blog post. -->

### Features

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Added a new package (`@ckeditor/ckeditor5-ckbox`), which integrates the CKBox service with CKEditor 5. ([commit](https://github.com/ckeditor/ckeditor5/commit/c88c8ca46404420cb6545d88d2b436c789851cca))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the `annotations` property for the `WideSidebar`, `NarrowSidebar` and `InlineAnnotations` plugins. The property is an `AnnotationsCollection` instance which keeps all annotations added to the given UI.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Custom elements should be preserved by the General HTML Support feature. Closes [#11432](https://github.com/ckeditor/ckeditor5/issues/11432). ([commit](https://github.com/ckeditor/ckeditor5/commit/efd6f84ddc1d78f18e88d21fd7fa3d4af334af6e))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Introduced the `cloudServices.connectionTimeout` and `cloudServices.requestTimeout` configuration options that allow for changing timeout values for connecting to Cloud Services and for handling a single request.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Unsaved revision will now be resumed when the editor is re-initialized (instead of creating a new revision). Introduced the `revisionHistory.resumeUnsavedRevision` configuration option that turns on and off this behavior (defaults to `true`).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added track changes integration for the code block and HTML embed features.

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The order of attributes should not get reversed while loading editor data. Closes [#11850](https://github.com/ckeditor/ckeditor5/issues/11850). ([commit](https://github.com/ckeditor/ckeditor5/commit/22bc8e6488d40377722837de6646a56930c28087))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Inline filler should not be removed while updating a text node. Closes [#11472](https://github.com/ckeditor/ckeditor5/issues/11472). ([commit](https://github.com/ckeditor/ckeditor5/commit/64e029df3d0c375c1fd4655f279297ff919ac9f2))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The view element `renderUnsafeAttributes` option should not be lost for an AttributeElements. Closes [#11879](https://github.com/ckeditor/ckeditor5/issues/11879). ([commit](https://github.com/ckeditor/ckeditor5/commit/2fd7f852f27d2b7cb4af0e05d8ab0bffe79f796a))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Whitespaces between block elements should not trigger auto-paragraphing. Closes [#11248](https://github.com/ckeditor/ckeditor5/issues/11248). ([commit](https://github.com/ckeditor/ckeditor5/commit/efd6f84ddc1d78f18e88d21fd7fa3d4af334af6e))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed long revision history loading time when `Context` is used.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: The `formatHtml()` helper should not crash when a pathological `<iframe>` content is passed. Closes [#10698](https://github.com/ckeditor/ckeditor5/issues/10698). ([commit](https://github.com/ckeditor/ckeditor5/commit/4a599a84084046583b96f7d3d8b236123bfa79a0))
* **[toolbar](https://www.npmjs.com/package/@ckeditor/ckeditor5-toolbar)**: Added a toolbar button tooltip when focused improving accessibility for keyboard users. Closes [#5581](https://github.com/ckeditor/ckeditor5/issues/5581). ([commit](https://github.com/ckeditor/ckeditor5/commit/c79cea50bc9baecd03cfa6e00a9fb168a950118f))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The secondary button of the `SplitButtonView` component should display a tooltip while being hovered over by the user. Closes [#11833](https://github.com/ckeditor/ckeditor5/issues/11833). ([commit](https://github.com/ckeditor/ckeditor5/commit/f921c0645f228e788b26df04a87c5741ede83483))

### Other changes

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: The `IndentCodeBlockCommand` and the `OutdentCodeBlockCommand` are now using `model.insertContent()` and `model.deleteContent()` for easier extendability. ([commit](https://github.com/ckeditor/ckeditor5/commit/dd6cf1cdb17486b3959fedacf2f68dd5e5349c0d))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Use `innerText` instead of `innerHTML` in view/filler. ([commit](https://github.com/ckeditor/ckeditor5/commit/416678903a72f8e02f3c0fd8bebc506267141c28))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Raised default timeout settings for connecting to Cloud Services (to 10 seconds) and for handling a single request (to 20 seconds).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Added support for replacing editor data with revision data also for non-real-time editing integration.
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/e9a154ce0d73503b0452fa2ca1ca0b200c177d56), [commit](https://github.com/ckeditor/ckeditor5/commit/3015ff32c3ae591fd25441de03d3d3e25e6be3a3))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox): v34.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v34.1.0 => v34.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v34.1.0 => v34.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v34.1.0 => v34.2.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v34.1.0 => v34.2.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v34.1.0 => v34.2.0
</details>


## [34.1.0](https://github.com/ckeditor/ckeditor5/compare/v34.0.0...v34.1.0) (2022-05-23)

### Release highlights

We are happy to announce the release of CKEditor 5 v34.1.0.

This release introduces the following new features:

* [Table column resize](https://github.com/ckeditor/ckeditor5/issues/3284)
* Support for the document storage for the Revision history feature

There were also a few bug fixes:

* [Suggestions and comments are no longer lost](https://github.com/ckeditor/ckeditor5/issues/11688) on elements with enabled GHS attributes

Read about release highlights in a dedicated blog post: https://ckeditor.com/blog/ckeditor-5-v34.1.0-with-table-column-resize-feature-revision-history-enhancements-and-bugfixes/

### Cloud Services compatibility

⚠️ **Important message for CKEditor 5 Collaboration Server On-Premises users.**

The new version of CKEditor 5 real-time collaboration is not compatible with the current version of CKEditor 5 Collaboration Server On-Premises (`4.6.0`).

Please wait for the new release of the CKEditor 5 Collaboration Server On-Premises solution and update the backend service first, before updating the CKEditor 5 packages.

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Improved the `History` API. You can find  the changes summary in the related issue. Closes [#11226](https://github.com/ckeditor/ckeditor5/issues/11226). ([commit](https://github.com/ckeditor/ckeditor5/commit/8e9636428186bd058577cef0704ad6b326e895d6))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Added support for the `type` attribute of the `<ul>` and `<ol>` elements in addition to the `list-style-type` style. Closes [#11615](https://github.com/ckeditor/ckeditor5/issues/11615). ([commit](https://github.com/ckeditor/ckeditor5/commit/a6c677fa403ad0f907bab5c56a0040bcc8c87abd))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Introduced better support for revision history when editor bundle is used. This greatly reduced the number of calls and revision data passed to Cloud Services.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for table column resizing, which allows to set the width of each column in a table using a resize handle. ([commit](https://github.com/ckeditor/ckeditor5/commit/38c6c378e11327e84be40230381a8713c12117d6))

### Bug fixes

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Redundant text nodes should be removed from `<pre>` on upcast to avoid breaking the code block. Closes [#11616](https://github.com/ckeditor/ckeditor5/issues/11616). ([commit](https://github.com/ckeditor/ckeditor5/commit/000e360098e36a7441e9a78eb4ee7c602accf429))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Attributes should not be set if a parent was converted into a collapsed range. Closes [#11000](https://github.com/ckeditor/ckeditor5/issues/11000). ([commit](https://github.com/ckeditor/ckeditor5/commit/8c109b505ddeab753625cd3585d58c229ee7e515))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `elementToAttribute()` upcast helper should consume an element itself while consuming its attribute. See [#10800](https://github.com/ckeditor/ckeditor5/issues/10800). ([commit](https://github.com/ckeditor/ckeditor5/commit/b16a0a4675482c8a9de649f260f625b0ce3f1494))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Extracted upcasting attributes of the `figure` view element to separate converters for the `table`, `image` and `media` integrations. Closes [#11688](https://github.com/ckeditor/ckeditor5/issues/11688). ([commit](https://github.com/ckeditor/ckeditor5/commit/b5bd3e9141f0c221f66d8994777a4c1b939b3a05))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The `<div>` elements should be upcast to container-like elements when there is a block among their descendants. Closes [#11513](https://github.com/ckeditor/ckeditor5/issues/11513). ([commit](https://github.com/ckeditor/ckeditor5/commit/f407a0f16283ca3974a1356fad8b93029a2923aa))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Inline elements handled by a native editor plugin should not be handled by the GHS. Closes [#10800](https://github.com/ckeditor/ckeditor5/issues/10800), [#10954](https://github.com/ckeditor/ckeditor5/issues/10954). ([commit](https://github.com/ckeditor/ckeditor5/commit/b16a0a4675482c8a9de649f260f625b0ce3f1494))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Unlinking should remove a link even if there were some additional attributes handled by the GHS. See [#10800](https://github.com/ckeditor/ckeditor5/issues/10800). ([commit](https://github.com/ckeditor/ckeditor5/commit/b16a0a4675482c8a9de649f260f625b0ce3f1494))
* **[language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language)**: Fixes the interference between `TextPartLanguage` and `CodeBlock`. Closes [#11538](https://github.com/ckeditor/ckeditor5/issues/11538), [#11563](https://github.com/ckeditor/ckeditor5/issues/11563). ([commit](https://github.com/ckeditor/ckeditor5/commit/ae2b217733a69ba8cee8b6d689bdf09794304204))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: The mention UI should not show up when matching an existing mention following a white space. Closes [#11400](https://github.com/ckeditor/ckeditor5/issues/11400). ([commit](https://github.com/ckeditor/ckeditor5/commit/81a9c7cafca3e8dfd416e3b57b4aa024ef3e6814))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The `PaginationLookup` plugin should destroy parent class and stop listening to events from external emitters. Closes [#1148](https://github.com/cksource/ckeditor5-internal/issues/1148).
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fixes pasting multiple lines from Google Docs into a code block. ([commit](https://github.com/ckeditor/ckeditor5/commit/3f48fbc00650f98f2671329671c0d19c40c8f756)) Thanks to [@skylerfenn](https://github.com/skylerfenn)!
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Standard editing mode post-fixers will no longer create marker operations with invalid base versions. Closes [#11644](https://github.com/ckeditor/ckeditor5/issues/11644). ([commit](https://github.com/ckeditor/ckeditor5/commit/8e9636428186bd058577cef0704ad6b326e895d6))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Incorrect HTML was generated from a revision if there was a space at the end of a block which lead to crashes when comparing multiple revisions.
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: The block style should be applied to all matching selected blocks. Closes [#11582](https://github.com/ckeditor/ckeditor5/issues/11582). ([commit](https://github.com/ckeditor/ckeditor5/commit/5026d51f8229b6cfbf7c3acecf36f060eda41712))
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: Inline style can be removed from an inline widget. Closes [#11584](https://github.com/ckeditor/ckeditor5/issues/11584). ([commit](https://github.com/ckeditor/ckeditor5/commit/5026d51f8229b6cfbf7c3acecf36f060eda41712))
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: Inline styles should not be enabled inside a code block. Closes [#11581](https://github.com/ckeditor/ckeditor5/issues/11581). ([commit](https://github.com/ckeditor/ckeditor5/commit/5026d51f8229b6cfbf7c3acecf36f060eda41712))
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: Container styles (for example, a block quote style) should be applied properly. Closes [#11576](https://github.com/ckeditor/ckeditor5/issues/11576). ([commit](https://github.com/ckeditor/ckeditor5/commit/5026d51f8229b6cfbf7c3acecf36f060eda41712))
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: A grid with styles should render properly with two styles in a row. Closes [#11575](https://github.com/ckeditor/ckeditor5/issues/11575). ([commit](https://github.com/ckeditor/ckeditor5/commit/4ea053189cbc22fe362bab4bef7088059d85e1ef))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Exported some of the `engine.View` classes in `index.js`. ([commit](https://github.com/ckeditor/ckeditor5/commit/deea13117ecc9b131a34961b1a08e453e5bc1ba0))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Introduced `DataFilter#processViewAttributes()` that is helpful when integrating the GHS with a custom feature. Closes [#10827](https://github.com/ckeditor/ckeditor5/issues/10827). ([commit](https://github.com/ckeditor/ckeditor5/commit/8bb7f4bb5aaee234d1b36c790a4cc3e3a5add7f4))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Copying content from a single list item should not wrap it with a list in the clipboard. Closes [#11608](https://github.com/ckeditor/ckeditor5/issues/11608). ([commit](https://github.com/ckeditor/ckeditor5/commit/4159f23c158999b308853d9454a49e0e4c944135))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Revision dates will now be based on the server time instead of the local time.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: A revision date can now be updated on backend when the revision is saved using the revision history adapter. See the API reference for `RevisionHistoryAdapter#updateRevisions` to learn more.
* **[watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Improved the `ContextWatchdog` queueing mechanism. Closes [#11664](https://github.com/ckeditor/ckeditor5/issues/11664). ([commit](https://github.com/ckeditor/ckeditor5/commit/250ad62ca7c1b84dbdf593312345f6642923a7b6))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/c7960053e9ff1e75b315403ec44090fb88e74d32), [commit](https://github.com/ckeditor/ckeditor5/commit/ba18070dfe963869a42a13fba6984dd7fbadfb9f))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v34.0.1 => v34.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v34.0.0 => v34.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v34.0.0 => v34.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v34.0.0 => v34.1.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v34.0.0 => v34.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v34.0.0 => v34.1.0
</details>


## [34.0.0](https://github.com/ckeditor/ckeditor5/compare/v33.0.0...v34.0.0) (2022-04-08)

### Release highlights

We are happy to announce the release of CKEditor 5 v34.0.0.

This release introduces the following new features:

* [Support for document lists](https://github.com/ckeditor/ckeditor5/issues/2973)
* [Support for the lock mechanism for the `Editor#isReadOnly` property](https://github.com/ckeditor/ckeditor5/issues/10496)
* [Replacement for the CKEditor 4's styles dropdown feature](https://github.com/ckeditor/ckeditor5/issues/5700)
* Revision history: efficiency improvements and added the DLL build
* [Upgrade to PostCSS 8](https://github.com/ckeditor/ckeditor5/issues/11460)

There were also a few bug fixes:

* Certain markup no longer [breaks the editor when using the GHS feature](https://github.com/ckeditor/ckeditor5/issues/10703)
* Block insertion annotations are now properly displayed even [if there is any annotation afterwards](https://github.com/ckeditor/ckeditor5/pull/11506)

Read about release highlights in a dedicated blog post: https://ckeditor.com/blog/ckeditor-5-v34.0.0-with-redesigned-lists-new-styles-implementation-and-extended-dll-builds/

Please refer to the [Migration to v34.x](https://ckeditor.com/docs/ckeditor5/latest/updating/migration-to-34.html) guide to learn more about these changes.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* The `Editor#isReadOnly` property is now not editable directly. Starting this release, the property is controlled by `Editor#enableReadOnlyMode( lockId )` and `Editor#disableReadOnlyMode( lockId )`, which allow changing the `Editor#isReadOnly` state by more than one feature without collisions. See the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/migration-to-34.html) to learn more.

* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The new version of CKEditor 5 real-time collaboration works only with the new CKEditor 5 Cloud Services backend. If you use the CKEditor 5 Cloud Services On-Premise solution, please update the backend service if you decide to update the CKEditor 5 packages.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `isAllowedInsideAttributeElement` option has been removed, so the `AttributeElement` elements can wrap any view element (according to positions). Make sure that you are not wrapping any of the `ContainerElement` elements by accident by not checking the target in the converter. These would previously get wrapped by the `AttributeElement` element which would immediately be removed by the `ContainerElement` element within it so there would be no visible effect.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The handling of `Tab` and `Shift+Tab` keystrokes have been switched to the `'tab'` view document event across the project. If your integration uses `KeystrokeHandler` for `Tab` key handling, we recommend you migrate to the `'tab'` event to avoid unpredicted errors.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: If your integration uses the `Model#insertContent()` and `findOptimalInsertionRange()` methods to insert widgets into the content, we recommend you migrate your code to the `Model#insertObject()` method for best results. This is particularly relevant for compatibility with the document lists feature (see [#11198](https://github.com/ckeditor/ckeditor5/issues/11198)).
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The `$htmlSection`, `$htmlObjectBlock`, and `$htmlObjectInline` element types are no longer available for custom elements registered via the`registerBlockElement()` method to inherit from. Please use `$container`, `$blockObject`, and `$inlineObject` instead (see [#11197](https://github.com/ckeditor/ckeditor5/issues/11197)).

### Features

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Introduced the lock mechanism for the `Editor#isReadOnly` property. The read-only mode can now be separately enabled and disabled by multiple features, which allow for proper control without conflicts between features. Closes [#10496](https://github.com/ckeditor/ckeditor5/issues/10496). ([commit](https://github.com/ckeditor/ckeditor5/commit/b0234d94fe41d4a96397d3408994c26f56940221))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: `MultiCommand` now allows setting the priority (the order) of registered subcommands. Closes [#11083](https://github.com/ckeditor/ckeditor5/issues/11083). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the new `Model#insertObject()` method for inserting elements defined as objects by model schema (see [#11198](https://github.com/ckeditor/ckeditor5/issues/11198)). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the inheritable `$container`, `$blockObject`, and `$inlineObject` element types in the model `Schema` (see [#11197](https://github.com/ckeditor/ckeditor5/issues/11197)). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `TabObserver` observer that allows listening to pressing down the `Tab` key in the specified context. ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the new `Schema#getAttributesWithProperty()` method that retrieves attributes from a node which has a given property (see [#11198](https://github.com/ckeditor/ckeditor5/issues/11198)). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the new `Schema#setAllowedAttributes()` method that validates whether attributes are allowed on a given element before setting them (see [#11198](https://github.com/ckeditor/ckeditor5/issues/11198)). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Changes to GHS model attributes will be reflected in the editing view (see [#5700](https://github.com/ckeditor/ckeditor5/issues/5700)). ([commit](https://github.com/ckeditor/ckeditor5/commit/fc562455439f903bb655533f00652f69a2fa3d97))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added support for document list in the `GeneralHtmlSupport` feature. Closes [#11454](https://github.com/ckeditor/ckeditor5/issues/11454), [#11359](https://github.com/ckeditor/ckeditor5/issues/11359), [#11358](https://github.com/ckeditor/ckeditor5/issues/11358). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introducing the document list feature (multiple blocks per list item). Closes [#2973](https://github.com/ckeditor/ckeditor5/issues/2973), [#10812](https://github.com/ckeditor/ckeditor5/issues/10812). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introducing the document list properties feature (list styles, start index, reversed list). Closes [#11065](https://github.com/ckeditor/ckeditor5/issues/11065). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph)**: Added an optional `options.attributes` parameter to the `InsertParagraph` command that allows setting attributes on a created paragraph (see [#11198](https://github.com/ckeditor/ckeditor5/issues/11198)). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: Implemented the configurable style feature with the style UI dropdown. Closes [#5700](https://github.com/ckeditor/ckeditor5/issues/5700). ([commit](https://github.com/ckeditor/ckeditor5/commit/fc562455439f903bb655533f00652f69a2fa3d97))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Implemented a `.ck-reset_all-excluded` CSS class that excludes certain elements from CSS reset. Closes [#11451](https://github.com/ckeditor/ckeditor5/issues/11451). ([commit](https://github.com/ckeditor/ckeditor5/commit/8e3b902f54a5de3750c8e50d56e8196ac0d918d1))

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Marker changes sometimes did not trigger `change:data` event which resulted in errors in features using markers (for example, annotations not showing up in the sidebar). ([commit](https://github.com/ckeditor/ckeditor5/commit/59c0319922a0c91b2fc2045c88ad794d83f9f4a5))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: GHS should not convert already consumed inline elements (e.g. handled by other editor features). Closes [#11447](https://github.com/ckeditor/ckeditor5/issues/11447). ([commit](https://github.com/ckeditor/ckeditor5/commit/0fb6dc46327c685b64de7a1195c81ddbabc44f4c))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Prevent the `TypeError` error in the `mergeViewElementAttributes()` function. Closes [#10657](https://github.com/ckeditor/ckeditor5/issues/10657), [#11450](https://github.com/ckeditor/ckeditor5/issues/11450), [#11477](https://github.com/ckeditor/ckeditor5/issues/11477). ([commit](https://github.com/ckeditor/ckeditor5/commit/bc6e4d44c0e0e39eac2906c7c5042a5aaad4c59d))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Skip inline image upcast conversion inside not supported element. Closes [#10703](https://github.com/ckeditor/ckeditor5/issues/10703). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f6e48af6b7c819506258d10df8d0f26a952996d))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image upcast converter should consume the `[src]` attribute. Closes [#11530](https://github.com/ckeditor/ckeditor5/issues/11530). ([commit](https://github.com/ckeditor/ckeditor5/commit/64d069d50a8106fed63d72a30954bc413ed8147d))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link decorators should be converted on block images only once (should not wrap block image with an additional link). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Soft enter (`Shift+Enter`) is no longer captured by the document list enter key listener, allowing to insert soft breaks in empty list items. Closes [#11539](https://github.com/ckeditor/ckeditor5/issues/11539). ([commit](https://github.com/ckeditor/ckeditor5/commit/fc5a9c29716231d9aee0808618d54ff3aaf15068))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The view list split converter should not fire if the change was already consumed. Closes [#11490](https://github.com/ckeditor/ckeditor5/issues/11490). ([commit](https://github.com/ckeditor/ckeditor5/commit/ab3e7771c1b33cf34aad2a0c8178fb53bb759e3b))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: List properties should remain the same after a paragraph following a list is toggled into a list item. Closes [#11408](https://github.com/ckeditor/ckeditor5/issues/11408). ([commit](https://github.com/ckeditor/ckeditor5/commit/b8da51dff2ae1a12d08906179b6c2b14339ac94c))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Fixed updating pagination lines after resizing the editing root ancestor.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Editor will not get stuck if the revision diff data could not be loaded due to an error when opening or using the revision viewer.

### Other changes

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: The handling of `Tab` and `Shift+Tab` keystrokes switched to the `'tab'` view document event and now respects the event context. ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The `Editor#isReadOnly` property is now marked as read-only. ([commit](https://github.com/ckeditor/ckeditor5/commit/b0234d94fe41d4a96397d3408994c26f56940221))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `Differ` change entries for `insert` and `remove` types are extended with a map of attributes that were set while inserting an element or that belonged to an element that got removed. ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DowncastHelpers` are passing an additional parameter to the creator functions (the `data` that provides more context to the element creator callback). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `isAllowedInsideAttributeElement` option was removed, from now on `AttributeElements` are allowed to wrap any view element. ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ConversionApi` provided by the `UpcastDispatcher` was extended by an additional `keepEmptyElement()` method that marks an element that was created during splitting a model element that should not get removed on conversion even if it is empty. ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Improved `model.TreeWalker#next()` efficiency. See [ckeditor/ckeditor5#11463](https://github.com/ckeditor/ckeditor5/pull/11463). ([commit](https://github.com/ckeditor/ckeditor5/commit/23122e0662b155a3e783eda0a81ab2ea932c64fe))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Updated default schema definitions for various elements taking advantage of the `$container`, `$blockObject`, and `$inlineObject` elements in model schema (see [#11197](https://github.com/ckeditor/ckeditor5/issues/11197)). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Added the optional `findOptimalPosition` parameter to the `insertMedia()` helper that allows for inserting `media` model element without breaking the content (see [#11198](https://github.com/ckeditor/ckeditor5/issues/11198)). ([commit](https://github.com/ckeditor/ckeditor5/commit/b53d2a4b49679b072f4ae781ac094e7e831cfb14))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Improved revision history performance for large documents in the following areas: editor initialization time, revision saving time and revision comparison time.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The `@ckeditor/ckeditor5-revision-history` package exposes the DLL build.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Exports `PlainTableOutput` plugin from the table package. Closes [#11516](https://github.com/ckeditor/ckeditor5/issues/11516). ([commit](https://github.com/ckeditor/ckeditor5/commit/a88be06284562c85311c9a288136f07e268aa92b))
* **[watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Improved performance of the `getSubNodes()` utility of `Watchdog`. ([commit](https://github.com/ckeditor/ckeditor5/commit/ee63f3944b4610b2b6b65682fd480ee3bade8167))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/336b9d95d56544b0688c3d4954e41e062f54972b), [commit](https://github.com/ckeditor/ckeditor5/commit/ad308bd8505adbbf1c334b08d9f2809e33957c45))
* CKEditor 5 uses `PostCSS@8` now. Closes [#11460](https://github.com/ckeditor/ckeditor5/issues/11460). ([commit](https://github.com/ckeditor/ckeditor5/commit/4afb9b11b6c66f013c6818a265dca48ef94d3b69))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style): v34.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v33.0.0 => v34.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v33.0.0 => v34.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v33.0.0 => v34.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v33.0.0 => v34.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v33.0.0 => v34.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v33.0.0 => v34.0.0
</details>


## [33.0.0](https://github.com/ckeditor/ckeditor5/compare/v32.0.0...v33.0.0) (2022-03-07)

### Release highlights

We are happy to announce the release of CKEditor 5 v33.0.0.

This release introduces the following new features:

* [A new, completely redesigned reconversion system](https://github.com/ckeditor/ckeditor5/issues/10294).
* [Support for handling the `<style>` element in the General HTML Support feature](https://github.com/ckeditor/ckeditor5/issues/11104).
* [DLL-compatible package builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html) for [collaboration features](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/collaboration.html).
* [A solution for how to downcast a table to `table>caption`](https://github.com/ckeditor/ckeditor5/issues/10892).
* [Real-time collaboration support in revision history](https://ckeditor.com/ckeditor-5/revision-history/).

There were also a few bug fixes:

* [Removing complex emojis now works as expected](https://github.com/ckeditor/ckeditor5/issues/6504).
* [Preparing DLL package builds in the development mode (the `--dev` flag) no longer ends with an error](https://github.com/ckeditor/ckeditor5/issues/11170).
* [Clicking content that has a comment does not cause content data change (resulting with extra autosave)](https://github.com/ckeditor/ckeditor5/issues/9901).
* [The `<CKEditorContext>` React component now destroys properly](https://github.com/ckeditor/ckeditor5-react/issues/283).

Read about release highlights in a dedicated blog post: https://ckeditor.com/blog/ckeditor-5-v33.0.0-with-improved-conversion-system-and-dll-builds-for-collaboration-features/

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Removed the `Differ#refreshItem()` method from the public API. Replaced by `EditingController#reconvertItem()` (see [#10659](https://github.com/ckeditor/ckeditor5/issues/10659)).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The downcast dispatcher will throw an error if any of the model items were not consumed while converting. Read the `conversion-model-consumable-not-consumed` error documentation for more information.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DowncastDispatcher#conversionApi` property is no longer available. The instances of `DowncastConversionApi` are created at the start of conversion.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Support for the `triggerBy` option for downcast helpers was removed and replaced with the new `elementToStructure()` options.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `ListEditing`, `ListUI`, `ListStyleEditing`, `ListStyleUI`, `TodoListEditing`, `TodoListUI` plugins were moved to their dedicated subdirectories (`list`, `liststyle`, `todolist`).

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Image caption utilities were converted to the `ImageCaptionUtils` plugin.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The downcast converters of the table feature were rewritten with the use of `elementToStructure()` and the re-conversion mechanism. See [#10502](https://github.com/ckeditor/ckeditor5/issues/10502).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table selection utilities were moved to the `TableUtils` plugin.
* `config.initialData` will now always be set, even if it is not passed in the editor configuration.

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DowncastWriter#createContainerElement()` method should accept a list of children so that bigger view structures can be created in one call. Closes [#10714](https://github.com/ckeditor/ckeditor5/issues/10714). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `elementToElement()` downcast helper will log a console warning if multiple elements have been created. Closes [#10610](https://github.com/ckeditor/ckeditor5/issues/10610). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The downcast dispatcher will throw an error if any of the model items were not consumed while converting. Closes [#10377](https://github.com/ckeditor/ckeditor5/issues/10377). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `convertItem()`, `convertChildren()` and `convertAttributes()` methods in the downcast conversion API interface. ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added support for reconversion in the `DowncastHelpers#elementToElement()` downcast helper. Closes [#10359](https://github.com/ckeditor/ckeditor5/issues/10359). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the `DowncastHelpers#elementToStructure()` downcast helper with reconversion support. Closes [#10358](https://github.com/ckeditor/ckeditor5/issues/10358). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: It is now possible to trigger a nested conversion while downcasting an element. ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DeleteCommand` was changed to delete the whole multi-character emoji at once. Closes [#6504](https://github.com/ckeditor/ckeditor5/issues/6504). ([commit](https://github.com/ckeditor/ckeditor5/commit/7ab70396f68bd9e3ef0ff7cbc3d62ae143c38ec4))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced `Marker#getData()`. ([commit](https://github.com/ckeditor/ckeditor5/commit/7e8766dc0d4654c33fed5f5edeb5e09e0138b1b7))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added the `<style>` element support in the General HTML Support feature. Closes [#11104](https://github.com/ckeditor/ckeditor5/issues/11104). ([commit](https://github.com/ckeditor/ckeditor5/commit/483bcf91af1334e510462ef0b4723a2df2a30881))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced the `PlainTableOutput` plugin to override the default `figure>caption` markup in the data pipeline (it outputs the table as `table>caption`). Closes: [#10892](https://github.com/ckeditor/ckeditor5/issues/10892). ([commit](https://github.com/ckeditor/ckeditor5/commit/9379c5cb35ed29229d1e9beebf5cdad0a32e008e))

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Setting a marker to the same range it was will no longer trigger the `change:data` event. This will prevent unnecessary autosave callbacks. Closes [#9901](https://github.com/ckeditor/ckeditor5/issues/9901). ([commit](https://github.com/ckeditor/ckeditor5/commit/0a9e5a9c34a83324fec2242f2d5c86669c08ed02))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Prevent the removal of the `<script>` and `<style>` elements when they are the only content in the editor. Closes [#11247](https://github.com/ckeditor/ckeditor5/issues/11247). ([commit](https://github.com/ckeditor/ckeditor5/commit/68cbac385caa5f60a4b1a96dc2e077242ff50d6c))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Always create new instances of the default options for the `ImageStyle` plugin. Closes [#11328](https://github.com/ckeditor/ckeditor5/issues/11328). ([commit](https://github.com/ckeditor/ckeditor5/commit/7f7248df35fc7e57649b4a9e8fcfc4076547a300))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Prevent the plain table output converter from interfering with other features' caption converters. Closes [#11394](https://github.com/ckeditor/ckeditor5/issues/11394). ([commit](https://github.com/ckeditor/ckeditor5/commit/e102d21b9e58c464d5914f2bb556e9a7a98b947d))
* Fixed the _"Unknown option --dev"_ error when building DLL files with the development mode enabled. Closes [#11170](https://github.com/ckeditor/ckeditor5/issues/11170). ([commit](https://github.com/ckeditor/ckeditor5/commit/9078c76e6e38428f36151f1f67ddc78b96930a3f))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Implemented the `EditingController#reconvertMarker()` method to be used instead of `Writer#updateMarker()` for marker reconversion purposes. Implemented the `EditingController#reconvertItem()` method to replace `Differ#refreshItem()`. Closes [#10659](https://github.com/ckeditor/ckeditor5/issues/10659). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The conversion events for attribute and child nodes are fired by the lowest priority handler for the insert event instead of the `DowncastDispatcher` itself. Closes [#10376](https://github.com/ckeditor/ckeditor5/issues/10376). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Events are fired by the `DowncastDispatcher` even if they were previously consumed. It is the conversion handler's responsibility to check if it can be consumed or if it has already been consumed by other converters. ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DowncastDispatcher#convert()` method was introduced as a replacement for the previously used `convertInsert()`. The new method not only handles the nodes conversion but also the markers. ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `<style>` element will not interfere with the editing experience. See [#11104](https://github.com/ckeditor/ckeditor5/issues/11104). ([commit](https://github.com/ckeditor/ckeditor5/commit/483bcf91af1334e510462ef0b4723a2df2a30881))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: Moved the utilities functions to plugins to make them available in DLLs. ([commit](https://github.com/ckeditor/ckeditor5/commit/8df284e9b22b3fca3b87e056e81486035308d3e6))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `ckeditor5-list` package was restructured into subdirectories. Closes [#10811](https://github.com/ckeditor/ckeditor5/issues/10811). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The downcast conversion should consume the downcasted attributes. ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table downcast conversion was migrated to the `elementToStructure()` downcast helper. Closes [#10502](https://github.com/ckeditor/ckeditor5/issues/10502). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f17c59e678c39c80beed98fa9dd092ba95369c5))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/1824dce6d132c3118d70ddf02a80ed5d1e118371))
* `Editor.create()` will now set the `config.initialData` value based on the first parameter if `initialData` has not been set in the editor configuration. As a result, plugins can now easily read and modify the editor initial data. ([commit](https://github.com/ckeditor/ckeditor5/commit/66ea1af43163dacfb2ce353fc3a670535b6e5740))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v32.0.0 => v33.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v32.0.0 => v33.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v32.0.0 => v33.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v32.0.0 => v33.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v32.0.0 => v33.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v32.0.0 => v33.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration): v32.0.0 => v33.0.0
</details>


## [32.0.0](https://github.com/ckeditor/ckeditor5/compare/v31.1.0...v32.0.0) (2022-01-26)

### Release highlights

We are happy to announce the release of CKEditor 5 v32.0.0.

This release introduces the following new features:

* The environment was upgraded to use [webpack 5](https://github.com/ckeditor/ckeditor5/issues/10668) and [Node 14](https://github.com/ckeditor/ckeditor5/issues/10972).
* Introduced [support for the list `start` and `reversed` attributes](https://github.com/ckeditor/ckeditor5/issues/1032), including [when pasting from Word](https://github.com/ckeditor/ckeditor5/issues/11043).
* Added [support for autocomplete with space in the mention plugin](https://github.com/ckeditor/ckeditor5/issues/9741).
* Improved [handling of `<script>` elements in the General HTML support (GHS) feature](https://github.com/ckeditor/ckeditor5/issues/10891).

Read about release highlights in a dedicated blog post: https://ckeditor.com/blog/ckeditor-5-v32.0.0-with-new-list-properties-support-for-the-script-tag-and-enhanced-mentions/

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Batch#type` was deprecated. It will always return the `'default'` value and reading it will log a warning in the console. Use `Batch#isUndoable`, `Batch#isLocal`, `Batch#isUndo` and `Batch#isTyping` instead.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Multiple changes to `Revision` properties were introduced that impact revision history integrations. Introduced `#fromRevision` and `#toRevision` properties. Renamed `#data` to `#diffData`. The `#isLocked` property was removed. These changes have an impact on what data should be saved in your database and how the revision history plugin should be integrated. Please refer to the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-32.html) and the [API documentation](https://ckeditor.com/docs/ckeditor5/latest/api/module_revision-history_revision-Revision.html) to learn more about these changes.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The `RevisionHistoryAdapter` interface has changed. Also, `RevisionTracker` no longer uses `RevisionHistoryAdapter#getRevisions()` to fetch revisions during the editor initialization. You should add revisions data in your integration plugin. Please refer to the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-32.html) and the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/revision-history/revision-history-integration.html#adapter-integration) to learn how to update your revision history integration.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: `RevisionTracker#updateRevision()` was removed while the `#update()` and `#saveRevision()` methods have been introduced instead. This may have an impact on your revision history integration (e.g. with autosave). Please refer to the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-32.html) and the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/revision-history/revision-history-integration.html#autosave-integration) to learn how to update your revision history integration.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: `Input#isInput()` was removed. Use `Batch#isTyping` instead.
* Upgraded the minimal versions of Node.js to `14.0.0` due to the end of LTS.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The string value for the `Batch` type and `Model#enqueueChange()` is now deprecated. Using a string value will log a warning in the console. Use an object value instead. For more information, refer to the API documentation.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: `RevisionTracker#isLocked` was removed.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The flow for saving and updating a revision has changed. See the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/revision-history/revision-history-integration.html#how-revisions-are-updated-and-saved) to learn what it looks like after the changes.
* The previously named `#_getTemplate()` methods in `CommentThreadView`, `CommentView` and `SuggestionThreadView`  were renamed to `#getTemplate()`. These methods are used in annotations customization when changing the default templates.

### Features

* **[autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave)**: `Autosave#save()` will now return a promise that is resolved when the autosave callback has finished. ([commit](https://github.com/ckeditor/ckeditor5/commit/3e2f1b3458c44dda3e86f326192135a9e1fa3042))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced `Annotation#refreshVisibility()` and `Annotations#refreshVisibility()` that refresh the visibility of the annotations based on the visibility of their target elements.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the `Annotation#isVisible` observable property that allows controlling the visibility of the annotation.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added support for the `<script>` elements. Closes [#10891](https://github.com/ckeditor/ckeditor5/issues/10891). ([commit](https://github.com/ckeditor/ckeditor5/commit/277a5919870e69c330337f13a7df92dd9999fbc3))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Implemented the numbered list properties UI. Closes [#10877](https://github.com/ckeditor/ckeditor5/issues/10877). ([commit](https://github.com/ckeditor/ckeditor5/commit/9be585f8b7d6d7ef504a48b101c4961137f3e8da))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Added support for reversed lists and list start index (`reversed` and `start` HTML attributes). Closes [#10673](https://github.com/ckeditor/ckeditor5/issues/10673). ([commit](https://github.com/ckeditor/ckeditor5/commit/d0806398ddeea527c9a858b70add8e4528fb502c))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: The mention plugin now allows searching mentions that include space characters. Closes [#9741](https://github.com/ckeditor/ckeditor5/issues/9741). ([commit](https://github.com/ckeditor/ckeditor5/commit/d95bc68459ccd4b580e19cfcc1b660d743f52b52))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Added support for start index in ordered lists. Closes [#11043](https://github.com/ckeditor/ckeditor5/issues/11043). ([commit](https://github.com/ckeditor/ckeditor5/commit/807b60f948a96da1d1b058230cfcef3251f67852))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Introduced `Revision#fromVersion` and `Revision#toVersion`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Introduced new methods in the `RevisionHistory` plugin: `#addRevisionData()`, `#getRevision()`, `#getRevisions()`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced the `InputNumberView` class and the `createLabeledInputNumber()` helper for creating number inputs (see [#10877](https://github.com/ckeditor/ckeditor5/issues/10877)). ([commit](https://github.com/ckeditor/ckeditor5/commit/638ef662f630da3478bf4a5d2b94fe87c2e497b8))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced the `InputView` class for other inputs such as `InputTextView` to inherit from (see [#10877](https://github.com/ckeditor/ckeditor5/issues/10877)). ([commit](https://github.com/ckeditor/ckeditor5/commit/9be585f8b7d6d7ef504a48b101c4961137f3e8da))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced the `isVisible()` helper to detect whether DOM elements are visible to the user in the DOM (see [#10877](https://github.com/ckeditor/ckeditor5/issues/10877)). ([commit](https://github.com/ckeditor/ckeditor5/commit/9be585f8b7d6d7ef504a48b101c4961137f3e8da))
* Replaced `Batch#type` with a set of flags: `Batch#isUndoable`, `Batch#isLocal`, `Batch#isUndo`, `Batch#isTyping` which better represent the batch type. The `Batch` constructor and `Model#enqueueChange()` now expect an object. Closes [#10967](https://github.com/ckeditor/ckeditor5/issues/10967). ([commit](https://github.com/ckeditor/ckeditor5/commit/83538a860d6d914d48790d8963ce0c0a5b54678e))

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: DOM listeners will be detached when destroying annotation collections, which prevents memory leaks.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `HTMLDataProcessor#toView()` should preserve leading non-layout elements while loading partial HTML. Closes [#11110](https://github.com/ckeditor/ckeditor5/issues/11110). ([commit](https://github.com/ckeditor/ckeditor5/commit/b355feb3d0a0aea0f052a7c24fe8691f7fa2518e))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The list properties feature will no longer crash when removing content from the last list item which is next to a non-list element. Closes [#8642](https://github.com/ckeditor/ckeditor5/issues/8642). ([commit](https://github.com/ckeditor/ckeditor5/commit/8b69b9569c1525bedeed6932397dead9f7c41ff1))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The page number input view should not stretch. Used `InputNumberView` to render the page number input in `PageNavigatorView`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash when a revision contained overlapping suggestions.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash when content selected by triple-click was copied and pasted into the editor.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a crash that was happening during real-time editing when one of the users used <kbd>Enter</kbd> inside a suggestion.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Fixed an editor crash when an unrecognized transformation was provided in the configuration (as a string). ([commit](https://github.com/ckeditor/ckeditor5/commit/83538a860d6d914d48790d8963ce0c0a5b54678e))
* **[watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Prevented `EditorWatchdog` from crashing during the editor destruction process when one of the plugins tries to change the data at that moment. Closes [#10643](https://github.com/ckeditor/ckeditor5/issues/10643). ([commit](https://github.com/ckeditor/ckeditor5/commit/9151ef738c3ca766d093adddb99df1667c145379))

### Other changes

* **[autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave)**: The `Autosave` plugin will now ignore changes coming from remote clients during real-time collaboration. Closes [#9233](https://github.com/ckeditor/ckeditor5/issues/9233). ([commit](https://github.com/ckeditor/ckeditor5/commit/3e2f1b3458c44dda3e86f326192135a9e1fa3042))
* **[build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)**: Enabled the `startIndex` and `reversed` list properties in the document build. Closes [#11037](https://github.com/ckeditor/ckeditor5/issues/11037). ([commit](https://github.com/ckeditor/ckeditor5/commit/99c818c7b9ddf62aa958b9d265de43e3c78b7e66))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Renamed `CommentThreadView#_getTemplate()` to `#getTemplate()`. Renamed `CommentView#_getTemplate()` to `#getTemplate()`.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Renamed the `ListStyle` plugin to `ListProperties`. Closes [#10964](https://github.com/ckeditor/ckeditor5/issues/10964). ([commit](https://github.com/ckeditor/ckeditor5/commit/82ce2e9671b8ec98fb20f3ee647cca94ec421949))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Collaboration updates will now be sent with shorter delays after they are rejected. This should allow for a better user experience when multiple users are typing at the same time.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The `RealTimeCollaborationClient#offset` property is now private.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The real-time collaboration feature will now create batches with the `#isLocal` flag set to `false`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Renamed `Revision#data` to `Revision#diffData`. The `Revision#isLocked` property was removed.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The `RevisionHistoryAdapter` interface has changed. Removed `#getRevisions()`, `#updateRevision()` and `#addRevision()`. Added `#updateRevisions()`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The revision history UI will now be blocked if the editor is in read-only mode.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Added the `index` parameter in `RevisionRepository#addRevision()`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Removed `RevisionTracker#isLocked`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Removed `RevisionTracker#updateRevision()` and added `#update()` and `#saveRevision()` instead.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: `RevisionTracker` no longer uses `RevisionHistoryAdapter#getRevisions()` to fetch revisions during the editor initialization.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: An error is now thrown when the revision history plugin configuration is missing.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: `RevisionHistoryAdapter#getRevision()` and `#updateRevisions()` now receive the `#channelId` parameter.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Renamed `SuggestionThreadView#_getTemplate()` to `#getTemplate()`.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The typing feature will now create batches with the `#isTyping` property set to `true`. ([commit](https://github.com/ckeditor/ckeditor5/commit/83538a860d6d914d48790d8963ce0c0a5b54678e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: `FocusCycler` should skip elements that are invisible to the user (see [#10877](https://github.com/ckeditor/ckeditor5/issues/10877)). ([commit](https://github.com/ckeditor/ckeditor5/commit/9be585f8b7d6d7ef504a48b101c4961137f3e8da))
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: The undo feature will now create batches with the `#isUndo` property set to `true`. ([commit](https://github.com/ckeditor/ckeditor5/commit/83538a860d6d914d48790d8963ce0c0a5b54678e))
* **[users](https://www.npmjs.com/package/@ckeditor/ckeditor5-users)**: The anonymous user will now be added to the `Users` plugin automatically when the editor initializes.
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/4465bcbc057fc2c87f7431ba588fe417609dec3b), [commit](https://github.com/ckeditor/ckeditor5/commit/e4b9c643dd035361df14ec503bb1bdcfa858a01a))
* Updated the required version of Node.js to 14. Closes [#10972](https://github.com/ckeditor/ckeditor5/issues/10972). ([commit](https://github.com/ckeditor/ckeditor5/commit/0537006c6bfb3a946a0293f318ecc67f4c18f51d))
* Project migration to webpack 5. Closes [#10668](https://github.com/ckeditor/ckeditor5/issues/10668). ([commit](https://github.com/ckeditor/ckeditor5/commit/d312ab630000f84f232ff2c372cdfc53e06b7f16))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v31.1.0 => v32.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v31.1.0 => v32.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v31.1.0 => v32.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v31.1.0 => v32.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v31.1.0 => v32.0.0
</details>


## [31.1.0](https://github.com/ckeditor/ckeditor5/compare/v31.0.0...v31.1.0) (2021-12-03)

### Release highlights

We are happy to announce the release of CKEditor 5 v31.1.0.

This release introduces the following new features:

* [Support for <kbd>Shift</kbd>+<kbd>Delete</kbd> on Windows to cut the selected content](https://github.com/ckeditor/ckeditor5/issues/9326).
* [Possibility to open a link with <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+click or <kbd>Alt</kbd>+<kbd>Enter</kbd>](https://github.com/ckeditor/ckeditor5/issues/1381).
* [Mark the default output for features in the HTML output guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/features-html-output-overview.html).

There were also a few bug fixes:

* [Selection was sometimes not merged correctly](https://github.com/ckeditor/ckeditor5/issues/10628).
* [It was almost impossible to click certain buttons in the balloon toolbar (Safari, iOS)](https://github.com/ckeditor/ckeditor5/issues/7707).
* [The editor builder `defaultConfig.language` did not apply to `editor.locale`](https://github.com/ckeditor/ckeditor5/issues/8510).
* [Find and replace did not find whole words that are next to each other](https://github.com/ckeditor/ckeditor5/issues/10719).
* [Figure tag got duplicated when the General HTML Support configuration allows all](https://github.com/ckeditor/ckeditor5/issues/10279).

Read about release highlights in a dedicated blog post: https://ckeditor.com/blog/ckeditor-5-v31.1.0-with-enhanced-copy-and-paste-and-reconnection-handling/

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Changed `table` elements' attributes' names introduced by the `TablePropertiesEditing` plugin by prefixing them with `table` to be in line with other plugins' attributes naming. The affected attribute include: `borderStyle`, `borderColor`, `borderWidth`, `backgroundColor`, `alignment`, `width`, `height`. See [#9369](https://github.com/ckeditor/ckeditor5/issues/9369).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Changed `tableCell` elements' attributes' names introduced by the `TableCellPropertiesEditing` plugin by prefixing them with `tableCell` to be in line with other plugins' attribute naming. The affected attributes include: `backgroundColor`, `padding`, `width`, `height`, `borderStyle`, `borderColor`, `borderWidth`, `verticalAlignment`, `horizontalAlignment`. See [#9369](https://github.com/ckeditor/ckeditor5/issues/9369).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `upcastBorderStyles()` helper parameters were modified (added the `modelAttributes` param).

### Features

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the `AnnotationsUIs#refilterAnnotations()` method which runs annotation UI filtering callback against all annotations and moves them to proper annotation UIs (or removes them).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Added the possibility to open a link by <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+click or <kbd>Alt</kbd>+<kbd>Enter</kbd>. Closes [#1381](https://github.com/ckeditor/ckeditor5/issues/1381). ([commit](https://github.com/ckeditor/ckeditor5/commit/654410f9286222232bb38237516421e4d97fa9da))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Introduced color boxes for color-related suggestions.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced `env.isiOS` for detection of user agents running in iOS environments (see [#7707](https://github.com/ckeditor/ckeditor5/issues/7707)). ([commit](https://github.com/ckeditor/ckeditor5/commit/89b5315550e1dbcf26bc9cb4678931670b9bb52c))

### Bug fixes

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Support language configuration passed in `defaultConfig` option through editor's constructor. Closes [#8510](https://github.com/ckeditor/ckeditor5/issues/8510). ([commit](https://github.com/ckeditor/ckeditor5/commit/6c22bb509e299319cebec18eb980ce9ed079d905))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Merge intersecting ranges that are not adjacent to each other on ranges array. Closes [#10628](https://github.com/ckeditor/ckeditor5/issues/10628). ([commit](https://github.com/ckeditor/ckeditor5/commit/92565ab6656a1e71e9687a53fa549aaf514f46fd))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Replace functionality no longer replaces text when 'Replace with...' input is focused and user hits the <kbd>Enter</kbd> key but the search criteria changed. Closes [#10712](https://github.com/ckeditor/ckeditor5/issues/10712). ([commit](https://github.com/ckeditor/ckeditor5/commit/4bc96460753133d24c9cd660efd5b4418c320267))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Fixed adjacent whole words being missed by find and replace. Closes [#10719](https://github.com/ckeditor/ckeditor5/issues/10719). ([commit](https://github.com/ckeditor/ckeditor5/commit/5d466b59231fe59b9c0bcfbab3cd6acff90a94ba))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Manual decorators on the linked inline images should be preserved while loading editor content. Closes [#10828](https://github.com/ckeditor/ckeditor5/issues/10828). ([commit](https://github.com/ckeditor/ckeditor5/commit/6d0b8da4997a5e29c5c4a125c9c6e670f49e8af4))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `<figure>` element should not get replicated while GHS is enabled. Closes [#10279](https://github.com/ckeditor/ckeditor5/issues/10279). ([commit](https://github.com/ckeditor/ckeditor5/commit/634d4241544a7278a085c820720c8abb35f426c3))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The whole reconnection mechanism was improved. More reconnection scenarios are now handled without editor crashing or data loss. **Note: these changes require Collaboration Server On-Premises in version higher than `4.2.0`. Otherwise, the fix will not be applied.**
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Disabled alignment button on main editor toolbar for tables in order to have a more unified behavior. Closes [#9369](https://github.com/ckeditor/ckeditor5/issues/9369). ([commit](https://github.com/ckeditor/ckeditor5/commit/e28354821506cad4fb01d45e9adff3077a2843e2))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Creating document color suggestions no longer causes the editor to crash.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Changed the look and position of the `BalloonToolbar` in Safari on iOS to avoid clash with native text selection handles. Closes [#7707](https://github.com/ckeditor/ckeditor5/issues/7707). ([commit](https://github.com/ckeditor/ckeditor5/commit/89b5315550e1dbcf26bc9cb4678931670b9bb52c))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Fixed `DomEmitterMixin` to correctly manage listeners for different options (`useCapture` & `usePassive`) set for the same DOM node. Closes [#7830](https://github.com/ckeditor/ckeditor5/issues/7830). ([commit](https://github.com/ckeditor/ckeditor5/commit/fe1110631bb927dc216c619d90da0476e1752397))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Allowed unsafe view element attributes so they get rendered in the editing pipeline. Attribute names can be specified when creating elements using `DowncastWriter` (`DowncastWriter#createAttributeElement()`, `DowncastWriter#createContainerElement()`, etc.). ([commit](https://github.com/ckeditor/ckeditor5/commit/ecc18324f4c5fe3e5c12c46d1d127922734dee9c))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Changed suggestion description for a highlighted text fragment.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Added support for the <kbd>Shift</kbd>+<kbd>Delete</kbd> keystroke on Windows to cut the selected content. Closes [#9326](https://github.com/ckeditor/ckeditor5/issues/9326). ([commit](https://github.com/ckeditor/ckeditor5/commit/5a1a835fc136b0e1667084d63da55a6ac6e7080f))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/5066d1e519c545977e7f1609cb44994fc4a5ef3c))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v31.0.0 => v31.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v31.0.0 => v31.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v31.0.0 => v31.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v31.0.0 => v31.1.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v31.0.0 => v31.1.0
</details>


## [31.0.0](https://github.com/ckeditor/ckeditor5/compare/v30.0.0...v31.0.0) (2021-10-25)

### Release highlights

We are happy to announce the release of CKEditor 5 v31.0.0.

This release introduces the following new features:

* [Introduce the `Command#affectsData` property](https://github.com/ckeditor/ckeditor5/issues/10676) to indicate whether a given command should stay enabled in editor modes with restricted write permissions. This solves the frequently reported problems of the availability of some editor features, such as export to PDF or Word, select all or find, in such editor modes as read-only, comments-only or restricted editing.
* The mentions feature has gained the [ability to customize the max number of items in the list after typing the trigger character](https://github.com/ckeditor/ckeditor5/issues/10479).
* New [collaboration features samples](https://github.com/ckeditor/ckeditor5-collaboration-samples/) are available:
  * For the React integration that will implement the context feature, as well as the watchdog.
  * For comments outside the editor with offline comments.
* The [comment](https://github.com/ckeditor/ckeditor5/issues/10594) and [export to Word](https://github.com/ckeditor/ckeditor5/issues/10598) feature icons were improved.
* [Three <kbd>Enter</kbd> clicks at the end of a code block](https://github.com/ckeditor/ckeditor5/issues/6682) are now necessary to escape it.

There were also a few bug fixes:

* The [link](https://github.com/ckeditor/ckeditor5/issues/8814), mention, [inline image](https://github.com/ckeditor/ckeditor5/issues/9605), and comment marker cannot be selected by mouse drag if the link is at the edge of a block.
* A table balloon is no longer rendered in the [wrong place after unlinking text in table](https://github.com/ckeditor/ckeditor5/issues/6408).
* A nested widget selection handle is no longer [visible while the outer table cells are selected](https://github.com/ckeditor/ckeditor5/issues/9491).
* The HTML embed UI does now [correctly reflects the read-only state](https://github.com/ckeditor/ckeditor5/issues/10182).

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v31.0.0-with-enhanced-restricted-modes-handling-and-new-collaboration-samples/

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The `InsertHtmlEmbedCommand` and `UpdateHtmlEmbedCommand` have been replaced by `HtmlEmbedCommand` which is now responsible for both tasks. The command can be executed via `editor.execute( 'htmlEmbed' )`. See the API reference for more information.

### Features

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Introduced the `Command#affectsData` flag to indicate whether a given command should stay enabled in editor modes with restricted write permissions (e.g. read-only mode). Closes [#10670](https://github.com/ckeditor/ckeditor5/issues/10670). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad66b93212c72135f8b784b8f92dbbe213608d47))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DataController#get()` is now decorated and fires a `get` event on the method call. See [#10505](https://github.com/ckeditor/ckeditor5/issues/10505). ([commit](https://github.com/ckeditor/ckeditor5/commit/971763cbcb3ef5942068ab20302ed2355194bdee))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Added the configuration option for customizing the maximum number of items in the list after typing the trigger character. Closes [#10479](https://github.com/ckeditor/ckeditor5/issues/10479). ([commit](https://github.com/ckeditor/ckeditor5/commit/7274202834cc89cae14193397d3d343a8d7d5b64))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Introduced the `RealTimeCollaborationClient#serverHistory` property. See the API reference for more information.

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Features that do not change the content, should work properly in editor modes with restricted write permissions (e.g. read-only mode). See [ckeditor/ckeditor5#10670](https://github.com/ckeditor/ckeditor5/issues/10670).
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The comment data was not updated on remote clients after the local client edited the comment.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: DOM selection updates in `Renderer` when the selection is made using the mouse was blocked. Random glitching in Chrome when the user starts selection in a link (or a marker) at the beginning of the block was limited. Closes [#10562](https://github.com/ckeditor/ckeditor5/issues/10562). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad11de7551a0c8fff10adeb2117fb5743b9881f2))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Makes order of markers in downcast data pipeline consistent. Thanks [@bendemboski](https://github.com/bendemboski)! Closes [#10650](https://github.com/ckeditor/ckeditor5/issues/10650). ([commit](https://github.com/ckeditor/ckeditor5/commit/5cd38c061e0d853149747735b9627f1f50fc492b))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed a bug in the selection post-fixer (when the selection is stuck in a limit element that cannot contain text). Closes [#10487](https://github.com/ckeditor/ckeditor5/issues/10487). ([commit](https://github.com/ckeditor/ckeditor5/commit/ee98090cd8d46fe58821677d5a0a9f38c776078f))
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Features that do not change the content should work properly in editor modes with restricted write permissions (e.g. read-only mode). See [ckeditor/ckeditor5#10670](https://github.com/ckeditor/ckeditor5/issues/10670).
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The `FindCommand` and `FindNextCommand` commands should work properly in editor modes with restricted write permissions (e.g. read-only mode). Closes [#10636](https://github.com/ckeditor/ckeditor5/issues/10636). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad66b93212c72135f8b784b8f92dbbe213608d47))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Do not replace find results removed by collaborators that landed in the `$graveyard` root. ([commit](https://github.com/ckeditor/ckeditor5/commit/a96e165b0ca6b39981400692ac5b0a86a28aef3e))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Embed buttons should reflect the read-only state of the editor and the HTML embed command. Closes [#10182](https://github.com/ckeditor/ckeditor5/issues/10182). ([commit](https://github.com/ckeditor/ckeditor5/commit/17aaadd2ee6de562e57e0336c347e32c27a29970))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Adds HTML support for all headings given in the configuration of the headings feature. Closes [#10539](https://github.com/ckeditor/ckeditor5/issues/10539). ([commit](https://github.com/ckeditor/ckeditor5/commit/64903114569cbc995c0fc57bdd2b13f402b1f978))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Th mention panel will now hide when the editor becomes read-only. Closes [#4645](https://github.com/ckeditor/ckeditor5/issues/4645). ([commit](https://github.com/ckeditor/ckeditor5/commit/96d423adbcd4e716b8666af41d02d3b7e79f2f17))
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: The feature should work properly in editor modes with restricted write permissions (e.g. read-only mode). Closes [#10634](https://github.com/ckeditor/ckeditor5/issues/10634). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad66b93212c72135f8b784b8f92dbbe213608d47))
* **[select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all)**: The `SelectAllCommand` command should work properly in editor modes with restricted write permissions (e.g. read-only mode). Closes [#10635](https://github.com/ckeditor/ckeditor5/issues/10635). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad66b93212c72135f8b784b8f92dbbe213608d47))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Calling `editor.getData()` while in the source editing mode should return the data from the source editor passed through the model. Closes [#10505](https://github.com/ckeditor/ckeditor5/issues/10505). ([commit](https://github.com/ckeditor/ckeditor5/commit/971763cbcb3ef5942068ab20302ed2355194bdee))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Improve source editing textarea field size and scrolling behaviour. Closes [#10422](https://github.com/ckeditor/ckeditor5/issues/10422). ([commit](https://github.com/ckeditor/ckeditor5/commit/3decb16dec6581a2c006576f46f7a30b4ab96535))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Safari browser uses monospace font for text in source editing mode. Closes [#10585](https://github.com/ckeditor/ckeditor5/issues/10585). ([commit](https://github.com/ckeditor/ckeditor5/commit/d30e516fb5a348f22be57375d7a8460d0f54fd07))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `SelectColumnCommand` and `SelectRowCommand` commands should work properly in editor modes with restricted write permissions (e.g. read-only mode). See [#10635](https://github.com/ckeditor/ckeditor5/issues/10635). ([commit](https://github.com/ckeditor/ckeditor5/commit/ad66b93212c72135f8b784b8f92dbbe213608d47))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Color dropdown buttons in the table properties form should not be misaligned in Safari. Closes [#10589](https://github.com/ckeditor/ckeditor5/issues/10589). ([commit](https://github.com/ckeditor/ckeditor5/commit/82dbfba48493573ab32829b64a36591d2965e357))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: A nested widget in a multi-cell table selection should not have the selection handle. Closes [#9491](https://github.com/ckeditor/ckeditor5/issues/9491). ([commit](https://github.com/ckeditor/ckeditor5/commit/80e520de904a0b7d7943f0c2d73244d9a608db68))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `ContextualBalloon` positioning should use the dynamic `editor.ui.viewportOffset` value instead of static `config.ui.viewportOffset`. Closes [#10597](https://github.com/ckeditor/ckeditor5/issues/10597). ([commit](https://github.com/ckeditor/ckeditor5/commit/6ab963cff6356adefef9f987bed7fe5edf4ac76d))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `InputTextView` class should update its `#isEmpty` property on every `#input` instead of `#change` to stay in sync. Closes [#10431](https://github.com/ckeditor/ckeditor5/issues/10431). ([commit](https://github.com/ckeditor/ckeditor5/commit/f5f65d3e93d136bfec3435678331b2c00cc74318))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Properly stringify objects containing circular references in the `CKEditorError` class. Closes [#4959](https://github.com/ckeditor/ckeditor5/issues/4959). ([commit](https://github.com/ckeditor/ckeditor5/commit/674114303fb7ad58ea8356e014db804e59e97d41)) Thanks to [@marcellofuschi](https://github.com/marcellofuschi).

### Other changes

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Makes three <kbd>Enter</kbd> clicks necessary at the end of a code block to escape it. Closes [#6682](https://github.com/ckeditor/ckeditor5/issues/6682). ([commit](https://github.com/ckeditor/ckeditor5/commit/ba7dedbd8ba21a9127a8451057232db72e41d964)) Thanks to [@marcellofuschi](https://github.com/marcellofuschi)!
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Allowed annotations not to belong to any UI (annotation will be hidden in such a case).
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Refined the comment icon for consistency with other icons in the project.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Implemented the [`DomConverter#setContentOf()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_domconverter-DomConverter.html#function-setContentOf) method to fill DOM elements with a filtered HTML source. ([commit](https://github.com/ckeditor/ckeditor5/commit/7bf8717f2f5b1a60ca53fbc5b62a9cbda13dc484))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Made properties of `XmlDataProcessor` and `HtmlDataProcessor` public to allow overriding e.g. the HTML writer. Closes [#10619](https://github.com/ckeditor/ckeditor5/issues/10619). ([commit](https://github.com/ckeditor/ckeditor5/commit/b097349f5063b4f9b4822419e2d5c6663dd48aa0))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced alternative rendering mode to `DomConverter`. ([commit](https://github.com/ckeditor/ckeditor5/commit/39d5cb676c89045fe80fa4a5425fac3d08280c72))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced flag for experimental rendering mode for the editing view. ([commit](https://github.com/ckeditor/ckeditor5/commit/13f788a4c20ecc46bd5ef6b4e37e5970f0573fd3))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Refined the Export to Word icon for better discoverability.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Optimized the editing pipeline output of the [`createObjectView()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_html-support_converters.html#function-createObjectView) view factory function. ([commit](https://github.com/ckeditor/ckeditor5/commit/7bf8717f2f5b1a60ca53fbc5b62a9cbda13dc484))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Enable experimental rendering in tests. ([commit](https://github.com/ckeditor/ckeditor5/commit/13f788a4c20ecc46bd5ef6b4e37e5970f0573fd3))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Optimized the editing pipeline output of the [`Media#getViewElement()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_media-embed_mediaregistry-Media.html#function-getViewElement) view factory method. ([commit](https://github.com/ckeditor/ckeditor5/commit/7bf8717f2f5b1a60ca53fbc5b62a9cbda13dc484))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/ee01cf567145f394bd7007196e832c15b408163d))
* Updated dependencies.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v30.0.0 => v31.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v30.0.0 => v31.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v30.0.0 => v31.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v30.0.0 => v31.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v30.0.0 => v31.0.0
</details>


## [30.0.0](https://github.com/ckeditor/ckeditor5/compare/v29.2.0...v30.0.0) (2021-09-27)

### Release highlights

We are happy to announce the release of CKEditor 5 v30.0.0.

This release introduces the following new features:

* [Allow reverting text transformations by pressing <kbd>Backspace</kbd>](https://github.com/ckeditor/ckeditor5/issues/10413).
* [Cut down the search time in the Find & replace feature](https://github.com/ckeditor/ckeditor5/issues/10302).

There were also a few bug fixes:

* Fixed [invalid cell property after pasting a table to the editor from Word](https://github.com/ckeditor/ckeditor5/issues/10383).
* [The table toolbar now respects the `viewportTopOffset` configuration](https://github.com/ckeditor/ckeditor5/issues/9892).
* Automatic text transformation: [the dates get no longer turn into fractions](https://github.com/ckeditor/ckeditor5/issues/9170).
* [The toolbar no longer loses focus](https://github.com/ckeditor/ckeditor5/issues/10420) after escaping from the find and replace dropdown.

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v30.0.0-with-better-handling-of-automated-actions-and-plugin-development-tool/

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* The `config.toolbar.viewportTopOffset` property was moved to `config.ui.viewportOffset` and it now accepts an object.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `Matcher` class is more strict in handling `Element`s provided to the `match()` and `matchAll()` methods. It will not accept other `Node`s now.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The public helper function `html-support/converters~disallowedAttributesConverter` has been removed due to a change in the approach to filtering disallowed elements and attributes.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The `centeredBalloonPositionForLongWidgets()` helper was removed from widget utils. Use `BalloonPanelView.defaultPositions.viewportStickyNorth` instead. See [#9892](https://github.com/ckeditor/ckeditor5/issues/9892).
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: `toWidgetEditable()` will now set highlight handling for the editable element. If you used this method in conversion in your custom plugin it may affect your element styling when there is a marker on that element (e.g. a comment or a suggestion).

### Features

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Allowed reverting the automatic [Markdown-like formatting](https://ckeditor.com/docs/ckeditor5/latest/features/autoformat.html) by pressing <kbd>Backspace</kbd>. See [#10413](https://github.com/ckeditor/ckeditor5/issues/10413). ([commit](https://github.com/ckeditor/ckeditor5/commit/b46ae90ceac64662784a5a450190bf549b482a79))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added the General HTML Support integration for the image feature. Closes [#9916](https://github.com/ckeditor/ckeditor5/issues/9916). ([commit](https://github.com/ckeditor/ckeditor5/commit/68796d986c4a7eb1c1581e29d05a25cd24f20ce0))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Allowed using backspace to undo automatic the image insertion transformations. Closes [#10413](https://github.com/ckeditor/ckeditor5/issues/10413). ([commit](https://github.com/ckeditor/ckeditor5/commit/66073dd93b7666a91feb491550e06a438d80e1ec))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced a new position type (`viewportStickyNorth`) in `BalloonPanelView.defaultPositions`. See [#9892](https://github.com/ckeditor/ckeditor5/issues/9892). ([commit](https://github.com/ckeditor/ckeditor5/commit/00c7cfd149a6f3637d1536e8be6dc6ed18bf1652))
* Introduced the `editor.ui.viewportOffset` property, which allows modifying the viewport's offset in runtime. This value is used by the editor e.g. to position its sticky toolbar and contextual balloons. Additionally, the `config.toolbar.viewportTopOffset` property was moved to `config.ui.viewportOffset` and it now accepts an object. Closes [#9672](https://github.com/ckeditor/ckeditor5/issues/9672). ([commit](https://github.com/ckeditor/ckeditor5/commit/f8297dfd04c40ac6638142cca0fc25ffd953288e))

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added system colors names from the CSS Color Module Level 3 so that pasting tables from MS Word works correctly. Closes [#10383](https://github.com/ckeditor/ckeditor5/issues/10383). ([commit](https://github.com/ckeditor/ckeditor5/commit/8961911324d1bae90175e4221cc0506e78da5796))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed the `Matcher` class handling global flag in the `RegExp`s patterns. Closes [#10282](https://github.com/ckeditor/ckeditor5/issues/10282). ([commit](https://github.com/ckeditor/ckeditor5/commit/3e9e357eeb950b955d3c739290bdd569d3d765d4))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The toolbar should not lose focus after escaping from the find and replace dropdown. Closes [#10420](https://github.com/ckeditor/ckeditor5/issues/10420). ([commit](https://github.com/ckeditor/ckeditor5/commit/a5e0392d24d98091b05d419515071622f51b093c))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Improved the performance of the find feature by reducing the number of `model.change()` calls. Closes [#10302](https://github.com/ckeditor/ckeditor5/issues/10302). ([commit](https://github.com/ckeditor/ckeditor5/commit/8d425ed35cea7a1dcfb1792a7a3822b1e1dec875))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Attributes from a marker conversion descriptor will now be correctly added on view elements during marker downcast. Closes [#10425](https://github.com/ckeditor/ckeditor5/issues/10425). ([commit](https://github.com/ckeditor/ckeditor5/commit/7951f7994263bf73d47a5796a610fe82f05d9abe))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed widget highlight in the revision comparison in some cases with nested edits added by different users.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Made reordering table rows and columns possible without breaking the view in tables with heading rows or heading columns. Closes [#10463](https://github.com/ckeditor/ckeditor5/issues/10463). ([commit](https://github.com/ckeditor/ckeditor5/commit/12a24f853286f6e44cead98b2bee6703ad6013a9))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Cancelling the table cell properties UI no longer results with a warning in the console. Closes [#6266](https://github.com/ckeditor/ckeditor5/issues/6266). ([commit](https://github.com/ckeditor/ckeditor5/commit/a312aaaff2b3feaef3ed0ba8bcad8ec3d0fa9b25))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed handling of a non-collapsed selection inside a table cell. Closes [#10391](https://github.com/ckeditor/ckeditor5/issues/10391). ([commit](https://github.com/ckeditor/ckeditor5/commit/487d5444e72718725dbbf64b14af42dbd6b996a9))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed crash happening in some scenarios in track changes mode after an image element split a non-paragraph element.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed missing data-suggestion attributes on table cells and image captions.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Restricted mathematical text transformation, so that it requires no alphanumeric character before and after the fraction. Closes [#9170](https://github.com/ckeditor/ckeditor5/issues/9170). ([commit](https://github.com/ckeditor/ckeditor5/commit/e228a7e1ff024295ba090db553de2f3561845814))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The editor no longer crashes when a button has `withKeystroke` set to `true` but no `keystroke` property is provided. Closes [#9412](https://github.com/ckeditor/ckeditor5/issues/9412). ([commit](https://github.com/ckeditor/ckeditor5/commit/3e4cb49701928cec988cd40ba33747ee912747fd))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Fixed arrow keys navigation when there is an inline widget at the edge of a table cell. Closes [#9380](https://github.com/ckeditor/ckeditor5/issues/9380). ([commit](https://github.com/ckeditor/ckeditor5/commit/487d5444e72718725dbbf64b14af42dbd6b996a9))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `MarkerCollection#has()` method now also accepts an instance of a marker. Closes [#9985](https://github.com/ckeditor/ckeditor5/issues/9985). ([commit](https://github.com/ckeditor/ckeditor5/commit/bf3699f4824ca797c7e3a847e921eb99db9f4ad7))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Upcast images with or without the empty `src` attribute. Closes [#9238](https://github.com/ckeditor/ckeditor5/issues/9238). ([commit](https://github.com/ckeditor/ckeditor5/commit/50e457758592b8d10c737783762573f1290a9536))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Prevent leaving an unconsumed `figure` element after conversion. ([commit](https://github.com/ckeditor/ckeditor5/commit/68796d986c4a7eb1c1581e29d05a25cd24f20ce0))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Upcast linked images with or without the empty `src` attribute. See [#9238](https://github.com/ckeditor/ckeditor5/issues/9238). ([commit](https://github.com/ckeditor/ckeditor5/commit/50e457758592b8d10c737783762573f1290a9536))
* **[media](https://www.npmjs.com/package/@ckeditor/ckeditor5-media)**: The `figure` element should not be consumed if the media embed is unknown. ([commit](https://github.com/ckeditor/ckeditor5/commit/50e457758592b8d10c737783762573f1290a9536))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Prevent leaving an unconsumed `figure` element after conversion. ([commit](https://github.com/ckeditor/ckeditor5/commit/68796d986c4a7eb1c1581e29d05a25cd24f20ce0))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: `toWidgetEditable()` will now set the default highlight handling for the editable element. ([commit](https://github.com/ckeditor/ckeditor5/commit/7951f7994263bf73d47a5796a610fe82f05d9abe))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: `setHighlightHandling()` received default parameters for the highlight add and remove functions which handle classes and attributes. ([commit](https://github.com/ckeditor/ckeditor5/commit/7951f7994263bf73d47a5796a610fe82f05d9abe))
* The viewport offsets will be taken into consideration when calculating the position of contextual balloons (such as the table toolbar). Closes [#9892](https://github.com/ckeditor/ckeditor5/issues/9892). ([commit](https://github.com/ckeditor/ckeditor5/commit/00c7cfd149a6f3637d1536e8be6dc6ed18bf1652))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/673672080d81ff5b8936021a4723784a59823576), [commit](https://github.com/ckeditor/ckeditor5/commit/fb58634b7fd138297f55ac5424e6a26d9cca3cda))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v29.2.0 => v30.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v29.2.0 => v30.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v29.2.0 => v30.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v29.2.0 => v30.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v29.2.0 => v30.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v29.2.0 => v30.0.0
</details>


## [29.2.0](https://github.com/ckeditor/ckeditor5/compare/v29.1.0...v29.2.0) (2021-08-30)

### Release highlights

We are happy to announce the release of CKEditor 5 v29.2.0.

This release introduces several new features:

* [Redesigned find and replace panel](https://github.com/ckeditor/ckeditor5/issues/10229) and [a few improvements to the feature itself]((https://github.com/ckeditor/ckeditor5/issues?q=is%3Aissue+milestone%3A%22iteration+46%22+-label%3Atype%3Adocs+-label%3Atype%3Atask+sort%3Aupdated-desc+label%3Apackage%3Afind-and-replace)).
* The possibility to create a localized editor when using [DLL builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html).
* Improved performance when [pasting large images](https://github.com/ckeditor/ckeditor5/issues/10287).

There were also a few bug fixes:

* Switching to source editing no longer [scrolls to the end of the content](https://github.com/ckeditor/ckeditor5/issues/10180).
* The highlight feature [can now be used while typing](https://github.com/ckeditor/ckeditor5/issues/2616).
* Pasted HTML comments [are filtered out](https://github.com/ckeditor/ckeditor5/issues/10213).

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v29.2.0-with-redesigned-find-and-replace-and-localized-dll-builds/

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The layout, styling, and view structure of the find and replace form have changed radically, which may affect integrations that either customized or extended this form (see [#10229](https://github.com/ckeditor/ckeditor5/issues/10229)).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The revision data now includes a new property: `authorsIds`. This property needs to be handled (saved and loaded) similarly to other revision properties. For revisions that are already saved in your database, set this value to an array with one string, equal to the `creatorId` value (e.g. `["user1"]`). Check the updated [revision history integration guide](https://ckeditor.com/docs/ckeditor5/latest/features/revision-history/revision-history-integration.html) to see an example.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The documentation for revision history adapter has been updated. Please check the `RevisionHistoryAdapter#addRevision()` and `updateRevision()` documentation to make sure that you correctly handle all the data passed to these methods.

### Features

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Added the "cog" icon to the core icon set (see [#10229](https://github.com/ckeditor/ckeditor5/issues/10229)). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc3160944d6d0c95469e982a47936d47aa1bbd64))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Made it possible to cycle find results by using <kbd>Enter</kbd> and <kbd>Shift</kbd>+<kbd>Enter</kbd> keystrokes. Closes [#10012](https://github.com/ckeditor/ckeditor5/issues/10012). ([commit](https://github.com/ckeditor/ckeditor5/commit/fe554b9a706e22cb91e19356ca461897af7e0e04))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added general HTML support integration for the media embed feature. Closes [#9918](https://github.com/ckeditor/ckeditor5/issues/9918). ([commit](https://github.com/ckeditor/ckeditor5/commit/ec4d39dc5daa10833d6690834f7aee4c0b734169))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Keyboard shortcuts to accept mentions can be customized using the [`config.mention.commitKeys`](https://ckeditor.com/docs/ckeditor5/latest/api/module_mention_mention-MentionConfig.html#member-commitKeys) configuration option. Closes [#4665](https://github.com/ckeditor/ckeditor5/issues/4665). ([commit](https://github.com/ckeditor/ckeditor5/commit/9fa1052f5fed9111d9534047a573e9c311dc9516))

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `Comment#setAttribute()` and `Comment#removeAttribute()` methods will now correctly set the attribute value and fire the adapter call also for comments created by other users.
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Changing the search text should reset the results. Closes [#10304](https://github.com/ckeditor/ckeditor5/issues/10304). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc3160944d6d0c95469e982a47936d47aa1bbd64))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Toggling search options should reset the results. Closes [#10021](https://github.com/ckeditor/ckeditor5/issues/10021). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc3160944d6d0c95469e982a47936d47aa1bbd64))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The find and replace form should be responsive. Closes [#10019](https://github.com/ckeditor/ckeditor5/issues/10019). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc3160944d6d0c95469e982a47936d47aa1bbd64))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The search term should be allowed to contain a trailing or leading space when searching "whole words only". Closes [#10131](https://github.com/ckeditor/ckeditor5/issues/10131). ([commit](https://github.com/ckeditor/ckeditor5/commit/fd9dfa7658e7ee3e968612274294baf224828326))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: All pasted HTML comments will now be filtered. Closes [#10213](https://github.com/ckeditor/ckeditor5/issues/10213). ([commit](https://github.com/ckeditor/ckeditor5/commit/59e23271a9ed32fb7bdc4eb51360b5e0f5d7b0ba))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Extended the schema definition for `$root` to allow storing a comment's content as the `$root` attribute. Closes [#10274](https://github.com/ckeditor/ckeditor5/issues/10274). ([commit](https://github.com/ckeditor/ckeditor5/commit/35b08a96f41423b1e1173af60c186fb0193c92cb))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Enabled multiple authors in one revision. Introduced the `authorsIds` property in the revision data.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Visual improvements to how nested changes are displayed.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: The selection is now set to the beginning of the source editing view. Closes [#10180](https://github.com/ckeditor/ckeditor5/issues/10180). ([commit](https://github.com/ckeditor/ckeditor5/commit/1e5b03d8a91038dfcf4a7afc7a47f11cb7a27041))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: The source editing feature will send a warning to the console when the restricted editing feature is loaded. Closes [#10228](https://github.com/ckeditor/ckeditor5/issues/10228). ([commit](https://github.com/ckeditor/ckeditor5/commit/42a31c423c1b770e7a25d3dbb546fc1327100779))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The label of the labeled field should stay at the top when the field is disabled and not empty to not cover the field's text (see [#10229](https://github.com/ckeditor/ckeditor5/issues/10229)). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc3160944d6d0c95469e982a47936d47aa1bbd64))

### Other changes

* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: The `ckeditor5` package offers translation files for several core CKEditor 5 packages: `utils`, `core`, `engine`, `ui`, `clipboard`, `enter`, `paragraph`, `select-all`, `typing`, `undo`, `upload`, and `widget`, used in the DLL builds. ([commit](https://github.com/ckeditor/ckeditor5/commit/40574471b7b4aeaeb73b8b945fb3b38557eef19a))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The `DataTransfer.files` property is not evaluated more than once. Closes [#10287](https://github.com/ckeditor/ckeditor5/issues/10287). ([commit](https://github.com/ckeditor/ckeditor5/commit/2bde3d069ead725d8fc2f6e7379da05523c29fde))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Raised comments character limit to 65000.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Merged a duplicated translation context from `ckeditor5-ui` and `ckeditor5-find-and-replace` packages. Closes [#10400](https://github.com/ckeditor/ckeditor5/issues/10400). ([commit](https://github.com/ckeditor/ckeditor5/commit/f931085112d9f8cdeb731543a01729058c7e3ce6))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Moved the search result translation context to `ckeditor5-core`. Closes [#10400](https://github.com/ckeditor/ckeditor5/issues/10400). ([commit](https://github.com/ckeditor/ckeditor5/commit/f931085112d9f8cdeb731543a01729058c7e3ce6))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Visually revamped the find and replace form. Closes [#10229](https://github.com/ckeditor/ckeditor5/issues/10229). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc3160944d6d0c95469e982a47936d47aa1bbd64))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Increased the contrast between selected and unselected find and replace results. Closes [#10242](https://github.com/ckeditor/ckeditor5/issues/10242). ([commit](https://github.com/ckeditor/ckeditor5/commit/f5a2c57aa7b2aeea5a01ad1e7c7bf0a9b9118078))
* **[highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight)**: Toggling highlight does not remove it when the caret is at the end of the highlighted range. Closes [#2616](https://github.com/ckeditor/ckeditor5/issues/2616). ([commit](https://github.com/ckeditor/ckeditor5/commit/d1a271d127777bb0f33f0e4e52222f0fbf21f6c2))
* **[language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language)**: The "Remove language" option of text part language dropdown is now the first one in the list. Closes [#10338](https://github.com/ckeditor/ckeditor5/issues/10338). ([commit](https://github.com/ckeditor/ckeditor5/commit/e6cd6e487d6ca528d19734ac27b447003063ca5c))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Some CSS styling improvements for suggestions and changes highlights.
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Moved the presentational find and replace form styles to the theme (see [#10229](https://github.com/ckeditor/ckeditor5/issues/10229)). ([commit](https://github.com/ckeditor/ckeditor5/commit/dc3160944d6d0c95469e982a47936d47aa1bbd64))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Moved the page label translation context to `ckeditor5-core`. Closes [#10400](https://github.com/ckeditor/ckeditor5/issues/10400). ([commit](https://github.com/ckeditor/ckeditor5/commit/f931085112d9f8cdeb731543a01729058c7e3ce6))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/d88cc7e93d4fbb0ad4f68943cff55d37532ec2cb), [commit](https://github.com/ckeditor/ckeditor5/commit/70bd66b567f19450717ed69ce999521e5c4aa26e))
* The content styles stylesheet for the guide will now be generated on-demand using the `{@exec...}` feature. Closes [#10299](https://github.com/ckeditor/ckeditor5/issues/10299). ([commit](https://github.com/ckeditor/ckeditor5/commit/18123a72726a2f9f052189b89ec58218603d26da))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v29.1.0 => v29.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v29.1.0 => v29.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v29.1.0 => v29.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v29.1.0 => v29.2.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v29.1.0 => v29.2.0
</details>


## [29.1.0](https://github.com/ckeditor/ckeditor5/compare/v29.0.0...v29.1.0) (2021-08-02)

### Release highlights

We are happy to announce the release of CKEditor 5 v29.1.0.

This release introduces several new features:

* The [content minimap](https://github.com/ckeditor/ckeditor5/issues/10079) feature which aids document navigation. [**Read more about the minimap**](https://ckeditor.com/blog/document-navigation-made-easy-previewing-the-content-minimap-in-ckeditor-5/).
* Support for [HTML comments](https://github.com/ckeditor/ckeditor5/issues/8822).
* Integration with the autosave feature in revision history.
* [Possibility to enforce tables to contain a header row by default](https://github.com/ckeditor/ckeditor5/issues/10039).
* Several improvements in the [find and replace](https://github.com/ckeditor/ckeditor5/issues/10024) feature.

There were also a few bug fixes:

* The code block added with autoformatting [will now remember the language](https://github.com/ckeditor/ckeditor5/issues/10005) of the previously inserted block.
* Problems with pasting lists from Word have been eliminated ([#9055](https://github.com/ckeditor/ckeditor5/issues/9055), [#9954](https://github.com/ckeditor/ckeditor5/issues/9954)).

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v29.1.0-with-content-minimap-html-comments-and-revision-history-autosave/.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The preview content will not be centered anymore.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Several conversion helpers have been renamed and removed from the public API:
  * `viewFigureToModel() -> upcastImageFigure()`,
  * `srcsetAttributeConverter() -> downcastSrcsetAttribute()`,
  * `modelToViewAttributeConverter() -> downcastImageAttribute()`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: `RevisionTracker#saveRevision()` was renamed to `RevisionTracker#updateRevision()`. This is to better reflect what the method actually does. Since revision locking was introduced, `saveRevision( { name: ... } )` calls should be replaced with `updateRevision( { name: ..., isLocked: true } )` calls.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The `Revision#name` property is now read-only. You need to use `Revision#setName()` instead.

### Features

* **[autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave)**: Introduced the `Autosave#save()` function. Closes [#10215](https://github.com/ckeditor/ckeditor5/issues/10215). ([commit](https://github.com/ckeditor/ckeditor5/commit/7be280fbe0514ef9000ad13619bf43a17ce92302))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the new (`skipComments`) option in `DomConverter#domToView()` (`false` by default) to make it possible to decide whether HTML comments should be removed from the data. ([commit](https://github.com/ckeditor/ckeditor5/commit/023b4eacf29a57e653e1171c15019ae0b8b33f8b))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Introduced the HTML comment plugin. Closes [#8822](https://github.com/ckeditor/ckeditor5/issues/8822). ([commit](https://github.com/ckeditor/ckeditor5/commit/023b4eacf29a57e653e1171c15019ae0b8b33f8b))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added support for elements that can act both as a paragraph and a sectioning element depending on the content context. Closes [#10085](https://github.com/ckeditor/ckeditor5/issues/10085). ([commit](https://github.com/ckeditor/ckeditor5/commit/30a93834720bb391b23d54b6aa73c5babd5a89c7))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added General HTML Support integration for the table feature. Closes [#9914](https://github.com/ckeditor/ckeditor5/issues/9914). ([commit](https://github.com/ckeditor/ckeditor5/commit/95416915e3bea9053356c38f4c9eccd95868855f))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Implemented the `<picture>` element support in the image feature. Closes [#9833](https://github.com/ckeditor/ckeditor5/issues/9833). ([commit](https://github.com/ckeditor/ckeditor5/commit/9a265d1cbb7f5c9e9f0750da24d7afcfb56d3474))
* **[minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap)**: Basic implementation of the content minimap feature. Closes [#10079](https://github.com/ckeditor/ckeditor5/issues/10079). ([commit](https://github.com/ckeditor/ckeditor5/commit/7bb5b2e05e0ecc05f106ab5dd2d39420920b01aa))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Introduced the possibility to update a revision after it was created. Provided a way to integrate revision history with the autosave plugin. See the [revision history](https://ckeditor.com/docs/ckeditor5/latest/features/revision-history/revision-history.html) guide.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Introduced the `Revision#setName()` function. `Revision#name` is now read-only.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Introduced several properties: `Revision#isLocked`, `Revision#lock()` and `RevisionTracker#isLocked`.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced an editor configuration option allowing to set default headings for newly created tables. Closes [#10039](https://github.com/ckeditor/ckeditor5/issues/10039). ([commit](https://github.com/ckeditor/ckeditor5/commit/f2a838a80f821f40a9e24160f8e4e8a2d1ca096e))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Enabled export to Word in track changes mode.

### Bug fixes

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Autoformat will apply the previous language choice for the code block feature. Closes [#10005](https://github.com/ckeditor/ckeditor5/issues/10005). ([commit](https://github.com/ckeditor/ckeditor5/commit/cc3dd760c2b8150de6e954ea89c7f713c135847a))
* **[autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave)**: Autosave callback should not be called while the editor is initialized. Closes [#10214](https://github.com/ckeditor/ckeditor5/issues/10214). ([commit](https://github.com/ckeditor/ckeditor5/commit/7be280fbe0514ef9000ad13619bf43a17ce92302))
* **[build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)**: The editing area in the sample should have a solid white background. Closes [#10095](https://github.com/ckeditor/ckeditor5/issues/10095). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d35544f3040bf0f022b014bd6d5bfb631c9739e))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: User initials for user names longer than two word will now be composed of the first letters of the first and last word of the name. This is better for names with a middle name or with a last name having a prefix.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: White spaces around inline object elements such as `<img>` or `<button>` should not be lost in the data. Closes [#10147](https://github.com/ckeditor/ckeditor5/issues/10147). ([commit](https://github.com/ckeditor/ckeditor5/commit/90c64dc98514e8b95a46639df7102b990ea8c22f))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Matcher should not match the style and class attributes with the object `attributes` pattern. Closes [#9813](https://github.com/ckeditor/ckeditor5/issues/9813). ([commit](https://github.com/ckeditor/ckeditor5/commit/287e04574d7b662d8d051cd12975e5ef871ff6df))
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Find and replace feature now works correctly with a multi-root editor. Closes [#10146](https://github.com/ckeditor/ckeditor5/issues/10146). ([commit](https://github.com/ckeditor/ckeditor5/commit/b7b31240ecd638cb97b9e6fa71e426fe255d1a5b))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Link decorators should use class and style properties instead of directly matching style and class HTML attributes. Closes [#9813](https://github.com/ckeditor/ckeditor5/issues/9813). ([commit](https://github.com/ckeditor/ckeditor5/commit/287e04574d7b662d8d051cd12975e5ef871ff6df))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fixed a crash when pasting lists from Word to the editor. Closes [#9055](https://github.com/ckeditor/ckeditor5/issues/9055), [#9954](https://github.com/ckeditor/ckeditor5/issues/9954). ([commit](https://github.com/ckeditor/ckeditor5/commit/2aec072956aef78ac7360e60f2be6db884e70d83))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The `Autosave` plugin now will be filtered by `RevisionHistory` plugin, so it will not be included in the revision history view editor instance as this caused errors.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Tables will be now correctly handled after a change in a table was undone.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed model mappings in a table cell if a paragraph is bound to its parent. ([commit](https://github.com/ckeditor/ckeditor5/commit/023b4eacf29a57e653e1171c15019ae0b8b33f8b))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed editor freezing when providing invalid `colspan` or `rowspan` attribute values. Closes [#10042](https://github.com/ckeditor/ckeditor5/issues/10042). ([commit](https://github.com/ckeditor/ckeditor5/commit/b03810496363212511768b698ec09e50c00698e8))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The `Autosave` plugin will no longer cause editor crashes when used together with the `TrackChangesData` plugin.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Remove references to and destroy resizers of widgets no longer in the document. Closes [#10156](https://github.com/ckeditor/ckeditor5/issues/10156). ([commit](https://github.com/ckeditor/ckeditor5/commit/f177ad1e1c2562d5ca93fb5aa6e24f3d10c3ae49))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The editor should not crash when a widget with a resizer is moved in the model document. Closes [#10266](https://github.com/ckeditor/ckeditor5/issues/10266). ([commit](https://github.com/ckeditor/ckeditor5/commit/01e830f140e212f81319a5b1ef10d3562d9f73aa))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `elementToMarker()` upcast helper is no longer marked as deprecated. ([commit](https://github.com/ckeditor/ckeditor5/commit/023b4eacf29a57e653e1171c15019ae0b8b33f8b))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Introduced the `config.exportWord.dataCallback` option to define a custom data provider for conversion. This brings support for multi-root editors.
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The preview content for the HTML embed plugin will not be centered. Closes [#9486](https://github.com/ckeditor/ckeditor5/issues/9486). ([commit](https://github.com/ckeditor/ckeditor5/commit/8bfb0c2cdecb09688b852b0f88f6401cfdc881b1))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: `RevisionTracker#saveRevision()` was renamed to `RevisionTracker#updateRevision()`.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Revision will be updated (or an autosave callback will be fired) when the revision history view is opened. This replaces the temporary "Unsaved changes" revision.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Restoring an unnamed revision will now create a revision with a name containing the restored revision's date.
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/49689be964b307c3cc896031283b717f972408ec))
* The `ckeditor5-metadata.json` file will be published on npm along with the package's code. Closes [ckeditor/ckeditor5#10004](https://github.com/ckeditor/ckeditor5/issues/10004). ([commit](https://github.com/ckeditor/ckeditor5/commit/bbaf0b43785ba221d14668368865de2e247886f9))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap): v29.1.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v29.0.0 => v29.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v29.0.0 => v29.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v29.0.0 => v29.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v29.0.0 => v29.1.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v29.0.0 => v29.1.0
</details>


## [29.0.0](https://github.com/ckeditor/ckeditor5/compare/v28.0.0...v29.0.0) (2021-07-05)

### Release highlights

We are happy to announce the release of CKEditor 5 v29.0.0.

This release introduces several new features:

* Support for [inline images](https://github.com/ckeditor/ckeditor5/issues/2052) in the image feature, allowing to insert multiple images in a single content block.
* The [find and replace](https://github.com/ckeditor/ckeditor5/issues/1430) feature.
* The [source editing](https://github.com/ckeditor/ckeditor5/issues/9647) feature for classic editor with the ability to directly edit the HTML or Markdown content.
* [Remembering the language when creating a new code block](https://github.com/ckeditor/ckeditor5/issues/8722).
* The experimental [General HTML Support](https://github.com/ckeditor/ckeditor5/issues/9970) feature that allows enabling HTML features that are not explicitly supported by any other dedicated CKEditor 5 plugins.

There were also a few bug fixes:

* The remove format feature will not [reset the image size anymore](https://github.com/ckeditor/ckeditor5/issues/9684)
* Nested marker highlight will not [break the mouse text selection](https://github.com/ckeditor/ckeditor5/issues/9513)

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v29.0.0-with-boosted-images-find-and-replace-and-the-source-editing-feature/.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)**: The official preconfigured [decoupled document build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document) now ships with the [`ImageResize`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imageresize-ImageResize.html) plugin enabled by default. Learn more about it in the [Migration to v.29.x guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-29.html).
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `Image` plugin works as a glue for both the `ImageBlock` and `ImageInline` features now (previously it only supported block images). If you do not want inline images to be allowed, consider replacing the `Image` plugin with `ImageBlock` in your editor configuration. Otherwise, all images without the `<figure>` wrapper will be loaded into the editor content as inline images, which in some cases may affect content semantics and styling. Check the updated [image installation guide](https://ckeditor.com/docs/ckeditor5/latest/features/images/images-installation.html) for more details about this change.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `ImageEditing` plugin is no longer standalone, as the majority of its logic was extracted to the `ImageBlockEditing` and `ImageInlineEditing` plugins. The logic remaining in the `ImageEditing` is common for both `ImageBlockEditing` and `ImageInlineEditing` plugins.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image caption is no longer displayed automatically when the user selects a block image. Instead, its presence is controlled using the `'toggleImageCaption'` toolbar button and a [`ToggleImageCaptionCommand`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagecaption_toggleimagecaptioncommand-ToggleImageCaptionCommand.html) for better integration with the [revamped image styles system](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-29.html#image-styles).
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The API of the image features has changed, please make sure to update your integrations.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The linked image indicator (icon) rendered as a `<span>` with the `.ck-link-image_icon` CSS class has been removed. To alter the look of the indicator (including the icon), please use the `figure.image > a::after` (for linked block images) and `a span.image-inline::after` (for linked inline images) CSS selectors instead.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The [`srcsetAttributeConverter()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_image_converters.html#function-srcsetAttributeConverter) and [`modelToViewAttributeConverter()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_image_converters.html#function-modelToViewAttributeConverter) conversion helpers now require the `imageType` parameter.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The in-cell pseudo-paragraph used for data tables is no longer styled using the inline `style` attribute but a `.ck-table-bogus-paragraph` CSS class instead.
* Several plugins are not loaded automatically as dependencies of other plugins anymore. From now on, they need to be provided by the editor creator manually (via the `config.plugins` configuration option). Learn more about it in the [Migration to v.29.0.0 guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-29.html). This list includes:
  - The [`CKFinder`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ckfinder_ckfinder-CKFinder.html) plugin is no longer automatically importing the [`Image`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_image-Image.html) plugin as a dependency.
  - The [`EasyImage`](https://ckeditor.com/docs/ckeditor5/latest/api/module_easy-image_easyimage-EasyImage.html) plugin is no longer automatically importing the [`Image`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_image-Image.html) plugin as a dependency.
* Several functions are no longer a part of the public API. This list includes:
  - `getSelectedImageWidget()`
  - `getViewImgFromWidget()`
  - `isImageAllowed()`
  - `isImage()`
  - `isImageWidget()`
  - `toImageWidget()`
  - `captionElementCreator()`
  - `isCaption()`
  - `checkSelectionOnObject()`
* Several functions or constants have been renamed. The list of changes includes:
  - The `getCaptionFromImage()` helper is now available as [`getCaptionFromImageModelElement()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagecaption_utils.html#function-getCaptionFromImageModelElement).
  - The `matchImageCaption()` helper is now available as [`matchImageCaptionViewElement()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagecaption_utils.html#function-matchImageCaptionViewElement).
  - The `defaultIcons` are now available as [`DEFAULT_ICONS`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagestyle_utils.html#constant-DEFAULT_ICONS).
  - The `defaultStyles` are now available as [`DEFAULT_OPTIONS`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagestyle_utils.html#constant-DEFAULT_OPTIONS).
  - The `findOptimalInsertionPosition()` helper is now `findOptimalInsertionRange()` and returns a [model range](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_range-Range.html). Also, instead of searching for a position next to the currently selected block, it will now attempt to replace that block (see [#9102](https://github.com/ckeditor/ckeditor5/issues/9102)).
  - The `isImageAllowed()` helper is now available as [`isLinkableElement()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_link_utils.html#function-isLinkableElement).
  - Some helpers from the image utilities module (`@ckeditor/ckeditor5-image/src/image/utils.js`) have been moved to the [`ImageUtils` plugin](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imageutils-ImageUtils.html). The helpers are still accessible via the `editor.plugins.get( 'ImageUtils' )` namespace, for instance, `editor.plugins.get( 'ImageUtils' ).insertImage( ... )`.
* The API of several functions or modules has been changed. Refer to the documentation to learn more. This list of changes includes:
  - common [image converters](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_image_converters.html),
  - various [image caption utils](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagecaption_utils.html),
  - the [`insertImage()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imageutils-ImageUtils.html#function-insertImage) helper,
  - the [`insertMedia()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_media-embed_utils.html#function-insertMedia) helper.
* The default user permissions have been changed. Now, by default, it is possible to remove other users' comment threads. This applies to non-real-time editing integrations and to real-time editing integrations using the writer role. This behavior can be changed using the `Permissions` plugin API (for non-real-time editing integrations) or by setting permissions for a given user in the user token (for integrations using CKEditor Cloud Services).

### Features

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: When inserting a new code block, instead of applying the default language (the first in the dropdown view), the feature now re-uses the language of the last inserted code block. Closes [#8722](https://github.com/ckeditor/ckeditor5/issues/8722). ([commit](https://github.com/ckeditor/ckeditor5/commit/a95554244e9fc71af5aa9e53c6841f114c6d2483))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Introduced the `Permissions` plugin. Now it is possible to manage the editor's level of access using permissions. See the [user roles and permissions](https://ckeditor.com/docs/cs/latest/guides/security/roles.html) guide.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the `CommentsRepository#isReadOnly()` method.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the `CommentThread#isRemovable` property which is related to current permissions. By default, comment threads can now be removed by any user.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Improved engine view matcher with new pattern syntax allowing to match attribute keys using regular expressions. Unified the pattern syntax between attributes, styles, and classes. Closes [#9872](https://github.com/ckeditor/ckeditor5/issues/9872). ([commit](https://github.com/ckeditor/ckeditor5/commit/22fad3daaa7386da6a451e0dc60f4facf191bcaa))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the special `expand` option to the `StylesMap.getStyleNames()` and view `Element.getStyleNames()` methods allowing to expand shorthand style properties. ([commit](https://github.com/ckeditor/ckeditor5/commit/22fad3daaa7386da6a451e0dc60f4facf191bcaa))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `batchType` option in `editor.data.set()` which can be used to preserve the undo/redo steps and to add an additional item to the undo stack. Note that it will still replace the whole content and should not be used with real-time collaboration. ([commit](https://github.com/ckeditor/ckeditor5/commit/2b9ef7e7355d4fb18303aa857a4d6dbff5ff075f))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Introduced the General HTML Support feature. Closes [#9970](https://github.com/ckeditor/ckeditor5/issues/9970). ([commit](https://github.com/ckeditor/ckeditor5/commit/a35db8593d099c609c7ce77450901016ea4aab38))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced support for inline images in the editor content. Available out–of–the–box in all ready–to–use editor builds, inline images can be uploaded, styled, resized, and linked and complement the already supported block images. See the [image feature overview guide](https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html) to see inline images in action. For more information about breaking changes, migration path, and tips, check out the [migration to v29.0.0](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-29.html) guide. ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: It should now be possible to define the dropdown menu as an object in the `config.image.toolbar` configuration. Closes [#9340](https://github.com/ckeditor/ckeditor5/issues/9340). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The feature functionality now covers both block and inline images. Closes [#8871](https://github.com/ckeditor/ckeditor5/issues/8871), [#9017](https://github.com/ckeditor/ckeditor5/issues/9017), [#9167](https://github.com/ckeditor/ckeditor5/issues/9167). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Enabled the Revision History feature in multi-root editors.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Introduced the Source editing feature for the predefined classic editor build. Closes [#9647](https://github.com/ckeditor/ckeditor5/issues/9647). ([commit](https://github.com/ckeditor/ckeditor5/commit/2b9ef7e7355d4fb18303aa857a4d6dbff5ff075f))

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**:  All toolbars shall be hidden when the widget is dragged and shown back when the drag ends. Closes [#9566](https://github.com/ckeditor/ckeditor5/issues/9566). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: The code block feature should not allow for inserting inline widgets as its content. Closes [#9567](https://github.com/ckeditor/ckeditor5/issues/9567). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed the downcast conversion of collapsed markers at the conversion range boundary. Closes [#8485](https://github.com/ckeditor/ckeditor5/issues/8485). ([commit](https://github.com/ckeditor/ckeditor5/commit/91d61dd0cfd85416883218039f8c2480b36711b7))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added missing HTML block element names to the `DomConverter.blockElements` array. Closes [#9801](https://github.com/ckeditor/ckeditor5/issues/9801), [#7863](https://github.com/ckeditor/ckeditor5/issues/7863). ([commit](https://github.com/ckeditor/ckeditor5/commit/67b4c7d1f3724ae94fc15d1647ff793815fe1d1e))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Markers should not be split in view on the caret position. Closes [#9513](https://github.com/ckeditor/ckeditor5/issues/9513). ([commit](https://github.com/ckeditor/ckeditor5/commit/be066b41aeb598588d281ffb6448f9df87477f61))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `FocusObserver` should not force the view to render in random moments. See [#9513](https://github.com/ckeditor/ckeditor5/issues/9513). ([commit](https://github.com/ckeditor/ckeditor5/commit/be066b41aeb598588d281ffb6448f9df87477f61))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Disallowed inline images in the `caption` elements. Closes [#9794](https://github.com/ckeditor/ckeditor5/issues/9794). ([commit](https://github.com/ckeditor/ckeditor5/commit/d4afc64b03b1ce23bd391fe299b8d9ad4315e3fc))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image should not resize to 100% if the resize command was overridden (canceled). ([commit](https://github.com/ckeditor/ckeditor5/commit/1beed0357a8dd4c8bc05f44eb7108aab44685e51))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The side-aligned images should always have some `max-width` property to not take up the whole editor width. Closes [#9342](https://github.com/ckeditor/ckeditor5/issues/9342). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The floating block images, except for the `side` images, should be displayed side by side by default. Closes [#9183](https://github.com/ckeditor/ckeditor5/issues/9183). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: An image should never overflow the widget boundaries while changing its size. Closes [#9166](https://github.com/ckeditor/ckeditor5/issues/9166). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The size label should be displayed above the image if it does not fit inside. See [#9166](https://github.com/ckeditor/ckeditor5/issues/9166). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: An image caption placeholder text should not wrap or overflow. Closes [#9162](https://github.com/ckeditor/ckeditor5/issues/9162). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link UI should be shown when clicking a linked inline widget. Closes [#9607](https://github.com/ckeditor/ckeditor5/issues/9607). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: The editor will not crash when a restricted area marker is removed. Closes [#9650](https://github.com/ckeditor/ckeditor5/issues/9650). ([commit](https://github.com/ckeditor/ckeditor5/commit/f358e6d6faa66dce48d576cbd5fa4dfd15758bdb))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The highlights for suggestions created in earlier revisions are now properly shown.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Revision history will no longer crash if the table plugin has not been added to the editor.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Selected inline widgets wrapped in an attribute in the view should create a fake selection. Closes [#9524](https://github.com/ckeditor/ckeditor5/issues/9524), [#9521](https://github.com/ckeditor/ckeditor5/issues/9521). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))

### Other changes

* **[build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)**: The editor document build now includes the `ImageResize` plugin. Closes [#9507](https://github.com/ckeditor/ckeditor5/issues/9507). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `Comment#isRemovable` property is now bound to `CommentThread#isRemovable`. `Comment#isRemovable` is set to `true` if the local user is the author, or if the comment thread is removable and the comment is the first comment in the thread.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Added several new icons for new image styles (see [#8909](https://github.com/ckeditor/ckeditor5/issues/8909)). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image)**: Removed the `Image` plugin dependency from the `EasyImage` plugin. Closes [#9399](https://github.com/ckeditor/ckeditor5/issues/9399). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed parsing leading HTML comments by `HtmlDataProcessor.toView()`. Closes [#9861](https://github.com/ckeditor/ckeditor5/issues/9861). ([commit](https://github.com/ckeditor/ckeditor5/commit/12dc7ba19490f155d494209f1987814d24f80048))
* **[horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line)**: New widgets will replace the selected block instead of being added next to it on insertion (see [#9102](https://github.com/ckeditor/ckeditor5/issues/9102)). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The default image style is now called `block`, instead of `full`. Its label now reads "Centered image" and it is represented by the appropriate icon in the image toolbar. See [#9545](https://github.com/ckeditor/ckeditor5/issues/9545). ([commit](https://github.com/ckeditor/ckeditor5/commit/b5908e519b653fcfbd0c2a331e78d14167d4a81f))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Turned the image utilities module into an editor plugin to allow sharing utilities outside the package. See [#8871](https://github.com/ckeditor/ckeditor5/issues/8871). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image toolbar should be visible if the selection is placed inside an image caption. Closes [#9136](https://github.com/ckeditor/ckeditor5/issues/9136). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image caption should be controlled using the toolbar button and a command for a better integration with image styles. Closes [#8907](https://github.com/ckeditor/ckeditor5/issues/8907). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Made collaboration features compatible with inline images.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added the `.ck-table-bogus-paragraph` CSS class to the in-cell pseudo-paragraph used for data tables for easier and safer styling. ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `class` property to the `SplitButtonView` UI component. Closes [#8909](https://github.com/ckeditor/ckeditor5/issues/8909). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Safeguarded the way the `Widget` plugin sets the fake selection. Closes [#9580](https://github.com/ckeditor/ckeditor5/issues/9580). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Replaced the `findOptimalInsertionPosition()` helper with `findOptimalInsertionRange()` that will now attempt to replace selected blocks when inserting new widgets. Closes [#9102](https://github.com/ckeditor/ckeditor5/issues/9102). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c228fb0549507f01d1f1ba4f9862817ac589279))
* Optimized icons. ([commit](https://github.com/ckeditor/ckeditor5/commit/4ce9cf22a439427f61d0f5cb319665823a2aecf0))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/196d308ade44197a7f3be68a7da897442ded55bc), [commit](https://github.com/ckeditor/ckeditor5/commit/225cfd3b12386f2df9328bc2391397adc19f286f))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing): v29.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v28.0.0 => v29.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v28.0.0 => v29.0.0

Other releases:

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v28.0.0 => v29.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v28.0.0 => v29.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v28.0.0 => v29.0.0
</details>


## [28.0.0](https://github.com/ckeditor/ckeditor5/compare/v27.1.0...v28.0.0) (2021-05-31)

### Release highlights

We are happy to announce the release of CKEditor 5 v28.0.0.

This release introduces several new features:

* The [Revision History](https://ckeditor.com/ckeditor-5/revision-history/) feature that allows the users to create, view and restore named content versions.
* The possibility to [add captions to tables](https://github.com/ckeditor/ckeditor5/issues/3204).
* The ability to specify [the default properties for tables and table cells](https://github.com/ckeditor/ckeditor5/issues/8502).
* The new `allowChildren` property for [the data schema item definition](https://github.com/ckeditor/ckeditor5/issues/9261).
* The export to PDF and export to Word features are now [enabled in the read-only mode](https://github.com/ckeditor/ckeditor5/issues/7567).
* The [plugin metadata](https://github.com/ckeditor/ckeditor5/issues/6642) and the [complete documentation of the HTML output of all editor features](https://github.com/ckeditor/ckeditor5/issues/9401).

There were also a few bug fixes:

* [Word can now properly open a file with nested tables exported from CKEditor 5](https://github.com/ckeditor/ckeditor5/issues/9474).
* [Pasting in the horizontal caret no longer replaces the widget](https://github.com/ckeditor/ckeditor5/issues/9477).
* [Correcting spelling in a list does not throw an error anymore](https://github.com/ckeditor/ckeditor5/issues/9325).
* [Toolbar navigation with the keyboard works in the right direction in a Right-to-Left text](https://github.com/ckeditor/ckeditor5/issues/5585).
* [The media embed feature now supports more URL schemes for Google Maps](https://github.com/ckeditor/ckeditor5/issues/2762).

Read more in the blog post: https://ckeditor.com/blog/revision-history-is-officially-live-ckeditor-5-v28.0.0-released/.

### MAJOR BREAKING CHANGES

**Note:** Check out the [Migration to CKEditor 5 v28.0.0](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-28.html) guide for more detailed information on how to upgrade to the current version.

* All the packages use multiple exports instead of one object in the `src/index.js` file. See the [list of affected packages](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-28.html#imports-from-index-files-of-non-dll-core-packages).

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Styles definitions for the `border:*` property produced by the styles processor will now be merged as a single `border:*` property if all its properties (width, style and color) for all edges (top, right, bottom, left) are the same.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `TablePropertiesView` and `TableCellPropertiesView` classes require an additional property in the object as the second constructor argument (`options.defaultTableProperties` for the table and `options.defaultTableCellProperties` for table cells).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `upcastBorderStyles()` conversion helper requires a third argument called `defaultBorder`. The object defines the default border (`width`, `color`, `style`) properties.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The following conversion helpers: `upcastStyleToAttribute()`, `downcastAttributeToStyle()`, `downcastTableAttribute()` accept two arguments now (the conversion and the options objects). Previous usage: `conversionHelper( conversion, /* ... */ )` should be replaced with `conversionHelper( conversion, { /* ... */ } )`.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Values for the `borderColor`, `borderStyle`, `borderWidth`, and `padding` model attributes are unified (to values produced by the editor itself) when upcasting the table or table cells if all sides (top, right, bottom and left) have the same values. Previously, the `<table style="border: 1px solid #ff0">` element was upcasted to `<table borderStyle="{"top":"solid","right":"solid","bottom":"solid","left":"solid"}" borderColor="{...}" borderWidth="{...}">`. Now the object will be replaced with the string value: `<table borderStyle="solid" borderColor="#ff0" borderWidth="1px">`. The same structure is created when using the editor's toolbar. If border values are not identical, the object notation will be inserted into the model (as it is now).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The following classes require the second argument called `defaultValue` which is the default value for the command:
  - `TableCellHorizontalAlignmentCommand`,
  - `TableCellVerticalAlignmentCommand`,
  - `TableCellBackgroundColorCommand`,
  - `TableCellBorderColorCommand`,
  - `TableCellBorderStyleCommand`,
  - `TableCellBorderWidthCommand`,
  - `TableCellHeightCommand`,
  - `TableCellPropertyCommand`,
  - `TableCellWidthCommand`,
  - `TableCellPaddingCommand`,
  - `TableAlignmentCommand`,
  - `TableBackgroundColorCommand`,
  - `TableBorderColorCommand`,
  - `TableBorderStyleCommand`,
  - `TableBorderWidthCommand`,
  - `TableHeightCommand`,
  - `TablePropertyCommand`,
  - `TableWidthCommand`.

### Features

* Introduced the [Revision History](https://ckeditor.com/blog/document-version-control-for-any-software-ckeditor-5-revision-history/) feature that allows the users to create, view and restore content versions.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `SchemaItemDefinition#allowChildren` property simplifying the defining of which other items are allowed inside this schema item definition. Closes [#9261](https://github.com/ckeditor/ckeditor5/issues/9261). ([commit](https://github.com/ckeditor/ckeditor5/commit/6a37ecc7b97095e82d165f16ced6843be8b6f565))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `'mouseover'` and `'mouseout'` events in the `MouseObserver` class. Closes [#9338](https://github.com/ckeditor/ckeditor5/issues/9338). ([commit](https://github.com/ckeditor/ckeditor5/commit/79454f872b26db6fafa56aa63dd5f4e5a4ec6477))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `StylesProcessor` reducer for the `border:*` CSS property was extended to be able to merge to the `border:*` property if all its properties (width, style and color) are specified. Otherwise, the `border-(width|style|color)` definition should be returned. Closes [#9490](https://github.com/ckeditor/ckeditor5/issues/9490). ([commit](https://github.com/ckeditor/ckeditor5/commit/5e1328b670badc9d0abb8a56882d4158294b1386))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for table captions. Closes [#3204](https://github.com/ckeditor/ckeditor5/issues/3204). ([commit](https://github.com/ckeditor/ckeditor5/commit/b5427212077469cf50fdd196611ec6b5767daa99))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for the default table cell properties. Read more about it [in the table feature guide](https://ckeditor.com/docs/ckeditor5/latest/features/table.html#default-table-and-table-cell-styles). ([commit](https://github.com/ckeditor/ckeditor5/commit/37f1699760695c58b2da0a30fee1579a7a38236d))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for the default table properties. Read more about it [in the table feature guide](https://ckeditor.com/docs/ckeditor5/latest/features/table.html#default-table-and-table-cell-styles). Closes [#8502](https://github.com/ckeditor/ckeditor5/issues/8502), [#9219](https://github.com/ckeditor/ckeditor5/issues/9219). ([commit](https://github.com/ckeditor/ckeditor5/commit/efe5e5744c83b910c06b8b763ae177b617a33eb2))

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed comments marker conversion that would fail if the comment marker is in a model document fragment.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added checks for the upcast attribute-to-marker converter before changing the data and consuming view elements. Part of [#9779](https://github.com/ckeditor/ckeditor5/issues/9779). ([commit](https://github.com/ckeditor/ckeditor5/commit/8f51495fa5090262588cfded3982c73b71aa4b8b))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Updated `downcastwriter` to allow setting up attribute element's priority to `0`. Closes [#5797](https://github.com/ckeditor/ckeditor5/issues/5797). ([commit](https://github.com/ckeditor/ckeditor5/commit/7422073bfef2460ca1fb4ec297b5c018f553d7aa))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `model.deleteContent()` method should not exclude a block widget at the end of the deletion range. ([commit](https://github.com/ckeditor/ckeditor5/commit/56a307accc861484d0dd4b26f293437a8aa3ee83))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The conversion upcast `elementToAttribute()` and `attributeToAttribute()` functions should not call the `model.value()` callback if the element will not be converted. Closes [#9536](https://github.com/ckeditor/ckeditor5/issues/9536). ([commit](https://github.com/ckeditor/ckeditor5/commit/efe5e5744c83b910c06b8b763ae177b617a33eb2))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The renderer should not crash when removing multiple DOM nodes in the same render cycle. Closes [#9534](https://github.com/ckeditor/ckeditor5/issues/9534). ([commit](https://github.com/ckeditor/ckeditor5/commit/75ebb48d970a1ec112084d0c8247ba04bb20d7c2)). Thanks to [bendemboski](https://github.com/bendemboski)!
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Allow rendering the `<script>` element inside the HTML preview. Closes [#8326](https://github.com/ckeditor/ckeditor5/issues/8326). ([commit](https://github.com/ckeditor/ckeditor5/commit/17cbd380cbbfd813f2d142dd7fca18e45eed5f1c))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: All text attributes starting their names with `link` will be removed when typing over a link or clicking at the end of the link. Closes [#8462](https://github.com/ckeditor/ckeditor5/issues/8462). ([commit](https://github.com/ckeditor/ckeditor5/commit/5a2fbb2e92e6d7cbeb9b1b4389a7b0969bd0c0b8))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Fixed a crash when applying a spell checker suggestion to a word inside a list item. Closes [#9325](https://github.com/ckeditor/ckeditor5/issues/9325). ([commit](https://github.com/ckeditor/ckeditor5/commit/7d3e0981df77a4422f4efdcefca0c587577fd0fa))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Added support for more Google Maps URL formats (`goo.gl/maps`, `maps.google.com`, `maps.app.goo.gl`). Closes [#2762](https://github.com/ckeditor/ckeditor5/issues/2762). ([commit](https://github.com/ckeditor/ckeditor5/commit/a5991c9017e1591bd0c165a02732b46967aea008))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a crash happening in some scenarios when a block quote deletion suggestion was accepted.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a crash with inline formatting suggestion in the content with a `<br>` tag.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)** Fixed arrow handling with the toolbar focused in case of RTL language UI. Closes [#5585](https://github.com/ckeditor/ckeditor5/issues/5585). ([commit](https://github.com/ckeditor/ckeditor5/commit/2d2e34f5176935ad3003c6d1ab3f274baa85d8d9))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Pasting plain text while the widget fake caret is active should not remove the widget. Closes [#9477](https://github.com/ckeditor/ckeditor5/issues/9477). ([commit](https://github.com/ckeditor/ckeditor5/commit/9978a9ab11f86ec46c2c04ba8d63c73bd35d4f07))
* All non-DLL packages will re-export their modules instead of exporting the default object with these modules as the object entries. Closes [#9134](https://github.com/ckeditor/ckeditor5/issues/9134). ([commit](https://github.com/ckeditor/ckeditor5/commit/e010f382d158a0bd594d84457ddc665f480e2c53))

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Improved performance for handling a huge number of annotations.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: In the marker-to-data conversion, attributes for marker boundaries will be used every time the marker starts or ends before or after the model element, instead of only where a text is not allowed by the model schema. Closes [#9622](https://github.com/ckeditor/ckeditor5/issues/9622). ([commit](https://github.com/ckeditor/ckeditor5/commit/36b685ce665431a7df31179e3b4e15f2fa4a81e4))
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: The `exportPdf` command will not be disabled if the editor goes into read-only mode as it does not impact the data.
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: The `exportWord` command will not be disabled if the editor goes into read-only mode as it does not impact the data.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Border definitions produced by the `TableProperties` and `TableCellProperties` features will be merged into a group if possible. Instead of producing the `border-(top|right|bottom|left):*` property, the `border:*` definition will be returned. The same applies to the table cell padding. See [#9490](https://github.com/ckeditor/ckeditor5/issues/9490). ([commit](https://github.com/ckeditor/ckeditor5/commit/5e1328b670badc9d0abb8a56882d4158294b1386))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/92a03a9ddf66b6b22507396d4bc91e2a0e1f52cc), [commit](https://github.com/ckeditor/ckeditor5/commit/ed70b6f1165e075888572231ad4a2fdad58c23a0))
* Added plugin metadata to packages. Introducing new guides for the metadata and the present HTML output of the features. Closes [#6642](https://github.com/ckeditor/ckeditor5/issues/6642). ([commit](https://github.com/ckeditor/ckeditor5/commit/cad8a725b0e3b730f08fcf8368ec57d6f94156d2))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v27.1.0 => v28.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v27.1.0 => v28.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v27.1.0 => v28.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v27.1.0 => v28.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v27.1.0 => v28.0.0
</details>


## [27.1.0](https://github.com/ckeditor/ckeditor5/compare/v27.0.0...v27.1.0) (2021-04-19)

### Release highlights

We are happy to announce the release of CKEditor 5 v27.1.0.

This release introduces some new features:

* Support for [nested tables](https://github.com/ckeditor/ckeditor5/issues/3232).
* Support for [nested block quotes](https://github.com/ckeditor/ckeditor5/issues/9210).
* Content with the [deprecated `align` attribute](https://github.com/ckeditor/ckeditor5/issues/9193) can now be loaded into the editor (but will be transformed to a modern format).

There were also a few bug fixes:

* The empty value in the configuration (`config.initialData`) will have [precedence over a non-empty DOM element when creating the editor](https://github.com/ckeditor/ckeditor5/issues/8974).
* [The watchdog feature does not import CKEditor 5 utilities](https://github.com/ckeditor/ckeditor5/issues/9315) to avoid code duplication in external framework integrations.
* [Dragging the entire table cell](https://github.com/ckeditor/ckeditor5/issues/9370) is no longer possible.
* [The selection will no longer get stuck in read-only mode](https://github.com/ckeditor/ckeditor5/issues/9372).
* [Attributes that have already been set are no longer overridden while setting attributes upon upcast conversion](https://github.com/ckeditor/ckeditor5/issues/8921), as this caused text styles to not be properly converted.

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v27.1.0-with-table-and-block-quote-nesting/.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the new `useFillerType()` method in the `DataProcessor` interface. Classes based on this interface should implement `useFillerType()` to avoid errors.
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: The asynchronous `SimpleUploadAdapter#upload()` method resolves to an object with normalized data including the `urls` object, which was only returned before. This may affect all integrations depending on the `SimpleUploadAdapter` uploading mechanism.

### Features

* **[alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment)**: Added support for the deprecated `align` attribute. Closes [#9193](https://github.com/ckeditor/ckeditor5/issues/9193). ([commit](https://github.com/ckeditor/ckeditor5/commit/3c69604b2ed6b0c17bec666d66d6742bd711bca7))
* **[block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote)**: Added support for nested block quotes. Check the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-27.html#migration-to-ckeditor-5-v2710) if you want to disable this behavior and disallow nesting quotes. Closes [#9210](https://github.com/ckeditor/ckeditor5/issues/9210). ([commit](https://github.com/ckeditor/ckeditor5/commit/18de0e24681351d5ddcf7bdb605f066775369dcc))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced new "markedNbsp" block filler mode in `DomConverter`, in which `<span data-cke-filler="true">&nbsp;</span>` is inserted, to prevent leaking extra space characters into the data. ([commit](https://github.com/ckeditor/ckeditor5/commit/5217b3063db01fdebd46ebb6309ccf4ff21f7e03))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced `useFillerType()` in `HtmlDataProcessor` and `XmlDataProcessor` to switch between using marked and regular `nbsp` block fillers. Closes [#9345](https://github.com/ckeditor/ckeditor5/issues/9345). ([commit](https://github.com/ckeditor/ckeditor5/commit/5217b3063db01fdebd46ebb6309ccf4ff21f7e03))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Enabled marker downcast for document fragments. Closes [#9460](https://github.com/ckeditor/ckeditor5/issues/9460). ([commit](https://github.com/ckeditor/ckeditor5/commit/5b99c75814efb1b0caadd0c765879c28f2671415))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced the `uploadComplete` event in `ImageUploadEditing` that allows customizing the image element (e.g. setting custom attributes) based on the data retrieved from the upload adapter. Closes [#5204](https://github.com/ckeditor/ckeditor5/issues/5204). ([commit](https://github.com/ckeditor/ckeditor5/commit/bf5b561425dd497a40b7ca6a074279823fb5a84e))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Introduced the `config.mediaEmbed.elementName` to allow setting semantic element name. Closes [#9373](https://github.com/ckeditor/ckeditor5/issues/9373). ([commit](https://github.com/ckeditor/ckeditor5/commit/aefc6a29b189cb5d9366d6344ee450b01130f3d1))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for nested tables. Check the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-27.html#migration-to-ckeditor-5-v2710) if you want to disable this behavior and disallow nesting tables. Closes [#3232](https://github.com/ckeditor/ckeditor5/issues/3232). ([commit](https://github.com/ckeditor/ckeditor5/commit/e0eca47a42dc3813e2a02ba811cc56675334051c))
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: The upload adapters' asynchronous `#upload()` method resolves to an object with additional properties along with the `urls` hash. See more in [#5204](https://github.com/ckeditor/ckeditor5/issues/5204). ([commit](https://github.com/ckeditor/ckeditor5/commit/bf5b561425dd497a40b7ca6a074279823fb5a84e))

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The selection was stuck and impossible to change in read-only mode. Closes [#9372](https://github.com/ckeditor/ckeditor5/issues/9372). ([commit](https://github.com/ckeditor/ckeditor5/commit/5735af2b6cd9fa8b41e9f09172c2440c1a4471af))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The nested editable element should not be dragged. Closes [#9370](https://github.com/ckeditor/ckeditor5/issues/9370). ([commit](https://github.com/ckeditor/ckeditor5/commit/5735af2b6cd9fa8b41e9f09172c2440c1a4471af))
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Markers created in or on code block element are now preserved after the document is loaded. Closes [#9402](https://github.com/ckeditor/ckeditor5/issues/9402). ([commit](https://github.com/ckeditor/ckeditor5/commit/2616f8b5240bc8966d0ec0cadcd4bf23ddd75431))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The `MultiCommand.execute()` method prevents calling undefined commands. ([commit](https://github.com/ckeditor/ckeditor5/commit/e142d6d6342000421088703449231bb0f0b468de))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: While setting attributes upon upcast conversion, do not override attributes that have already been set. The correct behavior is to keep the attributes applied by the deepest nodes in the view tree as, in most cases, the deepest node will have precedence (e.g. an inline style applied by the deepest node). Closes [#8921](https://github.com/ckeditor/ckeditor5/issues/8921). ([commit](https://github.com/ckeditor/ckeditor5/commit/9a819feb6a27f45f8eabf66a3fa357386ccfa5fe))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Accepting multiple "turn on/off list item" suggestions (created by multiple users) that should cause the same effect will have a correct result now.
* **[watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Removed imports from the `ckeditor5` package. Closes [#9315](https://github.com/ckeditor/ckeditor5/issues/9315). ([commit](https://github.com/ckeditor/ckeditor5/commit/c1fa757973bce0b150aefd22ddb5f16bc7e4814a))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Hide the selection handler in the nested widget if the outer widget is hovered or selected. Closes [#9453](https://github.com/ckeditor/ckeditor5/issues/9453), [#8964](https://github.com/ckeditor/ckeditor5/issues/8964). ([commit](https://github.com/ckeditor/ckeditor5/commit/fbfe726136b4c0fa298de33db3fcccd93d1bb161))
* The editor was not initialized with the empty data for `config.initialData` set to an empty string. Closes [#8974](https://github.com/ckeditor/ckeditor5/issues/8974). ([commit](https://github.com/ckeditor/ckeditor5/commit/bce8267e16fccb25448b4c68acc3bf54336aa087))

### Other changes

* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introduced the `config.forceValue` option to `ListCommand` that forces turning list items on or off instead of toggling. ([commit](https://github.com/ckeditor/ckeditor5/commit/e16448576cdc40ff76fe19058bea2954bf536411))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/4a663d79fe065b251b873b2ff5c67697dc214cf6))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The `Editor.create()` method will throw an error if the initial websocket connection cannot be established.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v27.0.0 => v27.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v27.0.0 => v27.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v27.0.0 => v27.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v27.0.0 => v27.1.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v27.0.0 => v27.1.0
</details>


## [27.0.0](https://github.com/ckeditor/ckeditor5/compare/v26.0.0...v27.0.0) (2021-03-22)

### Release highlights

We are happy to announce the release of CKEditor 5 v27.0.0 that contains security fixes for multiple packages: `ckeditor5-engine`, `ckeditor5-font`, `ckeditor5-image`, `ckeditor5-list`, `ckeditor5-markdown-gfm`, `ckeditor5-media-embed`, `ckeditor5-paste-from-office`, `ckeditor5-widget`. Even though this is a low impact issue and only affects the victim's browser with no risk of data leakage, an upgrade is highly recommended! You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-3rh3-wfr4-76mj) and [contact us](https://ckeditor.com/contact/) if you have more questions.

The CKEditor 5 team would like to thank Yeting Li for recognizing and reporting these vulnerabilities.

Starting from this version, collaboration features release notes will be included in the CKEditor 5 changelog. Changes for the previous releases are available on https://ckeditor.com/collaboration/changelog/.

This release introduces some new features:

* The new [text part language](https://ckeditor.com/docs/ckeditor5/latest/features/language.html) feature allows you to define the language for each passage of content written in multiple languages. This helps satisfy the WCAG Success Criterion 3.1.2 Language of Parts.
* Support for [drag and dropping of textual content and block objects](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/drag-drop.html) (like images and tables) within the editor.
* Support for [dropping HTML content from outside of the editor](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/drag-drop.html) into the editor.
* [Alignment can now be set using classes](https://github.com/ckeditor/ckeditor5/issues/8516).
* [Typing `[x]` will now insert a checked to-do list item](https://github.com/ckeditor/ckeditor5/issues/8877).
* Support for [bubbling of `view.Document` events](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/event-system.html#view-events-bubbling).

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v27.0.0-with-drag-and-drop-text-part-language-and-bubbling-events/.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

**Note:** Check out the [Migration to CKEditor 5 v27.0.0](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-27.html) guide for more detailed information on how to upgrade to this version.

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The `inputTransformation` event is no longer fired by the `Clipboard` plugin. Now the `ClipboardPipeline` plugin is responsible for firing this event (see [#9128](https://github.com/ckeditor/ckeditor5/issues/9128)).
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The `clipboardInput` and `inputTransformation` events should not be fired or stopped in the feature code. The `data.content` property should be assigned to override the default content instead. You can stop this event only if you want to completely disable pasting or dropping of some content. [Read more about the clipboard pipeline in the migration to v27.0.0 guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-27.html#clipboard-input-pipeline-integration). See [#9128](https://github.com/ckeditor/ckeditor5/issues/9128).
* Introduced bubbling of the `view.Document` events, similar to how bubbling works in the DOM. This allowed us to re-prioritize many listeners that previously had to rely on the `priority` property. However, it means that existing listeners that use priorities may now be executed at a wrong time. The listeners to such events should be reviewed in terms of when they should be executed (in what context/element/phase). [Read more about event bubbling in the migration to v27.0.0 guide](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-27.html#the-viewdocument-event-bubbling). See [#8640](https://github.com/ckeditor/ckeditor5/issues/8640).

### Features

* **[alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment)**: Introduced an option to use classes instead of inline styles. Closes [#8516](https://github.com/ckeditor/ckeditor5/issues/8516). ([commit](https://github.com/ckeditor/ckeditor5/commit/638543bd6d3f1e1c1ffc864e4d4007744fffc62c))
* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Typing `[x]` will insert a checked to-do list item. Closes [#8877](https://github.com/ckeditor/ckeditor5/issues/8877). ([commit](https://github.com/ckeditor/ckeditor5/commit/18be7dabaf62c763bd3272fc8467aec0ae94ac98))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Implemented basic support for content drag and drop. Closes [#9128](https://github.com/ckeditor/ckeditor5/issues/9128). ([commit](https://github.com/ckeditor/ckeditor5/commit/8461da5fd6d3e050b8fd15aecf4527a83d0899af))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The `contentInsertion` event is fired from `ClipboardPipeline` to enable customization of content insertion (see [#9128](https://github.com/ckeditor/ckeditor5/issues/9128)). ([commit](https://github.com/ckeditor/ckeditor5/commit/8461da5fd6d3e050b8fd15aecf4527a83d0899af))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Created the universal caption icon. Closes [#9196](https://github.com/ckeditor/ckeditor5/issues/9196). ([commit](https://github.com/ckeditor/ckeditor5/commit/6dce730c27db063c13c71d363458731cb57faac9))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced bubbling of the `view.Document` events, similar to how bubbling works in the DOM. Bubbling allows listening on a view event on a specific kind of element, hence simplifying code that needs to handle a specific event for only that element (e.g. `enter` in `blockquote` elements only). Read more in the [Event system deep-dive guide](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/event-system.html). Closes [#8640](https://github.com/ckeditor/ckeditor5/issues/8640). ([commit](https://github.com/ckeditor/ckeditor5/commit/5527283324ad8bef5231acde0e49f9fc78df9c90))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced `ArrowKeysObserver`. See [#8640](https://github.com/ckeditor/ckeditor5/issues/8640). ([commit](https://github.com/ckeditor/ckeditor5/commit/5527283324ad8bef5231acde0e49f9fc78df9c90))
* **[language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language)**: Added support for setting the text part language. Closes [#8989](https://github.com/ckeditor/ckeditor5/issues/8989).

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `DataController#toView()` should have a default value for the `options` parameter. Closes [#9293](https://github.com/ckeditor/ckeditor5/issues/9293). ([commit](https://github.com/ckeditor/ckeditor5/commit/f77a3d57bddb96ae3280736f974cfd0b148611cb))
* **[highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight)** The remove highlight button now also gets disabled along with the main highlight command. Closes [#9174](https://github.com/ckeditor/ckeditor5/issues/9174). ([commit](https://github.com/ckeditor/ckeditor5/commit/04acdfec9e7ee4b38daa1ef372e201f535d960fc))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `EmitterMixin#listenTo()` method is split into listener and emitter parts. The `ObservableMixin` decorated methods reverted to the original method while destroying an observable. ([commit](https://github.com/ckeditor/ckeditor5/commit/5527283324ad8bef5231acde0e49f9fc78df9c90))

### Other changes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The paste as plain text feature was extracted to the dedicated `PastePlainText` plugin (see [#9128](https://github.com/ckeditor/ckeditor5/issues/9128)). ([commit](https://github.com/ckeditor/ckeditor5/commit/8461da5fd6d3e050b8fd15aecf4527a83d0899af))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `mouseup` event is fired by the `MouseObserver` (see [#9128](https://github.com/ckeditor/ckeditor5/issues/9128)). ([commit](https://github.com/ckeditor/ckeditor5/commit/8461da5fd6d3e050b8fd15aecf4527a83d0899af))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `mouseup` event is no longer fired by the `MouseEventsObserver` from the `@ckeditor/ckeditor5-table` package (now handled by `MouseObserver`) (see [#9128](https://github.com/ckeditor/ckeditor5/issues/9128)). ([commit](https://github.com/ckeditor/ckeditor5/commit/8461da5fd6d3e050b8fd15aecf4527a83d0899af))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The `TwoStepCaretMovement` feature is now using bubbling events. Closes [#7437](https://github.com/ckeditor/ckeditor5/issues/7437). ([commit](https://github.com/ckeditor/ckeditor5/commit/5527283324ad8bef5231acde0e49f9fc78df9c90))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Added the `language.getLanguageDirection` helper function allowing to determine the text direction based on the language code. ([commit](https://github.com/ckeditor/ckeditor5/commit/9f1b10fc8efd61b4bf9f4234c8d8b84e705af9b6))
* Optimized icons. ([commit](https://github.com/ckeditor/ckeditor5/commit/358a653c18853f5bc4afba04da2ea3b883b5d1d6))
* Updated English translations for the text part language feature. ([commit](https://github.com/ckeditor/ckeditor5/commit/eaed55a23dccd44c2a37dac5d820940458170903))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language): v27.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v26.0.0 => v27.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v26.0.0 => v27.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v26.0.0 => v27.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v26.0.0 => v27.0.0
* [@ckeditor/letters](https://www.npmjs.com/package/@ckeditor/letters): v26.0.0 => v27.0.0
</details>


## [26.0.0](https://github.com/ckeditor/ckeditor5/compare/v25.0.0...v26.0.0) (2021-03-01)

### Release highlights

We are happy to announce the release of CKEditor 5 v26.0.0.

This release brings some new features:

* [It is now possible to add plugins to CKEditor 5 builds](https://github.com/ckeditor/ckeditor5/issues/8395). Read more in the [DLL builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html) guide.
* [The editor placeholder now behaves like a native input placeholder](https://github.com/ckeditor/ckeditor5/issues/8058).
* [It is now possible to style inline widgets (e.g. with bold)](https://github.com/ckeditor/ckeditor5/issues/1633).
* [The font feature now supports loading legacy `<font>` elements](https://github.com/ckeditor/ckeditor5/issues/8621).

There were also some important bug fixes and improvements:

* [Autoformat will no longer create a code block when typing in bulleted or numbered lists](https://github.com/ckeditor/ckeditor5/issues/8633).
* [Indent buttons order was reversed in all default build configurations](https://github.com/ckeditor/ckeditor5/issues/8884).
* [Copying a nested table pasted into the editor no longer crashes it](https://github.com/ckeditor/ckeditor5/issues/8917).
* [A period now sticks to the preceding word during word wrap](https://github.com/ckeditor/ckeditor5/issues/8852).
* [The <kbd>Ctrl</kbd> key is now translated to <kbd>Cmd</kbd> on macOS](https://github.com/ckeditor/ckeditor5/issues/5705) to avoid conflicts with some macOS keyboard shortcuts.

Read more in the blog post: https://ckeditor.com/blog/ckeditor-5-v26.0.0-with-extensible-builds-inline-widget-styling-and-annotations-guides/.

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

**Note:** Check out the [Migration to CKEditor 5 v26.0.0](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migration/migration-to-26.html) guide for more detailed information on how to upgrade to this version.

* Several plugins are not loaded automatically as dependencies of other plugins anymore. From now on, they need to be provided by the editor creator manually (via `config.plugins`). This list includes:
  - The `CloudServicesUploadAdapter` plugin no longer loads `CloudServices`. Make sure to add `CloudServices` to the editor plugins when using the `CloudServicesUploadAdapter` or `EasyImage` features.
  - The `EasyImage` plugin no longer loads `Image` and `ImageUpload`. Make sure to add `Image` and `ImageUpload` to the editor plugins when using the `EasyImage` feature.
  - The `CKFinder` plugin no longer loads `CKFinderUploadAdapter`. The `CKFinderEditing` plugin no longer loads `ImageEditing` and `LinkEditing` features. Make sure to add `CKFinderUploadAdapter`, `Image`, and `Link` features to the editor plugins when using the `CKFinder` feature.
  - The `Title` plugin no longer loads `Paragraph`. Make sure to add `Paragraph` to the editor plugins when using the `Title` feature.
  - The `ListEditing` plugin no longer loads `Paragraph`. Make sure to add `Paragraph` to the editor plugins when using the `List` feature.
  - The `LinkImageEditing` plugin no longer loads `ImageEditing`. Make sure to add `Image` to the editor plugins when using the `LinkImage` feature.
  - The `LinkImageUI` plugin no longer loads `Image`. Make sure to add `Image` to the editor plugins when using the `LinkImage` feature.
  - The `ExportPdf` plugin no longer loads `CloudServices`. Make sure to add `CloudServices` to the editor plugins when using the `ExportPdf` feature.
  - The `ExportWord` plugin no longer loads `CloudServices`. Make sure to add `CloudServices` to the editor plugins when using the `ExportWord` feature.
* **[cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core)**: The package was merged into `@ckeditor/ckeditor5-cloud-services`. All classes that were available in the `@ckeditor/ckeditor-cloud-services-core` package were moved to the `@ckeditor/ckeditor5-cloud-services` package. They should now be instantiated via factory methods on the `CloudServicesCore` plugin that is located in `@ckeditor/ckeditor5-cloud-services`. See [#8811](https://github.com/ckeditor/ckeditor5/issues/8811).
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The following modules were moved (before → after):
  - `image/image/imageinsertcommand~ImageInsertCommand` → `image/image/insertimagecommand~InsertImageCommand`
  - `image/imageresize/imageresizecommand~ImageResizeCommand` → `image/imageresize/resizeimagecommand~ResizeImageCommand`
  - `image/imageupload/imageuploadcommand~ImageUploadCommand` → `image/imageupload/uploadimagecommand~UploadImageCommand`

* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The to-do list item toggle keystroke changed to <kbd>Ctrl</kbd>+<kbd>Enter</kbd> (<kbd>Cmd</kbd>+<kbd>Enter</kbd> on Mac).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `list/todolistcheckedcommand~TodoListCheckCommand` module was moved to `list/checktodolistcommand~CheckTodoListCommand`.
* Keystrokes with the <kbd>Ctrl</kbd> modifier will not be handled on macOS unless the modifier is registered as a forced one (for example: `Ctrl!+A` will not be translated to `Cmd+A` on macOS).

### Features

* **[cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services)**: Created the `CloudServicesCore` plugin that provides the base API for communication with CKEditor Cloud Services. ([commit](https://github.com/ckeditor/ckeditor5/commit/959c1d6d56d43468f01afed6c27637a449f78515))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The `PluginCollection` class will allow requiring a plugin by name if it is provided in `config.plugins` or if it was already loaded. Closes [#2907](https://github.com/ckeditor/ckeditor5/issues/2907). ([commit](https://github.com/ckeditor/ckeditor5/commit/b278fde89d1eb635be7e4e3a57d8dba2bd0f98a6))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `ContainerElement` can be marked as `isAllowedInsideAttributeElement` in order to allow wrapping it with attribute elements. This is useful, for example, for inline widgets. Other element types (UI, Raw, Empty) have this flag on by default but it can be changed via `options.isAllowedInsideAttributeElement` to `false`. Read more in the `DowncastWriter#create*()` methods documentation. Closes [#1633](https://github.com/ckeditor/ckeditor5/issues/1633). ([commit](https://github.com/ckeditor/ckeditor5/commit/fcb166ea2bed00cb83eb1c226a6923a6de2e706e))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: Added support for the `<font>` element. Closes [#8621](https://github.com/ckeditor/ckeditor5/issues/8621). ([commit](https://github.com/ckeditor/ckeditor5/commit/0545fe6515f5454f7c7961ee2415c23366e2da08))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Added the forced modifier key (`Ctrl!`) for keystrokes that should not be mapped to <kbd>Cmd</kbd> on macOS. ([commit](https://github.com/ckeditor/ckeditor5/commit/8dac3a98bb93cc6e1d0bfa8d2db8a5d9a6f89988))

### Bug fixes

* **[build-*](https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor)**: Switched the order of indent buttons in the default build configuration to "outdent, indent". Closes [#8884](https://github.com/ckeditor/ckeditor5/issues/8884). ([commit](https://github.com/ckeditor/ckeditor5/commit/1e4217506c19fdceb6700b928d86cf464859c57c))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `DowncastWriter` should handle `UIElements` consistently while wrapping with and inserting them into attribute elements. Closes [#8959](https://github.com/ckeditor/ckeditor5/issues/8959). ([commit](https://github.com/ckeditor/ckeditor5/commit/fcb166ea2bed00cb83eb1c226a6923a6de2e706e))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Words should not break on link boundaries. Closes [#8852](https://github.com/ckeditor/ckeditor5/issues/8852). ([commit](https://github.com/ckeditor/ckeditor5/commit/b67732d66525a814a591c6b185acbfb3b54c3792))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Undoing the deletion of merged paragraphs should result in the original tree. Closes [#8976](https://github.com/ckeditor/ckeditor5/issues/8976). ([commit](https://github.com/ckeditor/ckeditor5/commit/ecba70b44a0185bf5193da7bd77907bd981da74d))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Pasting formatted single-line text over a widget should not split it into multiple paragraphs. Closes [#8953](https://github.com/ckeditor/ckeditor5/issues/8953). ([commit](https://github.com/ckeditor/ckeditor5/commit/dfe803553789de8b162b0dd7fbfac4c419a9b806))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The editor placeholder should not disappear until typing started. Closes [#8689](https://github.com/ckeditor/ckeditor5/issues/8689). ([commit](https://github.com/ckeditor/ckeditor5/commit/8a276bdb4f09a74b4e67a4bfe4ddc3409edf84ef))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed content is not restored on undo when multiple blocks and widgets were removed. Closes [#8870](https://github.com/ckeditor/ckeditor5/issues/8870). ([commit](https://github.com/ckeditor/ckeditor5/commit/385234a66ae0168bc57a36d7ec9f1e8f759e0b69))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: Fixed the `supportAllValues` configuration for the font size and font family features to work with nested elements (tables). Closes [#7965](https://github.com/ckeditor/ckeditor5/issues/7965). ([commit](https://github.com/ckeditor/ckeditor5/commit/768466c6e0e18b0f4c2230b1f66a2defb2496c50)). Thanks to [@dkrahn](https://github.com/dkrahn)!
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: In the `Title` plugin, the body placeholder is visible even when the body section is focused. See [#8689](https://github.com/ckeditor/ckeditor5/issues/8689). ([commit](https://github.com/ckeditor/ckeditor5/commit/8a276bdb4f09a74b4e67a4bfe4ddc3409edf84ef))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image caption placeholder is now hidden when focused. See [#8689](https://github.com/ckeditor/ckeditor5/issues/8689). ([commit](https://github.com/ckeditor/ckeditor5/commit/8a276bdb4f09a74b4e67a4bfe4ddc3409edf84ef))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `Autolink` plugin will no longer automatically match domains that only have a `www` subdomain followed with a top level domain, e.g. `http://www.test`. Closes [#8050](https://github.com/ckeditor/ckeditor5/issues/8050). ([commit](https://github.com/ckeditor/ckeditor5/commit/2165447015f688b864a29e50a543e2411ecc9e11))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: IP addresses should be converted into links by the autolink feature while typing. Closes [#8881](https://github.com/ckeditor/ckeditor5/issues/8881). ([commit](https://github.com/ckeditor/ckeditor5/commit/5b85b86160d991f24f5ff46700e1ea90703c40bd))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: The `insertMediaEmbed` command should be disabled if any non-media object is selected (see [#8798](https://github.com/ckeditor/ckeditor5/issues/8798)). ([commit](https://github.com/ckeditor/ckeditor5/commit/428917601db732c6dfab48380eda2d8bbbfc7e19))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `insertTable` command should be disabled if any object is selected. Closes [#8798](https://github.com/ckeditor/ckeditor5/issues/8798). ([commit](https://github.com/ckeditor/ckeditor5/commit/428917601db732c6dfab48380eda2d8bbbfc7e19))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The editor keystrokes are no longer conflicting on macOS. Closes [#5705](https://github.com/ckeditor/ckeditor5/issues/5705). ([commit](https://github.com/ckeditor/ckeditor5/commit/8dac3a98bb93cc6e1d0bfa8d2db8a5d9a6f89988))
* The editor will show the placeholder even when focused. See [#8689](https://github.com/ckeditor/ckeditor5/issues/8689). ([commit](https://github.com/ckeditor/ckeditor5/commit/8a276bdb4f09a74b4e67a4bfe4ddc3409edf84ef))

### Other changes

* Enabled creating builds that can be extended (with more plugins) without the need to recompile. This required splitting the project into the so-called DLL part and consumers of this DLL. Under the hood, the mechanism is based on [webpack DLLs](https://webpack.js.org/plugins/dll-plugin/). This is the first part of the required changes and it contains the necessary breaking changes (see the "MAJOR BREAKING CHANGES" section above). For more information, see the [DLL builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html) guide. Closes [[#8395](https://github.com/ckeditor/ckeditor5/issues/8395)](https://github.com/ckeditor/ckeditor5/issues/8395). ([commit](https://github.com/ckeditor/ckeditor5/commit/b278fde89d1eb635be7e4e3a57d8dba2bd0f98a6))
* **[cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core)**: All classes available in the `@ckeditor/ckeditor-cloud-services-core` package were moved to the `@ckeditor/ckeditor5-cloud-services` package. They should now be instantiated via factory methods on the `CloudServicesCore` plugin. Closes [#8811](https://github.com/ckeditor/ckeditor5/issues/8811). ([commit](https://github.com/ckeditor/ckeditor5/commit/959c1d6d56d43468f01afed6c27637a449f78515))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `KeyObserver` should provide information about `metaKey` being pressed. ([commit](https://github.com/ckeditor/ckeditor5/commit/8dac3a98bb93cc6e1d0bfa8d2db8a5d9a6f89988))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Add WebP format support to the inline pasting of images from source URLs. ([commit](https://github.com/ckeditor/ckeditor5/commit/48ad51d61e10473bab106c17d83b6e05188cd915))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced the `Image.isImageWidget()` utility method. ([commit](https://github.com/ckeditor/ckeditor5/commit/b278fde89d1eb635be7e4e3a57d8dba2bd0f98a6))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The to-do list item toggle keystroke changed to <kbd>Ctrl</kbd>+<kbd>Enter</kbd> (<kbd>Cmd</kbd>+<kbd>Enter</kbd> on Mac). ([commit](https://github.com/ckeditor/ckeditor5/commit/8dac3a98bb93cc6e1d0bfa8d2db8a5d9a6f89988))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The `checkSelectionOnObject` function should be exported by the `@ckeditor/ckeditor5-widget` package (as `@ckeditor/ckeditor5-widget/src/utils`) (see [#8798](https://github.com/ckeditor/ckeditor5/issues/8798)). ([commit](https://github.com/ckeditor/ckeditor5/commit/428917601db732c6dfab48380eda2d8bbbfc7e19))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/aa272552fa06e2320f8b7d3c4e0079b187260b36))
* Unified button and command naming conventions. Old names are available as aliases. Read more about these changes in the [Code style](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/contributing/code-style.html#buttons-commands-and-plugins) guide. Closes [#8033](https://github.com/ckeditor/ckeditor5/issues/8033). ([commit](https://github.com/ckeditor/ckeditor5/commit/e0fcb17d404352133609aa6875d62e056261677f))

  Changes in toolbar buttons (before → after):
  - `imageUpload` → `uploadImage`
  - `imageResize` → `resizeImage`
  - `imageInsert` → `insertImage`
  - `imageResize:*` → `resizeImage:*`

  Changes in command names:
  - `imageInsert` → `insertImage`
  - `imageUpload` → `uploadImage`
  - `imageResize` → `resizeImage`
  - `forwardDelete` → `deleteForward`
  - `todoListCheck` → `checkTodoList`

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v25.0.0 => v26.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v25.0.0 => v26.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v25.0.0 => v26.0.0

Other releases:

* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination): v25.0.0 => v26.0.0
</details>


## [25.0.0](https://github.com/ckeditor/ckeditor5/compare/v24.0.0...v25.0.0) (2021-01-25)

### Release highlights

We are happy to announce the release of CKEditor 5 v25.0.0 that contains a security fix for the [Markdown-GFM package](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm). Even though this is a low impact issue and only affects the victim’s browser with no risk of data leakage, an upgrade is highly recommended! You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-hgmg-hhc8-g5wr) and [contact us](https://ckeditor.com/contact/) if you have more questions.

This release brings a few improvements and bug fixes:

* UX improvements to editing around the block boundaries ([#8137](https://github.com/ckeditor/ckeditor5/issues/8137), [#7636](https://github.com/ckeditor/ckeditor5/issues/7636)).
* [Formatting large content will not freeze the editor](https://github.com/ckeditor/ckeditor5/issues/8188).
* [Uploading Base64 images will no longer cause a CSP violation](https://github.com/ckeditor/ckeditor5/issues/7957).
* [Unlinking an image will not crash the editor anymore](https://github.com/ckeditor/ckeditor5/issues/8401).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v25.0.0-with-flexible-annotations-improved-text-blocks-handling-and-performance-fixes/

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Configuration passed to `ToolbarView.fillFromConfig()` will be stripped off of any leading, trailing, and duplicated separators (`'|'` and `'-'`).

### Features

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: The horizontal line can be inserted by typing `---` in an empty block. Closes [#5720](https://github.com/ckeditor/ckeditor5/issues/5720). ([commit](https://github.com/ckeditor/ckeditor5/commit/740327ed564a83a14bf95e61f9267c6296544522))
* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Square brackets should convert the current line to a to-do list item. Closes [#7518](https://github.com/ckeditor/ckeditor5/issues/7518). ([commit](https://github.com/ckeditor/ckeditor5/commit/9b7e7c9b4d12da8f591bec438a6fb7ccd296bfd0))
* **[block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote)**: The block quote should be split on the <kbd>Backspace</kbd> key press at the beginning of the block quote. Closes [#7636](https://github.com/ckeditor/ckeditor5/issues/7636). ([commit](https://github.com/ckeditor/ckeditor5/commit/2d9954c6634ba07293da85b292a0601b7947ef2c))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The new `DataController#htmlProcessor` property is initialized with the instance of the `HtmlDataProcessor` class and assigned to the `DataController#processor` property by default. ([commit](https://github.com/ckeditor/ckeditor5/commit/2025f40e525a122761e64bd05c4f6c7b2df75516))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: An empty block element at the beginning of the limit element should be converted to a paragraph on the <kbd>Backspace</kbd> key press. Closes [#8137](https://github.com/ckeditor/ckeditor5/issues/8137). ([commit](https://github.com/ckeditor/ckeditor5/commit/2d9954c6634ba07293da85b292a0601b7947ef2c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Implemented additional [panel positions](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dropdown_dropdownview-DropdownView.html#static-member-defaultPanelPositions) for the `DropdownView` class to address edge cases when the panel is cut due to small screen size (see [#7700](https://github.com/ckeditor/ckeditor5/issues/7700), [#8669](https://github.com/ckeditor/ckeditor5/issues/8669)). ([commit](https://github.com/ckeditor/ckeditor5/commit/52ce85b00374da9ad0b90e99f0746540a6631f55))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Items baked into the editor bundles can now be removed from the toolbar by using `config.toolbar.removeItems`. Closes [#7945](https://github.com/ckeditor/ckeditor5/issues/7945). ([commit](https://github.com/ckeditor/ckeditor5/commit/1af9e7b8501f9d6e8db35c2f41cf8e4157aaee7c))

### Bug fixes

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Formatting will not be applied to `snake_case_scenarios` anymore. Closes [#2388](https://github.com/ckeditor/ckeditor5/issues/2388). ([commit](https://github.com/ckeditor/ckeditor5/commit/82d486d2cb6616c2e1d00b49ab993bbf24847749))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `setData()` helper in the dev-utils model should support the `batchType` option. Closes [#7947](https://github.com/ckeditor/ckeditor5/issues/7947). ([commit](https://github.com/ckeditor/ckeditor5/commit/6e40289d5db52f0b9be4b53474401b45b34423be))
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: The command should use the proper token if executed without providing a token in the command options.
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: The command should use the proper token if executed without providing a token in the command options.
* **[horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line)**: The horizontal line feature should require the `Widget` plugin. Closes [#8825](https://github.com/ckeditor/ckeditor5/issues/8825). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f26d2b7f96eb495ae904a02799a6072cd77b22e))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Pasting an HTML embed widget from the clipboard will not clear its content anymore. Closes [#8789](https://github.com/ckeditor/ckeditor5/issues/8789). ([commit](https://github.com/ckeditor/ckeditor5/commit/2025f40e525a122761e64bd05c4f6c7b2df75516))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The HTML embed plugin should require the `Widget` plugin. Closes [#8720](https://github.com/ckeditor/ckeditor5/issues/8720). ([commit](https://github.com/ckeditor/ckeditor5/commit/8ef02e7a1543e1191b63488ba58b0281bdb8b1ee))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The save button should close the source mode even if there are no changes. Closes [#8560](https://github.com/ckeditor/ckeditor5/issues/8560). ([commit](https://github.com/ckeditor/ckeditor5/commit/5e26d5372e3d3d417c81aa98d1313f9a68f2f7ce))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image plugins can be loaded in any order without causing an error. Closes [#8270](https://github.com/ckeditor/ckeditor5/issues/8270). ([commit](https://github.com/ckeditor/ckeditor5/commit/1c7397db168f032181d562153535cab2a3ac6c66))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Allow pasting an image with a data URL scheme as the value of the `src` attribute if strict CSP rules are defined. Closes [#7957](https://github.com/ckeditor/ckeditor5/issues/7957). ([commit](https://github.com/ckeditor/ckeditor5/commit/f7a3948d954bb9ef064505e666d112ed5a4240a6))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Fixed the image resizer for images with links. Closes [#8749](https://github.com/ckeditor/ckeditor5/issues/8749). ([commit](https://github.com/ckeditor/ckeditor5/commit/abd2c67f5779f82f057984771f5cd27b3fd95528))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: An empty image caption should be hidden if the editor is in read-only mode. Closes [#5168](https://github.com/ckeditor/ckeditor5/issues/5168). ([commit](https://github.com/ckeditor/ckeditor5/commit/cab40650f1e5649b518f0159ae97c4d7a470b55a))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Removing a link from an image should not throw an error when link decorators are also present. Closes [#8401](https://github.com/ckeditor/ckeditor5/issues/8401). ([commit](https://github.com/ckeditor/ckeditor5/commit/a26c6532e2090b47816961c8344b258d237f28d0))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `delete` event handler is now listening on a higher priority to avoid being intercepted by the block quote and widget handlers. Closes [#8706](https://github.com/ckeditor/ckeditor5/issues/8706). ([commit](https://github.com/ckeditor/ckeditor5/commit/2d9954c6634ba07293da85b292a0601b7947ef2c))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination plugin should be disabled and a warning should be displayed if its configuration is missing.
* **[page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break)**: Dropping an image on the page break widget should not crash the editor. Closes [#8788](https://github.com/ckeditor/ckeditor5/issues/8788). ([commit](https://github.com/ckeditor/ckeditor5/commit/c9654e983bf41583f2bf09c1932752d86409507b))
* **[page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break)**: The page break feature should require the `Widget` plugin. Closes [#8825](https://github.com/ckeditor/ckeditor5/issues/8825). ([commit](https://github.com/ckeditor/ckeditor5/commit/9f26d2b7f96eb495ae904a02799a6072cd77b22e))
* **[special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters)**: The special characters dropdown should always fit into the viewport. Closes [#7700](https://github.com/ckeditor/ckeditor5/issues/7700), [#8669](https://github.com/ckeditor/ckeditor5/issues/8669). ([commit](https://github.com/ckeditor/ckeditor5/commit/52ce85b00374da9ad0b90e99f0746540a6631f55))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The contents of nested tables are no longer going through upcasting. Closes [#8393](https://github.com/ckeditor/ckeditor5/issues/8393). ([commit](https://github.com/ckeditor/ckeditor5/commit/270a6c3023a5126af61e37cfb2795a9caca13c85))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table properties balloon should always follow the table when the alignment changes. Closes [#6223](https://github.com/ckeditor/ckeditor5/issues/6223). ([commit](https://github.com/ckeditor/ckeditor5/commit/0fa28f34cd877c84b94c55e424c19e6a26e35dff))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The HTML embed text in a disabled input in Safari on iOS should have the same color as in other browsers. Closes [#8320](https://github.com/ckeditor/ckeditor5/issues/8320). ([commit](https://github.com/ckeditor/ckeditor5/commit/521847caab1f8573e6b2e56e71c464e9cc392777))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The dropdown button should not have an inner shadow in active state. Closes [#8699](https://github.com/ckeditor/ckeditor5/issues/8699). ([commit](https://github.com/ckeditor/ckeditor5/commit/395d954619afaf20c6f9f2caf2059490c9c62452))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The "Show more items" toolbar button tooltip should not overflow the editor. Closes [#8655](https://github.com/ckeditor/ckeditor5/issues/8655). ([commit](https://github.com/ckeditor/ckeditor5/commit/6175a207162f0355e446ef5dc59f1d1a03d4a7d2))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `'-'` (new line) divider should not be rendered when grouping is enabled. Closes [#8582](https://github.com/ckeditor/ckeditor5/issues/8582). ([commit](https://github.com/ckeditor/ckeditor5/commit/c5e54ced16b81a2b1c0768515883ee17f02d32ac))
* **[word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count)**: The word count feature should consider a string with a special character as a single word. Closes [#8078](https://github.com/ckeditor/ckeditor5/issues/8078). ([commit](https://github.com/ckeditor/ckeditor5/commit/c2183287394cee2249da8210cee73a64be916aae))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Optimized the `Model#insertContent()` function to use as few operations as possible to reduce the time needed to handle pasting large content into the editor. Closes [#8054](https://github.com/ckeditor/ckeditor5/issues/8054), [#715](https://github.com/ckeditor/ckeditor5/issues/715). ([commit](https://github.com/ckeditor/ckeditor5/commit/d97206cc1e423043e1cbe012a1b8f6b2083cc092))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Improved performance of the `Differ#getChanges()` function. Closes [#8188](https://github.com/ckeditor/ckeditor5/issues/8188). ([commit](https://github.com/ckeditor/ckeditor5/commit/98644f6f78621e6160edf4d7afe73867a369dc2f))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: The timezone option should be passed to the Export to Word converter.
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: A placeholder should be displayed if the HTML snippet is not previewable or empty. Closes [#8435](https://github.com/ckeditor/ckeditor5/issues/8435). ([commit](https://github.com/ckeditor/ckeditor5/commit/a35881b12de63adf41529eb3c208fa26a2c170a7))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Improved how the fake selection marker for the link UI is created. Closes [#8092](https://github.com/ckeditor/ckeditor5/issues/8092). ([commit](https://github.com/ckeditor/ckeditor5/commit/be55f919d3076602947019205538e6d1db86a8aa))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: The conversion API reference is no longer passed down to the attribute properties. Closes [#8370](https://github.com/ckeditor/ckeditor5/issues/8370). ([commit](https://github.com/ckeditor/ckeditor5/commit/eb160780717e88e28c5efe27b83c6440dbbed979))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/068b10be37629fc819ef7e601691c0b597dfab51), [commit](https://github.com/ckeditor/ckeditor5/commit/c7d16b67fdb0a51f4e953aaa9e7a867b1d83fb2c))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v24.0.0 => v25.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v24.0.0 => v25.0.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v24.0.0 => v25.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v24.0.0 => v25.0.0
</details>


## [24.0.0](https://github.com/ckeditor/ckeditor5/compare/v23.1.0...v24.0.0) (2020-12-07)

### Release highlights

We are happy to announce the release of CKEditor 5 v24.0.0.

This release brings some new features:

* [Accessible, Material design like input labels](https://github.com/ckeditor/ckeditor5/issues/1098).
* The long-awaited [multiline toolbar](https://github.com/ckeditor/ckeditor5/issues/6146).
* [Inserting images by pasting the URL directly into the editor](https://github.com/ckeditor/ckeditor5/issues/8236).
* The [`editor.focus()` method](https://github.com/ckeditor/ckeditor5/issues/714).

There were also some important bug fixes:

* [Multiple issues with the lists and list styles](https://github.com/ckeditor/ckeditor5/issues?q=is%3Aissue+milestone%3A%22iteration+38%22+-label%3Atype%3Adocs+-label%3Atype%3Atask+sort%3Aupdated-desc+label%3Apackage%3Alist).
* [Follow-ups to the HMTL embed feature](https://github.com/ckeditor/ckeditor5/issues?q=is%3Aissue+milestone%3A%22iteration+38%22+-label%3Atype%3Adocs+-label%3Atype%3Atask+sort%3Aupdated-desc+label%3Apackage%3Ahtml-embed) introduced in the previous release.
* [Pasting plain text on link no longer breaks the link](https://github.com/ckeditor/ckeditor5/issues/8158).
* [Select All does select all now](https://github.com/ckeditor/ckeditor5/issues/7978) - including tables and block quotes.
* [The `supportAllValues` option in the font feature now works with nested elements](https://github.com/ckeditor/ckeditor5/issues/8233).

Please note that there are some **major breaking changes** in this release. Be sure to review them before upgrading.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v24.0.0-with-multiline-toolbar-and-accessible-input-labels/

### Collaboration features

The CKEditor 5 Collaboration features changelog can be found here: https://ckeditor.com/collaboration/changelog.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DocumentSelection#markers` collection will not include all markers by default. Use `DocumentSelection#observeMarkers()` to register that the given marker should be put in the `#markers` collection when the document selection is placed inside it.
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The look and behavior of the `LabeledFieldView` UI component (used for displaying fields across the project) have changed. This may require changes in your integration if it customizes the `.ck-labeled-field-view` selector (or its internals).

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The parameters of the image utility function `insertImage()` parameters have changed. The removed `writer` instance is no longer needed. Additionally, you can specify `insertPosition` as an optional parameter.

### Features

* **[build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)**: Added new features to the build configuration: [horizontal line](https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html), [page break](https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html), [remove formatting](https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html), and [special characters](https://ckeditor.com/docs/ckeditor5/latest/features/special-characters.html)). See [#6146](https://github.com/ckeditor/ckeditor5/issues/6146). ([commit](https://github.com/ckeditor/ckeditor5/commit/70157aec7c0ec62b63a51f6bb20764afad443637))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Introduced the `focus()` method in the base `Editor` class. Closes [#714](https://github.com/ckeditor/ckeditor5/issues/714). ([commit](https://github.com/ckeditor/ckeditor5/commit/dea805153299404a130dcc12aa855cba922a2e86))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `DataProcessor#registerRawContentMatcher()` API that marks content sections which contain arbitrary character data and should not be parsed during the conversion. See [#8323](https://github.com/ckeditor/ckeditor5/issues/8323). ([commit](https://github.com/ckeditor/ckeditor5/commit/b8538dea19326a04ed0ff4d8b0ab346f6be8fc08))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Support for inserting images by pasting an image URL directly into the editor. Closes [#8236](https://github.com/ckeditor/ckeditor5/issues/8236). ([commit](https://github.com/ckeditor/ckeditor5/commit/908a35ac381c852c466f6144ac25f21f0d5af877))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Support for preserving the list styles while pasting from Word. Closes [#8080](https://github.com/ckeditor/ckeditor5/issues/8080). ([commit](https://github.com/ckeditor/ckeditor5/commit/2c03820644f83b2fe247d27fc2c645a5d497b4fd))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Added two new tooltip positions (east and west) in the `TooltipView` class and the `Button` interface (see [#8340](https://github.com/ckeditor/ckeditor5/issues/8340)). ([commit](https://github.com/ckeditor/ckeditor5/commit/ff62e50b9ef3aee69748cb42c7cc1fe51c76dd1d))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Implemented a toolbar configuration that allows rendering toolbar items in multiple rows. Closes [#6146](https://github.com/ckeditor/ckeditor5/issues/6146). ([commit](https://github.com/ckeditor/ckeditor5/commit/70157aec7c0ec62b63a51f6bb20764afad443637))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Added styles for a new south-east position of the `TooltipView` (see [#8335](https://github.com/ckeditor/ckeditor5/issues/8335)). ([commit](https://github.com/ckeditor/ckeditor5/commit/1ac756a9829055f9508ae07932d5d12cd672851f))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added support for a new south-east position of the `TooltipView` (see [#8335](https://github.com/ckeditor/ckeditor5/issues/8335)). ([commit](https://github.com/ckeditor/ckeditor5/commit/1ac756a9829055f9508ae07932d5d12cd672851f))
* Made the input labels accessible across the editor UI. Closes [#1098](https://github.com/ckeditor/ckeditor5/issues/1098), [#8242](https://github.com/ckeditor/ckeditor5/issues/8242). ([commit](https://github.com/ckeditor/ckeditor5/commit/407a8a7b1d078644daf318e97e6792dce8d73063))

### Bug fixes

* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles)**: The code style should not be copied to a new line on pressing the <kbd>Enter</kbd> key. Closes [#8144](https://github.com/ckeditor/ckeditor5/issues/8144). ([commit](https://github.com/ckeditor/ckeditor5/commit/000aeb69672115cf7aaeaee23125e4ac0255966e))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Pasting plain text inside a link or a restricted editing editable region will no longer break them. Closes [#8158](https://github.com/ckeditor/ckeditor5/issues/8158). ([commit](https://github.com/ckeditor/ckeditor5/commit/8d376fd50be366a67f39423ee8603506a8aa530d))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `DomConverter` will not trim whitespaces in nodes that are siblings to inline raw content elements (e.g. MathML). Closes [#5870](https://github.com/ckeditor/ckeditor5/issues/5870). ([commit](https://github.com/ckeditor/ckeditor5/commit/b8538dea19326a04ed0ff4d8b0ab346f6be8fc08))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The select all command should include all selectable elements in the content. Closes [#7978](https://github.com/ckeditor/ckeditor5/issues/7978). ([commit](https://github.com/ckeditor/ckeditor5/commit/e9d7d17e78a3686a7e3442729f07367b35246e09))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The editor should not crash when selecting an image from bottom to top. Closes [#7892](https://github.com/ckeditor/ckeditor5/issues/7892). ([commit](https://github.com/ckeditor/ckeditor5/commit/5dd05b9304e030ff32c34209020b21113f7146dc))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: Fixed the [`fontSize.supportAllValues`](https://ckeditor.com/docs/ckeditor5/latest/api/module_font_fontsize-FontSizeConfig.html#member-supportAllValues) configuration for the [`FontSize`](https://ckeditor.com/docs/ckeditor5/latest/api/module_font_fontsize-FontSize.html) plugin to work with nested elements. Closes [#8233](https://github.com/ckeditor/ckeditor5/issues/8233). ([commit](https://github.com/ckeditor/ckeditor5/commit/180415ec0ab0acd3be47b5d63d048bb2d436c35c))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Tooltips in HTML embeds should not affect the editing root size or scrollbar. Closes [#8340](https://github.com/ckeditor/ckeditor5/issues/8340). ([commit](https://github.com/ckeditor/ckeditor5/commit/ff62e50b9ef3aee69748cb42c7cc1fe51c76dd1d))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: HTML embed editing UI should not be broken when the editor uses an RTL language. Closes [#8335](https://github.com/ckeditor/ckeditor5/issues/8335). ([commit](https://github.com/ckeditor/ckeditor5/commit/1ac756a9829055f9508ae07932d5d12cd672851f))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The editor will not crash after inserting broken HTML. Closes [#8323](https://github.com/ckeditor/ckeditor5/issues/8323). ([commit](https://github.com/ckeditor/ckeditor5/commit/b8538dea19326a04ed0ff4d8b0ab346f6be8fc08))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Fixed saving the widget content after it lost the selection. Closes [#8328](https://github.com/ckeditor/ckeditor5/issues/8328). ([commit](https://github.com/ckeditor/ckeditor5/commit/2151b577f64a65468413ce0b2a80a72b7b6f45d6))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The save button will now reflect the command state. Closes [#8357](https://github.com/ckeditor/ckeditor5/issues/8357). ([commit](https://github.com/ckeditor/ckeditor5/commit/b2805dd9c2bf3d0a6c51b8d266b0e76ade06c33b))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: The editing root should remain focused when saving changes in the HTML embed widget. Closes [#8318](https://github.com/ckeditor/ckeditor5/issues/8318). ([commit](https://github.com/ckeditor/ckeditor5/commit/2d8207a9dcecd3693f8204e92456874b2104e329))
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Floated images are now properly displayed around HTML embeds. Closes [#8332](https://github.com/ckeditor/ckeditor5/issues/8332). ([commit](https://github.com/ckeditor/ckeditor5/commit/985334c96066a30fd6adfca6aec86b6829bba7f8))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Do not attach the image resizer to images inside the HTML embed preview. Closes [#8433](https://github.com/ckeditor/ckeditor5/issues/8433). ([commit](https://github.com/ckeditor/ckeditor5/commit/f10ee939bd128d19b42b229ac4fc3fe19c7dcb2a))
* **[indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent)**: The block indent feature will now work with custom headings. Closes [#8177](https://github.com/ckeditor/ckeditor5/issues/8177). ([commit](https://github.com/ckeditor/ckeditor5/commit/23c64f5abc8e3f4ed76a1bc9266aee947f2694ad))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The editor should not crash when inserting a link after another link with the same URL. Closes [#8210](https://github.com/ckeditor/ckeditor5/issues/8210). ([commit](https://github.com/ckeditor/ckeditor5/commit/81b8dc6cefb6311cdcae6dc4b19971905e3768c6))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed the unlink command for a selection spreading over 3+ blocks. Closes [#8030](https://github.com/ckeditor/ckeditor5/issues/8030). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d86dadc4db52fde9a7e80c130f1fc67e49c73b2))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed a quick image flicker of the image resize frame when inserting an image. Closes [#8088](https://github.com/ckeditor/ckeditor5/issues/8088). ([commit](https://github.com/ckeditor/ckeditor5/commit/021227d3ccce8b3ed7114bbb22e99f67bd3fa66e))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: List styles will be inherited correctly when pasting a list into another list. Closes [#8160](https://github.com/ckeditor/ckeditor5/issues/8160). ([commit](https://github.com/ckeditor/ckeditor5/commit/5dd14a38a4c403e312681cc129deac78cf325629))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Improved the mechanism that detects nested lists when pasting from Word. In some scenarios, pasting nested lists could produce invalid results in the editor. Closes [#7805](https://github.com/ckeditor/ckeditor5/issues/7805). ([commit](https://github.com/ckeditor/ckeditor5/commit/be5b989419930b3a45349494d7a1874801bf1dd4))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The HTML embed editing UI should not be broken when the editor uses an RTL language (see [#8335](https://github.com/ckeditor/ckeditor5/issues/8335)). ([commit](https://github.com/ckeditor/ckeditor5/commit/1ac756a9829055f9508ae07932d5d12cd672851f))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: A toolbar with grouped items should wrap to keep items visible in the viewport. Closes [#5586](https://github.com/ckeditor/ckeditor5/issues/5586) . ([commit](https://github.com/ckeditor/ckeditor5/commit/65bc73d9ad08ed2ff4e6b3c6d2d7283c66ea6a58))
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: Fixed restoring selection on undo for some scenarios when some selection ranges are in the graveyard after restoring them. ([commit](https://github.com/ckeditor/ckeditor5/commit/772f45dd1c9ce62e81466e7494e7e04ee70c0e50))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Fixed a memory leak in `EventEmitterMixin`. See [#8480](https://github.com/ckeditor/ckeditor5/issues/8480). ([commit](https://github.com/ckeditor/ckeditor5/commit/6a7f3816c80c8c988ce0483530f1b114b36c895d))
* Fixed building documentation on Windows. Closes [#7212](https://github.com/ckeditor/ckeditor5/issues/7212). ([commit](https://github.com/ckeditor/ckeditor5/commit/c7f69dde00bf69816d07d19e175e9cddf3e34b5c))

### Other changes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `DocumentSelection#markers` collection will now be updated only for observed markers groups. See `DocumentSelection#observeMarkers()`. ([commit](https://github.com/ckeditor/ckeditor5/commit/814b363d58942534c453fd5bd4b111fefd4963c7))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: `WidgetResize#visibleResizer` and `WidgetResize#getResizerByViewElement()` are now public. See [#8088](https://github.com/ckeditor/ckeditor5/issues/8088). ([commit](https://github.com/ckeditor/ckeditor5/commit/021227d3ccce8b3ed7114bbb22e99f67bd3fa66e))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: `WidgetResize` will now automatically set `WidgetResize#visibleResizer` when calling `WidgetResize#attachTo()` if the corresponding resizer's element is focused during the call. See [#8088](https://github.com/ckeditor/ckeditor5/issues/8088). ([commit](https://github.com/ckeditor/ckeditor5/commit/021227d3ccce8b3ed7114bbb22e99f67bd3fa66e))
* Optimized icons. ([commit](https://github.com/ckeditor/ckeditor5/commit/69e96562ee5370422a9c706b7c895e6150675f9e))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/f8753b3e34a58ed02ef1a338ecc8b2675a9356fb), [commit](https://github.com/ckeditor/ckeditor5/commit/a1ce27961ab9b02c9aea578c0866a27652f2576e))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v23.1.0 => v24.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v23.1.0 => v24.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v23.1.0 => v24.0.0

Other releases:

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v23.1.0 => v24.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v23.1.0 => v24.0.0
</details>


## [23.1.0](https://github.com/ckeditor/ckeditor5/compare/v23.0.0...v23.1.0) (2020-10-29)

### Release highlights

We are happy to announce the release of CKEditor 5 v23.1.0.

This release introduces a new [HTML embed feature](https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html) and adds the list style feature to the document editor build.

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

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v23.1.0-with-raw-HTML-embedding-and-reconversion-API/

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
* An option to [automatically set the link protocol](https://github.com/ckeditor/ckeditor5/issues/4858).
* [Improved selection handling when working with links](https://github.com/ckeditor/ckeditor5/issues/1016).

New features were also accompanied by a set of bug fixes, to name a few:

* [Autoformatting will no longer change formatting when typing in an inline code](https://github.com/ckeditor/ckeditor5/issues/1239).
* The editor will no longer [crash if there is an HTML comment in the source data](https://github.com/ckeditor/ckeditor5/issues/5734).

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

This release is focused on [further improving the table selection plugin](https://github.com/ckeditor/ckeditor5/issues/6285) and includes the following enhancements:

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

This release brings a huge set of new features: [image resizing](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/image.html#resizing-images), [to-do lists](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/todo-lists.html), [support for RTL languages](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/ui-language.html), [simple upload adapter](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/images/image-upload/simple-upload-adapter.html), [support for pasting from Google Docs](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/paste-from-office/paste-from-google-docs.html), [mathematic formulas](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/mathtype.html), and [spelling and grammar checking](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/spell-checker.html). In addition to that, as always, it contains many improvements and bug fixes.

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
