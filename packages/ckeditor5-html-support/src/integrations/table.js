/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/table
 */

import { Plugin } from 'ckeditor5/src/core';
import { disallowedAttributesConverter } from '../converters';
import { setViewAttributes } from '../conversionutils.js';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support integration with {@link module:table/table~Table Table} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataFilter ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'TableEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );

		dataFilter.on( 'register:table', ( evt, definition ) => {
			if ( definition.model !== 'table' ) {
				return;
			}

			schema.extend( 'table', {
				allowAttributes: [
					'htmlAttributes',
					// Figure, thead and tbody elements don't have model counterparts.
					// We will be preserving attributes on table element using these attribute keys.
					'htmlFigureAttributes', 'htmlTheadAttributes', 'htmlTbodyAttributes'
				]
			} );

			conversion.for( 'upcast' ).add( disallowedAttributesConverter( definition, dataFilter ) );
			conversion.for( 'upcast' ).add( viewToModelTableAttributeConverter( dataFilter ) );
			conversion.for( 'downcast' ).add( modelToViewTableAttributeConverter() );

			evt.stop();
		} );

		dataFilter.on( 'register:figure', () => {
			conversion.for( 'upcast' ).add( consumeTableFigureConverter() );
		} );
	}
}

// View-to-model conversion helper preserving allowed attributes on {@link module:table/table~Table Table}
// feature model element.
//
// @private
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @returns {Function} Returns a conversion callback.
function viewToModelTableAttributeConverter( dataFilter ) {
	return dispatcher => {
		dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
			const viewTableElement = data.viewItem;

			preserveElementAttributes( viewTableElement, 'htmlAttributes' );

			const viewFigureElement = viewTableElement.parent;
			if ( viewFigureElement.is( 'element', 'figure' ) ) {
				preserveElementAttributes( viewFigureElement, 'htmlFigureAttributes' );
			}

			for ( const childNode of viewTableElement.getChildren() ) {
				if ( childNode.is( 'element', 'thead' ) ) {
					preserveElementAttributes( childNode, 'htmlTheadAttributes' );
				}

				if ( childNode.is( 'element', 'tbody' ) ) {
					preserveElementAttributes( childNode, 'htmlTbodyAttributes' );
				}
			}

			function preserveElementAttributes( viewElement, attributeName ) {
				const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
				}
			}
		}, { priority: 'low' } );
	};
}

// Model-to-view conversion helper applying attributes from {@link module:table/table~Table Table}
// feature.
//
// @private
// @returns {Function} Returns a conversion callback.
function modelToViewTableAttributeConverter() {
	return dispatcher => {
		addAttributeConversionDispatcherHandler( 'table', 'htmlAttributes' );
		addAttributeConversionDispatcherHandler( 'figure', 'htmlFigureAttributes' );
		addAttributeConversionDispatcherHandler( 'thead', 'htmlTheadAttributes' );
		addAttributeConversionDispatcherHandler( 'tbody', 'htmlTbodyAttributes' );

		function addAttributeConversionDispatcherHandler( elementName, attributeName ) {
			dispatcher.on( `attribute:${ attributeName }:table`, ( evt, data, conversionApi ) => {
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

// Conversion helper consuming figure element if it's a part of the Table feature
// to avoid elementToElement conversion for figure with that context.
//
// @private
// @returns {Function} Returns a conversion callback.
function consumeTableFigureConverter() {
	return dispatcher => {
		dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
			for ( const childNode of data.viewItem.getChildren() ) {
				if ( childNode.is( 'element', 'table' ) ) {
					conversionApi.consumable.consume( data.viewItem, { name: true } );
					return;
				}
			}
		} );
	};
}
