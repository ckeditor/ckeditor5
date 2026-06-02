---
category: features-media-embed
menu-title: Resizing media embeds
meta-title: Resizing media embeds | CKEditor 5 Documentation
meta-description: Resize embedded videos and other media content directly in CKEditor 5.
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

## Installation

The {@link module:media-embed/mediaembedresize~MediaEmbedResize} plugin is not loaded by default. Add it explicitly alongside {@link module:media-embed/mediaembed~MediaEmbed} to enable the feature:

<code-switcher>
```js
import { ClassicEditor, MediaEmbed, MediaEmbedResize } from 'ckeditor5';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ MediaEmbed, MediaEmbedResize, /* ... */ ],
		toolbar: [ 'mediaEmbed', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Resizing with handles

When enabled, selecting a media widget shows four corner resize handles. Dragging a handle resizes the embed proportionally while preserving its aspect ratio.

When a media embed is resized, the editor saves a `media_resized` class and an inline `width` style on the `<figure>` element (regardless of the `previewsInData` setting):

```html
<figure class="media media_resized" style="width:50%;">...</figure>
```

## Common API

The {@link module:media-embed/mediaembedresize~MediaEmbedResize} plugin registers:

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
