/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/listcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The list command. It is used by the {@link module:list/list~List list feature}.
 *
 * @extends module:core/command~Command
 */
export default class ListCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {'numbered'|'bulleted'} type List type that will be handled by this command.
	 */
	constructor( editor, type ) {
		super( editor );

		/**
		 * The type of the list created by the command.
		 *
		 * @readonly
		 * @member {'numbered'|'bulleted'}
		 */
		this.type = type == 'bulleted' ? 'bulleted' : 'numbered';

		/**
		 * A flag indicating whether the command is active, which means that the selection starts in a list of the same type.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps.
	 * A new batch will be created if this option is not set.
	 */
	execute( options = {} ) {
		const document = this.editor.document;
		const blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => checkCanBecomeListItem( block, document.schema ) );

		// Whether we are turning off some items.
		const turnOff = this.value === true;
		// If we are turning off items, we are going to rename them to paragraphs.

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();

			// If part of a list got turned off, we need to handle (outdent) all of sub-items of the last turned-off item.
			// To be sure that model is all the time in a good state, we first fix items below turned-off item.
			if ( turnOff ) {
				// Start from the model item that is just after the last turned-off item.
				let next = blocks[ blocks.length - 1 ].nextSibling;
				let currentIndent = Number.POSITIVE_INFINITY;
				let changes = [];

				// Correct indent of all items after the last turned off item.
				// Rules that should be followed:
				// 1. All direct sub-items of turned-off item should become indent 0, because the first item after it
				//    will be the first item of a new list. Other items are at the same level, so should have same 0 index.
				// 2. All items with indent lower than indent of turned-off item should become indent 0, because they
				//    should not end up as a child of any of list items that they were not children of before.
				// 3. All other items should have their indent changed relatively to it's parent.
				//
				// For example:
				// 1  * --------
				// 2     * --------
				// 3        * --------			<-- this is turned off.
				// 4           * --------		<-- this has to become indent = 0, because it will be first item on a new list.
				// 5              * --------	<-- this should be still be a child of item above, so indent = 1.
				// 6        * --------			<-- this has to become indent = 0, because it should not be a child of any of items above.
				// 7           * --------		<-- this should be still be a child of item above, so indent = 1.
				// 8     * --------				<-- this has to become indent = 0.
				// 9        * --------			<-- this should still be a child of item above, so indent = 1.
				// 10          * --------		<-- this should still be a child of item above, so indent = 2.
				// 11          * --------		<-- this should still be at the same level as item above, so indent = 2.
				// 12 * --------				<-- this and all below are left unchanged.
				// 13    * --------
				// 14       * --------
				//
				// After turning off 3 the list becomes:
				//
				// 1  * --------
				// 2     * --------
				//
				// 3  --------
				//
				// 4  * --------
				// 5     * --------
				// 6  * --------
				// 7     * --------
				// 8  * --------
				// 9     * --------
				// 10       * --------
				// 11       * --------
				// 12 * --------
				// 13    * --------
				// 14       * --------
				//
				// Thanks to this algorithm no lists are mismatched and no items get unexpected children/parent, while
				// those parent-child connection which are possible to maintain are still maintained. It's worth noting
				// that this is the same effect that we would be get by multiple use of outdent command. However doing
				// it like this is much more efficient because it's less operation (less memory usage, easier OT) and
				// less conversion (faster).
				while ( next && next.name == 'listItem' && next.getAttribute( 'indent' ) !== 0 ) {
					// Check each next list item, as long as its indent is bigger than 0.
					// If the indent is 0 we are not going to change anything anyway.
					const indent = next.getAttribute( 'indent' );

					// We check if that's item indent is lower as current relative indent.
					if ( indent < currentIndent ) {
						// If it is, current relative indent becomes that indent.
						currentIndent = indent;
					}

					// Fix indent relatively to current relative indent.
					// Note, that if we just changed the current relative indent, the newIndent will be equal to 0.
					const newIndent = indent - currentIndent;

					// Save the entry in changes array. We do not apply it at the moment, because we will need to
					// reverse the changes so the last item is changed first.
					// This is to keep model in correct state all the time.
					changes.push( { element: next, indent: newIndent } );

					// Find next item.
					next = next.nextSibling;
				}

				changes = changes.reverse();

				for ( const item of changes ) {
					batch.setAttribute( item.element, 'indent', item.indent );
				}
			}

			// If we are turning on, we might change some items that are already `listItem`s but with different type.
			// Changing one nested list item to other type should also trigger changing all its siblings so the
			// whole nested list is of the same type.
			// Example (assume changing to numbered list):
			// * ------				<-- do not fix, top level item
			//   * ------			<-- fix, because latter list item of this item's list is changed
			//      * ------		<-- do not fix, item is not affected (different list)
			//   * ------			<-- fix, because latter list item of this item's list is changed
			//      * ------		<-- fix, because latter list item of this item's list is changed
			//      * ---[--		<-- already in selection
			//   * ------			<-- already in selection
			//   * ------			<-- already in selection
			// * ------				<-- already in selection, but does not cause other list items to change because is top-level
			//   * ---]--			<-- already in selection
			//   * ------			<-- fix, because preceding list item of this item's list is changed
			//      * ------		<-- do not fix, item is not affected (different list)
			// * ------				<-- do not fix, top level item
			if ( !turnOff ) {
				// Find lowest indent among selected items. This will be indicator what is the indent of
				// top-most list affected by the command.
				let lowestIndent = Number.POSITIVE_INFINITY;

				for ( const item of blocks ) {
					if ( item.is( 'listItem' ) && item.getAttribute( 'indent' ) < lowestIndent ) {
						lowestIndent = item.getAttribute( 'indent' );
					}
				}

				// Do not execute the fix for top-level lists.
				lowestIndent = lowestIndent === 0 ? 1 : lowestIndent;

				// Fix types of list items that are "before" the selected blocks.
				_fixType( blocks, true, lowestIndent );

				// Fix types of list items that are "after" the selected blocks.
				_fixType( blocks, false, lowestIndent );
			}

			// Phew! Now it will be easier :).
			// For each block element that was in the selection, we will either: turn it to list item,
			// turn it to paragraph, or change it's type. Or leave it as it is.
			// Do it in reverse as there might be multiple blocks (same as with changing indents).
			for ( const element of blocks.reverse() ) {
				if ( turnOff && element.name == 'listItem' ) {
					// We are turning off and the element is a `listItem` - it should be converted to `paragraph`.
					// List item specific attributes are removed by post fixer.
					batch.rename( element, 'paragraph' );
				} else if ( !turnOff && element.name != 'listItem' ) {
					// We are turning on and the element is not a `listItem` - it should be converted to `listItem`.
					// The order of operations is important to keep model in correct state.
					batch.setAttribute( element, 'type', this.type ).setAttribute( element, 'indent', 0 ).rename( element, 'listItem' );
				} else if ( !turnOff && element.name == 'listItem' && element.getAttribute( 'type' ) != this.type ) {
					// We are turning on and the element is a `listItem` but has different type - change it's type and
					// type of it's all siblings that have same indent.
					batch.setAttribute( element, 'type', this.type );
				}
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean} The current value.
	 */
	_getValue() {
		// Check whether closest `listItem` ancestor of the position has a correct type.
		const listItem = first( this.editor.document.selection.getSelectedBlocks() );

		return !!listItem && listItem.is( 'listItem' ) && listItem.getAttribute( 'type' ) == this.type;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		// If command value is true it means that we are in list item, so the command should be enabled.
		if ( this.value ) {
			return true;
		}

		const selection = this.editor.document.selection;
		const schema = this.editor.document.schema;

		const firstBlock = first( selection.getSelectedBlocks() );

		if ( !firstBlock ) {
			return false;
		}

		// Otherwise, check if list item can be inserted at the position start.
		return checkCanBecomeListItem( firstBlock, schema );
	}
}

