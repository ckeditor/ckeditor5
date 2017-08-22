/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/deletecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import ChangeBuffer from './changebuffer';
import count from '@ckeditor/ckeditor5-utils/src/count';

/**
 * The delete command. Used by the {@link module:typing/delete~Delete delete feature} to handle the <kbd>Delete</kbd> and
 * <kbd>Backspace</kbd> keys.
 *
 * @extends module:core/command~Command
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
	 * @param {'character'} [options.unit='character'] See {@link module:engine/controller/modifyselection~modifySelection}'s options.
	 * @param {Number} [options.sequence=1] A number describing which subsequent delete event it is without the key being released.
	 * See the {@link module:engine/view/document~Document#event:delete} event data.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const dataController = this.editor.data;

		doc.enqueueChanges( () => {
			this._buffer.lock();

			const selection = Selection.createFromSelection( doc.selection );

			// Do not replace the whole selected content if selection was collapsed.
			// This prevents such situation:
			//
			// <h1></h1><p>[]</p>	-->  <h1>[</h1><p>]</p> 		-->  <p></p>
			// starting content		-->   after `modifySelection`	-->  after `deleteContent`.
			const doNotResetEntireContent = selection.isCollapsed;

			// Try to extend the selection in the specified direction.
			if ( selection.isCollapsed ) {
				dataController.modifySelection( selection, { direction: this.direction, unit: options.unit } );
			}

			// Check if deleting in an empty editor. See #61.
			if ( this._shouldEntireContentBeReplacedWithParagraph( options.sequence || 1 ) ) {
				this._replaceEntireContentWithParagraph();

				return;
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

			dataController.deleteContent( selection, this._buffer.batch, { doNotResetEntireContent } );
			this._buffer.input( changeCount );

			doc.selection.setRanges( selection.getRanges(), selection.isBackward );

			this._buffer.unlock();
		} );
	}

	/**
	 * If the user keeps <kbd>Backspace</kbd> or <kbd>Delete</kbd> key pressed, the content of the current
	 * editable will be cleared. However, this will not yet lead to resetting the remaining block to a paragraph
	 * (which happens e.g. when the user does <kbd>Ctrl</kbd> + <kbd>A</kbd>, <kbd>Backspace</kbd>).
	 *
	 * But, if the user pressed the key in an empty editable for the first time,
	 * we want to replace the entire content with a paragraph if:
	 *
	 * * the current limit element is empty,
	 * * the paragraph is allowed in the limit element,
	 * * the limit doesn't already have a paragraph inside.
	 *
	 * See https://github.com/ckeditor/ckeditor5-typing/issues/61.
	 *
	 * @private
	 * @param {Number} sequence A number describing which subsequent delete event it is without the key being released.
	 * @returns {Boolean}
	 */
	_shouldEntireContentBeReplacedWithParagraph( sequence ) {
		// Does nothing if user pressed and held the "Backspace" or "Delete" key.
		if ( sequence > 1 ) {
			return false;
		}

		const document = this.editor.document;
		const selection = document.selection;
		const limitElement = document.schema.getLimitElement( selection );

		// If a collapsed selection contains the whole content it means that the content is empty
		// (from the user perspective).
		const limitElementIsEmpty = selection.isCollapsed && selection.containsEntireContent( limitElement );

		if ( !limitElementIsEmpty ) {
			return false;
		}

		if ( !document.schema.check( { name: 'paragraph', inside: limitElement.name } ) ) {
			return false;
		}

		const limitElementFirstChild = limitElement.getChild( 0 );

		// Does nothing if the limit element already contains only a paragraph.
		// We ignore the case when paragraph might have some inline elements (<p><inlineWidget>[]</inlineWidget></p>)
		// because we don't support such cases yet and it's unclear whether inlineWidget shouldn't be a limit itself.
		if ( limitElementFirstChild && limitElementFirstChild.name === 'paragraph' ) {
			return false;
		}

		return true;
	}

	/**
	 * The entire content is replaced with the paragraph. Selection is moved inside the paragraph.
	 *
	 * @private
	 */
	_replaceEntireContentWithParagraph() {
		const document = this.editor.document;
		const selection = document.selection;
		const limitElement = document.schema.getLimitElement( selection );
		const paragraph = new Element( 'paragraph' );

		this._buffer.batch.remove( Range.createIn( limitElement ) );
		this._buffer.batch.insert( Position.createAt( limitElement ), paragraph );

		selection.setCollapsedAt( paragraph );
	}
}
