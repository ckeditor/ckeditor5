/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/mediaembedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { modelToViewUrlAttributeConverter } from './converters';
import InsertMediaCommand from './insertmediacommand';
import { toMediaWidget, createMediaFigureElement } from './utils';
import { MediaRegistry } from './mediaregistry';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

/**
 * The media embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'mediaEmbed', {
			media: [
				{
					url: [
						/^(https:\/\/)?(www\.)?dailymotion\.com\/video\/(\w+)/
					],
					html: id =>
						'<div style="position: relative; padding-bottom: 100%; height: 0; ">' +
							`<iframe src="https://www.dailymotion.com/embed/video/${ id }" ` +
								'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
								'frameborder="0" width="480" height="270" allowfullscreen allow="autoplay">' +
							'</iframe>' +
						'</div>'
				},

				{
					url: [
						/^(https:\/\/)?(www\.)?open\.spotify\.com\/(artist\/\w+)/,
						/^(https:\/\/)?(www\.)?open\.spotify\.com\/(album\/\w+)/,
						/^(https:\/\/)?(www\.)?open\.spotify\.com\/(track\/\w+)/
					],
					html: id =>
						'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 126%;">' +
							`<iframe src="https://open.spotify.com/embed/${ id }" ` +
								'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
								'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
							'</iframe>' +
						'</div>'
				},

				{
					url: [
						/^(https:\/\/)?(www\.)?youtube\.com\/watch\?v=(\w+)/,
						/^(https:\/\/)?(www\.)?youtube\.com\/v\/(\w+)/,
						/^(https:\/\/)?(www\.)?youtube\.com\/embed\/(\w+)/,
						/^(https:\/\/)?youtu\.be\/(\w+)/
					],
					html: id =>
						'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
							`<iframe src="https://www.youtube.com/embed/${ id }" ` +
								'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
								'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
							'</iframe>' +
						'</div>'
				},

				{
					url: [
						/^(https:\/\/)?(www\.)?vimeo\.com\/(\d+)/,
						/^(https:\/\/)?(www\.)?vimeo\.com\/[^/]+\/[^/]+\/video\/(\d+)/,
						/^(https:\/\/)?(www\.)?vimeo\.com\/album\/[^/]+\/video\/(\d+)/,
						/^(https:\/\/)?(www\.)?vimeo\.com\/channels\/[^/]+\/(\d+)/,
						/^(https:\/\/)?(www\.)?vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/,
						/^(https:\/\/)?(www\.)?vimeo\.com\/ondemand\/[^/]+\/(\d+)/,
						/^(https:\/\/)?(www\.)?player\.vimeo\.com\/video\/(\d+)/
					],
					html: id =>
						'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
							`<iframe src="https://player.vimeo.com/video/${ id }" ` +
								'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
								'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' +
							'</iframe>' +
						'</div>'
				},

				/^(https:\/\/)?(www\.)?instagram\.com\/p\/(\w+)/,
				/^(https:\/\/)?(www\.)?twitter\.com/,
				/^(https:\/\/)?(www\.)?google\.com\/maps/,
				/^(https:\/\/)?(www\.)?flickr\.com/,
				/^(https:\/\/)?(www\.)?facebook\.com/
			]
		} );

		/**
		 * The media registry managing the media providers in the editor.
		 *
		 * @member {module:media-embed/mediaregistry~MediaRegistry} #mediaRegistry
		 */
		this.mediaRegistry = new MediaRegistry( editor.locale, editor.config.get( 'mediaEmbed.media' ) );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;
		const semanticDataOutput = editor.config.get( 'mediaEmbed.semanticDataOutput' );
		const mediaRegistry = this.mediaRegistry;

		editor.commands.add( 'insertMedia', new InsertMediaCommand( editor ) );

		// Configure the schema.
		schema.register( 'media', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'url' ]
		} );

		// Model -> Data
		conversion.for( 'dataDowncast' ).add( downcastElementToElement( {
			model: 'media',
			view: ( modelElement, viewWriter ) => {
				const url = modelElement.getAttribute( 'url' );

				return createMediaFigureElement( viewWriter, mediaRegistry, url, {
					useSemanticWrapper: semanticDataOutput || !url,
					renderContent: !semanticDataOutput
				} );
			}
		} ) );

		// Model -> Data (url -> data-oembed-url)
		conversion.for( 'dataDowncast' ).add(
			modelToViewUrlAttributeConverter( mediaRegistry, {
				semanticDataOutput
			} ) );

		// Model -> View (element)
		conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
			model: 'media',
			view: ( modelElement, viewWriter ) => {
				const url = modelElement.getAttribute( 'url' );
				const figure = createMediaFigureElement( viewWriter, mediaRegistry, url, {
					renderForEditingView: true,
					renderContent: true
				} );

				return toMediaWidget( figure, viewWriter, t( 'media widget' ) );
			}
		} ) );

		// Model -> View (url -> data-oembed-url)
		conversion.for( 'editingDowncast' ).add(
			modelToViewUrlAttributeConverter( mediaRegistry, {
				renderForEditingView: true
			} ) );

		// View -> Model (data-oembed-url -> url)
		conversion.for( 'upcast' )
			// Upcast semantic media.
			.add( upcastElementToElement( {
				view: {
					name: 'oembed',
					attributes: {
						'url': true
					}
				},
				model: ( viewMedia, modelWriter ) => {
					const url = viewMedia.getAttribute( 'url' );

					if ( mediaRegistry.hasMedia( url ) ) {
						return modelWriter.createElement( 'media', { url } );
					}
				}
			} ) )
			// Upcast non-semantic media.
			.add( upcastElementToElement( {
				view: {
					name: 'div',
					attributes: {
						'data-oembed-url': true
					}
				},
				model: ( viewMedia, modelWriter ) => {
					const url = viewMedia.getAttribute( 'data-oembed-url' );

					if ( mediaRegistry.hasMedia( url ) ) {
						return modelWriter.createElement( 'media', { url } );
					}
				}
			} ) );
	}
}
