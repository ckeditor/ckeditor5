---
category: features
---

# Highlight

{@snippet features/build-highlight-source}

The {@link module:highlight/highlight~Highlight} feature offers text marking tools that help content authors speed up their work, for example when reviewing content or marking it for future reference. It uses inline `<mark>` elements in the view, supports both markers (background color) and pens (text color), and comes with a flexible configuration.

The highlight plugin always comes with a predefined and limited number of available colors. It also focuses on the functionality aspect rather than pure aesthetics. For changing the appearance of the text and background color, use the {@link features/font#configuring-the-font-color-and-font-background-color-features font color and background color} plugin.

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
			'heading', '|', 'bulletedList', 'numberedList', 'highlight', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/custom-highlight-options}

### Inline buttons

Instead of using the (default) `'highlight'` button, the feature also supports a configuration with separate buttons available directly in the toolbar:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'highlight:yellowMarker', 'highlight:greenMarker', 'highlight:pinkMarker',
				'highlight:greenPen', 'highlight:redPen', 'removeHighlight',
				'|',
				'undo', 'redo'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/highlight-buttons}

### Colors and styles

<info-box info>
	See the plugin {@link module:highlight/highlight~HighlightConfig#options options} to learn more about defaults.
</info-box>

#### Using CSS variables

The highlight feature is using the power of [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) which are defined in the [stylesheet](https://github.com/ckeditor/ckeditor5-highlight/blob/master/theme/highlight.css). Thanks to that, both the UI and the content styles share the same color definitions which can be easily customized:

```css
:root {
	/* Make green a little darker. */
	--ck-highlight-marker-green: #199c19;

	/* Make the yellow more "dirty". */
	--ck-highlight-marker-yellow: #cac407;

	/* Make red more pinkish. */
	--ck-highlight-pen-red: #ec3e6e;
}
```

{@snippet features/custom-highlight-colors-variables}

#### Inline color definitions

It is possible to use inline color values in the `rgba(R, G, B, A)`, `#RRGGBB[AA]` or `hsla(H, S, L, A)` formats instead of CSS variables. To do that, customize the {@link module:highlight/highlight~HighlightConfig#options options} and define the `color` property for each option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		highlight: {
			options: [
				{
					model: 'greenMarker',
					class: 'marker-green',
					title: 'Green marker',
					color: 'rgb(25, 156, 25)',
					type: 'marker'
				},
				{
					model: 'yellowMarker',
					class: 'marker-yellow',
					title: 'Yellow marker',
					color: '#cac407',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'hsl(343, 82%, 58%)',
					type: 'pen'
				}
			]
		},
		toolbar: [
			'heading', '|', 'bulletedList', 'numberedList', 'highlight', 'undo', 'redo'
		]
	} )
	.then( ... )
	.catch( ... );
```

Then, update the classes in the stylesheet so the content corresponds to the UI of the editor. It is recommended for the UI buttons and the actual highlights in the text to share the same colors.

```css
.marker-green {
	background-color: rgb(25, 156, 25);
}
.marker-yellow {
	background-color: #cac407;
}
.pen-red {
	color: hsl(343, 82%, 58%);
}
```

{@snippet features/custom-highlight-colors-inline}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-highlight`](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight) package:

```bash
npm install --save @ckeditor/ckeditor5-highlight
```

And add it to your plugin list and the toolbar configuration:

```js
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Highlight, ... ],
		toolbar: [ 'highlight', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:highlight/highlight~Highlight} plugin registers:

* The `'highlight'` dropdown,
* The {@link module:highlight/highlightcommand~HighlightCommand `'highlight'`} command.

	The number of options and their names correspond to the {@link module:highlight/highlight~HighlightConfig#options `highlight.options`} configuration option.

	You can change the highlight of the current selection by executing the command with a desired value:

	```js
	editor.execute( 'highlight', { value: 'yellowMarker' } );
	```

	The `value` corresponds to the `model` property in the configuration object. For the default configuration:

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

	the `'highlight'` command will accept the corresponding strings as values:

	* `'yellowMarker'` &ndash; available as the `'highlight:yellowMarker'` button,
	* `'greenMarker'` &ndash; available as the `'highlight:greenMarker'` button,
	* `'pinkMarker'` &ndash; available as the `'highlight:pinkMarker'` button,
	* `'blueMarker'` &ndash; available as the `'highlight:blueMarker'` button,
	* `'redPen'` &ndash; available as the `'highlight:redPen'` button,
	* `'greenPen'` &ndash; available as the `'highlight:greenPen'` button.

	Passing an empty `value` will remove any `highlight` attribute from the selection:

	```js
	editor.execute( 'highlight' );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-highlight.
