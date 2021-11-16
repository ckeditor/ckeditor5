/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

/**
 * @module list/documentlist/documentlistediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Enter } from 'ckeditor5/src/enter';
import { Delete } from 'ckeditor5/src/typing';
import { uid } from 'ckeditor5/src/utils';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Enter, Delete ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		editor.model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		editor.model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:li', listItemUpcastConverter );
		} );

		editor.conversion.for( 'downcast' ).add( dispatcher => {
			const converter = listItemWrap();

			dispatcher.on( 'attribute:listIndent', converter );
			dispatcher.on( 'attribute:listType', converter );
		} );

		this.listenTo( editor.model.document, 'change:data', handleDataChange( editor.model, editor.editing ) );
	}
}

function listItemUpcastConverter( evt, data, conversionApi ) {
	if ( !conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
		return;
	}

	const id = uid();
	const indent = getIndent( data.viewItem );
	const type = data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted';

	let modelCursor = data.modelCursor;

	for ( const child of data.viewItem.getChildren() ) {
		if ( child.name == 'ul' || child.name == 'ol' || child.name == 'li' ) {
			modelCursor = escapeAutoParagraph( modelCursor, data.modelCursor, conversionApi.writer );
			modelCursor = conversionApi.convertItem( child, modelCursor ).modelCursor;
			modelCursor = escapeAutoParagraph( modelCursor, data.modelCursor, conversionApi.writer );
		} else {
			modelCursor = conversionApi.convertItem( child, modelCursor ).modelCursor;
		}
	}

	modelCursor = escapeAutoParagraph( modelCursor, data.modelCursor, conversionApi.writer );

	data.modelRange = conversionApi.writer.createRange( data.modelCursor, modelCursor );
	data.modelCursor = modelCursor;

	for ( const { item } of data.modelRange.getWalker( { shallow: true } ) ) {
		if ( !item.hasAttribute( 'listItemId' ) && conversionApi.schema.checkAttribute( item, 'listItemId' ) ) {
			conversionApi.writer.setAttribute( 'listItemId', id, item );
			conversionApi.writer.setAttribute( 'listIndent', indent, item );
			conversionApi.writer.setAttribute( 'listType', type, item );
		}
	}
}

function escapeAutoParagraph( nextPosition, modelCursor, writer ) {
	if ( nextPosition.path.length > modelCursor.path.length ) {
		return writer.createPositionAfter( nextPosition.parent );
	}

	return nextPosition;
}

// Calculates the indent value for a list item. Handles HTML compliant and non-compliant lists.
//
// Also, fixes non HTML compliant lists indents:
//
//		before:                                     fixed list:
//		OL                                          OL
//		|-> LI (parent LIs: 0)                      |-> LI     (indent: 0)
//		    |-> OL                                  |-> OL
//		        |-> OL                                  |
//		        |   |-> OL                              |
//		        |       |-> OL                          |
//		        |           |-> LI (parent LIs: 1)      |-> LI (indent: 1)
//		        |-> LI (parent LIs: 1)                  |-> LI (indent: 1)
//
//		before:                                     fixed list:
//		OL                                          OL
//		|-> OL                                      |
//		    |-> OL                                  |
//		         |-> OL                             |
//		             |-> LI (parent LIs: 0)         |-> LI        (indent: 0)
//
//		before:                                     fixed list:
//		OL                                          OL
//		|-> LI (parent LIs: 0)                      |-> LI         (indent: 0)
//		|-> OL                                          |-> OL
//		    |-> LI (parent LIs: 0)                          |-> LI (indent: 1)
//
// @param {module:engine/view/element~Element} listItem
// @param {Object} conversionStore
// @returns {Number}
function getIndent( listItem ) {
	let indent = 0;

	let parent = listItem.parent;

	while ( parent ) {
		// Each LI in the tree will result in an increased indent for HTML compliant lists.
		if ( parent.is( 'element', 'li' ) ) {
			indent++;
		} else if ( parent.is( 'element', 'ul' ) || parent.is( 'element', 'ol' ) ) {
			// If however the list is nested in other list we should check previous sibling of any of the list elements...
			const previousSibling = parent.previousSibling;

			// ...because the we might need increase its indent:
			//		before:                           fixed list:
			//		OL                                OL
			//		|-> LI (parent LIs: 0)            |-> LI         (indent: 0)
			//		|-> OL                                |-> OL
			//		    |-> LI (parent LIs: 0)                |-> LI (indent: 1)
			if ( previousSibling && previousSibling.is( 'element', 'li' ) ) {
				indent++;
			}
		} else {
			break;
		}

		parent = parent.parent;
	}

	return indent;
}

function listItemWrap() {
	const consumer = createAttributesConsumer( { attributes: [ 'listItemId', 'listType', 'listIndent' ] } );

	return ( evt, data, { writer, mapper, consumable } ) => {
		if ( data.item.is( 'selection' ) ) {
			return;
		}

		const listItem = data.item;

		// Consume attributes on the converted items.
		if ( !consumer( listItem, consumable ) ) {
			return;
		}

		const viewElement = mapper.toViewElement( listItem );
		let viewRange;

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

			viewRange = writer.createRangeOn( viewElement );
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

function createListElement( writer, indent, type, id ) {
	return writer.createAttributeElement( type == 'numbered' ? 'ol' : 'ul', null, {
		priority: indent / 100,
		id
	} );
}

function createListItemElement( writer, indent, id ) {
	return writer.createAttributeElement( 'li', null, {
		priority: ( indent + 0.5 ) / 100,
		id
	} );
}

function createAttributesConsumer( model ) {
	return ( node, consumable, options = {} ) => {
		const events = [];

		// Collect all set attributes that are triggering conversion.
		for ( const attributeName of model.attributes ) {
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

function handleDataChange( model, editing ) {
	return () => {
		const changes = model.document.differ.getChanges();

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

			if ( !changedListItem || !changedListItem.is( 'element' ) || !changedListItem.hasAttribute( 'listItemId' ) ) {
				continue;
			}

			if ( !followingListItem || !followingListItem.is( 'element' ) || !followingListItem.hasAttribute( 'listItemId' ) ) {
				continue;
			}

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

				// TODO this could trigger refreshAttribute( currentNode, 'listIndent' )
				editing.reconvertItem( currentNode );
				console.log( '-- refresh item', currentNode.childCount ? currentNode.getChild( 0 ).data : currentNode );
			}
		}
	};
}

export function getSiblingListItem( modelItem, options ) {
	const sameIndent = !!options.sameIndent;
	const smallerIndent = !!options.smallerIndent;
	const indent = options.listIndent;

	let item = modelItem;

	while ( item && item.hasAttribute( 'listItemId' ) ) {
		const itemIndent = item.getAttribute( 'listIndent' );

		if ( ( sameIndent && indent == itemIndent ) || ( smallerIndent && indent > itemIndent ) ) {
			return item;
		}

		if ( options.direction === 'forward' ) {
			item = item.nextSibling;
		} else {
			item = item.previousSibling;
		}
	}

	return null;
}
