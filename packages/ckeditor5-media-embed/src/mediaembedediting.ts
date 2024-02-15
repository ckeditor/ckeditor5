/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable no-useless-escape */
/* eslint-disable max-len */

/**
 * @module media-embed/mediaembedediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import type { UpcastElementEvent } from 'ckeditor5/src/engine';
import { first, type GetCallback } from 'ckeditor5/src/utils';

import { modelToViewUrlAttributeConverter } from './converters';
import type { MediaEmbedConfig } from './mediaembedconfig';
import MediaEmbedCommand from './mediaembedcommand';
import MediaRegistry from './mediaregistry';
import { toMediaWidget, createMediaFigureElement } from './utils';

import '../theme/mediaembedediting.css';

/**
 * The media embed editing feature.
 */
export default class MediaEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedEditing' as const;
	}

	/**
	 * The media registry managing the media providers in the editor.
	 */
	public registry: MediaRegistry;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );
		editor.config.define( 'mediaEmbed', {
			elementName: 'oembed',
			providers: [
				{
					name: 'dailymotion',
					url: /^dailymotion\.com\/video\/(\w+)/,
					html: match => {
						const id = match[ 1 ];

						return (
							'<div style="position: relative; padding-bottom: 100%; height: 0; ">' +
								`<iframe src="https://www.dailymotion.com/embed/video/${ id }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" width="480" height="270" allowfullscreen allow="autoplay">' +
								'</iframe>' +
							'</div>'
						);
					}
				},

				{
					name: 'spotify',
					url: [
						/^open\.spotify\.com\/(artist\/\w+)/,
						/^open\.spotify\.com\/(album\/\w+)/,
						/^open\.spotify\.com\/(track\/\w+)/
					],
					html: match => {
						const id = match[ 1 ];

						return (
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 126%;">' +
								`<iframe src="https://open.spotify.com/embed/${ id }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
								'</iframe>' +
							'</div>'
						);
					}
				},
				{
					name: 'gif',
					url: [
						/(http(s?):)([/|.|\w|\s|-])*\.gif/
					],
					html: match => {
						const url = match[ 0 ];
						const [ fileName ] = /[^/]*$/.exec( url )!;
						const alt = fileName.substring( 0, fileName.lastIndexOf( '.' ) ) || fileName;

						return (
							`<img src="${ url }" alt="${ alt }" style="width: 100%;" >`
						);
					}
				},

				{
					name: 'youtube',
					url: [
						/^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)(?:&t=(\d+))?/,
						/^(?:m\.)?youtube\.com\/v\/([\w-]+)(?:\?t=(\d+))?/,
						/^youtube\.com\/embed\/([\w-]+)(?:\?start=(\d+))?/,
						/^youtu\.be\/([\w-]+)(?:\?t=(\d+))?/
					],
					html: match => {
						const id = match[ 1 ];
						const time = match[ 2 ];

						return (
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
								`<iframe src="https://www.youtube.com/embed/${ id }${ time ? `?start=${ time }` : '' }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
								'</iframe>' +
							'</div>'
						);
					}
				},

				{
					name: 'vimeo',
					url: [
						/^vimeo\.com\/(\d+)/,
						/^vimeo\.com\/[^/]+\/[^/]+\/video\/(\d+)/,
						/^vimeo\.com\/album\/[^/]+\/video\/(\d+)/,
						/^vimeo\.com\/channels\/[^/]+\/(\d+)/,
						/^vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/,
						/^vimeo\.com\/ondemand\/[^/]+\/(\d+)/,
						/^player\.vimeo\.com\/video\/(\d+)/
					],
					html: match => {
						const id = match[ 1 ];

						return (
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
								`<iframe src="https://player.vimeo.com/video/${ id }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' +
								'</iframe>' +
							'</div>'
						);
					}
				},

				{
					name: 'instagram',
					url: /^instagram\.com\/p\/(\w+)/
				},
				{
					name: 'twitter',
					url: /^twitter\.com/
				},
				{
					name: 'googleMaps',
					url: [
						/^google\.com\/maps/,
						/^goo\.gl\/maps/,
						/^maps\.google\.com/,
						/^maps\.app\.goo\.gl/
					]
				},
				{
					name: 'flickr',
					url: /^flickr\.com/
				},
				{
					name: 'facebook',
					url: /^facebook\.com/
				},
				{
					name: 'googleContent', // handles docs, slides, and spreadsheets
					url: [
						/https:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/(.*?)\/(edit|preview|present)/,
						/https:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/e\/(.*?)\/(pub|embed)(?:html)?/
					],
					html: match => {
						let url = match.input!;
						if ( this.isPublished( url ) && !url.includes( 'embedded=true' ) ) {
							if ( url.includes( 'presentation' ) ) {
								url += '&embedded=true';
							} else {
								url += '?embedded=true';
							}
						}

						if ( url.includes( 'edit' ) || url.includes( 'present' ) ) {
							url = url.replace( 'edit', 'preview' );
							if ( url.includes( 'presentation' ) ) {
								url = url
									.replace( 'presentation', 'tempword' )
									.replace( 'present', 'preview' )
									.replace( 'tempword', 'presentation' );
							} else {
								url = url.replace( 'present', 'preview' );
							}
						}

						return (
							'<div style="position: relative; height: 431px;">' +
								`<iframe src="${ url }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' +
								'</iframe>' +
							'</div>'
						);
					}
				},
				{
					name: 'loom',
					url: [
						/^loom\.com\/(?:share|embed)\/([\w-]+)/
					],
					html: match => {
						const id = match[ 1 ];

						return (
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
								`<iframe src="https://www.loom.com/embed/${ id }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
								'</iframe>' +
							'</div>'
						);
					}
				},
				{
					name: 'fjVideo',
					url: [
						/^https:\/\/fj-file-uploads\.s3\.us-east-2\.amazonaws\.com\/((?:[\w+]+(?:%[0-9A-Fa-f]{2}|\/))?fjvideo-[\w-]+).([\w-]+)/,
						/^https:\/\/cdn.flockjay.com\/((?:[\w+]+(?:%[0-9A-Fa-f]{2}|\/))?fjvideo-[\w-]+).([\w-]+)/,
						/^(?:https:\/\/(?:staging-)?api(?:-demo)?\.flockjay\.com|(?:http:\/\/)?localhost:8000)\/feed\/files\/(?:[a-zA-Z0-9\-]+)\/((?:[\w+]+(?:%[0-9A-Fa-f]{2}|\/))?fjvideo-[\w-]+).([\w-]+)/
					],
					html: match => {
						const url = match[ 0 ];
						const ext = match[ 2 ];
						const poster = ext === 'mp4' ? `poster="${ url.replace( `.${ ext }`, '-thumbnail.jpg' ) }" ` : '';
						const id = match[ 1 ];

						return (
							`<video id=${ id } style="max-width: 100%;"  ${ poster }` +
								'controls controlsList="nodownload" preload="metadata">' +
								`<source type="video/${ ext }" src=${ url }></source>` +
							'</video>'
						);
					}
				},
				{
					name: 'Gong',
					url: [
						/(?:.+)app\.gong\.io\/call\?id=(.+)/,
						/(?:.+)app\.gong\.io\/embedded-call\?call-id=(.+)/
					],
					html: match => {
						const idAndParams = match[ 1 ];

						return (
							'<div style="position: relative; height: 431px;">' +
								`<iframe src="https://app.gong.io/embedded-call?call-id=${ idAndParams }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0">' +
								'</iframe>' +
							'</div>'
						);
					}
				},
				{
					name: 'Fireflies.AI',
					url: [
						/^https:\/\/app\.fireflies\.ai\/view\/[a-zA-Z0-9-_]+::([a-zA-Z0-9-_]+)?$/
					],
					html: match => {
						const id = match[ 1 ];
						const src = `https://share.fireflies.ai/embed/meetings/${ id }`;
						return (
							`<div style="position: relative; height: 431px;"><iframe src="${ src }" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`
						);
					}
				},
				{
					name: 'FJLink',
					url: [
						/^((?:.)+flockjay.com)\/(course|learningpath|hub|page|opportunity|classroom)\/(?!create)([\w=?&-]+)(\/)?$/,
						/^((?:.)+amplifyapp.com)\/(course|learningpath|hub|page|opportunity|classroom)\/(?!create)([\w=?&-]+)(\/)?$/
					],
					html: match => {
						const domain = match[ 1 ];
						const category = match[ 2 ];
						let contentType, contentId;
						if ( category === 'classroom' ) {
							const params = new URL( match[ 0 ] ).searchParams;
							const postId = params.get( 'postId' );
							const assetId = params.get( 'assetId' );
							const playlistId = params.get( 'playlistId' );
							const promptId = params.get( 'promptId' );
							const callId = params.get( 'callId' );

							if ( playlistId ) {
								contentType = 'playlist';
								contentId = playlistId;
							} else if ( promptId ) {
								contentType = 'prompt';
								contentId = promptId;
							} else if ( postId ) {
								contentType = 'feedpost';
								contentId = postId;
							} else if ( assetId ) {
								contentType = 'asset';
								contentId = assetId;
							} else if ( callId ) {
								contentType = 'gongcall';
								contentId = callId;
							}
						} else {
							contentType = category;
							contentId = match[ 3 ];
						}
						const url = `${ domain }/embed/?contentId=${ contentId }&contentType=${ contentType }`;

						return (
							`<a href=${ match[ 0 ] } style="display: block; width: 100%; height: 100%;">` +
								'<div style="position: relative; height: 245px; pointer-events: none;">' +
									`<iframe src="${ url }"` +
										'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
										'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
									'</iframe>' +
								'</div>' +
							'</a>'
						);
					}
				}
			]
		} as MediaEmbedConfig );

		this.registry = new MediaRegistry( editor.locale, editor.config.get( 'mediaEmbed' )! );
	}

	public isPublished( url: string ): boolean {
		return url.includes( '/d/e/' ) || url.includes( 'pub' ) || url.includes( 'pubhtml' );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;
		const renderMediaPreview = editor.config.get( 'mediaEmbed.previewsInData' );
		const elementName = editor.config.get( 'mediaEmbed.elementName' )!;

		const registry = this.registry;

		editor.commands.add( 'mediaEmbed', new MediaEmbedCommand( editor ) );

		// Configure the schema.
		schema.register( 'media', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [ 'url' ]
		} );

		// Model -> Data
		conversion.for( 'dataDowncast' ).elementToStructure( {
			model: 'media',
			view: ( modelElement, { writer } ) => {
				const url = modelElement.getAttribute( 'url' ) as string;

				return createMediaFigureElement( writer, registry, url, {
					elementName,
					renderMediaPreview: !!url && renderMediaPreview
				} );
			}
		} );

		// Model -> Data (url -> data-oembed-url)
		conversion.for( 'dataDowncast' ).add(
			modelToViewUrlAttributeConverter( registry, {
				elementName,
				renderMediaPreview
			} ) );

		// Model -> View (element)
		conversion.for( 'editingDowncast' ).elementToStructure( {
			model: 'media',
			view: ( modelElement, { writer } ) => {
				const url = modelElement.getAttribute( 'url' ) as string;
				const figure = createMediaFigureElement( writer, registry, url, {
					elementName,
					renderForEditingView: true
				} );

				return toMediaWidget( figure, writer, t( 'media widget' ) );
			}
		} );

		// Model -> View (url -> data-oembed-url)
		conversion.for( 'editingDowncast' ).add(
			modelToViewUrlAttributeConverter( registry, {
				elementName,
				renderForEditingView: true
			} ) );

		// View -> Model (data-oembed-url -> url)
		conversion.for( 'upcast' )
			// Upcast semantic media.
			.elementToElement( {
				view: element => [ 'oembed', elementName ].includes( element.name ) && element.getAttribute( 'url' ) ?
					{ name: true } :
					null,
				model: ( viewMedia, { writer } ) => {
					const url = viewMedia.getAttribute( 'url' ) as string;

					if ( registry.hasMedia( url ) ) {
						return writer.createElement( 'media', { url } );
					}

					return null;
				}
			} )
			// Upcast non-semantic media.
			.elementToElement( {
				view: {
					name: 'div',
					attributes: {
						'data-oembed-url': true
					}
				},
				model: ( viewMedia, { writer } ) => {
					const url = viewMedia.getAttribute( 'data-oembed-url' ) as string;

					if ( registry.hasMedia( url ) ) {
						return writer.createElement( 'media', { url } );
					}

					return null;
				}
			} )
			// Consume `<figure class="media">` elements, that were left after upcast.
			.add( dispatcher => {
				const converter: GetCallback<UpcastElementEvent> = ( evt, data, conversionApi ) => {
					if ( !conversionApi.consumable.consume( data.viewItem, { name: true, classes: 'media' } ) ) {
						return;
					}

					const { modelRange, modelCursor } = conversionApi.convertChildren( data.viewItem, data.modelCursor );

					data.modelRange = modelRange;
					data.modelCursor = modelCursor;

					const modelElement = first( modelRange!.getItems() );

					if ( !modelElement ) {
						// Revert consumed figure so other features can convert it.
						conversionApi.consumable.revert( data.viewItem, { name: true, classes: 'media' } );
					}
				};

				dispatcher.on<UpcastElementEvent>( 'element:figure', converter );
			} );
	}
}
