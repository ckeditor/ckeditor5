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
			if ( schema.checkAttribute( '$block', 'listHtmlListAttributes' ) ) {
				return;
			}

			// Note that document list integration is using attributes prefixed by "list"
			// to automatically use mechanisms built into the document lists.
			schema.extend( '$block', { allowAttributes: [ 'listHtmlListAttributes', 'listHtmlLiAttributes' ] } );
			schema.extend( '$blockObject', { allowAttributes: [ 'listHtmlListAttributes', 'listHtmlLiAttributes' ] } );
			schema.extend( '$container', { allowAttributes: [ 'listHtmlListAttributes', 'listHtmlLiAttributes' ] } );

			conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:ul', upcastListAttributeConverter( 'listHtmlListAttributes', dataFilter ), { priority: 'low' } );
				dispatcher.on( 'element:ol', upcastListAttributeConverter( 'listHtmlListAttributes', dataFilter ), { priority: 'low' } );
				dispatcher.on( 'element:li', upcastListAttributeConverter( 'listHtmlLiAttributes', dataFilter ), { priority: 'low' } );
			} );

			// Register downcast strategy.
			documentListEditing.registerDowncastStrategy( {
				scope: 'item',
				attributeName: 'listHtmlLiAttributes',

				setAttributeOnDowncast( writer, attributeValue, viewElement ) {
					setViewAttributes( writer, attributeValue, viewElement );
				}
			} );

			documentListEditing.registerDowncastStrategy( {
				scope: 'list',
				attributeName: 'listHtmlListAttributes',

				setAttributeOnDowncast( writer, viewAttributes, viewElement ) {
					setViewAttributes( writer, viewAttributes, viewElement );
				}
			} );

			// Make sure that all items in a single list (items at the same level & listType) have the same properties.
			// Note: This is almost exact copy from DocumentListPropertiesEditing.
			documentListEditing.on( 'postFixer', ( evt, { listNodes, writer } ) => {
				const previousNodesByIndent = []; // Last seen nodes of lower indented lists.

				for ( const { node, previous } of listNodes ) {
					// For the first list block there is nothing to compare with.
					if ( !previous ) {
						continue;
					}

					const nodeIndent = node.getAttribute( 'listIndent' );
					const previousNodeIndent = previous.getAttribute( 'listIndent' );

					let previousNodeInList = null; // It's like `previous` but has the same indent as current node.

					// Let's find previous node for the same indent.
					// We're going to need that when we get back to previous indent.
					if ( nodeIndent > previousNodeIndent ) {
						previousNodesByIndent[ previousNodeIndent ] = previous;
					}
					// Restore the one for given indent.
					else if ( nodeIndent < previousNodeIndent ) {
						previousNodeInList = previousNodesByIndent[ nodeIndent ];
						previousNodesByIndent.length = nodeIndent;
					}
					// Same indent.
					else {
						previousNodeInList = previous;
					}

					// This is a first item of a nested list.
					if ( !previousNodeInList ) {
						continue;
					}

					if ( previousNodeInList.getAttribute( 'listType' ) == node.getAttribute( 'listType' ) ) {
						const value = previousNodeInList.getAttribute( 'listHtmlListAttributes' );

						if ( node.getAttribute( 'listHtmlListAttributes' ) != value ) {
							writer.setAttribute( 'listHtmlListAttributes', value, node );
							evt.return = true;
						}
					}

					if ( previousNodeInList.getAttribute( 'listItemId' ) == node.getAttribute( 'listItemId' ) ) {
						const value = previousNodeInList.getAttribute( 'listHtmlLiAttributes' );

						if ( node.getAttribute( 'listHtmlLiAttributes' ) != value ) {
							writer.setAttribute( 'listHtmlLiAttributes', value, node );
							evt.return = true;
						}
					}
				}
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
function upcastListAttributeConverter( attributeName, dataFilter ) {
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
