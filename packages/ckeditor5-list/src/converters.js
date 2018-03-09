/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/converters
 */

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';

import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import ViewTreeWalker from '@ckeditor/ckeditor5-engine/src/view/treewalker';
import { createViewListItemElement } from './utils';

/**
 * A model-to-view converter for `listItem` model element insertion.
 *
 * It creates a `<ul><li></li><ul>` (or `<ol>`) view structure out of a `listItem` model element, inserts it at the correct
 * position, and merges the list with surrounding lists (if available).
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewInsertion( evt, data, conversionApi ) {
	const consumable = conversionApi.consumable;

	if ( !consumable.test( data.item, 'insert' ) ||
		!consumable.test( data.item, 'attribute:type' ) ||
		!consumable.test( data.item, 'attribute:indent' )
	) {
		return;
	}

	consumable.consume( data.item, 'insert' );
	consumable.consume( data.item, 'attribute:type' );
	consumable.consume( data.item, 'attribute:indent' );

	const modelItem = data.item;
	const viewItem = generateLiInUl( modelItem, conversionApi );

	injectViewList( modelItem, viewItem, conversionApi );
}

/**
 * A model-to-view converter for `listItem` model element removal.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewRemove( evt, data, conversionApi ) {
	const viewStart = conversionApi.mapper.toViewPosition( data.position ).getLastMatchingPosition( value => !value.item.is( 'li' ) );
	const viewItem = viewStart.nodeAfter;
	const viewWriter = conversionApi.writer;

	// 1. Break the container after and before the list item.
	// This will create a view list with one view list item - the one to remove.
	viewWriter.breakContainer( ViewPosition.createBefore( viewItem ) );
	viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );

	// 2. Remove the list with the item to remove.
	const viewList = viewItem.parent;
	const viewListPrev = viewList.previousSibling;
	const removeRange = ViewRange.createOn( viewList );
	const removed = viewWriter.remove( removeRange );

	// 3. Merge the whole created by breaking and removing the list.
	if ( viewListPrev && viewListPrev.nextSibling ) {
		mergeViewLists( viewWriter, viewListPrev, viewListPrev.nextSibling );
	}

	// 4. Bring back nested list that was in the removed <li>.
	const modelItem = conversionApi.mapper.toModelElement( viewItem );

	hoistNestedLists( modelItem.getAttribute( 'indent' ) + 1, data.position, removeRange.start, viewItem, conversionApi );

	// 5. Unbind removed view item and all children.
	for ( const child of ViewRange.createIn( removed ).getItems() ) {
		conversionApi.mapper.unbindViewElement( child );
	}

	evt.stop();
}

/**
 * A model-to-view converter for `type` attribute change on `listItem` model element.
 *
 * This change means that `<li>` elements parent changes from `<ul>` to `<ol>` (or vice versa). This is accomplished
 * by breaking view elements, changing their name and merging them.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewChangeType( evt, data, conversionApi ) {
	if ( !conversionApi.consumable.consume( data.item, 'attribute:type' ) ) {
		return;
	}

	const viewItem = conversionApi.mapper.toViewElement( data.item );
	const viewWriter = conversionApi.writer;

	// 1. Break the container after and before the list item.
	// This will create a view list with one view list item -- the one that changed type.
	viewWriter.breakContainer( ViewPosition.createBefore( viewItem ) );
	viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );

	// 2. Change name of the view list that holds the changed view item.
	// We cannot just change name property, because that would not render properly.
	let viewList = viewItem.parent;
	const listName = data.attributeNewValue == 'numbered' ? 'ol' : 'ul';
	viewList = viewWriter.rename( viewList, listName );

	// 3. Merge the changed view list with other lists, if possible.
	mergeViewLists( viewWriter, viewList, viewList.nextSibling );
	mergeViewLists( viewWriter, viewList.previousSibling, viewList );

	// 4. Consumable insertion of children inside the item. They are already handled by re-building the item in view.
	for ( const child of data.item.getChildren() ) {
		conversionApi.consumable.consume( child, 'insert' );
	}
}

/**
 * A model-to-view converter for `indent` attribute change on `listItem` model element.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewChangeIndent( evt, data, conversionApi ) {
	if ( !conversionApi.consumable.consume( data.item, 'attribute:indent' ) ) {
		return;
	}

	const viewItem = conversionApi.mapper.toViewElement( data.item );
	const viewWriter = conversionApi.writer;

	// 1. Break the container after and before the list item.
	// This will create a view list with one view list item -- the one that changed type.
	viewWriter.breakContainer( ViewPosition.createBefore( viewItem ) );
	viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );

	// 2. Extract view list with changed view list item and merge "hole" possibly created by breaking and removing elements.
	const viewList = viewItem.parent;
	const viewListPrev = viewList.previousSibling;
	const removeRange = ViewRange.createOn( viewList );
	viewWriter.remove( removeRange );

	if ( viewListPrev && viewListPrev.nextSibling ) {
		mergeViewLists( viewWriter, viewListPrev, viewListPrev.nextSibling );
	}

	// 3. Bring back nested list that was in the removed <li>.
	hoistNestedLists( data.attributeOldValue + 1, data.range.start, removeRange.start, viewItem, conversionApi );

	// 4. Inject view list like it is newly inserted.
	injectViewList( data.item, viewItem, conversionApi );

	// 5. Consume insertion of children inside the item. They are already handled by re-building the item in view.
	for ( const child of data.item.getChildren() ) {
		conversionApi.consumable.consume( child, 'insert' );
	}
}

/**
 * A special model-to-view converter introduced by the {@link module:list/list~List list feature}. This converter is fired for
 * insert change of every model item, and should be fired before the actual converter. The converter checks whether the inserted
 * model item is a non-`listItem` element. If it is, and it is inserted inside a view list, the converter breaks the
 * list so the model element is inserted to the view parent element corresponding to its model parent element.
 *
 * The converter prevents such situations:
 *
 *		// Model:                        // View:
 *		<listItem>foo</listItem>         <ul>
 *		<listItem>bar</listItem>             <li>foo</li>
 *		                                     <li>bar</li>
 *		                                 </ul>
 *
 *		// After change:                 // Correct view guaranteed by this converter:
 *		<listItem>foo</listItem>         <ul><li>foo</li></ul><p>xxx</p><ul><li>bar</li></ul>
 *		<paragraph>xxx</paragraph>       // Instead of this wrong view state:
 *		<listItem>bar</listItem>         <ul><li>foo</li><p>xxx</p><li>bar</li></ul>
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewSplitOnInsert( evt, data, conversionApi ) {
	if ( data.item.name != 'listItem' ) {
		let viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		const viewWriter = conversionApi.writer;
		const lists = [];

		// Break multiple ULs/OLs if there are.
		//
		// Imagine following list:
		//
		// 1 --------
		//   1.1 --------
		//     1.1.1 --------
		//     1.1.2 --------
		//     1.1.3 --------
		//       1.1.3.1 --------
		//   1.2 --------
		//     1.2.1 --------
		// 2 --------
		//
		// Insert paragraph after item 1.1.1:
		//
		// 1 --------
		//   1.1 --------
		//     1.1.1 --------
		//
		// Lorem ipsum.
		//
		//     1.1.2 --------
		//     1.1.3 --------
		//       1.1.3.1 --------
		//   1.2 --------
		//     1.2.1 --------
		// 2 --------
		//
		// In this case 1.1.2 has to become beginning of a new list.
		// We need to break list before 1.1.2 (obvious), then we need to break list also before 1.2.
		// Then we need to move those broken pieces one after another and merge:
		//
		// 1 --------
		//   1.1 --------
		//     1.1.1 --------
		//
		// Lorem ipsum.
		//
		// 1.1.2 --------
		//   1.1.3 --------
		//     1.1.3.1 --------
		// 1.2 --------
		//   1.2.1 --------
		// 2 --------
		//
		while ( viewPosition.parent.name == 'ul' || viewPosition.parent.name == 'ol' ) {
			viewPosition = viewWriter.breakContainer( viewPosition );

			if ( viewPosition.parent.name != 'li' ) {
				break;
			}

			// Remove lists that are after inserted element.
			// They will be brought back later, below the inserted element.
			const removeStart = viewPosition;
			const removeEnd = ViewPosition.createAt( viewPosition.parent, 'end' );

			// Don't remove if there is nothing to remove.
			if ( !removeStart.isEqual( removeEnd ) ) {
				const removed = viewWriter.remove( new ViewRange( removeStart, removeEnd ) );
				lists.push( removed );
			}

			viewPosition = ViewPosition.createAfter( viewPosition.parent );
		}

		// Bring back removed lists.
		if ( lists.length > 0 ) {
			for ( let i = 0; i < lists.length; i++ ) {
				const previousList = viewPosition.nodeBefore;
				const insertedRange = viewWriter.insert( viewPosition, lists[ i ] );
				viewPosition = insertedRange.end;

				// Don't merge first list! We want a split in that place (this is why this converter is introduced).
				if ( i > 0 ) {
					const mergePos = mergeViewLists( viewWriter, previousList, previousList.nextSibling );

					// If `mergePos` is in `previousList` it means that the lists got merged.
					// In this case, we need to fix insert position.
					if ( mergePos && mergePos.parent == previousList ) {
						viewPosition.offset--;
					}
				}
			}

			// Merge last inserted list with element after it.
			mergeViewLists( viewWriter, viewPosition.nodeBefore, viewPosition.nodeAfter );
		}
	}
}

/**
 * A special model-to-view converter introduced by the {@link module:list/list~List list feature}. This converter takes care of
 * merging view lists after something is removed or moved from near them.
 *
 * Example:
 *
 *		// Model:                        // View:
 *		<listItem>foo</listItem>         <ul><li>foo</li></ul>
 *		<paragraph>xxx</paragraph>       <p>xxx</p>
 *		<listItem>bar</listItem>         <ul><li>bar</li></ul>
 *
 *		// After change:                 // Correct view guaranteed by this converter:
 *		<listItem>foo</listItem>         <ul>
 *		<listItem>bar</listItem>             <li>foo</li>
 *		                                     <li>bar</li>
 *		                                 </ul>
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewMergeAfter( evt, data, conversionApi ) {
	const viewPosition = conversionApi.mapper.toViewPosition( data.position );
	const viewItemPrev = viewPosition.nodeBefore;
	const viewItemNext = viewPosition.nodeAfter;

	// Merge lists if something (remove, move) was done from inside of list.
	// Merging will be done only if both items are view lists of the same type.
	// The check is done inside the helper function.
	mergeViewLists( conversionApi.writer, viewItemPrev, viewItemNext );
}

/**
 * A view-to-model converter that converts `<li>` view elements into `listItem` model elements.
 *
 * To set correct values of the `type` and `indent` attributes the converter:
 * * checks `<li>`'s parent,
 * * stores and increases the `conversionApi.store.indent` value when `<li>`'s sub-items are converted.
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {Object} conversionApi Conversion interface to be used by the callback.
 */
