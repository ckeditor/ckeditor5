/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedconfig
 */

import type { ToolbarConfigItem } from '@ckeditor/ckeditor5-core';
import type { ArrayOrItem } from '@ckeditor/ckeditor5-utils';

/**
 * The configuration of the media embed features.
 *
 * Read more about {@glink features/media-embed/media-embed-configuration configuring the media embed feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 			mediaEmbed: ... // Media embed feature options.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface MediaEmbedConfig {

	/**
	 * The default media providers supported by the editor.
	 *
	 * The names of providers with rendering functions (previews):
	 *
	 * * "dailymotion",
	 * * "spotify",
	 * * "youtube",
	 * * "vimeo"
	 *
	 * The names of providers without rendering functions:
	 *
	 * * "instagram",
	 * * "twitter",
	 * * "googleMaps",
	 * * "flickr",
	 * * "facebook"
	 *
	 * See the {@link module:media-embed/mediaembedconfig~MediaEmbedProvider provider syntax} to learn more about
	 * different kinds of media and media providers.
	 *
	 * **Note**: The default media provider configuration may not support all possible media URLs,
	 * only the most common are included.
	 *
	 * Media without rendering functions are always represented in the data using the "semantic" markup. See
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#previewsInData `config.mediaEmbed.previewsInData`} to
	 * learn more about possible data outputs.
	 *
	 * The priority of media providers corresponds to the order of configuration. The first provider
	 * to match the URL is always used, even if there are other providers that support a particular URL.
	 * The URL is never matched against the remaining providers.
	 *
	 * To discard **all** default media providers, simply override this configuration with your own
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedProvider definitions}:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		plugins: [ MediaEmbed, ... ],
	 * 		mediaEmbed: {
	 * 			providers: [
	 * 				{
	 * 					 name: 'myProvider',
	 * 					 url: /^example\.com\/media\/(\w+)/,
	 * 					 html: match => '...'
	 * 				},
	 * 				...
	 * 				]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * You can take inspiration from the default configuration of this feature which you can find in:
	 * https://github.com/ckeditor/ckeditor5-media-embed/blob/master/src/mediaembedediting.js
	 *
	 * To **extend** the list of default providers, use
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.
	 *
	 * To **remove** certain providers, use
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#removeProviders `config.mediaEmbed.removeProviders`}.
	 */
	providers?: Array<MediaEmbedProvider>;

	/**
	 * The additional media providers supported by the editor. This configuration helps extend the default
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#providers}.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		plugins: [ MediaEmbed, ... ],
	 * 		mediaEmbed: {
	 * 			extraProviders: [
	 * 				{
	 * 					 name: 'extraProvider',
	 * 					 url: /^example\.com\/media\/(\w+)/,
	 * 					 html: match => '...'
	 * 				},
	 * 				...
	 * 				]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * See the {@link module:media-embed/mediaembedconfig~MediaEmbedProvider provider syntax} to learn more.
	 */
	extraProviders?: Array<MediaEmbedProvider>;

	/**
	 * The list of media providers that should not be used despite being available in
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	removeProviders: [ 'youtube', 'twitter' ]
	 * }
	 * ```
	 */
	removeProviders?: Array<string>;

	/**
	 * Overrides the element name used for "semantic" data.
	 *
	 * This is not relevant if
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#previewsInData `config.mediaEmbed.previewsInData`} is set to `true`.
	 *
	 * When not set, the feature produces the `<oembed>` tag:
	 *
	 * ```html
	 * <figure class="media">
	 * 	<oembed url="https://url"></oembed>
	 * </figure>
	 * ```
	 *
	 * To override the element name with, for instance, the `o-embed` name:
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	elementName: 'o-embed'
	 * }
	 * ```
	 *
	 * This will produce semantic data with the `<o-embed>` tag:
	 *
	 * ```html
	 * <figure class="media">
	 * 	<o-embed url="https://url"></o-embed>
	 * </figure>
	 * ```
	 *
	 * @default 'oembed'
	 */
	elementName?: string;

	/**
	 * Controls the data format produced by the feature.
	 *
	 * When `false` (default), the feature produces "semantic" data, i.e. it does not include the preview of
	 * the media, just the `<oembed>` tag with the `url` attribute:
	 *
	 * ```ts
	 * <figure class="media">
	 * 	<oembed url="https://url"></oembed>
	 * </figure>
	 * ```
	 *
	 * When `true`, the media is represented in the output in the same way it looks in the editor,
	 * i.e. the media preview is saved to the database:
	 *
	 * ```ts
	 * <figure class="media">
	 * 	<div data-oembed-url="https://url">
	 * 		<iframe src="https://preview"></iframe>
	 * 	</div>
	 * </figure>
	 * ```
	 *
	 * **Note:** Media without preview are always represented in the data using the "semantic" markup
	 * regardless of the value of the `previewsInData`. Learn more about different kinds of media
	 * in the {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#providers `config.mediaEmbed.providers`}
	 * configuration description.
	 *
	 * @default false
	 */
	previewsInData?: boolean;

	/**
	 * Items to be placed in the media embed toolbar.
	 * This option requires adding {@link module:media-embed/mediaembedtoolbar~MediaEmbedToolbar} to the plugin list.
	 *
	 * Each entry is one of:
	 *
	 * * a component name (string) — including the built-in alignment buttons (e.g. `'mediaEmbed:alignCenter'`)
	 *   and built-in dropdowns (`'mediaEmbed:wrapText'`, `'mediaEmbed:breakText'`),
	 * * a custom split-button media style dropdown definition (object) following the
	 *   {@link module:media-embed/mediaembedconfig~MediaStyleDropdownDefinition} shape — registered
	 *   alongside the built-in dropdowns and inheriting the same auto-skip / fallback-defaultItem behavior,
	 * * a generic nested toolbar grouping (`{ label, items }`) — same shape as in
	 *   {@link module:core/editor/editorconfig~EditorConfig#toolbar `config.toolbar`}.
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	toolbar: [
	 * 		'mediaEmbed:alignCenter',
	 * 		{
	 * 			name: 'mediaEmbed:myAlignments',
	 * 			title: 'Alignment',
	 * 			items: [ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignBlockRight' ],
	 * 			defaultItem: 'mediaEmbed:alignBlockLeft'
	 * 		}
	 * 	]
	 * }
	 * ```
	 */
	toolbar?: Array<ToolbarConfigItem | MediaStyleDropdownDefinition>;

	/**
	 * The {@link module:media-embed/mediaembedstyle~MediaEmbedStyle media embed style} feature configuration.
	 *
	 * Available out of the box: five built-in alignment styles — `'alignLeft'`, `'alignBlockLeft'`,
	 * `'alignCenter'` (default), `'alignBlockRight'`, `'alignRight'`.
	 *
	 * Restrict the set to a subset of built-ins:
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	styles: {
	 * 		options: [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ]
	 * 	}
	 * }
	 * ```
	 *
	 * Override fields of a built-in by re-declaring with the same `name`:
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	styles: {
	 * 		options: [
	 * 			{ name: 'alignCenter', title: 'Center' },
	 * 			'alignLeft',
	 * 			'alignRight'
	 * 		]
	 * 	}
	 * }
	 * ```
	 *
	 * Register a custom (e.g. semantical) style by supplying a complete definition:
	 *
	 * ```ts
	 * import sideIcon from 'path/to/icon.svg';
	 *
	 * mediaEmbed: {
	 * 	styles: {
	 * 		options: [
	 * 			'alignCenter',
	 * 			{
	 * 				name: 'side',
	 * 				title: 'Side media',
	 * 				icon: sideIcon,
	 * 				className: 'media-style-side'
	 * 			}
	 * 		]
	 * 	}
	 * }
	 * ```
	 *
	 * When omitted, all five built-in styles are available.
	 */
	styles?: MediaStyleConfig;

	/**
	 * The resize unit applied to the media width.
	 *
	 * Possible values: `'%'` (default) or `'px'`.
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	resizeUnit: 'px'
	 * }
	 * ```
	 *
	 * @default '%'
	 */
	resizeUnit?: 'px' | '%';

	/**
	 * The available media resize options.
	 *
	 * Used to populate the resize dropdown (`'resizeMediaEmbed'`) or the standalone resize buttons
	 * (`'resizeMediaEmbed:25'`, `'resizeMediaEmbed:original'`, etc.) placed in
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `config.mediaEmbed.toolbar`}.
	 *
	 * Example — dropdown form:
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	toolbar: [ 'resizeMediaEmbed' ],
	 * 	resizeOptions: [
	 * 		{ name: 'resizeMediaEmbed:original', value: null, icon: 'original' },
	 * 		{ name: 'resizeMediaEmbed:25',       value: '25',  icon: 'small'   },
	 * 		{ name: 'resizeMediaEmbed:50',       value: '50',  icon: 'medium'  },
	 * 		{ name: 'resizeMediaEmbed:75',       value: '75',  icon: 'large'   },
	 * 		{ name: 'resizeMediaEmbed:custom',   value: 'custom', icon: 'custom' }
	 * 	]
	 * }
	 * ```
	 *
	 * Example — standalone buttons form:
	 *
	 * ```ts
	 * mediaEmbed: {
	 * 	toolbar: [ 'resizeMediaEmbed:25', 'resizeMediaEmbed:50', 'resizeMediaEmbed:75',
	 * 	           'resizeMediaEmbed:original', 'resizeMediaEmbed:custom' ],
	 * 	resizeOptions: [
	 * 		{ name: 'resizeMediaEmbed:original', value: null,     icon: 'original' },
	 * 		{ name: 'resizeMediaEmbed:custom',   value: 'custom', icon: 'custom'   },
	 * 		{ name: 'resizeMediaEmbed:25',       value: '25',     icon: 'small'    },
	 * 		{ name: 'resizeMediaEmbed:50',       value: '50',     icon: 'medium'   },
	 * 		{ name: 'resizeMediaEmbed:75',       value: '75',     icon: 'large'    }
	 * 	]
	 * }
	 * ```
	 */
	resizeOptions?: Array<MediaEmbedResizeOption>;
}

