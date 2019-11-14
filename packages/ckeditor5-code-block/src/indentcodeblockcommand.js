/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/indentcodeblockcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';
import { getLeadingWhiteSpaces } from './utils';

/**
 * The code block indentation command plugin.
 *
 * @extends module:core/command~Command
 */
export default class IndentCodeBlockCommand extends Command {
	constructor( editor, indentDirection ) {
		super( editor );

		/**
		 * Determines whether this command indents (`'forward'`) or outdents (`'backward'`).
		 *
		 * @readonly
		 * @private
		 * @member {String}
		 */
		this._indentDirection = indentDirection;

		/**
		 * A sequence of characters added (or removed) to the line when indenting (or outdenting).
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
	 * Executes the command. When the command {@link #isEnabled is enabled}, the code line(s) the selection
	 * is anchored to will be indented or outdented.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const model = editor.model;

		model.change( writer => {
			const positions = getIndentOutdentPositions( model );

			if ( this._indentDirection === 'forward' ) {
				this._indentPositions( writer, positions );
			} else {
				this._outdentPositions( writer, positions );
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

		const selection = this.editor.model.document.selection;
		const firstBlock = first( selection.getSelectedBlocks() );

		if ( !firstBlock || !firstBlock.is( 'codeBlock' ) ) {
			return false;
		}

		const model = this.editor.model;

		// Indent (forward) command is always enabled when there's any code block in the selection
		// because you can always indent code lines. Outdent (backward) command on the other hand,
		// can execute only when there is an indent character sequence in some of the lines.
		if ( this._indentDirection === 'backward' ) {
			return getIndentOutdentPositions( model ).some( position => {
				return getLastOutdentableSequenceRange( model, position, this._indentSequence );
			} );
		}

		return true;
	}

	/**
	 * Indent all positions, for instance assuming the indent sequence is 4x space ("    "):
	 *
	 *		<codeBlock>^foo</codeBlock>        ->       <codeBlock>    foo</codeBlock>
	 *
	 *		<codeBlock>foo^bar</codeBlock>     ->       <codeBlock>foo    bar</codeBlock>
	 *
	 * Also, when there is more than one position:
	 *
	 *		<codeBlock>
	 *			^foobar
	 *			<softBreak></softBreak>
	 *			^bazqux
	 *		</codeBlock>
	 *
	 *		->
	 *
	 *		<codeBlock>
	 *			    foobar
	 *			<softBreak></softBreak>
	 *			    bazqux
	 *		</codeBlock>
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @param {Array.<module:engine/model/position~Position>} positions
	 */
	_indentPositions( writer, positions ) {
		for ( const position of positions ) {
			writer.insertText( this._indentSequence, position );
		}
	}

	/**
	 * Outdent all positions, for instance assuming the indent sequence is 4x space ("    "):
	 *
	 *		<codeBlock>^foo</codeBlock>         ->       <codeBlock>foo</codeBlock>
	 *
	 *		<codeBlock>    ^bar</codeBlock>     ->       <codeBlock>bar</codeBlock>
	 *
	 * Also, when there is more than one position:
	 *
	 *		<codeBlock>
	 *			    ^foobar
	 *			<softBreak></softBreak>
	 *			    ^bazqux
	 *		</codeBlock>
	 *
	 *		->
	 *
	 *		<codeBlock>
	 *			foobar
	 *			<softBreak></softBreak>
	 *			bazqux
	 *		</codeBlock>
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 * @param {Array.<module:engine/model/position~Position>} positions
	 */
	_outdentPositions( writer, positions ) {
		for ( const position of positions ) {
			const range = getLastOutdentableSequenceRange( this.editor.model, position, this._indentSequence );

			if ( range ) {
				writer.remove( range );
			}
		}
	}
}

// Returns an array of all model positions within the selection that represent code block lines.
//
// If the selection is collapsed, it returns the exact selection anchor position:
//
//		<codeBlock>[]foo</codeBlock>        ->     <codeBlock>^foo</codeBlock>
//		<codeBlock>foo[]bar</codeBlock>     ->     <codeBlock>foo^bar</codeBlock>
//
// Otherwise, it returns positions **before** each text node belonging to all code blocks contained by the selection:
//
//		<codeBlock>                                <codeBlock>
//		    foo[bar                                   ^foobar
//		    <softBreak></softBreak>         ->        <softBreak></softBreak>
//		    baz]qux                                   ^bazqux
//		</codeBlock>                               </codeBlock>
//
// it also works across other non–code blocks:
//
//		<codeBlock>                                <codeBlock>
//		    foo[bar                                   ^foobar
//		</codeBlock>                               </codeBlock>
//		<paragraph>text</paragraph>         ->     <paragraph>text</paragraph>
//		<codeBlock>                                <codeBlock>
//		    baz]qux                                   ^bazqux
//		</codeBlock>                               </codeBlock>
//
// **Note:** The positions are in the reverse order so they do not get outdated when iterating over them and
// the writer inserts or removes things.
//
// **Note:** The position is situated after the leading white spaces in the text node:
//
// @param {<module:engine/model/model~Model>} model
// @returns {Array.<module:engine/model/position~Position>}
function getIndentOutdentPositions( model ) {
	const selection = model.document.selection;
	const positions = [];

	// When the selection is collapsed, there's only one position we can indent or outdent.
	if ( selection.isCollapsed ) {
		positions.push( selection.anchor );
	}

	// When the selection is NOT collapsed, collect all positions starting before text nodes
	// (code lines) in any <codeBlock> within the selection.
	else {
		// Walk backward so positions we're about to collect here do not get outdated when
		// inserting or deleting using the writer.
		const walker = selection.getFirstRange().getWalker( {
			ignoreElementEnd: true,
			direction: 'backward'
		} );

		for ( const { item } of walker ) {
			if ( item.is( 'textProxy' ) && item.parent.is( 'codeBlock' ) ) {
				const leadingWhiteSpaces = getLeadingWhiteSpaces( item.textNode );
				const { parent, startOffset } = item.textNode;

				// Make sure the position is after all leading whitespaces in the text node.
				const position = model.createPositionAt( parent, startOffset + leadingWhiteSpaces.length );

				positions.push( position );
			}
		}
	}

	return positions;
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
	if ( !nodeAtPosition || nodeAtPosition.is( 'softBreak' ) ) {
		nodeAtPosition = position.nodeBefore;
	}

	// <codeBlock>^</codeBlock>
	// <codeBlock>foo^<softBreak></softBreak>bar</codeBlock>
	if ( !nodeAtPosition || nodeAtPosition.is( 'softBreak' ) ) {
		return null;
	}

	return nodeAtPosition;
}
