/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import CodeBlockCommand from './codeblockcommand';
import { getLocalizedLanguageDefinitions } from './utils';

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
				{ class: 'plaintext', label: 'Plain text' },
				{ class: 'c', label: 'C' },
				{ class: 'cs', label: 'C#' },
				{ class: 'cpp', label: 'C++' },
				{ class: 'css', label: 'CSS' },
				{ class: 'diff', label: 'Diff' },
				{ class: 'xml', label: 'HTML/XML' },
				{ class: 'java', label: 'Java' },
				{ class: 'javascript', label: 'JavaScript' },
				{ class: 'php', label: 'PHP' },
				{ class: 'python', label: 'Python' },
				{ class: 'ruby', label: 'Ruby' },
				{ class: 'typescript', label: 'TypeScript' },
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const model = editor.model;

		const localizedLanguageDefinitions = getLocalizedLanguageDefinitions( editor );
		const languageClasses = localizedLanguageDefinitions.map( def => def.class );
		const languageLabels = Object.assign( {}, ...localizedLanguageDefinitions.map( def => ( { [ def.class ]: def.label } ) ) );

		// Command.
		editor.commands.add( 'codeBlock', new CodeBlockCommand( editor ) );

		// Schema.
		schema.register( 'codeBlock', {
			inheritAllFrom: '$block',
			allowAttributes: [ 'language' ]
		} );

		// Disallow codeBlock in codeBlock.
		schema.addChildCheck( ( context, childDef ) => {
			if ( context.endsWith( 'codeBlock' ) && childDef.name === 'codeBlock' ) {
				return false;
			}
		} );

		// Disallow all attributes in `codeBlock`.
		schema.addAttributeCheck( ( context, attributeName ) => {
			if ( context.endsWith( 'codeBlock' ) || context.endsWith( 'codeBlock $text' ) ) {
				return attributeName === 'language';
			}
		} );

		// Conversion.
		editor.editing.downcastDispatcher.on( 'insert:codeBlock', modelToViewCodeBlockInsertion( model, languageLabels ) );
		editor.data.downcastDispatcher.on( 'insert:codeBlock', modelToViewCodeBlockInsertion( model ) );
		editor.data.downcastDispatcher.on( 'insert:softBreak', modelToViewSoftBreakInsertion( model ), { priority: 'high' } );
		editor.data.upcastDispatcher.on( 'element:pre', dataViewToModelCodeBlockInsertion( editor.data, languageClasses ) );

		// Intercept the clipboard input when the selection is anchored in the code block and force the clipboard
		// data to be pasted as a single plain text. Otherwise, the code lines will split the code block and
		// "spill out" as separate paragraphs.
		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
			const modelSelection = model.document.selection;

			if ( !modelSelection.anchor.parent.is( 'codeBlock' ) ) {
				return;
			}

			const text = data.dataTransfer.getData( 'text/plain' );

			model.change( writer => {
				model.insertContent( rawSnippetTextToModelDocumentFragment( writer, text ), modelSelection );
				evt.stop();
			} );
		} );

		// Make sure multi–line selection is always wrapped in a code block. Otherwise, only the raw text
		// will be copied to the clipboard by the user and, upon the next paste, this bare text will not be
		// inserted as a code block, which is not the best UX.
		// Similarly, when the selection in a single line, the selected content should be an inline
		// code so it can be pasted later on and retain it's preformatted nature.
		this.listenTo( model, 'getSelectedContent', ( evt, [ selection ] ) => {
			const anchor = selection.anchor;

			if ( !anchor.parent.is( 'codeBlock' ) || !anchor.hasSameParentAs( selection.focus ) ) {
				return;
			}

			model.change( writer => {
				const docFragment = evt.return;

				// From:
				//
				//		fo[o
				//		<softBreak></softBreak>
				//		b]ar
				//
				// into:
				//
				//		<codeBlock language="...">
				//			[o
				//			<softBreak></softBreak>
				//			b]
				//		<codeBlock>
				//
				if ( docFragment.childCount > 1 || selection.containsEntireContent( anchor.parent ) ) {
					const codeBlock = writer.createElement( 'codeBlock', anchor.parent.getAttributes() );
					writer.append( docFragment, codeBlock );

					const newDocumentFragment = writer.createDocumentFragment();
					writer.append( codeBlock, newDocumentFragment );

					evt.return = newDocumentFragment;
				}

				// From:
				//
				//		f[oo]
				//
				// into:
				//
				//		<$text code="true">oo</text>
				//
				else {
					writer.setAttribute( 'code', true, docFragment.getChild( 0 ) );
				}
			} );
		} );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const view = editor.editing.view;
		const model = editor.model;
		const modelDoc = model.document;

		this.listenTo( view.document, 'enter', ( evt, data ) => {
			const positionParent = modelDoc.selection.getLastPosition().parent;

			if ( !positionParent.is( 'codeBlock' ) ) {
				return;
			}

			// Upon enter key press we can either leave the block if it's "two enters" in a row
			// or create a new code block line, preserving previous line's indentation.
			leaveBlock( data.isSoft ) || breakLine();

			data.preventDefault();
			evt.stop();
		} );

		// Normally, when the enter (or shift+enter) key is pressed, a soft line break is to be added to the
		// code block. Let's try to follow the indentation of the previous line when possible, for instance:
		//
		//		// Before pressing enter (or shift enter)
		//		<codeBlock>
		//		"    foo()"[]                   // Indent of 4 spaces.
		//		</codeBlock>
		//
		//		// After pressing:
		//		<codeBlock>
		//			"    foo()"                 // Indent of 4 spaces.
		//			<softBreak></softBreak>     // A new soft break created by pressing enter.
		//			"    "[]                    // Retain the indent of 4 spaces.
		//		</codeBlock>
		function breakLine() {
			const lastSelectionPosition = modelDoc.selection.getLastPosition();
			const node = lastSelectionPosition.nodeBefore || lastSelectionPosition.textNode;
			let leadingWhiteSpaces;

			// Figure out the indentation (white space chars) at the beginning of the line.
			if ( node && node.is( 'text' ) ) {
				leadingWhiteSpaces = node.data.match( /^(\s*)/ )[ 0 ];
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

		// Leave the code block when enter (but NOT shift+enter) has been pressed twice at the end
		// of the code block:
		//
		//		// Before:
		//		<codeBlock>foo[]</codeBlock>
		//
		//		// After first press
		//		<codeBlock>foo<softBreak></softBreak>[]</codeBlock>
		//
		//		// After second press
		//		<codeBlock>foo</codeBlock><paragraph>[]</paragraph>
		//
		function leaveBlock( isSoftEnter ) {
			const lastSelectionPosition = modelDoc.selection.getLastPosition();
			const nodeBefore = lastSelectionPosition.nodeBefore;

			let emptyLineRangeToRemoveOnDoubleEnter;

			if ( isSoftEnter || !modelDoc.selection.isCollapsed || !lastSelectionPosition.isAtEnd || !nodeBefore ) {
				return false;
			}

			// When the position is directly preceded by a soft break
			//
			//		<codeBlock>foo<softBreak></softBreak>[]</codeBlock>
			//
			// it creates the following range that will be cleaned up before leaving:
			//
			//		<codeBlock>foo[<softBreak></softBreak>]</codeBlock>
			//
			if ( nodeBefore.is( 'softBreak' ) ) {
				emptyLineRangeToRemoveOnDoubleEnter = model.createRangeOn( nodeBefore );
			}

			// When there's some text before the position made purely of white–space characters
			//
			//		<codeBlock>foo<softBreak></softBreak>    []</codeBlock>
			//
			// but NOT when it's the first one of the kind
			//
			//		<codeBlock>    []</codeBlock>
			//
			// it creates the following range to clean up before leaving:
			//
			//		<codeBlock>foo[<softBreak></softBreak>    ]</codeBlock>
			//
			else if (
				nodeBefore.is( 'text' ) &&
				!nodeBefore.data.match( /\S/ ) &&
				nodeBefore.previousSibling &&
				nodeBefore.previousSibling.is( 'softBreak' )
			) {
				emptyLineRangeToRemoveOnDoubleEnter = model.createRange(
					model.createPositionBefore( nodeBefore.previousSibling ), model.createPositionAfter( nodeBefore )
				);
			}

			// Not leaving the block in the following cases:
			//
			//		<codeBlock>    []</codeBlock>
			//		<codeBlock>  a []</codeBlock>
			//		<codeBlock>foo<softBreak></softBreak>bar[]</codeBlock>
			//		<codeBlock>foo<softBreak></softBreak> a []</codeBlock>
			//
			else {
				return false;
			}

			// We're doing everything in a single change block to have a single undo step.
			editor.model.change( writer => {
				// Remove the last <softBreak> and all white space characters that followed it.
				writer.remove( emptyLineRangeToRemoveOnDoubleEnter );

				// "Clone" the <codeBlock> in the standard way.
				editor.execute( 'enter' );

				const newBlock = modelDoc.selection.anchor.parent;

				// Make the cloned <codeBlock> a regular <paragraph> (with clean attributes, so no language).
				writer.rename( newBlock, DEFAULT_ELEMENT );
				editor.model.schema.removeDisallowedAttributes( [ newBlock ], writer );

				// Eye candy.
				view.scrollToTheSelection();
			} );

			return true;
		}
	}
}

