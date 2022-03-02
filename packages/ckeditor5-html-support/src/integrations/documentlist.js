/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/documentlist
 */

import { Plugin } from 'ckeditor5/src/core';
import { setViewAttributes } from '../conversionutils.js';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support integration with {@link module:list/documentlist~DocumentList Document List} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListElementSupport extends Plugin {
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

		if ( !editor.plugins.has( 'DocumentListEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );
		const documentListEditing = editor.plugins.get( 'DocumentListEditing' );

		dataFilter.on( 'register', ( evt, definition ) => {
			if ( ![ 'ul', 'ol', 'li' ].includes( definition.view ) ) {
				return;
			}

			evt.stop();

			// Do not register same converters twice.
			if ( schema.checkAttribute( '$block', 'htmlListAttributes' ) ) {
				return;
			}

			schema.extend( '$block', { allowAttributes: [ 'htmlListAttributes', 'htmlLiAttributes' ] } );
			schema.extend( '$blockObject', { allowAttributes: [ 'htmlListAttributes', 'htmlLiAttributes' ] } );
			schema.extend( '$container', { allowAttributes: [ 'htmlListAttributes', 'htmlLiAttributes' ] } );

			conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:ul', viewToModelListAttributeConverter( 'htmlListAttributes', dataFilter ), { priority: 'low' } );
				dispatcher.on( 'element:ol', viewToModelListAttributeConverter( 'htmlListAttributes', dataFilter ), { priority: 'low' } );
				dispatcher.on( 'element:li', viewToModelListAttributeConverter( 'htmlLiAttributes', dataFilter ), { priority: 'low' } );
			} );

			// Register downcast strategy.
			documentListEditing.registerDowncastStrategy( {
				scope: 'item',
				attributeName: 'htmlLiAttributes',
				setAttributeOnDowncast: setViewAttributes
			} );

			documentListEditing.registerDowncastStrategy( {
				scope: 'list',
				attributeName: 'htmlListAttributes',
				setAttributeOnDowncast: setViewAttributes
			} );
		} );
	}
}

// View-to-model conversion helper preserving allowed attributes on {@link TODO}
// feature model element.
//
// @private
// @param {String} attributeName
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @returns {Function} Returns a conversion callback.
function viewToModelListAttributeConverter( attributeName, dataFilter ) {
	return ( evt, data, conversionApi ) => {
		const viewElement = data.viewItem;

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const viewAttributes = dataFilter._consumeAllowedAttributes( viewElement, conversionApi );

		for ( const item of data.modelRange.getItems( { shallow: true } ) ) {
			// Apply only to list item blocks.
			if ( !item.hasAttribute( 'listItemId' ) ) {
				continue;
			}

			// Set list attributes only on same level items, those nested deeper are already handled
			// by the recursive conversion.
			if ( item.hasAttribute( attributeName ) ) {
				continue;
			}

			conversionApi.writer.setAttribute( attributeName, viewAttributes || {}, item );
		}
	};
}
