/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/converters
 */

import {
	generateLiInUl,
	injectViewList,
	mergeViewLists,
	getSiblingListItem,
	positionAfterUiElements
} from './utils';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';

/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It creates a `<ul><li></li><ul>` (or `<ol>`) view structure out of a `listItem` model element, inserts it at the correct
 * position, and merges the list with surrounding lists (if available).
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewInsertion( model ) {
	return ( evt, data, conversionApi ) => {
		const consumable = conversionApi.consumable;

		if ( !consumable.test( data.item, 'insert' ) ||
			!consumable.test( data.item, 'attribute:listType' ) ||
			!consumable.test( data.item, 'attribute:listIndent' )
		) {
			return;
		}

		consumable.consume( data.item, 'insert' );
		consumable.consume( data.item, 'attribute:listType' );
		consumable.consume( data.item, 'attribute:listIndent' );

		const modelItem = data.item;
		const viewItem = generateLiInUl( modelItem, conversionApi );

		injectViewList( modelItem, viewItem, conversionApi, model );
	};
}

/**
 * A model-to-view converter for the `listItem` model element removal.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewRemove( model ) {
	return ( evt, data, conversionApi ) => {
		const viewStart = conversionApi.mapper.toViewPosition( data.position ).getLastMatchingPosition( value => !value.item.is( 'li' ) );
		const viewItem = viewStart.nodeAfter;
		const viewWriter = conversionApi.writer;

		// 1. Break the container after and before the list item.
		// This will create a view list with one view list item - the one to remove.
		viewWriter.breakContainer( viewWriter.createPositionBefore( viewItem ) );
		viewWriter.breakContainer( viewWriter.createPositionAfter( viewItem ) );

		// 2. Remove the list with the item to remove.
		const viewList = viewItem.parent;
		const viewListPrev = viewList.previousSibling;
		const removeRange = viewWriter.createRangeOn( viewList );
		const removed = viewWriter.remove( removeRange );

		// 3. Merge the whole created by breaking and removing the list.
		if ( viewListPrev && viewListPrev.nextSibling ) {
			mergeViewLists( viewWriter, viewListPrev, viewListPrev.nextSibling );
		}

		// 4. Bring back nested list that was in the removed <li>.
		const modelItem = conversionApi.mapper.toModelElement( viewItem );

		hoistNestedLists( modelItem.getAttribute( 'listIndent' ) + 1, data.position, removeRange.start, viewItem, conversionApi, model );

		// 5. Unbind removed view item and all children.
		for ( const child of viewWriter.createRangeIn( removed ).getItems() ) {
			conversionApi.mapper.unbindViewElement( child );
		}

		evt.stop();
	};
}

/**
 * A model-to-view converter for the `type` attribute change on the `listItem` model element.
 *
 * This change means that the `<li>` element parent changes from `<ul>` to `<ol>` (or vice versa). This is accomplished
 * by breaking view elements and changing their name. The next {@link module:list/converters~modelViewMergeAfterChangeType}
 * converter will attempt to merge split nodes.
 *
 * Splitting this conversion into 2 steps makes it possible to add an additional conversion in the middle.
 * Check {@link module:list/todolistconverters~modelViewChangeType} to see an example of it.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface.
 */
export function modelViewChangeType( evt, data, conversionApi ) {
	if ( !conversionApi.consumable.consume( data.item, 'attribute:listType' ) ) {
		return;
	}

	const viewItem = conversionApi.mapper.toViewElement( data.item );
	const viewWriter = conversionApi.writer;

	// Break the container after and before the list item.
	// This will create a view list with one view list item -- the one that changed type.
	viewWriter.breakContainer( viewWriter.createPositionBefore( viewItem ) );
	viewWriter.breakContainer( viewWriter.createPositionAfter( viewItem ) );

	// Change name of the view list that holds the changed view item.
	// We cannot just change name property, because that would not render properly.
	const viewList = viewItem.parent;
	const listName = data.attributeNewValue == 'numbered' ? 'ol' : 'ul';

	viewWriter.rename( listName, viewList );
}

/**
 * A model-to-view converter that attempts to merge nodes split by {@link module:list/converters~modelViewChangeType}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface.
 */
