/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import { getClosestListItem, getSelectedBlocks, getPositionBeforeBlock } from './utils.js';

/**
 * The list command. It is used by the {@link list.List list feature}.
 *
 * @memberOf list
 * @extends core.command.Command
 */
export default class ListCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
	 * @param {'numbered'|'bulleted'} type List type that will be handled by this command.
	 */
	constructor( editor, type ) {
		super( editor );

		/**
		 * The type of list created by the command.
		 *
		 * @readonly
		 * @member {'numbered'|'bulleted'} list.ListCommand#type
		 */
		this.type = type == 'bulleted' ? 'bulleted' : 'numbered';

		/**
		 * Flag indicating whether the command is active, which means that selection starts in a list of the same type.
		 *
		 * @observable
		 * @member {Boolean} list.ListCommand#value
		 */
		this.set( 'value', false );

		// Listen on selection change and sets current command's value.
		this.listenTo( editor.document.selection, 'change:range', () => {
			this.refreshValue();
			this.refreshState();
		} );

		// Listen on changesDone model document and sets current command's value.
		this.listenTo( editor.document, 'changesDone', () => {
			this.refreshValue();
			this.refreshState();
		} );
	}

	/**
	 * Sets command's value based on the document selection.
	 */
	refreshValue() {
		const position = this.editor.document.selection.getFirstPosition();

		// Check whether closest `listItem` ancestor of the position has a correct type.
		const listItem = getClosestListItem( position );
		this.value = listItem !== null && listItem.getAttribute( 'type' ) == this.type;
	}

	/**
	 * @inheritDoc
	 */
	_doExecute() {
		const document = this.editor.document;
		const blocks = getSelectedBlocks( document.selection, document.schema );

		// Whether we are turning off some items.
		const turnOff = this.value === true;
		// If we are turning off items, we are going to rename them to paragraphs.

		document.enqueueChanges( () => {
			const batch = document.batch();

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
				// 3        * -------- <- this is turned off.
				// 4           * -------- <- this has to become indent = 0, because it will be first item on a new list.
				// 5              * -------- <- this should be still be a child of item above, so indent = 1.
				// 6        * -------- <- this also has to become indent = 0, because it shouldn't end up as a child of any of items above.
				// 7           * -------- <- this should be still be a child of item above, so indent = 1.
				// 8     * -------- <- this has to become indent = 0.
				// 9        * -------- <- this should still be a child of item above, so indent = 1.
				// 10          * -------- <- this should still be a child of item above, so indent = 2.
				// 11          * -------- <- this should still be at the same level as item above, so indent = 2.
				// 12 * -------- <- this and all below are left unchanged.
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

				for ( let item of changes ) {
					batch.setAttribute( item.element, 'indent', item.indent );
				}
			}

			// Phew! Now it will be easier :).
			// For each block element that was in the selection, we will either: turn it to list item,
			// turn it to paragraph, or change it's type. Or leave it as it is.
			for ( let element of blocks ) {
				if ( turnOff && element.name == 'listItem' ) {
					// We are turning off and the element is a `listItem` - it should be converted to `paragraph`.
					// The order is important to keep model in correct state.
					batch.rename( element, 'paragraph' ).removeAttribute( element, 'type' ).removeAttribute( element, 'indent' );
				} else if ( !turnOff && element.name != 'listItem' ) {
					// We are turning on and the element is not a `listItem` - it should be converted to `listItem`.
					// The order is important to keep model in correct state.
					batch.setAttribute( element, 'type', this.type ).setAttribute( element, 'indent', 0 ).rename( element, 'listItem' );
				} else if ( !turnOff && element.name == 'listItem' && element.getAttribute( 'type' ) != this.type ) {
					// We are turning on and the element is a `listItem` but has different type - change type.
					batch.setAttribute( element, 'type', this.type );
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	_checkEnabled() {
		// If command is enabled it means that we are in list item, so the command should be enabled.
		if ( this.value ) {
			return true;
		}

		const selection = this.editor.document.selection;
		const schema = this.editor.document.schema;
		const position = getPositionBeforeBlock( selection.getFirstPosition(), schema );

		// Otherwise, check if list item can be inserted at the position start.
		return schema.check( { name: 'listItem', inside: position, attributes: [ 'type', 'indent' ] } );
	}
}
