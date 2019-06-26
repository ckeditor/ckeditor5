---
title: Block indentation
category: features
---

{@snippet features/build-indent-block-source}

## Demo

The block indentation feature allows to set indentation of text blocks like paragraphs or headings.

{@snippet features/indent-block}

## Configuring the block indentation feature

### Using offset and unit

By default the block indentation is controlled by setting the indentation step offset and unit. Executing indent (or outdent) commands will increase (or decreas) current block indentation by given offset.

The editor ind the {@link features/indent-block#demo demo} section was configured using offset and unit:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [ 'heading', '|', 'indent', 'outdent', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
		},
		indentBlock: {
			offset: 50,
			unit: 'px'
		}
	} )
	.then( ... )
	.catch( ... );
```

### Using CSS classes

Alternatively the block indentation feature can be configured to set indentation by applying one of defined CSS classes:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [ 'heading', '|', 'indent', 'outdent', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
		},
		indentBlock: {
			classes: [
				'custom-block-indent-a', // First step - smallest indentation.
				'custom-block-indent-b',
				'custom-block-indent-c',
				'custom-block-indent-d',
				'custom-block-indent-e'  // Last step - biggest indentation.
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

The editor will restrict indentation levels to a set of provided classes. The biggest indentation is the class that has last index in the array.

In the demo below the CSS classes are defined as follows:

```css
	.custom-block-indent-a {
		margin-left: 10%;
	}

	.custom-block-indent-b {
		margin-left: 20%;
	}

	.custom-block-indent-c {
		margin-left: 30%;
	}

	.custom-block-indent-d {
		margin-left: 40%;
	}

	.custom-block-indent-e {
		margin-left: 50%;
	}
```

{@snippet features/custom-indent-block-classes}

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-indent-block`](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent-block) package:

```bash
npm install --save @ckeditor/ckeditor5-indent-block
```

Then add it to your plugin list and the toolbar configuration:

```js
import Font from '@ckeditor/ckeditor5-indent/src/indentblock';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ IndentBlock, ... ],
		toolbar: [ 'indent', 'outdent', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:indent/indentblock~IndentBlock} plugin registers the following components:

* The {@link module:indent/indentblockcommand~IndentBlockCommand `'indentBlock'`} command.

	You can increase block indentation in which the selection is set by:

	```js
	editor.execute( 'indentBlock' );
	```

* The {@link module:indent/indentblockcommand~IndentBlockCommand `'outdentBlock'`} command.

	You can decrease block indentation in which the selection is set by:

	```js
	editor.execute( 'outdentBlock' );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-font.
