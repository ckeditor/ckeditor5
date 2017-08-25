/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/converters
 */

import ViewListItemElement from './viewlistitemelement';

import ModelDocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import modelWriter from '@ckeditor/ckeditor5-engine/src/model/writer';

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import ViewTreeWalker from '@ckeditor/ckeditor5-engine/src/view/treewalker';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';

/**
 * A model-to-view converter for `listItem` model element insertion.
 *
 * It creates a `<ul><li></li><ul>` (or `<ol>`) view structure out of a `listItem` model element, inserts it at the correct
 * position, and merges the list with surrounding lists (if available).
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:insert
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewInsertion( evt, data, consumable, conversionApi ) {
	if ( !consumable.test( data.item, 'insert' ) ||
		!consumable.test( data.item, 'addAttribute:type' ) ||
		!consumable.test( data.item, 'addAttribute:indent' )
	) {
		return;
	}

	consumable.consume( data.item, 'insert' );
	consumable.consume( data.item, 'addAttribute:type' );
	consumable.consume( data.item, 'addAttribute:indent' );

	const modelItem = data.item;
	const viewItem = generateLiInUl( modelItem, conversionApi.mapper );

	// Providing kind of "default" insert position in case of converting incorrect model.
	const insertPosition = conversionApi.mapper.toViewPosition( ModelPosition.createBefore( modelItem ) );

	injectViewList( modelItem, viewItem, conversionApi.mapper, insertPosition );
}

/**
 * A model-to-view converter for `type` attribute change on `listItem` model element.
 *
 * This change means that `<li>` elements parent changes from `<ul>` to `<ol>` (or vice versa). This is accomplished
 * by breaking view elements, changing their name and merging them.
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:changeAttribute
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewChangeType( evt, data, consumable, conversionApi ) {
	if ( !consumable.consume( data.item, 'changeAttribute:type' ) ) {
		return;
	}

	const viewItem = conversionApi.mapper.toViewElement( data.item );

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
	mergeViewLists( viewList, viewList.nextSibling );
	mergeViewLists( viewList.previousSibling, viewList );
}

/**
 * A model-to-view converter for `listItem` model element removal.
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:remove
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewRemove( evt, data, consumable, conversionApi ) {
	if ( !consumable.consume( data.item, 'remove' ) ) {
		return;
	}

	let viewPosition = conversionApi.mapper.toViewPosition( data.sourcePosition );
	viewPosition = viewPosition.getLastMatchingPosition( value => !value.item.is( 'li' ) );

	const viewItem = viewPosition.nodeAfter;

	// 1. Break the container after and before the list item.
	// This will create a view list with one view list item -- the one that changed type.
	viewWriter.breakContainer( ViewPosition.createBefore( viewItem ) );
	viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );

	// 2. Remove the UL that contains just the removed <li>.
	const viewList = viewItem.parent;
	const viewListPrev = viewList.previousSibling;
	const removeRange = ViewRange.createOn( viewList );
	viewWriter.remove( removeRange );

	if ( viewListPrev && viewListPrev.nextSibling ) {
		mergeViewLists( viewListPrev, viewListPrev.nextSibling );
	}

	// 3. Bring back nested list that was in the removed <li>.
	hoistNestedLists( data.item.getAttribute( 'indent' ) + 1, data.sourcePosition, removeRange.start, viewItem, conversionApi.mapper );

	// Unbind this element only if it was moved to graveyard.
	// See #847.
	if ( data.item.root.rootName == '$graveyard' ) {
		conversionApi.mapper.unbindModelElement( data.item );
	}
}

/**
 * A model-to-view converter for `indent` attribute change on `listItem` model element.
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:changeAttribute
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewChangeIndent( evt, data, consumable, conversionApi ) {
	if ( !consumable.consume( data.item, 'changeAttribute:indent' ) ) {
		return;
	}

	const viewItem = conversionApi.mapper.toViewElement( data.item );

	// 1. Break the container after and before the list item.
	// This will create a view list with one view list item -- the one that changed type.
	viewWriter.breakContainer( ViewPosition.createBefore( viewItem ) );
	viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );

	// 2. Extract view list with changed view list item and merge "hole" possibly created by breaking and removing elements.
	const viewList = viewItem.parent;
	const viewListPrev = viewList.previousSibling;
	const removeRange = ViewRange.createOn( viewList );
	viewWriter.remove( removeRange );

	// TODO: get rid of `removePosition` when conversion is done on `changesDone`.
	let removePosition;

	if ( viewListPrev && viewListPrev.nextSibling ) {
		removePosition = mergeViewLists( viewListPrev, viewListPrev.nextSibling );
	}

	if ( !removePosition ) {
		removePosition = removeRange.start;
	}

	// 3. Bring back nested list that was in the removed <li>.
	hoistNestedLists( data.attributeOldValue + 1, data.range.start, removeRange.start, viewItem, conversionApi.mapper );

	// 4. Inject view list like it is newly inserted.
	injectViewList( data.item, viewItem, conversionApi.mapper, removePosition );
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
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:insert
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewSplitOnInsert( evt, data, consumable, conversionApi ) {
	if ( data.item.name != 'listItem' ) {
		let viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

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
					const mergePos = mergeViewLists( previousList, previousList.nextSibling );

					// If `mergePos` is in `previousList` it means that the lists got merged.
					// In this case, we need to fix insert position.
					if ( mergePos && mergePos.parent == previousList ) {
						viewPosition.offset--;
					}
				}
			}

			// Merge last inserted list with element after it.
			mergeViewLists( viewPosition.nodeBefore, viewPosition.nodeAfter );
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
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:remove
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewMergeAfter( evt, data, consumable, conversionApi ) {
	if ( !data.item.is( 'listItem' ) ) {
		const viewPosition = conversionApi.mapper.toViewPosition( data.sourcePosition );
		const viewItemPrev = viewPosition.nodeBefore;
		const viewItemNext = viewPosition.nodeAfter;

		// Merge lists if something (remove, move) was done from inside of list.
		// Merging will be done only if both items are view lists of the same type.
		// The check is done inside the helper function.
		mergeViewLists( viewItemPrev, viewItemNext );
	}
}

/**
 * A view-to-model converter that converts `<li>` view elements into `listItem` model elements.
 *
 * To set correct values of the `type` and `indent` attributes the converter:
 * * checks `<li>`'s parent,
 * * passes the `data.indent` value when `<li>`'s sub-items are converted.
 *
 * @see module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/viewconsumable~ViewConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface to be used by the callback.
 */
