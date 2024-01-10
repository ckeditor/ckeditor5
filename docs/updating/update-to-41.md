---
category: update-guides
meta-title: Update to version 41.x | CKEditor 5 Documentation
menu-title: Update to v41.x
order: 83
modified_at: 2024-01-02
---

# Update to CKEditor&nbsp;5 v41.x

<info-box>
	When updating your CKEditor&nbsp;5 installations, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v41.0.0

For the entire list of changes introduced in version 41.0.0, see the [release notes for CKEditor&nbsp;5 v41.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v41.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v41.0.0.

### Breaking changes to the list plugin

As of the latest release, we replaced the existing list plugin (often referred to as "list v1") with the {@link features/lists newer and more advanced document list plugin}, formerly known as document list ("list v2").

We implemented the list v2 (document list) feature in 2022 to add support for block content in list items. It supported extending list markup via General HTML Support (GHS). It did not, however, support to-do lists. Since then we concentrated on bringing full list v1 functionality to this plugin. The newest release brings in the to-do list functionality so we were ready to switch.

We introduced the new plugin in a manner that aims to be transparent for the users:

* We physically replaced the old plugin with the new one.
* But we left the namespace intact.

It means that starting with release v41.0.0 all imports of various list-related plugins will use the new version.

Unless you need to specifically use the old plugin in your integration, there is no need to make changes in the configuration.

If you do not want to use block elements in your lists, you can {@link features/lists-editing#simple-lists turn off this functionality} with the configuration option instead of sticking to the old plugins.

#### Renaming of the plugins

With the new version becoming the default, the `DocumentList` plugin (and all related plugins, [see the table below](#details-of-plugin-renames)) was renamed to `List`. The old plugin was renamed to `LegacyList` instead. The same applies to all other list-related plugins, namely: `LegacyListProperties`, and `LegacyTodoList`.

If you included document lists in your integration and used the `removePlugins` option to exclude the old list plugin, it could lead to errors, such as these:

```
  ❌ CKEditorError: plugincollection-required {"plugin":"List","requiredBy":"DocumentList"}
    Read more: https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required
```

This is because your integration was injecting `DocumentList` and `DocumentListProperties` plugins, and passing the `removePlugins: [ List, ListProperties, TodoList ]` configuration option. After the change and renaming of the plugins, these two are the same.

If you happen to encounter this error, remove all imports of `DocumentList` and related plugins as well as the `removePlugins` configuration option. Replace these with `List` and related plugins.

<info-box>
    We have replaced the old list plugins in all {@link installation/getting-started/predefined-builds predefined builds} with the current ones.
</info-box>

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

### Exports renamed

Some export names were changed due to the possibility of name conflicts:

* We renamed the default export of `View` from the `@ckeditor/ckeditor5-engine` package to `EditingView`.
* We renamed the export of `Model` from the `@ckeditor/ckeditor5-ui` package to `ViewModel`.
* We renamed the default export of `UploadAdapter` from the `@ckeditor/ckeditor5-adapter-ckfinder` package to `CKFinderUploadAdapter`.
* We renamed the interface export of `Position` from the `@ckeditor/ckeditor5-utils` package to `DomPoint`.
* We moved the `findOptimalInsertionRange` function to the `Schema` class as a method within the `@ckeditor/ckeditor5-engine` package. The exported function of the same name from the `@ckeditor/ckeditor5-widget` package remains unchanged and should be used while creating features and widgets.

### Making CKEditor npm packages valid ECMAScript modules (ESM)

The code we distribute in our npm packages uses the [ECMAScript Module (ESM) syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (for example, `import X from 'y'`). Until now it was not fully compliant with the standard and the packages were not properly marked as ES modules. Sometimes this resulted in bundlers (like Vite) and other tools (such as Vitest) failing to build or run the projects containing CKEditor&nbsp;5. It required workarounds in their configuration.

This release fixes the ESM-compatibility issues. CKEditor&nbsp;5 packages are now fully ESM-compliant and these workarounds are no longer needed.

### Added validation to the URL field in the link form

Until now, the form for adding a URL to the selected text accepted an empty value, leaving the `href` empty. We believe this is undesirable in most cases. We have added a validation to prevent adding a link if the field is empty.

However, if for some reason you want to allow empty links, you can do so using the new {@link module:link/linkconfig~LinkConfig#allowCreatingEmptyLinks `config.link.allowCreatingEmptyLinks`} configuration option added to the link plugin.

```diff
ClassicEditor
  .create( editorElement, {
    link: {
+      allowCreatingEmptyLinks: true
    }
  } )
  .then( ... )
  .catch( ... );
```
