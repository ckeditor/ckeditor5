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
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDoc = view.document;

		this.listenTo( viewDoc, 'enter', ( evt, data ) => {
			const doc = editor.model.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if ( positionParent.is( 'codeBlock' ) ) {
				const lastPosition = doc.selection.getLastPosition();
				const isSoftBreakBefore = lastPosition.nodeBefore && lastPosition.nodeBefore.is( 'softBreak' );

				if ( doc.selection.isCollapsed && lastPosition.isAtEnd && isSoftBreakBefore ) {
					editor.model.change( writer => {
						writer.remove( lastPosition.nodeBefore );
						editor.execute( 'enter' );

						const newBlock = doc.selection.anchor.parent;
						writer.rename( newBlock, DEFAULT_ELEMENT );
						editor.model.schema.removeDisallowedAttributes( [ newBlock ], writer );
						view.scrollToTheSelection();
					} );
				} else {
					editor.execute( 'shiftEnter' );
				}

				data.preventDefault();
				evt.stop();
			}
		} );
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
