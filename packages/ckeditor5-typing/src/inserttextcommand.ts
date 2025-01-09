/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/inserttextcommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';

import ChangeBuffer from './utils/changebuffer.js';

import type { DocumentSelection, Range, Selection } from '@ckeditor/ckeditor5-engine';

/**
 * The insert text command. Used by the {@link module:typing/input~Input input feature} to handle typing.
 */
export default class InsertTextCommand extends Command {
	/**
	 * Typing's change buffer used to group subsequent changes into batches.
	 */
	private readonly _buffer: ChangeBuffer;

	/**
	 * Creates an instance of the command.
	 *
	 * @param undoStepSize The maximum number of atomic changes
	 * which can be contained in one batch in the command buffer.
	 */
	constructor( editor: Editor, undoStepSize: number ) {
		super( editor );

		this._buffer = new ChangeBuffer( editor.model, undoStepSize );

		// Since this command may execute on different selectable than selection, it should be checked directly in execute block.
		this._isEnabledBasedOnSelection = false;
	}

	/**
	 * The current change buffer.
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
	 * @param options The command options.
	 */
	public override execute( options: InsertTextCommandOptions = {} ): void {
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

		// Stop executing if selectable is in non-editable place.
		if ( !model.canEditAt( selection ) ) {
			return;
		}

		const resultRange = options.resultRange;

		model.enqueueChange( this._buffer.batch, writer => {
			this._buffer.lock();

			// Store selection attributes before deleting old content to preserve formatting and link.
			// This unifies the behavior between DocumentSelection and Selection provided as input option.
			const selectionAttributes = Array.from( doc.selection.getAttributes() );

			model.deleteContent( selection );

			if ( text ) {
				model.insertContent( writer.createText( text, selectionAttributes ), selection );
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

/**
 * Interface with parameters for executing InsertTextCommand.
 *
 * Both `range` and `selection` parameters are used for defining selection but should not be used together.
 * If both are defined, only `selection` will be considered.
 */
export interface InsertTextCommandOptions {

	/**
	 * The text to be inserted.
	 */
	text?: string;

	/**
	 * The selection in which the text is inserted.
	 * Inserting a text into a selection deletes the current content within selection ranges. If the selection is not specified,
	 * the current selection in the model will be used instead.
	 */
	selection?: Selection | DocumentSelection;

	/**
	 * The range in which the text is inserted. Defaults to the first range in the current selection.
	 */
	range?: Range;

	/**
	 * The range where the selection should be placed after the insertion.
	 * If not specified, the selection will be placed right after the inserted text.
	 */
	resultRange?: Range;
}

export interface InsertTextCommandExecuteEvent {
	name: 'execute';
	args: [
		data: [ options: InsertTextCommandOptions ]
	];
}
