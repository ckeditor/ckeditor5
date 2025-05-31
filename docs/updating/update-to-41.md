---
category: update-guides
meta-title: Update to version 41.x | CKEditor 5 Documentation
menu-title: Update to v41.x
order: 83
---

# Update to CKEditor&nbsp;5 v41.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v41.3.0

Released on April 10, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.3.0))

### Multi-level lists

CKEditor 5's latest update brings a new premium feature: the {@link features/multi-level-lists multi-level list} feature. It allows for easy creation and modification of numbered lists with counters (`1., 1.1., 1.1.1`), crucial for clear referencing and hierarchical organization in complex documents. The feature ensures compatibility with Microsoft Word. When lists with such formatting are pasted to the editor, the numbering format and counters are retained.

### Paste from Office improvements for lists

No more breaking numbering of lists when they are pasted from Office. Previously whenever a list was split by paragraphs, the counter started again from 1. With our latest improvement, the counter is correctly preserved. Moreover, if you use Paste from Office Enhanced ⭐️, the paragraphs will be merged into list items to ensure proper semantic content.

<info-box warning>
	⚠️ If you use the `LegacyList` plugin to prolong the migration to the new list implementation, bear in mind that from this release Paste from Office stops working for the lists' implementation you are using. Migrate to `List` to maintain pasting lists functionality.
</info-box>

### Menu bar

The menu bar is a user interface component popular in large editing desktop and online packages. It gives you access to all features provided by the editor, organized in menus and categories. It improves usability of the editor, keeping the toolbar simple and tidy. This is especially welcome in heavily-featured editor integrations. 

The current release brings this battle-hardened solution to CKEditor 5! The {@link getting-started/setup/menubar menu bar} can easily be enabled in selected editor types, comes with handy features preset, and is also highly configurable.

### Updated keyboard navigation

This release brings in a fix for keyboard navigation with the <kbd>Tab</kbd> key. Before, it followed the default browser behavior, which could produce somewhat random effects. For example, when the cursor was positioned at the end of the editable, the <kbd>Tab</kbd> keystroke could navigate you to the image caption on the top.

We changed it to an approach in which the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>), navigates to the next focusable field or an element outside the editor so that the users can quickly navigate fields or links on the page. The navigation in the editor itself should be done by arrows, rather.

There is one exception to the <kbd>Tab</kbd> behavior. When a widget is selected, the <kbd>Tab</kbd> key will move the selection to the first nested editable, such as the caption of an image. Pressing the <kbd>Esc</kbd> key, while inside a nested editable, will move the selection to the closest ancestor widget, for example: moving from an image caption to selecting the whole image widget.

### Minor breaking changes in this release

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The CSS custom property `--ck-color-image-caption-highligted-background` has been renamed to `--ck-color-image-caption-highlighted-background`. Please make sure to update your custom CSS accordingly.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The username displayed next to the user marker in the edited content is no longer a CSS pseudo-element. Use the `.ck-user__marker-tooltip` CSS class to customize usernames instead.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: When `config.ai.openAI.requestParameters` or `config.ai.aws.requestParameters` are set, the set value will fully overwrite the default value. Most importantly, if you do not specify some properties in `requestParameters` they will not be set to default. For example, if you set `openAI.requestParameters` to `{ max_tokens: 1000 }`, the request parameters will be set exactly to that object. Make sure that you pass all necessary parameters in `requestParameters`. Important: this change happened in version 41.2.0 but has not been previously announced in the changelog.
* **[upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)**: The `FileDialogButtonView` class has been moved from `ckeditor5-upload` to `ckeditor5-ui`. Please update your import paths accordingly (was: `import { FileDialogButtonView } from 'ckeditor5/src/upload.js';`, is: `import { FileDialogButtonView } from 'ckeditor5/src/ui.js';`).
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The default vertical spacing around `ButtonView` in `ListItemView` (`--ck-list-button-padding`) has been reduced for better readability. This affects the presentation of various editor features that use this type of UI (headings, font size, font family, etc.). You can restore the previous value by setting `--ck-list-button-padding: calc(.2 * var(--ck-line-height-base) * var(--ck-font-size-base)) calc(.4 * var(--ck-line-height-base) * var(--ck-font-size-base));` in your custom styles sheet.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: From this release on, the UI of the Comments Archive feature is displayed in a dialog instead of a dropdown.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The UI for saving the new revision is displayed in a dialog instead of a dropdown.

