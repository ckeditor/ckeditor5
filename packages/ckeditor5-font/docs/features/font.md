---
title: Font
category: features
---

{@snippet features/build-font-source}

The {@link module:font/font~Font} plugin enables the following features in the editor:
* {@link module:font/fontfamily~FontFamily} &ndash; Allows to change the font family by applying inline `<span>` elements with a `font-family` in the `style` attribute.
* {@link module:font/fontsize~FontSize} &ndash; Allows to control the font size by applying inline `<span>` elements that either have a CSS class or a `font-size` in the `style` attribute.

## Demo

{@snippet features/font}

## Configuring the font family feature

It is possible to configure which font family options are supported by the editor. Use the {@link module:font/fontfamily~FontFamilyConfig#options `fontFamily.options`} configuration option to do so.

Use the special `'default'` keyword to use the default font family defined in the web page styles. It removes any custom font family.

For example, the following editor supports only two font families besides the default one:

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

## Configuring the font size feature

It is possible to configure which font size options are supported by the editor. Use the {@link module:font/fontsize~FontSizeConfig#options `fontSize.options`} configuration option to do so.

Use the special `'default'` keyword to use the default font size defined in the web page styles. It removes any custom font size.

The font size feature supports two ways of defining the configuration: using predefined (named) presets or simple numeric values.

### Using the predefined presets

The font size feature defines 4 named presets:

* `'tiny'`
* `'small'`
* `'big'`
* `'huge'`

Each size is represented in the view as a `<span>` element with the `text-*` class. For example, the `'tiny'` preset looks as follows in the editor data:

```html
<span class="text-tiny">...</span>
```

The CSS definition for the classes (presets) must be included in the web page styles where the edited content is rendered.

Here is an example of the font size CSS classes:

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
				'default',
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

### Using numerical values

The font feature also supports numerical values.

In this case, each size is represented in the view as a `<span>` element with the `font-size` style set in `px`.
For example, `14` will be represented in the editor data as:

```html
<span style="font-size: 14px">...</span>
```

Here is an example of the editor that supports numerical font sizes. Note that `'default'` is controlled by the default styles of the web page:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontSize: {
			options: [
				9,
				11,
				13,
				'default',
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

To add this feature to your editor, install the [`@ckeditor/ckeditor5-font`](https://www.npmjs.com/package/@ckeditor/ckeditor5-font) package:

```bash
npm install --save @ckeditor/ckeditor5-font
```

Then add it to your plugin list and the toolbar configuration:

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

You can also add one of the font features to your plugin list and the toolbar configuration:

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
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
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

	the `'fontFamily'` command will accept the corresponding strings as values:

	* `'Arial'`
	* `'Courier New'`
	* `'Georgia'`
	* `'Lucida Sans Unicode'`
	* `'Tahoma'`
	* `'Times New Roman'`
	* `'Trebuchet MS'`
	* `'Verdana'`

	Note that passing an empty value will remove the `fontFamily` attribute from the selection (`default`):

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

	Passing an empty value will remove any `fontSize` set:

	```js
	editor.execute( 'fontSize' );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector instance inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-font.
