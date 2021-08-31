/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/mediaembed
 */

import { Plugin } from 'ckeditor5/src/core';

import { disallowedAttributesConverter } from '../converters';
import { setViewAttributes } from '../conversionutils.js';
import DataFilter from '../datafilter';
import DataSchema from '../dataschema';

/**
 * Provides the General HTML Support integration with {@link module:media-embed/mediaembed~MediaEmbed Media Embed} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbedElementSupport extends Plugin {
	static get requires() {
		return [ DataFilter ];
	}

	init() {
		const editor = this.editor;

		// Stop here if MediaEmbed plugin is not provided or the integrator wants to output markup with previews as
		// we do not support filtering previews.
		if ( !editor.plugins.has( 'MediaEmbed' ) || editor.config.get( 'mediaEmbed.previewsInData' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = this.editor.plugins.get( DataFilter );
		const dataSchema = this.editor.plugins.get( DataSchema );
		const mediaElementName = editor.config.get( 'mediaEmbed.elementName' );

		// Overwrite GHS schema definition for a given elementName.
		dataSchema.registerBlockElement( {
			model: 'media',
			view: mediaElementName
		} );

		dataFilter.on( `register:${ mediaElementName }`, ( evt, definition ) => {
			if ( definition.model !== 'media' ) {
				return;
			}

			schema.extend( 'media', {
				allowAttributes: [
					'htmlAttributes',
					'htmlFigureAttributes'
				]
			} );

			conversion.for( 'upcast' ).add( disallowedAttributesConverter( definition, dataFilter ) );
			conversion.for( 'upcast' ).add( viewToModelMediaAttributesConverter( dataFilter, mediaElementName ) );
			conversion.for( 'dataDowncast' ).add( modelToViewMediaAttributeConverter( mediaElementName ) );

			evt.stop();
		} );
	}
}

function viewToModelMediaAttributesConverter( dataFilter, mediaElementName ) {
	return dispatcher => {
		// Here we want to be the first to convert (and consume) the figure element, otherwise GHS can pick it up and
		// convert it to generic `htmlFigure`.
		dispatcher.on( 'element:figure', upcastFigure, { priority: 'high' } );

		// Handle media elements without `<figure>` container.
		dispatcher.on( `element:${ mediaElementName }`, upcastMedia );
	};

	function upcastFigure( evt, data, conversionApi ) {
		const viewFigureElement = data.viewItem;

		// Convert only "media figure" elements.
		if ( !conversionApi.consumable.test( viewFigureElement, { name: true, classes: 'media' } ) ) {
			return;
		}

		// Find media element.
		const viewMediaElement = Array.from( viewFigureElement.getChildren() )
			.find( item => item.is( 'element', mediaElementName ) );

		// Do not convert if media element is absent.
		if ( !viewMediaElement ) {
			return;
		}

		// Convert just the media element.
		Object.assign( data, conversionApi.convertItem( viewMediaElement, data.modelCursor ) );

		preserveElementAttributes( viewMediaElement, 'htmlAttributes' );
		preserveElementAttributes( viewFigureElement, 'htmlFigureAttributes' );

		// Consume the figure to prevent converting it to `htmlFigure` by default GHS converters.
		conversionApi.consumable.consume( viewFigureElement, { name: true } );

		function preserveElementAttributes( viewElement, attributeName ) {
			const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
			}
		}
	}

	function upcastMedia( evt, data, conversionApi ) {
		const viewMediaElement = data.viewItem;
		const viewAttributes = dataFilter._consumeAllowedAttributes( viewMediaElement, conversionApi );

		if ( viewAttributes ) {
			conversionApi.writer.setAttribute( 'htmlAttributes', viewAttributes, data.modelRange );
		}
	}
}

function modelToViewMediaAttributeConverter( mediaElementName ) {
	return dispatcher => {
		addAttributeConversionDispatcherHandler( mediaElementName, 'htmlAttributes' );
		addAttributeConversionDispatcherHandler( 'figure', 'htmlFigureAttributes' );

		function addAttributeConversionDispatcherHandler( elementName, attributeName ) {
			dispatcher.on( `attribute:${ attributeName }:media`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const containerElement = conversionApi.mapper.toViewElement( data.item );
				const viewElement = getDescendantElement( conversionApi, containerElement, elementName );

				setViewAttributes( conversionApi.writer, data.attributeNewValue, viewElement );
			} );
		}
	};
}

// Returns the first view element descendant matching the given view name.
// Includes view element itself.
//
// @private
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {module:engine/view/element~Element} containerElement
// @param {String} elementName
// @returns {module:engine/view/element~Element|null}
function getDescendantElement( conversionApi, containerElement, elementName ) {
	const range = conversionApi.writer.createRangeOn( containerElement );

	for ( const { item } of range.getWalker() ) {
		if ( item.is( 'element', elementName ) ) {
			return item;
		}
	}
}