export function viewModelConverter( evt, data, conversionApi ) {
	if ( conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
		const writer = conversionApi.writer;
		const conversionStore = this.conversionApi.store;

		// 1. Create `listItem` model element.
		const listItem = writer.createElement( 'listItem' );

		// 2. Handle `listItem` model element attributes.
		conversionStore.indent = conversionStore.indent || 0;
		writer.setAttribute( 'indent', conversionStore.indent, listItem );

		// Set 'bulleted' as default. If this item is pasted into a context,
		const type = data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted';
		writer.setAttribute( 'type', type, listItem );

		// `listItem`s created recursively should have bigger indent.
		conversionStore.indent++;

		// Try to find allowed parent for list item.
		const splitResult = conversionApi.splitToAllowedParent( listItem, data.modelCursor );

		// When there is no allowed parent it means that list item cannot be converted at current model position
		// and in any of position ancestors.
		if ( !splitResult ) {
			return;
		}

		writer.insert( listItem, splitResult.position );

		// Remember position after list item, next list items will be inserted at this position.
		let nextPosition = ModelPosition.createAfter( listItem );

		// Check all children of the converted `<li>`.
		// At this point we assume there are no "whitespace" view text nodes in view list, between view list items.
		// This should be handled by `<ul>` and `<ol>` converters.
		for ( const child of data.viewItem.getChildren() ) {
			// If this is a view list element, we will convert it after last `listItem` model element.
			if ( child.name == 'ul' || child.name == 'ol' ) {
				nextPosition = conversionApi.convertItem( child, nextPosition ).modelCursor;
			}
			// If it was not a list it was a "regular" list item content. Just convert it to `listItem`.
			else {
				conversionApi.convertItem( child, ModelPosition.createAt( listItem, 'end' ) );
			}
		}

		conversionStore.indent--;

		// Result range starts before the first item and ends after the last.
		data.modelRange = new ModelRange( data.modelCursor, nextPosition );

		// When modelCursor parent had to be split to insert list item.
		if ( splitResult.cursorParent ) {
			// Then continue conversion in split element.
			data.modelCursor = ModelPosition.createAt( splitResult.cursorParent );
		} else {
			// Otherwise continue conversion after last list item.
			data.modelCursor = data.modelRange.end;
		}
	}
}

