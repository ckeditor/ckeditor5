---
category: features-media-embed
menu-title: Media embed styles
meta-title: Media embed styles | CKEditor 5 Documentation
meta-description: Apply alignment and other configurable styles to media embeds, with support for custom styles.
modified_at: 2026-05-21
order: 55
---

# Media embed styles

The media embed styles feature lets you apply a style (for example, an alignment) to a media embed such as a YouTube or Vimeo video, a Spotify player, and so on. It is implemented by the {@link module:media-embed/mediaembedstyle~MediaEmbedStyle} plugin.

Out of the box the plugin ships five alignment styles. You can pick a subset of the built-ins, override their labels or icons, or register completely new styles through {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}.

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

## Built-in styles

The plugin provides the following five style options out of the box. Each option registers a toolbar button under the name `mediaEmbed:<style-name>` (used to place it in `config.mediaEmbed.toolbar`) and, for non-default styles, applies a CSS class to the media `<figure>` element. The default `alignCenter` option emits no class.

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

The demo below shows the five built-in alignment styles, wired through the two compact split-button dropdowns and combined with the {@link features/media-embed-resize media embed resize feature}. Select a figure and try the **Wrap text** and **Break text** dropdowns in its contextual toolbar &ndash; the action button reflects whichever alignment is currently applied.

{@snippet features/media-embed-styles-default}

## Configuring the styles

You can customize the set of available styles through {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}. The configuration accepts an `options` array whose entries can be:

* a **string** referencing a built-in style by name (`'alignLeft'`, `'alignBlockLeft'`, `'alignCenter'`, `'alignBlockRight'`, `'alignRight'`),
* an **object** whose `name` matches a built-in (its fields are shallow-merged on top of the built-in),
* an **object** with a new `name` (a fully custom style). See {@link module:media-embed/mediaembedconfig~MediaStyleOptionDefinition} for the required and optional fields.

When `config.mediaEmbed.styles` is not provided, all five built-in styles are available. This is the default behavior.

<info-box warning>
	When a configured style option misses a required field (`name`, `title`, `icon`, or `className` for non-default styles), or references an unknown built-in name, the entry is dropped from the resolved options and a console warning is emitted under the `media-style-configuration-definition-invalid` error code. The other valid entries continue to work as configured.
</info-box>

### Picking a subset of built-in styles

Pass only the styles you want to expose. Filtered-out styles disappear from the toolbar and cannot be applied through the `'mediaStyle'` command.

```js
mediaEmbed: {
	styles: {
		options: [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ]
	}
}
```

In the example above the wrap-text floats (`alignLeft`, `alignRight`) are dropped. The `mediaEmbed:wrapText` dropdown auto-skips because both of its items were filtered out, and only the three block alignments remain.

### Overriding a built-in style

To customize a built-in style, pass an object whose `name` matches the built-in plus the fields you want to change. Fields you set replace the built-in's defaults. Fields you omit are inherited.

```js
mediaEmbed: {
	styles: {
		options: [
			'alignLeft',
			{ name: 'alignCenter', title: 'Center' },
			'alignRight'
		]
	}
}
```

### Adding a custom style

To add a custom style, supply an object with a fresh `name`, a `title`, an `icon`, and a `className`. You own the CSS for the resulting class. The plugin only writes the class to the figure when the style is applied.

```js
import sideMediaIcon from 'path/to/side-media.svg';

ClassicEditor
	.create( {
		// ... Other configuration options ...
		mediaEmbed: {
			toolbar: [ 'mediaEmbed:alignCenter', 'mediaEmbed:side' ],
			styles: {
				options: [
					'alignCenter',
					{
						name: 'side',
						title: 'Side media',
						icon: sideMediaIcon,
						className: 'media-style-side'
					}
				]
			}
		}
	} );
```

<info-box hint>
	The `icon` field accepts either a full SVG XML string (as shown above) or one of the short aliases shipped with the plugin: `'inlineLeft'`, `'left'`, `'center'`, `'right'`, `'inlineRight'`.
</info-box>

```css
/* Your CSS for the custom style. */
.ck-content .media.media-style-side {
	float: right;
	margin: 0 0 1em 1.5em;
	clear: none;
	box-shadow: 0 4px 16px rgba( 0, 0, 0, 0.2 );
}
```

The same mechanism supports purely semantical styles. There is no requirement that a custom style be alignment-flavored.