export function viewModelConverter( evt, data, consumable, conversionApi ) {
	if ( consumable.consume( data.input, { name: true } ) ) {
		// 1. Create `listItem` model element.
		const listItem = new ModelElement( 'listItem' );

		// 2. Handle `listItem` model element attributes.
		data.indent = data.indent ? data.indent : 0;

		const type = data.input.parent.name == 'ul' ? 'bulleted' : 'numbered';
		listItem.setAttribute( 'type', type );
		listItem.setAttribute( 'indent', data.indent );

		// 3. Handle `<li>` children.
		data.context.push( listItem );

		// `listItem`s created recursively should have bigger indent.
		data.indent++;

		// `listItem`s will be kept in flat structure.
		const items = new ModelDocumentFragment();
		items.appendChildren( listItem );

		// Check all children of the converted `<li>`.
		// At this point we assume there are no "whitespace" view text nodes in view list, between view list items.
		// This should be handled by `<ul>` and `<ol>` converters.
		for ( const child of data.input.getChildren() ) {
			// Let's convert the child.
			const converted = conversionApi.convertItem( child, consumable, data );

			// If this is a view list element, we will convert it and concat the result (`listItem` model elements)
			// with already gathered results (in `items` array). `converted` should be a `ModelDocumentFragment`.
			if ( child.name == 'ul' || child.name == 'ol' ) {
				items.appendChildren( Array.from( converted.getChildren() ) );
			}
			// If it was not a list it was a "regular" list item content. Just append it to `listItem`.
			else {
				modelWriter.insert( ModelPosition.createAt( listItem, 'end' ), converted );
			}
		}

		data.indent--;
		data.context.pop();

		data.output = items;
	}
}

/**
 * A view-to-model converter for `<ul>` and `<ol>` view elements that cleans the input view of garbage.
 * This is mostly to clean whitespaces from between `<li>` view elements inside the view list element, however, also
 * incorrect data can be cleared if the view was incorrect.
 *
 * @see module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/viewconsumable~ViewConsumable} consumable Values to consume.
 */