export function modelViewMergeAfterChangeType( evt, data, conversionApi ) {
	const viewItem = conversionApi.mapper.toViewElement( data.item );
	const viewList = viewItem.parent;
	const viewWriter = conversionApi.writer;

	// Merge the changed view list with other lists, if possible.
	mergeViewLists( viewWriter, viewList, viewList.nextSibling );
	mergeViewLists( viewWriter, viewList.previousSibling, viewList );

	// Consumable insertion of children inside the item. They are already handled by re-building the item in view.
	for ( const child of data.item.getChildren() ) {
		conversionApi.consumable.consume( child, 'insert' );
	}
}

/**
 * A model-to-view converter for the `listIndent` attribute change on the `listItem` model element.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewChangeIndent( model ) {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, 'attribute:listIndent' ) ) {
			return;
		}

		const viewItem = conversionApi.mapper.toViewElement( data.item );
		const viewWriter = conversionApi.writer;

		// 1. Break the container after and before the list item.
		// This will create a view list with one view list item -- the one that changed type.
		viewWriter.breakContainer( viewWriter.createPositionBefore( viewItem ) );
		viewWriter.breakContainer( viewWriter.createPositionAfter( viewItem ) );

		// 2. Extract view list with changed view list item and merge "hole" possibly created by breaking and removing elements.
		const viewList = viewItem.parent;
		const viewListPrev = viewList.previousSibling;
		const removeRange = viewWriter.createRangeOn( viewList );
		viewWriter.remove( removeRange );

		if ( viewListPrev && viewListPrev.nextSibling ) {
			mergeViewLists( viewWriter, viewListPrev, viewListPrev.nextSibling );
		}

		// 3. Bring back nested list that was in the removed <li>.
		hoistNestedLists( data.attributeOldValue + 1, data.range.start, removeRange.start, viewItem, conversionApi, model );

		// 4. Inject view list like it is newly inserted.
		injectViewList( data.item, viewItem, conversionApi, model );

		// 5. Consume insertion of children inside the item. They are already handled by re-building the item in view.
		for ( const child of data.item.getChildren() ) {
			conversionApi.consumable.consume( child, 'insert' );
		}
	};
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
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface.
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
			const removeEnd = viewWriter.createPositionAt( viewPosition.parent, 'end' );

			// Don't remove if there is nothing to remove.
			if ( !removeStart.isEqual( removeEnd ) ) {
				const removed = viewWriter.remove( viewWriter.createRange( removeStart, removeEnd ) );
				lists.push( removed );
			}

			viewPosition = viewWriter.createPositionAfter( viewPosition.parent );
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
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface.
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
 * A view-to-model converter that converts the `<li>` view elements into the `listItem` model elements.
 *
 * To set correct values of the `listType` and `listIndent` attributes the converter:
 * * checks `<li>`'s parent,
 * * stores and increases the `conversionApi.store.indent` value when `<li>`'s sub-items are converted.
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface to be used by the callback.
 */
export function viewModelConverter( evt, data, conversionApi ) {
	if ( conversionApi.consumable.consume( data.viewItem, { name: true } ) ) {
		const writer = conversionApi.writer;

		// 1. Create `listItem` model element.
		const listItem = writer.createElement( 'listItem' );

		// 2. Handle `listItem` model element attributes.
		const indent = getIndent( data.viewItem );

		writer.setAttribute( 'listIndent', indent, listItem );

		// Set 'bulleted' as default. If this item is pasted into a context,
		const type = data.viewItem.parent && data.viewItem.parent.name == 'ol' ? 'numbered' : 'bulleted';
		writer.setAttribute( 'listType', type, listItem );

		// Try to find allowed parent for list item.
		const splitResult = conversionApi.splitToAllowedParent( listItem, data.modelCursor );

		// When there is no allowed parent it means that list item cannot be converted at current model position
		// and in any of position ancestors.
		if ( !splitResult ) {
			return;
		}

		writer.insert( listItem, splitResult.position );

		const nextPosition = viewToModelListItemChildrenConverter( listItem, data.viewItem.getChildren(), conversionApi );

		// Result range starts before the first item and ends after the last.
		data.modelRange = writer.createRange( data.modelCursor, nextPosition );

		// When `data.modelCursor` parent had to be split to insert list item...
		if ( splitResult.cursorParent ) {
			// Continue conversion in the split element.
			data.modelCursor = writer.createPositionAt( splitResult.cursorParent, 0 );
		} else {
			// Otherwise continue conversion after the last list item.
			data.modelCursor = data.modelRange.end;
		}
	}
}

