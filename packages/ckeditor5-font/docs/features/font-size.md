---
title: Font size
category: features
---

{@snippet features/build-font-size-source}

The {@link module:font/fontsize~FontSize} feature enables support for setting font size. This feature allows to control size of a text by inline `<span>` elements that have set either class or `font-size` CSS set in style attribute.

## Demo

{@snippet features/font-size}

## Configuring font size options

It is possible to configure which font size options are supported by the editor. Use the {@link module:font/fontsize~FontSizeConfig#options `fontSize.options`} configuration option to do so.

Use the special keyword `'normal'` to use the default font size defined in the web page styles — it disables the font-size feature.

The font size feature supports two ways of defining configuration: using  predefined (named) presets or simple numeric values.

### Configuration using the predefined named presets

The font size feature defines 4 named presets:
- `'tiny'`
- `'small'`
- `'big'`
- `'huge'`

Each size is represented in the view as a `<span>` element with the `text-*` class. For example, the `'tiny'` preset looks as follows in the editor data:

```html
<span class="text-tiny">...</span>
```

The CSS definition for those CSS classes must be included:
- on the web page's CSS stylesheet that the editor is included and 
- on the web page's CSS stylesheet that renders edited content. 

The examples defines below CSS:

```css
.text-tiny {
	font-size: 0.7em;
}

.text-small {
	font-size: 0.85em;
}

.text-big {
	font-size: 1.4em;
}

.text-huge {
	font-size: 1.8em;
}
```

An example of the editor that supports only two font sizes:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontSize: {
			options: [
				'tiny',
				'normal',
				'big'
			]
		},
		toolbar: [
			'headings', 'bulletedList', 'numberedList', 'fontSize', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-font-size-named-options}

### Configuration using numeric presets

As an alternative, the font feature supports numeric values.

Each size is represented in the view as a `<span>` element with the `font-size` style set in `px`.
For example, `14` will be represented in the editor data as:

```html
<span style="font-size: 14px">...</span>
```

Here's an example of the editor that supports numeric font sizes (assuming that the `'normal'` size is defined by CSS as `15px`):

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontSize: {
			options: [
				9,
				11,
				13,
				'normal',
				17,
				19,
				21
			]
		},
		toolbar: [
			'headings', 'bulletedList', 'numberedList', 'fontSize', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-font-size-numeric-options}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-font`](https://www.npmjs.com/package/@ckeditor/ckeditor5-font) package:

```
npm install --save @ckeditor/ckeditor5-font
```

And add it to your plugin list and the toolbar configuration:

```js
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ FontSize, ... ],
		toolbar: [ 'fontSize', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/development/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:font/fontsize~FontSize} plugin registers the following components:

* The `'fontSize'` dropdown,
* The {@link module:font/fontsize/fontsizecommand~FontSizeCommand `'fontSize'`} command.

	The number of options and their names correspond to the {@link module:font/fontsize~FontSizeConfig#options `fontSize.options`} configuration option.

	You can change the font size of the current selection by executing the command with a desired value:

	```js
	// For numeric values:
	editor.execute( 'fontSize', { value: 10 } );

	// For named presets:
	editor.execute( 'fontSize', { value: 'small' } );
	```
	passing an empty value will remove any `fontSize` set:

	```js
	editor.execute( 'fontSize' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-font.