### Legacy lists compatibility

As of this release, due to a bug that needed fixing, the {@link module:list/legacylist~LegacyList legacy lists plugin} (lists v1 ) is no longer compatible with the {@link features/paste-from-office paste from Office} feature. List items will be added as paragraphs instead. Please consider {@link updating/update-to-41#breaking-changes-to-the-list-plugin upgrading to the modern list plugin} to avoid it.

## Update to CKEditor&nbsp;5 v41.2.0

Released on March 6, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.2.0))

### Copy-paste comments

Since the beginning, collaboration has been a focal point for CKEditor 5. This release brings another highly anticipated improvement for the popular comments feature!

Now, when you cut-paste, copy-and-paste, or drag around a piece of content that includes comments, the comments will be retained. The improvement allows users to restructure their content without losing the information or discussion available in the comments.

By default, the comments are retained only on cut-and-paste and drag-and-drop actions. You can configure this behavior to be applied also on copy-paste or you can turn it off.

### Accessibility Help Dialog

CKEditor 5 v41.2.0 introduces the {@link features/accessibility#keyboard-shortcuts Accessibility Help Dialog}. With the hit of <kbd>Alt</kbd>/<kbd>Option</kbd>+<kbd>0</kbd> in the editor, users can now access the full list of available keyboard shortcuts. A toolbar button is available as well. This feature further improves the editor's usability and accessibility. It allows all users to navigate and operate CKEditor 5 more efficiently, thereby promoting a more inclusive user experience.

The Accessibility Help Dialog is enabled by default in the `Essentials` plugin pack, making it available straight away in most integrations. If your editor build does not use the `Essentials` pack, make sure that you add the `AccessibilityHelp` plugin in your configuration.

### Minor breaking changes in this release

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Comments will now be retained in the clipboard and pasted into the content when the user performs a cut-and-paste operation. To revert to the previous behavior (with no retaining), set the `comments.copyMarkers` configuration property to an empty array.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The contents of the `BlockToolbar` and `BalloonToolbar` toolbars are now filled on the `EditorUIReadyEvent` instead of `Plugin#afterInit()`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: When `config.ai.openAI.requestParameters` or `config.ai.aws.requestParameters` are set, the set value will fully overwrite the default value. Most importantly, if you do not specify some properties in `requestParameters` they will not be set to default. For example, if you set `openAI.requestParameters` to `{ max_tokens: 1000 }`, the request parameters will be set exactly to that object. Make sure that you pass all necessary parameters in `requestParameters`.

## Update to CKEditor&nbsp;5 v41.1.0

Released on February 7, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.1.0))

### Minor breaking changes in this release

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: We fixed how the missing `value` of the `"class"` and `"style"` attribute conversion is handled in the `attributeToAttribute()` upcast helper. Now while not providing the attribute's `value` to conversion the helper accepts and consumes all values. Previously those values were not consumed and left for other converters to convert. Note that you should use the `classes` and the `styles` fields for the fine-tuned conversion of those attributes instead of a catch-all `"style"` and `"class"` specified in the `key` field.
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: The `colorSelectorView` property will no longer be accessible from the `ColorUI` plugin in the `@ckeditor/ckeditor5-font/src/ui/colorui.ts`.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: The source editing feature will now throw an error when used with real-time collaboration as these features are not fully compatible and may lead to data loss. You will have to explicitly enable source editing for real-time collaboration by setting the `sourceEditing.allowCollaborationFeatures` configuration flag to `true`. If you want to use both these features, please read a [new guide discussing the risks](https://ckeditor.com/docs/ckeditor5/latest/features/source-editing.html#limitations-and-incompatibility) and add the flag to your configuration.

## Update to CKEditor&nbsp;5 v41.0.0

Released on January 17, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v41.0.0))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v41.0.0.