/**
 * A view-to-model converter for the `<ul>` and `<ol>` view elements that cleans the input view of garbage.
 * This is mostly to clean whitespaces from between the `<li>` view elements inside the view list element, however, also
 * incorrect data can be cleared if the view was incorrect.
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface to be used by the callback.
 */
export function cleanList( evt, data, conversionApi ) {
	if ( conversionApi.consumable.test( data.viewItem, { name: true } ) ) {
		// Caching children because when we start removing them iterating fails.
		const children = Array.from( data.viewItem.getChildren() );

		for ( const child of children ) {
			const isWrongElement = !( child.is( 'li' ) || isList( child ) );

			if ( isWrongElement ) {
				child._remove();
			}
		}
	}
}

/**
 * A view-to-model converter for the `<li>` elements that cleans whitespace formatting from the input view.
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface to be used by the callback.
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
			if ( foundList && !isList( child ) ) {
				child._remove();
			}

			if ( child.is( 'text' ) ) {
				// If this is the first node and it's a text node, left-trim it.
				if ( firstNode ) {
					child._data = child.data.replace( /^\s+/, '' );
				}

				// If this is the last text node before <ul> or <ol>, right-trim it.
				if ( !child.nextSibling || isList( child.nextSibling ) ) {
					child._data = child.data.replace( /\s+$/, '' );
				}
			} else if ( isList( child ) ) {
				// If this is a <ul> or <ol>, do not process it, just mark that we already visited list element.
				foundList = true;
			}

			firstNode = false;
		}
	}
}

/**
 * Returns a callback for model position to view position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between the `listItem` elements that would be incorrectly mapped because of how list items are represented in the model
 * and in the view.
 *
 * @see module:engine/conversion/mapper~Mapper#event:modelToViewPosition
 * @param {module:engine/view/view~View} view A view instance.
 * @returns {Function}
 */
