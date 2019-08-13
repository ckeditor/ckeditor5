/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/utils
 */

import { getFillerOffset } from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * Creates a list item {@link module:engine/view/containerelement~ContainerElement}.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The writer instance.
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createViewListItemElement( writer ) {
	const viewItem = writer.createContainerElement( 'li' );

	viewItem.getFillerOffset = getListItemFillerOffset;

	return viewItem;
}

/**
 * Helper function that creates a `<ul><li></li></ul>` or (`<ol>`) structure out of given `modelItem` model `listItem` element.
 * Then, it binds created view list item (<li>) with model `listItem` element.
 * The function then returns created view list item (<li>).
 *
 * @param {module:engine/model/item~Item} modelItem Model list item.
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface.
 * @returns {module:engine/view/containerelement~ContainerElement} View list element.
 */
export function generateLiInUl( modelItem, conversionApi ) {
	const mapper = conversionApi.mapper;
	const viewWriter = conversionApi.writer;
	const listType = modelItem.getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';
	const viewItem = createViewListItemElement( viewWriter );

	const viewList = viewWriter.createContainerElement( listType, null );

	viewWriter.insert( viewWriter.createPositionAt( viewList, 0 ), viewItem );

	mapper.bindElements( modelItem, viewItem );

	return viewItem;
}

/**
 * Helper function that takes model list item element `modelItem`, corresponding view list item element `injectedItem`
 * that is not added to the view and is inside a view list element (`ul` or `ol`) and is that's list only child.
 * The list is inserted at correct position (element breaking may be needed) and then merged with it's siblings.
 * See comments below to better understand the algorithm.
 *
 * @param {module:engine/view/item~Item} modelItem Model list item.
 * @param {module:engine/view/containerelement~ContainerElement} injectedItem
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface.
 * @param {module:engine/model/model~Model} model The model instance.
 */
export function injectViewList( modelItem, injectedItem, conversionApi, model ) {
	const injectedList = injectedItem.parent;
	const mapper = conversionApi.mapper;
	const viewWriter = conversionApi.writer;

	// Position where view list will be inserted.
	let insertPosition = mapper.toViewPosition( model.createPositionBefore( modelItem ) );

	// 1. Find previous list item that has same or smaller indent. Basically we are looking for a first model item
	// that is "parent" or "sibling" of injected model item.
	// If there is no such list item, it means that injected list item is the first item in "its list".
	const refItem = getSiblingListItem( modelItem.previousSibling, {
		sameIndent: true,
		smallerIndent: true,
		listIndent: modelItem.getAttribute( 'listIndent' )
	} );
	const prevItem = modelItem.previousSibling;

	if ( refItem && refItem.getAttribute( 'listIndent' ) == modelItem.getAttribute( 'listIndent' ) ) {
		// There is a list item with same indent - we found same-level sibling.
		// Break the list after it. Inserted view item will be inserted in the broken space.
		const viewItem = mapper.toViewElement( refItem );
		insertPosition = viewWriter.breakContainer( viewWriter.createPositionAfter( viewItem ) );
	} else {
		// There is no list item with same indent. Check previous model item.
		if ( prevItem && prevItem.name == 'listItem' ) {
			// If it is a list item, it has to have lower indent.
			// It means that inserted item should be added to it as its nested item.
			insertPosition = mapper.toViewPosition( model.createPositionAt( prevItem, 'end' ) );
		} else {
			// Previous item is not a list item (or does not exist at all).
			// Just map the position and insert the view item at mapped position.
			insertPosition = mapper.toViewPosition( model.createPositionBefore( modelItem ) );
		}
	}

	insertPosition = positionAfterUiElements( insertPosition );

	// Insert the view item.
	viewWriter.insert( insertPosition, injectedList );

	// 2. Handle possible children of injected model item.
	if ( prevItem && prevItem.name == 'listItem' ) {
		const prevView = mapper.toViewElement( prevItem );

		const walkerBoundaries = viewWriter.createRange( viewWriter.createPositionAt( prevView, 0 ), insertPosition );
		const walker = walkerBoundaries.getWalker( { ignoreElementEnd: true } );

		for ( const value of walker ) {
			if ( value.item.is( 'li' ) ) {
				const breakPosition = viewWriter.breakContainer( viewWriter.createPositionBefore( value.item ) );
				const viewList = value.item.parent;

				const targetPosition = viewWriter.createPositionAt( injectedItem, 'end' );
				mergeViewLists( viewWriter, targetPosition.nodeBefore, targetPosition.nodeAfter );
				viewWriter.move( viewWriter.createRangeOn( viewList ), targetPosition );

				walker.position = breakPosition;
			}
		}
	} else {
		const nextViewList = injectedList.nextSibling;

		if ( nextViewList && ( nextViewList.is( 'ul' ) || nextViewList.is( 'ol' ) ) ) {
			let lastSubChild = null;

			for ( const child of nextViewList.getChildren() ) {
				const modelChild = mapper.toModelElement( child );

				if ( modelChild && modelChild.getAttribute( 'listIndent' ) > modelItem.getAttribute( 'listIndent' ) ) {
					lastSubChild = child;
				} else {
					break;
				}
			}

			if ( lastSubChild ) {
				viewWriter.breakContainer( viewWriter.createPositionAfter( lastSubChild ) );
				viewWriter.move( viewWriter.createRangeOn( lastSubChild.parent ), viewWriter.createPositionAt( injectedItem, 'end' ) );
			}
		}
	}

	// Merge inserted view list with its possible neighbour lists.
	mergeViewLists( viewWriter, injectedList, injectedList.nextSibling );
	mergeViewLists( viewWriter, injectedList.previousSibling, injectedList );
}

