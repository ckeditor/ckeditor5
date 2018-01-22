---
title: Text alignment
category: features
---

{@snippet features/build-text-alignment-source}

The {@link module:alignment/alignment~Alignment} feature enables support for alignments.

## Demo

{@snippet features/text-alignment}

## Configuring alignment options

It is, of course, possible to configure which alignment options the editor should support. Use the {@link module:alignment/alignmentediting~AlignmentEditingConfig#styles `alignment.styles`} configuration option to do so (you can choose from `'left'`, `'right'`, `'center'` and `'justify'`,  but `'left'` should be always included).

For example, the following editor will support only two alignment to the left and to the right:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		alignment: {
			styles: [ 'left', 'right' ]
		},
		toolbar: [
			'headings', 'bulletedList', 'numberedList', 'alignmentDropdown', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-text-alignment-options}

## Configuring the toolbar

You can choose to use the alignment dropdown (`'alignmentDropdown'`) or configure the toolbar to use separate buttons for each of the styles:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [
			'headings', 'alignLeft', 'alignRight', 'alignCenter', 'alignJustify'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-text-alignment-toolbar}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-alignment`](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment) package:

```
npm install --save @ckeditor/ckeditor5-alignment
```

And add it to your plugin list and toolbar configuration:

```js
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Alignment, ... ],
		toolbar: [ 'alignmentDropdown', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/development/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:alignment/alignment~Alignment} plugin registers:

* Dropdown: `'alignmentDropdown'`.
* Buttons and commands: `'alignLeft'`, `'alignRight'`, `'alignCenter'`, `'alignJustify'`.

	The number of options and their names are based on the {@link module:alignment/alignmentediting~AlignmentEditingConfig#styles `alignment.styles`} configuration option).

	You can align the currently selected block(s) by executing one of these commands:

	```js
	editor.execute( 'alignCenter' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-alignment.
