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
		if ( !this.editor.plugins.has( 'DocumentListEditing' ) ) {
			return;
		}

		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on( 'register:li', registerFilter( {
			scope: 'item',
			attributeName: 'htmlLiAttributes',
			setAttributeOnDowncast: setViewAttributes
		}, this.editor ) );

		dataFilter.on( 'register:ul', registerFilter( {
			scope: 'list',
			attributeName: 'htmlListAttributes',
			setAttributeOnDowncast: setViewAttributes
		}, this.editor ) );

		dataFilter.on( 'register:ol', registerFilter( {
			scope: 'list',
			attributeName: 'htmlListAttributes',
			setAttributeOnDowncast: setViewAttributes
		}, this.editor ) );
	}
}

// TODO
function registerFilter( strategy, editor ) {
	const { attributeName } = strategy;

	const schema = editor.model.schema;
	const conversion = editor.conversion;
	const dataFilter = editor.plugins.get( DataFilter );

	return evt => {
		evt.stop();

		if ( schema.checkAttribute( '$block', attributeName ) ) {
			return;
		}

		// Extend codeBlock to allow attributes required by attribute filtration.
		schema.extend( '$block', { allowAttributes: [ attributeName ] } );
		schema.extend( '$blockObject', { allowAttributes: [ attributeName ] } );
		schema.extend( '$container', { allowAttributes: [ attributeName ] } );

		conversion.for( 'upcast' ).add( dispatcher => {
			if ( strategy.scope == 'list' ) {
				dispatcher.on( 'element:ul', viewToModelListAttributeConverter( strategy, dataFilter ), { priority: 'low' } );
				dispatcher.on( 'element:ol', viewToModelListAttributeConverter( strategy, dataFilter ), { priority: 'low' } );
			} else /* if ( strategy.scope == 'item' ) */ {
				dispatcher.on( 'element:li', viewToModelListAttributeConverter( strategy, dataFilter ), { priority: 'low' } );
			}
		} );

		// Register downcast strategy.
		editor.plugins.get( 'DocumentListEditing' ).registerDowncastStrategy( strategy );
	};
}

// View-to-model conversion helper preserving allowed attributes on {@link TODO}
// feature model element.
//
// Attributes are preserved as a value of `htmlLiAttributes` model attribute.
//
// @private
// @param {String} attributeName
// @param {String} viewElementName
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @returns {Function} Returns a conversion callback.
function viewToModelListAttributeConverter( strategy, dataFilter ) {
	const { attributeName } = strategy;

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
