/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module code-block/indentcodeblockcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';

import {
	getIndentOutdentPositions,
	isModelSelectionInCodeBlock
} from './utils.js';

/**
 * The code block indentation increase command plugin.
 */
export default class IndentCodeBlockCommand extends Command {
	/**
	 * A sequence of characters added to the line when the command is executed.
	 */
	private _indentSequence: string;

	constructor( editor: Editor ) {
		super( editor );

		this._indentSequence = editor.config.get( 'codeBlock.indentSequence' )!;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command. When the command {@link #isEnabled is enabled}, the indentation of the
	 * code lines in the selection will be increased.
	 *
	 * @fires execute
	 */
	public override execute(): void {
		const editor = this.editor;
		const model = editor.model;

		model.change( writer => {
			const positions = getIndentOutdentPositions( model );

			// Indent all positions, for instance assuming the indent sequence is 4x space ("    "):
			//
			//		<codeBlock>^foo</codeBlock>        ->       <codeBlock>    foo</codeBlock>
			//
			//		<codeBlock>foo^bar</codeBlock>     ->       <codeBlock>foo    bar</codeBlock>
			//
			// Also, when there is more than one position:
			//
			//		<codeBlock>
			//			^foobar
			//			<softBreak></softBreak>
			//			^bazqux
			//		</codeBlock>
			//
			//		->
			//
			//		<codeBlock>
			//			    foobar
			//			<softBreak></softBreak>
			//			    bazqux
			//		</codeBlock>
			//
			for ( const position of positions ) {
				const indentSequenceTextElement = writer.createText( this._indentSequence );

				// Previously insertion was done by writer.insertText(). It was changed to insertContent() to enable
				// integration of code block with track changes. It's the easiest way of integration because insertContent()
				// is already integrated with track changes, but if it ever cause any troubles it can be reverted, however
				// some additional work will be required in track changes integration of code block.
				model.insertContent( indentSequenceTextElement, position );
			}
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 */
	private _checkEnabled(): boolean {
		if ( !this._indentSequence ) {
			return false;
		}

		// Indent (forward) command is always enabled when there's any code block in the selection
		// because you can always indent code lines.
		return isModelSelectionInCodeBlock( this.editor.model.document.selection );
	}
}