/**
 * The media embed resize option used in the
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#resizeOptions `config.mediaEmbed.resizeOptions`} configuration.
 */
export interface MediaEmbedResizeOption {

	/**
	 * The name of the UI component that changes the media size.
	 * When placing individual resize buttons in the toolbar, reference this name directly.
	 * When using the dropdown, this name is used for the corresponding list item.
	 */
	name: string;

	/**
	 * The numeric resize value without the unit
	 * ({@link module:media-embed/mediaembedconfig~MediaEmbedConfig#resizeUnit configured separately}).
	 * `null` resets the media to its original (unresized) width. `'custom'` opens the custom-size balloon.
	 */
	value: string | null;

	/**
	 * The icon displayed on the button. Available icons: `'small'`, `'medium'`, `'large'`, `'original'`, `'custom'`.
	 */
	icon?: string;

	/**
	 * The option label shown in the dropdown or used as button tooltip and ARIA label.
	 * When not specified, the label is generated automatically from the `value` and
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#resizeUnit `config.mediaEmbed.resizeUnit`}.
	 */
	label?: string;
}

/**
 * The configuration for the {@link module:media-embed/mediaembedstyle~MediaEmbedStyle} feature.
 *
 * See {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}
 * for details and examples.
 */
export interface MediaStyleConfig {

