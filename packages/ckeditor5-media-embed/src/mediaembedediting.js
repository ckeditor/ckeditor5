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
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import '../theme/mediaembedediting.css';

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
						/^(https:)?\/\/(www\.)?dailymotion\.com\/video\/(\w+)/
					],
					html: id =>
						`<iframe src="https://www.dailymotion.com/embed/video/${ id }" ` +
							'frameborder="0" width="480" height="270" allowfullscreen allow="autoplay">' +
						'</iframe>'
				},

				instagram: {
					url: [
						/^(https:)?\/\/(www\.)?instagram\.com\/p\/(\w+)/
					],

					html: id =>
						`<iframe src="http://instagram.com/p/${ id }/embed" ` +
							'frameborder="0">' +
						'</iframe>'
				},

				spotify: {
					url: [
						/^(https:)?\/\/open\.spotify\.com\/(artist\/\w+)/,
						/^(https:)?\/\/open\.spotify\.com\/(album\/\w+)/,
						/^(https:)?\/\/open\.spotify\.com\/(track\/\w+)/
					],
					html: id =>
						`<iframe src="https://open.spotify.com/embed/${ id }" ` +
							'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
						'</iframe>'
				},

				youtube: {
					url: [
						/^(https:)?\/\/(www\.)?youtube\.com\/watch\?v=(\w+)/,
						/^(https:)?\/\/(www\.)?youtube\.com\/v\/(\w+)/,
						/^(https:)?\/\/(www\.)?youtube\.com\/embed\/(\w+)/,
						/^(https:)?\/\/youtu\.be\/(\w+)/
					],
					html: id =>
						`<iframe src="https://www.youtube.com/embed/${ id }" ` +
							'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
						'</iframe>'
				},

				vimeo: {
					url: [
						/^(https:)?\/\/vimeo\.com\/(\d+)/,
						/^(https:)?\/\/vimeo\.com\/[^/]+\/[^/]+\/video\/(\d+)/,
						/^(https:)?\/\/vimeo\.com\/album\/[^/]+\/video\/(\d+)/,
						/^(https:)?\/\/vimeo\.com\/channels\/[^/]+\/(\d+)/,
						/^(https:)?\/\/vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/,
						/^(https:)?\/\/vimeo\.com\/ondemand\/[^/]+\/(\d+)/,
						/^(https:)?\/\/player\.vimeo\.com\/video\/(\d+)/
					],
					html: id =>
						`<iframe src="https://player.vimeo.com/video/${ id }" ` +
							'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' +
						'</iframe>'
				},
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
					withAspectWrapper: !semanticDataOutput
				} );
			}
		} ) );

		// Model -> Data (url -> data-oembed-url)
		conversion.for( 'dataDowncast' )
			.add( modelToViewUrlAttributeConverter( editor, {
				shouldRenderContent: !semanticDataOutput
			} ) );

		// Model -> View (element)
		conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
			model: 'media',
			view: ( modelElement, viewWriter ) => {
				const figure = createMediaFigureElement( viewWriter, {
					witgAspectWrapper: true
				} );

				return toMediaWidget( figure, viewWriter, t( 'media widget' ) );
			}
		} ) );

		// Model -> View (url -> data-oembed-url)
		conversion.for( 'editingDowncast' )
			.add( modelToViewUrlAttributeConverter( editor, {
				inEditingPipeline: true
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
