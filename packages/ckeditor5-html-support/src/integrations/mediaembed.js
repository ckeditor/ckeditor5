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
import { getDataFromElement } from 'ckeditor5/src/utils';

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
		// const dataSchema = this.editor.plugins.get( DataSchema );

		const mediaElementName = editor.config.get( 'mediaEmbed.elementName' );

		// Add dynamically schema definition for a given elementName.
		// dataSchema.registerBlockElement( {
		// 	model: 'htmlOembed2',
		// 	view: mediaElementName,
		// 	isObject: true,
		// 	modelSchema: {
		// 		inheritAllFrom: '$htmlObjectInline'
		// 	}
		// } );

		dataFilter.on( `register:${ mediaElementName }`, ( evt, definition ) => {
			if ( definition.model !== 'htmlOembed' ) {
				return;
			}

			schema.extend( 'media', {
				allowAttributes: [
					'htmlAttributes',
					'htmlFigureAttributes'
				]
			} );

			conversion.for( 'upcast' ).add( disallowedAttributesConverter( definition, dataFilter ) );
			conversion.for( 'upcast' ).add( viewToModelOembedAttributesConverter( dataFilter, mediaElementName ) );
			conversion.for( 'dataDowncast' ).add( modelToViewOembedAttributeConverter( mediaElementName ) );

			evt.stop();
		} );
	}
}

function viewToModelOembedAttributesConverter( dataFilter, mediaElementName ) {
	return dispatcher => {
		dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
			if ( data.viewItem.getChild( 0 ).name === 'oembed' ) {
				// Since we are converting to attribute we need a range on which we will set the attribute.
				// If the range is not created yet, let's create it by converting children of the current node first.
				if ( !data.modelRange ) {
					// Convert children and set conversion result as a current data.
					Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
				}

				const viewOembedElement = data.viewItem.getChild( 0 );
				preserveElementAttributes( viewOembedElement, 'htmlAttributes' );

				const viewFigureElement = viewOembedElement.parent;
				if ( viewFigureElement.is( 'element', 'figure' ) ) {
					preserveElementAttributes( viewFigureElement, 'htmlFigureAttributes' );
				}

				conversionApi.consumable.consume( data.viewItem, { name: true } );
			}

			function preserveElementAttributes( viewElement, attributeName ) {
				const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
				}
			}
		} );

		// dispatcher.on( `element:${ mediaElementName }`, ( evt, data, conversionApi ) => {
		// 	const viewOembedElement = data.viewItem;

		// 	preserveElementAttributes( viewOembedElement, 'htmlAttributes' );

		// 	const viewFigureElement = viewOembedElement.parent;
		// 	if ( viewFigureElement.is( 'element', 'figure' ) ) {
		// 		preserveElementAttributes( viewFigureElement, 'htmlFigureAttributes' );
		// 	}

		// 	function preserveElementAttributes( viewElement, attributeName ) {
		// 		const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

		// 		if ( viewAttributes ) {
		// 			conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
		// 		}
		// 	}
		// },
		// // Low priority to let other converters prepare the modelRange for us.
		// { priority: 'low' } );
	};
}

function modelToViewOembedAttributeConverter( mediaElementName ) {
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
