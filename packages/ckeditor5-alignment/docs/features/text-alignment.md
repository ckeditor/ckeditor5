---
title: Text alignment
category: features
---

{@snippet features/build-text-alignment-source}

The alignment feature lets you align your content to the left or right as well as center or justify it.

## Demo

Click inside a paragraph or a header and use the toolbar dropdown {@icon @ckeditor/ckeditor5-core/theme/icons/align-right.svg Text alignment} to change the alignment of a paragraph.

{@snippet features/text-alignment}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Configuring alignment options

### Defining available options

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
	.then( /* ... */ )
	.catch( /* ... */ );
```

{@snippet features/custom-text-alignment-options}

### Using classes instead of inline style

By default, alignment is set inline using the `text-align` CSS property. If you wish the feature to output more semantic content that uses classes instead of inline styles, you can specify class names by using the `className` property in `config.alignment.options` and style them by using a stylesheet.

<info-box>
	Once you decide to use classes for the alignment, you must define `className` for **all** alignment entries in {@link module:alignment/alignment~AlignmentConfig#options `config.alignment.options`}.
</info-box>

The following configuration will set `.my-align-left` and `.my-align-right` to left and right alignment, respectively.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		alignment: {
			options: [
				{ name: 'left', className: 'my-align-left' },
				{ name: 'right', className: 'my-align-right' }
			]
		},
		toolbar: [
			'heading', '|', 'bulletedList', 'numberedList', 'alignment', 'undo', 'redo'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuring the toolbar

You can choose to use the alignment dropdown (`'alignment'`) or configure the toolbar to use separate buttons for each of the options:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [
			'heading', '|', 'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

{@snippet features/custom-text-alignment-toolbar}

## Installation

<info-box info>
	The alignment feature is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build} and {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-alignment`](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment) package:

```bash
npm install --save @ckeditor/ckeditor5-alignment
```

And add it to your plugin list and toolbar configuration:

```js
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Alignment, /* ... */ ],
		toolbar: [ 'alignment', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Related features

CKEditor 5 has more features that can help you organize your content:
* {@link features/title Document title} &ndash; Clearly divide your content into a title and body.
* {@link features/headings Headings} &ndash; Split your content into logical sections.
* {@link features/indent Block indentation} &ndash; Organize your content into visually separated blocks, indent crucial paragraphs, etc.
* {@link features/block-quote Block quote} &ndash; Include block quotations or pull quotes in the rich-text content.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.

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
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Content compatibility

The {@link module:alignment/alignment~Alignment} plugin provides support for the deprecated `align` attribute.

Block elements such as `<p>` with the `align` attribute are accepted by the plugin, but the editor always returns the markup in a modern format, so the transformation is one way only.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-alignment](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-alignment).