	/**
	 * A list of media style options. Each entry is either:
	 *
	 * * a string referencing a built-in style by name (`'alignLeft'`, `'alignBlockLeft'`,
	 *   `'alignCenter'`, `'alignBlockRight'`, `'alignRight'`),
	 * * an object overriding fields of a built-in (matched by `name`),
	 * * an object defining a new custom style.
	 *
	 * Defaults to all five built-in styles when omitted.
	 */
	options?: Array<string | MediaStyleOptionDefinition>;
}

/**
 * The definition of a single media style option used by the
 * {@link module:media-embed/mediaembedstyle~MediaEmbedStyle media embed style} feature.
 *
 * To customize a built-in style, re-declare it with the same `name` — only the fields
 * you set will be replaced; the rest are inherited from the built-in. To register a
 * brand-new style, provide a fresh `name` and a complete definition (`title`, `icon`,
 * and — unless `isDefault: true` — `className`).
 *
 * ```ts
 * import sideIcon from 'path/to/icon.svg';
 *
 * const sideStyle = {
 * 	name: 'side',
 * 	title: 'Side media',
 * 	icon: sideIcon,
 * 	className: 'media-style-side'
 * };
 * ```
 *
 * Each option registers a toggle button under the name `'mediaEmbed:{name}'` in the
 * {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 */
