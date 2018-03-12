---
title: Font
category: features
---

{@snippet features/build-font-source}

The {@link module:font/font~Font} plugin enables the following features in the editor:
* {@link module:font/fontfamily~FontFamily} – allows to change the font family by applying inline `<span>` elements with a `font-family` in the `style` attribute,
* {@link module:font/fontsize~FontSize} – allows to control size by applying inline `<span>` elements that either have a CSS class or a `font-size` in the `style` attribute.

## Demo

{@snippet features/font}

## Configuring the font family

It is possible to configure which font family options are supported by the editor. Use the {@link module:font/fontfamily~FontFamilyConfig#options `fontFamily.options`} configuration option to do so.

Use the special `'default'` keyword to use the default `font-family` defined in the web page styles (removes any custom font family).

For example, the following editor supports only two font families besides the "default" one:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontFamily: {
			options: [
				'default',
				'Ubuntu, Arial, sans-serif',
				'Ubuntu Mono, Courier New, Courier, monospace'
			]
		},
		toolbar: [
			'heading', 'bulletedList', 'numberedList', 'fontFamily', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-font-family-options}

## Configuring the font size

It is possible to configure which font size options are supported by the editor. Use the {@link module:font/fontsize~FontSizeConfig#options `fontSize.options`} configuration option to do so.

Use the special `'normal'` keyword to use the default font size defined in the web page styles (removes any custom size).

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

The CSS definition for the classes (presets) must be included in the web page's styles where the edited content is rendered.

Here's an example of the font size CSS classes:

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

#### Using CSS Variables

The font size feature is using the power of [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) which are defined in the [stylesheet](https://github.com/ckeditor/ckeditor5-font/blob/master/theme/fontsize.css). Thanks to that, both the UI and the content styles share the same font-size definitions, which can be easily customized:

```css
:root {
	/* Make big text a bit bigger */
	--ck-fontsize-big: 1.6em;
	
	/* Make huge text really huge. */
	--ck-fontsize-huge: 3em;
}
```

#### Example configuration

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
			'heading', 'bulletedList', 'numberedList', 'fontSize', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-font-size-named-options}

### Configuration using numerical values

The font feature also supports numerical values.

In this case, each size is represented in the view as a `<span>` element with the `font-size` style set in `px`.
For example, `14` will be represented in the editor data as:

```html
<span style="font-size: 14px">...</span>
```

Here's an example of the editor that supports numerical font sizes. Note that `'normal'` is controlled by the default styles of the web page:

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
			'heading', 'bulletedList', 'numberedList', 'fontSize', 'undo', 'redo'
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
import Font from '@ckeditor/ckeditor5-font/src/font';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Font, ... ],
		toolbar: [ 'fontSize', 'fontFamily', ... ]
	} )
	.then( ... )
	.catch( ... );
```

or add one of the font features to your plugin list and the toolbar configuration:

```js
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ FontFamily, ... ],
		toolbar: [ 'fontFamily', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/development/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:font/fontfamily~FontFamily} plugin registers:

* The `'fontFamily'` dropdown,
* The {@link module:font/fontfamily/fontfamilycommand~FontFamilyCommand `'fontFamily'`} command.

	The number of options and their names correspond to the {@link module:font/fontfamily~FontFamilyConfig#options `fontFamily.options`} configuration option.

	You can change the font family of the current selection by executing the command with a desired value:

	```js
	editor.execute( 'fontFamily', { value: 'Arial' } );
	```

	The `value` must correspond to the first font name in the configuration string. For the following default configuration:
	```js
	fontFamily.options = [
		'default',
		'Arial, Helvetica, sans-serif',
		'Courier New, Courier, monospace',
		'Georgia, serif',
		'Lucida Sans Unicode, Lucida Grande, sans-serif',
		'Tahoma, Geneva, sans-serif',
		'Times New Roman, Times, serif',
		'Trebuchet MS, Helvetica, sans-serif',
		'Verdana, Geneva, sans-serif'
	]
	```

	the `fontFamily` command will accept the corresponding strings as values:
	* `'Arial'`
	* `'Courier New'`
	* `'Georgia'`
	* `'Lucida Sans Unicode'`
	* `'Tahoma'`
	* `'Times New Roman'`
	* `'Trebuchet MS'`
	* `'Verdana'`

	Note that passing an empty value will remove the `fontFamily` from the selection (`default`):

	```js
	editor.execute( 'fontFamily' );
	```

The {@link module:font/fontsize~FontSize} plugin registers the following components:

* The `'fontSize'` dropdown,
* The {@link module:font/fontsize/fontsizecommand~FontSizeCommand `'fontSize'`} command.

	The number of options and their names correspond to the {@link module:font/fontsize~FontSizeConfig#options `fontSize.options`} configuration option.

	You can change the font size of the current selection by executing the command with a desired value:

	```js
	// For numerical values:
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
