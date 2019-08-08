---
title: Text alignment
category: features
---

{@snippet features/build-text-alignment-source}

The {@link module:alignment/alignment~Alignment} feature enables support for text alignment. You can use it to align your content to left, right and center or to justify it.

## Demo

{@snippet features/text-alignment}

## Configuring alignment options

It is possible to configure which alignment options are available in the editor by setting the {@link module:alignment/alignment~AlignmentConfig#options `alignment.options`} configuration option. You can choose from `'left'`, `'right'`, `'center'` and `'justify'`.

<info-box>
	Note that the `'left'` option should always be included for the <abbr title="left–to–right">LTR</abbr> content. Similarly, the `'right'` option should always be included for the <abbr title="right-to-left">RTL</abbr> content. Learn more about {@link features/ui-language#setting-the-language-of-the-content configuring language of the editor content}.
</info-box>

For example, the following editor will support only two alignment options: to the left and to the right:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		alignment: {
			options: [ 'left', 'right' ]
		},
		toolbar: [
			'heading', '|', 'bulletedList', 'numberedList', 'alignment', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-text-alignment-options}

## Configuring the toolbar

You can choose to use the alignment dropdown (`'alignment'`) or configure the toolbar to use separate buttons for each of the options:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [
			'heading', '|', 'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-text-alignment-toolbar}

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-alignment`](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment) package:

```bash
npm install --save @ckeditor/ckeditor5-alignment
```

And add it to your plugin list and toolbar configuration:

```js
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Alignment, ... ],
		toolbar: [ 'alignment', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:alignment/alignment~Alignment} plugin registers:

* Dropdown: `'alignment'`.
* Buttons: `'alignment:left'`, `'alignment:right'`, `'alignment:center'`, `'alignment:justify'`.

	The number of options and their names are based on the {@link module:alignment/alignment~AlignmentConfig#options `alignment.options`} configuration option).

* Command: `'alignment'`:

	You can align the currently selected block(s) by executing one of these commands:

	```js
	editor.execute( 'alignment', { value: 'center' } );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-alignment.
