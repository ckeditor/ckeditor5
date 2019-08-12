---
title: Block indentation
category: features
---

{@snippet features/build-indent-source}

## Demo

The indentation feature allows to set indentation of text blocks like paragraphs or headings and lists.

{@snippet features/indent}

## Configuring the block indentation feature

### Using offset and unit

By default, the block indentation feature increases or decreases the current indentation by the given offset, using the given unit.

The editor used in the {@link features/indent#demo demo} section above uses the default configuration, which defines a `40px` indentation step.

You can change that value to, for example, `1em`:

```js
import Indent from '@ckeditor/ckeditor5-indent/src/indent';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Indent, ... ],
		toolbar: {
			items: [ 'heading', '|', 'outdent', 'indent', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
		},
		indentBlock: {
			offset: 1,
			unit: 'em'
		}
	} )
	.then( ... )
	.catch( ... );
```

### Using CSS classes

Alternatively, the block indentation feature can be configured to set indentation by applying one of defined CSS classes:

```js
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Indent, IndentBlock, ... ],
		toolbar: {
			items: [ 'heading', '|', 'outdent', 'indent', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
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

<info-box>
	Note that for <abbr title="right-to-left">RTL</abbr> content, `'margin-right'` should be used instead. Learn more about {@link features/ui-language#setting-the-language-of-the-content configuring language of the editor content}.
</info-box>

{@snippet features/custom-indent-block-classes}

## Indenting lists

The same set of buttons (`outdent`, `indent`), besides controlling block indentation, allows indenting list items (nesting them). This is completely transparent to the user.

From the code perspective, the buttons are implemented by the {@link module:indent/indent~Indent} plugin, but neither those buttons nor respective commands implement any functionality by default.

The target behavior comes in two other plugins:

* {@link module:indent/indentblock~IndentBlock} &mdash; The indent block feature controls the indentation of elements such as paragraphs and headings.
* {@link module:list/list~List} &mdash; The list feature implements the indentation (nesting) of lists.

This means, that if you want to allow indenting lists only, you can do that by load only the `Indent` and `List` plugins. If you want the full behavior, you need to load all 3 plugins.

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-indent`](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent) package:

```bash
npm install --save @ckeditor/ckeditor5-indent
```

Then add it to your plugin list and the toolbar configuration:

```js
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Indent, IndentBlock, ... ],
		toolbar: [ 'outdent', 'indent', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:indent/indent~Indent} plugin registers the following components:

* The `'indent'` command.

	Note, this command does not implement any behavior itself. It executes either `indentBlock` (described below) or `indentList`, depending on which of these commands is enabled.

	Read more in the [Indenting lists](#indenting-lists) section above.

* The `'outdent'` command.

	Note, this command does not implement any behavior itself. It executes either `outdentBlock` (described below) or `outdentList`, depending on which of these commands is enabled.

	Read more in the [Indenting lists](#indenting-lists) section above.

The {@link module:indent/indentblock~IndentBlock} plugin registers the following components:

* The {@link module:indent/indentblockcommand~IndentBlockCommand `'indentBlock'`} command.

	You can increase the indentation of the block in which the selection is set by:

	```js
	editor.execute( 'indentBlock' );
	```

* The {@link module:indent/indentblockcommand~IndentBlockCommand `'outdentBlock'`} command.

	You can decrease the indentation of the block in which the selection is set by:

	```js
	editor.execute( 'outdentBlock' );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-font.
