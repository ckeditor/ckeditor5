/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/outdentcodeblockcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import {
	getLeadingWhiteSpaces,
	getIndentOutdentPositions,
	isModelSelectionInCodeBlock
} from './utils';

/**
 * The code block indentation decrease command plugin.
 *
 * @extends module:core/command~Command
 */
export default class OutdentCodeBlockCommand extends Command {
	constructor( editor ) {
		super( editor );

		/**
		 * A sequence of characters removed from the line when the command is executed.
		 *
		 * @readonly
		 * @private
		 * @member {String}
		 */
		this._indentSequence = editor.config.get( 'codeBlock.indentSequence' );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command. When the command {@link #isEnabled is enabled}, the indentation of the
	 * code lines in the selection will be decreased.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const model = editor.model;

		model.change( writer => {
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
				const range = getLastOutdentableSequenceRange( this.editor.model, position, this._indentSequence );

				if ( range ) {
					writer.remove( range );
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
	_checkEnabled() {
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
function getLastOutdentableSequenceRange( model, position, sequence ) {
	// Positions start before each text node (code line). Get the node corresponding to the position.
	const nodeAtPosition = getCodeLineTextNodeAtPosition( position );

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
		model.createPositionAt( parent, startOffset + lastIndexOfSequence ),
		model.createPositionAt( parent, startOffset + lastIndexOfSequence + sequence.length )
	);
}

function getCodeLineTextNodeAtPosition( position ) {
	// Positions start before each text node (code line). Get the node corresponding to the position.
	let nodeAtPosition = position.parent.getChild( position.index );

	// <codeBlock>foo^</codeBlock>
	// <codeBlock>foo^<softBreak></softBreak>bar</codeBlock>
	if ( !nodeAtPosition || nodeAtPosition.is( 'element', 'softBreak' ) ) {
		nodeAtPosition = position.nodeBefore;
	}

	// <codeBlock>^</codeBlock>
	// <codeBlock>foo^<softBreak></softBreak>bar</codeBlock>
	if ( !nodeAtPosition || nodeAtPosition.is( 'element', 'softBreak' ) ) {
		return null;
	}

	return nodeAtPosition;
}
