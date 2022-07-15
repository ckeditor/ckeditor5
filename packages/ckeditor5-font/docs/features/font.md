---
title: Font
category: features
---

{@snippet features/build-font-source}

The {@link module:font/font~Font} plugin provides extended text formatting options for the document content.

The font styles, just like the {@link features/basic-styles basic text styles} can serve numerous purposes. Font size setting can be applied globally or to a selected part of the text only making it catch the eye of the reader. Using different font families can help differentiate between sections of the content that serve various purposes (e.g. main text and a side quotation or a recap). Different font colors can work as markers and guides just like font background colors, that stand out even more and draw attention.

The plugin enables the following features in the rich-text editor:
* {@link module:font/fontfamily~FontFamily} &ndash; Allows to change the font family by applying inline `<span>` elements with a `font-family` in the `style` attribute.
* {@link module:font/fontsize~FontSize} &ndash; Allows to control the font size by applying inline `<span>` elements that either have a CSS class or a `font-size` in the `style` attribute.
* {@link module:font/fontcolor~FontColor} &ndash; Allows to control the font color by applying inline `<span>` elements with a `color` in the `style` attribute.
* {@link module:font/fontbackgroundcolor~FontBackgroundColor} &ndash; Allows to control the font background color by applying inline `<span>` elements with a `background-color` in the `style` attribute.

<info-box info>
	All font formatting can be removed with the {@link features/remove-format remove format} feature.
</info-box>

<info-box info>
	The font styles feature is enabled by default in the {@link installation/advanced/predefined-builds #document-editor document editor build} only. See the [installation](#installation) section to learn how to enable it in your editor.
</info-box>

## Demo

Use the toolbar dropdowns in the demo below to control font size {@icon @ckeditor/ckeditor5-font/theme/icons/font-size.svg Font size} and font family {@icon @ckeditor/ckeditor5-font/theme/icons/font-family.svg Font family}. You can also change both the font color {@icon @ckeditor/ckeditor5-font/theme/icons/font-color.svg Font color} and font background color {@icon @ckeditor/ckeditor5-font/theme/icons/font-background.svg Font background color}.

{@snippet features/font}

## Related features

Here are some more CKEditor 5 features that can help you format your content:
* {@link features/basic-styles Basic text styles} &ndash; The essentials, like **bold**, *italic* and others.
* {@link features/text-alignment Text alignment} &ndash; Because it does matter whether the content is left, right, centered or justified.
* {@link features/headings Headings} &ndash; Divide your content into sections.
* {@link features/highlight Highlight} &ndash; Mark important words and passages, aiding a review or drawing attention to specific parts of content.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.

## Configuring the font family feature

It is possible to configure which font family options are supported by the WYSIWYG editor. Use the {@link module:font/fontfamily~FontFamilyConfig#options `config.fontFamily.options`} configuration option to do so.

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

### Accepting all font names

By default, all `font-family` values that are not specified in the `config.fontFamily.options` are stripped. You can enable support for all font names by using the {@link module:font/fontfamily~FontFamilyConfig#supportAllValues `config.fontFamily.supportAllValues`} option.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontFamily: {
			options: [
				// ...
			],
			supportAllValues: true
		},
        // ...
	} )
	.then( ... )
	.catch( ... );
