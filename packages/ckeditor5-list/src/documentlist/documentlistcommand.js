/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistcinnabd
 */

import { Command } from 'ckeditor5/src/core';
import { uid } from 'ckeditor5/src/utils';
import {
	indentBlocks,
	isFirstBlockOfListItem,
	isOnlyOneListItemSelected,
	splitListItemBefore,
	expandListBlocksToCompleteItems,
	getSameIndentBlocks
} from './utils/model';

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
			.filter( block => model.schema.checkAttribute( block, 'listType' ) );

		// Whether we are turning off some items.
		const turnOff = options.forceValue !== undefined ? !options.forceValue : this.value;

		model.change( writer => {
			if ( turnOff ) {
				// Outdent.
				indentBlocks( blocks, -1, { expand: true, alwaysMerge: true }, writer );
			} else {
				// Case of selection:
				// * a
				//   * [b
				//   c]
				// Should be treated as only "c" selected to make it:
				// * a
				//   * b
				//   * c
				const completeItemsBlocks = expandListBlocksToCompleteItems( blocks );
				const sameIndentBlocks = getSameIndentBlocks( completeItemsBlocks );
				const originallySelectedBlocks = sameIndentBlocks.filter( block => blocks.includes( block ) );

				if ( isOnlyOneListItemSelected( originallySelectedBlocks ) && !isFirstBlockOfListItem( originallySelectedBlocks[ 0 ] ) ) {
					indentBlocks( originallySelectedBlocks, 1, {}, writer );

					for ( const block of originallySelectedBlocks.reverse() ) {
						splitListItemBefore( block, writer );
					}
				} else {
					for ( const block of blocks ) {
						if ( !block.hasAttribute( 'listType' ) ) {
							writer.setAttributes( {
								listIndent: 0,
								listItemId: uid(),
								listType: this.type
							}, block );
						} else {
							expandListBlocksToCompleteItems( [ block ] );
							writer.setAttribute( 'listType', this.type, block );
						}
					}
				}
			}

			/**
			 * Event fired by the {@link #execute} method.
			 *
			 * It allows to execute an action after executing the {@link ~DocumentListCommand#execute} method,
			 * for example adjusting attributes of changed list items.
			 *
			 * @protected
			 * @event afterExecute
			 */
			this.fire( 'afterExecute', blocks );
		} );
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

		for ( const block of blocks ) {
			if ( block.getAttribute( 'listType' ) != this.type ) {
				return false;
			}
		}

		// TODO this is same as in execute
		const completeItemsBlocks = expandListBlocksToCompleteItems( blocks );
		const sameIndentBlocks = getSameIndentBlocks( completeItemsBlocks );
		const originallySelectedBlocks = sameIndentBlocks.filter( block => blocks.includes( block ) );

		if ( isOnlyOneListItemSelected( originallySelectedBlocks ) && !isFirstBlockOfListItem( originallySelectedBlocks[ 0 ] ) ) {
			return false;
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