/**
 * A view-to-model converter for `<ul>` and `<ol>` view elements that cleans the input view of garbage.
 * This is mostly to clean whitespaces from between `<li>` view elements inside the view list element, however, also
 * incorrect data can be cleared if the view was incorrect.
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {Object} conversionApi Conversion interface to be used by the callback.
 */
export function cleanList( evt, data, conversionApi ) {
	if ( conversionApi.consumable.test( data.viewItem, { name: true } ) ) {
		// Caching children because when we start removing them iterating fails.
		const children = Array.from( data.viewItem.getChildren() );

		for ( const child of children ) {
			if ( !child.is( 'li' ) ) {
				child._remove();
			}
		}
	}
}

/**
 * A view-to-model converter for `<li>` elements that cleans whitespace formatting from the input view.
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {Object} conversionApi Conversion interface to be used by the callback.
 */
export function cleanListItem( evt, data, conversionApi ) {
	if ( conversionApi.consumable.test( data.viewItem, { name: true } ) ) {
		if ( data.viewItem.childCount === 0 ) {
			return;
		}

		const children = [ ...data.viewItem.getChildren() ];

		let foundList = false;
		let firstNode = true;

		for ( const child of children ) {
			if ( foundList && !child.is( 'ul' ) && !child.is( 'ol' ) ) {
				child._remove();
			}

			if ( child.is( 'text' ) ) {
				// If this is the first node and it's a text node, left-trim it.
				if ( firstNode ) {
					conversionApi.writer.setTextData( child.data.replace( /^\s+/, '' ), child );
				}

				// If this is the last text node before <ul> or <ol>, right-trim it.
				if ( !child.nextSibling || ( child.nextSibling.is( 'ul' ) || child.nextSibling.is( 'ol' ) ) ) {
					conversionApi.writer.setTextData( child.data.replace( /\s+$/, '' ), child );
				}
			} else if ( child.is( 'ul' ) || child.is( 'ol' ) ) {
				// If this is a <ul> or <ol>, do not process it, just mark that we already visited list element.
				foundList = true;
			}

			firstNode = false;
		}
	}
}

