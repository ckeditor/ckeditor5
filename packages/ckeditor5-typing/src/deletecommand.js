/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/deletecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import ChangeBuffer from './changebuffer';
import count from '@ckeditor/ckeditor5-utils/src/count';

/**
 * The delete command. Used by the {@link module:typing/delete~Delete delete feature} to handle the <kbd>Delete</kbd> and
 * <kbd>Backspace</kbd> keys.
 *
 * @extends core.command.Command
 */
export default class DeleteCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {'forward'|'backward'} direction The directionality of the delete describing in what direction it
	 * should consume the content when the selection is collapsed.
	 */
	constructor( editor, direction ) {
		super( editor );

		/**
		 * The directionality of the delete describing in what direction it should
		 * consume the content when the selection is collapsed.
		 *
		 * @readonly
		 * @member {'forward'|'backward'} #direction
		 */
		this.direction = direction;

		/**
		 * Delete's change buffer used to group subsequent changes into batches.
		 *
		 * @readonly
		 * @private
		 * @member {typing.ChangeBuffer} #buffer
		 */
		this._buffer = new ChangeBuffer( editor.document, editor.config.get( 'typing.undoStep' ) );
	}

	/**
	 * Executes the delete command. Depending on whether the selection is collapsed or not, deletes its content
	 * or a piece of content in the {@link #direction defined direction}.
	 *
	 * @fires execute
	 * @param {Object} [options] The command options.
	 * @param {'character'} [options.unit='character'] See {@link module:engine/controller/modifyselection~modifySelection}'s
	 * options.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const dataController = this.editor.data;

		doc.enqueueChanges( () => {
			this._buffer.lock();

			const selection = Selection.createFromSelection( doc.selection );

			// Try to extend the selection in the specified direction.
			if ( selection.isCollapsed ) {
				dataController.modifySelection( selection, { direction: this.direction, unit: options.unit } );
			}

			// If selection is still collapsed, then there's nothing to delete.
			if ( selection.isCollapsed ) {
				return;
			}

			let changeCount = 0;

			selection.getFirstRange().getMinimalFlatRanges().forEach( range => {
				changeCount += count(
					range.getWalker( { singleCharacters: true, ignoreElementEnd: true, shallow: true } )
				);
			} );

			dataController.deleteContent( selection, this._buffer.batch, { merge: true } );
			this._buffer.input( changeCount );

			doc.selection.setRanges( selection.getRanges(), selection.isBackward );

			this._buffer.unlock();
		} );
	}
}
