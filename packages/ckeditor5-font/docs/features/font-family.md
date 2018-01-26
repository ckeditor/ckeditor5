---
title: Font family
category: features
---

{@snippet features/build-font-family-source}

The {@link module:font/fontfamily~FontFamily} feature enables support for setting font family.

## Demo

{@snippet features/font-family}

## Configuring font family options

It is, of course, possible to configure which font family options the editor should support. Use the {@link module:font/fontfamily~FontFamilyConfig#options `fontFamily.options`} configuration option to do so.
Use special keyword `'default'` to use document's default font family as defined in CSS.

For example, the following editor will support only two font families besides "default" one:

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

And add it to your plugin list and toolbar configuration:

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

* Dropdown: `'fontFamily'`.
* Command: `'fontFamily'`.

	The number of options and their names are based on the {@link module:font/fontfamily~FontFamilyConfig#options `fontFamily.options`} configuration option).

	You can change font family of the current selection by executing command with proper value:

	```js
	editor.execute( 'fontFamily', { value: 'Arial' } );
	```

	The Value passed to `family` corresponds to the first font name in configuration string. For default configuration:
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
	
	the `fontFamily` command will accept strings below as value:
	* `'Arial'`
	* `'Courier New'`
	* `'Georgia'`
	* `'Lucida Sans Unicode'`
	* `'Tahoma'`
	* `'Times New Roman'`
	* `'Trebuchet MS'`
	* `'Verdana'` 
	
	passing an empty value will remove any `fontFamily` set:
	
	```js
	editor.execute( 'fontFamily' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-font.