// Helper function used when one or more list item have their type changed. Fixes type of other list items
// that are affected by the change (are in same lists) but are not directly in selection. The function got extracted
// not to duplicated code, as same fix has to be performed before and after selection.
//
// @param {Array.<module:engine/model/node~Node>} blocks Blocks that are in selection.
// @param {Boolean} isBackward Specified whether fix will be applied for blocks before first selected block (`true`)
// or blocks after last selected block (`false`).
// @param {Number} lowestIndent Lowest indent among selected blocks.
function _fixType( blocks, isBackward, lowestIndent ) {
	// We need to check previous sibling of first changed item and next siblings of last changed item.
	const startingItem = isBackward ? blocks[ 0 ] : blocks[ blocks.length - 1 ];

	if ( startingItem.is( 'listItem' ) ) {
		let item = startingItem[ isBackward ? 'previousSibling' : 'nextSibling' ];
		// During processing items, keeps the lowest indent of already processed items.
		// This saves us from changing too many items.
		// Following example is for going forward as it is easier to read, however same applies to going backward.
		// * ------
		//   * ------
		//     * --[---
		//   * ------		<-- `lowestIndent` should be 1
		//     * --]---		<-- `startingItem`, `currentIndent` = 2, `lowestIndent` == 1
		//     * ------		<-- should be fixed, `indent` == 2 == `currentIndent`
		//   * ------		<-- should be fixed, set `currentIndent` to 1, `indent` == 1 == `currentIndent`
		//     * ------		<-- should not be fixed, item is in different list, `indent` = 2, `indent` != `currentIndent`
		//   * ------		<-- should be fixed, `indent` == 1 == `currentIndent`
		// * ------			<-- break loop (`indent` < `lowestIndent`)
		let currentIndent = startingItem.getAttribute( 'indent' );

		// Look back until a list item with indent lower than reference `lowestIndent`.
		// That would be the parent of nested sublist which contains item having `lowestIndent`.
		while ( item && item.is( 'listItem' ) && item.getAttribute( 'indent' ) >= lowestIndent ) {
			if ( currentIndent > item.getAttribute( 'indent' ) ) {
				currentIndent = item.getAttribute( 'indent' );
			}

			// Found an item that is in the same nested sublist.
			if ( item.getAttribute( 'indent' ) == currentIndent ) {
				// Just add the item to selected blocks like it was selected by the user.
				blocks[ isBackward ? 'unshift' : 'push' ]( item );
			}

			item = item[ isBackward ? 'previousSibling' : 'nextSibling' ];
		}
	}
}

// Checks whether the given block can be replaced by a listItem.
//
// @private
// @param {module:engine/model/element~Element} block A block to be tested.
// @param {module:engine/model/schema~Schema} schema The schema of the document.
// @returns {Boolean}
function checkCanBecomeListItem( block, schema ) {
	return schema.check( {
		name: 'listItem',
		attributes: [ 'type', 'indent' ],
		inside: Position.createBefore( block )
	} );
}