export interface MediaStyleOptionDefinition {

	/**
	 * The unique style name. It is used to:
	 *
	 * * reference a built-in style or define a custom one,
	 * * store the chosen style in the model as the `mediaStyle` attribute,
	 * * register the toolbar button under `'mediaEmbed:{name}'`.
	 */
	name: string;

	/**
	 * The button title. The title is wrapped in `editor.t()` at button creation,
	 * so titles that match keys in the official translation set will be localized
	 * automatically.
	 *
	 * Required when defining a custom style. Inherited from the built-in style with
	 * the matching `name` when overriding a built-in.
	 */
	title?: string;

	/**
	 * The button icon. Either an SVG XML source string, or one of the keys in
	 * `DEFAULT_ICONS` (`'inlineLeft'`, `'left'`, `'center'`, `'right'`, `'inlineRight'`)
	 * to use one of the icons shipped with the plugin.
	 *
	 * Required when defining a custom style. Inherited from the built-in style with
	 * the matching `name` when overriding a built-in.
	 */
	icon?: string;

	/**
	 * The CSS class added to the view `<figure>` when this style is applied. Required
	 * for every non-default style — default styles are encoded as the absence of the
	 * `mediaStyle` attribute, so they intentionally have no class.
	 *
	 * Inherited from the built-in style with the matching `name` when not set.
	 */
	className?: string;

	/**
	 * When `true`, this style is the default state — applying it removes the
	 * `mediaStyle` attribute from the model element (no class is written to the view).
	 * Default styles must not define a `className`.
	 *
	 * Inherited from the built-in style with the matching `name` when not set.
	 */
	isDefault?: boolean;
}

/**
 * A media style option resolved by the normalizer — built-in inheritance has been applied
 * and {@link module:media-embed/mediaembedstyle/utils~normalizeStyles} has already verified
 * the required fields. UI and editing internals consume this shape.
 *
 * @internal
 */
export type NormalizedMediaStyleOption =
	Required<Pick<MediaStyleOptionDefinition, 'name' | 'title' | 'icon'>>
	& Pick<MediaStyleOptionDefinition, 'className' | 'isDefault'>;

/**
 * The definition of a split-button dropdown that groups several media style buttons.
 *
 * Integrators can declare custom dropdowns inline in
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `config.mediaEmbed.toolbar`}
 * alongside button-name strings; `defaultItem` is the discriminator that distinguishes a
 * split-button media style dropdown from a generic toolbar grouping.
 *
 * ```ts
 * mediaEmbed: {
 * 	toolbar: [
 * 		'mediaEmbed:alignCenter',
 * 		{
 * 			name: 'mediaEmbed:myAlignments',
 * 			title: 'Alignment',
 * 			items: [ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignBlockRight' ],
 * 			defaultItem: 'mediaEmbed:alignBlockLeft'
 * 		}
 * 	]
 * }
 * ```
 *
 * All names (`name`, `items[]`, `defaultItem`) use the full prefixed component-factory form.
 * Items referencing styles that are not in the resolved
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`} list
 * are filtered out at registration time. A dropdown that ends up with fewer than two items is
 * skipped. If the configured `defaultItem` was filtered out, the first surviving item is used.
 */
