---
title: Highlight
category: features
---

{@snippet features/build-highlight-source}

The {@link module:highlight/highlight~Highlight} feature offers a text marking tools that help content authors speed up their work, e.g. reviewing content or marking it for the future reference. It uses inline `<marker>` elements in the view, supports both markers (background color) and pens (text color), and comes with a flexible configuration.

## Demo

{@snippet features/highlight}

## Configuring the highlight options

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
					color: 'var(--ck-marker-green)',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'var(--ck-pen-red)',
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
		{ model: 'yellowMarker', class: 'marker-yellow', title: 'Yellow Marker', color: 'var(--ck-marker-yellow)', type: 'marker' },
		{ model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: 'var(--ck-marker-green)', type: 'marker' },
		{ model: 'pinkMarker', class: 'marker-pink', title: 'Pink marker', color: 'var(--ck-marker-pink)', type: 'marker' },
		{ model: 'blueMarker', class: 'marker-blue', title: 'Blue marker', color: 'var(--ck-marker-blue)', type: 'marker' },
		{ model: 'redPen', class: 'pen-red', title: 'Red pen', color: 'var(--ck-pen-red)', type: 'pen' },
		{ model: 'greenPen', class: 'pen-green', title: 'Green pen', color: 'var(--ck-pen-green)', type: 'pen' }
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
