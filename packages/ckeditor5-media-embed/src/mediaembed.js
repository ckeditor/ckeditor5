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
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';

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
		return [ MediaEmbedEditing, MediaEmbedUI, Widget, Clipboard, Enter ];
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
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const modelDocument = editor.model.document;
		const mediaRegistry = editor.plugins.get( MediaEmbedEditing ).mediaRegistry;

		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			data.preventDefault();

			// The soft enter key is handled by the ShiftEnter plugin.
			if ( data.isSoft ) {
				return;
			}

			const selectionWrapper = modelDocument.selection.getFirstPosition().parent;

			if ( !selectionWrapper || !selectionWrapper.is( 'element', 'paragraph' ) ) {
				return;
			}

			let url = '';

			for ( const child of selectionWrapper.getChildren() ) {
				url += child.data;
			}

			// If the url does not match to universal url regexp, let's skip that.
			if ( !url.match( URL_REGEXP ) ) {
				return;
			}

			// If the url is valid from MediaEmbed plugin, let's use it.
			if ( mediaRegistry.hasMedia( url ) ) {
				const model = this.editor.model;

				model.change( writer => {
					writer.remove( selectionWrapper );
					editor.commands.execute( 'mediaEmbed', url );
				} );

				evt.stop();
				view.scrollToTheSelection();
			}
		} );

		// this.listenTo( editor.plugins.get( Clipboard ), 'inputTransformation', ( evt, data ) => {
		// 	// We assume that single node was pasted.
		// 	if ( data.content.childCount > 1 ) {
		// 		return;
		// 	}
		//
		// 	const firstChild = data.content.getChild( 0 );
		//
		// 	// If the node is not a text, skip it.
		// 	if ( !firstChild.is( 'text' ) ) {
		// 		return;
		// 	}
		//
		// 	const url = firstChild.data;
		//
		// 	// If the url does not match to universal url regexp, let's skip that.
		// 	if ( !url.match( URL_REGEXP ) ) {
		// 		return;
		// 	}
		//
		// 	// If the url is valid from MediaEmbed plugin, let's use it.
		// 	if ( mediaRegistry.hasMedia( url ) ) {
		// 		const model = this.editor.model;
		// 		let textNode;
		//
		// 		// Insert the URL as text...
		// 		model.change( writer => {
		// 			textNode = writer.createText( url );
		// 			writer.insert( textNode, modelDocument.selection.getFirstPosition() );
		// 		} );
		//
		// 		// ...then replace it with <media> element. Thanks to that auto-embeding is undoable.
		// 		model.change( writer => {
		// 			writer.remove( textNode );
		// 			editor.commands.execute( 'mediaEmbed', url );
		// 		} );
		//
		// 		evt.stop();
		// 	}
		// } );
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
 *			// The following RegExp matches https://www.example.com/media/{media id}
 *			// with optional "https://" and "www" prefixes.
 *			url: /^(https:\/\/)?(www\.)?example\.com\/media\/(\w+)/,
 *
 *			// The rendering function of the provider.
 *			// Used to represent the media when editing the content (i.e. in the view)
 *			// and also in the data output of the editor if semantic data output is disabled.
 *			html: mediaId => `The HTML representing the media with ID=${ mediaId }.`
 *		}
 *
 * You can allow any sort of media in the editor using the "allow–all" `RegExp`.
 * But mind that, since URLs are processed in the order of configuration, if one of the previous
 * `RegExps` matches the URL, it will have a precedence over this one.
 *
 *		{
 *			name: 'allow-all',
 *			url: /^(https:\/\/)?(www\.)?.+/
 *		}
 *
 * To implement a responsive media, you can use the following HTML structure:
 *
 *		{
 *			...
 *			html: mediaId =>
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
 * If any URL matches the `RegExp`, it becomes the media in editor model, as defined by the provider. The content
 * of the last matching group is passed to the `html` rendering function of the media.
 * @property {Function} [html] (optional) Rendering function of the media. The function receives the content of
 * the last matching group from the corresponding `url` `RegExp` as an argument, allowing rendering a dedicated
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
 *							 url: /^(https:\/\/)?(www\.)?example\.com\/media\/(\w+)/,
 *							 html: mediaId => '...'
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
 *							 url: /^(https:\/\/)?(www\.)?example\.com\/media\/(\w+)/,
 *							 html: mediaId => '...'
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
