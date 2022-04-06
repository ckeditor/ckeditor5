/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistcommand
 */

import { Command } from 'ckeditor5/src/core';
import {
	splitListItemBefore,
	expandListBlocksToCompleteItems,
	getListItemBlocks,
	getListItems,
	removeListAttributes,
	outdentFollowingItems,
	ListItemUid,
	sortBlocks,
	getSelectedBlockObject,
	isListItemBlock
} from './utils/model';

/**
 * The list command. It is used by the {@link module:list/documentlist~DocumentList document list feature}.
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
		 * @member {'numbered'|'bulleted'}
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
	 * @fires afterExecute
	 * @param {Object} [options] Command options.
	 * @param {Boolean} [options.forceValue] If set, it will force the command behavior. If `true`, the command will try to convert the
	 * selected items and potentially the neighbor elements to the proper list items. If set to `false` it will convert selected elements
	 * to paragraphs. If not set, the command will toggle selected elements to list items or paragraphs, depending on the selection.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selectedBlockObject = getSelectedBlockObject( model );

		const blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => model.schema.checkAttribute( block, 'listType' ) );

		// Whether we are turning off some items.
		const turnOff = options.forceValue !== undefined ? !options.forceValue : this.value;

		model.change( writer => {
			if ( turnOff ) {
				const lastBlock = blocks[ blocks.length - 1 ];

				// Split the first block from the list item.
				const itemBlocks = getListItemBlocks( lastBlock, { direction: 'forward' } );
				const changedBlocks = [];

				if ( itemBlocks.length > 1 ) {
					changedBlocks.push( ...splitListItemBefore( itemBlocks[ 1 ], writer ) );
				}

				// Convert list blocks to plain blocks.
				changedBlocks.push( ...removeListAttributes( blocks, writer ) );

				// Outdent items following the selected list item.
				changedBlocks.push( ...outdentFollowingItems( lastBlock, writer ) );

				this._fireAfterExecute( changedBlocks );
			}
			// Turning on the list items for a collapsed selection inside a list item.
			else if ( ( selectedBlockObject || document.selection.isCollapsed ) && isListItemBlock( blocks[ 0 ] ) ) {
				const changedBlocks = getListItems( selectedBlockObject || blocks[ 0 ] );

				for ( const block of changedBlocks ) {
					writer.setAttribute( 'listType', this.type, block );
				}

				this._fireAfterExecute( changedBlocks );
			}
			// Turning on the list items for a non-collapsed selection.
			else {
				const changedBlocks = [];

				for ( const block of blocks ) {
					// Promote the given block to the list item.
					if ( !block.hasAttribute( 'listType' ) ) {
						writer.setAttributes( {
							listIndent: 0,
							listItemId: ListItemUid.next(),
							listType: this.type
						}, block );

						changedBlocks.push( block );
					}
					// Change the type of list item.
					else {
						for ( const node of expandListBlocksToCompleteItems( block, { withNested: false } ) ) {
							if ( node.getAttribute( 'listType' ) != this.type ) {
								writer.setAttribute( 'listType', this.type, node );
								changedBlocks.push( node );
							}
						}
					}
				}

				this._fireAfterExecute( changedBlocks );
			}
		} );
	}

	/**
	 * Fires the `afterExecute` event.
	 *
	 * @private
	 * @param {Array.<module:engine/model/element~Element>} changedBlocks The changed list elements.
	 */
	_fireAfterExecute( changedBlocks ) {
		/**
		 * Event fired by the {@link #execute} method.
		 *
		 * It allows to execute an action after executing the {@link ~DocumentListCommand#execute} method,
		 * for example adjusting attributes of changed list items.
		 *
		 * @protected
		 * @event afterExecute
		 */
		this.fire( 'afterExecute', sortBlocks( new Set( changedBlocks ) ) );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean} The current value.
	 */
	_getValue() {
		const selection = this.editor.model.document.selection;
		const blocks = Array.from( selection.getSelectedBlocks() );

		if ( !blocks.length ) {
			return false;
		}

		for ( const block of blocks ) {
			if ( block.getAttribute( 'listType' ) != this.type ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		const selection = this.editor.model.document.selection;
		const schema = this.editor.model.schema;
		const blocks = Array.from( selection.getSelectedBlocks() );

		if ( !blocks.length ) {
			return false;
		}

		// If command value is true it means that we are in list item, so the command should be enabled.
		if ( this.value ) {
			return true;
		}

		for ( const block of blocks ) {
			if ( schema.checkAttribute( block, 'listType' ) ) {
				return true;
			}
		}

		return false;
	}
}
