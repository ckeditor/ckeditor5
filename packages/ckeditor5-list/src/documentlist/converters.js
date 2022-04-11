/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/converters
 */

import {
	getAllListItemBlocks,
	getListItemBlocks,
	isListItemBlock,
	ListItemUid
} from './utils/model';
import {
	createListElement,
	createListItemElement,
	getIndent,
	isListView,
	isListItemView
} from './utils/view';
import ListWalker, { iterateSiblingListBlocks } from './utils/listwalker';
import { findAndAddListHeadToMap } from './utils/postfixers';

import { UpcastWriter } from 'ckeditor5/src/engine';

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
			listItemId: ListItemUid.next(),
			listIndent: getIndent( data.viewItem ),
			listType: data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted'
		};

		for ( const item of items ) {
			// Set list attributes only on same level items, those nested deeper are already handled by the recursive conversion.
			if ( !isListItemBlock( item ) ) {
				writer.setAttributes( attributes, item );
			}
		}

		if ( items.length > 1 ) {
			// Make sure that list item that contain only nested list will preserve paragraph for itself:
			//	<ul>
			//		<li>
			//			<p></p>  <-- this one must be kept
			//			<ul>
			//				<li></li>
			//			</ul>
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
 * @param {Array.<String>} attributeNames The list of all model list attributes (including registered strategies).
 * @param {module:list/documentlist/documentlistediting~DocumentListEditing} documentListEditing The document list editing plugin.
 * @return {Function}
 */
export function reconvertItemsOnDataChange( model, editing, attributeNames, documentListEditing ) {
	return () => {
		const changes = model.document.differ.getChanges();
		const itemsToRefresh = [];
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

				if ( attributeNames.includes( entry.attributeKey ) ) {
					findAndAddListHeadToMap( entry.range.start, itemToListHead );

					if ( entry.attributeNewValue === null ) {
						findAndAddListHeadToMap( entry.range.start.getShiftedBy( 1 ), itemToListHead );

						// Check if paragraph should be converted from bogus to plain paragraph.
						if ( doesItemParagraphRequiresRefresh( item ) ) {
							itemsToRefresh.push( item );
						}
					} else {
						changedItems.add( item );
					}
				} else if ( isListItemBlock( item ) ) {
					// Some other attribute was changed on the list item,
					// check if paragraph does not need to be converted to bogus or back.
					if ( doesItemParagraphRequiresRefresh( item ) ) {
						itemsToRefresh.push( item );
					}
				}
			}
		}

		for ( const listHead of itemToListHead.values() ) {
			itemsToRefresh.push( ...collectListItemsToRefresh( listHead, changedItems ) );
		}

		for ( const item of new Set( itemsToRefresh ) ) {
			editing.reconvertItem( item );
		}
	};

	function collectListItemsToRefresh( listHead, changedItems ) {
		const itemsToRefresh = [];
		const visited = new Set();
		const stack = [];

		for ( const { node, previous } of iterateSiblingListBlocks( listHead, 'forward' ) ) {
			if ( visited.has( node ) ) {
				continue;
			}

			const itemIndent = node.getAttribute( 'listIndent' );

			// Current node is at the lower indent so trim the stack.
			if ( previous && itemIndent < previous.getAttribute( 'listIndent' ) ) {
				stack.length = itemIndent + 1;
			}

			// Update the stack for the current indent level.
			stack[ itemIndent ] = Object.fromEntries(
				Array.from( node.getAttributes() )
					.filter( ( [ key ] ) => attributeNames.includes( key ) )
			);

			// Find all blocks of the current node.
			const blocks = getListItemBlocks( node, { direction: 'forward' } );

			for ( const block of blocks ) {
				visited.add( block );

				// Check if bogus vs plain paragraph needs refresh.
				if ( doesItemParagraphRequiresRefresh( block, blocks ) ) {
					itemsToRefresh.push( block );
				}
				// Check if wrapping with UL, OL, LIs needs refresh.
				else if ( doesItemWrappingRequiresRefresh( block, stack, changedItems ) ) {
					itemsToRefresh.push( block );
				}
			}
		}

		return itemsToRefresh;
	}

	function doesItemParagraphRequiresRefresh( item, blocks ) {
		if ( !item.is( 'element', 'paragraph' ) ) {
			return false;
		}

		const viewElement = editing.mapper.toViewElement( item );

		if ( !viewElement ) {
			return false;
		}

		const useBogus = shouldUseBogusParagraph( item, attributeNames, blocks );

		if ( useBogus && viewElement.is( 'element', 'p' ) ) {
			return true;
		} else if ( !useBogus && viewElement.is( 'element', 'span' ) ) {
			return true;
		}

		return false;
	}

	function doesItemWrappingRequiresRefresh( item, stack, changedItems ) {
		// Items directly affected by some "change" don't need a refresh, they will be converted by their own changes.
		if ( changedItems.has( item ) ) {
			return false;
		}

		const viewElement = editing.mapper.toViewElement( item );
		let indent = stack.length - 1;

		// Traverse down the stack to the root to verify if all ULs, OLs, and LIs are as expected.
		for (
			let element = viewElement.parent;
			!element.is( 'editableElement' );
			element = element.parent
		) {
			const isListItemElement = isListItemView( element );
			const isListElement = isListView( element );

			if ( !isListElement && !isListItemElement ) {
				continue;
			}

			/**
			 * Event fired on changes detected on the model list element to verify if the view representation of a list element
			 * is representing those attributes.
			 *
			 * It allows triggering a re-wrapping of a list item.
			 *
			 * **Note**: For convenience this event is namespaced and could be captured as `checkAttributes:list` or `checkAttributes:item`.
			 *
			 * @protected
			 * @event module:list/documentlist/documentlistediting~DocumentListEditing#event:checkAttributes
			 * @param {module:engine/view/element~Element} viewElement
			 * @param {Object} modelAttributes
			 */
			const eventName = `checkAttributes:${ isListItemElement ? 'item' : 'list' }`;
			const needsRefresh = documentListEditing.fire( eventName, {
				viewElement: element,
				modelAttributes: stack[ indent ]
			} );

			if ( needsRefresh ) {
				break;
			}

			if ( isListElement ) {
				indent--;

				// Don't need to iterate further if we already know that the item is wrapped appropriately.
				if ( indent < 0 ) {
					return false;
				}
			}
		}

		return true;
	}
}