export function modelToViewPosition( view ) {
	return ( evt, data ) => {
		if ( data.isPhantom ) {
			return;
		}

		const modelItem = data.modelPosition.nodeBefore;

		if ( modelItem && modelItem.is( 'listItem' ) ) {
			const viewItem = data.mapper.toViewElement( modelItem );
			const topmostViewList = viewItem.getAncestors().find( isList );
			const walker = view.createPositionAt( viewItem, 0 ).getWalker();

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
	};
}

/**
 * The callback for view position to model position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes
 * positions between the `<li>` elements that would be incorrectly mapped because of how list items are represented in the model
 * and in the view.
 *
 * @see module:engine/conversion/mapper~Mapper#event:viewToModelPosition
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function viewToModelPosition( model ) {
	return ( evt, data ) => {
		const viewPos = data.viewPosition;
		const viewParent = viewPos.parent;
		const mapper = data.mapper;

		if ( viewParent.name == 'ul' || viewParent.name == 'ol' ) {
			// Position is directly in <ul> or <ol>.
			if ( !viewPos.isAtEnd ) {
				// If position is not at the end, it must be before <li>.
				// Get that <li>, map it to `listItem` and set model position before that `listItem`.
				const modelNode = mapper.toModelElement( viewPos.nodeAfter );

				data.modelPosition = model.createPositionBefore( modelNode );
			} else {
				// Position is at the end of <ul> or <ol>, so there is no <li> after it to be mapped.
				// There is <li> before the position, but we cannot just map it to `listItem` and set model position after it,
				// because that <li> may contain nested items.
				// We will check "model length" of that <li>, in other words - how many `listItem`s are in that <li>.
				const modelNode = mapper.toModelElement( viewPos.nodeBefore );
				const modelLength = mapper.getModelLength( viewPos.nodeBefore );

				// Then we get model position before mapped `listItem` and shift it accordingly.
				data.modelPosition = model.createPositionBefore( modelNode ).getShiftedBy( modelLength );
			}

			evt.stop();
		} else if (
			viewParent.name == 'li' &&
			viewPos.nodeBefore &&
			( viewPos.nodeBefore.name == 'ul' || viewPos.nodeBefore.name == 'ol' )
		) {
			// In most cases when view position is in <li> it is in text and this is a correct position.
			// However, if position is after <ul> or <ol> we have to fix it -- because in model <ul>/<ol> are not in the `listItem`.
			const modelNode = mapper.toModelElement( viewParent );

			// Check all <ul>s and <ol>s that are in the <li> but before mapped position.
			// Get model length of those elements and then add it to the offset of `listItem` mapped to the original <li>.
			let modelLength = 1; // Starts from 1 because the original <li> has to be counted in too.
			let viewList = viewPos.nodeBefore;

			while ( viewList && isList( viewList ) ) {
				modelLength += mapper.getModelLength( viewList );

				viewList = viewList.previousSibling;
			}

			data.modelPosition = model.createPositionBefore( modelNode ).getShiftedBy( modelLength );

			evt.stop();
		}
	};
}

/**
 * Post-fixer that reacts to changes on document and fixes incorrect model states.
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 *		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=1>Item 2</listItem>   <--- this is removed.
 *		<listItem listType="bulleted" listIndent=2>Item 3</listItem>
 *
 * The list structure after the middle element is removed:
 *
 * 		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=2>Item 3</listItem>
 *
 * Should become:
 *
 *		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=1>Item 3</listItem>   <--- note that indent got post-fixed.
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

				if ( item.hasAttribute( 'listIndent' ) ) {
					writer.removeAttribute( 'listIndent', item );

					applied = true;
				}

				if ( item.hasAttribute( 'listType' ) ) {
					writer.removeAttribute( 'listType', item );

					applied = true;
				}

				for ( const innerItem of Array.from( model.createRangeIn( item ) ).filter( e => e.item.is( 'listItem' ) ) ) {
					_addListToFix( innerItem.previousPosition );
				}
			}

			const posAfter = entry.position.getShiftedBy( entry.length );

			_addListToFix( posAfter );
		} else if ( entry.type == 'remove' && entry.name == 'listItem' ) {
			_addListToFix( entry.position );
		} else if ( entry.type == 'attribute' && entry.attributeKey == 'listIndent' ) {
			_addListToFix( entry.range.start );
		} else if ( entry.type == 'attribute' && entry.attributeKey == 'listType' ) {
			_addListToFix( entry.range.start );
		}
	}

	for ( const listHead of itemToListHead.values() ) {
		_fixListIndents( listHead );
		_fixListTypes( listHead );
	}

	return applied;

	function _addListToFix( position ) {
		const previousNode = position.nodeBefore;

		if ( !previousNode || !previousNode.is( 'listItem' ) ) {
			const item = position.nodeAfter;

			if ( item && item.is( 'listItem' ) ) {
				itemToListHead.set( item, item );
			}
		} else {
			let listHead = previousNode;

			if ( itemToListHead.has( listHead ) ) {
				return;
			}

			for (
				let previousSibling = listHead.previousSibling;
				previousSibling && previousSibling.is( 'listItem' );
				previousSibling = listHead.previousSibling
			) {
				listHead = previousSibling;

				if ( itemToListHead.has( listHead ) ) {
					return;
				}
			}

			itemToListHead.set( previousNode, listHead );
		}
	}

	function _fixListIndents( item ) {
		let maxIndent = 0;
		let fixBy = null;

		while ( item && item.is( 'listItem' ) ) {
			const itemIndent = item.getAttribute( 'listIndent' );

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

				writer.setAttribute( 'listIndent', newIndent, item );

				applied = true;
			} else {
				fixBy = null;
				maxIndent = item.getAttribute( 'listIndent' ) + 1;
			}

			item = item.nextSibling;
		}
	}

	function _fixListTypes( item ) {
		let typesStack = [];
		let prev = null;

		while ( item && item.is( 'listItem' ) ) {
			const itemIndent = item.getAttribute( 'listIndent' );

			if ( prev && prev.getAttribute( 'listIndent' ) > itemIndent ) {
				typesStack = typesStack.slice( 0, itemIndent + 1 );
			}

			if ( itemIndent != 0 ) {
				if ( typesStack[ itemIndent ] ) {
					const type = typesStack[ itemIndent ];

					if ( item.getAttribute( 'listType' ) != type ) {
						writer.setAttribute( 'listType', type, item );

						applied = true;
					}
				} else {
					typesStack[ itemIndent ] = item.getAttribute( 'listType' );
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
 *		<listItem listType="bulleted" listIndent=0>A</listItem>
 *		<listItem listType="bulleted" listIndent=1>B^</listItem>
 *		// At ^ paste:  <listItem listType="bulleted" listIndent=4>X</listItem>
 *		//              <listItem listType="bulleted" listIndent=5>Y</listItem>
 *		<listItem listType="bulleted" listIndent=2>C</listItem>
 *
 * Should become:
 *
 *		<listItem listType="bulleted" listIndent=0>A</listItem>
 *		<listItem listType="bulleted" listIndent=1>BX</listItem>
 *		<listItem listType="bulleted" listIndent=2>Y/listItem>
 *		<listItem listType="bulleted" listIndent=2>C</listItem>
 *
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Array} args Arguments of {@link module:engine/model/model~Model#insertContent}.
 */
export function modelIndentPasteFixer( evt, [ content, selectable ] ) {
	// Check whether inserted content starts from a `listItem`. If it does not, it means that there are some other
	// elements before it and there is no need to fix indents, because even if we insert that content into a list,
	// that list will be broken.
	// Note: we also need to handle singular elements because inserting item with indent 0 into 0,1,[],2
	// would create incorrect model.
	let item = content.is( 'documentFragment' ) ? content.getChild( 0 ) : content;

	let selection;

	if ( !selectable ) {
		selection = this.document.selection;
	} else {
		selection = this.createSelection( selectable );
	}

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
			const indentChange = refItem.getAttribute( 'listIndent' );

			// Fix only if there is anything to fix.
			if ( indentChange > 0 ) {
				// Adjust indent of all "first" list items in inserted data.
				while ( item && item.is( 'listItem' ) ) {
					item._setAttribute( 'listIndent', item.getAttribute( 'listIndent' ) + indentChange );

					item = item.nextSibling;
				}
			}
		}
	}
}