/**
 * The callback for model position to view position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between `listItem` elements that would be incorrectly mapped because of how list items are represented in model
 * and view.
 *
 * @see module:engine/conversion/mapper~Mapper#event:modelToViewPosition
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing additional data and placeholder for mapping result.
 */
export function modelToViewPosition( evt, data ) {
	if ( data.isPhantom ) {
		return;
	}

	const modelItem = data.modelPosition.nodeBefore;

	if ( modelItem && modelItem.is( 'listItem' ) ) {
		const viewItem = data.mapper.toViewElement( modelItem );
		const topmostViewList = viewItem.getAncestors().find( element => element.is( 'ul' ) || element.is( 'ol' ) );
		const walker = new ViewTreeWalker( {
			startPosition: ViewPosition.createAt( viewItem, 0 )
		} );

		for ( const value of walker ) {
			if ( value.type == 'elementStart' && value.item.is( 'li' ) ) {
				data.viewPosition = value.previousPosition;

				break;
			} else if ( value.type == 'elementEnd' && value.item == topmostViewList ) {
				data.viewPosition = value.nextPosition;

				break;
			}
		}
	}
}

/**
 * The callback for view position to model position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between `<li>` elements that would be incorrectly mapped because of how list items are represented in model
 * and view.
 *
 * @see module:engine/conversion/mapper~Mapper#event:viewToModelPosition
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing additional data and placeholder for mapping result.
 */
export function viewToModelPosition( evt, data ) {
	const viewPos = data.viewPosition;
	const viewParent = viewPos.parent;
	const mapper = data.mapper;

	if ( viewParent.name == 'ul' || viewParent.name == 'ol' ) {
		// Position is directly in <ul> or <ol>.
		if ( !viewPos.isAtEnd ) {
			// If position is not at the end, it must be before <li>.
			// Get that <li>, map it to `listItem` and set model position before that `listItem`.
			const modelNode = mapper.toModelElement( viewPos.nodeAfter );

			data.modelPosition = ModelPosition.createBefore( modelNode );
		} else {
			// Position is at the end of <ul> or <ol>, so there is no <li> after it to be mapped.
			// There is <li> before the position, but we cannot just map it to `listItem` and set model position after it,
			// because that <li> may contain nested items.
			// We will check "model length" of that <li>, in other words - how many `listItem`s are in that <li>.
			const modelNode = mapper.toModelElement( viewPos.nodeBefore );
			const modelLength = mapper.getModelLength( viewPos.nodeBefore );

			// Then we get model position before mapped `listItem` and shift it accordingly.
			data.modelPosition = ModelPosition.createBefore( modelNode ).getShiftedBy( modelLength );
		}

		evt.stop();
	} else if ( viewParent.name == 'li' && viewPos.nodeBefore && ( viewPos.nodeBefore.name == 'ul' || viewPos.nodeBefore.name == 'ol' ) ) {
		// In most cases when view position is in <li> it is in text and this is a correct position.
		// However, if position is after <ul> or <ol> we have to fix it -- because in model <ul>/<ol> are not in the `listItem`.
		const modelNode = mapper.toModelElement( viewParent );

		// Check all <ul>s and <ol>s that are in the <li> but before mapped position.
		// Get model length of those elements and then add it to the offset of `listItem` mapped to the original <li>.
		let modelLength = 1; // Starts from 1 because the original <li> has to be counted in too.
		let viewList = viewPos.nodeBefore;

		while ( viewList && ( viewList.is( 'ul' ) || viewList.is( 'ol' ) ) ) {
			modelLength += mapper.getModelLength( viewList );

			viewList = viewList.previousSibling;
		}

		data.modelPosition = ModelPosition.createBefore( modelNode ).getShiftedBy( modelLength );

		evt.stop();
	}
}

