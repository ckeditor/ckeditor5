Changelog
=========

## [41.0.0](https://github.com/ckeditor/ckeditor5/compare/v40.2.0...v41.0.0) (January 17, 2024)

We are happy to announce the release of CKEditor&nbsp;5 v41.0.0.

#### Improved list suggestions behavior

We continue to improve the way the editor displays the formatting suggestions.

This release includes integration of the list features with the new suggestions behavior. All list-related suggestions are now visible in the editor content.

<!-- TODO: GIF. -->

#### The dialog system

The dialogs finally come to the CKEditor&nbsp;5 UI!

Some users found using the [find and replace](https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html) feature through a dropdown inconvenient as it might have covered the content, including the searched text. We listened to these voices and the find and replace UI will now be using a dialog.

<!-- TODO: GIF. -->

If you liked the earlier user interface of this feature, you can still display it inside a dropdown by setting the [`config.findAndReplace.uiType`](https://ckeditor.com/docs/ckeditor5/latest/api/module_find-and-replace_findandreplaceconfig-FindAndReplaceConfig.html) configuration option.

We have also introduced a dialog in the [AI Assistant](https://ckeditor.com/docs/ckeditor5/latest/features/ai-assistant/ai-assistant-overview.html) feature. Displaying the AI Assistant inside a balloon came with many UX hiccups, especially when you selected large content. It works great now.

<!-- TODO: GIF or screenshot or nothing. -->

The dialogs are now a part of the [CKEditor&nbsp;5 UI library](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html#dialogs-and-modals) so you can use them, too! Read the documentation to learn how to display your custom features inside dialogs and modals.

#### Case change

No more *selecting*, *deleting*, *retyping with Caps Lock* for long legal preambles. The case change plugin enables users to easily change text cases, applying UPPERCASE, lowercase, and Title Case. This feature simplifies text formatting by allowing quick alterations with a single click or a keyboard shortcut.

<!-- TODO: GIF. -->

As a key component of [CKEditor&nbsp;5's Productivity Pack](https://ckeditor.com/productivity-pack/), this plugin complements and enhances the suite's editing capabilities, offering a practical tool for efficient text manipulation.

#### Improving CKEditor&nbsp;5 installation methods

We start the new year with improvements in the new installation methods project. This includes an upgrade to the latest TypeScript version, ensuring enhanced type safety.

A key part of this release is the resolution of ECMAScript Module (ESM) compliance issues. We updated all packages and their definitions to be fully ESM-compliant. This ensures smoother integration and compatibility across various development environments.

We have also renamed exports of several classes, interfaces, and helpers to eliminate naming conflicts in the code for the new bundle that will appear later this year.

Take a look at the RFC to see what is coming: [https://github.com/ckeditor/ckeditor5/issues/15502](https://github.com/ckeditor/ckeditor5/issues/15502).

#### Deprecation of lists v1

This release marks a significant change in the list feature. [As announced before](https://github.com/ckeditor/ckeditor5/issues/14767), we are phasing out the older implementation of the `List` plugin, originally designed for plain lists. We are directing the development efforts towards the more advanced list v2 feature (formerly named `DocumentList`). This change aims to eliminate confusion for integrators and optimize the number of list functionalities.

The `DocumentList` plugins, which represent the advanced lists v2 feature, will now be available under the standard name `List`. This change enables document lists across all integrations, with the new version ensuring no loss of features from the older one.

We renamed the previous `List` plugins to `LegacyList`, providing a fallback option for integrators after the update. We will keep the `LegacyList` available for a couple of releases to lower the migration impact.

The existing `DocumentList` plugins were replaced with aliases. Integrations using the older `DocumentList` will continue to function without any need for configuration changes for a couple of releases. Users will be notified via console warnings to consider updating their configurations.

Additionally, we completely removed the `ListStyle` plugin, which has been deprecated for a while. This change aligns with our goal to simplify the list features.

### Release highlights

Refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-41.html) to learn more about these changes.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: From this release on, the UI of the AI Assistant feature is displayed in a dialog instead of a balloon. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: From this release on, the UI of the find and replace feature is displayed by default in a dialog instead of a dropdown. To bring the previous user experience back, you can use the [`config.findAndReplace.uiType`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html#member-findAndReplace) configuration option. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `AdjacentListsSupport` plugin is moved from the `documentlist` directory to the `list` directory. See [#14942](https://github.com/ckeditor/ckeditor5/issues/14942).

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder)**: Rename export of the `UploadAdapter` class to `CKFinderUploadAdapter`. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The layout of the UI changed. Customizations based on certain CSS selectors may not work anymore because of a different DOM structure in the UI. [Learn more](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-41.html) about the scope of changes. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder)**: Moved the `browseFiles` icon to the `core` package and added it to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Moved the `browseFiles` icon to the `core` package and added it to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Moved the `codeBlock` icon to the `core` package and added it to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Bumped the TypeScript version to 5.0. See [#15452](https://github.com/ckeditor/ckeditor5/issues/15452).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Renamed export of the `View` class to `EditingView`. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Moved the `findOptimalInsertionRange` function to the `Schema` class as a new method. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The layout of the UI changed. Customizations based on certain CSS selectors may not work anymore because of a different DOM structure in the UI. [Learn more](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-41.html) about the scope of changes. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: Moved the `heading1`, `heading2`, `heading3`, `heading4`, `heading5`, and `heading6` icons to the `core` package and added them to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line)**: Moved the `horizontalLine` icon to the `core` package and added it to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Moved the `html` icon to the `core` package and added it to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent)**: Moved the `indent` and `outdent` icons to the `core` package and added them to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Added validation to the URL field to disallow empty URLs by default. See [#12501](https://github.com/ckeditor/ckeditor5/issues/12501).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: All old list plugins are now prefixed with `Legacy` (including directory names):  `List` -> `LegacyList`, `ListProperties` -> `LegacyListProperties`, `TodoList` -> `LegacyTodoList`, `ListEditing` -> `LegacyListEditing`, `ListUtils` -> `LegacyListUtils`, `ListPropertiesEditing` -> `LegacyListPropertiesEditing`, `TodoListEditing` -> `LegacyTodoListEditing`. See [#14942](https://github.com/ckeditor/ckeditor5/issues/14942).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The document list plugins are no longer prefixed with `Document` (including directory names): `DocumentList` -> `List`, `DocumentListProperties` -> `ListProperties`, `TodoDocumentList` -> `TodoList`, `DocumentListEditing` -> `ListEditing`, `DocumentListUtils` -> `ListUtils`, `DocumentListPropertiesEditing` -> `ListPropertiesEditing`, `DocumentListPropertiesUtils` -> `ListPropertiesUtils`, `TodoDocumentListEditing` -> `TodoListEditing`. See [#14942](https://github.com/ckeditor/ckeditor5/issues/14942).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `ListStyle` plugin was removed since it had been deprecated for a while. Use the `ListProperties` plugin instead. See [#14942](https://github.com/ckeditor/ckeditor5/issues/14942).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Moved the `bulletedList`, `numberedList`, and `todoList` icons to the `core` package and added them to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Moved the `table` icon to the `core` package and added it to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Moved the `colorPalette`, `previousArrow`, and `nextArrow` icons to the `core` package and added them to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `--ck-z-modal` CSS custom property was renamed to `--ck-z-panel`. We recommend updating custom CSS and integrations that use this custom property to avoid presentation issues. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The view collection (`focusables`) required by [`FocusCycler#constructor()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusCycler.html#function-constructor) must only contain views implementing the [`FocusableView`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusableView.html) interface. Failing to do so will result in a TypeScript error. If your custom code creates `FocusCycler` instances, make sure that all views passed in `focusables` implement the `focus()` method. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The font size of the `FormHeaderView` component was increased. This change affects the look of the [find and replace](https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html) and [table styling](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-styling.html) features as well as custom user interfaces that use this component. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The type of `AriaLiveAnnouncerPoliteness` changed (previously `enum`, now a constant `object`). See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `#next` and `#previous` properties of a [`FocusCycler`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusCycler.html) will now point to the same view if there is only one focusable view (previously `null`). This change may affect integrations that use this helper to manage advanced focus navigation in dynamic UIs. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: Moved the `undo` and `redo` icons to the `core` package and added them to the `icons` object exported from it. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Renamed the `Position` interface to `DomPoint`. See [#15511](https://github.com/ckeditor/ckeditor5/issues/15511).

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The UI of the feature was migrated to a dialog for a better user experience. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change)**: Introduced the case change feature.
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The UI of the feature was migrated to a dialog for a better user experience. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973). ([commit](https://github.com/ckeditor/ckeditor5/commit/f8e2b1c902776a848e1ddc208b5db108628f04da))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Integrated the list feature with the new attribute suggestions. Tracked changes in lists are now immediately visible in the editor.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Implemented the [`Dialog`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dialog_dialog-Dialog.html) plugin that allows for displaying dialog windows in the UI of the editor. [Learn more](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html#dialogs-and-modals) about using dialogs. Closes [#14973](https://github.com/ckeditor/ckeditor5/issues/14973). ([commit](https://github.com/ckeditor/ckeditor5/commit/f8e2b1c902776a848e1ddc208b5db108628f04da))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AWSTextAdapter` should be able to handle many data objects returned in one update (chunk).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AWSTextAdapter` should be able to handle data objects that were split between many updates (chunks).
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Replaced some toolbar icons with ones with improved alignment. Closes [#15549](https://github.com/ckeditor/ckeditor5/issues/15549). ([commit](https://github.com/ckeditor/ckeditor5/commit/ee2b91c945224b2db71f809a4e4149ecdfe750b6))
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Fixed the relative URL image editing. ([commit](https://github.com/ckeditor/ckeditor5/commit/84b012edee336907c995acd5772efb2c0a6b51cd))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Drag and drop into the document title element should not throw errors. Closes [#15306](https://github.com/ckeditor/ckeditor5/issues/15306). ([commit](https://github.com/ckeditor/ckeditor5/commit/db3dde69e85609cb9e679b580eabfa3737a7d76f))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Unlinked and resolved comment threads will now be correctly handled when added during the editor initialization.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Replaced some toolbar icons with ones with improved alignment. Closes [#15549](https://github.com/ckeditor/ckeditor5/issues/15549). ([commit](https://github.com/ckeditor/ckeditor5/commit/ee2b91c945224b2db71f809a4e4149ecdfe750b6))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The editor should not be stuck in an infinite post-fixing loop while modifying a list structure inside a GHS element. Closes [#15527](https://github.com/ckeditor/ckeditor5/issues/15527), [#15565](https://github.com/ckeditor/ckeditor5/issues/15565). ([commit](https://github.com/ckeditor/ckeditor5/commit/7d600e2c87ec9b1982359343da9188ed7eebd69f))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed the editor crash using the `LinkImage` plugin loaded before `Image`, which ends with extending the schema definitions before they registering them. Closes [#15617](https://github.com/ckeditor/ckeditor5/issues/15617). ([commit](https://github.com/ckeditor/ckeditor5/commit/6d9ec4202f077a5dea278351f642aa04182d7c2e))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Replaced some toolbar icons with ones with improved alignment. Closes [#15549](https://github.com/ckeditor/ckeditor5/issues/15549). ([commit](https://github.com/ckeditor/ckeditor5/commit/ee2b91c945224b2db71f809a4e4149ecdfe750b6))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The [`TextareaView`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_textarea_textareaview-TextareaView.html) component should correctly update its size if its value changs while it is invisible. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973). ([commit](https://github.com/ckeditor/ckeditor5/commit/f8e2b1c902776a848e1ddc208b5db108628f04da))
* Made all CKEditor&nbsp;5 packages valid ES Modules. See [#13673](https://github.com/ckeditor/ckeditor5/issues/13673).

### Other changes

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Image editing should work with the on-premises CKBox. Closes [#5834](https://github.com/ckeditor/ckeditor5/issues/5834). ([commit](https://github.com/ckeditor/ckeditor5/commit/ec2d7059d4e8d038f880715572748c650c96c1c6))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Bumped the TypeScript version to 5.0. Closes [#15452](https://github.com/ckeditor/ckeditor5/issues/15452) . ([commit](https://github.com/ckeditor/ckeditor5/commit/b5c31df8ca7f2032256513532449f424bbc023dd))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Made the types of the `Schema.addChildCheck` and `Schema.addAttributeCheck` callbacks more specific. See [#15290](https://github.com/ckeditor/ckeditor5/issues/15290). ([commit](https://github.com/ckeditor/ckeditor5/commit/44de0ebeab9e9bbfea8afc004143b6a915d52f49))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The document list feature was promoted to the main list feature implementation. The `Document` prefix was removed. The old list implementation was prefixed with the `Legacy` keyword. Aliases were introduced (`DocumentList`, `DocumentListProperties`, `TodoDocumentList`) for backward compatibility but those are marked as deprecated and log a warning in the browser console. Closes [#14942](https://github.com/ckeditor/ckeditor5/issues/14942). ([commit](https://github.com/ckeditor/ckeditor5/commit/b9fb73aa42beef5ad6275cd169682336b6b26a79))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The [`FocusCycler#focusables`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusCycler.html#member-focusables) collection should only contain [`FocusableView`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusableView.html) instances. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973). ([commit](https://github.com/ckeditor/ckeditor5/commit/f8e2b1c902776a848e1ddc208b5db108628f04da))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The [`#next`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusCycler.html#member-next) and [`#previous`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusCycler.html#member-previous) properties of a [`FocusCycler`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusCycler.html) instance should point to the same view if there is only one focusable view registered in the [`focusables`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_focuscycler-FocusCycler.html#member-focusables) collection. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973). ([commit](https://github.com/ckeditor/ckeditor5/commit/f8e2b1c902776a848e1ddc208b5db108628f04da))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/1c70cdf1c90f432dd598f2aef5cc7355885a8873))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.0.0): v41.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.0.0): v40.2.0 => v41.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.0.0): v40.2.0 => v41.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.0.0): v40.2.0 => v41.0.0

Other releases:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.0.0): v40.2.0 => v41.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.0.0): v40.2.0 => v41.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/41.0.0): v40.2.0 => v41.0.0
</details>


## [40.2.0](https://github.com/ckeditor/ckeditor5/compare/v40.1.0...v40.2.0) (December 12, 2023)

We are happy to announce the release of CKEditor&nbsp;5 v40.2.0.

### Release highlights

#### AI Assistant: AWS and custom integrations

Enabling many AI model services was one of our priorities for the AI Assistant. We wanted everyone to be able to use a platform that they find the most convenient.

We are happy to inform you that as of this release, you can use the AI Assistant together with the Amazon Bedrock service.

What is more, you can now extend existing adapters to enable more advanced customizations, such as decorating the AI Assistant requests.

Finally, you can even create a custom adapter to connect to your custom model or any model that does not have an official adapter yet.

Visit the [new integration guide](https://ckeditor.com/docs/ckeditor5/latest/features/ai-assistant/ai-assistant-integration.html) to learn more about integrating and customizing the AI Assistant feature.

These improvements come with minor breaking changes in the editor configuration, so visit the breaking changes section and the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#update-to-ckeditor-5-v4020).

#### Image editing

CKBox’s image editing capabilities, introduced in CKBox v1.6.0, are now accessible straight from the CKEditor image toolbar. CKBox users can resize, crop, or rotate images right within CKEditor.

You can also edit images that are not added to CKBox yet (for example, hotlinked images). CKBox will automatically download the images in the background to allow users to edit them without having to leave CKEditor to manually add the image into CKBox. This dual functionality, combined with server-side processing, ensures ease of use and maintains high image quality and file integrity. It also provides a more efficient and reliable image editing experience within CKEditor.

Refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#update-to-ckeditor-5-v4020) to learn more about these changes.

#### (Experimental) Paste Markdown

This release introduces the new paste Markdown feature. It will automatically format any raw Markdown source or output copied and pasted directly into the editor – without having to switch to source editing. This feature is in its experimental phase, and its behavior may change in the future. Experience this functionality firsthand by pasting Markdown content into the [demo editor](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-markdown.html). We welcome your feedback and observations for ongoing improvements, so share them in the [GitHub issue](https://github.com/ckeditor/ckeditor5/issues/14003).

#### (Coming soon!) New installation methods

We are excited to announce upcoming improvements to CKEditor&nbsp;5's installation process, set to release next year. Our goal is to address and resolve the accumulated pain points that you experienced over the years. For a detailed overview of our plans and the background behind them, dive into the [comprehensive proposal in the RFC](https://github.com/ckeditor/ckeditor5/issues/15502). Your feedback is crucial in refining and perfecting these improvements, and we eagerly await your input!

#### Other notable improvements

* **Improved insert image button**: The `insertImage` component now supports file managers and automatically detects if you are using CKBox. We have also changed the default icon for upload image from computer to better indicate it is an upload action, not a generic image button.
* **Paste link over text**: The editor automatically converts the selected text to a link when you paste a URL onto it.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The configuration for AI Assistant has changed and will require an update. Additionally, a proper adapter (`OpenAIAdapter`, `AWSAdapter`, or a custom adapter) must now be explicitly added to the plugin list. See the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#update-to-ckeditor-5-v4020) for details.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `ImageInsertUI` plugin internals were cleaned up, as it worked a bit magically with hard-coded dependencies. For example, it automatically enabled the behavior of inserting an image via URL. As of now, it will not enable any external behaviors. See the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#update-to-ckeditor-5-v4020) for details.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `CollapsibleView` was moved from the `@ckeditor/ckeditor5-list` package to `@ckeditor/ckeditor5-ui`. You can import it like this: `import { CollapsibleView } from '@ckeditor/ckeditor5-ui';`

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced Amazon Bedrock support for AI Assistant. See the [AI Assistant integration guide](https://ckeditor.com/docs/ckeditor5/latest/features/ai-assistant/ai-assistant-integration.html) to learn more.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Enabled editing of non-CKBox images in the editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/448210c25f04d61e24fb0651d2f0f1ec40214b77))
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Integrated the CKBox image editing feature into the editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/11f18ac8d5d60dcdf2bfb56dc89c9067cb936c0a))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced the image insert dropdown as a consistent UI to insert images through different available integrations such as image upload, inserting an image with the asset manager, and inserting an image via URL. Closes [#15303](https://github.com/ckeditor/ckeditor5/issues/15303), [#15149](https://github.com/ckeditor/ckeditor5/issues/15149). ([commit](https://github.com/ckeditor/ckeditor5/commit/0647ba65cd09575937a9ba8e60bc7b6837f81b40))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Links can now be applied by pasting a URL on a selected text. Closes [#5656](https://github.com/ckeditor/ckeditor5/issues/5656). ([commit](https://github.com/ckeditor/ckeditor5/commit/ba66ba1fb7ac1ce0675614d0f7ef516226d8485f))
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Added experimental support for pasting Markdown-formatted content. Closes [#2321](https://github.com/ckeditor/ckeditor5/issues/2321). ([commit](https://github.com/ckeditor/ckeditor5/commit/767e681e57c9cc8cbe5ef26076c63724f20dc1f0))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Added support for short Dailymotion URLs (`dai.ly`) in the media embed feature. ([commit](https://github.com/ckeditor/ckeditor5/commit/da8c3ac422bef577b8a5e0766c96104a13524cd1))

  Thanks to [@Kocal](https://github.com/Kocal)!

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The fake selection marker was not always removed when the AI Assistant UI was closed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: A user prompt containing special characters was incorrectly displayed in the prompt field (special characters were incorrectly escaped).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant error message should be cleared upon closing the balloon.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed a crash happening in a peculiar scenario involving the reconversion of an element containing a marker. Closes [#15411](https://github.com/ckeditor/ckeditor5/issues/15411). ([commit](https://github.com/ckeditor/ckeditor5/commit/db1da2dd322ba240ef8416238e854a81d7f0bb52))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: `DocumentSelection` should not store the GHS `linkA` attribute if the `linkHref` attribute was removed by the two-step caret movement feature. Closes [#15051](https://github.com/ckeditor/ckeditor5/issues/15051). ([commit](https://github.com/ckeditor/ckeditor5/commit/73c2985923c930a0a7b2503e709370100d8568c1))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The editor should not crash when there is a `<template>` element in the content. Closes [#14933](https://github.com/ckeditor/ckeditor5/issues/14933). ([commit](https://github.com/ckeditor/ckeditor5/commit/3388cfcf2eddefec6b0fca3c259b60353fef298b))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Content from Word documents should be pasted correctly (without HTML styles tag content) on Windows systems. Closes [#15333](https://github.com/ckeditor/ckeditor5/issues/15333), [#9002](https://github.com/ckeditor/ckeditor5/issues/9002). ([commit](https://github.com/ckeditor/ckeditor5/commit/18a88edab9f4c6f78508c766c6abaf7ac80b0497))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Prevented joining two block format suggestions made on widgets placed next to each other, which was an undesirable behavior. Fixed a related editor crash involving two tables with resized columns.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed incorrect handling of attribute suggestions made on a paragraph-like element when the element had an insertion suggestion inside.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced support for the OpenAI `gpt-3.5-turbo-1106` model in AI Assistant.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Secured AI Assistant from incorrect responses that do not begin with the processed HTML.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the `AITextAdapter` abstract class that can be extended to provide a custom adapter for AI Assistant.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced `OpenAIAdapter` and `AWSAdapter` that can be extended to customize how AI Assistant's requests and responses are handled.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Reorganized the configuration parameters for AI Assistant. See the API documentation and update guide.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Allowed to fully customize request headers by providing an object or a function to the `requestHeaders` configuration parameter. See API documentation and update guide.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `ImageUploadUI` plugin is loaded by default when the `ImageBlock` or `ImageInline` plugins are loaded. See [#15149](https://github.com/ckeditor/ckeditor5/issues/15149). ([commit](https://github.com/ckeditor/ckeditor5/commit/0647ba65cd09575937a9ba8e60bc7b6837f81b40))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The logic behind the two-step caret movement was extracted to the common code in the two-step caret movement feature. ([commit](https://github.com/ckeditor/ckeditor5/commit/73c2985923c930a0a7b2503e709370100d8568c1))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `CollapsibleView` class was moved from the `@ckeditor/ckeditor5-list` package to `@ckeditor/ckeditor5-ui`. See [#15149](https://github.com/ckeditor/ckeditor5/issues/15149). ([commit](https://github.com/ckeditor/ckeditor5/commit/0647ba65cd09575937a9ba8e60bc7b6837f81b40))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The logic behind the two-step caret movement was extracted to the common code in the two-step caret movement feature. ([commit](https://github.com/ckeditor/ckeditor5/commit/73c2985923c930a0a7b2503e709370100d8568c1))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Unified the behavior of the `insertText` command for cases using the `DocumentSelection` and `Selection` as applied attributes behaved differently in those cases. ([commit](https://github.com/ckeditor/ckeditor5/commit/73c2985923c930a0a7b2503e709370100d8568c1))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `CollapsibleView` class was moved from the `@ckeditor/ckeditor5-list` package to `@ckeditor/ckeditor5-ui`. See [#15149](https://github.com/ckeditor/ckeditor5/issues/15149). ([commit](https://github.com/ckeditor/ckeditor5/commit/0647ba65cd09575937a9ba8e60bc7b6837f81b40))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `SplitButtonView` constructor and `createDropdown()` helper accept an instance of a `ButtonView` as an action view customization. See [#15149](https://github.com/ckeditor/ckeditor5/issues/15149). ([commit](https://github.com/ckeditor/ckeditor5/commit/0647ba65cd09575937a9ba8e60bc7b6837f81b40))
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: The `FileDialogButtonView` class is now an instance of the `ButtonView`, not just a wrapper on it. See [#15149](https://github.com/ckeditor/ckeditor5/issues/15149). ([commit](https://github.com/ckeditor/ckeditor5/commit/0647ba65cd09575937a9ba8e60bc7b6837f81b40))
* The `undo` and `redo` toolbar components described in the `@ckeditor/ckeditor5-essentials/src/ckeditor5-metadata.json` file are now defined in the package that registers these buttons (`@ckeditor/ckeditor5-undo`). Closes [#15414](https://github.com/ckeditor/ckeditor5/issues/15414). ([commit](https://github.com/ckeditor/ckeditor5/commit/0b9552b4d4f14063896e2e588195cfa368734690))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/e0f61406b8294f7d189c9c59b33d71413201aed0), [commit](https://github.com/ckeditor/ckeditor5/commit/c8379c676d691ad72bf8b8c8c9d5544ddf09f2f4), [commit](https://github.com/ckeditor/ckeditor5/commit/fb8eb673ec5c79fc26f0e8915044bcc89b908000))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/40.2.0): v40.1.0 => v40.2.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/40.2.0): v40.1.0 => v40.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/40.2.0): v40.1.0 => v40.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/40.2.0): v40.1.0 => v40.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/40.2.0): v40.1.0 => v40.2.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/40.2.0): v40.1.0 => v40.2.0
</details>


## [40.1.0](https://github.com/ckeditor/ckeditor5/compare/v40.0.0...v40.1.0) (November 15, 2023)

We are happy to announce the release of CKEditor&nbsp;5 v40.1.0.

### Release highlights

#### Styling suggestions reflected in the content

This release introduces an important user experience improvement for the track changes feature. From now on, styling changes made in the track changes mode will be also reflected in the editor content, instead of just being marked with a blue suggestion highlight.

Below is a summary of the important changes related to this improvement:

* A new suggestion type `'attribute'` was introduced. All integrated features will now create `'attribute'` suggestions.
* Formatting suggestions in existing documents are still supported and will work as they used to.
* With the new suggestions, multiple changes are put into a single suggestion if possible, to avoid bloating the sidebar with too many annotations.
* For asynchronous collaboration integrations, make sure that you save and provide the `SuggestionData#attributes` property, as it is used by the new suggestions.

We will continue further work on this improvement, including integrating the new solution with the list feature.

#### Azure OpenAI service support

We have introduced the necessary changes to make sure that the AI Assistant can be used with the Azure OpenAI service. Please refer to the [AI Assistant documentation](https://ckeditor.com/docs/ckeditor5/latest/features/ai-assistant.html#azure-openai-service) for details.

#### Other notable improvements

* **Fixed triple click before widgets:** The beloved triple click to select content works correctly before tables, images, and other widgets.
* Several **CKBox integration improvements** include a significantly enhanced image insertion mechanism from [CKBox](https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckbox.html), offering a less jumpy experience. The release also addresses key issues, such as including the proper replacement of images when URLs are edited, better focus management post-image insertion, and a fixed `tokenUrl` configuration for more seamless integration.
* **Paste from Office enhanced:** Our [advanced format preserver](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-office-enhanced.html) for Office kept too many unnecessary attributes, styles, etc., in combination with the General HTML support plugin. Now we fully clean up the markup before pasting.
* **Accessibility enhancements for markers:** Users aided by assistive technologies will now be notified when the selection enters or leaves a comment or a suggestion in the editor content.
* **AI Assistant:** The predefined commands can now be used when no content is selected (previously it was disabled). When used like this, the whole focused block (paragraph, list item, etc.) is passed as the context for the command.
* **AI Assistant:** The response streaming is now configurable and can be turned off.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The `config.aiAssistant.uiCssClass` configuration was replaced by `config.aiAssistant.useTheme` and changed its function. A new complementary `.ck-ai-assistant-ui_theme` CSS class was introduced to the AI Assistant's UI elements. Please refer to the API documentation and the UI customization guide to learn more.
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: If you have a custom plugin that uses root attributes, it is highly recommended to use the newly added `MultiRootEditor#registerRootAttribute()` method to register a custom root attribute.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: By default, images are inserted as block images (not inline). To switch to the previous behavior (determining image type by insertion context), set the editor configuration `image.insert.type` to `'auto'`.
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: Introduced the new `config.importWord.formatting` configuration property which is an object accepting the following properties: `resets`, `defaults`, `styles`, and `comments`. The old properties: `config.importWord.defaultStyles` and `config.importWord.commentsStyles` were removed. Use `formatting.defaults` and `formatting.comments` instead.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#update-to-ckeditor-5-v4010) to learn more about these changes.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Enabled AI Assistant integration with the Azure OpenAI service.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Allowed executing pre-defined AI commands on a collapsed selection.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Allowed for ordering groups and commands in the AI Assistant's dropdown configuration through the `order` property. See the `AIAssistantConfig` API documentation for details.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced `config.aiAssistant.requestParameters.stream` to configure whether the AI Assistant should use streaming or not.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Images inserted by CKBox should set the provided dimensions and use blurhash to indicate image loading. Closes [#15090](https://github.com/ckeditor/ckeditor5/issues/15090). ([commit](https://github.com/ckeditor/ckeditor5/commit/6ee2867becd7de50366bb01eb9a1b4f9f664faa3))
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: Added `MultiRootEditor#registerRootAttribute()`. All root attributes used by features should now be registered. Root attributes passed in the editor configuration are now automatically registered. Closes [#15246](https://github.com/ckeditor/ckeditor5/issues/15246). ([commit](https://github.com/ckeditor/ckeditor5/commit/5404c1ae6393e995adc391f4433327f22d7b7a54))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Images inserted by CKBox should set the provided dimensions and use blurhash to indicate image loading. Closes [#15090](https://github.com/ckeditor/ckeditor5/issues/15090). ([commit](https://github.com/ckeditor/ckeditor5/commit/6ee2867becd7de50366bb01eb9a1b4f9f664faa3))
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: Introduced a new `config.importWord.formatting` configuration property in place of `config.importWord.defaultStyles` and `config.importWord.commentsStyles`.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Styling changes made while in track changes mode will now be immediately reflected in the editor content in addition to creating a suggestion. This applies only to newly created suggestions.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Introduced new suggestion type `'attribute'` which indicates that an attribute on a model node has changed and allows to show the change immediately in the content.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced the `AriaLiveAnnouncer` class that allows for using `aria-live` regions to inform screen readers about changes in the editor state. `AriaLiveAnnouncer` instance is available under `EditorUI#ariaLiveAnnouncer`. ([commit](https://github.com/ckeditor/ckeditor5/commit/a263afd62f53172f562ce66fa92523bc986bbc47))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The pre-defined command label should be displayed in the AI Assistant's prompt field.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI content area should stop scrolling automatically once the user interacts with it.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant balloon should be closed when the user presses the <kbd>Esc</kbd> key.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI pre-defined commands dropdown should reset its scroll when reopened.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant should not log unnecessary warnings when detached from the DOM.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant's balloon anchor point should stay at the correct position when the balloon grows.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant's copy to clipboard button did not work correctly in Firefox when the General HTML support plugin was loaded.
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Pasting a link address should not convert its parts that look like HTML entities. Closes [#15036](https://github.com/ckeditor/ckeditor5/issues/15036). ([commit](https://github.com/ckeditor/ckeditor5/commit/89eb0652fc34aaac6541a7ef0cf4cbdd9d7d6690))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Improved drop marker visibility to only display in allowed drop locations. Closes [#14709](https://github.com/ckeditor/ckeditor5/issues/14709). ([commit](https://github.com/ckeditor/ckeditor5/commit/28331316629e97a22cac6f87c81bf058d65ffcd7))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Prevented a crash happening when importing a Word file when the comments plugin is loaded.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Fixed type definitions in `ToolbarConfig` by adding an optional `icon` parameter. Closes [#15151](https://github.com/ckeditor/ckeditor5/issues/15151). ([commit](https://github.com/ckeditor/ckeditor5/commit/b304ee954e1a48e612170ccf96aa126633656796))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Additional attributes for the link element (for example, CSS class) should not be applied after pressing <kbd>Enter</kbd>. Closes [#14683](https://github.com/ckeditor/ckeditor5/issues/14683). ([commit](https://github.com/ckeditor/ckeditor5/commit/9c02cc4419054ba0ded05a989ffe6464b354e9cf))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The aspect ratio should be updated on the image replacement. Closes [#15179](https://github.com/ckeditor/ckeditor5/issues/15179). ([commit](https://github.com/ckeditor/ckeditor5/commit/629ff3be0f92921d1c74cc132967b1993125beac))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Remove outdated image attributes when an image is replaced by a URL. Closes [#15093](https://github.com/ckeditor/ckeditor5/issues/15093). ([commit](https://github.com/ckeditor/ckeditor5/commit/70d75935cb8226e643bfcf2bb7a33b3d9d4561b4))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Pasting plain text content should not break the lists. Closes [#13826](https://github.com/ckeditor/ckeditor5/issues/13826). ([commit](https://github.com/ckeditor/ckeditor5/commit/0ba85c176b1cee0cab37d6937ebae6c33af0ae7e))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Pasting one list into another should preserve the target list type. See [#13826](https://github.com/ckeditor/ckeditor5/issues/13826). ([commit](https://github.com/ckeditor/ckeditor5/commit/0ba85c176b1cee0cab37d6937ebae6c33af0ae7e))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Tables pasted from Word should not lose styles when General HTML Support is enabled. ([commit](https://github.com/ckeditor/ckeditor5/commit/4d5fa5d0486debddf183e822875a2d943d40dbb3))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table properties should be enabled if a table is selected from the outside. Closes [#15040](https://github.com/ckeditor/ckeditor5/issues/15040), [#15041](https://github.com/ckeditor/ckeditor5/issues/15041), [#10983](https://github.com/ckeditor/ckeditor5/issues/10983). ([commit](https://github.com/ckeditor/ckeditor5/commit/7c1ee6c453e45d256b1adec1b7b802e264706ccb))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Editor commands will now return a proper value when executed in track changes mode.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `AutocompleteView` should not capture the <kbd>Esc</kbd> key press event if its result pane is hidden. ([commit](https://github.com/ckeditor/ckeditor5/commit/3da2f78183a0ba602c9a2e1538e3b54b7c946d6b))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: `TextareaView` will no longer update its height (and log warnings) when the element is detached from the DOM. ([commit](https://github.com/ckeditor/ckeditor5/commit/46c6595d921f9724583979f5769bfc58f347c452))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed the usage of the `aria-checked` attribute in dropdowns. Closes [#14823](https://github.com/ckeditor/ckeditor5/issues/14823). ([commit](https://github.com/ckeditor/ckeditor5/commit/3137f39a11059a1b738b9a008a412e70674c9f9d))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `Config#get()` method should be able to return a function. Closes [#14804](https://github.com/ckeditor/ckeditor5/issues/14804), [#12835](https://github.com/ckeditor/ckeditor5/issues/12835). ([commit](https://github.com/ckeditor/ckeditor5/commit/3cc09ac837a809935225019a723f17026fa15602))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Triple-click in a paragraph should select the whole paragraph even if a block widget follows (table, block image). Closes [#11130](https://github.com/ckeditor/ckeditor5/issues/11130). ([commit](https://github.com/ckeditor/ckeditor5/commit/beb4c80535e97c7a395e23631f3e5c5cd39b6f88))
* Plugins specified in `config.removePlugins` should now be properly filtered out when revision history and track changes data plugins are used.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Simplified CSS customization in the AI Assistant's UI.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Pre-defined commands dropdown search filter will now also include group names.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant's `Replace` button should be labeled `Insert` if the selection is collapsed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved the layout of the AI Assistant in the editor using a right-to-left UI language.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: The editor should be focused after choosing an asset or closing CKBox. Closes [#15091](https://github.com/ckeditor/ckeditor5/issues/15091). ([commit](https://github.com/ckeditor/ckeditor5/commit/c6d1028e7d32165efea22af52bffa62d6f804fad))
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: When multiple files are selected, add each one of them in a separate paragraph. Closes [#15094](https://github.com/ckeditor/ckeditor5/issues/15094). ([commit](https://github.com/ckeditor/ckeditor5/commit/93f01bb869a1adcb118954e5216e45b944ff9cf1))
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Set the default CKBox theme to `lark`. Closes [#15096](https://github.com/ckeditor/ckeditor5/issues/15096). ([commit](https://github.com/ckeditor/ckeditor5/commit/ab601563a284bc0e1fac4feee5f1b2adb6ee22b0))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Users using assistive technologies will now be notified when their selection enters or leaves a comment or a suggestion in the editor content.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Made the `PluginInterface.destroy()` method optional. ([commit](https://github.com/ckeditor/ckeditor5/commit/f1a686efdfa50727cc9cd694c5c1adf25099cef6))
* **[format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter)**: Users using assistive technologies will now be notified when the formatting is being copied or pasted.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Changed the icon of the alternative text to be more accurate and describe its purposes. Closes [#12410](https://github.com/ckeditor/ckeditor5/issues/12410). ([commit](https://github.com/ckeditor/ckeditor5/commit/1c5bcf0d0e9f5dba437812465791e0a2a2c207ab))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Changed the default `image.insert.type` configuration to `"block"` and added the `"auto"` option. Closes [#15158](https://github.com/ckeditor/ckeditor5/issues/15158). ([commit](https://github.com/ckeditor/ckeditor5/commit/fc95cba8814e872cba0b9a74b9672dcf8f7827e8))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Created a custom property for the shared light red color. Closes [#15217](https://github.com/ckeditor/ckeditor5/issues/15217). ([commit](https://github.com/ckeditor/ckeditor5/commit/f01f4a1c2bd6198bdfcd1b12477e63db0896a3cb))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Improved RTL layout support in some of the UI components (`FormHeaderView`, `ButtonView`, and `ListItemView`). ([commit](https://github.com/ckeditor/ckeditor5/commit/e86147ad6c6208db0de9414e898c1d47c7886c9e))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Migrated feature integrations to use the `'attribute'` suggestions: alignment, basic styles, font, format painter, heading, highlight, HTML embed, image (except for image styles), indent block, link, remove format, styles, and table headings.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Due to substantial changes in how new styling suggestions are presented in the editor content, numerous interactions and labels displayed in the suggestion annotations were changed compared to the old suggestions.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Users using assistive technologies will now be notified when their selection enters or leaves a comment or suggestion in the editor content.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `ListItemGroupView` should allow using a custom label. ([commit](https://github.com/ckeditor/ckeditor5/commit/67ca8d4cde303c2a9793f8e14ad3ca2481664215))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Improved RTL layout support in some of the UI components (`FormHeaderView`, `ButtonView`, and `ListItemView`). ([commit](https://github.com/ckeditor/ckeditor5/commit/e86147ad6c6208db0de9414e898c1d47c7886c9e))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/f43de84a80e8677b25161d1c60bb35de048dc394))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/40.1.0): v40.0.0 => v40.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/40.1.0): v40.0.0 => v40.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/40.1.0): v40.0.0 => v40.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/40.1.0): v40.0.0 => v40.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/40.1.0): v40.0.0 => v40.1.0
</details>


## [40.0.0](https://github.com/ckeditor/ckeditor5/compare/v39.0.2...v40.0.0) (October 4, 2023)

We are happy to announce the release of CKEditor&nbsp;5 v40.0.0.

### Release highlights

#### Release of the AI Assistant feature

**We are tremendously excited to share our AI Assistant plugin with you!**

With the AI Assistant, you can boost your editing effectiveness and creativity in a completely new way. This feature gives writers and editors the power to seamlessly interact with artificial intelligence. Users can generate, expand, rewrite, improve, translate, and process the content in many different ways.

The AI Assistant can be used in two ways. You can quickly re-work selected content by choosing one of the predefined AI commands. You can also write your own query to generate or process the content in any way you like!

Make sure to visit the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/ai-assistant.html) and try the [demo](https://ckeditor.com/docs/ckeditor5/latest/features/ai-assistant.html#demo)!

#### Introduction of the image height and width support

No more layout shifts! We have introduced the setting of the image `width` and `height` attributes automatically during the upload or paste process to ensure the highest-quality content with no text jumping all around. While existing images will not be automatically retroactively altered, any changes to images in the editor (like resizing) will automatically set these attributes.

We have also ensured backward compatibility with CKEditor 4, particularly while maintaining user-changed aspect ratios. You can find more details on the changes [in the update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#changes-to-the-image-feature).

#### Drag and drop of blocks

Just drag it!™ We have introduced a more intuitive drag-and-drop functionality for blocks and widgets. This makes content rearrangement and editing faster and easier, offering users better control over their content. Dragging by the balloon block toolbar handle is also possible, and we have updated its default icon to reflect this new drag-and-drop capability better ([note: it is still changeable](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#new-balloon-block-editor-icon)).

#### Document lists feature parity

Document lists, our second-generation list plugin that supports multiple content blocks in list items, finally support to-do lists! We have also added the configuration that enforces the document list to have only a single block inside the list item (we call it "simple lists"). All this is to start deprecating the lists v1 implementation and use the document lists as default. [Coming soon](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html#a-new-default-lists-plugin-coming)!

#### Contextual balloon fixes

We have prepared significant fixes to the way the contextual balloons work. They tended to overflow on other elements, especially in the fixed-height editors. We polished their internals, and problems should exist no more.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-40.html) to learn more about these changes.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The model attribute name of the resized image was changed to `resizedWidth`. The `width` and `height` attributes are now used to preserve the image's natural width and height.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `srcset` model attribute was simplified. It is no longer an object `{ data: "...", width: "..." }`, but a value previously stored in the `data` part.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The comment thread's "resolved" state was separated from the "unlinked" state (a state when the related editor content was removed from the document). A thread can have any combination of these states. If a comment thread is either resolved or unlinked, it is moved to the comments archive. This new approach is reflected in the comments archive UI. Notably, an unlinked comment thread can become resolved and reopened while still being in the comments archive. Additionally, the unlinked comment threads have a gray header color to differentiate them from the resolved comment threads.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `CommentThread#archivedAt` is now the property to check when deciding whether the comment thread is inside the comments archive or not (that property was `#resolvedAt` before).
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: `CommentsArchive#resolvedThreads` was renamed to `#archivedThreads`. If your custom code used that property, make sure to apply this change.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `deletedAt` property is no longer passed in `AddCommentThreadEvent` as it is not needed anymore. Instead, deleted comment threads should never be handled in `addCommentThread` as they should never be added to the repository. If your custom code used that property, make sure to apply this change.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: In a real-time collaboration environment, removed comment threads will no longer be added to the comments repository after re-initializing the editor. Before, the comment thread was removed from the comments repository but was added back when the editor re-connected to Cloud Services. If your custom code expected the old (incorrect) behavior, it might need a change. This change was reflected in the comments outside the editor documentation page.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the AI Assistant feature.
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Enabled the block drag and drop by default. Closes [#14734](https://github.com/ckeditor/ckeditor5/issues/14734). ([commit](https://github.com/ckeditor/ckeditor5/commit/a9eff48d47e955537a27d2de2d4adb2be9b7ae9c))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Extended the drag and drop selection to parent elements when all their children are selected. Closes [#14640](https://github.com/ckeditor/ckeditor5/issues/14640). ([commit](https://github.com/ckeditor/ckeditor5/commit/5e26217556d6e287c1eafaf26e84d70f89238ccf))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image `width` and `height` attributes are now preserved while loading the editor content. Closes [#14146](https://github.com/ckeditor/ckeditor5/issues/14146). ([commit](https://github.com/ckeditor/ckeditor5/commit/58e9c88ae6a9d192cc559e429b999a32a03a2dca))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Images without a specified size will automatically gain natural image width and height dimensions on any interaction with the image. See [#14146](https://github.com/ckeditor/ckeditor5/issues/14146). ([commit](https://github.com/ckeditor/ckeditor5/commit/58e9c88ae6a9d192cc559e429b999a32a03a2dca))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Allow restricting list item content to a single text block by disabling the `list.multiBlock` configuration option. Closes [#14634](https://github.com/ckeditor/ckeditor5/issues/14634). ([commit](https://github.com/ckeditor/ckeditor5/commit/7acb67df0d6750ab7254e1fec6f064f92f1f42f0))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introducing the to-do lists compatible with the document list feature. Closes [#14663](https://github.com/ckeditor/ckeditor5/issues/14663). ([commit](https://github.com/ckeditor/ckeditor5/commit/613b8e26949743d301dc21c6101aeda1286f2950))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Implemented new UI components: `ListItemGroupView`, `TextareaView`, `SpinnerView`, `SearchView`, and `AutocompleteView`. ([commit](https://github.com/ckeditor/ckeditor5/commit/550f73cf641e30a2d363dc8eb87259bc73d2c2e2))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced the `HighlightedTextView` component for a better presentation of search results. ([commit](https://github.com/ckeditor/ckeditor5/commit/550f73cf641e30a2d363dc8eb87259bc73d2c2e2))

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Improved displaying the preview of the drag and drop content. Closes [#14968](https://github.com/ckeditor/ckeditor5/issues/14968). ([commit](https://github.com/ckeditor/ckeditor5/commit/905f480d405f0b0dcd82caf775351236365eaed4))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Comment threads that were permanently deleted will be removed from `CommentsRepository` and, in case of real-time collaboration, they will not be added back after re-connecting to the document.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The editor will no longer throw an error when clicking a balloon with input in Firefox. Closes [#9635](https://github.com/ckeditor/ckeditor5/issues/9635). ([commit](https://github.com/ckeditor/ckeditor5/commit/54a4c22c0fce865e45f7b28f25641636d90547e1))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: An image should not be replaced when dropped below a widget. Closes [#14710](https://github.com/ckeditor/ckeditor5/issues/14710), [#14740](https://github.com/ckeditor/ckeditor5/issues/14740). ([commit](https://github.com/ckeditor/ckeditor5/commit/03641ca58a5d4f241910f871054aa48edc216114))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: A dragged whole list item should still be a list item when dropped. Closes [#14969](https://github.com/ckeditor/ckeditor5/issues/14969). ([commit](https://github.com/ckeditor/ckeditor5/commit/a20bcfb2bceb2f56cfdf22057b1b5a1cdf238864))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Fixed the type definition of the `Mention#toMentionAttribute()` method. Closes [#14923](https://github.com/ckeditor/ckeditor5/issues/14923). ([commit](https://github.com/ckeditor/ckeditor5/commit/1f6bf52e3ef42e8ab9cdfc130e6d369593f6791c))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Balloon panels should not stick out of the visible part of the editor while scrolling. ([commit](https://github.com/ckeditor/ckeditor5/commit/7f4f63e574606ba7c589059d68316b8a4cc9b132))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Fixed an incorrect tooltip when hovering over the toolbar buttons in Chrome on iOS. Closes [#13812](https://github.com/ckeditor/ckeditor5/issues/13812). ([commit](https://github.com/ckeditor/ckeditor5/commit/5c7fe1ccb6751348d1c12b7dd96d98263b9c9d74))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The coordinates of an element are now correctly calculated relative to the positioned ancestor element. Closes [#14992](https://github.com/ckeditor/ckeditor5/issues/14992). ([commit](https://github.com/ckeditor/ckeditor5/commit/76663b4454cdf42a3a8152391b79f9a1165c8171))

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced the `Comment#unlinkedAt` and `Comment#archivedAt` properties and the `Comment#setUnlinkedAt()` method.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `deletedAt` property is no longer passed in `AddCommentThreadEvent` as it is not needed anymore.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Renamed `CommentsArchive#resolvedThreads` to `#archivedThreads`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Comment threads are no longer treated as resolved when their related content is removed from the document. These threads are now in the unlinked state.
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Improved the drag and drop target line. Closes [#14645](https://github.com/ckeditor/ckeditor5/issues/14645). ([commit](https://github.com/ckeditor/ckeditor5/commit/3ec29eb6eac970d77d00bd327d77da67076e9373))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Made the `ButtonView` label logic open for extension. ([commit](https://github.com/ckeditor/ckeditor5/commit/550f73cf641e30a2d363dc8eb87259bc73d2c2e2))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Changed the default icon of the `BallonEditor` toolbar handle and added the ability to customize it. Closes [#14646](https://github.com/ckeditor/ckeditor5/issues/14646). ([commit](https://github.com/ckeditor/ckeditor5/commit/238665a602daedf62bc7e30d64ed4e8579c31be5))
* Optimized icons. ([commit](https://github.com/ckeditor/ckeditor5/commit/257e0f0e02148985499bad6b709aa6e7780465e0))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/b35611664e82fee4f49c5d8d9dd20da6eba80976), [commit](https://github.com/ckeditor/ckeditor5/commit/cca1dc24118cb4a2a83900326bf2f4c43eaf2c03), [commit](https://github.com/ckeditor/ckeditor5/commit/c9da67901c371632ba8d5232a22be542b0403960))
* Added support to execute the `yarn run clean-up-svg-icons` script without arguments to optimize all icons in the entire project. Closes [#14912](https://github.com/ckeditor/ckeditor5/issues/14912). ([commit](https://github.com/ckeditor/ckeditor5/commit/ba1bcba3d25f693d6e64dceb340f79afa33cae76))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/40.0.0): v40.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/40.0.0): v39.0.2 => v40.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/40.0.0): v39.0.2 => v40.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/40.0.0): v39.0.2 => v40.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/40.0.0): v39.0.2 => v40.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/40.0.0): v39.0.2 => v40.0.0
</details>


## [39.0.2](https://github.com/ckeditor/ckeditor5/compare/v39.0.1...v39.0.2) (September 6, 2023)

We are happy to announce the release of CKEditor&nbsp;5 v39.0.2.

### Release highlights

This is a patch release that resolves over 10 important issues. Check out the list below for more information.

### Bug fixes

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: The CKBox dialog should be focused after being opened. Closes [#14312](https://github.com/ckeditor/ckeditor5/issues/14312). ([commit](https://github.com/ckeditor/ckeditor5/commit/f8552d5dbdedd994dbc69f49b3b141d48f314a57))
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: The document outline feature no longer throws an error while scrolling when the editor is not fully initialized.
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Added the missing `type` keyword to the interface re-export (`ExportWordConfig`).
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Undo should restore every text occurrence replaced by the replace all feature in the document at once. Closes [#13892](https://github.com/ckeditor/ckeditor5/issues/13892). ([commit](https://github.com/ckeditor/ckeditor5/commit/cfab99d31251d7da34698ca267151fdefe150d6e))
* **[indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent)**: Block elements should not be indented in document lists. Closes [#14155](https://github.com/ckeditor/ckeditor5/issues/14155). ([commit](https://github.com/ckeditor/ckeditor5/commit/fec3d4b1b94e2314f13f0fdf387a62a767e294c3))
* **[indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent)**: Nested lists pasted from Word should now be displayed properly in document lists. Closes [#12466](https://github.com/ckeditor/ckeditor5/issues/12466). ([commit](https://github.com/ckeditor/ckeditor5/commit/a8b1e91ba6855507b9d703a7e55076a05b2159be))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Tables pasted from Microsoft Excel should now have proper column widths. Closes [#14521](https://github.com/ckeditor/ckeditor5/issues/14521), [#14516](https://github.com/ckeditor/ckeditor5/issues/14516). ([commit](https://github.com/ckeditor/ckeditor5/commit/cc319ca909aa28dcf28475f928d56c1ac7651147))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The editor no longer crashes when handling tables with over 2500 rows. Closes [#14785](https://github.com/ckeditor/ckeditor5/issues/14785). ([commit](https://github.com/ckeditor/ckeditor5/commit/c2d4af684f995d5ab39f2b6f221b27d6db54dafe))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed a scrolling issue when headings are inside a table. ([commit](https://github.com/ckeditor/ckeditor5/commit/fa5b4e436d860994a613ee14303c676076c4716c))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Tables pasted from Microsoft Excel will now have proper column widths. Closes [#14521](https://github.com/ckeditor/ckeditor5/issues/14521), [#14516](https://github.com/ckeditor/ckeditor5/issues/14516). ([commit](https://github.com/ckeditor/ckeditor5/commit/cc319ca909aa28dcf28475f928d56c1ac7651147))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Two existing suggestions will not be joined if they have different attributes. In real-time collaboration, suggestions are not joined until the attribute data is loaded.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: A new suggestion will not be joined with an existing suggestion if any of its attribute values is different than the existing suggestion's attribute.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The editor no longer crashes when a suggestion is clicked after it was brought back using undo.
* CKEditor&nbsp;5 does not rely on the `global` object only available in Node.js. Fixes [ckeditor/vite-plugin-ckeditor5#17](https://github.com/ckeditor/vite-plugin-ckeditor5/issues/17) and [#14801](https://github.com/ckeditor/ckeditor5/issues/14801). ([commit](https://github.com/ckeditor/ckeditor5/commit/b7a984b19769cd85e3016d82b75ad6d7ac66ec17))

### Other changes

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved performance when handling large tables. See [#14785](https://github.com/ckeditor/ckeditor5/issues/14785). ([commit](https://github.com/ckeditor/ckeditor5/commit/c2d4af684f995d5ab39f2b6f221b27d6db54dafe))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/52231a24d8e2721e91d589d58cdf921557660899))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/39.0.2): v39.0.1 => v39.0.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/39.0.2): v39.0.1 => v39.0.2
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/39.0.2): v39.0.1 => v39.0.2
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