export interface MediaStyleDropdownDefinition {

	/**
	 * The dropdown name. Registered as-is in the UI component factory, so it must use the
	 * `mediaEmbed:` prefix (for example, `'mediaEmbed:myAlignments'`).
	 */
	name: string;

	/**
	 * The dropdown title, used both for the split-button label and the dropdown arrow tooltip.
	 */
	title: string;

	/**
	 * Prefixed style names included in the dropdown (for example,
	 * `[ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignBlockRight' ]`).
	 */
	items: Array<string>;

	/**
	 * The default child whose icon and label the split button mirrors when no child is active.
	 * Must be one of the `items`.
	 */
	defaultItem: string;
}

/**
 * The media embed provider descriptor. Used in
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.
 *
 * See {@link module:media-embed/mediaembedconfig~MediaEmbedConfig} to learn more.
 *
 * ```ts
 * {
 * 	name: 'example',
 *
 * 	// The following RegExp matches https://www.example.com/media/{media id},
 * 	// (either with "http(s)://" and "www" or without), so the valid URLs are:
 * 	//
 * 	// * https://www.example.com/media/{media id},
 * 	// * http://www.example.com/media/{media id},
 * 	// * www.example.com/media/{media id},
 * 	// * example.com/media/{media id}
 * 	url: /^example\.com\/media\/(\w+)/,
 *
 * 	// The rendering function of the provider.
 * 	// Used to represent the media when editing the content (i.e. in the view)
 * 	// and also in the data output of the editor if semantic data output is disabled.
 * 	html: match => `The HTML representing the media with ID=${ match[ 1 ] }.`
 * }
 * ```
 *
 * You can allow any sort of media in the editor using the "allow–all" `RegExp`.
 * But mind that, since URLs are processed in the order of configuration, if one of the previous
 * `RegExps` matches the URL, it will have a precedence over this one.
 *
 * ```ts
 * {
 * 	name: 'allow-all',
 * 	url: /^.+/
 * }
 * ```
 *
 * To implement responsive media, set an `aspect-ratio` on the iframe. The HTML `width` and
 * `height` attributes act as the intrinsic size (useful for layout hints in containers like
 * table cells), while CSS `width: 100%` and `height: auto` make the element scale with its
 * container while preserving the declared aspect ratio. The iframe is wrapped in a plain
 * `<div>` so external styles or queries that target this wrapper continue to work:
 *
 * ```ts
 * {
 * 	...
 * 	html: match =>
 * 		'<div>' +
 * 			`<iframe src="..." width="1280" height="720" ` +
 * 				`style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;" ` +
 * 				'frameborder="0" allowfullscreen>' +
 * 			'</iframe>' +
 * 		'</div>'
 * }
 * ```
 */
export interface MediaEmbedProvider {

	/**
	 * The name of the provider. Used e.g. when
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#removeProviders removing providers}.
	 */
	name: string;

	/**
	 * The `RegExp` object (or array of objects) defining the URL of the media.
	 * If any URL matches the `RegExp`, it becomes the media in the editor model, as defined by the provider. The result
	 * of matching (output of `String.prototype.match()`) is passed to the `html` rendering function of the media.
	 *
	 * **Note:** You do not need to include the protocol (`http://`, `https://`) and `www` subdomain in your `RegExps`,
	 * they are stripped from the URLs before matching anyway.
	 */
	url: ArrayOrItem<RegExp>;

	/**
	 * The rendering function of the media. The function receives the entire matching
	 * array from the corresponding `url` `RegExp` as an argument, allowing rendering a dedicated
	 * preview of the media identified by a certain ID or a hash. When not defined, the media embed feature
	 * will use a generic media representation in the view and output data.
	 * Note that when
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#previewsInData `config.mediaEmbed.previewsInData`}
	 * is `true`, the rendering function **will always** be used for the media in the editor data output.
	 */
	html?: ( match: RegExpMatchArray ) => string;
}
