/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistcinnabd
 */

import { Command } from 'ckeditor5/src/core';
import { first, uid } from 'ckeditor5/src/utils';
import { getAllListItemBlocks, getListItemBlocks, getNestedListBlocks, indentBlocks, isFirstBlockOfListItem, mergeListItemBlocksIntoParentListItem } from './utils/model';

/**
 * The list command. It is used by the {@link TODO document list feature}.
 *
 * @extends module:core/command~Command
 */
export default class DocumentListCommand extends Command {
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
		 * @member {'numbered'|'bulleted'|'todo'}
		 */
		this.type = type;

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
	 * Executes the list command.
	 *
	 * @fires execute
	 * @param {Object} [options] Command options.
	 * @param {Boolean} [options.forceValue] If set, it will force the command behavior. If `true`, the command will try to convert the
	 * selected items and potentially the neighbor elements to the proper list items. If set to `false` it will convert selected elements
	 * to paragraphs. If not set, the command will toggle selected elements to list items or paragraphs, depending on the selection.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => isListItemOrCanBeListItem( block, model.schema ) );

		// Whether we are turning off some items.
		const turnOff = options.forceValue !== undefined ? !options.forceValue : this.value;

		model.change( writer => {
			for ( const block of blocks.reverse() ) {
				if ( turnOff ) {
					// Blocks in top-level list items simply outdent when turning off.
					if ( block.getAttribute( 'listIndent' ) === 0 ) {
						console.log( [ block, ...getNestedListBlocks( block ) ].length );
						indentBlocks( [ block, ...getNestedListBlocks( block ) ], -1, writer );
					} else {
						mergeListItemBlocksIntoParentListItem( block, writer );
					}
				}
				// Turning on and the block is not a list item - it should get the full set of necessary attributes.
				else if ( !turnOff && !block.hasAttribute( 'listType' ) ) {
					writer.setAttributes( {
						listType: this.type,
						listIndent: 0,
						listItemId: uid()
					}, block );
				}
				// Turning on and the block is already a list items but has different type - change it's type and
				// type of it's all siblings that have same indent.
				else if ( !turnOff && block.hasAttribute( 'listType' ) && block.getAttribute( 'listType' ) != this.type ) {
					writer.setAttributes( {
						listType: this.type
					}, block );
				}
			}

			/**
			 * Event fired by the {@link #execute} method.
			 *
			 * It allows to execute an action after executing the {@link ~ListCommand#execute} method, for example adjusting
			 * attributes of changed blocks.
			 *
			 * @protected
			 * @event _executeCleanup
			 */
			this.fire( '_executeCleanup', blocks );
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
		const listItem = first( this.editor.model.document.selection.getSelectedBlocks() );

		return !!listItem && listItem.getAttribute( 'listType' ) == this.type;
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

		const selection = this.editor.model.document.selection;
		const schema = this.editor.model.schema;

		const firstBlock = first( selection.getSelectedBlocks() );

		if ( !firstBlock ) {
			return false;
		}

		// Otherwise, check if list item can be inserted at the position start.
		return isListItemOrCanBeListItem( firstBlock, schema );
	}
}

// Checks whether the given block can get the `listType` attribute and become a document list item.
//
// @private
// @param {module:engine/model/element~Element} block A block to be tested.
// @param {module:engine/model/schema~Schema} schema The schema of the document.
// @returns {Boolean}
function isListItemOrCanBeListItem( block, schema ) {
	return schema.checkAttribute( block, 'listType' ) && !schema.isObject( block );
}
