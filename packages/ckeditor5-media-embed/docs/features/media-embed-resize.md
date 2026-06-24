---
category: features-media-embed
menu-title: Resizing media embeds
meta-title: Resizing media embeds | CKEditor 5 Documentation
meta-description: Resize embedded videos and other media content using drag handles, a toolbar dropdown, or standalone buttons in CKEditor 5.
order: 50
badges: [ premium ]
---

# Resizing media embeds

The media embed resize feature lets you change the width of media embeds (such as YouTube or Vimeo videos) in your content. It is implemented by the {@link module:media-embed/mediaembedresize~MediaEmbedResize} plugin.

{@snippet getting-started/unlock-feature}

## Demo

Click the media embed in the editor below to select it, then drag any of its corner handles to change the width.

{@snippet features/media-embed-resize}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

## Methods to resize media embeds

You can resize media embeds using any of the following methods:

* [Drag handles](#using-resize-handles) — click and drag the corner handles of a selected media widget.
* [Resize dropdown](#using-the-resize-dropdown) — pick a predefined size or set a custom width via a toolbar dropdown.
* [Standalone resize buttons](#using-standalone-resize-buttons) — place individual buttons for each predefined size in the media toolbar.

Both the dropdown and the standalone buttons are fully keyboard-accessible and satisfy the WCAG 2.1 keyboard navigation requirements.

### Using resize handles

When enabled, selecting a media widget shows four corner resize handles. Dragging a handle resizes the embed proportionally while preserving its aspect ratio.

### Using the resize dropdown

Add `'resizeMediaEmbed'` to the `mediaEmbed.toolbar` option to show a dropdown in the media embed toolbar. The dropdown contains a list of predefined sizes, a **Custom** entry that opens a balloon with a numeric input, and an **Original** entry that removes any applied resize.

```js
ClassicEditor
	.create( {
		/* ... */
		mediaEmbed: {
			toolbar: [ 'resizeMediaEmbed' ],
			resizeOptions: [
				{ name: 'resizeMediaEmbed:original', value: null,     icon: 'original' },
				{ name: 'resizeMediaEmbed:custom',   value: 'custom', icon: 'custom'   },
				{ name: 'resizeMediaEmbed:25',       value: '25',     icon: 'small'    },
				{ name: 'resizeMediaEmbed:50',       value: '50',     icon: 'medium'   },
				{ name: 'resizeMediaEmbed:75',       value: '75',     icon: 'large'    }
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Using standalone resize buttons

You can also place individual resize buttons in the toolbar instead of using a dropdown. Each button corresponds to one resize option and can be identified by a `'resizeMediaEmbed:<value>'` name.

```js
ClassicEditor
	.create( {
		/* ... */
		mediaEmbed: {
			toolbar: [
				'resizeMediaEmbed:25',
				'resizeMediaEmbed:50',
				'resizeMediaEmbed:75',
				'resizeMediaEmbed:original',
				'resizeMediaEmbed:custom'
			],
			resizeOptions: [
				{ name: 'resizeMediaEmbed:original', value: null,     icon: 'original' },
				{ name: 'resizeMediaEmbed:custom',   value: 'custom', icon: 'custom'   },
				{ name: 'resizeMediaEmbed:25',       value: '25',     icon: 'small'    },
				{ name: 'resizeMediaEmbed:50',       value: '50',     icon: 'medium'   },
				{ name: 'resizeMediaEmbed:75',       value: '75',     icon: 'large'    }
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Disabling resize handles

You can load `MediaEmbedResizeEditing`, `MediaEmbedResizeButtons`, and `MediaEmbedCustomResizeUI` without `MediaEmbedResizeHandles` to get a keyboard-only resize setup:

<code-switcher>
```js
import {
	ClassicEditor,
	MediaEmbed,
	MediaEmbedResizeEditing,
	MediaEmbedResizeButtons,
	MediaEmbedCustomResizeUI
} from 'ckeditor5';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ MediaEmbed, MediaEmbedResizeEditing, MediaEmbedResizeButtons, MediaEmbedCustomResizeUI, /* ... */ ],
		toolbar: [ 'mediaEmbed', /* ... */ ],
		mediaEmbed: {
			toolbar: [ 'resizeMediaEmbed' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Markup and styling

When a media embed is resized, the editor adds a `media_resized` class and an inline `width` style to the `<figure>` element (regardless of the `previewsInData` setting):

```html
<figure class="media media_resized" style="width:50%;">...</figure>
```

## Using pixel values instead of percentage width

By default, the resize values are expressed as percentages. To use pixel values instead, set `mediaEmbed.resizeUnit` to `'px'` and adjust the `resizeOptions` accordingly:

```js
ClassicEditor
	.create( {
		/* ... */
		mediaEmbed: {
			resizeUnit: 'px',
			resizeOptions: [
				{ name: 'resizeMediaEmbed:original', value: null,  icon: 'original' },
				{ name: 'resizeMediaEmbed:custom',   value: 'custom', icon: 'custom' },
				{ name: 'resizeMediaEmbed:200',      value: '200', icon: 'small'    },
				{ name: 'resizeMediaEmbed:400',      value: '400', icon: 'medium'   },
				{ name: 'resizeMediaEmbed:600',      value: '600', icon: 'large'    }
			],
			toolbar: [ 'resizeMediaEmbed' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Installation

The {@link module:media-embed/mediaembedresize~MediaEmbedResize} plugin is not loaded by default. Add it explicitly alongside {@link module:media-embed/mediaembed~MediaEmbed} to enable the feature. The `MediaEmbedResize` glue plugin loads all four sub-plugins automatically:

<code-switcher>
```js
import { ClassicEditor, MediaEmbed, MediaEmbedResize } from 'ckeditor5';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ MediaEmbed, MediaEmbedResize, /* ... */ ],
		toolbar: [ 'mediaEmbed', /* ... */ ],
		mediaEmbed: {
			toolbar: [ 'resizeMediaEmbed' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Common API

The {@link module:media-embed/mediaembedresize~MediaEmbedResize} plugin registers:

* {@link module:media-embed/mediaembedresize/mediaembedresizebuttons~MediaEmbedResizeButtons} — the toolbar buttons and dropdown plugin.
* {@link module:media-embed/mediaembedresize/mediaembedcustomresizeui~MediaEmbedCustomResizeUI} — the balloon with the custom-width input.
* the `'resizeMediaEmbed'` dropdown component registered in the component factory.
* standalone `'resizeMediaEmbed:<value>'` button components (one for each entry in `config.mediaEmbed.resizeOptions`).
* the `'resizeMediaEmbed'` command implemented by {@link module:media-embed/mediaembedresize/resizemediaembedcommand~ResizeMediaEmbedCommand}.

	You can resize the selected media embed or remove a previously-applied resize by executing the following code:

	```js
	// Resize the selected media to 50% width.
	editor.execute( 'resizeMediaEmbed', { width: '50%' } );

	// Remove the width to return to the default size.
	editor.execute( 'resizeMediaEmbed', { width: null } );
	```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed).
