/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { ShiftEnter } from 'ckeditor5/src/enter';
import { UpcastWriter } from 'ckeditor5/src/engine';

import CodeBlockCommand from './codeblockcommand';
import IndentCodeBlockCommand from './indentcodeblockcommand';
import OutdentCodeBlockCommand from './outdentcodeblockcommand';
import {
	getNormalizedAndLocalizedLanguageDefinitions,
	getLeadingWhiteSpaces,
	rawSnippetTextToViewDocumentFragment
} from './utils';
import {
	modelToViewCodeBlockInsertion,
	modelToDataViewSoftBreakInsertion,
	dataViewToModelCodeBlockInsertion,
	dataViewToModelTextNewlinesInsertion
} from './converters';

const DEFAULT_ELEMENT = 'paragraph';

/**
 * The editing part of the code block feature.
 *
 * Introduces the `'codeBlock'` command and the `'codeBlock'` model element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlockEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CodeBlockEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ShiftEnter ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'codeBlock', {
			languages: [
				{ language: 'plaintext', label: 'Plain text' },
				{ language: 'c', label: 'C' },
				{ language: 'cs', label: 'C#' },
				{ language: 'cpp', label: 'C++' },
				{ language: 'css', label: 'CSS' },
				{ language: 'diff', label: 'Diff' },
				{ language: 'html', label: 'HTML' },
				{ language: 'java', label: 'Java' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'php', label: 'PHP' },
				{ language: 'python', label: 'Python' },
				{ language: 'ruby', label: 'Ruby' },
				{ language: 'typescript', label: 'TypeScript' },
				{ language: 'xml', label: 'XML' }
			],

			// A single tab.
			indentSequence: '\t'
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const model = editor.model;
		const view = editor.editing.view;

		const normalizedLanguagesDefs = getNormalizedAndLocalizedLanguageDefinitions( editor );

		// The main command.
		editor.commands.add( 'codeBlock', new CodeBlockCommand( editor ) );

		// Commands that change the indentation.
		editor.commands.add( 'indentCodeBlock', new IndentCodeBlockCommand( editor ) );
		editor.commands.add( 'outdentCodeBlock', new OutdentCodeBlockCommand( editor ) );

		const getCommandExecuter = commandName => {
			return ( data, cancel ) => {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );
					cancel();
				}
			};
		};

		editor.keystrokes.set( 'Tab', getCommandExecuter( 'indentCodeBlock' ) );
		editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( 'outdentCodeBlock' ) );

		schema.register( 'codeBlock', {
			allowWhere: '$block',
			allowChildren: '$text',
			isBlock: true,
			allowAttributes: [ 'language' ]
		} );

		// Disallow all attributes on $text inside `codeBlock`.
		schema.addAttributeCheck( context => {
			if ( context.endsWith( 'codeBlock $text' ) ) {
				return false;
			}
		} );

		// Disallow object elements inside `codeBlock`. See #9567.
		editor.model.schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'codeBlock' ) && childDefinition.isObject ) {
				return false;
			}
		} );

		// Conversion.
		editor.editing.downcastDispatcher.on( 'insert:codeBlock', modelToViewCodeBlockInsertion( model, normalizedLanguagesDefs, true ) );
		editor.data.downcastDispatcher.on( 'insert:codeBlock', modelToViewCodeBlockInsertion( model, normalizedLanguagesDefs ) );
		editor.data.downcastDispatcher.on( 'insert:softBreak', modelToDataViewSoftBreakInsertion( model ), { priority: 'high' } );

		editor.data.upcastDispatcher.on( 'element:code', dataViewToModelCodeBlockInsertion( view, normalizedLanguagesDefs ) );
		editor.data.upcastDispatcher.on( 'text', dataViewToModelTextNewlinesInsertion() );

		// Intercept the clipboard input (paste) when the selection is anchored in the code block and force the clipboard
		// data to be pasted as a single plain text. Otherwise, the code lines will split the code block and
		// "spill out" as separate paragraphs.
		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
			let insertionRange = model.createRange( model.document.selection.anchor );

			// Use target ranges in case this is a drop.
			if ( data.targetRanges ) {
				insertionRange = editor.editing.mapper.toModelRange( data.targetRanges[ 0 ] );
			}

			if ( !insertionRange.start.parent.is( 'element', 'codeBlock' ) ) {
				return;
			}

			const text = data.dataTransfer.getData( 'text/plain' );
			const writer = new UpcastWriter( editor.editing.view.document );

			// Pass the view fragment to the default clipboardInput handler.
			data.content = rawSnippetTextToViewDocumentFragment( writer, text );
		} );

		// Make sure multi–line selection is always wrapped in a code block when `getSelectedContent()`
		// is used (e.g. clipboard copy). Otherwise, only the raw text will be copied to the clipboard and,
		// upon next paste, this bare text will not be inserted as a code block, which is not the best UX.
		// Similarly, when the selection in a single line, the selected content should be an inline code
		// so it can be pasted later on and retain it's preformatted nature.
		this.listenTo( model, 'getSelectedContent', ( evt, [ selection ] ) => {
			const anchor = selection.anchor;

			if ( selection.isCollapsed || !anchor.parent.is( 'element', 'codeBlock' ) || !anchor.hasSameParentAs( selection.focus ) ) {
				return;
			}

			model.change( writer => {
				const docFragment = evt.return;

				// fo[o<softBreak></softBreak>b]ar  ->   <codeBlock language="...">[o<softBreak></softBreak>b]<codeBlock>
				if ( docFragment.childCount > 1 || selection.containsEntireContent( anchor.parent ) ) {
					const codeBlock = writer.createElement( 'codeBlock', anchor.parent.getAttributes() );
					writer.append( docFragment, codeBlock );

					const newDocumentFragment = writer.createDocumentFragment();
					writer.append( codeBlock, newDocumentFragment );

					evt.return = newDocumentFragment;
				}

				// "f[oo]"                          ->   <$text code="true">oo</text>
				else {
					const textNode = docFragment.getChild( 0 );

					if ( schema.checkAttribute( textNode, 'code' ) ) {
						writer.setAttribute( 'code', true, textNode );
					}
				}
			} );
		} );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const commands = editor.commands;
		const indent = commands.get( 'indent' );
		const outdent = commands.get( 'outdent' );

		if ( indent ) {
			indent.registerChildCommand( commands.get( 'indentCodeBlock' ) );
		}

		if ( outdent ) {
			outdent.registerChildCommand( commands.get( 'outdentCodeBlock' ) );
		}

		// Customize the response to the <kbd>Enter</kbd> and <kbd>Shift</kbd>+<kbd>Enter</kbd>
		// key press when the selection is in the code block. Upon enter key press we can either
		// leave the block if it's "two or three enters" in a row or create a new code block line, preserving
		// previous line's indentation.
		this.listenTo( editor.editing.view.document, 'enter', ( evt, data ) => {
			const positionParent = editor.model.document.selection.getLastPosition().parent;

			if ( !positionParent.is( 'element', 'codeBlock' ) ) {
				return;
			}

			if ( !leaveBlockStartOnEnter( editor, data.isSoft ) && !leaveBlockEndOnEnter( editor, data.isSoft ) ) {
				breakLineOnEnter( editor );
			}

			data.preventDefault();
			evt.stop();
		}, { context: 'pre' } );
	}
}

// Normally, when the Enter (or Shift+Enter) key is pressed, a soft line break is to be added to the
// code block. Let's try to follow the indentation of the previous line when possible, for instance:
//
//		// Before pressing enter (or shift enter)
//		<codeBlock>
//		"    foo()"[]                   // Indent of 4 spaces.
//		</codeBlock>
//
//		// After pressing:
//		<codeBlock>
//		"    foo()"                 // Indent of 4 spaces.
//		<softBreak></softBreak>     // A new soft break created by pressing enter.
//		"    "[]                    // Retain the indent of 4 spaces.
//		</codeBlock>
//
// @param {module:core/editor/editor~Editor} editor
function breakLineOnEnter( editor ) {
	const model = editor.model;
	const modelDoc = model.document;
	const lastSelectionPosition = modelDoc.selection.getLastPosition();
	const node = lastSelectionPosition.nodeBefore || lastSelectionPosition.textNode;
	let leadingWhiteSpaces;

	// Figure out the indentation (white space chars) at the beginning of the line.
	if ( node && node.is( '$text' ) ) {
		leadingWhiteSpaces = getLeadingWhiteSpaces( node );
	}

	// Keeping everything in a change block for a single undo step.
	editor.model.change( writer => {
		editor.execute( 'shiftEnter' );

		// If the line before being broken in two had some indentation, let's retain it
		// in the new line.
		if ( leadingWhiteSpaces ) {
			writer.insertText( leadingWhiteSpaces, modelDoc.selection.anchor );
		}
	} );
}

// Leave the code block when Enter (but NOT Shift+Enter) has been pressed twice at the beginning
// of the code block:
//
//		// Before:
//		<codeBlock>[]<softBreak></softBreak>foo</codeBlock>
//
//		// After pressing:
//		<paragraph>[]</paragraph><codeBlock>foo</codeBlock>
//
// @param {module:core/editor/editor~Editor} editor
// @param {Boolean} isSoftEnter When `true`, enter was pressed along with <kbd>Shift</kbd>.
// @returns {Boolean} `true` when selection left the block. `false` if stayed.
function leaveBlockStartOnEnter( editor, isSoftEnter ) {
	const model = editor.model;
	const modelDoc = model.document;
	const view = editor.editing.view;
	const lastSelectionPosition = modelDoc.selection.getLastPosition();
	const nodeAfter = lastSelectionPosition.nodeAfter;

	if ( isSoftEnter || !modelDoc.selection.isCollapsed || !lastSelectionPosition.isAtStart ) {
		return false;
	}

	if ( !isSoftBreakNode( nodeAfter ) ) {
		return false;
	}

	// We're doing everything in a single change block to have a single undo step.
	editor.model.change( writer => {
		// "Clone" the <codeBlock> in the standard way.
		editor.execute( 'enter' );

		// The cloned block exists now before the original code block.
		const newBlock = modelDoc.selection.anchor.parent.previousSibling;

		// Make the cloned <codeBlock> a regular <paragraph> (with clean attributes, so no language).
		writer.rename( newBlock, DEFAULT_ELEMENT );
		writer.setSelection( newBlock, 'in' );
		editor.model.schema.removeDisallowedAttributes( [ newBlock ], writer );

		// Remove the <softBreak> that originally followed the selection position.
		writer.remove( nodeAfter );
	} );

	// Eye candy.
	view.scrollToTheSelection();

	return true;
}

// Leave the code block when Enter (but NOT Shift+Enter) has been pressed twice at the end
// of the code block:
//
//		// Before:
//		<codeBlock>foo[]</codeBlock>
//
//		// After first press:
//		<codeBlock>foo<softBreak></softBreak>[]</codeBlock>
//
//		// After second press:
//		<codeBlock>foo</codeBlock><paragraph>[]</paragraph>
//
// @param {module:core/editor/editor~Editor} editor
// @param {Boolean} isSoftEnter When `true`, enter was pressed along with <kbd>Shift</kbd>.
// @returns {Boolean} `true` when selection left the block. `false` if stayed.
function leaveBlockEndOnEnter( editor, isSoftEnter ) {
	const model = editor.model;
	const modelDoc = model.document;
	const view = editor.editing.view;
	const lastSelectionPosition = modelDoc.selection.getLastPosition();
	const nodeBefore = lastSelectionPosition.nodeBefore;

	let emptyLineRangeToRemoveOnEnter;

	if ( isSoftEnter || !modelDoc.selection.isCollapsed || !lastSelectionPosition.isAtEnd || !nodeBefore || !nodeBefore.previousSibling ) {
		return false;
	}

	// When the position is directly preceded by two soft breaks
	//
	//		<codeBlock>foo<softBreak></softBreak><softBreak></softBreak>[]</codeBlock>
	//
	// it creates the following range that will be cleaned up before leaving:
	//
	//		<codeBlock>foo[<softBreak></softBreak><softBreak></softBreak>]</codeBlock>
	//
	if ( isSoftBreakNode( nodeBefore ) && isSoftBreakNode( nodeBefore.previousSibling ) ) {
		emptyLineRangeToRemoveOnEnter = model.createRange(
			model.createPositionBefore( nodeBefore.previousSibling ), model.createPositionAfter( nodeBefore )
		);
	}

	// When there's some text before the position that is
	// preceded by two soft breaks and made purely of white–space characters
	//
	//		<codeBlock>foo<softBreak></softBreak><softBreak></softBreak>    []</codeBlock>
	//
	// it creates the following range to clean up before leaving:
	//
	//		<codeBlock>foo[<softBreak></softBreak><softBreak></softBreak>    ]</codeBlock>
	//
	else if (
		isEmptyishTextNode( nodeBefore ) &&
		isSoftBreakNode( nodeBefore.previousSibling ) &&
		isSoftBreakNode( nodeBefore.previousSibling.previousSibling )
	) {
		emptyLineRangeToRemoveOnEnter = model.createRange(
			model.createPositionBefore( nodeBefore.previousSibling.previousSibling ), model.createPositionAfter( nodeBefore )
		);
	}

	// When there's some text before the position that is made purely of white–space characters
	// and is preceded by some other text made purely of white–space characters
	//
	//		<codeBlock>foo<softBreak></softBreak>    <softBreak></softBreak>    []</codeBlock>
	//
	// it creates the following range to clean up before leaving:
	//
	//		<codeBlock>foo[<softBreak></softBreak>    <softBreak></softBreak>    ]</codeBlock>
	//
	else if (
		isEmptyishTextNode( nodeBefore ) &&
		isSoftBreakNode( nodeBefore.previousSibling ) &&
		isEmptyishTextNode( nodeBefore.previousSibling.previousSibling ) &&
		isSoftBreakNode( nodeBefore.previousSibling.previousSibling.previousSibling )
	) {
		emptyLineRangeToRemoveOnEnter = model.createRange(
			model.createPositionBefore( nodeBefore.previousSibling.previousSibling.previousSibling ),
			model.createPositionAfter( nodeBefore )
		);
	}

	// Not leaving the block in the following cases:
	//
	//		<codeBlock>    []</codeBlock>
	//		<codeBlock>  a []</codeBlock>
	//		<codeBlock>foo<softBreak></softBreak>[]</codeBlock>
	//		<codeBlock>foo<softBreak></softBreak><softBreak></softBreak>bar[]</codeBlock>
	//		<codeBlock>foo<softBreak></softBreak><softBreak></softBreak> a []</codeBlock>
	//
	else {
		return false;
	}

	// We're doing everything in a single change block to have a single undo step.
	editor.model.change( writer => {
		// Remove the last <softBreak>s and all white space characters that followed them.
		writer.remove( emptyLineRangeToRemoveOnEnter );

		// "Clone" the <codeBlock> in the standard way.
		editor.execute( 'enter' );

		const newBlock = modelDoc.selection.anchor.parent;

		// Make the cloned <codeBlock> a regular <paragraph> (with clean attributes, so no language).
		writer.rename( newBlock, DEFAULT_ELEMENT );
		editor.model.schema.removeDisallowedAttributes( [ newBlock ], writer );
	} );

	// Eye candy.
	view.scrollToTheSelection();

	return true;
}

function isEmptyishTextNode( node ) {
	return node && node.is( '$text' ) && !node.data.match( /\S/ );
}

function isSoftBreakNode( node ) {
	return node && node.is( 'element', 'softBreak' );
}
