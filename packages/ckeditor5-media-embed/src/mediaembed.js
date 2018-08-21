/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/mediaembed
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import MediaEmbedEditing from './mediaembedediting';
import MediaEmbedUI from './mediaembedui';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import '../theme/mediaembed.css';

/**
 * The media embed plugin.
 *
 * It loads the {@link module:media-embed/mediaembedediting~MediaEmbedEditing media embed editing feature}
 * and {@link module:media-embed/mediaembedui~MediaEmbedUI media embed UI feature}.
 *
 * For a detailed overview, check the {@glink features/mediaembed Media Embed feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MediaEmbedEditing, MediaEmbedUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MediaEmbed';
	}
}

/**
 * The configuration of the {@link module:media-embed/mediaembed~MediaEmbed} feature.
 *
 * Read more in {@link module:media-embed/mediaembed~MediaEmbedConfig}.
 *
 * @member {module:media-embed/mediaembed~MediaEmbedConfig} module:core/editor/editorconfig~EditorConfig#mediaEmbed
 */

/**
 * The configuration of the media embed features. Used by the media embed features in the `@ckeditor/ckeditor5-media-embed` package.
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
 * The available media providers. By default, the following providers are supported
 * by the editor:
 *
 * With media previews:
 *
 * * Dailymotion
 * * Spotify
 * * YouTube
 * * Vimeo
 *
 * Without media previews:
 *
 * * Instagram
 * * Twitter
 * * Google Maps
 * * Flickr
 * * Facebook
 *
 * **Note:** The default media provider configuration may not support all possible media URLs,
 * only the most common are included.
 *
 * Media providers can be configured as an array of URL `RegExp` patterns with optional
 * preview rendering functions. The media URLs are processed according to the order of configuration
 * creating as a cascade: the URL is matched against all `RegExp` patterns until one of them passes
 * and allows the media into the editor (and optionally defines its preview).
 * If the URL matches none of the `RegExp` patterns, it is not allowed in the editor.
 *
 * The preview functions accept the content of the last matching group from the corresponding `RegExp`
 * as an argument, allowing rendering a dedicated preview of a media identified by a certain id or a hash.
 *
 * **Note:**: Preview–less media are always represented in the data using the "semantic" markup. See
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput `semanticDataOutput`} to
 * learn more about possible data outputs.
 *
 *		media: [
 *			{
 *				// The following RegExp definitions support the following URLs:
 *				//
 *				// https://www.ckeditor.com/some/path/{number}
 *				// https://www.ckeditor.com/another/path/{number}
 *				//
 *				// with optional "https://" and "www" prefixes.
 *				url: [
 *					/^(https:\/\/)?(www\.)?ckeditor\.com\/some\/path\/(\d+)/,
 *					/^(https:\/\/)?(www\.)?ckeditor\.com\/another\/path\/(\d+)/
 *				],
 *				// The preview rendering function for the media. It will be always used when
 *				// editing the content (view) and, if config.media.semanticDataOutput is "false", also
 *				// in the data output of the editor.
 *				html: mediaId =>
 *					// Create an optional responsive container for the media.
 *					'<div style="position: relative; padding-bottom: 100%; height: 0; ">' +
 *						// The preview rendered using the mediaId value as defined in the RegExp.
 *						// Usually an iframe, which scales along with the responsive wrapper, e.g.:
 *						`<iframe src="http://ckeditor.com/media/preview/${ mediaId }" ` +
 *							'frameborder="0" width="480" height="270" ' +
 *							'style="position: absolute;width: 100%;height: 100%;top: 0;left: 0;">' +
 *						'</iframe>' +
 *					'</div>'
 *			},
 *
 *			// Another media with the preview.
 *			{
 *				...
 *			},
 *
 *			// This RegExp will allow all media URL starting with https://cksource.com.
 *			// Those media will have no preview and will be displayed with as generic media.
 *			// Generic media are always represented in the output using the semantic HTML markup.
 *			// See config.media.semanticDataOutput to learn more about media representation in the data.
 *			/^(https:\/\/)?cksource\.com/,
 *
 *			// You can allow any sort of media in the editor using the "allow–all" wildcard RegExp.
 *			// Note that, since media are processed in the order of configuration so if one of the previous
 *			// RegExp matches the URL, it will have a precedence over this one.
 *			/^(https:\/\/)?(www\.)?.+/
 *		]
 *
 * @member {Array} module:media-embed/mediaembed~MediaEmbedConfig#media
 */

/**
 * Controls the data format produced by the feature.
 *
 * When `true`, the feature produces "semantic" data, i.e. it does not include the preview of
 * the media, just the `<oembed>` tag with the `url` attribute:
 *
 *		<figure class="media">
 *			<oembed url="https://url"></oembed>
 *		</figure>
 *
 * when `false` (default), the media is represented in the output in the same way it looks in the editor,
 * i.e. the media preview is saved to the database:
 *
 *		<figure class="media">
 *			<div data-oembed-url="https://url">
 *				<iframe src="https://preview"></iframe>
 *			</div>
 *		</figure>
 *
 * **Note:** Preview–less media are always represented in the data using the "semantic" markup
 * regardless of the value of the `semanticDataOutput`. Learn more about different kinds of media
 * in the {@link module:media-embed/mediaembed~MediaEmbedConfig#media `media`} configuration
 * description.
 *
 * @member {Boolean} [module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput=false]
 */
