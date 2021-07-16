/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/list
 */

import { Plugin } from 'ckeditor5/src/core';
import { uid } from 'ckeditor5/src/utils';
import { disallowedAttributesConverter } from '../converters';
import { setViewAttributes } from '../conversionutils.js';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support integration with {@link module:list/list~List List} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListElementSupport extends Plugin {
	static get requires() {
		return [ DataFilter ];
	}

	init() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );

		dataFilter.on( 'register:ul', ( evt, definition ) => {
			conversion.for( 'upcast' ).add( disallowedAttributesConverter( definition, dataFilter ) );
			conversion.for( 'upcast' ).add( viewToModelListAttributeConverter( dataFilter, 'ul' ) );

			evt.stop();
		} );

		dataFilter.on( 'register:ol', ( evt, definition ) => {
			conversion.for( 'upcast' ).add( disallowedAttributesConverter( definition, dataFilter ) );
			conversion.for( 'upcast' ).add( viewToModelListAttributeConverter( dataFilter, 'ol' ) );

			evt.stop();
		} );

		dataFilter.on( 'register:li', ( evt, definition ) => {
			if ( definition.model !== 'listItem' ) {
				return;
			}

			conversion.for( 'upcast' ).add( viewToModelListItemAttributeConverter( dataFilter ) );
			conversion.for( 'downcast' ).add( modelToViewListItemAttributeConverter( editor ) );
		} );
	}
}

// View-to-model conversion helper preserving allowed attributes of the `ul` or `ol` elements.
//
// Attributes are stored on the special `$htmlList:[uid]` root element attribute. The mapping between
// list items and attribute keys are stored inside
// {@link module:engine/conversion/upcastdispatcher~UpcastConversionApi#store conversionApi store}.
//
// @private
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @param {'ol|ul'} listName
// @returns {Function} Returns a conversion callback.
function viewToModelListAttributeConverter( dataFilter, listName ) {
	return dispatcher => {
		dispatcher.on( `element:${ listName }`, ( evt, data, conversionApi ) => {
			const viewAttributes = dataFilter._consumeAllowedAttributes( data.viewItem, conversionApi );

			if ( !viewAttributes ) {
				return;
			}

			const root = dataFilter.editor.model.document.getRoot();
			const attributeName = `$htmlList:${ uid() }`;

			// Use store to preserve information about list attribute id
			// between list and list items conversions.
			if ( !conversionApi.store.$htmlList ) {
				conversionApi.store.$htmlList = new WeakMap();
			}

			for ( const node of data.viewItem.getChildren() ) {
				if ( node.is( 'element', 'li' ) ) {
					conversionApi.store.$htmlList.set( node, attributeName );
				}
			}

			conversionApi.writer.setAttribute( attributeName, viewAttributes, root );
		}, { priority: 'low' } );
	};
}

// View-to-model conversion helper connecting list items with correct root element attribute key
// used to store `ul` and `ol` element attributes.
//
// @private
// @returns {Function} Returns a conversion callback.
function viewToModelListItemAttributeConverter() {
	return dispatcher => {
		dispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
			// No attribute has been stored for any list.
			if ( !conversionApi.store.$htmlList ) {
				return;
			}

			const attributeId = conversionApi.store.$htmlList.get( data.viewItem );

			if ( !attributeId ) {
				return;
			}

			conversionApi.writer.setAttribute( 'htmlList', attributeId, data.modelRange );
		}, { priority: 'low' } );
	};
}

// Model-to-view conversion helper applying preserved attributes to `ol` and `ul` list elements.
//
// @private
// @param {module:core/editor/editor~Editor} editor
// @returns {Function} Returns a conversion callback.
function modelToViewListItemAttributeConverter( editor ) {
	return dispatcher => {
		dispatcher.on( 'insert:listItem', ( evt, data, conversionApi ) => {
			const root = editor.model.document.getRoot();
			const attributeId = data.item.getAttribute( 'htmlList' );

			if ( !attributeId ) {
				return;
			}

			const viewAttributes = root.getAttribute( attributeId );

			if ( !viewAttributes ) {
				return;
			}

			const listViewElement = conversionApi.mapper.toViewElement( data.item ).parent;
			setViewAttributes( conversionApi.writer, viewAttributes, listViewElement );
		} );
	};
}