```

## Configuring the font size feature

It is possible to configure which font size options are supported by the WYSIWYG editor. Use the {@link module:font/fontsize~FontSizeConfig#options `config.fontSize.options`} configuration option to do so.

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
.ck-content .text-tiny {
	font-size: 0.7em;
}

.ck-content .text-small {
	font-size: 0.85em;
}

.ck-content .text-big {
	font-size: 1.4em;
}

.ck-content .text-huge {
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

The font size feature also supports numerical values.

In this case, each size is represented in the view as a `<span>` element with the `font-size` style set in `px`. For example, `14` will be represented in the editor data as:

```html
<span style="font-size: 14px">...</span>
```

Here is an example of the WYSIWYG editor that supports numerical font sizes. Note that `'default'` is controlled by the default styles of the web page:

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

### Accepting all font sizes

By default, all `font-size` values that are not specified in the `config.fontSize.options` are stripped. You can enable support for all font sizes by using the {@link module:font/fontsize~FontSizeConfig#supportAllValues `config.fontSize.supportAllValues`} option.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontSize: {
			options: [
				// Numerical values.
			],
			supportAllValues: true
		},
        // ...
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	This option can be used only in combination with [numerical values](#using-numerical-values).
</info-box>

## Configuring the font color and font background color features

Both font color and font background color features are configurable and share the same configuration format.

<info-box info>
	Please note that {@link module:font/fontcolor~FontColor font color} and {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} are separate plugins. They must be enabled and configured individually.
</info-box>

Check out the WYSIWYG editor below with both features customized using the editor configuration:

{@snippet features/custom-font-color-and-background-color-options}

### Specifying available colors

It is possible to configure which colors are available in the color dropdown. Use the {@link module:font/fontcolor~FontColorConfig#colors `config.fontColor.colors`} and {@link module:font/fontbackgroundcolor~FontBackgroundColorConfig#colors `config.fontBackgroundColor.colors`} configuration options to do so.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontColor: {
			colors: [
				{
					color: 'hsl(0, 0%, 0%)',
					label: 'Black'
				},
				{
					color: 'hsl(0, 0%, 30%)',
					label: 'Dim grey'
				},
				{
					color: 'hsl(0, 0%, 60%)',
					label: 'Grey'
				},
				{
					color: 'hsl(0, 0%, 90%)',
					label: 'Light grey'
				},
				{
					color: 'hsl(0, 0%, 100%)',
					label: 'White',
					hasBorder: true
				},

				// ...
			]
		},
		fontBackgroundColor: {
			colors: [
				{
					color: 'hsl(0, 75%, 60%)',
					label: 'Red'
				},
				{
					color: 'hsl(30, 75%, 60%)',
					label: 'Orange'
				},
				{
					color: 'hsl(60, 75%, 60%)',
					label: 'Yellow'
				},
				{
					color: 'hsl(90, 75%, 60%)',
					label: 'Light green'
				},
				{
					color: 'hsl(120, 75%, 60%)',
					label: 'Green'
				},

				// ...
			]
		},
		toolbar: [
			'heading', 'bulletedList', 'numberedList', 'fontColor', 'fontBackgroundColor', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

### Changing the geometry of the color grid

You can configure the number of columns in the color dropdown by setting the {@link module:font/fontcolor~FontColorConfig#columns `config.fontColor.columns`} and {@link module:font/fontbackgroundcolor~FontBackgroundColorConfig#columns `config.fontBackgroundColor.columns`} configuration options.

Usually, you will want to use this option when changing the number of [available colors](#specifying-available-colors).

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontColor: {
			colors: [
				// 9 colors defined here...
			]

			columns: 3, // so, you can display them in 3 columns.

			// ...
		},
		fontBackgroundColor: {
			columns: 6,

			// ...
		},
		toolbar: [
			'heading', 'bulletedList', 'numberedList', 'fontColor', 'fontBackgroundColor', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

### Documents colors

The font and font background color dropdowns contain the "Document colors" section. It lists the colors already used in the document for the users to be able to easily reuse them (for consistency purposes).

By default, the number of displayed document colors is limited to one row, but you can adjust it (or remove the whole section) by using the {@link module:font/fontcolor~FontColorConfig#documentColors `config.fontColor.documentColors`} or {@link module:font/fontbackgroundcolor~FontBackgroundColorConfig#documentColors `config.fontBackgroundColor.documentColors`} options.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontColor: {
			// Display 6 columns in the color grid.
			columns: 6,

			// And 12 document colors (2 rows of them).
			documentColors: 12,

			// ...
		},
		fontBackgroundColor: {
			// Remove the "Document colors" section.
			documentColors: 0,

			// ...
		},
		toolbar: [
			'heading', 'bulletedList', 'numberedList', 'fontColor', 'fontBackgroundColor', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-font`](https://www.npmjs.com/package/@ckeditor/ckeditor5-font) package:

```bash
npm install --save @ckeditor/ckeditor5-font
```

Then add it to your plugin list and the toolbar configuration:

```js
import Font from '@ckeditor/ckeditor5-font/src/font';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Font, ... ],
		toolbar: [ 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', ... ]
	} )
	.then( ... )
	.catch( ... );
```

You can also add just one or a selected few of the font features to your plugin list and the toolbar configuration:

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
	Read more about {@link installation/getting-started/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:font/fontfamily~FontFamily} plugin registers the following components:

* The `'fontFamily'` dropdown.
* The {@link module:font/fontfamily/fontfamilycommand~FontFamilyCommand `'fontFamily'`} command.

	The number of options and their names correspond to the {@link module:font/fontfamily~FontFamilyConfig#options `config.fontFamily.options`} configuration option.

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

* The `'fontSize'` dropdown.
* The {@link module:font/fontsize/fontsizecommand~FontSizeCommand `'fontSize'`} command.

	The number of options and their names correspond to the {@link module:font/fontsize~FontSizeConfig#options `config.fontSize.options`} configuration option.

	You can change the font size of the current selection by executing the command with a desired value:

	```js
	// For numerical values:
	editor.execute( 'fontSize', { value: 10 } );

	// For named presets:
	editor.execute( 'fontSize', { value: 'small' } );
	```

	Passing an empty value will remove any `config.fontSize` set:

	```js
	editor.execute( 'fontSize' );
	```

The {@link module:font/fontcolor~FontColor} plugin registers the following components:

* The `'fontColor'` dropdown.
* The {@link module:font/fontcolor/fontcolorcommand~FontColorCommand `'fontColor'`} command.

	You can change the font color of the current selection by executing the command with a desired value:

	```js
	editor.execute( 'fontColor', { value: 'rgb(30, 188, 97)' } );
	```

	Passing an empty value will remove the font color from the selection:

	```js
	editor.execute( 'fontColor' );
	```

The {@link module:font/fontbackgroundcolor~FontBackgroundColor} plugin registers the following components:

* The `'fontBackgroundColor'` dropdown.
* The {@link module:font/fontbackgroundcolor/fontbackgroundcolorcommand~FontBackgroundColorCommand `'fontBackgroundColor'`} command.

	You can change the font background color of the current selection by executing the command with a desired value:

	```js
	editor.execute( 'fontBackgroundColor', { value: 'rgb(30, 188, 97)' } );
	```

	Passing an empty value will remove the font background color from the selection:

	```js
	editor.execute( 'fontBackgroundColor' );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Content compatibility

The {@link module:font/font~Font} plugin provides basic support for the deprecated `<font>` tag.

While `<font color>` is always supported, to use `<font face>` and `<font size>` you need to enable the {@link module:font/fontfamily~FontFamilyConfig#supportAllValues `config.fontFamily.supportAllValues`} and {@link module:font/fontsize~FontSizeConfig#supportAllValues `config.fontSize.supportAllValues`} options respectively.

Text formatted with `<font>` is accepted by the plugin, but the editor always returns the markup in a modern format, so the transformation is one way only.


## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-font.
