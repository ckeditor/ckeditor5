/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	createListElement,
	createListItemElement,
	getAllListItemElements,
	getIndent,
	getSiblingListItem
} from './utils';
import { uid } from 'ckeditor5/src/utils';

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

		// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
		// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
		viewRange = viewElement ?
			mapper.toViewRange( model.createRangeOn( listItem ) ).getTrimmed() :
			null;

		// But verify if this is a range for the same element (in case the original element was removed).
		viewElement = viewRange && viewRange.containsRange( writer.createRangeOn( viewElement ) ) ?
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

			if ( currentListItem ) {
				listItemId = currentListItem.getAttribute( 'listItemId' );
				listType = currentListItem.getAttribute( 'listType' );
			}
		}
	};
}

/**
 * TODO
 */
export function listItemUpcastConverter() {
	return ( evt, data, conversionApi ) => {
		const { writer, schema, consumable } = conversionApi;

		if ( !consumable.consume( data.viewItem, { name: true } ) ) {
			return;
		}

		const id = uid();
		const indent = getIndent( data.viewItem );
		const type = data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted';

		let modelCursor = data.modelCursor;

		for ( const child of data.viewItem.getChildren() ) {
			if ( child.name == 'ul' || child.name == 'ol' || child.name == 'li' ) {
				modelCursor = escapeAutoParagraph( modelCursor, data.modelCursor, writer );
				modelCursor = conversionApi.convertItem( child, modelCursor ).modelCursor;
				modelCursor = escapeAutoParagraph( modelCursor, data.modelCursor, writer );
			}
			else {
				const conversionResult = conversionApi.convertItem( child, modelCursor );
				const modelRange = conversionResult.modelRange;
				const modelNode = modelRange && !modelRange.isCollapsed ? modelRange.start.nodeAfter : null;

				// If the LI is empty or contains an inline nodes then we need to wrap it with a paragraph.
				// This is needed only in the clipboard pipeline because there content won't get auto-paragraphed.
				if ( !modelNode || !modelNode.parent.is( 'element', 'paragraph' ) && schema.isInline( modelNode ) ) {
					modelCursor = enterAutoParagraph( modelRange, writer );
				} else {
					modelCursor = conversionResult.modelCursor;
				}
			}
		}

		modelCursor = escapeAutoParagraph( modelCursor, data.modelCursor, writer );

		data.modelRange = writer.createRange( data.modelCursor, modelCursor );
		data.modelCursor = modelCursor;

		for ( const { item } of data.modelRange.getWalker( { shallow: true } ) ) {
			if ( !item.hasAttribute( 'listItemId' ) && schema.checkAttribute( item, 'listItemId' ) ) {
				writer.setAttribute( 'listItemId', id, item );
				writer.setAttribute( 'listIndent', indent, item );
				writer.setAttribute( 'listType', type, item );
			}
		}
	};
}

// TODO
function enterAutoParagraph( modelRange, writer ) {
	const paragraph = writer.createElement( 'paragraph' );

	writer.insert( paragraph, modelRange.end );
	writer.move( modelRange, paragraph, 0 );

	return writer.createPositionAt( paragraph, 'end' );
}

// TODO
function escapeAutoParagraph( nextPosition, modelCursor, writer ) {
	if ( nextPosition.path.length > modelCursor.path.length ) {
		return writer.createPositionAfter( nextPosition.parent );
	}

	return nextPosition;
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
		if ( child.is( 'element', 'ul' ) || child.is( 'element', 'ol' ) ) {
			return idx;
		} else {
			return null;
		}
	}

	// Render block filler at the end of element (after all ui elements).
	return this.childCount;
}