/**
 * Returns the list item downcast converter.
 *
 * @protected
 * @param {Array.<String>} attributeNames A list of attribute names that should be converted if are set.
 * @param {Array.<module:list/documentlistproperties/documentlistpropertiesediting~AttributeStrategy>} strategies The strategies.
 * @param {module:engine/model/model~Model} model The model.
 * @returns {Function}
 */
export function listItemDowncastConverter( attributeNames, strategies, model ) {
	const consumer = createAttributesConsumer( attributeNames );

	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		const listItem = data.item;

		if ( !attributeNames.includes( data.attributeKey ) ) {
			return;
		}

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
		wrapListItemBlock( listItem, writer.createRangeOn( viewElement ), strategies, writer );
	};
}

/**
 * Returns the bogus paragraph view element creator. A bogus paragraph is used if a list item contains only a single block or nested list.
 *
 * @protected
 * @param {Array.<String>} attributeNames The list of all model list attributes (including registered strategies).
 * @param {Object} [options]
 * @param {Boolean} [options.dataPipeline=false]
 * @returns {Function}
 */
export function bogusParagraphCreator( attributeNames, { dataPipeline } = {} ) {
	return ( modelElement, { writer } ) => {
		// Convert only if a bogus paragraph should be used.
		if ( !shouldUseBogusParagraph( modelElement, attributeNames ) ) {
			return;
		}

		const viewElement = writer.createContainerElement( 'span', { class: 'ck-list-bogus-paragraph' } );

		if ( dataPipeline ) {
			writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );
		}

		return viewElement;
	};
}

/**
 * Helper for mapping mode to view elements. It's using positions mapping instead of mapper.toViewElement( element )
 * to find outermost view element. This is for cases when mapping is using inner view element like in the code blocks (pre > code).
 *
 * @protected
 * @param {module:engine/model/element~Element} element The model element.
 * @param {module:engine/conversion/mapper~Mapper} mapper The mapper instance.
 * @param {module:engine/model/model~Model} model The model.
 * @returns {module:engine/view/element~Element|null}
 */
export function findMappedViewElement( element, mapper, model ) {
	const modelRange = model.createRangeOn( element );
	const viewRange = mapper.toViewRange( modelRange ).getTrimmed();

	return viewRange.getContainedElement();
}

// Unwraps all ol, ul, and li attribute elements that are wrapping the provided view element.
function unwrapListItemBlock( viewElement, viewWriter ) {
	let attributeElement = viewElement.parent;

	while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
		const parentElement = attributeElement.parent;

		viewWriter.unwrap( viewWriter.createRangeOn( viewElement ), attributeElement );

		attributeElement = parentElement;
	}
}

// Wraps the given list item with appropriate attribute elements for ul, ol, and li.
function wrapListItemBlock( listItem, viewRange, strategies, writer ) {
	if ( !listItem.hasAttribute( 'listIndent' ) ) {
		return;
	}

	const listItemIndent = listItem.getAttribute( 'listIndent' );
	let currentListItem = listItem;

	for ( let indent = listItemIndent; indent >= 0; indent-- ) {
		const listItemViewElement = createListItemElement( writer, indent, currentListItem.getAttribute( 'listItemId' ) );
		const listViewElement = createListElement( writer, indent, currentListItem.getAttribute( 'listType' ) );

		for ( const strategy of strategies ) {
			if ( currentListItem.hasAttribute( strategy.attributeName ) ) {
				strategy.setAttributeOnDowncast(
					writer,
					currentListItem.getAttribute( strategy.attributeName ),
					strategy.scope == 'list' ? listViewElement : listItemViewElement
				);
			}
		}

		viewRange = writer.wrap( viewRange, listItemViewElement );
		viewRange = writer.wrap( viewRange, listViewElement );

		if ( indent == 0 ) {
			break;
		}

		currentListItem = ListWalker.first( currentListItem, { lowerIndent: true } );

		// There is no list item with lower indent, this means this is a document fragment containing
		// only a part of nested list (like copy to clipboard) so we don't need to try to wrap it further.
		if ( !currentListItem ) {
			break;
		}
	}
}

// Returns the function that is responsible for consuming attributes that are set on the model node.
function createAttributesConsumer( attributeNames ) {
	return ( node, consumable ) => {
		const events = [];

		// Collect all set attributes that are triggering conversion.
		for ( const attributeName of attributeNames ) {
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

// Whether the given item should be rendered as a bogus paragraph.
function shouldUseBogusParagraph( item, attributeNames, blocks = getAllListItemBlocks( item ) ) {
	if ( !isListItemBlock( item ) ) {
		return false;
	}

	for ( const attributeKey of item.getAttributeKeys() ) {
		// Ignore selection attributes stored on block elements.
		if ( attributeKey.startsWith( 'selection:' ) ) {
			continue;
		}

		// Don't use bogus paragraph if there are attributes from other features.
		if ( !attributeNames.includes( attributeKey ) ) {
			return false;
		}
	}

	return blocks.length < 2;
}