/**
 * Post-fixer that reacts to changes on document and fixes incorrect model states.
 *
 * In an example below, there is a correct list structure.
 * Then the middle element will be removed so the list structure will become incorrect:
 *
 *		<listItem type="bulleted" indent=0>Item 1</listItem>
 *		<listItem type="bulleted" indent=1>Item 2</listItem>   <--- this is removed.
 *		<listItem type="bulleted" indent=2>Item 3</listItem>
 *
 * List structure after the middle element removed:
 *
 * 		<listItem type="bulleted" indent=0>Item 1</listItem>
 *		<listItem type="bulleted" indent=2>Item 3</listItem>
 *
 * Should become:
 *
 *		<listItem type="bulleted" indent=0>Item 1</listItem>
 *		<listItem type="bulleted" indent=1>Item 3</listItem>   <--- note that indent got post-fixed.
 *
 * @param {module:engine/model/model~Model} model The data model.
 * @param {module:engine/model/writer~Writer} writer The writer to do changes with.
 * @returns {Boolean} `true` if any change has been applied, `false` otherwise.
 */
export function modelChangePostFixer( model, writer ) {
	const changes = model.document.differ.getChanges();
	const itemToListHead = new Map();

	let applied = false;

	for ( const entry of changes ) {
		if ( entry.type == 'insert' && entry.name == 'listItem' ) {
			_addListToFix( entry.position );
		} else if ( entry.type == 'insert' && entry.name != 'listItem' ) {
			if ( entry.name != '$text' ) {
				// In case of renamed element.
				const item = entry.position.nodeAfter;

				if ( item.hasAttribute( 'indent' ) ) {
					writer.removeAttribute( 'indent', item );

					applied = true;
				}

				if ( item.hasAttribute( 'type' ) ) {
					writer.removeAttribute( 'type', item );

					applied = true;
				}
			}

			const posAfter = entry.position.getShiftedBy( entry.length );

			_addListToFix( posAfter );
		} else if ( entry.type == 'remove' && entry.name == 'listItem' ) {
			_addListToFix( entry.position );
		} else if ( entry.type == 'attribute' && entry.attributeKey == 'indent' ) {
			_addListToFix( entry.range.start );
		} else if ( entry.type == 'attribute' && entry.attributeKey == 'type' ) {
			_addListToFix( entry.range.start );
		}
	}

	for ( const listHead of itemToListHead.values() ) {
		_fixListIndents( listHead );
		_fixListTypes( listHead );
	}

	return applied;

	function _addListToFix( position ) {
		const prev = position.nodeBefore;

		if ( !prev || !prev.is( 'listItem' ) ) {
			const item = position.nodeAfter;

			if ( item && item.is( 'listItem' ) ) {
				itemToListHead.set( item, item );
			}
		} else {
			let listHead = prev;

			if ( itemToListHead.has( listHead ) ) {
				return;
			}

			while ( listHead.previousSibling && listHead.previousSibling.is( 'listItem' ) ) {
				listHead = listHead.previousSibling;

				if ( itemToListHead.has( listHead ) ) {
					return;
				}
			}

			itemToListHead.set( position.nodeBefore, listHead );
		}
	}

	function _fixListIndents( item ) {
		let maxIndent = 0;
		let fixBy = null;

		while ( item && item.is( 'listItem' ) ) {
			const itemIndent = item.getAttribute( 'indent' );

			if ( itemIndent > maxIndent ) {
				let newIndent;

				if ( fixBy === null ) {
					fixBy = itemIndent - maxIndent;
					newIndent = maxIndent;
				} else {
					if ( fixBy > itemIndent ) {
						fixBy = itemIndent;
					}

					newIndent = itemIndent - fixBy;
				}

				writer.setAttribute( 'indent', newIndent, item );

				applied = true;
			} else {
				fixBy = null;
				maxIndent = item.getAttribute( 'indent' ) + 1;
			}

			item = item.nextSibling;
		}
	}

	function _fixListTypes( item ) {
		let typesStack = [];
		let prev = null;

		while ( item && item.is( 'listItem' ) ) {
			const itemIndent = item.getAttribute( 'indent' );

			if ( prev && prev.getAttribute( 'indent' ) > itemIndent ) {
				typesStack = typesStack.slice( 0, itemIndent + 1 );
			}

			if ( itemIndent != 0 ) {
				if ( typesStack[ itemIndent ] ) {
					const type = typesStack[ itemIndent ];

					if ( item.getAttribute( 'type' ) != type ) {
						writer.setAttribute( 'type', type, item );

						applied = true;
					}
				} else {
					typesStack[ itemIndent ] = item.getAttribute( 'type' );
				}
			}

			prev = item;
			item = item.nextSibling;
		}
	}
}