// Helper function that converts children of a given `<li>` view element into corresponding model elements.
// The function maintains proper order of elements if model `listItem` is split during the conversion
// due to block children conversion.
//
// @param {module:engine/model/element~Element} listItemModel List item model element to which converted children will be inserted.
// @param {Iterable.<module:engine/view/node~Node>} viewChildren View elements which will be converted.
// @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface to be used by the callback.
// @returns {module:engine/model/position~Position} Position on which next elements should be inserted after children conversion.
function viewToModelListItemChildrenConverter( listItemModel, viewChildren, conversionApi ) {
	const { writer, schema } = conversionApi;

	// A position after the last inserted `listItem`.
	let nextPosition = writer.createPositionAfter( listItemModel );

	// Check all children of the converted `<li>`. At this point we assume there are no "whitespace" view text nodes
	// in view list, between view list items. This should be handled by `<ul>` and `<ol>` converters.
	for ( const child of viewChildren ) {
		if ( child.name == 'ul' || child.name == 'ol' ) {
			// If the children is a list, we will insert its conversion result after currently handled `listItem`.
			// Then, next insertion position will be set after all the new list items (and maybe other elements if
			// something split list item).
			//
			// If this is a list, we expect that some `listItem`s and possibly other blocks will be inserted, however `.modelCursor`
			// should be set after last `listItem` (or block). This is why it feels safe to use it as `nextPosition`
			nextPosition = conversionApi.convertItem( child, nextPosition ).modelCursor;
		} else {
			// If this is not a list, try inserting content at the end of the currently handled `listItem`.
			const result = conversionApi.convertItem( child, writer.createPositionAt( listItemModel, 'end' ) );

			// It may end up that the current `listItem` becomes split (if that content cannot be inside `listItem`). For example:
			//
			// <li><p>Foo</p></li>
			//
			// will be converted to:
			//
			// <listItem></listItem><paragraph>Foo</paragraph><listItem></listItem>
			//
			const convertedChild = result.modelRange.start.nodeAfter;
			const wasSplit = convertedChild && convertedChild.is( 'element' ) && !schema.checkChild( listItemModel, convertedChild.name );

			if ( wasSplit ) {
				// As `lastListItem` got split, we need to update it to the second part of the split `listItem` element.
				//
				// `modelCursor` should be set to a position where the conversion should continue. There are multiple possible scenarios
				// that may happen. Usually, `modelCursor` (marked as `#` below) would point to the second list item after conversion:
				//
				//		`<li><p>Foo</p></li>` -> `<listItem></listItem><paragraph>Foo</paragraph><listItem>#</listItem>`
				//
				// However, in some cases, like auto-paragraphing, the position is placed at the end of the block element:
				//
				//		`<li><div>Foo</div></li>` -> `<listItem></listItem><paragraph>Foo#</paragraph><listItem></listItem>`
				//
				// or after an element if another element broken auto-paragraphed element:
				//
				//		`<li><div><h2>Foo</h2></div></li>` -> `<listItem></listItem><heading1>Foo</heading1>#<listItem></listItem>`
				//
				// We need to check for such cases and use proper list item and position based on it.
				//
				if ( result.modelCursor.parent.is( 'listItem' ) ) {
					// (1).
					listItemModel = result.modelCursor.parent;
				} else {
					// (2), (3).
					listItemModel = findNextListItem( result.modelCursor );
				}

				nextPosition = writer.createPositionAfter( listItemModel );
			}
		}
	}

	return nextPosition;
}

