---
category: features-media-embed
menu-title: Aligning media embeds
meta-title: Aligning media embeds | CKEditor 5 Documentation
meta-description: Align embedded videos and other media content within the surrounding content, with optional text wrapping.
order: 55
---

# Aligning media embeds

The media embed alignment feature lets you align media embeds (such as YouTube or Vimeo videos) in your content, with optional text wrapping. It is implemented by the {@link module:media-embed/mediaembedstyle~MediaEmbedStyle} plugin.

## Installation

The {@link module:media-embed/mediaembedstyle~MediaEmbedStyle} plugin is not loaded by default. Add it explicitly alongside {@link module:media-embed/mediaembed~MediaEmbed} to enable the feature:

<code-switcher>
```js
import { ClassicEditor, MediaEmbed, MediaEmbedStyle } from 'ckeditor5';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ MediaEmbed, MediaEmbedStyle, /* ... */ ],
		toolbar: [ 'mediaEmbed', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Alignment options

The plugin provides the following five alignment options. They can be exposed in the toolbar as individual buttons or grouped into two split-button dropdowns &ndash; see [Toolbar configuration](#toolbar-configuration) for the wiring.

Each non-default option is encoded as a CSS class on the media `<figure>` element (for example, `<figure class="media media-style-block-align-left">`). The default `alignCenter` option emits no class.

**Block alignments** &ndash; the media takes a full line, with surrounding text appearing above and below.

* {@icon @ckeditor/ckeditor5-icons/theme/icons/object-left.svg Left aligned media} **Left aligned** &ndash; button `mediaEmbed:alignBlockLeft`, class `media-style-block-align-left`.
* {@icon @ckeditor/ckeditor5-icons/theme/icons/object-center.svg Centered media} **Centered** &ndash; button `mediaEmbed:alignCenter`; default, no class.
* {@icon @ckeditor/ckeditor5-icons/theme/icons/object-right.svg Right aligned media} **Right aligned** &ndash; button `mediaEmbed:alignBlockRight`, class `media-style-block-align-right`.

**Wrap-text alignments** &ndash; the media floats to one side and surrounding text wraps around it.

* {@icon @ckeditor/ckeditor5-icons/theme/icons/object-inline-left.svg Left aligned media} **Left aligned** &ndash; button `mediaEmbed:alignLeft`, class `media-style-align-left`.
* {@icon @ckeditor/ckeditor5-icons/theme/icons/object-inline-right.svg Right aligned media} **Right aligned** &ndash; button `mediaEmbed:alignRight`, class `media-style-align-right`.

<info-box>
	The actual styling of the media embeds is the job of the integrator. CKEditor&nbsp;5 comes with some default styles, but they will only be applied to the media inside the editor. The integrator needs to style them appropriately on the target pages.

	You can find the source of the default styles applied by the editor here: [`ckeditor5-media-embed/theme/mediaembedstyle.css`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-media-embed/theme/mediaembedstyle.css).

	Read more about {@link getting-started/setup/css styling the content of the editor}.
</info-box>

## Toolbar configuration

You can wire the buttons into the {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar media embed contextual toolbar} in two ways.

**Compact (split-button dropdowns)**: exposes the two layout modes as separate dropdowns. The `mediaEmbed:wrapText` dropdown groups the wrap-text alignments; `mediaEmbed:breakText` groups the block alignments. Each dropdown's action button reflects whichever option from its group is currently applied to the selected media, falling back to the dropdown's default (`alignLeft` for wrap, `alignCenter` for break) when none is.

```js
mediaEmbed: {
	toolbar: [ 'mediaEmbed:wrapText', 'mediaEmbed:breakText' ]
}
```

**Flat (individual buttons)**: exposes all five options as separate buttons.

```js
mediaEmbed: {
	toolbar: [
		'mediaEmbed:alignLeft', 'mediaEmbed:alignBlockLeft',
		'mediaEmbed:alignCenter',
		'mediaEmbed:alignBlockRight', 'mediaEmbed:alignRight'
	]
}
```

## Interaction with resizing

<info-box hint>
	You should combine media embed alignment with the optional {@link features/media-embed-resize media embed resize feature} as these features were designed to be used together &ndash; resizing controls the width, alignment controls the position.

	If you do not enable the media embed resize feature, embeds span the full width of the editor by default and the alignment classes have no visible effect &ndash; the figure already occupies the full row. Alignment starts producing a visible effect once the figure is narrower than its container (via the resize feature, integrator-side CSS, or `style` preserved by other means).
</info-box>

The HTML representation of an aligned and {@link features/media-embed-resize resized} media embed looks like this:

```html
<figure class="media media_resized media-style-align-left" style="width:50%;">...</figure>
```

## Common API

The {@link module:media-embed/mediaembedstyle~MediaEmbedStyle} plugin registers:

* a button for each alignment option (`'mediaEmbed:alignLeft'`, `'mediaEmbed:alignBlockLeft'`, etc.) and two split-button dropdowns (`'mediaEmbed:wrapText'` and `'mediaEmbed:breakText'`), to use in the {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar media embed contextual toolbar}.
* the `'mediaStyle'` command implemented by {@link module:media-embed/mediaembedstyle/mediaembedstylecommand~MediaEmbedStyleCommand}.

	You can apply or clear the alignment on the selected media embed by executing the following code:

	```js
	// Float the selected media to the left so text wraps around it.
	editor.execute( 'mediaStyle', { value: 'alignLeft' } );

	// Clear the alignment to return to the default (centered) state.
	editor.execute( 'mediaStyle', { value: null } );
	```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed).
