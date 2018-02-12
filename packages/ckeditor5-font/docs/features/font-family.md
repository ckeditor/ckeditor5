---
title: Font family
category: features
---

{@snippet features/build-font-family-source}

The {@link module:font/fontfamily~FontFamily} feature enables support for setting font family.

## Demo

{@snippet features/font-family}

## Configuring font family options

It is possible to configure which font family options are supported by the editor. Use the {@link module:font/fontfamily~FontFamilyConfig#options `fontFamily.options`} configuration option to do so.

Use the special keyword `'default'` to use the default `font-family` defined in the web page styles — it disables the font family feature.

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
			'headings', 'bulletedList', 'numberedList', 'fontFamily', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-font-family-options}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-font`](https://www.npmjs.com/package/@ckeditor/ckeditor5-font) package:

```
npm install --save @ckeditor/ckeditor5-font
```

And add it to your plugin list and the toolbar configuration:

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
* The `'fontFamily'` command.

	The number of options and their names correspond to the {@link module:font/fontfamily~FontFamilyConfig#options `fontFamily.options`} configuration option.

	You can change the font family of the current selection by executing the command with a desired value:

	```js
	editor.execute( 'fontFamily', { value: 'Arial' } );
	```

	The Value passed to `family` corresponds to the first font name in the configuration string. For the following default configuration:
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

	the `fontFamily` command will accept the corresponding strings as a value:
	* `'Arial'`
	* `'Courier New'`
	* `'Georgia'`
	* `'Lucida Sans Unicode'`
	* `'Tahoma'`
	* `'Times New Roman'`
	* `'Trebuchet MS'`
	* `'Verdana'`

	passing an empty value will remove any `fontFamily` (`default`):

	```js
	editor.execute( 'fontFamily' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-font.