### Breaking changes to the list plugin

As of the latest release, we replaced the existing list plugin (often referred to as "list v1") with the {@link features/lists newer and more advanced document list plugin}, formerly known as document list ("list v2").

We implemented the list v2 (document list) feature in 2022 to add support for block content in list items. It supported extending list markup via General HTML Support (GHS). It did not, however, support to-do lists. Since then we concentrated on bringing full list v1 functionality to this plugin. The newest release brings in the complete list functionality so we were ready to switch.

We introduced the new plugin in a manner that aims to be transparent for the users:

* We physically replaced the old plugin with the new one.
* But we left the namespace intact.

It means that starting with release v41.0.0 all imports of various list-related plugins will use the new version.

Unless you need to specifically use the old plugin in your integration, there is no need to make changes in the configuration.

If you do not want to use block elements in your lists, you can {@link features/lists-editing#simple-lists turn off this functionality} with the configuration option instead of sticking to the old plugins.

<info-box>
	We have replaced the old list plugins with the current ones.
</info-box>

#### Renaming of the plugins

With the new version becoming the default, the `DocumentList` plugin (and all related plugins, [see the table below](#details-of-plugin-renames)) was renamed to `List`. The old plugin was renamed to `LegacyList` instead. The same applies to all other list-related plugins, namely: `LegacyListProperties`, and `LegacyTodoList`.

If you included document lists in your integration and used the `removePlugins` option to exclude the old list plugin, it could lead to errors, such as these:

```
	❌ CKEditorError: plugincollection-required {"plugin":"List","requiredBy":"DocumentList"}
	Read more: https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required
```

This is because your integration was injecting `DocumentList` and `DocumentListProperties` plugins, and passing the `removePlugins: [ List, ListProperties, TodoList ]` configuration option. After the change and renaming of the plugins, these two are the same.

If you happen to encounter this error, remove all imports of `DocumentList` and related plugins as well as the `removePlugins` configuration option. Replace these with `List` and related plugins.

#### Details of plugin renames

<table>
	<thead>
		<tr>
			<th>Previous version</th>
			<th>Current version</th>
			<th>Comments</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th colspan="3">Official plugins</th>
		</tr>
		<tr>
			<td><code>DocumentList</code></td>
			<td>{@link module:list/list~List `List`}</td>
			<td>Plugin renamed</td>
		</tr>
		<tr>
			<td><code>DocumentListProperties</code></td>
			<td>{@link module:list/listproperties~ListProperties `ListProperties`}</td>
			<td>Plugin renamed</td>
		</tr>
		<tr>
			<td><code>TodoDocumentList</code></td>
			<td>{@link module:list/todolist~TodoList `TodoList`}</td>
			<td>Plugin renamed</td>
		</tr>
		<tr>
			<td><code>AdjacentListsSupport</code></td>
			<td>{@link module:list/list/adjacentlistssupport~AdjacentListsSupport `AdjacentListsSupport`}</td>
			<td>Changed import path</td>
		</tr>
		<tr>
			<th colspan="3">Backward compatibility plugins</th>
		</tr>
		<tr>
			<td>-</td>
			<td>`DocumentList`</td>
			<td>Alias for the {@link module:list/list~List `List`} plugin</td>
		</tr>
		<tr>
			<td>-</td>
			<td>`DocumentListProperties`</td>
			<td>Alias for the {@link module:list/listproperties~ListProperties `ListProperties`} plugin</td>
		</tr>
		<tr>
			<td>-</td>
			<td>`TodoDocumentList`</td>
			<td>Alias for the {@link module:list/todolist~TodoList `TodoList`} plugin</td>
		</tr>
		<tr>
			<th colspan="3">Legacy plugins</th>
		</tr>
		<tr>
			<td><code>List</code></td>
			<td>{@link module:list/legacylist~LegacyList `LegacyList`}</td>
			<td>Plugin renamed</td>
		</tr>
		<tr>
			<td><code>ListProperties</code></td>
			<td>{@link module:list/legacylistproperties~LegacyListProperties `LegacyListProperties`}</td>
			<td>Plugin renamed</td>
		</tr>
		<tr>
			<td><code>TodoList</code></td>
			<td>{@link module:list/legacytodolist~LegacyTodoList `LegacyTodoList`}</td>
			<td>Plugin renamed</td>
		</tr>
		<tr>
			<th colspan="3">Removed deprecated plugin</th>
		</tr>
		<tr>
			<td><code>ListStyle</code></td>
			<td>-</td>
			<td>Use the {@link module:list/listproperties~ListProperties `ListProperties`} plugin instead.</td>
		</tr>
	</tbody>
</table>

#### Changes to list merging

With the old list plugin, it was possible to create two lists of the same type but with different styles next to each other. These lists did not merge. This functionality is still available in the `LegacyList`.

The current `List` plugin merges such lists. This can be handled by using the {@link features/lists-editing#merging-adjacent-lists `AdjacentListsSupport` plugin}. However, by design, it only works for pasted content or on data load. It does not support UI operations, which is a change from the previous behavior.

We want to use this opportunity and ask the users for feedback in [this GitHub issue](https://github.com/ckeditor/ckeditor5/issues/14478). If you use this kind of lists, feel free to share your opinion and suggestions on the current implementation.

### Icon paths changed

Among other changes, some icons were moved around the project. Check these changes if you use custom UI elements that call these icons.

The following icons were moved to the `@ckeditor/ckeditor5-core` package:
* `browse-files`
* `bulletedlist`
* `codeblock`
* `color-palette`
* `heading1`, `heading2`, `heading3`, `heading4`, `heading5`, `heading6`
* `horizontalline`
* `html`
* `indent`
* `next-arrow`
* `numberedlist`
* `outdent`
* `previous-arrow`
* `redo`
* `table`
* `todolist`
* `undo`

The following icons were moved to the `ckeditor5-collaboration` package:
* `paint-roller`
* `robot-pencil`
* `table-of-contents`
* `template`

### Exports renamed

Some export names were changed due to the possibility of name conflicts:

* We renamed the default export of `View` from the `@ckeditor/ckeditor5-engine` package to `EditingView`.
* We renamed the export of `Model` from the `@ckeditor/ckeditor5-ui` package to `ViewModel`.
* We renamed the default export of `UploadAdapter` from the `@ckeditor/ckeditor5-adapter-ckfinder` package to `CKFinderUploadAdapter`.
* We renamed the interface export of `Position` from the `@ckeditor/ckeditor5-utils` package to `DomPoint`.
* We moved the `findOptimalInsertionRange` function to the `Schema` class as a method within the `@ckeditor/ckeditor5-engine` package. The exported function of the same name from the `@ckeditor/ckeditor5-widget` package remains unchanged and should be used while creating features and widgets.

### Making CKEditor npm packages valid ECMAScript modules (ESM)

The code we distribute in the npm packages uses the [ECMAScript Module (ESM) syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (for example, `import X from 'y'`). Until now it was not fully compliant with the standard and the packages were not properly marked as ES modules. Sometimes this resulted in bundlers (like Vite) and other tools (such as Vitest) failing to build or run the projects containing CKEditor&nbsp;5. It required workarounds in their configuration.

This release fixes the ESM compatibility issues. CKEditor&nbsp;5 packages are now fully ESM-compliant and these workarounds are no longer needed.

### Added validation to the URL field in the link form

Until now, the form for adding a URL to the selected text accepted an empty value, leaving the `href` empty. We believe this is undesirable in most cases. We have added a validation to prevent adding a link if the field is empty.

However, if for some reason you want to allow empty links, you can do so using the new {@link module:link/linkconfig~LinkConfig#allowCreatingEmptyLinks `config.link.allowCreatingEmptyLinks`} configuration option added to the link plugin.

```diff
ClassicEditor
	.create( editorElement, {
	link: {
+		allowCreatingEmptyLinks: true
	}
	} )
	.then( ... )
	.catch( ... );
```

### UI migration to dialogs

#### The find and replace feature

Starting with v41.0.0, the UI of the {@link features/find-and-replace find and replace} feature displays by default in a {@link framework/architecture/ui-library#dialogs-and-modals dialog window}. Before, it was displayed in a dropdown panel. This change is meant to improve the overall user experience of the feature and allow content creators to make the most out of the available tools.

{@img assets/img/migration-to-dialogs-v41-find-and-replace.png 1610 The comparison of the find and replace UI before and after v41.0.0}

To bring the earlier user experience back, you can use the {@link module:find-and-replace/findandreplaceconfig~FindAndReplaceConfig `config.findAndReplace.uiType`} configuration option:

```diff
ClassicEditor
	.create( editorElement, {
+		findAndReplace: {
+			uiType: 'dropdown'
+		}
	} )
	.then( ... )
	.catch( ... );
```

##### Changes to the DOM structure

The migration from a dropdown panel to a dialog window brought some changes to the DOM structure of the UI. Customizations based on certain CSS selectors may not work anymore and may require adjustments.

* The UI header element (`div.ck-form__header`) is no longer available inside the form element (`form.ck-find-and-replace-form`). You should apply the CSS customizations to the {@link framework/architecture/ui-library#header header element} of the dialog instead (`.ck.ck-dialog .ck.ck-form__header`).
* The `fieldset.ck-find-and-replace-form__find` element was removed from the form element (`form.ck-find-and-replace-form`). Its contents were distributed between new containers:
	* The "Find in text" input field, and the "Previous result" and "Next result" buttons were moved to the `div.ck-find-and-replace-form__inputs` element.
	* The "Find" button was moved to the `div.ck-find-and-replace-form__actions` element.
* The `fieldset.ck-find-and-replace-form__replace` element was removed. Its contents were distributed between new containers:
	* The "Replace with" input field was moved to the `div.ck-find-and-replace-form__inputs` element.
	* The "Replace" and "Replace all" buttons were moved to the `div.ck-find-and-replace-form__actions` element.
* The "Advanced options" dropdown (rendered as the `div.ck-options-dropdown` element) was replaced with the {@link module:ui/collapsible/collapsibleview collapsible} component (rendered as the `div.ck-collapsible` element). Switch buttons inside ("Match case" and "Whole words only") remain unchanged.

#### The AI Assistant feature

Starting with v41.0.0, the UI of the {@link features/ai-assistant-overview AI assistant} feature will display by default in a {@link framework/architecture/ui-library#dialogs-and-modals dialog window}. It was displayed in the balloon panel before.

{@img assets/img/migration-to-dialogs-v41-ai-assistant.png 1610 The comparison of AI Assistant UI before and after v41.x}

##### Changes to the DOM structure

The migration from a dropdown panel to a dialog window brought some changes to the DOM structure of the UI. Customizations based on certain CSS selectors may not work anymore and may require adjustments.

* The UI header element (`div.ck-form__header`) is no longer available inside the form element (`form.ck-ai-form`). You should apply CSS customizations to the {@link framework/architecture/ui-library#header header element} of the dialog instead (`.ck.ck-dialog .ck.ck-form__header`).

### Major breaking changes in this release

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: From this release on, the UI of the AI Assistant feature is displayed in a dialog instead of a balloon. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: From this release on, the UI of the find and replace feature is displayed by default in a dialog instead of a dropdown. To bring the previous user experience back, you can use the [`config.findAndReplace.uiType`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html#member-findAndReplace) configuration option. See [#14973](https://github.com/ckeditor/ckeditor5/issues/14973).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `AdjacentListsSupport` plugin is moved from the `documentlist` directory to the `list` directory. See [#14942](https://github.com/ckeditor/ckeditor5/issues/14942).

### Minor breaking changes in this release

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
