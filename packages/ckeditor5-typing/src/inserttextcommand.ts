/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/inserttextcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import ChangeBuffer from './utils/changebuffer';
import type Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { DocumentSelection, Range } from '@ckeditor/ckeditor5-engine';

/**
 * The insert text command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 *
 * @extends module:core/command~Command
 */
export default class InsertTextCommand extends Command {
	private readonly _buffer: ChangeBuffer;

	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Number} undoStepSize The maximum number of atomic changes
	 * which can be contained in one batch in the command buffer.
	 */
	constructor( editor: Editor, undoStepSize: number ) {
		super( editor );

		/**
		 * Typing's change buffer used to group subsequent changes into batches.
		 *
		 * @readonly
		 * @private
		 * @member {module:typing/utils/changebuffer~ChangeBuffer} #_buffer
		 */
		this._buffer = new ChangeBuffer( editor.model, undoStepSize );
	}

	/**
	 * The current change buffer.
	 *
	 * @type {module:typing/utils/changebuffer~ChangeBuffer}
	 */
	public get buffer(): ChangeBuffer {
		return this._buffer;
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
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
	 * @param {module:engine/model/selection~Selection} [options.selection] The selection in which the text is inserted.
	 * Inserting a text into a selection deletes the current content within selection ranges. If the selection is not specified,
	 * the current selection in the model will be used instead.
	 * // TODO note that those 2 options are exclusive (either selection or range)
	 * @param {module:engine/model/range~Range} [options.range] The range in which the text is inserted. Defaults
	 * to the first range in the current selection.
	 * @param {module:engine/model/range~Range} [options.resultRange] The range where the selection
	 * should be placed after the insertion. If not specified, the selection will be placed right after
	 * the inserted text.
	 */
	public override execute( options: {
		text?: string;
		selection?: Selection | DocumentSelection;
		range?: Range;
		resultRange?: Range;
	} = {} ): void {
		const model = this.editor.model;
		const doc = model.document;
		const text = options.text || '';
		const textInsertions = text.length;

		let selection: Selection | DocumentSelection = doc.selection;

		if ( options.selection ) {
			selection = options.selection;
		} else if ( options.range ) {
			selection = model.createSelection( options.range );
		}

		const resultRange = options.resultRange;

		model.enqueueChange( this._buffer.batch, writer => {
			this._buffer.lock();

			model.deleteContent( selection );

			if ( text ) {
				model.insertContent( writer.createText( text, doc.selection.getAttributes() ), selection );
			}

			if ( resultRange ) {
				writer.setSelection( resultRange );
			} else if ( !selection.is( 'documentSelection' ) ) {
				writer.setSelection( selection );
			}

			this._buffer.unlock();

			this._buffer.input( textInsertions );
		} );
	}
}
