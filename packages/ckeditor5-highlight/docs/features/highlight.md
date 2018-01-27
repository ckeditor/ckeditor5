---
title: Highlight
category: features
---

{@snippet features/build-highlight-source}

The {@link module:highlight/highlight~Highlight} feature enables support for setting highlight.

## Demo

{@snippet features/highlight}

## Configuring highlight options

It is, of course, possible to configure which highlight options the editor should support.
Use the {@link module:highlight/highlight~HighlightConfig#options `highlight.options`} configuration option to do so.

For example, the following editor will support only two highlighters:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		highlight: {
			options: [
				{
					model: 'greenMarker',
					class: 'marker-green',
					title: 'Green marker',
					color: '#66ff00',
					type: 'marker' 
				},
				{ 
					model: 'bluePen',
					class: 'pen-blue',
					title: 'Blue pen',
					color: '#0091ff',
					type: 'pen' 
				}
			]
		},
		toolbar: [
			'headings', 'bulletedList', 'numberedList', 'highlight', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-highlight-options}

Instead of using `highlightDropdown` the editor supports also button configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'headings', 'highlight:marker', 'highlight:greenMarker',
				'highlight:pinkMarker', 'highlight:bluePen',
				'highlight:redPen', 'removeHighlight', 'undo', 'redo'
			],
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

And add it to your plugin list and toolbar configuration:

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

* Dropdown: `'highlightDropdown'`.
* Command: `'highlight'`.

	The number of options and their names are based on the {@link module:highlight/highlight~HighlightConfig#options `highlight.options`} configuration option).

	You can change highlight of the current selection by executing command with proper value:

	```js
	editor.execute( 'highlight', { value: 'marker' } );
	```

	The Value passed to `highlight` corresponds to the `model` property in configuration object. For default configuration:
	```js
	highlight.options = [
		{ model: 'marker', class: 'marker', title: 'Marker', color: '#ffff66', type: 'marker' },
		{ model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: '#66ff00', type: 'marker' },
		{ model: 'pinkMarker', class: 'marker-pink', title: 'Pink marker', color: '#ff6fff', type: 'marker' },
		{ model: 'redPen', class: 'pen-red', title: 'Red pen', color: '#ff2929', type: 'pen' },
		{ model: 'bluePen', class: 'pen-blue', title: 'Blue pen', color: '#0091ff', type: 'pen' }
	]
	```
	
	the `highlight` command will accept strings below as value:
	- `'marker'` - and will be available as `highligth:marker'` button.
	- `'greenMarker'` - and will be available as `highligth:greenMarker'` button.
	- `'pinkMarker'` - and will be available as `highligth:pinkMarker'` button.
	- `'redPen'` - and will be available as `highligth:redPen'` button.
	- `'bluePen'` - and will be available as `highligth:bluePen'` button.
	
	passing an empty value will remove any `highlight` set:
	
	```js
	editor.execute( 'highlight' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-highlight.
