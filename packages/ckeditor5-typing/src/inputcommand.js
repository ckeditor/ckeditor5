/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/inputcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import ChangeBuffer from './changebuffer';

/**
 * The input command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 *
 * @extends module:core/command~Command
 */
export default class InputCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Number} undoStepSize The maximum number of atomic changes
	 * which can be contained in one batch in the command buffer.
	 */
	constructor( editor, undoStepSize ) {
		super( editor );

		/**
		 * Typing's change buffer used to group subsequent changes into batches.
		 *
		 * @readonly
		 * @private
		 * @member {module:typing/changebuffer~ChangeBuffer} #_buffer
		 */
		this._buffer = new ChangeBuffer( editor.document, undoStepSize );
	}

	/**
	 * The current change buffer.
	 *
	 * @type {module:typing/changebuffer~ChangeBuffer}
	 */
	get buffer() {
		return this._buffer;
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this._buffer.destroy();
	}

	/**
	 * Executes the input command. It replaces the content within the given range with the given text.
	 * Replacing is a two step process, first the content within the range is removed and then the new text is inserted
	 * at the beginning of the range (which after the removal is a collapsed range).
	 *
	 * @fires execute
	 * @param {Object} [options] The command options.
	 * @param {String} [options.text=''] The text to be inserted.
	 * @param {module:engine/model/range~Range} [options.range] The range in which the text is inserted. Defaults
	 * to the first range in the current selection.
	 * @param {module:engine/model/range~Range} [options.resultRange] The range where the selection
	 * should be placed after the insertion. If not specified, the selection will be placed right after
	 * the inserted text.
	 */
	execute( options = {} ) {
		const doc = this.editor.document;
		const text = options.text || '';
		const textInsertions = text.length;
		const range = options.range || doc.selection.getFirstRange();
		const resultRange = options.resultRange;

		doc.enqueueChanges( () => {
			const isCollapsedRange = range.isCollapsed;

			this._buffer.lock();

			if ( !isCollapsedRange ) {
				this._buffer.batch.remove( range );
			}

			if ( text ) {
				this._buffer.batch.weakInsert( range.start, text );
			}

			if ( resultRange ) {
				this.editor.data.model.selection.setRanges( [ resultRange ] );
			} else if ( isCollapsedRange ) {
				// If range was collapsed just shift the selection by the number of inserted characters.
				this.editor.data.model.selection.setCollapsedAt( range.start.getShiftedBy( textInsertions ) );
			}

			this._buffer.unlock();

			this._buffer.input( textInsertions );
		} );
	}
}
