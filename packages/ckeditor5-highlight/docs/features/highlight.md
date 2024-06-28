---
category: features
meta-title: Highlight | CKEditor 5 Documentation
---

# Highlight

{@snippet features/build-highlight-source}

The highlight feature lets you mark text fragments with different colors. You can use it both as a marker (to change the background color) and as a pen (to change the text color).

## Demo

Select the text you want to highlight. Then use the highlight toolbar button {@icon @ckeditor/ckeditor5-highlight/theme/icons/marker.svg Highlight} to choose a desired color from the dropdown.

{@snippet features/highlight}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, Highlight } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Highlight, /* ... */ ],
		toolbar: [ 'highlight', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuring the highlight options

The highlight feature comes with flexible configuration options.

However, the plugin has a predefined and limited number of available colors. It also focuses more on functionality than aesthetics. To change the text and background colors, use the {@link features/font#configuring-the-font-color-and-font-background-color-features font color and background color} plugin.

The highlight feature uses inline `<mark>` elements in the view.

### Dropdown

You can configure which highlight options are supported by the editor. Use the {@link module:highlight/highlightconfig~HighlightConfig#options `highlight.options`} configuration and define your highlight styles.

For example, the following editor supports two styles (a green marker and a red pen):

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
	.then( /* ... */ )
	.catch( /* ... */ );
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
	.then( /* ... */ )
	.catch( /* ... */ );
```

{@snippet features/highlight-buttons}

### Colors and styles

<info-box info>
	See the plugin {@link module:highlight/highlightconfig~HighlightConfig#options options} to learn more about defaults.
</info-box>

#### Using CSS variables

The highlight feature is using the power of [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) defined in the [style sheet](https://github.com/ckeditor/ckeditor5-highlight/blob/master/theme/highlight.css). Thanks to that, both the UI and the content styles share the same color definitions that you can customize:

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

You can use inline color values in the `rgba(R, G, B, A)`, `#RRGGBB[AA]`, or `hsla(H, S, L, A)` formats instead of CSS variables. To do that, customize the {@link module:highlight/highlightconfig~HighlightConfig#options options} and define the `color` property for each option:

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
	.then( /* ... */ )
	.catch( /* ... */ );
```

Then, update the classes in the style sheet so the content corresponds to the UI of the editor. The UI buttons and the actual highlights in the text should be the same color.

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

## Related features

CKEditor&nbsp;5 has more features that can help you style your content:
* {@link features/style Styles} &ndash; Apply pre-configured styles like highlight or spoiler to existing content elements.
* {@link features/basic-styles Basic text styles} &ndash; The essentials, like **bold**, *italic*, and others.
* {@link features/font Font styles} &ndash; Control the font {@link features/font#configuring-the-font-family-feature family}, {@link features/font#configuring-the-font-size-feature size}, {@link features/font#configuring-the-font-color-and-font-background-color-features text or background color}.
* {@link features/format-painter Format painter} &ndash; Easily copy text formatting and apply it in a different place in the edited document.
* {@link features/block-quote Block quote} &ndash; Include block quotations or pull quotes in your rich-text content.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.

## Common API

The {@link module:highlight/highlight~Highlight} plugin registers:

* The `'highlight'` dropdown.
* The {@link module:highlight/highlightcommand~HighlightCommand `'highlight'`} command.

	The number of options and their names correspond to the {@link module:highlight/highlightconfig~HighlightConfig#options `highlight.options`} configuration option.

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
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-highlight](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-highlight).
