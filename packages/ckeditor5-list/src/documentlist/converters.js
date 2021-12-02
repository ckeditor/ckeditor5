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
	getAllListItemElementsByDetails
} from './utils';
import { uid } from 'ckeditor5/src/utils';
import { UpcastWriter } from 'ckeditor5/src/engine';

/**
 * @module list/documentlist/converters
 */

/**
 * TODO
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
 * TODO
 *
 * A view-to-model converter for the `<ul>` and `<ol>` view elements that cleans the input view of garbage.
 * This is mostly to clean whitespaces from between the `<li>` view elements inside the view list element, however, also
 * incorrect data can be cleared if the view was incorrect.
 *
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

// TODO
export function reconvertItemsOnDataChange( model, editing ) {
	return () => {
		const changes = model.document.differ.getChanges();
		const itemsToRefresh = new Set();

		for ( const entry of changes ) {
			let position = null;

			if ( entry.type == 'insert' && entry.attributes.has( 'listItemId' ) ) {
				position = entry.position.getShiftedBy( entry.length );
			} else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
				position = entry.position;
			} else if ( entry.type == 'attribute' && entry.attributeKey.startsWith( 'list' ) ) {
				position = entry.range.start.getShiftedBy( 1 );
			}

			if ( !position ) {
				continue;
			}

			const changedListItem = position.nodeBefore;
			const followingListItem = position.nodeAfter;

			if ( entry.type == 'attribute' && entry.attributeKey == 'listItemId' ) {
				const item = changedListItem;

				if ( entry.attributeNewValue === null || entry.attributeOldValue === null ) {
					itemsToRefresh.add( item );
					// @if CK_DEBUG // console.log( 'Refresh item (no list)', item.childCount ? item.getChild( 0 ).data : item );
				}
			}

			if ( !changedListItem || !changedListItem.hasAttribute( 'listItemId' ) ) {
				continue;
			}

			if ( !followingListItem || !followingListItem.hasAttribute( 'listItemId' ) ) {
				continue;
			}

			// Reconvert bogus vs not bogus paragraph.
			if ( entry.type == 'remove' || entry.type == 'insert' ) {
				const items = getAllListItemElementsByDetails(
					entry.attributes.get( 'listItemId' ),
					entry.attributes.get( 'listIndent' ),
					position
				);

				const item = items.length ? items[ 0 ] : null;
				const viewElement = item ? editing.mapper.toViewElement( item ) : null;

				if ( viewElement ) {
					if ( items.length == 1 && viewElement.is( 'element', 'p' ) ) {
						itemsToRefresh.add( item );
						// @if CK_DEBUG // console.log( 'Refresh item (to bogus)', item.childCount ? item.getChild( 0 ).data : item );
					} else if ( items.length > 1 && viewElement.is( 'element', 'span' ) ) {
						itemsToRefresh.add( item );
						// @if CK_DEBUG // console.log( 'Refresh item (from bogus)', item.childCount ? item.getChild( 0 ).data : item );
					}
				}
			}

			// TODO refresh bogus in case some list entries got merged (id change) or on indentation change.

			// Reconvert following items that require re-wrapping with LIs and ULs.
			let indent;

			if ( entry.type == 'remove' ) {
				indent = entry.attributes.get( 'listIndent' );
			} else if ( entry.type == 'attribute' && entry.attributeKey == 'listIndent' ) {
				indent = Math.min( changedListItem.getAttribute( 'listIndent' ), entry.attributeOldValue );
			} else {
				indent = changedListItem.getAttribute( 'listIndent' );
			}

			for (
				let currentNode = followingListItem;
				currentNode && currentNode.is( 'element' ) && currentNode.hasAttribute( 'listItemId' );
				currentNode = currentNode.nextSibling
			) {
				if ( currentNode.getAttribute( 'listIndent' ) <= indent ) {
					break;
				}

				if ( !editing.mapper.toViewElement( currentNode ) ) {
					continue;
				}

				itemsToRefresh.add( currentNode );
				// @if CK_DEBUG // console.log( 'Refresh item', currentNode.childCount ? currentNode.getChild( 0 ).data : currentNode );
			}
		}

		for ( const item of itemsToRefresh ) {
			editing.reconvertItem( item );
		}
	};
}

// TODO
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
 * TODO
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
		const viewElement = findMappedViewElement( listItem, mapper, model, writer );

		// Attributes are converted after the element itself so a view element should be there.
		if ( !viewElement ) {
			return;
		}

		// Unwrap element from current list wrappers.
		unwrapListItemBlock( viewElement, writer );

		// Then wrap them with the new list wrappers.
		wrapListItemBlock( listItem, writer.createRangeOn( viewElement ), writer );
	};
}

/**
 * TODO
 */
