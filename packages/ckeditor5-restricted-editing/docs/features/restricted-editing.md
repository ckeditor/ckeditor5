---
title: Restricted editing
menu-title: Restricted editing
category: features
---

The restricted editing feature allows you to define which parts of a document can be editable for a group of users who have more restricted editing rights.

In order to do that, this feature introduces two editing modes:

* **Standard editing mode** &ndash; In this mode the user can freely edit the content and choose regions that should be editable in the restricted editing mode.
* **Restricted editing mode** &ndash; When the editor is initialized in this mode, the user can only edit the content within the regions chosen by the user in the standard editing mode.

You can imagine a workflow in which a certain group of users is responsible for creating templates of documents while a second group of users can only fill the gaps (for example, fill the missing data, like names, dates, product names, etc.).

By using this feature, the users of your application will be able to create template documents. In a certain way, this feature could be used to generate forms with rich-text capabilities.

<info-box>
	See also the {@link features/read-only read-only feature} that lets you turn the entire WYSIWYG editor into read-only mode.
</info-box>

## Demo

The demo below allows you to emulate both modes. You can start from creating a template of the document in the standard editing mode.

Then you can switch to the restricted editing mode to see how the editable and non-editable regions behave.

<info-box>
	Tip: Use <kbd>Tab</kbd> to navigate from one editable region to another (and <kbd>Shift</kbd>+<kbd>Tab</kbd> to move back) in the restricted mode.
</info-box>

{@snippet features/restricted-editing}

## Configuration

It is possible to configure which features should be available in the restricted mode. For instance, the following configuration will not only allow typing and deleting but also bolding text.

```js
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bold, RestrictedEditingMode, ... ],
		toolbar: [ 'bold', '|', 'restrictedEditing', ... ],
		restrictedEditing: {
			allowedCommands: [ 'bold' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

**Note**: Typing and deleting text is always possible in restricted editing regions. For more information check {@link module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig} documentation.

## Installation

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
		plugins: [ StandardEditingMode, ... ],
		toolbar: [ 'restrictedEditingException', ... ]
	} )
	.then( ... )
	.catch( ... );
```

### Running the restricted editing mode

In order to initialize the editor in the restricted editing mode, add the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin and add the `'restrictedEditing'` button to the toolbar:

```js
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ RestrictedEditingMode, ... ],
		toolbar: [ 'restrictedEditing', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin registers:

* The `'restrictedEditingException'` button that allows marking regions as editable.
* The {@link module:restricted-editing/restrictededitingexceptioncommand~RestrictedEditingExceptionCommand `'restrictedEditingException'`} command that allows marking regions as editable.

The {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin registers:

* The `'restrictedEditing'` dropdown that allows navigating between editable regions.
* The {@link module:restricted-editing/restrictededitingmodenavigationcommand~RestrictedEditingModeNavigationCommand `'goToPreviousRestrictedEditingException'`} and `'goToNextRestrictedEditingException'` commands that allow navigating between editable regions.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Real-time collaboration

When using [real-time collaboration](https://ckeditor.com/collaboration/real-time-collaborative-editing/), all the connected users should always be in the same mode. It is not possible to have a different list of plugins enabled among users of a single collaborative session.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-restricted-editing.
