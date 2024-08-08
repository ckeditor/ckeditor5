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

_Released on April 10, 2024._

For the entire list of changes introduced in version 41.3.0, see the [release notes for CKEditor&nbsp;5 v41.3.0](https://github.com/ckeditor/ckeditor5/releases/tag/v41.3.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v41.3.0.

### Legacy lists compatibility

As of this release, due to a bug that needed fixing, the {@link module:list/legacylist~LegacyList legacy lists plugin} (lists v1 ) is no longer compatible with the {@link features/paste-from-office paste from Office} feature. List items will be added as paragraphs instead. Please consider {@link updating/update-to-41#breaking-changes-to-the-list-plugin upgrading to the modern list plugin} to avoid it.


## Update to CKEditor&nbsp;5 v41.0.0

_Released on January 17, 2024._

For the entire list of changes introduced in version 41.0.0, see the [release notes for CKEditor&nbsp;5 v41.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v41.0.0).

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
			<td>{@link module:list/documentlist~DocumentList `DocumentList`}</td>
			<td>Alias for the {@link module:list/list~List `List`} plugin</td>
		</tr>
		<tr>
			<td>-</td>
			<td>{@link module:list/documentlistproperties~DocumentListProperties `DocumentListProperties`}</td>
			<td>Alias for the {@link module:list/listproperties~ListProperties `ListProperties`} plugin</td>
		</tr>
		<tr>
			<td>-</td>
			<td>{@link module:list/tododocumentlist~TodoDocumentList `TodoDocumentList`}</td>
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