/**
 * A fixer for pasted content that includes list items.
 *
 * It fixes indentation of pasted list items so the pasted items match correctly to the context they are pasted into.
 *
 * Example:
 *
 *		<listItem type="bulleted" indent=0>A</listItem>
 *		<listItem type="bulleted" indent=1>B^</listItem>
 *		// At ^ paste:  <listItem type="bulleted" indent=4>X</listItem>
 *		//              <listItem type="bulleted" indent=5>Y</listItem>
 *		<listItem type="bulleted" indent=2>C</listItem>
 *
 * Should become:
 *
 *		<listItem type="bulleted" indent=0>A</listItem>
 *		<listItem type="bulleted" indent=1>BX</listItem>
 *		<listItem type="bulleted" indent=2>Y/listItem>
 *		<listItem type="bulleted" indent=2>C</listItem>
 *
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Array} args Arguments of {@link module:engine/model/model~Model#insertContent}.
 */
export function modelIndentPasteFixer( evt, [ content, selection ] ) {
	// Check whether inserted content starts from a `listItem`. If it does not, it means that there are some other
	// elements before it and there is no need to fix indents, because even if we insert that content into a list,
	// that list will be broken.
	// Note: we also need to handle singular elements because inserting item with indent 0 into 0,1,[],2
	// would create incorrect model.
	let item = content.is( 'documentFragment' ) ? content.getChild( 0 ) : content;

	if ( item && item.is( 'listItem' ) ) {
		// Get a reference list item. Inserted list items will be fixed according to that item.
		const pos = selection.getFirstPosition();
		let refItem = null;

		if ( pos.parent.is( 'listItem' ) ) {
			refItem = pos.parent;
		} else if ( pos.nodeBefore && pos.nodeBefore.is( 'listItem' ) ) {
			refItem = pos.nodeBefore;
		}

		// If there is `refItem` it means that we do insert list items into an existing list.
		if ( refItem ) {
			// First list item in `data` has indent equal to 0 (it is a first list item). It should have indent equal
			// to the indent of reference item. We have to fix the first item and all of it's children and following siblings.
			// Indent of all those items has to be adjusted to reference item.
			const indentChange = refItem.getAttribute( 'indent' );

			// Fix only if there is anything to fix.
			if ( indentChange > 0 ) {
				// Adjust indent of all "first" list items in inserted data.
				while ( item && item.is( 'listItem' ) ) {
					item._setAttribute( 'indent', item.getAttribute( 'indent' ) + indentChange );

					item = item.nextSibling;
				}
			}
		}
	}
}

// Helper function that creates a `<ul><li></li></ul>` or (`<ol>`) structure out of given `modelItem` model `listItem` element.
// Then, it binds created view list item (<li>) with model `listItem` element.
// The function then returns created view list item (<li>).
function generateLiInUl( modelItem, conversionApi ) {
	const mapper = conversionApi.mapper;
	const viewWriter = conversionApi.writer;
	const listType = modelItem.getAttribute( 'type' ) == 'numbered' ? 'ol' : 'ul';
	const viewItem = createViewListItemElement( viewWriter );

	const viewList = viewWriter.createContainerElement( listType, null );
	viewWriter.insert( ViewPosition.createAt( viewList ), viewItem );

	mapper.bindElements( modelItem, viewItem );

	return viewItem;
}

