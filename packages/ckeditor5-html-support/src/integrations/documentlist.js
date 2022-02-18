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
import { LIST_BASE_ATTRIBUTES } from '@ckeditor/ckeditor5-list/src/documentlist/utils/model';
import { findMappedViewElement } from '@ckeditor/ckeditor5-list/src/documentlist/converters';
import { createListElement, createListItemElement, isListView } from '@ckeditor/ckeditor5-list/src/documentlist/utils/view';
import ListWalker from '@ckeditor/ckeditor5-list/src/documentlist/utils/listwalker';

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
			attributeName: 'htmlLiAttributes',
			viewElementNames: [ 'li' ]
		}, this.editor ) );

		dataFilter.on( 'register:ul', registerFilter( {
			attributeName: 'htmlListAttributes',
			viewElementNames: [ 'ul', 'ol' ]
		}, this.editor ) );

		dataFilter.on( 'register:ol', registerFilter( {
			attributeName: 'htmlListAttributes',
			viewElementNames: [ 'ul', 'ol' ]
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
		if ( schema.checkAttribute( '$block', attributeName ) ) {
			evt.stop();

			return;
		}

		// Extend codeBlock to allow attributes required by attribute filtration.
		schema.extend( '$block', { allowAttributes: [ attributeName ] } );
		schema.extend( '$blockObject', { allowAttributes: [ attributeName ] } );
		schema.extend( '$container', { allowAttributes: [ attributeName ] } );

		conversion.for( 'upcast' ).add( viewToModelListAttributeConverter( strategy, dataFilter ) );
		conversion.for( 'downcast' ).add( modelToViewListAttributeConverter( strategy, editor.model ) );

		evt.stop();
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
	const { attributeName, viewElementNames } = strategy;

	return dispatcher => {
		dispatcher.on( 'element', ( evt, data, conversionApi ) => {
			const viewElement = data.viewItem;

			if ( !viewElement.is( 'element' ) || !viewElementNames.includes( viewElement.name ) ) {
				return;
			}

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
		}, { priority: 'low' } );
	};
}

// Model-to-view conversion helper applying attributes from {@link module:code-block/codeblock~CodeBlock Code Block}
// feature model element.
//
// @private
// @param {String} attributeName
// @returns {Function} Returns a conversion callback.
function modelToViewListAttributeConverter( strategy, model ) {
	return dispatcher => {
		for ( const attributeName of [ ...LIST_BASE_ATTRIBUTES, strategy.attributeName ] ) {
			dispatcher.on( `attribute:${ attributeName }`, ( evt, data, conversionApi ) => {
				const { writer, mapper, consumable } = conversionApi;
				const listItem = data.item;

				// Check and consume only the list properties attributes (the base list attributes are already consumed
				// but should also trigger conversion of list properties).
				if ( !LIST_BASE_ATTRIBUTES.includes( data.attributeKey ) && !consumable.consume( listItem, evt.name ) ) {
					return;
				}

				// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
				// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
				const viewElement = findMappedViewElement( listItem, mapper, model );

				// Unwrap element from current list wrappers.
				// unwrapListItemBlock( viewElement, strategy, writer );

				// Then wrap them with the new list wrappers.
				wrapListItemBlock( listItem, writer.createRangeOn( viewElement ), strategy, writer );
			} );
		}
	};
}

// Unwraps all ol, ul, and li attribute elements that are wrapping the provided view element.
function unwrapListItemBlock( viewElement, strategy, writer ) {
	let attributeElement = viewElement.parent;

	while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
		const parentElement = attributeElement.parent;
		const attributeValue = strategy.getAttributeOnUpcast( attributeElement );

		// Unwrap only if the model attribute is really downcasted (it's not the default value).
		if ( isListView( attributeElement ) && attributeValue !== strategy.defaultValue ) {
			// Make a clone of an attribute element that only includes properties of list styles.
			const element = writer.createAttributeElement( attributeElement.name, null, {
				priority: attributeElement.priority,
				id: attributeElement.id
			} );

			strategy.setAttributeOnDowncast( writer, attributeValue, element );
			writer.unwrap( writer.createRangeOn( viewElement ), element );
		}

		attributeElement = parentElement;
	}
}

// Wraps the given list item with appropriate attribute elements for ul, ol, and li.
function wrapListItemBlock( listItem, viewRange, strategy, writer ) {
	if ( !listItem.hasAttribute( 'listIndent' ) ) {
		return;
	}

	const listItemIndent = listItem.getAttribute( 'listIndent' );
	let listType = listItem.getAttribute( 'listType' );
	let listItemId = listItem.getAttribute( 'listItemId' );
	let htmlAttributes = listItem.getAttribute( strategy.attributeName );

	let currentListItem = listItem;

	for ( let indent = listItemIndent; indent >= 0; indent-- ) {
		if ( htmlAttributes ) {
			const listViewElement = strategy.viewElementNames.includes( 'li' ) ?
				createListItemElement( writer, indent, listItemId ) :
				createListElement( writer, indent, listType );

			setViewAttributes( writer, htmlAttributes, listViewElement );
			viewRange = writer.wrap( viewRange, listViewElement );
		}

		if ( indent == 0 ) {
			break;
		}

		currentListItem = ListWalker.first( currentListItem, { lowerIndent: true } );

		// There is no list item with lower indent, this means this is a document fragment containing
		// only a part of nested list (like copy to clipboard) so we don't need to try to wrap it further.
		if ( !currentListItem ) {
			break;
		}

		listType = currentListItem.getAttribute( 'listType' );
		listItemId = currentListItem.getAttribute( 'listItemId' );
		htmlAttributes = currentListItem.getAttribute( strategy.attributeName );
	}
}