export function listItemParagraphDowncastConverter( attributes, model, { dataPipeline } ) {
	const consumer = createAttributesConsumer( attributes );

	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		const listItem = data.item;

		// Test if attributes on the converted items are not consumed.
		if ( !consumer( listItem, consumable, { preflight: true } ) ) {
			return;
		}

		// Test the paragraph itself.
		if ( !consumable.test( listItem, evt.name ) ) {
			return;
		}

		// Convert only if a bogus paragraph should be used.
		if ( !shouldUseBogusParagraph( listItem, model ) ) {
			return;
		}

		// Test and consume the paragraph.
		if ( !consumable.consume( listItem, evt.name ) ) {
			return;
		}

		// Consume the attributes.
		consumer( listItem, consumable );

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

// TODO
function findMappedViewElement( listItem, mapper, model, viewWriter ) {
	const viewPosition = mapper.toViewPosition( model.createPositionBefore( listItem ) );
	const viewElement = mapper.toViewElement( listItem );

	// There is no mapping for a given model element.
	if ( !viewElement ) {
		return null;
	}

	// Verify if the element is still in the same root (it could be removed).
	if ( viewElement.root != viewPosition.root ) {
		return null;
	}

	// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
	// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
	const modelElementRange = model.createRangeOn( listItem );
	const viewElementRange = viewWriter.createRangeOn( viewElement );
	const viewRange = mapper.toViewRange( modelElementRange ).getTrimmed();

	// Verify if this is a range for the same element (in case the original element was removed).
	if ( !viewRange.containsRange( viewElementRange, true ) ) {
		return null;
	}

	return viewRange.getContainedElement();
}

// TODO
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

// TODO
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

		// There is no list item with smaller indent, this is most probably copied part of nested list
		// so we don't need to try to wrap it further.
		if ( !currentListItem ) {
			break;
		}

		listItemId = currentListItem.getAttribute( 'listItemId' );
		listType = currentListItem.getAttribute( 'listType' );
	}
}

// TODO
function createAttributesConsumer( attributes ) {
	return ( node, consumable, options = {} ) => {
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

		if ( !options.preflight ) {
			events.forEach( event => consumable.consume( node, event ) );
		}

		return true;
	};
}

// TODO
function getListItemFillerOffset() {
	for ( const [ idx, child ] of Array.from( this.getChildren() ).entries() ) {
		if ( child.is( 'uiElement' ) ) {
			continue;
		}

		// There is no content before a nested list so render a block filler just before the nested list.
		if ( isListView( child ) ) {
			return idx;
		} else {
			return null;
		}
	}

	// Render block filler at the end of element (after all ui elements).
	return this.childCount;
}

// TODO
function shouldUseBogusParagraph( element, model ) {
	if ( !element.hasAttribute( 'listItemId' ) ) {
		return false;
	}

	// TODO do not convert if paragraph has any attributes other than those from lists

	const listItemElements = getAllListItemElements( element, model );

	if ( listItemElements.length > 1 ) {
		return false;
	}

	return true;
}
