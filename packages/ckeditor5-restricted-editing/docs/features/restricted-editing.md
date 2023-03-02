---
title: Restricted editing
menu-title: Restricted editing
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
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

The restricted editing feature enables two editing modes:

* **Standard editing mode** &ndash; In this mode the user can freely edit the content and choose regions that should be editable in the restricted editing mode.
* **Restricted editing mode** &ndash; When the editor is initialized in this mode, the user can only edit the content within the regions chosen by the user in the standard editing mode.

You can imagine a workflow in which a certain group of users is responsible for creating templates of documents while a second group of users can only fill the gaps (for example, fill the missing data, like names, dates, product names, etc.).

By using this feature, the users of your application will be able to create template documents. In a certain way, this feature could be used to generate forms with rich-text capabilities. This kind of practical application is shown in the [How to create ready-to-print documents with CKEditor 5 pagination feature](https://ckeditor.com/blog/How-to-create-ready-to-print-documents-with-page-structure-in-WYSIWYG-editor---CKEditor-5-pagination-feature/) blog post.

<info-box>
	See also the {@link features/read-only read-only feature} that lets you turn the entire WYSIWYG editor into read-only mode. You can also read the [dedicated blog post](https://ckeditor.com/blog/feature-of-the-month-restricted-editing-modes/) about write-restricted editor modes.
</info-box>

## Configuration

It is possible to configure which features should be available in the restricted mode. For instance, the following configuration will not only allow typing and deleting but also bolding text.

```js
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

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

**Note**: Typing and deleting text is always possible in restricted editing regions. For more information, check out the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig `config.restrictedEditing`} documentation.

### Enabling commands in the restricted editing mode

The restricted editing mode allows modifying the editor content only in designated regions. Outside these regions, most of the editor commands are disabled by default. If you wish to enable some commands outside the restricted editing regions you can use the {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing#enableCommand `RestrictedEditingModeEditing.enableCommand()`} method. This method must be executed in the {@link module:core/plugin~PluginInterface#afterInit `afterInit()`} callback of an editor plugin.

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class MyPlugin extends Plugin {
	afterInit() {
		this.editor.plugins.get( 'RestrictedEditingModeEditing' ).enableCommand( 'myCommand' );
	}
}
```

## Installation

<info-box info>
	The restricted editing feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-restricted-editing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing) package:

```plaintext
npm install --save @ckeditor/ckeditor5-restricted-editing
```

### Running the standard editing mode

In order to initialize the editor in the standard editing mode, add the {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin and add the `'restrictedEditingException'` button to the toolbar:

```js
import StandardEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ StandardEditingMode, /* ... */ ],
		toolbar: [ 'restrictedEditingException', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Running the restricted editing mode

In order to initialize the editor in the restricted editing mode, add the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin and add the `'restrictedEditing'` button to the toolbar:

```js
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ RestrictedEditingMode, /* ... */ ],
		toolbar: [ 'restrictedEditing', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Related features

CKEditor 5 has more features that help you control user permissions:

* {@link features/read-only Read-only} &ndash; Turn the entire content of the editor read-only.
* {@link features/track-changes Track changes} &ndash; User changes are marked in the content and shown as suggestions in the sidebar for acceptance or rejection.
* {@link features/comments Comments} &ndash; Users can add comments to any part of the content instead of editing it directly.

<info-box>
	Read this [CKEditor Ecosystem blog post](https://ckeditor.com/blog/How-to-create-ready-to-print-documents-with-page-structure-in-WYSIWYG-editor---CKEditor-5-pagination-feature/) on how to couple restricted editing with other features to create editable document templates.
</info-box>

## Common API

The {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin registers:

* The `'restrictedEditingException'` button that lets you mark regions as editable.
* The {@link module:restricted-editing/restrictededitingexceptioncommand~RestrictedEditingExceptionCommand `'restrictedEditingException'`} command that allows marking regions as editable.

The {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin registers:

* The `'restrictedEditing'` dropdown that lets you navigate between editable regions.
* The {@link module:restricted-editing/restrictededitingmodenavigationcommand~RestrictedEditingModeNavigationCommand `'goToPreviousRestrictedEditingException'`} and `'goToNextRestrictedEditingException'` commands that allow navigating between editable regions.

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Real-time collaboration

When using [real-time collaboration](https://ckeditor.com/collaboration/real-time-collaborative-editing/), all the connected users should always be in the same mode. It is not possible to have a different list of plugins enabled among users of a single collaborative session.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-restricted-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-restricted-editing).