export function cleanList( evt, data, consumable ) {
	if ( consumable.test( data.input, { name: true } ) ) {
		// Caching children because when we start removing them iterating fails.
		const children = Array.from( data.input.getChildren() );

		for ( const child of children ) {
			if ( !child.is( 'li' ) ) {
				child.remove();
			}
		}
	}
}

/**
 * A view-to-model converter for `<li>` elements that cleans whitespace formatting from the input view.
 *
 * @see module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/viewconsumable~ViewConsumable} consumable Values to consume.
 */
export function cleanListItem( evt, data, consumable ) {
	if ( consumable.test( data.input, { name: true } ) ) {
		if ( data.input.childCount === 0 ) {
			return;
		}

		const children = [ ...data.input.getChildren() ];

		let foundList = false;
		let firstNode = true;

		for ( const child of children ) {
			if ( foundList && !child.is( 'ul' ) && !child.is( 'ol' ) ) {
				child.remove();
			}

			if ( child.is( 'text' ) ) {
				// If this is the first node and it's a text node, left-trim it.
				if ( firstNode ) {
					child.data = child.data.replace( /^\s+/, '' );
				}

				// If this is the last text node before <ul> or <ol>, right-trim it.
				if ( !child.nextSibling || ( child.nextSibling.is( 'ul' ) || child.nextSibling.is( 'ol' ) ) ) {
					child.data = child.data.replace( /\s+$/, '' );
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
 * Example:
 *
 *		<listItem type="bulleted" indent=0>Item 1</listItem>
 *		<listItem type="bulleted" indent=1>Item 2</listItem>   <--- this is removed.
 *		<listItem type="bulleted" indent=2>Item 3</listItem>
 *
 * Should become:
 *
 *		<listItem type="bulleted" indent=0>Item 1</listItem>
 *		<listItem type="bulleted" indent=1>Item 3</listItem>   <--- note that indent got post-fixed.
 *
 * @param {module:engine/model/document~Document} document The document to observe.
 * @returns {Function} A callback to be attached to the {@link module:engine/model/document~Document#event:change document change event}.
 */
export function modelChangePostFixer( document ) {
	return ( evt, type, changes, batch ) => {
		if ( batch.type == 'transparent' ) {
			return;
		}

		if ( type == 'remove' ) {
			const howMany = changes.range.end.offset - changes.range.start.offset;
			const sourcePos = changes.sourcePosition._getTransformedByInsertion( changes.range.start, howMany, true );

			// Fix list items after the cut-out range.
			// This fix is needed if items in model after cut-out range have now wrong indents compared to their previous siblings.
			_fixItemsIndent( sourcePos, document, batch );
			// This fix is needed if two different nested lists got merged, change types of list items "below".
			_fixItemsType( sourcePos, false, document, batch );
		} else if ( type == 'move' ) {
			const howMany = changes.range.end.offset - changes.range.start.offset;
			const sourcePos = changes.sourcePosition._getTransformedByInsertion( changes.range.start, howMany, true );

			// Fix list items after the cut-out range.
			// This fix is needed if items in model after cut-out range have now wrong indents compared to their previous siblings.
			_fixItemsIndent( sourcePos, document, batch );
			// This fix is needed if two different nested lists got merged, change types of list items "below".
			_fixItemsType( sourcePos, false, document, batch );

			// Fix items in moved range.
			// This fix is needed if inserted items are too deeply intended.
			_fixItemsIndent( changes.range.start, document, batch );
			// This fix is needed if one or more first inserted items have different type.
			_fixItemsType( changes.range.start, false, document, batch );

			// Fix list items after inserted range.
			// This fix is needed if items in model after inserted range have wrong indents.
			_fixItemsIndent( changes.range.end, document, batch );
			// This fix is needed if one or more last inserted items have different type.
			_fixItemsType( changes.range.end, true, document, batch );
		} else if ( type == 'rename' && changes.oldName == 'listItem' && changes.newName != 'listItem' ) {
			const element = changes.element;

			// Element name is changed from list to something else. Remove useless attributes.
			document.enqueueChanges( () => {
				batch.removeAttribute( element, 'indent' ).removeAttribute( element, 'type' );
			} );

			const changePos = ModelPosition.createAfter( changes.element );

			// Fix list items after the renamed element.
			// This fix is needed if there are items after renamed element, those items should start from indent = 0.
			_fixItemsIndent( changePos, document, batch );
		} else if ( type == 'insert' ) {
			// Fix list items in inserted range.
			// This fix is needed if inserted items are too deeply intended.
			_fixItemsIndent( changes.range.start, document, batch );
			// This fix is needed if one or more first inserted items have different type.
			_fixItemsType( changes.range.start, false, document, batch );

			// Fix list items after inserted range.
			// This fix is needed if items in model after inserted range have wrong indents.
			_fixItemsIndent( changes.range.end, document, batch );
			// This fix is needed if one or more last inserted items have different type.
			_fixItemsType( changes.range.end, true, document, batch );
		}
	};
}

// Helper function for post fixer callback. Performs fixing of model `listElement` items indent attribute. Checks the model at the
// `changePosition`. Looks at the node before position where change occurred and uses that node as a reference for following list items.
function _fixItemsIndent( changePosition, document, batch ) {
	let nextItem = changePosition.nodeAfter;

	if ( nextItem && nextItem.name == 'listItem' ) {
		document.enqueueChanges( () => {
			const prevItem = nextItem.previousSibling;
			// This is the maximum indent that following model list item may have.
			const maxIndent = prevItem && prevItem.is( 'listItem' ) ? prevItem.getAttribute( 'indent' ) + 1 : 0;

			// Check how much the next item needs to be outdented.
			let outdentBy = nextItem.getAttribute( 'indent' ) - maxIndent;
			const items = [];

			while ( nextItem && nextItem.name == 'listItem' && nextItem.getAttribute( 'indent' ) > maxIndent ) {
				if ( outdentBy > nextItem.getAttribute( 'indent' ) ) {
					outdentBy = nextItem.getAttribute( 'indent' );
				}

				const newIndent = nextItem.getAttribute( 'indent' ) - outdentBy;

				items.push( { item: nextItem, indent: newIndent } );

				nextItem = nextItem.nextSibling;
			}

			if ( items.length > 0 ) {
				// Since we are outdenting list items, it is safer to start from the last one (it will maintain correct model state).
				for ( const item of items.reverse() ) {
					batch.setAttribute( item.item, 'indent', item.indent );
				}
			}
		} );
	}
}

// Helper function for post fixer callback. Performs fixing of model nested `listElement` items type attribute.
// Checks the model at the `changePosition`. Looks at nodes after/before that position and changes those items type
// to the same as node before/after `changePosition`.
function _fixItemsType( changePosition, fixPrevious, document, batch ) {
	let item = changePosition[ fixPrevious ? 'nodeBefore' : 'nodeAfter' ];

	if ( !item || !item.is( 'listItem' ) || item.getAttribute( 'indent' ) === 0 ) {
		// !item - when last item got removed.
		// !item.is( 'listItem' ) - when first element to fix is not a list item already.
		// indent === 0 - do not fix if changes are done on top level lists.
		return;
	}

	document.enqueueChanges( () => {
		const refItem = _getBoundaryItemOfSameList( item, !fixPrevious );

		if ( !refItem || refItem == item ) {
			// !refItem - happens if first list item is inserted.
			// refItem == item - happens if last item is inserted.
			return;
		}

		const refIndent = refItem.getAttribute( 'indent' );
		const refType = refItem.getAttribute( 'type' );

		while ( item && item.is( 'listItem' ) && item.getAttribute( 'indent' ) >= refIndent ) {
			if ( item.getAttribute( 'type' ) != refType && item.getAttribute( 'indent' ) == refIndent ) {
				batch.setAttribute( item, 'type', refType );
			}

			item = item[ fixPrevious ? 'previousSibling' : 'nextSibling' ];
		}
	} );
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
 * @param {Array} args Arguments of {@link module:engine/controller/datacontroller~DataController#insertContent}.
 */
export function modelIndentPasteFixer( evt, [ content, selection ] ) {
	// Check whether inserted content starts from a `listItem`. If it does not, it means that there are some other
	// elements before it and there is no need to fix indents, because even if we insert that content into a list,
	// that list will be broken.
	// Note: we also need to handle singular elements because inserting item with indent 0 into 0,1,[],2
	// would create incorrect model.
	let item = content.is( 'documentFragment' ) ? content.getChild( 0 ) : content;

	if ( item.is( 'listItem' ) ) {
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
					item.setAttribute( 'indent', item.getAttribute( 'indent' ) + indentChange );

					item = item.nextSibling;
				}
			}
		}
	}
}

// Helper function that creates a `<ul><li></li></ul>` or (`<ol>`) structure out of given `modelItem` model `listItem` element.
// Then, it binds created view list item (<li>) with model `listItem` element.
// The function then returns created view list item (<li>).
function generateLiInUl( modelItem, mapper ) {
	const listType = modelItem.getAttribute( 'type' ) == 'numbered' ? 'ol' : 'ul';
	const viewItem = new ViewListItemElement();

	const viewList = new ViewContainerElement( listType, null );
	viewList.appendChildren( viewItem );

	mapper.bindElements( modelItem, viewItem );

	return viewItem;
}

// Helper function that seeks for a list item sibling of given model item (or position) which meets given criteria.
// `options` object may contain one or more of given values (by default they are `false`):
// `options.getNext` - whether next or previous siblings should be checked (default = previous)
// `options.checkAllSiblings` - whether all siblings or just the first one should be checked (default = only one),
// `options.sameIndent` - whether sought sibling should have same indent (default = no),
// `options.biggerIndent` - whether sought sibling should have bigger indent (default = no).
// `options.smallerIndent` - whether sought sibling should have smaller indent (default = no).
// `options.isMapped` - whether sought sibling must be mapped to view (default = no).
// `options.mapper` - used to map model elements when `isMapped` option is set to true.
// `options.indent` - used as reference item when first parameter is a position
// Either `options.sameIndent` or `options.biggerIndent` should be set to `true`.
function getSiblingListItem( modelItemOrPosition, options ) {
	const direction = options.getNext ? 'nextSibling' : 'previousSibling';
	const posDirection = options.getNext ? 'nodeAfter' : 'nodeBefore';
	const checkAllSiblings = !!options.checkAllSiblings;
	const sameIndent = !!options.sameIndent;
	const biggerIndent = !!options.biggerIndent;
	const smallerIndent = !!options.smallerIndent;
	const isMapped = !!options.isMapped;

	const indent = modelItemOrPosition instanceof ModelElement ? modelItemOrPosition.getAttribute( 'indent' ) : options.indent;
	let item = modelItemOrPosition instanceof ModelElement ? modelItemOrPosition[ direction ] : modelItemOrPosition[ posDirection ];

	while ( item && item.name == 'listItem' ) {
		const itemIndent = item.getAttribute( 'indent' );

		if (
			( sameIndent && indent == itemIndent ) ||
			( biggerIndent && indent < itemIndent ) ||
			( smallerIndent && indent > itemIndent )
		) {
			if ( !isMapped || options.mapper.toViewElement( item ) ) {
				return item;
			} else {
				item = item[ direction ];

				continue;
			}
		}

		if ( !checkAllSiblings ) {
			return null;
		}

		item = item[ direction ];
	}

	return null;
}

// Helper function that takes two parameters, that are expected to be view list elements, and merges them.
// The merge happen only if both parameters are UL or OL elements.
function mergeViewLists( firstList, secondList ) {
	if ( firstList && secondList && ( firstList.name == 'ul' || firstList.name == 'ol' ) && firstList.name == secondList.name ) {
		return viewWriter.mergeContainers( ViewPosition.createAfter( firstList ) );
	}

	return null;
}

// Helper function that takes model list item element `modelItem`, corresponding view list item element `injectedItem`
// that is not added to the view and is inside a view list element (`ul` or `ol`) and is that's list only child.
// The list is inserted at correct position (element breaking may be needed) and then merged with it's siblings.
// See comments below to better understand the algorithm.
function injectViewList( modelItem, injectedItem, mapper, removePosition ) {
	const injectedList = injectedItem.parent;

	// Position where view list will be inserted.
	let insertPosition;

	// 1. Find previous list item that has same or smaller indent. Basically we are looking for a first model item
	// that is "parent" or "sibling" if injected model item.
	// If there is no such list item, it means that injected list item is the first item in "its list".
	let prevItem = getSiblingListItem( modelItem, { sameIndent: true, smallerIndent: true, checkAllSiblings: true } );

	if ( prevItem && prevItem.getAttribute( 'indent' ) == modelItem.getAttribute( 'indent' ) ) {
		// There is a list item with same indent - we found same-level sibling.
		// Break the list after it. Inserted view item will be inserted in the broken space.
		const viewItem = mapper.toViewElement( prevItem );
		insertPosition = viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );
	} else {
		// There is no list item with same indent. Check previous model item.
		prevItem = modelItem.previousSibling;

		if ( prevItem && prevItem.name == 'listItem' ) {
			// // If it is a list item, it has to have lower indent.
			// // It means that inserted item should be added to it as its nested item.
			// insertPosition = mapper.toViewPosition( ModelPosition.createAt( prevItem, 'end' ) );
			// ^ ACTUALLY NOT BECAUSE FIXING DOES NOT WORK PROPERLY.
			// TODO: fix this part of code when conversion from model to view is done on `changesDone` event or post/prefixing is better.
			if ( prevItem.getAttribute( 'indent' ) < modelItem.getAttribute( 'indent' ) ) {
				// Lower indent, correct model, previous item is a parent and this model item is its nested item.
				insertPosition = mapper.toViewPosition( ModelPosition.createAt( prevItem, 'end' ) );
			} else {
				// Higher indent, incorrect model that is probably being fixed. Inject the view list where it was.
				// TODO: get rid of `removePosition` when conversion is done on `changesDone`.
				if ( removePosition.parent.is( 'ul' ) || removePosition.parent.is( 'ol' ) ) {
					insertPosition = viewWriter.breakContainer( removePosition );
				} else {
					insertPosition = removePosition;
				}
			}
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
	// We have to check if next list item in model has bigger indent. If it has, it means that it and possibly
	// some following list items should be nested in the injected view item.
	// Look only after model elements that are already mapped to view. Some following model items might not be mapped
	// if multiple items in model were inserted/moved at once.
	const nextItem = getSiblingListItem(
		modelItem,
		{ biggerIndent: true, getNext: true, isMapped: true, mapper }
	);

	if ( nextItem ) {
		const viewItem = mapper.toViewElement( nextItem );

		// Break the list between found view item and its preceding `<li>`s.
		viewWriter.breakContainer( ViewPosition.createBefore( viewItem ) );

		// The broken ("lower") part will be moved as nested children of the inserted view item.
		const sourceStart = ViewPosition.createBefore( viewItem.parent );

		const lastModelItem = _getBoundaryItemOfSameList( nextItem, false );
		const lastViewItem = mapper.toViewElement( lastModelItem );
		const sourceEnd = viewWriter.breakContainer( ViewPosition.createAfter( lastViewItem ) );
		const sourceRange = new ViewRange( sourceStart, sourceEnd );

		const targetPosition = ViewPosition.createAt( injectedItem, 'end' );
		viewWriter.move( sourceRange, targetPosition );
	}

	// Merge inserted view list with its possible neighbour lists.
	mergeViewLists( injectedList, injectedList.nextSibling );
	mergeViewLists( injectedList.previousSibling, injectedList );
}

// Helper function that takes all children of given `viewRemovedItem` and moves them in a correct place, according
// to other given parameters.
function hoistNestedLists( nextIndent, modelRemoveStartPosition, viewRemoveStartPosition, viewRemovedItem, mapper ) {
	// Find correct previous model list item element.
	// The element has to have either same or smaller indent than given reference indent.
	// This will be the model element which will get nested items (if it has smaller indent) or sibling items (if it has same indent).
	// Keep in mind that such element might not be found, if removed item was the first item.
	const prevModelItem = getSiblingListItem( modelRemoveStartPosition, {
		sameIndent: true,
		smallerIndent: true,
		checkAllSiblings: true,
		indent: nextIndent
	} );

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

			mergeViewLists( child, child.nextSibling );
			mergeViewLists( child.previousSibling, child );
		}
	}
}

// Helper function to obtain the first or the last model list item which is in on the same indent level as given `item`.
function _getBoundaryItemOfSameList( item, getFirst ) {
	const indent = item.getAttribute( 'indent' );
	const direction = getFirst ? 'previousSibling' : 'nextSibling';

	let result = item;

	while ( item[ direction ] && item[ direction ].is( 'listItem' ) && item[ direction ].getAttribute( 'indent' ) >= indent ) {
		item = item[ direction ];

		if ( item.getAttribute( 'indent' ) == indent ) {
			result = item;
		}
	}

	return result;
}

// Helper function that for given `view.Position`, returns a `view.Position` that is after all `view.UIElement`s that
// are after given position.
// For example:
// <container:p>foo^<ui:span></ui:span><ui:span></ui:span>bar</contain:p>
// For position ^, a position before "bar" will be returned.
function positionAfterUiElements( viewPosition ) {
	return viewPosition.getLastMatchingPosition( value => value.item.is( 'uiElement' ) );
}
