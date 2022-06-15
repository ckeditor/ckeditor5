/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/mediaembed
 */

import { Plugin } from 'ckeditor5/src/core';

import DataFilter from '../datafilter';
import DataSchema from '../dataschema';
import { updateViewAttributes } from '../conversionutils.js';

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

		dataFilter.on( 'register:figure', ( ) => {
			conversion.for( 'upcast' ).add( viewToModelFigureAttributesConverter( dataFilter ) );
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

			conversion.for( 'upcast' ).add( viewToModelMediaAttributesConverter( dataFilter, mediaElementName ) );
			conversion.for( 'dataDowncast' ).add( modelToViewMediaAttributeConverter( mediaElementName ) );

			evt.stop();
		} );
	}
}

function viewToModelMediaAttributesConverter( dataFilter, mediaElementName ) {
	return dispatcher => {
		dispatcher.on( `element:${ mediaElementName }`, upcastMedia );
	};

	function upcastMedia( evt, data, conversionApi ) {
		const viewMediaElement = data.viewItem;

		preserveElementAttributes( viewMediaElement, 'htmlAttributes' );

		function preserveElementAttributes( viewElement, attributeName ) {
			const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
			}
		}
	}
}

// View-to-model conversion helper preserving allowed attributes on {@link module:media-embed/mediaembed~MediaEmbed MediaEmbed}
// feature model element from figure view element.
//
// @private
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @returns {Function} Returns a conversion callback.
function viewToModelFigureAttributesConverter( dataFilter ) {
	return dispatcher => {
		dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
			const viewFigureElement = data.viewItem;

			if ( !data.modelRange || !viewFigureElement.hasClass( 'media' ) ) {
				return;
			}

			const viewAttributes = dataFilter.processViewAttributes( viewFigureElement, conversionApi );

			if ( viewAttributes ) {
				conversionApi.writer.setAttribute( 'htmlFigureAttributes', viewAttributes, data.modelRange );
			}
		}, { priority: 'low' } );
	};
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

				const { attributeOldValue, attributeNewValue } = data;
				const containerElement = conversionApi.mapper.toViewElement( data.item );
				const viewElement = getDescendantElement( conversionApi.writer, containerElement, elementName );

				updateViewAttributes( conversionApi.writer, attributeOldValue, attributeNewValue, viewElement );
			} );
		}
	};
}

// Returns the first view element descendant matching the given view name.
// Includes view element itself.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:engine/view/element~Element} containerElement
// @param {String} elementName
// @returns {module:engine/view/element~Element|null}
function getDescendantElement( writer, containerElement, elementName ) {
	const range = writer.createRangeOn( containerElement );

	for ( const { item } of range.getWalker() ) {
		if ( item.is( 'element', elementName ) ) {
			return item;
		}
	}
}
