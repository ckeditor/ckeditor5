/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/mediaembed
 */

import MediaEmbedEditing from './mediaembedediting';
import MediaEmbedUI from './mediaembedui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import LivePosition from '@ckeditor/ckeditor5-engine/src/model/liveposition';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;

/**
 * The media embed plugin.
 *
 * It loads the {@link module:media-embed/mediaembedediting~MediaEmbedEditing media embed editing feature}
 * and {@link module:media-embed/mediaembedui~MediaEmbedUI media embed UI feature}.
 *
 * For a detailed overview, check the {@glink features/media-embed Media Embed feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MediaEmbedEditing, MediaEmbedUI, Widget, Clipboard ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MediaEmbed';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._attachAutoEmbedingEvents();
	}

	/**
	 * Attach events required for "auto-embeding" feature.
	 *
	 * @private
	 */
	_attachAutoEmbedingEvents() {
		const editor = this.editor;
		const modelDocument = editor.model.document;
		const mediaRegistry = editor.plugins.get( MediaEmbedEditing ).registry;

		let leftLivePosition, rightLivePosition;

		// We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
		// After pasting a content, between those position can be located a URL that should be transformed to media.
		this.listenTo( editor.plugins.get( Clipboard ), 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange();

			leftLivePosition = LivePosition.createFromPosition( firstRange.start );
			leftLivePosition.stickiness = 'toPrevious';

			rightLivePosition = LivePosition.createFromPosition( firstRange.end );
			rightLivePosition.stickiness = 'toNext';
		} );

		modelDocument.on( 'change:data', () => {
			if ( !leftLivePosition ) {
				return;
			}

			const urlRange = new Range( leftLivePosition, rightLivePosition );
			const walker = new TreeWalker( { boundaries: urlRange, ignoreElementEnd: true } );

			let url = '';

			for ( const node of walker ) {
				if ( node.type === 'elementStart' ) {
					return detach();
				}

				url += node.item.data;
			}

			// If the url does not match to universal url regexp, let's skip that.
			if ( !url.match( URL_REGEXP ) ) {
				return detach();
			}

			// If the url is valid from MediaEmbed plugin point of view, let's use it.
			if ( !mediaRegistry.hasMedia( url ) ) {
				return detach();
			}

			// `leftLivePosition` won't be available in `setTimeout` function so let's clone it.
			const positionToInsert = Position.createFromPosition( leftLivePosition );

			global.window.setTimeout( () => {
				editor.model.change( writer => {
					// const mediaElement = writer.createElement( 'media', { url } );

					writer.remove( urlRange );
					// writer.insert( mediaElement, positionToInsert );
					writer.setSelection( positionToInsert );
					editor.commands.execute( 'mediaEmbed', url );
				} );
			}, 500 );
		} );

		function detach() {
			leftLivePosition.detach();
			rightLivePosition.detach();

			leftLivePosition = null;
			rightLivePosition = null;
		}
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
 * To implement a responsive media, you can use the following HTML structure:
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
 * If any URL matches the `RegExp`, it becomes the media in editor model, as defined by the provider. The result
 * of matching (output of `String.prototype.match()`) is passed to the `html` rendering function of the media.
 *
 * **Note:** You do not need to include the protocol (`http://`, `https://`) and `www` sub–domain in your `RegExps`,
 * they are stripped from the URLs before matching anyway.
 * @property {Function} [html] (optional) Rendering function of the media. The function receives the entire matching
 * array from the corresponding `url` `RegExp` as an argument, allowing rendering a dedicated
 * preview of a media identified by a certain id or a hash. When not defined, the media embed feature
 * will use a generic media representation in the view and output data.
 * Note that when
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput `config.mediaEmbed.semanticDataOutput`}
 * is `true`, the rendering function **will not** be used for the media in the editor data output.
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
 * Used by the media embed features in the `@ckeditor/ckeditor5-media-embed` package.
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
 * Names of providers with rendering functions (previews):
 *
 * * "dailymotion",
 * * "spotify",
 * * "youtube",
 * * "vimeo"
 *
 * Names of providers without rendering functions:
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
 * **Note**: Media without are always represented in the data using the "semantic" markup. See
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput `config.mediaEmbed.semanticDataOutput`} to
 * learn more about possible data outputs.
 *
 * **Note:**: The priority of media providers corresponds to the order of configuration. The first provider
 * to match the URL is always used, even if there are other providers which support a particular URL.
 * The URL is never matched against remaining providers.
 *
 * To discard **all** default media providers, simply override this config with your own
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
 * The list of media providers which should not be used despite being available in
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
 * in the {@link module:media-embed/mediaembed~MediaEmbedConfig#providers `config.mediaEmbed.providers`}
 * configuration description.
 *
 * @member {Boolean} [module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput=false]
 */