// A model-to-view converter for the codeBlock element.
//
// @param {module:engine/model/model~Model} model
// @param {Object.<String,String>} [languageLabels] An object associating a programming language
// classes with human–readable labels (as in the editor config).
// @returns {Function} Returns a conversion callback.
function modelToViewCodeBlockInsertion( model, languageLabels = {} ) {
	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const codeBlockLanguage = data.item.getAttribute( 'language' );
		const targetViewPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
		const pre = writer.createContainerElement( 'pre', {
			// This attribute is only in the editing view.
			'data-language': languageLabels[ codeBlockLanguage ] || null
		} );
		const code = writer.createContainerElement( 'code', {
			class: codeBlockLanguage
		} );

		writer.insert( writer.createPositionAt( pre, 0 ), code );
		writer.insert( targetViewPosition, pre );
		mapper.bindElements( data.item, code );
	};
}

// A model-to-view converter for the new line separator.
//
// @param {module:engine/model/model~Model} model
// @returns {Function} Returns a conversion callback.
function modelToViewSoftBreakInsertion( model ) {
	return ( evt, data, conversionApi ) => {
		if ( data.item.parent.name !== 'codeBlock' ) {
			return;
		}

		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const position = mapper.toViewPosition( model.createPositionBefore( data.item ) );

		writer.insert( position, writer.createText( '\n' ) );
	};
}

