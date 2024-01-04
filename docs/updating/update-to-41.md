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

As of the latest release, the current list plugin (often referred to as list v1) has been replaced with the {@link features/lists newer and more advanced document list plugin}, formerly known as document list (v2).

The list v2 (document list) feature was implemented in 2022 to add support for block content in list items. It supported extending list markup via GHS. It did not, however, support to-do lists back then. We concentrated on bringing full list v1 functionality to this plugin. The newest release brings in the to-do list functionality and the {@link features/lists-editing#simple-lists simple list} configuration setting.

We introduced the new plugin in a manner that aims to be transparent for our users, namely by physically replacing the old plugin with the new one, but retaining all namespace intact. It means, starting with release v.41.0.0 all imports of various lists-related plugins will use the new version.

Unless you need to specifically use the old plugin in your integration, there is no need to make changes in the configuration.

If you do not want to utilize block elements in your lists, you can simply turn off this functionality with the {@link features/lists-editing#simple-lists simple list setting} instead of sticking to the old plugins.

#### Renaming of the plugins

With the new version becoming default, the `DocumentList` plugin (and all related plugins, [observe the table below](#details-of-plugin-renames)) has been renamed to simply `List`. The old plugin has been renamed to `LegacyList` instead. The same applies to all other list-related plugins, namely: `LegacyListProperties`, and `LegacyTodoList`.

If you previously included document lists in your integration and used the `removePlugins` option to exclude the old list plugin, it could lead to errors, such as these:

```
  ❌ CKEditorError: plugincollection-required {"plugin":"List","requiredBy":"DocumentList"}
    Read more: https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required
```

This is because it was injecting `DocumentList` and `DocumentListProperties` plugins and passing the `removePlugins: [ List, ListProperties, TodoList ]` configuration option. After the change and renaming of the plugins, these two are the same.

If you happen to encounter this error, please remove all imports of `DocumentList` and related plugins as well as the `removePlugins` configuration option and replace these with `List` and related plugins.

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

### Icons paths changed

Among other changes, some icons have been moved around the project. Observe these changes if you use custom UI elements that call these icons.

The following icons were moved to the `@ckeditor/ckeditor5-core` package: `browse-files`, `bulletedlist`, `codeblock`, `color-palette`, `heading1`, `heading2`, `heading3`, `heading4`, `heading5`, `heading6`, `horizontalline`, `html`, `indent`, `next-arrow`, `numberedlist`, `outdent`, `previous-arrow`, `redo`, `table`,`todolist`, `undo`.


### Exports renaming

Some exports names were changed due to possibility of name conflicts:

* We renamed the default export of `View` from the `@ckeditor/ckeditor5-engine` package to `EditingView`,
* We renamed the default export of `UploadAdapter` from the `@ckeditor/ckeditor5-adapter-ckfinder` package to `CKFinderUploadAdapter`,
* We renamed the interface export of `Position` from the `@ckeditor/ckeditor5-utils` package to `DomPoint`,
* We moved the `findOptimalInsertionRange` function to the `Schema` class as a method within the `@ckeditor/ckeditor5-engine` package.

### Making CKEditor npm packages valid ES Modules

The code we distribute in our npm packages uses the [ES Module syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (for example `import X from 'y'`). Until now it was not fully compliant with the standard and the packages were not properly marked as ES module. In some cases this resulted in bundlers (like Vite) and other tools (such as Vitest) failing to build or run the projects containing CKEditor 5.  It required workarounds in their configuration.

In this release we fix these issues, meaning that our packages are now fully ESM compliant and these workarounds are no longer needed.
