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
						const params = new URL( decodeURI( match[ 0 ] ) ).searchParams;
						const from = params.get( 'from' );
						const to = params.get( 'to' );
						const id = params.get( 'id' );
						const highlights = params.get( 'highlights' );
						const idAndParams = match[ 1 ];

						let url = `https://app.gong.io/embedded-call?call-id=${ idAndParams }`;

						if ( ( !from || !to ) && highlights ) {
							const { from, to } = JSON.parse( highlights )?.[ 0 ];
							if ( from && to ) {
								url = `https://app.gong.io/embedded-call?call-id=${ id }&from=${ from }&to=${ to }`;
							}
						}

						return (
							'<div style="position: relative; height: 431px;">' +
								`<iframe src="${ url }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0">' +
								'</iframe>' +
							'</div>'
						);
					}
				},
				{
					name: 'Clari',
					url: [
						/https:\/\/copilot\.clari\.com\/call\/([\w-]+)/
					],
					html: match => {
						const callId = match[ 1 ];
						const url = `https://copilot.clari.com/callembed/${ callId }`;

						return (
							'<div style="position: relative; height: 431px;">' +
								`<iframe src="${ url }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0">' +
								'</iframe>' +
							'</div>'
						);
					}
				},
				{
					name: 'Chorus',
					url: [
						/https:\/\/chorus\.ai\/meeting\/([\w-]+)/
					],
					html: match => {
						const url = match[ 0 ];
						return (
							'<div style="position: relative; height: 431px;">' +
								`<iframe src="${ url }" ` +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0">' +
								'</iframe>' +
							'</div>'
						);
					}
				},
				{
					name: 'Salesloft',
					url: [
						/https:\/\/app\.salesloft\.com\/app\/conversation-intelligence\/recordings\/[\w-]+/
					],
					html: match => {
						const url = match[ 0 ];
						return (
							`<a href="${ url }" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; width: 100%; height: 550px; border-radius: 16px; justify-content: center; align-items: center; font-size: 14px; font-weight: 500; text-decoration: none; background-color: rgb(204, 240, 217);">
								<svg width="58" height="74" viewBox="0 0 58 74" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M45.6836 67.3373C45.6836 64.0134 48.2383 61.1523 51.7967 61.1523C55.3563 61.1523 58.001 64.0134 58.001 67.3373C58.001 70.6611 55.4467 73.5222 51.8882 73.5222C48.3289 73.5222 45.6836 70.6611 45.6836 67.3373Z" fill="#B3D334"/>
									<path d="M12.6413 14.8204C12.6413 9.8578 17.272 5.89401 23.2114 5.89401C30.9633 5.89401 35.5094 9.56083 38.1278 28.3004H39.739L42.1545 2.73675C25.0397 -3.37357 3.59581 2.94116 3.29323 21.3757C3.29323 41.2359 34.561 41.2248 34.561 59.3653C34.561 64.6612 29.9292 68.3274 24.6954 68.3274C10.8937 68.3274 7.62246 56.6157 6.91785 44.3931H5.20608L0.675781 67.4103C0.675781 67.4103 10.9444 73.522 22.0192 73.522C35.3083 73.3186 44.1677 63.4384 44.3688 53.0506C44.3688 33.0888 12.6402 28.978 12.6402 14.8213L12.6413 14.8204Z" fill="#02524B"/>
								</svg>
								<span style="margin-top: 32px; display: flex; align-items: center;">
									<span class="ant-typography" style="text-align: center; font-size: 16px; color: rgb(2, 82, 75); font-weight: 500; padding: 0px; margin: 0px;">Click to open call in Salesloft</span>
									<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#02524B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 2px; margin-left: 8px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
								</span>
							</a>`
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
					name: 'Fireflies.AI soundbites',
					url: [
						/^https:\/\/share\.fireflies\.ai\/embed\/bites\/(\w+)$/,
						/^https:\/\/app\.fireflies\.ai\/soundbites\/(\w+)$/
					],
					html: match => {
						const id = match[ 1 ];
						const src = `https://share.fireflies.ai/embed/bites/${ id }`;
						return (
							`<div style="position: relative; height: 431px;"><iframe src="${ src }" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`
						);
					}
				},
				{
					name: 'FJLink',
					url: [
						/^((?:.)+flockjay.com)\/(course|learningpath|hub|page|opportunity|classroom|dealroom)\/(?!create)([\w=?&-]+)(\/)?$/,
						/^((?:.)+amplifyapp.com)\/(course|learningpath|hub|page|opportunity|classroom|dealroom)\/(?!create)([\w=?&-]+)(\/)?$/,
						/^((?:.)+localhost:3000)\/(course|learningpath|hub|page|opportunity|classroom|dealroom)\/(?!create)([\w=?&-]+)(\/)?$/
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
								contentType = 'call';
								contentId = callId;
							}
						} else {
							contentType = category;
							contentId = match[ 3 ];
						}
						const url = `${ domain }/embed/?contentId=${ contentId }&contentType=${ contentType }`;

						return (
							`<a href=${ match[ 0 ] } style="display: block; width: 100%; height: 100%; max-width: 298px; min-width: 210px; margin: auto;">` +
								'<div style="position: relative; padding-bottom: calc(56.25% + 78px); pointer-events: none; border-radius: 8px; overflow: hidden;">' +
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