// Helper function that seeks for a next list item starting from given `startPosition`.
function findNextListItem( startPosition ) {
	const treeWalker = new TreeWalker( { startPosition } );

	let value;

	do {
		value = treeWalker.next();
	} while ( !value.value.item.is( 'listItem' ) );

	return value.value.item;
}

// Helper function that takes all children of given `viewRemovedItem` and moves them in a correct place, according
// to other given parameters.
function hoistNestedLists( nextIndent, modelRemoveStartPosition, viewRemoveStartPosition, viewRemovedItem, conversionApi, model ) {
	// Find correct previous model list item element.
	// The element has to have either same or smaller indent than given reference indent.
	// This will be the model element which will get nested items (if it has smaller indent) or sibling items (if it has same indent).
	// Keep in mind that such element might not be found, if removed item was the first item.
	const prevModelItem = getSiblingListItem( modelRemoveStartPosition.nodeBefore, {
		sameIndent: true,
		smallerIndent: true,
		listIndent: nextIndent,
		foo: 'b'
	} );

	const mapper = conversionApi.mapper;
	const viewWriter = conversionApi.writer;

	// Indent of found element or `null` if the element has not been found.
	const prevIndent = prevModelItem ? prevModelItem.getAttribute( 'listIndent' ) : null;

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
		insertPosition = viewWriter.createPositionAfter( prevViewList );
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
		const modelPosition = model.createPositionAt( prevModelItem, 'end' );
		insertPosition = mapper.toViewPosition( modelPosition );
	}

	insertPosition = positionAfterUiElements( insertPosition );

	// Handle multiple lists. This happens if list item has nested numbered and bulleted lists. Following lists
	// are inserted after the first list (no need to recalculate insertion position for them).
	for ( const child of [ ...viewRemovedItem.getChildren() ] ) {
		if ( isList( child ) ) {
			insertPosition = viewWriter.move( viewWriter.createRangeOn( child ), insertPosition ).end;

			mergeViewLists( viewWriter, child, child.nextSibling );
			mergeViewLists( viewWriter, child.previousSibling, child );
		}
	}
}

// Checks if view element is a list type (ul or ol).
//
// @param {module:engine/view/element~Element} viewElement
// @returns {Boolean}
function isList( viewElement ) {
	return viewElement.is( 'ol' ) || viewElement.is( 'ul' );
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
		if ( parent.is( 'li' ) ) {
			indent++;
		} else {
			// If however the list is nested in other list we should check previous sibling of any of the list elements...
			const previousSibling = parent.previousSibling;

			// ...because the we might need increase its indent:
			//		before:                           fixed list:
			//		OL                                OL
			//		|-> LI (parent LIs: 0)            |-> LI         (indent: 0)
			//		|-> OL                                |-> OL
			//		    |-> LI (parent LIs: 0)                |-> LI (indent: 1)
			if ( previousSibling && previousSibling.is( 'li' ) ) {
				indent++;
			}
		}

		parent = parent.parent;
	}

	return indent;
}
