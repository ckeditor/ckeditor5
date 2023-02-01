/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/converters
 */

import {
	UpcastWriter,
	type DowncastAttributeEvent,
	type DowncastWriter,
	type EditingController,
	type Element,
	type ElementCreatorFunction,
	type Mapper,
	type Model,
	type ModelConsumable,
	type Node,
	type UpcastElementEvent,
	type ViewDocumentFragment,
	type ViewElement,
	type ViewRange
} from 'ckeditor5/src/engine';

import type { GetCallback } from 'ckeditor5/src/utils';

import {
	getAllListItemBlocks,
	getListItemBlocks,
	isListItemBlock,
	ListItemUid,
	type ListElement
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

import type {
	default as DocumentListEditing,
	DocumentListEditingCheckAttributesEvent,
	DowncastStrategy,
	ListItemAttributesMap
} from './documentlistediting';

/**
 * Returns the upcast converter for list items. It's supposed to work after the block converters (content inside list items) are converted.
 *
 * @internal
 */
export function listItemUpcastConverter(): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const { writer, schema } = conversionApi;

		if ( !data.modelRange ) {
			return;
		}

		const items = Array.from( data.modelRange.getItems( { shallow: true } ) )
			.filter( ( item ): item is Element => schema.checkAttribute( item, 'listItemId' ) );

		if ( !items.length ) {
			return;
		}

		const attributes = {
			listItemId: ListItemUid.next(),
			listIndent: getIndent( data.viewItem ),
			listType: data.viewItem.parent && data.viewItem.parent.is( 'element', 'ol' ) ? 'numbered' : 'bulleted'
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
 * This is mostly to clean whitespaces from between the `<li>` view elements inside the view list element. However,
 * incorrect data can also be cleared if the view was incorrect.
 *
 * @internal
 */
export function listUpcastCleanList(): GetCallback<UpcastElementEvent> {
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
 * @internal
 * @param model The editor model.
 * @param editing The editing controller.
 * @param attributeNames The list of all model list attributes (including registered strategies).
 * @param documentListEditing The document list editing plugin.
 */
export function reconvertItemsOnDataChange(
	model: Model,
	editing: EditingController,
	attributeNames: Array<string>,
	documentListEditing: DocumentListEditing
): () => void {
	return () => {
		const changes = model.document.differ.getChanges();
		const itemsToRefresh = [];
		const itemToListHead = new Map<ListElement, ListElement>();
		const changedItems = new Set<Node>();

		for ( const entry of changes ) {
			if ( entry.type == 'insert' && entry.name != '$text' ) {
				findAndAddListHeadToMap( entry.position, itemToListHead );

				// Insert of a non-list item.
				if ( !entry.attributes.has( 'listItemId' ) ) {
					findAndAddListHeadToMap( entry.position.getShiftedBy( entry.length ), itemToListHead );
				} else {
					changedItems.add( entry.position.nodeAfter! );
				}
			}
			// Removed list item.
			else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
				findAndAddListHeadToMap( entry.position, itemToListHead );
			}
			// Changed list attribute.
			else if ( entry.type == 'attribute' ) {
				const item = entry.range.start.nodeAfter!;

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

	function collectListItemsToRefresh( listHead: ListElement, changedItems: Set<Node> ) {
		const itemsToRefresh = [];
		const visited = new Set();
		const stack: Array<ListItemAttributesMap> = [];

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

	function doesItemParagraphRequiresRefresh( item: Node, blocks?: Array<Node> ) {
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

	function doesItemWrappingRequiresRefresh(
		item: Element,
		stack: Array<ListItemAttributesMap>,
		changedItems: Set<Node>
	) {
		// Items directly affected by some "change" don't need a refresh, they will be converted by their own changes.
		if ( changedItems.has( item ) ) {
			return false;
		}

		const viewElement = editing.mapper.toViewElement( item )!;
		let indent = stack.length - 1;

		// Traverse down the stack to the root to verify if all ULs, OLs, and LIs are as expected.
		for (
			let element = viewElement.parent!;
			!element.is( 'editableElement' );
			element = element.parent!
		) {
			const isListItemElement = isListItemView( element );
			const isListElement = isListView( element );

			if ( !isListElement && !isListItemElement ) {
				continue;
			}

			const eventName = `checkAttributes:${ isListItemElement ? 'item' : 'list' }` as const;
			const needsRefresh = documentListEditing.fire<DocumentListEditingCheckAttributesEvent>( eventName, {
				viewElement: element as ViewElement,
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
 * @internal
 * @param attributeNames A list of attribute names that should be converted if they are set.
 * @param strategies The strategies.
 * @param model The model.
 */
export function listItemDowncastConverter(
	attributeNames: Array<string>,
	strategies: Array<DowncastStrategy>,
	model: Model
): GetCallback<DowncastAttributeEvent<ListElement>> {
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
		const viewElement = findMappedViewElement( listItem, mapper, model )!;

		// Unwrap element from current list wrappers.
		unwrapListItemBlock( viewElement, writer );

		// Then wrap them with the new list wrappers.
		wrapListItemBlock( listItem, writer.createRangeOn( viewElement ), strategies, writer );
	};
}

/**
 * Returns the bogus paragraph view element creator. A bogus paragraph is used if a list item contains only a single block or nested list.
 *
 * @internal
 * @param attributeNames The list of all model list attributes (including registered strategies).
 */
export function bogusParagraphCreator(
	attributeNames: Array<string>,
	{ dataPipeline }: { dataPipeline?: boolean } = {}
): ElementCreatorFunction {
	return ( modelElement, { writer } ) => {
		// Convert only if a bogus paragraph should be used.
		if ( !shouldUseBogusParagraph( modelElement, attributeNames ) ) {
			return null;
		}

		if ( !dataPipeline ) {
			return writer.createContainerElement( 'span', { class: 'ck-list-bogus-paragraph' } );
		}

		// Using `<p>` in case there are some markers on it and transparentRendering will render it anyway.
		const viewElement = writer.createContainerElement( 'p' );

		writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );

		return viewElement;
	};
}

/**
 * Helper for mapping mode to view elements. It's using positions mapping instead of mapper.toViewElement( element )
 * to find outermost view element. This is for cases when mapping is using inner view element like in the code blocks (pre > code).
 *
 * @internal
 * @param element The model element.
 * @param mapper The mapper instance.
 * @param model The model.
 */
export function findMappedViewElement( element: Element, mapper: Mapper, model: Model ): ViewElement | null {
	const modelRange = model.createRangeOn( element );
	const viewRange = mapper.toViewRange( modelRange ).getTrimmed();

	return viewRange.getContainedElement();
}

// Unwraps all ol, ul, and li attribute elements that are wrapping the provided view element.
function unwrapListItemBlock( viewElement: ViewElement, viewWriter: DowncastWriter ) {
	let attributeElement: ViewElement | ViewDocumentFragment = viewElement.parent!;

	while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
		const parentElement = attributeElement.parent;

		viewWriter.unwrap( viewWriter.createRangeOn( viewElement ), attributeElement );

		attributeElement = parentElement!;
	}
}

// Wraps the given list item with appropriate attribute elements for ul, ol, and li.
function wrapListItemBlock(
	listItem: ListElement,
	viewRange: ViewRange,
	strategies: Array<DowncastStrategy>,
	writer: DowncastWriter
) {
	if ( !listItem.hasAttribute( 'listIndent' ) ) {
		return;
	}

	const listItemIndent = listItem.getAttribute( 'listIndent' );
	let currentListItem: ListElement | null = listItem;

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
function createAttributesConsumer( attributeNames: Array<string> ) {
	return ( node: Node, consumable: ModelConsumable ) => {
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
function shouldUseBogusParagraph(
	item: Node,
	attributeNames: Array<string>,
	blocks: Array<Node> = getAllListItemBlocks( item )
) {
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
