---
title: Restricted editing
menu-title: Restricted editing
category: features
---

{@snippet features/build-restricted-editing-source}

The ...

## Demo

The demo below works in two modes: "Standard Editing Mode" and "Restricted Editing Mode". Using the radio buttons below you can switch between modes.

{@snippet features/restricted-editing}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-restricted-editing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing) package:

```bash
npm install --save @ckeditor/ckeditor5-restricted-editing
```

### Running the Standard Editing Mode

And add it to your plugin list and the toolbar configuration:

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

### Running the Restricted Editing Mode

And add it to your plugin list and the toolbar configuration:

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

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-restricted-editing.
