/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/deletecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import count from '@ckeditor/ckeditor5-utils/src/count';

import ChangeBuffer from './utils/changebuffer';

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
		 * @type {module:typing/utils/changebuffer~ChangeBuffer}
		 */
		this._buffer = new ChangeBuffer( editor.model, editor.config.get( 'typing.undoStep' ) );
	}

	/**
	 * The current change buffer.
	 *
	 * @type {module:typing/utils/changebuffer~ChangeBuffer}
	 */
	get buffer() {
		return this._buffer;
	}

	/**
	 * Executes the delete command. Depending on whether the selection is collapsed or not, deletes its content
	 * or a piece of content in the {@link #direction defined direction}.
	 *
	 * @fires execute
	 * @param {Object} [options] The command options.
	 * @param {'character'|'codePoint'|'word'} [options.unit='character']
	 * See {@link module:engine/model/utils/modifyselection~modifySelection}'s options.
	 * @param {Number} [options.sequence=1] A number describing which subsequent delete event it is without the key being released.
	 * See the {@link module:engine/view/document~Document#event:delete} event data.
	 * @param {module:engine/model/selection~Selection} [options.selection] Selection to remove. If not set, current model selection
	 * will be used.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const doc = model.document;

		model.enqueueChange( this._buffer.batch, writer => {
			this._buffer.lock();

			const selection = writer.createSelection( options.selection || doc.selection );
			const sequence = options.sequence || 1;

			// Do not replace the whole selected content if selection was collapsed.
			// This prevents such situation:
			//
			// <h1></h1><p>[]</p>	-->  <h1>[</h1><p>]</p> 		-->  <p></p>
			// starting content		-->   after `modifySelection`	-->  after `deleteContent`.
			const doNotResetEntireContent = selection.isCollapsed;

			// Try to extend the selection in the specified direction.
			if ( selection.isCollapsed ) {
				model.modifySelection( selection, {
					direction: this.direction,
					unit: options.unit,
					treatEmojiAsSingleUnit: true
				} );
			}

			// Check if deleting in an empty editor. See #61.
			if ( this._shouldEntireContentBeReplacedWithParagraph( sequence ) ) {
				this._replaceEntireContentWithParagraph( writer );

				return;
			}

			// Check if deleting in the first empty block.
			// See https://github.com/ckeditor/ckeditor5/issues/8137.
			if ( this._shouldReplaceFirstBlockWithParagraph( selection, sequence ) ) {
				this.editor.execute( 'paragraph', { selection } );

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

			model.deleteContent( selection, {
				doNotResetEntireContent,
				direction: this.direction
			} );

			this._buffer.input( changeCount );

			writer.setSelection( selection );

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

		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const limitElement = model.schema.getLimitElement( selection );

		// If a collapsed selection contains the whole content it means that the content is empty
		// (from the user perspective).
		const limitElementIsEmpty = selection.isCollapsed && selection.containsEntireContent( limitElement );

		if ( !limitElementIsEmpty ) {
			return false;
		}

		if ( !model.schema.checkChild( limitElement, 'paragraph' ) ) {
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
	 * @param {module:engine/model/writer~Writer} writer The model writer.
	 */
	_replaceEntireContentWithParagraph( writer ) {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const limitElement = model.schema.getLimitElement( selection );
		const paragraph = writer.createElement( 'paragraph' );

		writer.remove( writer.createRangeIn( limitElement ) );
		writer.insert( paragraph, limitElement );

		writer.setSelection( paragraph, 0 );
	}

	/**
	 * Checks if the selection is inside an empty element that is the first child of the limit element
	 * and should be replaced with a paragraph.
	 *
	 * @private
	 * @param {module:engine/model/selection~Selection} selection The selection.
	 * @param {Number} sequence A number describing which subsequent delete event it is without the key being released.
	 * @returns {Boolean}
	 */
	_shouldReplaceFirstBlockWithParagraph( selection, sequence ) {
		const model = this.editor.model;

		// Does nothing if user pressed and held the "Backspace" key or it was a "Delete" button.
		if ( sequence > 1 || this.direction != 'backward' ) {
			return false;
		}

		if ( !selection.isCollapsed ) {
			return false;
		}

		const position = selection.getFirstPosition();
		const limitElement = model.schema.getLimitElement( position );
		const limitElementFirstChild = limitElement.getChild( 0 );

		// Only elements that are direct children of the limit element can be replaced.
		// Unwrapping from a block quote should be handled in a dedicated feature.
		if ( position.parent != limitElementFirstChild ) {
			return false;
		}

		// A block should be replaced only if it was empty.
		if ( !selection.containsEntireContent( limitElementFirstChild ) ) {
			return false;
		}

		// Replace with a paragraph only if it's allowed there.
		if ( !model.schema.checkChild( limitElement, 'paragraph' ) ) {
			return false;
		}

		// Does nothing if the limit element already contains only a paragraph.
		if ( limitElementFirstChild.name == 'paragraph' ) {
			return false;
		}

		return true;
	}
}