/**
 * Helper function that takes two parameters, that are expected to be view list elements, and merges them.
 * The merge happen only if both parameters are list elements of the same types (the same element name and the same class attributes).
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter The writer instance.
 * @param {module:engine/view/item~Item} firstList First element o compare.
 * @param {module:engine/view/item~Item} secondList Second parameter to compare.
 * @returns {module:engine/view/position~Position|null} Position after merge or `null` when there was no merge.
 */
export function mergeViewLists( viewWriter, firstList, secondList ) {
	// Check if two lists are going to be merged.
	if ( !firstList || !secondList || ( firstList.name != 'ul' && firstList.name != 'ol' ) ) {
		return null;
	}

	// Both parameters are list elements, so compare types now.
	if ( firstList.name != secondList.name || firstList.getAttribute( 'class' ) !== secondList.getAttribute( 'class' ) ) {
		return null;
	}

	return viewWriter.mergeContainers( viewWriter.createPositionAfter( firstList ) );
}

/**
 * Helper function that for given `view.Position`, returns a `view.Position` that is after all `view.UIElement`s that
 * are after given position.
 *
 * For example:
 * `<container:p>foo^<ui:span></ui:span><ui:span></ui:span>bar</container:p>`
 * For position ^, a position before "bar" will be returned.
 *
 * @param {module:engine/view/position~Position} viewPosition
 * @returns {module:engine/view/position~Position}
 */
export function positionAfterUiElements( viewPosition ) {
	return viewPosition.getLastMatchingPosition( value => value.item.is( 'uiElement' ) );
}

/**
 * Helper function that seeks for a previous list item sibling of given model item which meets given criteria
 * passed by an options object.
 *
 * @param {module:engine/model/item~Item} modelItem
 * @param {Object} options Search criteria.
 * @param {Boolean} [options.sameIndent=false] Whether sought sibling should have same indent.
 * @param {Boolean} [options.smallerIndent=false] Whether sought sibling should have smaller indent.
 * @param {Number} [options.listIndent] The reference indent.
 * @returns {module:engine/model/item~Item|null}
 */
export function getSiblingListItem( modelItem, options ) {
	const sameIndent = !!options.sameIndent;
	const smallerIndent = !!options.smallerIndent;
	const indent = options.listIndent;

	let item = modelItem;

	while ( item && item.name == 'listItem' ) {
		const itemIndent = item.getAttribute( 'listIndent' );

		if ( ( sameIndent && indent == itemIndent ) || ( smallerIndent && indent > itemIndent ) ) {
			return item;
		}

		item = item.previousSibling;
	}

	return null;
}

export function findInRange( range, comparator ) {
	for ( const item of range.getItems() ) {
		const result = comparator( item );

		if ( result ) {
			return result;
		}
	}
}

/**
 * Helper method for creating an UI button and linking it with an appropriate command.
 *
 * @private
 * @param {module:core/editor/editor~Editor} editor The editor instance to which UI component will be added.
 * @param {String} commandName The name of the command.
 * @param {Object} label The button label.
 * @param {String} icon The source of the icon.
 */
export function createUIComponent( editor, commandName, label, icon ) {
	editor.ui.componentFactory.add( commandName, locale => {
		const command = editor.commands.get( commandName );
		const buttonView = new ButtonView( locale );

		buttonView.set( {
			label,
			icon,
			tooltip: true,
			isToggleable: true
		} );

		// Bind button model to command.
		buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		// Execute command.
		buttonView.on( 'execute', () => editor.execute( commandName ) );

		return buttonView;
	} );
}

// Implementation of getFillerOffset for view list item element.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getListItemFillerOffset() {
	const hasOnlyLists = !this.isEmpty && ( this.getChild( 0 ).name == 'ul' || this.getChild( 0 ).name == 'ol' );

	if ( this.isEmpty || hasOnlyLists ) {
		return 0;
	}

	return getFillerOffset.call( this );
}
