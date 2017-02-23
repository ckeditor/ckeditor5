/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/converters
 */

import ViewListItemElement from './viewlistitemelement';

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';

/**
 * Model to view converter for `listItem` model element insertion.
 *
 * It creates `<ul><li></li><ul>` (or `<ol>`) view structure out of `listItem` model element, inserts it at correct
 * position, and merges the list with surrounding lists (if able).
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:insert
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
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

	injectViewList( modelItem, viewItem, conversionApi.mapper );
}

/**
 * Model to view converter for `type` attribute change on `listItem` model element.
 *
 * This change means that `<li>`s parent changes from `<ul>` to `<ol>` (or vice versa). This is accomplished by breaking
 * view elements, changing their name and merging them.
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:changeAttribute
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
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
 * Model to view converter for `listItem` model element remove.
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:remove
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewRemove( evt, data, consumable, conversionApi ) {
	if ( !consumable.consume( data.item, 'remove' ) ) {
		return;
	}

	const viewItem = conversionApi.mapper.toViewElement( data.item );

	// 1. Break the container after and before the list item.
	// This will create a view list with one view list item -- the one that changed type.
	viewWriter.breakContainer( ViewPosition.createBefore( viewItem ) );
	viewWriter.breakContainer( ViewPosition.createAfter( viewItem ) );

	// 2. Remove the UL that contains just the removed LI.
	const viewList = viewItem.parent;
	viewWriter.remove( ViewRange.createOn( viewList ) );
}

/**
 * Model to view converter for `indent` attribute change on `listItem` model element.
 *
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:changeAttribute
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewChangeIndent( evt, data, consumable, conversionApi ) {
	/* istanbul ignore if */ // Part of code connected with indenting that is not yet complete.
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

	viewWriter.remove( ViewRange.createOn( viewList ) );

	// If there is no `viewListPrev` it means that the first item was indented which is an error.
	mergeViewLists( viewListPrev, viewListPrev.nextSibling );

	// 3. Inject view list like it is newly inserted.
	injectViewList( data.item, viewItem, conversionApi.mapper );
}

/**
 * A special model to view converter introduced by {@link module:list/list~List List feature}. This converter is fired for
 * insert change of every model item, and should be fired before actual converter. The converter checks whether inserted
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
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewSplitOnInsert( evt, data, consumable, conversionApi ) {
	if ( data.item.name != 'listItem' ) {
		let viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		// Break multiple ULs/OLs if there are.
		while ( viewPosition.parent.name == 'ul' || viewPosition.parent.name == 'ol' ) {
			viewPosition = viewWriter.breakContainer( viewPosition );

			/* istanbul ignore else */ // Part of code connected with indenting that is not yet complete.
			if ( viewPosition.parent.parent === null ) {
				break;
			}

			/* istanbul ignore next */ // Part of code connected with indenting that is not yet complete.
			viewPosition = ViewPosition.createBefore( viewPosition.parent );
		}
	}
}

/**
 * A special model to view converter introduced by {@link module:list/list~List List feature}. This converter takes care of
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
 * @see module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:move
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface.
 */
export function modelViewMergeAfter( evt, data, consumable, conversionApi ) {
	const viewPosition = conversionApi.mapper.toViewPosition( data.sourcePosition );
	const viewItemPrev = viewPosition.nodeBefore;
	const viewItemNext = viewPosition.nodeAfter;

	// Merge lists if something (remove, move) was done from inside of list.
	// Merging will be done only if both items are view lists of the same type.
	// The check is done inside the helper function.
	mergeViewLists( viewItemPrev, viewItemNext );
}

/**
 * View to model converter that converts view `<li>` elements into `listItem` model elements.
 *
 * To set correct values of `type` and `indent` attribute the converter:
 * * checks `<li>`'s parent,
 * * passes `data.indent` value when `<li>`'s sub-items are converted.
 *
 * @see module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/viewconsumable~ViewConsumable} consumable Values to consume.
 * @param {Object} conversionApi Conversion interface to be used by callback.
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

		// `listItem`s created recursievly should have bigger indent.
		data.indent++;

		// `listItem`s will be kept in flat structure.
		let items = [ listItem ];

		// Check all children of the converted `<li>`.
		// At this point we assume there are no "whitespace" view text nodes in view list, between view list items.
		// This should be handled by `<ul>` and `<ol>` converters.
		for ( let child of data.input.getChildren() ) {
			// Let's convert the child.
			const converted = conversionApi.convertItem( child, consumable, data );

			// If this is a view list element, we will convert it and concat the result (`listItem` model elements)
			// with already gathered results (in `items` array). `converted` should be a `ModelDocumentFragment`.
			if ( child.name == 'ul' || child.name == 'ol' ) {
				items = items.concat( Array.from( converted.getChildren() ) );
			}
			// If it was not a list it was a "regular" list item content. Just append it to `listItem`.
			else {
				listItem.appendChildren( converted );
			}
		}

		data.indent--;
		data.context.pop();

		/* istanbul ignore next */ // Part of code connected with indenting that is not yet complete.
		data.output = data.output ? data.output.concat( items ) : items;
	}
}

