---
title: Highlight
category: features
---

{@snippet features/build-highlight-source}

The {@link module:highlight/highlight~Highlight} feature offers a text marking tools that help content authors speed up their work, e.g. reviewing content or marking it for the future reference. It uses inline `<marker>` elements in the view, supports both markers (background color) and pens (text color), and comes with a flexible configuration.

## Demo

{@snippet features/highlight}

## Configuring the highlight options

### Dropdown

It is possible to configure which highlight options are supported by the editor.
You can use the {@link module:highlight/highlight~HighlightConfig#options `highlight.options`} configuration and define your own highlight styles.

For example, the following editor supports only two styles (a green marker and a red pen):

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		highlight: {
			options: [
				{
					model: 'greenMarker',
					class: 'marker-green',
					title: 'Green marker',
					color: 'var(--ck-highlight-marker-green)',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'var(--ck-highlight-pen-red)',
					type: 'pen'
				}
			]
		},
		toolbar: [
			'headings', '|', 'bulletedList', 'numberedList', 'highlightDropdown', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-highlight-options}

### Inline buttons

Instead of using the (default) `highlightDropdown`, the feature also supports a configuration with separate buttons directly in the toolbar:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'headings', '|', 'highlight:marker', 'highlight:greenMarker',
				'highlight:pinkMarker', 'highlight:greenPen',
				'highlight:redPen', 'removeHighlight', 'undo', 'redo'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/highlight-buttons}

### Custom colors

#### CSS Variables

The highlight feature by default is using power of [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) which are defined in the [stylesheet](https://github.com/ckeditor/ckeditor5-highlight/blob/master/src/highlight.css). Thanks to them, we can easily make customization with change of lightness, hue or completely different color.

```css
:root {

	/* Make green a little darker. */
	--ck-highlight-marker-green: #199c19;

	/* Change yellow to orange */
	--ck-highlight-marker-yellow: #ffd11d;

	/* Make red more pinkish. */
	--ck-highlight-pen-red: #ec3e98;
}
```

{@snippet features/custom-highlight-colors-variables}

#### Inline color in config

There is also possibility to use inline color values like `rgb`, `hex` or `hsl` format. Firstly, you need to change values of markers and pens in {@link module:highlight/highlight~HighlightConfig#options `highlight.options`} .

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		highlight: {
			options: [
				{
					model: 'greenMarker',
					class: 'marker-green',
					title: 'Green marker',
					color: 'rgb(24, 201, 32)',
					type: 'marker'
				},
				{
					model: 'yellowMarker',
					class: 'marker-yellow',
					title: 'Yellow marker',
					color: '#f2ee28',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'hsl(355, 78%, 49%)',
					type: 'pen'
				}
			]
		},
		toolbar: [
			'headings', '|', 'bulletedList', 'numberedList', 'highlightDropdown', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

Secondly you need to take care of changes in stylesheet classes due to skipping CSS Variables. You should also remember about removing inactive CSS definitions in [stylesheet](https://github.com/ckeditor/ckeditor5-highlight/blob/master/src/highlight.css) like mixins and variables.

```css
.marker-green {
	background-color: rgb(24, 201, 32);
}
.marker-yellow {
	background-color: #f2ee28;
}
.pen-red {
	color: hsl(355, 78%, 49%);
}
```

{@snippet features/custom-highlight-colors-normal}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-highlight`](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight) package:

```
npm install --save @ckeditor/ckeditor5-highlight
```

And add it to your plugin list and the toolbar configuration:

```js
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Highlight, ... ],
		toolbar: [ 'highlightDropdown', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/development/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:highlight/highlight~Highlight} plugin registers:

* The `'highlightDropdown'` dropdown,
* The {@link module:highlight/highlightcommand~HighlightCommand `'highlight'`} command.

	The number of options and their names correspond to the {@link module:highlight/highlight~HighlightConfig#options `highlight.options`} configuration option.

	You can change the highlight of the current selection by executing the command with a desired value:

	```js
	editor.execute( 'highlight', { value: 'yellowMarker' } );
	```

	The `value` corresponds to the `model` property in configuration object. For the default configuration:
	```js
	highlight.options = [
		{ model: 'yellowMarker', class: 'marker-yellow', title: 'Yellow Marker', color: 'var(--ck-highlight-marker-yellow)', type: 'marker' },
		{ model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: 'var(--ck-highlight-marker-green)', type: 'marker' },
		{ model: 'pinkMarker', class: 'marker-pink', title: 'Pink marker', color: 'var(--ck-highlight-marker-pink)', type: 'marker' },
		{ model: 'blueMarker', class: 'marker-blue', title: 'Blue marker', color: 'var(--ck-highlight-marker-blue)', type: 'marker' },
		{ model: 'redPen', class: 'pen-red', title: 'Red pen', color: 'var(--ck-highlight-pen-red)', type: 'pen' },
		{ model: 'greenPen', class: 'pen-green', title: 'Green pen', color: 'var(--ck-highlight-pen-green)', type: 'pen' }
	]
	```

	the `highlight` command will accept the corresponding strings as values:
	- `'yellowMarker'` – available as a `'highlight:yellowMarker'` button,
	- `'greenMarker'` – available as a `'highlight:greenMarker'` button,
	- `'pinkMarker'` – available as a `'highlight:pinkMarker'` button,
	- `'blueMarker'` – available as a `'highlight:blueMarker'` button,
	- `'redPen'` – available as a `'highlight:redPen'` button,
	- `'greenPen'` – available as a `'highlight:greenPen'` button.

	passing an empty `value` will remove any `highlight` from the selection:

	```js
	editor.execute( 'highlight' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-highlight.
