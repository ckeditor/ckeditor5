---
title: Restricted editing
menu-title: Restricted editing
meta-title: Restricted editing | CKEditor 5 Documentation
category: features
---

The restricted editing feature introduces two modes: the standard editing mode and the restricted editing mode. Users working in the restricted editing mode cannot change the content, except for parts marked as editable.

## Demo

The demo below lets you emulate both the standard editing mode and the restricted editing mode.

Start by creating a template of the document in the standard editing mode. Select a section of the text and use the enable editing toolbar button {@icon @ckeditor/ckeditor5-restricted-editing/theme/icons/contentunlock.svg Enable editing} to turn a selected area into an editable region or remove an existing one.

Then switch to the restricted editing mode to see how the editable and non-editable regions behave.

<info-box>
	Tip: Use <kbd>Tab</kbd> to navigate from one editable region to another (and <kbd>Shift</kbd>+<kbd>Tab</kbd> to move back) in the restricted mode.
</info-box>

{@snippet features/restricted-editing}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

The restricted editing feature enables two editing modes:

* **Standard editing mode** &ndash; In this mode the user can edit the content and choose regions that should be editable in the restricted editing mode.
* **Restricted editing mode** &ndash; When you initialize the editor in this mode, the user can edit the content only within the regions chosen by the user in the standard editing mode.

You can imagine a workflow where a certain group of users is responsible for creating templates of documents. At the same time, a second group of users can only fill the gaps (for example, fill in the missing data, like names, dates, product names, etc.).

By using this feature, the users of your application will be able to create template documents. In a certain way, you can use this feature to generate forms with rich-text capabilities. This kind of practical application is shown in the [How to create ready-to-print documents with CKEditor&nbsp;5 pagination feature](https://ckeditor.com/blog/How-to-create-ready-to-print-documents-with-page-structure-in-WYSIWYG-editor---CKEditor-5-pagination-feature/) blog post.

<info-box>
	See also the {@link features/read-only read-only feature} that lets you turn the entire WYSIWYG editor into read-only mode. You can also read the [dedicated blog post](https://ckeditor.com/blog/feature-of-the-month-restricted-editing-modes/) about write-restricted editor modes.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration.

### Running the standard editing mode

To initialize the editor in the standard editing mode, add the {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin and add the `'restrictedEditingException'` button to the toolbar:

```js
import { ClassicEditor, StandardEditingMode } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ StandardEditingMode, /* ... */ ],
		toolbar: [ 'restrictedEditingException', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Running the restricted editing mode

To initialize the editor in the restricted editing mode, add the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin and add the `'restrictedEditing'` button to the toolbar:

```js
import { ClassicEditor, RestrictedEditingMode } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ RestrictedEditingMode, /* ... */ ],
		toolbar: [ 'restrictedEditing', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuration

You can configure which features should be available in the restricted mode. For instance, the following configuration allows the users to type, delete but also to bold text.

```js
import { ClassicEditor, RestrictedEditingMode, Bold } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bold, RestrictedEditingMode, /* ... */ ],
		toolbar: [ 'bold', '|', 'restrictedEditing', /* ... */ ],
		restrictedEditing: {
			allowedCommands: [ 'bold' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

**Note**: Typing and deleting text is always possible in restricted editing regions. For more information, check out the {@link module:restricted-editing/restrictededitingconfig~RestrictedEditingConfig `config.restrictedEditing`} documentation.

### Enabling commands in the restricted editing mode

The restricted editing mode allows modifying the editor content only in designated regions. Outside these regions, most of the editor commands are turned off by default. If you wish to enable some commands outside the restricted editing regions, you can use the {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing#enableCommand `RestrictedEditingModeEditing.enableCommand()`} method. You must execute this method in the {@link module:core/plugin~PluginInterface#afterInit `afterInit()`} callback of an editor plugin.

```js
import { ClassicEditor, Plugin } from 'ckeditor5';

class MyPlugin extends Plugin {
	afterInit() {
		this.editor.plugins.get( 'RestrictedEditingModeEditing' ).enableCommand( 'myCommand' );
	}
}
```

## Related features

CKEditor&nbsp;5 has more features that help you control user permissions:

* {@link features/read-only Read-only} &ndash; Turn the entire content of the editor read-only.
* {@link features/track-changes Track changes} &ndash; Mark user changes in the content and show them as suggestions in the sidebar for acceptance or rejection.
* {@link features/comments Comments} &ndash; Users can add comments to any part of the content instead of editing it directly.

<info-box>
	Read this [CKEditor blog post](https://ckeditor.com/blog/How-to-create-ready-to-print-documents-with-page-structure-in-WYSIWYG-editor---CKEditor-5-pagination-feature/) on how to couple restricted editing with other features to create editable document templates.
</info-box>

## Common API

The {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin registers:

* The `'restrictedEditingException'` button that lets you mark regions as editable.
* The {@link module:restricted-editing/restrictededitingexceptioncommand~RestrictedEditingExceptionCommand `'restrictedEditingException'`} command that allows marking regions as editable.

The {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin registers:

* The `'restrictedEditing'` dropdown that lets you navigate between editable regions.
* The {@link module:restricted-editing/restrictededitingmodenavigationcommand~RestrictedEditingModeNavigationCommand `'goToPreviousRestrictedEditingException'`} and `'goToNextRestrictedEditingException'` commands that allow navigating between editable regions.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Real-time collaboration

When using [real-time collaboration](https://ckeditor.com/collaboration/real-time-collaborative-editing/), all the connected users should always be in the same mode. You cannot have a different list of plugins enabled among users of a single collaborative session.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-restricted-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-restricted-editing).