// Helper function that seeks for a list item sibling of given model item (or position) which meets given criteria.
// `options` object may contain one or more of given values (by default they are `false`):
// `options.sameIndent` - whether sought sibling should have same indent (default = no),
// `options.smallerIndent` - whether sought sibling should have smaller indent (default = no).
// `options.indent` - used as reference item when first parameter is a position
// Either `options.sameIndent` or `options.biggerIndent` should be set to `true`.
function getSiblingListItem( modelItemOrPosition, options ) {
	const sameIndent = !!options.sameIndent;
	const smallerIndent = !!options.smallerIndent;

	const indent = modelItemOrPosition instanceof ModelElement ? modelItemOrPosition.getAttribute( 'indent' ) : options.indent;
	let item = modelItemOrPosition instanceof ModelElement ? modelItemOrPosition.previousSibling : modelItemOrPosition.nodeBefore;

	while ( item && item.name == 'listItem' ) {
		const itemIndent = item.getAttribute( 'indent' );

		if ( ( sameIndent && indent == itemIndent ) || ( smallerIndent && indent > itemIndent ) ) {
			return item;
		}

		item = item.previousSibling;
	}

	return null;
}

// Helper function that takes two parameters, that are expected to be view list elements, and merges them.
// The merge happen only if both parameters are UL or OL elements.
function mergeViewLists( viewWriter, firstList, secondList ) {
	if ( firstList && secondList && ( firstList.name == 'ul' || firstList.name == 'ol' ) && firstList.name == secondList.name ) {
		return viewWriter.mergeContainers( ViewPosition.createAfter( firstList ) );
	}

	return null;
}

// Helper function that takes model list item element `modelItem`, corresponding view list item element `injectedItem`
// that is not added to the view and is inside a view list element (`ul` or `ol`) and is that's list only child.
// The list is inserted at correct position (element breaking may be needed) and then merged with it's siblings.
// See comments below to better understand the algorithm.
function injectViewList( modelItem, injectedItem, conversionApi ) {
	const injectedList = injectedItem.parent;
	const mapper = conversionApi.mapper;
	const viewWriter = conversionApi.writer;

	// Position where view list will be inserted.
	let insertPosition = mapper.toViewPosition( ModelPosition.createBefore( modelItem ) );

	// 1. Find previous list item that has same or smaller indent. Basically we are looking for a first model item
	// that is "parent" or "sibling" of injected model item.
	// If there is no such list item, it means that injected list item is the first item in "its list".
	const refItem = getSiblingListItem( modelItem, { sameIndent: true, smallerIndent: true } );
	const prevItem = modelItem.previousSibling;

	if ( refItem && refItem.getAttribute( 'indent' ) == modelItem.getAttribute( 'indent' ) ) {
		// There is a list item with same indent - we found same-level sibling.
		// Break the list after it. Inserted view item will be inserted in the broken space.
		const viewItem = mapper.toViewElement( refItem );
		insertPosition = viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );
	} else {
		// There is no list item with same indent. Check previous model item.
		if ( prevItem && prevItem.name == 'listItem' ) {
			// If it is a list item, it has to have lower indent.
			// It means that inserted item should be added to it as its nested item.
			insertPosition = mapper.toViewPosition( ModelPosition.createAt( prevItem, 'end' ) );
		} else {
			// Previous item is not a list item (or does not exist at all).
			// Just map the position and insert the view item at mapped position.
			insertPosition = mapper.toViewPosition( ModelPosition.createBefore( modelItem ) );
		}
	}

	insertPosition = positionAfterUiElements( insertPosition );

	// Insert the view item.
	viewWriter.insert( insertPosition, injectedList );

	// 2. Handle possible children of injected model item.
	if ( prevItem && prevItem.name == 'listItem' ) {
		const prevView = mapper.toViewElement( prevItem );

		const walker = new ViewTreeWalker( {
			boundaries: new ViewRange(
				ViewPosition.createAt( prevView, 0 ),
				insertPosition
			),
			ignoreElementEnd: true
		} );

		for ( const value of walker ) {
			if ( value.item.is( 'li' ) ) {
				const breakPosition = viewWriter.breakContainer( ViewPosition.createBefore( value.item ) );
				const viewList = value.item.parent;

				const targetPosition = ViewPosition.createAt( injectedItem, 'end' );
				mergeViewLists( viewWriter, targetPosition.nodeBefore, targetPosition.nodeAfter );
				viewWriter.move( ViewRange.createOn( viewList ), targetPosition );

				walker.position = breakPosition;
			}
		}
	} else {
		const nextViewList = injectedList.nextSibling;

		if ( nextViewList && ( nextViewList.is( 'ul' ) || nextViewList.is( 'ol' ) ) ) {
			let lastSubChild = null;

			for ( const child of nextViewList.getChildren() ) {
				const modelChild = mapper.toModelElement( child );

				if ( modelChild && modelChild.getAttribute( 'indent' ) > modelItem.getAttribute( 'indent' ) ) {
					lastSubChild = child;
				} else {
					break;
				}
			}

			if ( lastSubChild ) {
				viewWriter.breakContainer( ViewPosition.createAfter( lastSubChild ) );
				viewWriter.move( ViewRange.createOn( lastSubChild.parent ), ViewPosition.createAt( injectedItem, 'end' ) );
			}
		}
	}

	// Merge inserted view list with its possible neighbour lists.
	mergeViewLists( viewWriter, injectedList, injectedList.nextSibling );
	mergeViewLists( viewWriter, injectedList.previousSibling, injectedList );
}

