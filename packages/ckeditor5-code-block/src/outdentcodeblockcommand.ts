/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/outdentcodeblockcommand
 */

import type { Model, Position, Range } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';

import {
	getLeadingWhiteSpaces,
	getIndentOutdentPositions,
	isModelSelectionInCodeBlock,
	getTextNodeAtLineStart
} from './utils.js';

/**
 * The code block indentation decrease command plugin.
 */
export default class OutdentCodeBlockCommand extends Command {
	/**
	 * A sequence of characters removed from the line when the command is executed.
	 */
	private readonly _indentSequence: string;

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
	 * code lines in the selection will be decreased.
	 *
	 * @fires execute
	 */
	public override execute(): void {
		const editor = this.editor;
		const model = editor.model;

		model.change( () => {
			const positions = getIndentOutdentPositions( model );

			// Outdent all positions, for instance assuming the indent sequence is 4x space ("    "):
			//
			//		<codeBlock>^foo</codeBlock>         ->       <codeBlock>foo</codeBlock>
			//
			//		<codeBlock>    ^bar</codeBlock>     ->       <codeBlock>bar</codeBlock>
			//
			// Also, when there is more than one position:
			//
			//		<codeBlock>
			//			    ^foobar
			//			<softBreak></softBreak>
			//			    ^bazqux
			//		</codeBlock>
			//
			//		->
			//
			//		<codeBlock>
			//			foobar
			//			<softBreak></softBreak>
			//			bazqux
			//		</codeBlock>
			for ( const position of positions ) {
				const range = getLastOutdentableSequenceRange( model, position, this._indentSequence );

				if ( range ) {
					// Previously deletion was done by writer.remove(). It was changed to deleteContent() to enable
					// integration of code block with track changes. It's the easiest way of integration because deleteContent()
					// is already integrated with track changes, but if it ever cause any troubles it can be reverted, however
					// some additional work will be required in track changes integration of code block.
					model.deleteContent( model.createSelection( range ) );
				}
			}
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	private _checkEnabled(): boolean {
		if ( !this._indentSequence ) {
			return false;
		}

		const model = this.editor.model;

		if ( !isModelSelectionInCodeBlock( model.document.selection ) ) {
			return false;
		}

		// Outdent command can execute only when there is an indent character sequence
		// in some of the lines.
		return getIndentOutdentPositions( model ).some( position => {
			return getLastOutdentableSequenceRange( model, position, this._indentSequence );
		} );
	}
}

// For a position coming from `getIndentOutdentPositions()`, it returns the range representing
// the last occurrence of the indent sequence among the leading whitespaces of the code line the
// position represents.
//
// For instance, assuming the indent sequence is 4x space ("    "):
//
//		<codeBlock>foo^</codeBlock>                                 ->          null
//		<codeBlock>foo^<softBreak></softBreak>bar</codeBlock>       ->          null
//		<codeBlock>  ^foo</codeBlock>                               ->          null
//		<codeBlock>        ^foo</codeBlock>                         ->          <codeBlock>    [    ]foo</codeBlock>
//		<codeBlock>    ^foo    bar</codeBlock>                      ->          <codeBlock>[    ]foo    bar</codeBlock>
//
// @param {<module:engine/model/model~Model>} model
// @param {<module:engine/model/position~Position>} position
// @param {String} sequence
// @returns {<module:engine/model/range~Range>|null}
function getLastOutdentableSequenceRange( model: Model, position: Position, sequence: string ): Range | null {
	// Positions start before each text node (code line). Get the node corresponding to the position.
	const nodeAtPosition = getTextNodeAtLineStart( position, model );

	if ( !nodeAtPosition ) {
		return null;
	}

	const leadingWhiteSpaces = getLeadingWhiteSpaces( nodeAtPosition );
	const lastIndexOfSequence = leadingWhiteSpaces.lastIndexOf( sequence );

	// For instance, assuming the indent sequence is 4x space ("    "):
	//
	//		<codeBlock>    	^foo</codeBlock>           ->             null
	//
	if ( lastIndexOfSequence + sequence.length !== leadingWhiteSpaces.length ) {
		return null;
	}

	// For instance, assuming the indent sequence is 4x space ("    "):
	//
	//		<codeBlock>  ^foo</codeBlock>           ->             null
	//
	if ( lastIndexOfSequence === -1 ) {
		return null;
	}

	const { parent, startOffset } = nodeAtPosition;

	// Create a range that contains the **last** indent sequence among the leading whitespaces
	// of the line.
	//
	// For instance, assuming the indent sequence is 4x space ("    "):
	//
	//		<codeBlock>        ^foo</codeBlock>      ->     <codeBlock>    [    ]foo</codeBlock>
	//
	return model.createRange(
		model.createPositionAt( parent!, startOffset! + lastIndexOfSequence ),
		model.createPositionAt( parent!, startOffset! + lastIndexOfSequence + sequence.length )
	);
}
