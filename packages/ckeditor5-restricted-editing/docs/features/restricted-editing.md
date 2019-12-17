---
title: Restricted editing
menu-title: Restricted editing
category: features
---

The restricted editing feature allows you to define which parts of a document should be editable for a group of users who should have a more restricted editing rights.

In order to do that, this feature introduces two editing modes:

* **Standard editing mode** &mdash; in this mode the user can freely edit the content and choose regions which should be editable in the second mode &mdash; the restricted mode.
* **Restricted editing mode** &mdash; when the editor is initialized in this mode the user can only edit the content within the regions chosen by the user in the previous mode.

You can imagine a workflow in which a certain group of users is responsible for creating templates of documents while a second group of users can only fill the gaps (for example, fill missing data, like names, dates, product names, etc.).

By using this feature users of your application will be able to create template documents. In a certain way, this feature could be used to generate forms with rich-text capabilities.

## Demo

The demo below allows you to emulate both modes. You can first create a template of the document in the standard editing mode.

Then you can switch to the restricted editing mode to see how the editable regions and non-editable regions behaves.

<info-box>
	Tip: Use <kbd>Tab</kbd> to navigate from one editable region to another (and <kbd>Shift</kbd>+<kbd>Tab</kbd> to move back) in the restricted mode.
</info-box>

{@snippet features/restricted-editing}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-restricted-editing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing) package:

```bash
npm install --save @ckeditor/ckeditor5-restricted-editing
```

### Running the standard editing mode

In order to initialize the editor in the standard editing mode add the {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin and add the `'restrictedEditingException'` button to the toolbar:

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

In order to initialize the editor in the restricted editing mode add the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin and add the `'restrictedEditing'` button to the toolbar:

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

* The `'restrictedEditingException'` button which allows marking regions to be editable.
* The {@link module:restricted-editing/restrictededitingexceptioncommand~RestrictedEditingExceptionCommand `'restrictedEditingException'`} command which allows marking regions to be editable..

The {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin registers:

* The `'restrictedEditing'` dropdown which allows navigating between editable regions.
* The {@link module:restricted-editing/restrictededitingmodenavigationcommand~RestrictedEditingModeNavigationCommand `'goToPreviousRestrictedEditingException'`} and `'goToNextRestrictedEditingException'` commands which allow navigating between editable regions.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Real-time collaboration

When using the real-time collaboration, all the connected users should be always in the same mode. It is not possible to have different list of plugins among users of a single collaborative session.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-restricted-editing.