To group several custom styles under a single split button in the toolbar, see [Custom split-button dropdowns](#toolbar-configuration) below.

### Custom default style

To mark a style as the default, set `isDefault: true`. Default styles do not need a `className` because the default state is encoded on the model as the absence of the `mediaStyle` attribute, so no class is written to the view. Applying a default style clears any other style that was previously set.

```js
import naturalIcon from 'path/to/natural.svg';

mediaEmbed: {
	styles: {
		options: [
			'alignBlockLeft',
			{
				name: 'natural',
				title: 'Natural position',
				icon: naturalIcon,
				isDefault: true
			},
			'alignBlockRight'
		]
	}
}
```

<info-box warning>
	Only one style should be marked as the default. If multiple are marked, the first one in the resolved options wins. If none is marked, the command has no default. In that case, `command.value` is `false` whenever the selected media has no `mediaStyle` attribute.
</info-box>

### Demo

The demo below replaces the built-in alignments with three custom semantic styles &ndash; a Featured frame and two side asides grouped in a custom split-button dropdown. Select a figure to open the contextual toolbar.

{@snippet features/media-embed-styles-custom}

## Toolbar configuration

Each entry in {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `config.mediaEmbed.toolbar`} is either a built-in component name (string) or an inline split-button dropdown definition (object). You can mix them freely.

**Built-in dropdowns**: `mediaEmbed:wrapText` groups the wrap-text alignments and `mediaEmbed:breakText` groups the block alignments. Each dropdown's action button reflects whichever option from its group is currently applied to the selected media, falling back to the dropdown's default (`alignLeft` for wrap, `alignCenter` for break) when none is applied. A dropdown is skipped automatically when fewer than two of its items survive your style configuration.

```js
mediaEmbed: {
	toolbar: [ 'mediaEmbed:wrapText', 'mediaEmbed:breakText' ]
}
```

**Flat buttons**: every style is also exposed as an individual button named `mediaEmbed:<style-name>`.

```js
mediaEmbed: {
	toolbar: [
		'mediaEmbed:alignLeft', 'mediaEmbed:alignBlockLeft',
		'mediaEmbed:alignCenter',
		'mediaEmbed:alignBlockRight', 'mediaEmbed:alignRight'
	]
}
```

**Custom split-button dropdowns**: declare your own grouping inline, alongside built-in entries. The definition follows the {@link module:media-embed/mediaembedconfig~MediaStyleDropdownDefinition} shape &ndash; `name`, `title`, `items`, `defaultItem` &ndash; and all names use the full `mediaEmbed:` prefix.

```js
mediaEmbed: {
	toolbar: [
		'mediaEmbed:alignCenter',
		{
			name: 'mediaEmbed:myAlignments',
			title: 'Alignment',
			items: [ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignBlockRight' ],
			defaultItem: 'mediaEmbed:alignBlockLeft'
		}
	]
}
```

Custom dropdowns inherit the same item-filtering and skip behavior as the built-in dropdowns:

* Items referencing styles that are not in the resolved `config.mediaEmbed.styles.options` list are filtered out at registration time. For custom dropdowns this also emits a console warning under `media-style-configuration-definition-invalid` so you know the config was not fully honored. Built-in dropdowns auto-skip silently.
* A dropdown that ends up with fewer than two items is skipped entirely.
* If the configured `defaultItem` was filtered out, the first surviving item becomes the new default.

A dropdown definition is also dropped (with the same warning) when its `name` lacks the `mediaEmbed:` prefix, `items` is empty or contains non-prefixed entries, `defaultItem` is not one of `items`, or `title` is empty.

## Interaction with resizing

<info-box hint>
	If you use the built-in alignment styles, you should combine them with the optional {@link features/media-embed-resize media embed resize feature} as the two features were designed to be used together: resizing controls the width, alignment controls the position.

	Without the resize feature, embeds span the full width of the editor by default and the alignment classes have no visible effect, because the figure already occupies the full row. Alignment starts producing a visible effect once the figure is narrower than its container (via the resize feature, your own CSS, or `style` preserved by other means).

	Custom non-alignment styles (for example, a drop shadow or border treatment) do not depend on width and work regardless of whether resizing is enabled.
</info-box>

The HTML representation of an aligned and {@link features/media-embed-resize resized} media embed looks like this:

```html
<figure class="media media_resized media-style-align-left" style="width:50%;">...</figure>
```

## Common API

The {@link module:media-embed/mediaembedstyle~MediaEmbedStyle} plugin registers:

* A button for each style option, for example `'mediaEmbed:alignLeft'` and `'mediaEmbed:alignCenter'` (to use in the media embed contextual toolbar).
* Two built-in split-button dropdowns: `'mediaEmbed:wrapText'` and `'mediaEmbed:breakText'`. Each is skipped automatically when fewer than two of its items survive your style configuration.
* Any custom split-button dropdowns declared inline in {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `config.mediaEmbed.toolbar`}.
* The {@link module:media-embed/mediaembedstyle/mediaembedstylecommand~MediaEmbedStyleCommand `'mediaStyle'` command}. It accepts a value matching one of the resolved {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles configured options}:

	```js
	// Float the selected media to the left so text wraps around it.
	editor.execute( 'mediaStyle', { value: 'alignLeft' } );

	// Clear the style to return to the default state.
	editor.execute( 'mediaStyle', { value: null } );
	```

	Values outside the resolved options are silently rejected. Passing the effective default name (or `null`) always clears the attribute.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed).
