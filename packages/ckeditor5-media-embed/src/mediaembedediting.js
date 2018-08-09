/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/mediaembedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {
	viewFigureToModel,
	modelToViewUrlAttributeConverter
} from './converters';

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
			media: {
				dailymotion: {
					url: [
						/^(https:\/\/)?(www\.)?dailymotion\.com\/video\/(\w+)/
					],
					html: id =>
						`<iframe src="https://www.dailymotion.com/embed/video/${ id }" ` +
							'frameborder="0" width="480" height="270" allowfullscreen allow="autoplay">' +
						'</iframe>'
				},

				instagram: {
					url: /^(https:\/\/)?(www\.)?instagram\.com\/p\/(\w+)/
				},

				spotify: {
					url: [
						/^(https:\/\/)?(www\.)?open\.spotify\.com\/(artist\/\w+)/,
						/^(https:\/\/)?(www\.)?open\.spotify\.com\/(album\/\w+)/,
						/^(https:\/\/)?(www\.)?open\.spotify\.com\/(track\/\w+)/
					],
					html: id =>
						'<div class="ck-media__wrapper__aspect">' +
							`<iframe src="https://open.spotify.com/embed/${ id }" ` +
								'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
							'</iframe>' +
						'</div>'
				},

				youtube: {
					url: [
						/^(https:\/\/)?(www\.)?youtube\.com\/watch\?v=(\w+)/,
						/^(https:\/\/)?(www\.)?youtube\.com\/v\/(\w+)/,
						/^(https:\/\/)?(www\.)?youtube\.com\/embed\/(\w+)/,
						/^(https:\/\/)?youtu\.be\/(\w+)/
					],
					html: id =>
						'<div class="ck-media__wrapper__aspect">' +
							`<iframe src="https://www.youtube.com/embed/${ id }" ` +
								'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
							'</iframe>' +
						'</div>'
				},

				vimeo: {
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
						'<div class="ck-media__wrapper__aspect">' +
							`<iframe src="https://player.vimeo.com/video/${ id }" ` +
								'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' +
							'</iframe>' +
						'</div>'
				},

				twitter: {
					url: /^(https:\/\/)?(www\.)?twitter\.com/
				},

				googleMaps: {
					url: /^(https:\/\/)?(www\.)?google\.com\/maps/
				},

				flickr: {
					url: /^(https:\/\/)?(www\.)?flickr\.com/
				},

				facebook: {
					url: /^(https:\/\/)?(www\.)?facebook\.com/
				},

				any: {
					url: /.*/
				}
			}
		} );
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

		this.mediaRegistry = new MediaRegistry( this.editor );

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
				return createMediaFigureElement( viewWriter, {
					renderMediaHtml: !semanticDataOutput
				} );
			}
		} ) );

		// Model -> Data (url -> data-oembed-url)
		conversion.for( 'dataDowncast' ).add( modelToViewUrlAttributeConverter( this.mediaRegistry, {
			renderMediaHtml: !semanticDataOutput
		} ) );

		// Model -> View (element)
		conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
			model: 'media',
			view: ( modelElement, viewWriter ) => {
				const figure = createMediaFigureElement( viewWriter, {
					renderMediaHtml: true
				} );

				return toMediaWidget( figure, viewWriter, t( 'media widget' ) );
			}
		} ) );

		// Model -> View (url -> data-oembed-url)
		conversion.for( 'editingDowncast' ).add( modelToViewUrlAttributeConverter( this.mediaRegistry, {
			isViewPipeline: true
		} ) );

		// View -> Model (data-oembed-url -> url)
		conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: {
					name: 'div',
					attributes: {
						'data-oembed-url': true
					}
				},
				model: ( viewMedia, modelWriter ) => {
					return modelWriter.createElement( 'media', {
						url: viewMedia.getAttribute( 'data-oembed-url' )
					} );
				}
			} ) )
			.add( viewFigureToModel() );
	}
}
