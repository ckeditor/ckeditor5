/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	createListElement,
	createListItemElement,
	getAllListItemElements,
	getIndent,
	getSiblingListItem,
	isListView,
	isListItemView,
	getListItemElements,
	findAndAddListHeadToMap,
	getViewElementNameForListType
} from './utils';
import { uid } from 'ckeditor5/src/utils';
import { UpcastWriter } from 'ckeditor5/src/engine';

/**
 * @module list/documentlist/converters
 */

/**
 * Returns the upcast converter for list items. It's supposed to work after the block converters (content inside list items) is converted.
 *
 * @protected
 * @returns {Function}
 */
export function listItemUpcastConverter() {
	return ( evt, data, conversionApi ) => {
		const { writer, schema } = conversionApi;

		if ( !data.modelRange ) {
			return;
		}

		const items = Array.from( data.modelRange.getItems( { shallow: true } ) )
			.filter( item => schema.checkAttribute( item, 'listItemId' ) );

		if ( !items.length ) {
			return;
		}

		const attributes = {
			listItemId: uid(),
			listIndent: getIndent( data.viewItem ),
			listType: data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted'
		};

		for ( const item of items ) {
			// Set list attributes only on same level items, those nested deeper are already handled by the recursive conversion.
			if ( !item.hasAttribute( 'listItemId' ) ) {
				writer.setAttributes( attributes, item );
			}
		}

		if ( items.length > 1 ) {
			// Make sure that list item that contain only nested list will preserve paragraph for itself:
			// 	<ul>
			// 		<li>
			//			<p></p>  <-- this one must be kept
			// 			<ul>
			// 				<li></li>
			// 			</ul>
			//		</li>
			//	</ul>
			if ( items[ 1 ].getAttribute( 'listItemId' ) != attributes.listItemId ) {
				conversionApi.keepEmptyElement( items[ 0 ] );
			}
		}
	};
}

/**
 * Returns the upcast converter for the `<ul>` and `<ol>` view elements that cleans the input view of garbage.
 * This is mostly to clean whitespaces from between the `<li>` view elements inside the view list element, however, also
 * incorrect data can be cleared if the view was incorrect.
 *
 * @protected
 * @returns {Function}
 */
export function listUpcastCleanList() {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.test( data.viewItem, { name: true } ) ) {
			return;
		}

		const viewWriter = new UpcastWriter( data.viewItem.document );

		for ( const child of Array.from( data.viewItem.getChildren() ) ) {
			if ( !isListItemView( child ) && !isListView( child ) ) {
				viewWriter.remove( child );
			}
		}
	};
}

/**
 * Returns a model document change:data event listener that triggers conversion of related items if needed.
 *
 * @protected
 * @param {module:engine/model/model~Model} model The editor model.
 * @param {module:engine/controller/editingcontroller~EditingController} editing The editing controller.
 * @return {Function}
 */
export function reconvertItemsOnDataChange( model, editing ) {
	return () => {
		const changes = model.document.differ.getChanges();
		const itemsToRefresh = new Set();
		const itemToListHead = new Map();
		const changedItems = new Set();

		for ( const entry of changes ) {
			if ( entry.type == 'insert' && entry.name != '$text' ) {
				findAndAddListHeadToMap( entry.position, itemToListHead );

				// Insert of a non-list item.
				if ( !entry.attributes.has( 'listItemId' ) ) {
					findAndAddListHeadToMap( entry.position.getShiftedBy( entry.length ), itemToListHead );
				} else {
					changedItems.add( entry.position.nodeAfter );
				}
			}
			// Removed list item.
			else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
				findAndAddListHeadToMap( entry.position, itemToListHead );
			}
			// Changed list attribute.
			else if ( entry.type == 'attribute' ) {
				const item = entry.range.start.nodeAfter;

				if ( entry.attributeKey.startsWith( 'list' ) ) {
					findAndAddListHeadToMap( entry.range.start, itemToListHead );

					if ( entry.attributeNewValue === null ) {
						findAndAddListHeadToMap( entry.range.start.getShiftedBy( 1 ), itemToListHead );
						refreshItemParagraphIfNeeded( item, [] );
					} else {
						changedItems.add( item );
					}
				} else if ( item.hasAttribute( 'listItemId' ) ) {
					refreshItemParagraphIfNeeded( item );
				}
			}
		}

		for ( const listHead of itemToListHead.values() ) {
			checkList( listHead );
		}

		for ( const item of itemsToRefresh ) {
			editing.reconvertItem( item );
		}

		function checkList( listHead ) {
			const visited = new Set();
			const stack = [];

			for (
				let prev = null, item = listHead;
				item && item.hasAttribute( 'listItemId' );
				prev = item, item = item.nextSibling
			) {
				if ( visited.has( item ) ) {
					continue;
				}

				const itemIndent = item.getAttribute( 'listIndent' );

				if ( prev && itemIndent < prev.getAttribute( 'listIndent' ) ) {
					stack.length = itemIndent + 1;
				}

				stack[ itemIndent ] = {
					id: item.getAttribute( 'listItemId' ),
					type: item.getAttribute( 'listType' )
				};

				const blocks = getListItemElements( item, 'forward' );

				for ( const block of blocks ) {
					visited.add( block );

					refreshItemParagraphIfNeeded( block, blocks );
					refreshItemWrappingIfNeeded( block, stack );
				}
			}
		}

		function refreshItemParagraphIfNeeded( item, blocks ) {
			if ( !item.is( 'element', 'paragraph' ) ) {
				return;
			}

			const viewElement = editing.mapper.toViewElement( item );

			if ( !viewElement ) {
				return;
			}

			const useBogus = shouldUseBogusParagraph( item, blocks );

			if ( useBogus && viewElement.is( 'element', 'p' ) ) {
				itemsToRefresh.add( item );
			} else if ( !useBogus && viewElement.is( 'element', 'span' ) ) {
				itemsToRefresh.add( item );
			}
		}

		function refreshItemWrappingIfNeeded( item, stack ) {
			// Items directly affected by some "change" don't need a refresh, they will be converted by their own changes.
			if ( changedItems.has( item ) ) {
				return;
			}

			const viewElement = editing.mapper.toViewElement( item );
			let stackIdx = stack.length - 1;

			for (
				let element = viewElement.parent;
				!element.is( 'editableElement' );
				element = element.parent
			) {
				if ( isListItemView( element ) ) {
					if ( element.id != stack[ stackIdx ].id ) {
						break;
					}
				} else if ( isListView( element ) ) {
					const expectedElementName = getViewElementNameForListType( stack[ stackIdx ].type );

					if ( element.name != expectedElementName ) {
						break;
					}

					stackIdx--;

					// Don't need to iterate further if we already know that the item is wrapped appropriately.
					if ( stackIdx < 0 ) {
						return;
					}
				}
			}

			itemsToRefresh.add( item );
		}
	};
}