/**
 * View to model converter for `<ul>` and `<ol>` view elements, that cleans the input view out of garbage.
 * This is mostly to clean white spaces from between `<li>` view elements inside the view list element, however also
 * incorrect data can be cleared if the view was incorrect.
 *
 * @see module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Object containing conversion input and a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/viewconsumable~ViewConsumable} consumable Values to consume.
 */
export function cleanList( evt, data, consumable ) {
	if ( consumable.test( data.input, { name: true } ) ) {
		// Caching children because when we start removing them iterating fails.
		const children = Array.from( data.input.getChildren() );

		for ( let child of children ) {
			if ( !child.name || child.name != 'li' ) {
				child.remove();
			}
		}
	}
}

/**
 * Callback for model position to view position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes positions
 * between `listItem` elements, that would be incorrectly mapped because of how list items are represented in model
 * and view.
 *
 * @see module:engine/conversion/mapper~Mapper#event:modelToViewPosition
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Object containing additional data and placeholder for mapping result.
 */
export function modelToViewPosition( evt, data ) {
	if ( data.viewPosition.parent.name == 'li' && data.modelPosition.parent.name != 'listItem' ) {
		data.viewPosition = ViewPosition.createBefore( data.viewPosition.parent );

		evt.stop();
	}
}

/**
 * Callback for view position to model position mapping for {@link module:engine/conversion/mapper~Mapper}. The callback fixes positions
 * between `<li>` elements, that would be incorrectly mapped because of how list items are represented in model
 * and view.
 *
 * @see module:engine/conversion/mapper~Mapper#event:viewToModelPosition
 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
 * @param {Object} data Object containing additional data and placeholder for mapping result.
 */
export function viewToModelPosition( evt, data ) {
	const viewPosition = data.viewPosition;
	const mapper = data.mapper;
	const nodeAfter = viewPosition.nodeAfter;
	const nodeBefore = viewPosition.nodeBefore;

	let modelNode;

	if ( nodeAfter ) {
		if ( nodeAfter.name == 'ul' || nodeAfter.name == 'ol' ) {
			// If the position is before view list, model position should be placed before `listItem`
			// that is bound to the first `<li>` of that view list.
			// Default algorithm would work like this but only for top-level list.
			modelNode = mapper.toModelElement( nodeAfter.getChild( 0 ) );
		} else if ( nodeAfter.name == 'li' ) {
			// If the position is before view list item, just place model position before bound `listItem` element.
			modelNode = mapper.toModelElement( nodeAfter );
		}

		if ( modelNode ) {
			data.modelPosition = ModelPosition.createBefore( modelNode );
		}
	} else if ( nodeBefore ) {
		let viewNode;

		// Find `<li>` after which we want to place position.
		// We want to find a `<li>` that will be mapped to model `listItem` element. That `listItem` will
		// be used as a reference point to evaluate model position.
		/* istanbul ignore if */ // Part of code connected with indenting that is not yet complete.
		if ( nodeBefore.name == 'ul' || nodeBefore.name == 'ol' ) {
			// If the position is before view list, take the last `<li>` of that view list.
			viewNode = nodeBefore.getChild( nodeBefore.childCount - 1 );
		} else if ( nodeBefore.name == 'li' ) {
			// If the position is before view list item, take that `<li>`.
			viewNode = nodeBefore;
		}

		// Evaluate correct model position.
		// At this stage we have a `<li>`. This `<li>` may have nested `<li>`s inside. We will use `mapper`
		// to obtain this `<li>`'s model length. Placing model position after that `<li>` will be done
		// by placing it before the bound `listItem` and moving by offset equal to `<li>`s length.
		if ( viewNode ) {
			modelNode = mapper.toModelElement( viewNode );
			const offset = mapper.getModelLength( viewNode );

			data.modelPosition = ModelPosition.createBefore( modelNode ).getShiftedBy( offset );
		}
	}

	// If we found a model position, stop the event.
	if ( data.modelPosition !== null ) {
		evt.stop();
	}
}

