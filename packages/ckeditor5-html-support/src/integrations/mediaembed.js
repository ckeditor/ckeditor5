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

		if ( !editor.plugins.has( 'MediaEmbed' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on( 'register:oembed', ( evt, definition ) => {
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
			conversion.for( 'upcast' ).add( viewToModelOembedAttributesConverter( dataFilter ) );
			conversion.for( 'dataDowncast' ).add( modelToViewOembedAttributeConverter() );

			evt.stop();
		} );
	}
}

function viewToModelOembedAttributesConverter( dataFilter ) {
	return dispatcher => {
		dispatcher.on( 'element:oembed', ( evt, data, conversionApi ) => {
			const viewOembedElement = data.viewItem;

			preserveElementAttributes( viewOembedElement, 'htmlAttributes' );

			const viewFigureElement = viewOembedElement.parent;
			if ( viewFigureElement.is( 'element', 'figure' ) ) {
				preserveElementAttributes( viewFigureElement, 'htmlFigureAttributes' );
			}

			function preserveElementAttributes( viewElement, attributeName ) {
				const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
				}
			}
		},
		// Low priority to let other converters prepare the modelRange for us.
		{ priority: 'low' } );
	};
}

function modelToViewOembedAttributeConverter() {
	return dispatcher => {
		addAttributeConversionDispatcherHandler( 'oembed', 'htmlAttributes' );
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