// A view-to-model converter for pre > code html.
//
// @param {module:engine/controller/datacontroller~DataController} dataController
// @param {Array.<String>} languageClasses An array of valid (as in the editor config) CSS classes
// associated with programming languages.
// @returns {Function} Returns a conversion callback.
function dataViewToModelCodeBlockInsertion( dataController, languageClasses ) {
	return ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const viewChild = viewItem.getChild( 0 );

		if ( !viewChild || !viewChild.is( 'code' ) ) {
			return;
		}

		const { consumable, writer } = conversionApi;

		if ( !consumable.test( viewItem, { name: true } ) || !consumable.test( viewChild, { name: true } ) ) {
			return;
		}

		const codeBlock = writer.createElement( 'codeBlock' );

		// Figure out if any of the <code> element's class names is a valid programming
		// language class. If so, use it on the model element (becomes the language of the entire block).
		for ( const className of viewChild.getClassNames() ) {
			if ( languageClasses.includes( className ) ) {
				writer.setAttribute( 'language', className, codeBlock );
				break;
			}
		}

		// If no language value was set, use the default language from the config.
		if ( !codeBlock.hasAttribute( 'language' ) ) {
			writer.setAttribute( 'language', languageClasses[ 0 ], codeBlock );
		}

		const stringifiedElement = dataController.processor.toData( viewChild );
		const textData = extractDataFromCodeElement( stringifiedElement );
		const fragment = rawSnippetTextToModelDocumentFragment( writer, textData );

		writer.append( fragment, codeBlock );

		// Let's see if the codeBlock can be inserted the current modelCursor.
		const splitResult = conversionApi.splitToAllowedParent( codeBlock, data.modelCursor );

		// When there is no split result it means that we can't insert element to model tree,
		// so let's skip it.
		if ( !splitResult ) {
			return;
		}

		// Insert element on allowed position.
		writer.insert( codeBlock, splitResult.position );

		consumable.consume( viewItem, { name: true } );
		consumable.consume( viewChild, { name: true } );

		const parts = conversionApi.getSplitParts( codeBlock );

		// Set conversion result range.
		data.modelRange = writer.createRange(
			conversionApi.writer.createPositionBefore( codeBlock ),
			conversionApi.writer.createPositionAfter( parts[ parts.length - 1 ] )
		);

		// If we had to split parent to insert our element then we want to continue conversion inside
		// the split parent.
		//
		// before split:
		//
		//		<allowed><notAllowed>[]</notAllowed></allowed>
		//
		// after split:
		//
		//		<allowed>
		//			<notAllowed></notAllowed>
		//			<converted></converted>
		//			<notAllowed>[]</notAllowed>
		//		</allowed>
		if ( splitResult.cursorParent ) {
			data.modelCursor = writer.createPositionAt( splitResult.cursorParent, 0 );
		} else {
			// Otherwise just continue after the inserted element.
			data.modelCursor = data.modelRange.end;
		}
	};
}

// Returns content of `<pre></pre>` with unescaped html inside.
//
// @param {String} stringifiedElement
function extractDataFromCodeElement( stringifiedElement ) {
	const data = new RegExp( /^<code[^>]*>(.*)<\/code>$/, 's' ).exec( stringifiedElement )[ 1 ];

	return data
		.replace( /&lt;/g, '<' )
		.replace( /&gt;/g, '>' );
}

// For a plain text containing the code (snippet), it returns a document fragment containing
// model text nodes separated by soft breaks (in place of new line characters "\n"), for instance:
//
// Input:
//
//		"foo()
//		bar()"
//
// Output:
//
//		<DocumentFragment>
//			"foo()"
//			<softBreak></softBreak>
//			"bar()"
//		</DocumentFragment>
//
// @param {module:engine/model/writer~Writer} writer
// @param {String} text A raw code text to be converted.
function rawSnippetTextToModelDocumentFragment( writer, text ) {
	const fragment = writer.createDocumentFragment();
	const textLines = text.split( '\n' ).map( data => writer.createText( data ) );
	const lastLine = textLines[ textLines.length - 1 ];

	for ( const node of textLines ) {
		writer.append( node, fragment );

		if ( node !== lastLine ) {
			writer.appendElement( 'softBreak', fragment );
		}
	}

	return fragment;
}
