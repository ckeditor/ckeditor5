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
	isListItemView
} from './utils';
import { uid } from 'ckeditor5/src/utils';
import { UpcastWriter } from 'ckeditor5/src/engine';

/**
 * @module list/documentlist/converters
 */

/**
 * TODO
 */
export function listItemDowncastConverter( attributes, model, { dataPipeline } = {} ) {
	const consumer = createAttributesConsumer( attributes );

	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		// Do not convert paragraph if it should get converted by the default converters.
		if ( evt.name == 'insert:paragraph' ) {
			if ( !data.item.hasAttribute( 'listItemId' ) ) {
				return;
			}

			// TODO do not convert if paragraph has any attributes other than those from lists

			const listItemElements = getAllListItemElements( data.item, model );

			if ( listItemElements.length > 1 ) {
				return;
			}
		}

		const listItem = data.item;

		// Consume attributes on the converted items.
		if ( !consumer( listItem, consumable ) ) {
			return;
		}

		let viewElement = mapper.toViewElement( listItem );
		let viewRange;

		const viewPosition = mapper.toViewPosition( model.createPositionBefore( listItem ) );

		// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
		// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
		// Also, verify if the element is still in the same root.
		viewRange = viewElement && viewElement.root == viewPosition.root ?
			mapper.toViewRange( model.createRangeOn( listItem ) ).getTrimmed() :
			null;

		// But verify if this is a range for the same element (in case the original element was removed).
		viewElement = viewRange && viewRange.containsRange( writer.createRangeOn( viewElement ), true ) ?
			viewRange.getContainedElement() :
			null;

		if ( viewElement ) {
			// First, unwrap the item from current list wrappers.
			let attributeElement = viewElement.parent;

			while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
				const parentElement = attributeElement.parent;

				// Make a clone of an attribute element that only includes properties of generic list (i.e., without list styles).
				const element = writer.createAttributeElement( attributeElement.name, null, {
					priority: attributeElement.priority,
					id: attributeElement.id
				} );

				writer.unwrap( writer.createRangeOn( viewElement ), element );

				attributeElement = parentElement;
			}

			// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
			// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
			viewRange = mapper.toViewRange( model.createRangeOn( listItem ) ).getTrimmed();
		}
		else if ( evt.name == 'insert:paragraph' ) {
			if ( !consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const paragraphElement = writer.createContainerElement( 'span', { class: 'ck-list-bogus-paragraph' } );
			const viewPosition = mapper.toViewPosition( data.range.start );

			mapper.bindElements( data.item, paragraphElement );
			writer.insert( viewPosition, paragraphElement );

			conversionApi.convertChildren( data.item );

			if ( dataPipeline ) {
				// Unwrap paragraph content from bogus paragraph.
				viewRange = writer.move( writer.createRangeIn( paragraphElement ), viewPosition );

				writer.remove( paragraphElement );
				mapper.unbindViewElement( paragraphElement );
			} else {
				viewRange = writer.createRangeOn( paragraphElement );
			}
		}

		// Then wrap them with the new list wrappers.
		const listItemIndent = listItem.getAttribute( 'listIndent' );

		if ( listItemIndent === null ) {
			return;
		}

		let listItemId = listItem.getAttribute( 'listItemId' );
		let listType = listItem.getAttribute( 'listType' );
		let currentListItem = listItem;

		for ( let indent = listItemIndent; indent >= 0; indent-- ) {
			const listItemViewElement = createListItemElement( writer, indent, listItemId );
			const listViewElement = createListElement( writer, indent, listType );

			if ( dataPipeline ) {
				listItemViewElement.getFillerOffset = getListItemFillerOffset;
			}

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
	};
}

/**
 * TODO
 */
export function listItemUpcastConverter() {
	return ( evt, data, conversionApi ) => {
		const { writer, schema } = conversionApi;

		if ( !data.modelRange ) {
			return;
		}

		const items = Array.from( data.modelRange.getItems( { shallow: true } ) );

		if ( !items.length ) {
			return;
		}

		const attributes = {
			listItemId: uid(),
			listIndent: getIndent( data.viewItem ),
			listType: data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted'
		};

		for ( const item of items ) {
			if ( !item.hasAttribute( 'listItemId' ) && schema.checkAttribute( item, 'listItemId' ) ) {
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
