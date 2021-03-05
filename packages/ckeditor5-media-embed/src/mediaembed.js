/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembed
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import MediaEmbedEditing from './mediaembedediting';
import AutoMediaEmbed from './automediaembed';
import MediaEmbedUI from './mediaembedui';

import '../theme/mediaembed.css';

/**
 * The media embed plugin.
 *
 * For a detailed overview, check the {@glink features/media-embed Media Embed feature documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:media-embed/mediaembedediting~MediaEmbedEditing media embed editing feature},
 * * The {@link module:media-embed/mediaembedui~MediaEmbedUI media embed UI feature} and
 * * The {@link module:media-embed/automediaembed~AutoMediaEmbed auto-media embed feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MediaEmbedEditing, MediaEmbedUI, AutoMediaEmbed, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MediaEmbed';
	}
}

/**
 * The media embed provider descriptor. Used in
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.
 *
 * See {@link module:media-embed/mediaembed~MediaEmbedConfig} to learn more.
 *
 *		{
 *			name: 'example',
 *
 *			// The following RegExp matches https://www.example.com/media/{media id},
 *			// (either with "http(s)://" and "www" or without), so the valid URLs are:
 *			//
 *			// * https://www.example.com/media/{media id},
 *			// * http://www.example.com/media/{media id},
 *			// * www.example.com/media/{media id},
 *			// * example.com/media/{media id}
 *			url: /^example\.com\/media\/(\w+)/,
 *
 *			// The rendering function of the provider.
 *			// Used to represent the media when editing the content (i.e. in the view)
 *			// and also in the data output of the editor if semantic data output is disabled.
 *			html: match => `The HTML representing the media with ID=${ match[ 1 ] }.`
 *		}
 *
 * You can allow any sort of media in the editor using the "allow–all" `RegExp`.
 * But mind that, since URLs are processed in the order of configuration, if one of the previous
 * `RegExps` matches the URL, it will have a precedence over this one.
 *
 *		{
 *			name: 'allow-all',
 *			url: /^.+/
 *		}
 *
 * To implement responsive media, you can use the following HTML structure:
 *
 *		{
 *			...
 *			html: match =>
 *				'<div style="position:relative; padding-bottom:100%; height:0">' +
 *					'<iframe src="..." frameborder="0" ' +
 *						'style="position:absolute; width:100%; height:100%; top:0; left:0">' +
 *					'</iframe>' +
 *				'</div>'
 *		}
 *
 * @typedef {Object} module:media-embed/mediaembed~MediaEmbedProvider
 * @property {String} name The name of the provider. Used e.g. when
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#removeProviders removing providers}.
 * @property {RegExp|Array.<RegExp>} url The `RegExp` object (or array of objects) defining the URL of the media.
 * If any URL matches the `RegExp`, it becomes the media in the editor model, as defined by the provider. The result
 * of matching (output of `String.prototype.match()`) is passed to the `html` rendering function of the media.
 *
 * **Note:** You do not need to include the protocol (`http://`, `https://`) and `www` subdomain in your `RegExps`,
 * they are stripped from the URLs before matching anyway.
 * @property {Function} [html] (optional) The rendering function of the media. The function receives the entire matching
 * array from the corresponding `url` `RegExp` as an argument, allowing rendering a dedicated
 * preview of the media identified by a certain ID or a hash. When not defined, the media embed feature
 * will use a generic media representation in the view and output data.
 * Note that when
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#previewsInData `config.mediaEmbed.previewsInData`}
 * is `true`, the rendering function **will always** be used for the media in the editor data output.
 */

/**
 * The configuration of the {@link module:media-embed/mediaembed~MediaEmbed} feature.
 *
 * Read more in {@link module:media-embed/mediaembed~MediaEmbedConfig}.
 *
 * @member {module:media-embed/mediaembed~MediaEmbedConfig} module:core/editor/editorconfig~EditorConfig#mediaEmbed
 */

/**
 * The configuration of the media embed features.
 *
 * Read more about {@glink features/media-embed#configuration configuring the media embed feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				mediaEmbed: ... // Media embed feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface MediaEmbedConfig
 */

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
 * See the {@link module:media-embed/mediaembed~MediaEmbedProvider provider syntax} to learn more about
 * different kinds of media and media providers.
 *
 * **Note**: The default media provider configuration may not support all possible media URLs,
 * only the most common are included.
 *
 * Media without rendering functions are always represented in the data using the "semantic" markup. See
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#previewsInData `config.mediaEmbed.previewsInData`} to
 * learn more about possible data outputs.
 *
 * The priority of media providers corresponds to the order of configuration. The first provider
 * to match the URL is always used, even if there are other providers that support a particular URL.
 * The URL is never matched against the remaining providers.
 *
 * To discard **all** default media providers, simply override this configuration with your own
 * {@link module:media-embed/mediaembed~MediaEmbedProvider definitions}:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				plugins: [ MediaEmbed, ... ],
 *				mediaEmbed: {
 *					providers: [
 *						{
 *							 name: 'myProvider',
 *							 url: /^example\.com\/media\/(\w+)/,
 *							 html: match => '...'
 *						},
 *						...
 * 					]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * You can take inspiration from the default configuration of this feature which you can find in:
 * https://github.com/ckeditor/ckeditor5-media-embed/blob/master/src/mediaembedediting.js
 *
 * To **extend** the list of default providers, use
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.
 *
 * To **remove** certain providers, use
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#removeProviders `config.mediaEmbed.removeProviders`}.
 *
 * @member {Array.<module:media-embed/mediaembed~MediaEmbedProvider>} module:media-embed/mediaembed~MediaEmbedConfig#providers
 */

/**
 * The additional media providers supported by the editor. This configuration helps extend the default
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#providers}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				plugins: [ MediaEmbed, ... ],
 *				mediaEmbed: {
 *					extraProviders: [
 *						{
 *							 name: 'extraProvider',
 *							 url: /^example\.com\/media\/(\w+)/,
 *							 html: match => '...'
 *						},
 *						...
 * 					]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See the {@link module:media-embed/mediaembed~MediaEmbedProvider provider syntax} to learn more.
 *
 * @member {Array.<module:media-embed/mediaembed~MediaEmbedProvider>} module:media-embed/mediaembed~MediaEmbedConfig#extraProviders
 */

/**
 * The list of media providers that should not be used despite being available in
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}
 *
 *		mediaEmbed: {
 *			removeProviders: [ 'youtube', 'twitter' ]
 *		}
 *
 * @member {Array.<String>} module:media-embed/mediaembed~MediaEmbedConfig#removeProviders
 */

/**
 * Controls the data format produced by the feature.
 *
 * When `false` (default), the feature produces "semantic" data, i.e. it does not include the preview of
 * the media, just the `<oembed>` tag with the `url` attribute:
 *
 *		<figure class="media">
 *			<oembed url="https://url"></oembed>
 *		</figure>
 *
 * When `true`, the media is represented in the output in the same way it looks in the editor,
 * i.e. the media preview is saved to the database:
 *
 *		<figure class="media">
 *			<div data-oembed-url="https://url">
 *				<iframe src="https://preview"></iframe>
 *			</div>
 *		</figure>
 *
 * **Note:** Media without preview are always represented in the data using the "semantic" markup
 * regardless of the value of the `previewsInData`. Learn more about different kinds of media
 * in the {@link module:media-embed/mediaembed~MediaEmbedConfig#providers `config.mediaEmbed.providers`}
 * configuration description.
 *
 * @member {Boolean} [module:media-embed/mediaembed~MediaEmbedConfig#previewsInData=false]
 */
