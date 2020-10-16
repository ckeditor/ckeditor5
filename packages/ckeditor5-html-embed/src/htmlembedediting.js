/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedediting
 */

import sanitizeHtml from 'sanitize-html';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import HTMLEmbedCommand from './htmlembedcommand';
import { clone } from 'lodash-es';
import { toRawHtmlWidget } from './utils';

import '../theme/htmlembed.css';

/**
 * The HTML embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HTMLEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HTMLEmbedEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const viewDocument = editor.editing.view.document;

		const htmlEmbedCommand = new HTMLEmbedCommand( editor );
		const upcastWriter = new UpcastWriter( viewDocument );
		const htmlProcessor = new HtmlDataProcessor( viewDocument );

		const sanitizeHtmlConfig = getSanitizeHtmlConfig( sanitizeHtml.defaults );

		schema.register( 'rawHtml', {
			isObject: true,
			allowWhere: '$block',
			allowAttributes: [ 'value' ]
		} );

		editor.commands.add( 'htmlEmbed', htmlEmbedCommand );

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div',
				classes: 'raw-html-embed'
			},
			model: ( viewElement, { writer } ) => {
				const fragment = upcastWriter.createDocumentFragment( viewElement.getChildren() );
				const innerHtml = htmlProcessor.toData( fragment );

				return writer.createElement( 'rawHtml', {
					value: innerHtml
				} );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, { writer } ) => {
				return writer.createRawElement( 'div', { class: 'raw-html-embed' }, function( domElement ) {
					domElement.innerHTML = modelElement.getAttribute( 'value' ) || '';
				} );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, { writer } ) => {
				const label = t( 'HTML snippet' );
				const viewWrapper = writer.createContainerElement( 'div', { 'data-cke-ignore-events': true } );

				// Whether to show a preview mode or editing area.
				let isPreviewActive = false;

				// The editing raw HTML field.
				const textarea = writer.createUIElement( 'textarea', { rows: 5 }, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					root.value = modelElement.getAttribute( 'value' ) || '';

					this.listenTo( root, 'input', () => {
						htmlEmbedCommand.execute( {
							rawHtml: root.value,
							element: modelElement
						} );
					} );

					return root;
				} );

				// The switch button between preview and editing HTML.
				const toggleButton = writer.createUIElement( 'div', { class: 'raw-html__edit-preview' }, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					// TODO: This event does not work.
					this.listenTo( root, 'click', () => {
						editor.editing.view.change( writer => {
							if ( isPreviewActive ) {
								writer.removeClass( 'raw-html--active-preview', viewWrapper );
							} else {
								writer.addClass( 'raw-html--active-preview', viewWrapper );
							}

							isPreviewActive = !isPreviewActive;
						} );
					} );

					// The icon is used a temporary placeholder. Thanks to https://www.freepik.com/free-icon/eye_775336.htm.
					// eslint-disable-next-line max-len
					root.innerHTML = '<?xml version="1.0" encoding="iso-8859-1"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 456.795 456.795" style="enable-background:new 0 0 456.795 456.795;"xml:space="preserve"> <g> <g> <path d="M448.947,218.475c-0.922-1.168-23.055-28.933-61-56.81c-50.705-37.253-105.877-56.944-159.551-56.944 c-53.672,0-108.844,19.691-159.551,56.944c-37.944,27.876-60.077,55.642-61,56.81L0,228.397l7.846,9.923 c0.923,1.168,23.056,28.934,61,56.811c50.707,37.252,105.879,56.943,159.551,56.943c53.673,0,108.845-19.691,159.55-56.943 c37.945-27.877,60.078-55.643,61-56.811l7.848-9.923L448.947,218.475z M228.396,315.039c-47.774,0-86.642-38.867-86.642-86.642 c0-7.485,0.954-14.751,2.747-21.684l-19.781-3.329c-1.938,8.025-2.966,16.401-2.966,25.013c0,30.86,13.182,58.696,34.204,78.187 c-27.061-9.996-50.072-24.023-67.439-36.709c-21.516-15.715-37.641-31.609-46.834-41.478c9.197-9.872,25.32-25.764,46.834-41.478 c17.367-12.686,40.379-26.713,67.439-36.71l13.27,14.958c15.498-14.512,36.312-23.412,59.168-23.412 c47.774,0,86.641,38.867,86.641,86.642C315.037,276.172,276.17,315.039,228.396,315.039z M368.273,269.875 c-17.369,12.686-40.379,26.713-67.439,36.709c21.021-19.49,34.203-47.326,34.203-78.188s-13.182-58.697-34.203-78.188 c27.061,9.997,50.07,24.024,67.439,36.71c21.516,15.715,37.641,31.609,46.834,41.477 C405.91,238.269,389.787,254.162,368.273,269.875z"/> <path d="M173.261,211.555c-1.626,5.329-2.507,10.982-2.507,16.843c0,31.834,25.807,57.642,57.642,57.642 c31.834,0,57.641-25.807,57.641-57.642s-25.807-57.642-57.641-57.642c-15.506,0-29.571,6.134-39.932,16.094l28.432,32.048 L173.261,211.555z"/> </g> </g></svg>';

					return root;
				} );

				// The container that renders the HTML.
				const rawElement = writer.createRawElement( 'div', { class: 'raw-html-embed' }, function( domElement ) {
					domElement.innerHTML = sanitizeHtml( modelElement.getAttribute( 'value' ) || '', sanitizeHtmlConfig );
				} );

				writer.insert( writer.createPositionAt( viewWrapper, 0 ), toggleButton );
				writer.insert( writer.createPositionAt( viewWrapper, 1 ), textarea );
				writer.insert( writer.createPositionAt( viewWrapper, 2 ), rawElement );

				return toRawHtmlWidget( viewWrapper, writer, label );
			}
		} );

		// TODO: How to re-render the `rawElement`?
		// conversion.for( 'editingDowncast' ).add( dispatcher => {
		// 	dispatcher.on( 'attribute:value:rawHtml', ( evt, data, conversionApi ) => {
		// 		const viewWrapper = conversionApi.mapper.toViewElement( data.item );
		//
		// 		console.log( viewWrapper );
		// 	} );
		// } );
	}
}

// Modifies the `defaultConfig` configuration and returns a new object that matches our needs. See #8204.
//
// @params {String} defaultConfig The default configuration that will be extended.
// @returns {Object}
function getSanitizeHtmlConfig( defaultConfig ) {
	const config = clone( defaultConfig );

	config.allowedTags.push(
		// Allows embedding iframes.
		'iframe',

		// Allows embedding media.
		'audio',
		'video',
		'picture',
		'source',
		'img'
	);

	config.selfClosing.push( 'source' );

	// Remove duplicates.
	config.allowedTags = [ ...new Set( config.allowedTags ) ];

	config.allowedSchemesAppliedToAttributes.push(
		// Responsive images.
		'srcset'
	);

	for ( const htmlTag of config.allowedTags ) {
		if ( !Array.isArray( config.allowedAttributes[ htmlTag ] ) ) {
			config.allowedAttributes[ htmlTag ] = [];
		}

		// Allow inlining styles for all elements.
		config.allowedAttributes[ htmlTag ].push( 'style' );
	}

	// Should we allow the `controls` attribute?
	config.allowedAttributes.video.push( 'width', 'height', 'controls' );
	config.allowedAttributes.audio.push( 'controls' );

	config.allowedAttributes.iframe.push( 'src' );
	config.allowedAttributes.img.push( 'srcset', 'sizes', 'src' );
	config.allowedAttributes.source.push( 'src', 'srcset', 'media', 'sizes', 'type' );

	return config;
}