// Helper function that takes all children of given `viewRemovedItem` and moves them in a correct place, according
// to other given parameters.
function hoistNestedLists( nextIndent, modelRemoveStartPosition, viewRemoveStartPosition, viewRemovedItem, conversionApi ) {
	// Find correct previous model list item element.
	// The element has to have either same or smaller indent than given reference indent.
	// This will be the model element which will get nested items (if it has smaller indent) or sibling items (if it has same indent).
	// Keep in mind that such element might not be found, if removed item was the first item.
	const prevModelItem = getSiblingListItem( modelRemoveStartPosition, {
		sameIndent: true,
		smallerIndent: true,
		indent: nextIndent
	} );

	const mapper = conversionApi.mapper;
	const viewWriter = conversionApi.writer;

	// Indent of found element or `null` if the element has not been found.
	const prevIndent = prevModelItem ? prevModelItem.getAttribute( 'indent' ) : null;

	let insertPosition;

	if ( !prevModelItem ) {
		// If element has not been found, simply insert lists at the position where the removed item was:
		//
		// Lorem ipsum.
		// 1 --------           <--- this is removed, no previous list item, put nested items in place of removed item.
		//   1.1 --------       <--- this is reference indent.
		//     1.1.1 --------
		//     1.1.2 --------
		//   1.2 --------
		//
		// Becomes:
		//
		// Lorem ipsum.
		// 1.1 --------
		//   1.1.1 --------
		//   1.1.2 --------
		// 1.2 --------
		insertPosition = viewRemoveStartPosition;
	} else if ( prevIndent == nextIndent ) {
		// If element has been found and has same indent as reference indent it means that nested items should
		// become siblings of found element:
		//
		// 1 --------
		//   1.1 --------
		//   1.2 --------       <--- this is `prevModelItem`.
		// 2 --------           <--- this is removed, previous list item has indent same as reference indent.
		//   2.1 --------       <--- this is reference indent, this and 2.2 should become siblings of 1.2.
		//   2.2 --------
		//
		// Becomes:
		//
		// 1 --------
		//   1.1 --------
		//   1.2 --------
		//   2.1 --------
		//   2.2 --------
		const prevViewList = mapper.toViewElement( prevModelItem ).parent;
		insertPosition = ViewPosition.createAfter( prevViewList );
	} else {
		// If element has been found and has smaller indent as reference indent it means that nested items
		// should become nested items of found item:
		//
		// 1 --------           <--- this is `prevModelItem`.
		//   1.1 --------       <--- this is removed, previous list item has indent smaller than reference indent.
		//     1.1.1 --------   <--- this is reference indent, this and 1.1.1 should become nested items of 1.
		//     1.1.2 --------
		//   1.2 --------
		//
		// Becomes:
		//
		// 1 --------
		//   1.1.1 --------
		//   1.1.2 --------
		//   1.2 --------
		//
		// Note: in this case 1.1.1 have indent 2 while 1 have indent 0. In model that should not be possible,
		// because following item may have indent bigger only by one. But this is fixed by postfixer.
		const modelPosition = ModelPosition.createAt( prevModelItem, 'end' );
		insertPosition = mapper.toViewPosition( modelPosition );
	}

	insertPosition = positionAfterUiElements( insertPosition );

	// Handle multiple lists. This happens if list item has nested numbered and bulleted lists. Following lists
	// are inserted after the first list (no need to recalculate insertion position for them).
	for ( const child of [ ...viewRemovedItem.getChildren() ] ) {
		if ( child.is( 'ul' ) || child.is( 'ol' ) ) {
			insertPosition = viewWriter.move( ViewRange.createOn( child ), insertPosition ).end;

			mergeViewLists( viewWriter, child, child.nextSibling );
			mergeViewLists( viewWriter, child.previousSibling, child );
		}
	}
}

// Helper function that for given `view.Position`, returns a `view.Position` that is after all `view.UIElement`s that
// are after given position.
// For example:
// <container:p>foo^<ui:span></ui:span><ui:span></ui:span>bar</contain:p>
// For position ^, a position before "bar" will be returned.
function positionAfterUiElements( viewPosition ) {
	return viewPosition.getLastMatchingPosition( value => value.item.is( 'uiElement' ) );
}