// Helper function that creates a `<ul><li></li></ul>` structure out of given `modelItem` model `listItem` element.
// Then, it binds created view list item (LI) with model `listItem` element.
// The function then returns created view list item (LI).
function generateLiInUl( modelItem, mapper ) {
	const listType = modelItem.getAttribute( 'type' ) == 'numbered' ? 'ol' : 'ul';
	const viewItem = new ViewListItemElement();

	const viewList = new ViewContainerElement( listType, null );
	viewList.appendChildren( viewItem );

	mapper.bindElements( modelItem, viewItem );

	return viewItem;
}

// Helper function that seeks for a sibling of given `modelItem` that is a `listItem` element and meets given criteria.
// `options` object may contain one or more of given values (by default they are `false`):
// `options.getNext` - whether next or previous siblings should be checked (default = previous)
// `options.checkAllSiblings` - whether all siblings or just the first one should be checked (default = only one),
// `options.sameIndent` - whether sought sibling should have same indent (default = no),
// `options.biggerIndent` - whether sought sibling should have bigger indent (default = no).
// Either `options.sameIndent` or `options.biggerIndent` should be set to `true`.
function getSiblingListItem( modelItem, options ) {
	const direction = options.getNext ? 'nextSibling' : 'previousSibling';
	const checkAllSiblings = !!options.checkAllSiblings;
	const sameIndent = !!options.sameIndent;
	const biggerIndent = !!options.biggerIndent;

	const indent = modelItem.getAttribute( 'indent' );

	let item = modelItem[ direction ];

	while ( item && item.name == 'listItem' ) {
		let itemIndent = item.getAttribute( 'indent' );

		if ( sameIndent && indent == itemIndent || biggerIndent && indent < itemIndent ) {
			return item;
		} else if ( !checkAllSiblings || indent > itemIndent ) {
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
		viewWriter.mergeContainers( ViewPosition.createAfter( firstList ) );
	}
}

// Helper function that takes model list item element `modelItem`, corresponding view list item element `injectedItem`
// that is not added to the view and is inside a view list element (`ul` or `ol`) and is that's list only child.
// The list is inserted at correct position (element breaking may be needed) and then merged with it's siblings.
// See comments below to better understand the algorithm.
function injectViewList( modelItem, injectedItem, mapper ) {
	const injectedList = injectedItem.parent;

	// 1. Break after previous `listItem` if it has same or bigger indent.
	const prevModelItem = getSiblingListItem( modelItem, { sameIndent: true, biggerIndent: true } );

	if ( prevModelItem ) {
		let viewItem = mapper.toViewElement( prevModelItem );
		let viewPosition = ViewPosition.createAfter( viewItem );
		viewWriter.breakContainer( viewPosition );
	}

	// 2. Break after closest previous `listItem` sibling with same indent.
	const sameIndentModelItem = getSiblingListItem( modelItem, { sameIndent: true, checkAllSiblings: true } );
	// Position between broken lists will be a place where new list is inserted.
	// If there is nothing to break (`sameIndentModelItem` is falsy) it means that converted list item
	// is (will be) the first list item.
	let insertionPosition;

	if ( sameIndentModelItem ) {
		let viewItem = mapper.toViewElement( sameIndentModelItem );
		let viewPosition = ViewPosition.createAfter( viewItem );
		insertionPosition = viewWriter.breakContainer( viewPosition );
	} else {
		// If there is a list item before converted list item, it means that that list item has lower indent.
		// In such case the created view list should be appended as a child of that item.
		const prevSibling = modelItem.previousSibling;

		if ( prevSibling && prevSibling.name == 'listItem' ) {
			insertionPosition = ViewPosition.createAt( mapper.toViewElement( prevSibling ), 'end' );
		} else {
			// This is the very first list item, use position mapping to get correct insertion position.
			insertionPosition = mapper.toViewPosition( ModelPosition.createBefore( modelItem ) );
		}
	}

	// 3. Append new UL/OL in position after breaking in step 2.
	viewWriter.insert( insertionPosition, injectedList );

	// 4. If next sibling is list item with bigger indent, append it's UL/OL to new LI.
	const nextModelItem = getSiblingListItem( modelItem, { getNext: true, biggerIndent: true } );
	const nextViewItem = mapper.toViewElement( nextModelItem );

	/* istanbul ignore if */ // Part of code connected with indenting that is not yet complete.
	if ( nextViewItem ) {
		let sourceRange = ViewRange.createOn( nextViewItem.parent );
		let targetPosition = ViewPosition.createAt( injectedItem, 'end' );
		viewWriter.move( sourceRange, targetPosition );
	}

	// 5. Merge new UL/OL with above and below items (ULs/OLs or LIs).
	mergeViewLists( injectedList, injectedList.nextSibling );
	mergeViewLists( injectedList.previousSibling, injectedList );
}
