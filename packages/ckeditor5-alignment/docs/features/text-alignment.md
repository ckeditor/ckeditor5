---
title: Text alignment
meta-title: Text alignment | CKEditor 5 Documentation
category: features
---

The alignment feature lets you align your content to the left or right as well as center or justify it.

## Demo

Click inside a paragraph or a header and use the toolbar dropdown {@icon @ckeditor/ckeditor5-icons/theme/icons/align-right.svg Text alignment} to change the alignment of the element.

{@snippet features/text-alignment}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Alignment } from 'ckeditor5';

ClassicEditor.
	create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>' // Or 'GPL'.
		plugins: [ Alignment, /* ... */ ],
		toolbar: [ 'alignment', /* ... */ ]
		alignment: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuring alignment options

### Defining available options

It is possible to configure which alignment options are available in the editor by setting the {@link module:alignment/alignmentconfig~AlignmentConfig#options `alignment.options`} configuration option. You can choose from `'left'`, `'right'`, `'center'`, and `'justify'`.

<info-box>
	You should always include the `'left'` option for the <abbr title="left–to–right">LTR</abbr> content. Similarly, you should always include the `'right'` option for the <abbr title="right-to-left">RTL</abbr> content. Learn more about {@link getting-started/setup/ui-language#setting-the-language-of-the-content configuring language of the editor content}.
</info-box>

For example, the following editor will support two alignment options: to the left and to the right:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
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

By default, alignment is set inline using the `text-align` CSS property. If you wish the feature to output more semantic content that uses classes instead of inline styles, you can specify class names by using the `className` property in `config.alignment.options` and style them by using a style sheet.

<info-box>
	Once you decide to use classes for the alignment, you must define `className` for **all** alignment entries in {@link module:alignment/alignmentconfig~AlignmentConfig#options `config.alignment.options`}.
</info-box>

The following configuration will set `.my-align-left` and `.my-align-right` to left and right alignment, respectively.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
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
		// ... Other configuration options ...
		toolbar: [
			'heading', '|', 'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

{@snippet features/custom-text-alignment-toolbar}

## Related features

CKEditor&nbsp;5 has more features that can help you organize your content:
* {@link features/title Document title} &ndash; Clearly divide your content into a title and body.
* {@link features/headings Headings} &ndash; Split your content into logical sections.
* {@link features/indent Block indentation} &ndash; Organize your content into visually separated blocks, indent crucial paragraphs, etc.
* {@link features/block-quote Block quote} &ndash; Include block quotations or pull quotes in the rich-text content.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.

## Common API

The {@link module:alignment/alignment~Alignment} plugin registers:

* Dropdown: `'alignment'`.
* Buttons: `'alignment:left'`, `'alignment:right'`, `'alignment:center'`, `'alignment:justify'`.

	The number of options and their names are based on the {@link module:alignment/alignmentconfig~AlignmentConfig#options `alignment.options`} configuration option.

* Command: `'alignment'`:

	You can align the currently selected block(s) by executing one of these commands:

	```js
	editor.execute( 'alignment', { value: 'center' } );
	```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Content compatibility

The {@link module:alignment/alignment~Alignment} plugin provides support for the deprecated `align` attribute.

Block elements such as `<p>` with the `align` attribute are accepted by the plugin, but the editor always returns the markup in a modern format, so the transformation is one way only.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-alignment](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-alignment).
