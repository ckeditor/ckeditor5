/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties/converters
 */

import ListWalker from '../documentlist/utils/listwalker';
import { findMappedViewElement } from '../documentlist/converters';
import { createListElement, isListView } from '../documentlist/utils/view';

/**
 * Returns a converter consumes the `style`, `reversed` and `start` attribute.
 * In `style` it searches for the `list-style-type` definition.
 * If not found, the `"default"` value will be used.
 *
 * @protected
 * @param {Array.<module:list/documentlistproperties/documentlistpropertiesediting~AttributeStrategy>} attributeStrategies
 * @returns {Function}
 */
export function listPropertiesUpcastConverter( attributeStrategies ) {
	return ( evt, data, conversionApi ) => {
		const { writer, schema, consumable } = conversionApi;

		const parentList = data.viewItem.parent;

		// It may happen that the native spell checker fixes a word inside a list item.
		// When the children mutation is fired, the `<li>` does not have the parent element. See: #9325.
		if ( !parentList ) {
			return;
		}

		if ( !data.modelRange ) {
			return;
		}

		const items = Array.from( data.modelRange.getItems( { shallow: true } ) );

		for ( const strategy of attributeStrategies ) {
			// if ( !consumable.test( parentList, strategy.viewConsumables ) ) {
			// 	continue;
			// }
			//
			// let applied = false;

			for ( const item of items ) {
				if ( !schema.checkAttribute( item, strategy.attributeName ) ) {
					continue;
				}

				if ( !strategy.appliesToListItem( item ) ) {
					continue;
				}

				// Set list attributes only on same level items, those nested deeper are already handled by the recursive conversion.
				if ( item.hasAttribute( strategy.attributeName ) ) {
					continue;
				}

				writer.setAttribute( strategy.attributeName, strategy.getAttributeOnUpcast( parentList ), item );
				// applied = true;
			}

			// if ( applied ) {
			// 	consumable.consume( parentList, strategy.viewConsumables );
			// }
		}
	};
}

/**
 * Returns a converter that adds `reversed`, `start` attributes and adds `list-style-type` definition as a value for the `style` attribute.
 * The `"default"` values are removed and not present in the view/data.
 *
 * @param {module:list/documentlistproperties/documentlistpropertiesediting~AttributeStrategy} strategy
 * @param {module:engine/model/model~Model} model The model.
 * @returns {Function}
 */
export function listPropertiesDowncastConverter( strategy, model ) {
	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;
		const listItem = data.item;

		if ( !consumable.consume( listItem, evt.name ) ) {
			return;
		}

		// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
		// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
		const viewElement = findMappedViewElement( listItem, mapper, model );
		let viewRange = null;

		// Unwrap element from current list wrappers.
		// There is no view element in the data downcast of bogus paragraph.
		if ( viewElement ) {
			unwrapListItemBlock( viewElement, strategy, writer );
			viewRange = writer.createRangeOn( viewElement );
		} else {
			viewRange = conversionApi.mapper.toViewRange( data.range );
		}

		// Then wrap them with the new list wrappers.
		wrapListItemBlock( listItem, viewRange, strategy, writer );
	};
}

// Unwraps all ol, ul, and li attribute elements that are wrapping the provided view element.
function unwrapListItemBlock( viewElement, strategy, writer ) {
	let attributeElement = viewElement.parent;

	while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
		const parentElement = attributeElement.parent;

		if ( isListView( attributeElement ) ) {
			// Make a clone of an attribute element that only includes properties of list styles.
			const element = writer.createAttributeElement( attributeElement.name, null, {
				priority: attributeElement.priority,
				id: attributeElement.id
			} );

			strategy.setAttributeOnDowncast( writer, strategy.getAttributeOnUpcast( attributeElement ), element );
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
	let listProperty = listItem.getAttribute( strategy.attributeName );

	let currentListItem = listItem;

	for ( let indent = listItemIndent; indent >= 0; indent-- ) {
		if ( strategy.appliesToListItem( currentListItem ) ) {
			const listViewElement = createListElement( writer, indent, listType );

			strategy.setAttributeOnDowncast( writer, listProperty, listViewElement );
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
		listProperty = currentListItem.getAttribute( strategy.attributeName );
	}
}