/**
 * Returns the view-to-model element length mapping callback for list items. This is used in the data pipeline to be able to map length
 * of the bogus paragraphs that are down-casted in the data pipeline without any container.
 *
 * @protected
 * @param {module:engine/conversion/mapper~Mapper} mapper The mapper instance.
 * @param {module:engine/model/schema~Schema} schema A schema instance.
 * @return {Function}
 */
export function listItemViewToModelLengthMapper( mapper, schema ) {
	function getViewListItemModelLength( element ) {
		let length = 0;

		// First count model size of nested lists.
		for ( const child of element.getChildren() ) {
			if ( isListView( child ) ) {
				for ( const item of child.getChildren() ) {
					length += getViewListItemModelLength( item );
				}
			}
		}

		let hasBlocks = false;

		// Then add the size of block elements or in case of content directly in the LI add 1.
		for ( const child of element.getChildren() ) {
			if ( !isListView( child ) ) {
				const modelElement = mapper.toModelElement( child );

				// If the content is not mapped (attribute element or a text)
				// or is inline then this is a content directly in the LI.
				if ( !modelElement || schema.isInline( modelElement ) ) {
					return length + 1;
				}

				// There are some blocks in LI so count their model length.
				length += mapper.getModelLength( child );
				hasBlocks = true;
			}
		}

		// If the LI was empty or contained only nested lists.
		if ( !hasBlocks ) {
			length += 1;
		}

		return length;
	}

	return getViewListItemModelLength;
}

/**
 * Returns the list item downcast converter.
 *
 * @protected
 * @param {Array.<String>} attributes A list of attribute names that should be converted if are set.
 * @param {module:engine/model/model~Model} model The model.
 * @returns {Function}
 */
export function listItemDowncastConverter( attributes, model ) {
	const consumer = createAttributesConsumer( attributes );

	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		const listItem = data.item;

		// Test if attributes on the converted items are not consumed.
		if ( !consumer( listItem, consumable ) ) {
			return;
		}

		// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
		// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
		const viewElement = findMappedViewElement( listItem, mapper, model );

		// Unwrap element from current list wrappers.
		unwrapListItemBlock( viewElement, writer );

		// Then wrap them with the new list wrappers.
		wrapListItemBlock( listItem, writer.createRangeOn( viewElement ), writer );
	};
}

/**
 * Returns the bogus paragraph downcast converter. A bogus paragraph is used if a list item contains only a single block or nested list.
 *
 * @protected
 * @param {Array.<String>} attributes A list of attribute names that should be converted if are set.
 * @param {module:engine/model/model~Model} model The model.
 * @param {Object} [options]
 * @param {Boolean} [options.dataPipeline=false]
 * @returns {Function}
 */
