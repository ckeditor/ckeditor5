/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/converters
 */

import {
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
	type ViewRange,
	type DowncastRemoveEvent,
	type EditingView,
	type MapperModelToViewPositionEvent,
	type ViewTreeWalker,
	type Schema
} from 'ckeditor5/src/engine.js';

import type { GetCallback } from 'ckeditor5/src/utils.js';

import {
	getAllListItemBlocks,
	getListItemBlocks,
	isListItemBlock,
	isFirstBlockOfListItem,
	ListItemUid,
	type ListElement
} from './utils/model.js';

import {
	createListElement,
	createListItemElement,
	getIndent,
	isListView,
	isListItemView
} from './utils/view.js';

import ListWalker, { SiblingListBlocksIterator } from './utils/listwalker.js';
import { findAndAddListHeadToMap } from './utils/postfixers.js';

import type {
	default as ListEditing,
	ListEditingCheckAttributesEvent,
	ListEditingCheckElementEvent,
	ListItemAttributesMap,
	DowncastStrategy
} from './listediting.js';

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

		const listItemId = data.viewItem.getAttribute( 'data-list-item-id' ) || ListItemUid.next();

		conversionApi.consumable.consume( data.viewItem, { attributes: 'data-list-item-id' } );

		const listIndent = getIndent( data.viewItem );
		let listType = data.viewItem.parent && data.viewItem.parent.is( 'element', 'ol' ) ? 'numbered' : 'bulleted';

		// Preserve list type if was already set (for example by to-do list feature).
		const firstItemListType = items[ 0 ].getAttribute( 'listType' ) as string;

		if ( firstItemListType ) {
			listType = firstItemListType;
		}

		const attributes = {
			listItemId,
			listIndent,
			listType
		};

		for ( const item of items ) {
			// Set list attributes only on same level items, those nested deeper are already handled by the recursive conversion.
			if ( !item.hasAttribute( 'listItemId' ) ) {
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
 * Returns a model document change:data event listener that triggers conversion of related items if needed.
 *
 * @internal
 * @param model The editor model.
 * @param editing The editing controller.
 * @param attributeNames The list of all model list attributes (including registered strategies).
 * @param listEditing The document list editing plugin.
 */
export function reconvertItemsOnDataChange(
	model: Model,
	editing: EditingController,
	attributeNames: Array<string>,
	listEditing: ListEditing
): () => void {
	return () => {
		const changes = model.document.differ.getChanges();
		const itemsToRefresh = [];
		const itemToListHead = new Set<ListElement>();
		const changedItems = new Set<Node>();
		const visited = new Set<Element>();

		for ( const entry of changes ) {
			if ( entry.type == 'insert' && entry.name != '$text' ) {
				findAndAddListHeadToMap( entry.position, itemToListHead, visited );

				// Insert of a non-list item.
				if ( !entry.attributes.has( 'listItemId' ) ) {
					findAndAddListHeadToMap( entry.position.getShiftedBy( entry.length ), itemToListHead, visited );
				} else {
					changedItems.add( entry.position.nodeAfter! );
				}
			}
			// Removed list item.
			else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
				findAndAddListHeadToMap( entry.position, itemToListHead, visited );
			}
			// Changed list attribute.
			else if ( entry.type == 'attribute' ) {
				const item = entry.range.start.nodeAfter!;

				if ( attributeNames.includes( entry.attributeKey ) ) {
					findAndAddListHeadToMap( entry.range.start, itemToListHead, visited );

					if ( entry.attributeNewValue === null ) {
						findAndAddListHeadToMap( entry.range.start.getShiftedBy( 1 ), itemToListHead, visited );

						// Check if paragraph should be converted from bogus to plain paragraph.
						if ( doesItemBlockRequiresRefresh( item as Element ) ) {
							itemsToRefresh.push( item );
						}
					} else {
						changedItems.add( item );
					}
				} else if ( isListItemBlock( item ) ) {
					// Some other attribute was changed on the list item,
					// check if paragraph does not need to be converted to bogus or back.
					if ( doesItemBlockRequiresRefresh( item ) ) {
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

		for ( const { node, previous } of new SiblingListBlocksIterator( listHead ) ) {
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
				if ( doesItemBlockRequiresRefresh( block, blocks ) ) {
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

	function doesItemBlockRequiresRefresh( item: Element, blocks?: Array<Node> ) {
		const viewElement = editing.mapper.toViewElement( item );

		if ( !viewElement ) {
			return false;
		}

		const needsRefresh = listEditing.fire<ListEditingCheckElementEvent>( 'checkElement', {
			modelElement: item,
			viewElement
		} );

		if ( needsRefresh ) {
			return true;
		}

		if ( !item.is( 'element', 'paragraph' ) && !item.is( 'element', 'listItem' ) ) {
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
			const needsRefresh = listEditing.fire<ListEditingCheckAttributesEvent>( eventName, {
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
	model: Model,
	{ dataPipeline }: { dataPipeline?: boolean } = {}
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

		// Remove custom item marker.
		removeCustomMarkerElements( viewElement, writer, mapper );

		// Unwrap element from current list wrappers.
		unwrapListItemBlock( viewElement, writer );

		// Insert custom item marker.
		const viewRange = insertCustomMarkerElements( listItem, viewElement, strategies, writer, { dataPipeline } );

		// Then wrap them with the new list wrappers (UL, OL, LI).
		wrapListItemBlock( listItem, viewRange, strategies, writer, conversionApi.options );
	};
}

/**
 * The 'remove' downcast converter for custom markers.
 */
export function listItemDowncastRemoveConverter( schema: Schema ): GetCallback<DowncastRemoveEvent> {
	return ( evt, data, conversionApi ) => {
		const { writer, mapper } = conversionApi;
		const elementName = evt.name.split( ':' )[ 1 ];

		// Do not remove marker if the deleted element is some inline object inside paragraph.
		// See https://github.com/cksource/ckeditor5-internal/issues/3680.
		if ( !schema.checkAttribute( elementName, 'listItemId' ) ) {
			return;
		}

		// Find the view range start position by mapping the model position at which the remove happened.
		const viewStart = mapper.toViewPosition( data.position );

		const modelEnd = data.position.getShiftedBy( data.length );
		const viewEnd = mapper.toViewPosition( modelEnd, { isPhantom: true } );

		// Trim the range to remove in case some UI elements are on the view range boundaries.
		const viewRange = writer.createRange( viewStart, viewEnd ).getTrimmed();

		// Use positions mapping instead of mapper.toViewElement( listItem ) to find outermost view element.
		// This is for cases when mapping is using inner view element like in the code blocks (pre > code).
		const viewElement = viewRange.end.nodeBefore as ViewElement | null;

		/* istanbul ignore next -- @preserve */
		if ( !viewElement ) {
			return;
		}

		// Remove custom item marker.
		removeCustomMarkerElements( viewElement, writer, mapper );
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

	return viewRange.end.nodeBefore as ViewElement | null;
}

/**
 * The model to view custom position mapping for cases when marker is injected at the beginning of a block.
 */
export function createModelToViewPositionMapper(
	strategies: Array<DowncastStrategy>,
	view: EditingView
): GetCallback<MapperModelToViewPositionEvent> {
	return ( evt, data ) => {
		if ( data.modelPosition.offset > 0 ) {
			return;
		}

		const positionParent = data.modelPosition.parent;

		if ( !isListItemBlock( positionParent ) ) {
			return;
		}

		if ( !strategies.some( strategy => (
			strategy.scope == 'itemMarker' &&
			strategy.canInjectMarkerIntoElement &&
			strategy.canInjectMarkerIntoElement( positionParent )
		) ) ) {
			return;
		}

		const viewElement = data.mapper.toViewElement( positionParent )!;
		const viewRange = view.createRangeIn( viewElement );

		const viewWalker = viewRange.getWalker();
		let positionAfterLastMarker = viewRange.start;

		for ( const { item } of viewWalker ) {
			// Walk only over the non-mapped elements (UIElements, AttributeElements, $text, or any other element without mapping).
			if ( item.is( 'element' ) && data.mapper.toModelElement( item ) || item.is( '$textProxy' ) ) {
				break;
			}

			if ( item.is( 'element' ) && item.getCustomProperty( 'listItemMarker' ) ) {
				positionAfterLastMarker = view.createPositionAfter( item );

				// Jump over the content of the marker (this is not needed for UIElement but required for other element types).
				viewWalker.skip( ( { previousPosition } ) => !previousPosition.isEqual( positionAfterLastMarker ) );
			}
		}

		data.viewPosition = positionAfterLastMarker;
	};
}

/**
 * Removes a custom marker elements and item wrappers related to that marker.
 */
function removeCustomMarkerElements( viewElement: ViewElement, viewWriter: DowncastWriter, mapper: Mapper ): void {
	// Remove item wrapper.
	while ( viewElement.parent!.is( 'attributeElement' ) && viewElement.parent!.getCustomProperty( 'listItemWrapper' ) ) {
		viewWriter.unwrap( viewWriter.createRangeOn( viewElement ), viewElement.parent );
	}

	// Remove custom item markers.
	const markersToRemove: Array<ViewElement> = [];

	// Markers before a block.
	collectMarkersToRemove( viewWriter.createPositionBefore( viewElement ).getWalker( { direction: 'backward' } ) );

	// Markers inside a block.
	collectMarkersToRemove( viewWriter.createRangeIn( viewElement ).getWalker() );

	for ( const marker of markersToRemove ) {
		viewWriter.remove( marker );
	}

	function collectMarkersToRemove( viewWalker: ViewTreeWalker ) {
		for ( const { item } of viewWalker ) {
			// Walk only over the non-mapped elements (UIElements, AttributeElements, $text, or any other element without mapping).
			if ( item.is( 'element' ) && mapper.toModelElement( item ) ) {
				break;
			}

			if ( item.is( 'element' ) && item.getCustomProperty( 'listItemMarker' ) ) {
				markersToRemove.push( item );
			}
		}
	}
}

/**
 * Inserts a custom marker elements and wraps first block of a list item if marker requires it.
 */
function insertCustomMarkerElements(
	listItem: Element,
	viewElement: ViewElement,
	strategies: Array<DowncastStrategy>,
	writer: DowncastWriter,
	{ dataPipeline }: { dataPipeline?: boolean }
): ViewRange {
	let viewRange = writer.createRangeOn( viewElement );

	// Marker can be inserted only before the first block of a list item.
	if ( !isFirstBlockOfListItem( listItem ) ) {
		return viewRange;
	}

	for ( const strategy of strategies ) {
		if ( strategy.scope != 'itemMarker' ) {
			continue;
		}

		// Create the custom marker element and inject it before the first block of the list item.
		const markerElement = strategy.createElement( writer, listItem, { dataPipeline } );

		if ( !markerElement ) {
			continue;
		}

		writer.setCustomProperty( 'listItemMarker', true, markerElement );

		if ( strategy.canInjectMarkerIntoElement && strategy.canInjectMarkerIntoElement( listItem ) ) {
			writer.insert( writer.createPositionAt( viewElement, 0 ), markerElement );
		} else {
			writer.insert( viewRange.start, markerElement );

			viewRange = writer.createRange(
				writer.createPositionBefore( markerElement ),
				writer.createPositionAfter( viewElement )
			);
		}

		// Wrap the marker and optionally the first block with an attribute element (label for to-do lists).
		if ( !strategy.createWrapperElement || !strategy.canWrapElement ) {
			continue;
		}

		const wrapper = strategy.createWrapperElement( writer, listItem, { dataPipeline } );

		writer.setCustomProperty( 'listItemWrapper', true, wrapper );

		// The whole block can be wrapped...
		if ( strategy.canWrapElement( listItem ) ) {
			viewRange = writer.wrap( viewRange, wrapper );
		} else {
			// ... or only the marker element (if the block is downcasted to heading or block widget).
			viewRange = writer.wrap( writer.createRangeOn( markerElement ), wrapper );

			viewRange = writer.createRange(
				viewRange.start,
				writer.createPositionAfter( viewElement )
			);
		}
	}

	return viewRange;
}

/**
 * Unwraps all ol, ul, and li attribute elements that are wrapping the provided view element.
 */
function unwrapListItemBlock( viewElement: ViewElement, viewWriter: DowncastWriter ) {
	let attributeElement: ViewElement | ViewDocumentFragment = viewElement.parent!;

	while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
		const parentElement = attributeElement.parent;

		viewWriter.unwrap( viewWriter.createRangeOn( viewElement ), attributeElement );

		attributeElement = parentElement!;
	}
}

/**
 * Wraps the given list item with appropriate attribute elements for ul, ol, and li.
 */
function wrapListItemBlock(
	listItem: ListElement,
	viewRange: ViewRange,
	strategies: Array<DowncastStrategy>,
	writer: DowncastWriter,
	options?: Record<string, unknown>
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
			if (
				( strategy.scope == 'list' || strategy.scope == 'item' ) &&
				currentListItem.hasAttribute( strategy.attributeName )
			) {
				strategy.setAttributeOnDowncast(
					writer,
					currentListItem.getAttribute( strategy.attributeName ),
					strategy.scope == 'list' ? listViewElement : listItemViewElement,
					options
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
		if ( attributeKey.startsWith( 'selection:' ) || attributeKey == 'htmlEmptyBlock' ) {
			continue;
		}

		// Don't use bogus paragraph if there are attributes from other features.
		if ( !attributeNames.includes( attributeKey ) ) {
			return false;
		}
	}

	return blocks.length < 2;
}