export function listItemParagraphDowncastConverter( attributes, model, { dataPipeline } ) {
	const attributesConsumer = createAttributesConsumer( attributes );

	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		const listItem = data.item;

		// Test the paragraph.
		if ( !consumable.test( listItem, evt.name ) ) {
			return;
		}

		// Convert only if a bogus paragraph should be used.
		if ( !shouldUseBogusParagraph( listItem ) ) {
			return;
		}

		// Consume attributes.
		if ( !attributesConsumer( listItem, consumable ) ) {
			return;
		}

		// Consume the paragraph.
		consumable.consume( listItem, evt.name );

		const paragraphElement = writer.createContainerElement( 'span', { class: 'ck-list-bogus-paragraph' } );
		const viewPosition = mapper.toViewPosition( data.range.start );

		mapper.bindElements( listItem, paragraphElement );
		writer.insert( viewPosition, paragraphElement );

		conversionApi.convertChildren( listItem );

		// Find the range over the bogus paragraph (or just an inline content in the data pipeline).
		let viewRange;

		if ( !dataPipeline ) {
			viewRange = writer.createRangeOn( paragraphElement );
		} else {
			// Unwrap paragraph content from bogus paragraph.
			viewRange = writer.move( writer.createRangeIn( paragraphElement ), viewPosition );

			writer.remove( paragraphElement );
			mapper.unbindViewElement( paragraphElement );
		}

		// Then wrap it with the list wrappers.
		wrapListItemBlock( listItem, viewRange, writer );
	};
}

// Helper for mapping mode to view elements. It's using positions mapping instead of mapper.toViewElement( element )
// to find outermost view element. This is for cases when mapping is using inner view element like in the code blocks (pre > code).
function findMappedViewElement( element, mapper, model ) {
	const modelRange = model.createRangeOn( element );
	const viewRange = mapper.toViewRange( modelRange ).getTrimmed();

	return viewRange.getContainedElement();
}

// Unwraps all ol, ul, and li attribute elements that are wrapping the provided view element.
function unwrapListItemBlock( viewElement, viewWriter ) {
	let attributeElement = viewElement.parent;

	while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
		const parentElement = attributeElement.parent;

		// Make a clone of an attribute element that only includes properties of generic list (i.e., without list styles).
		const element = viewWriter.createAttributeElement( attributeElement.name, null, {
			priority: attributeElement.priority,
			id: attributeElement.id
		} );

		viewWriter.unwrap( viewWriter.createRangeOn( viewElement ), element );

		attributeElement = parentElement;
	}
}

// Wraps the given list item with appropriate attribute elements for ul, ol, and li.
function wrapListItemBlock( listItem, viewRange, writer ) {
	if ( !listItem.hasAttribute( 'listIndent' ) ) {
		return;
	}

	const listItemIndent = listItem.getAttribute( 'listIndent' );
	let listItemId = listItem.getAttribute( 'listItemId' );
	let listType = listItem.getAttribute( 'listType' );

	let currentListItem = listItem;

	for ( let indent = listItemIndent; indent >= 0; indent-- ) {
		const listItemViewElement = createListItemElement( writer, indent, listItemId );
		const listViewElement = createListElement( writer, indent, listType );

		listItemViewElement.getFillerOffset = getListItemFillerOffset;

		viewRange = writer.wrap( viewRange, listItemViewElement );
		viewRange = writer.wrap( viewRange, listViewElement );

		if ( indent == 0 ) {
			break;
		}

		currentListItem = getSiblingListItem( currentListItem, { smallerIndent: true, listIndent: indent } );

		// There is no list item with smaller indent, this means this is a document fragment containing
		// only a part of nested list (like copy to clipboard) so we don't need to try to wrap it further.
		if ( !currentListItem ) {
			break;
		}

		listItemId = currentListItem.getAttribute( 'listItemId' );
		listType = currentListItem.getAttribute( 'listType' );
	}
}

// Returns the function that is responsible for consuming attributes that are set on the model node.
function createAttributesConsumer( attributes ) {
	return ( node, consumable ) => {
		const events = [];

		// Collect all set attributes that are triggering conversion.
		for ( const attributeName of attributes ) {
			if ( node.hasAttribute( attributeName ) ) {
				events.push( `attribute:${ attributeName }` );
			}
		}

		if ( !events.every( event => consumable.test( node, event ) !== false ) ) {
			return false;
		}

		events.forEach( event => consumable.consume( node, event ) );

		return true;
	};
}

// The function that handled block filler position in the list items with bogus paragraph.
// Note that this has a purpose only in the data pipeline, so we can ignore UIElements.
function getListItemFillerOffset() {
	for ( const child of this.getChildren() ) {
		// There is no content before a nested list so render a block filler before the nested list.
		if ( isListView( child ) ) {
			return 0;
		} else {
			return null;
		}
	}

	// Render block filler if there is no children in the list item.
	return 0;
}

// Whether the given item should be rendered as a bogus paragraph.
function shouldUseBogusParagraph( item, blocks = getAllListItemElements( item ) ) {
	if ( !item.hasAttribute( 'listItemId' ) ) {
		return false;
	}

	for ( const attributeKey of item.getAttributeKeys() ) {
		// Ignore selection attributes stored on block elements.
		if ( attributeKey.startsWith( 'selection:' ) ) {
			continue;
		}

		// Don't use bogus paragraph if there are attributes from other features.
		if ( !attributeKey.startsWith( 'list' ) ) {
			return false;
		}
	}

	return blocks.length < 2;
}
