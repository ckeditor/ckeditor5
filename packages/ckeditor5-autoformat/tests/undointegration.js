/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Autoformat } from '../src/autoformat.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { LegacyListEditing } from '@ckeditor/ckeditor5-list/src/legacylist/legacylistediting.js';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import { CodeEditing } from '@ckeditor/ckeditor5-basic-styles/src/code/codeediting.js';
import { StrikethroughEditing } from '@ckeditor/ckeditor5-basic-styles/src/strikethrough/strikethroughediting.js';
import { ItalicEditing } from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting.js';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import { Enter } from '@ckeditor/ckeditor5-enter/src/enter.js';
import { Delete } from '@ckeditor/ckeditor5-typing/src/delete.js';
import { UndoEditing } from '@ckeditor/ckeditor5-undo/src/undoediting.js';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { ObserverDomEventData } from '@ckeditor/ckeditor5-engine';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'Autoformat undo integration', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'inline', () => {
		beforeEach( createVirtualEditorInstance );

		it( 'should undo replacing "**" with bold', () => {
			_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should undo replacing "__" with bold', () => {
			_setModelData( model, '<paragraph>__foobar_[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>__foobar__[]</paragraph>' );
		} );

		it( 'should undo replacing "*" with italic', () => {
			_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should undo replacing "_" with italic', () => {
			_setModelData( model, '<paragraph>_foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>_foobar_[]</paragraph>' );
		} );

		it( 'should undo replacing "`" with code', () => {
			_setModelData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>`foobar`[]</paragraph>' );
		} );

		it( 'should undo replacing "~~" with strikethrough', () => {
			_setModelData( model, '<paragraph>~~foobar~[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '~', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text strikethrough="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>~~foobar~~[]</paragraph>' );
		} );
	} );

	describe( 'block', () => {
		beforeEach( createVirtualEditorInstance );

		it( 'should work when replacing asterisk', () => {
			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>* []</paragraph>' );
		} );

		it( 'should work when replacing minus character', () => {
			_setModelData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the dot format', () => {
			_setModelData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );

			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>1. []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the parenthesis format', () => {
			_setModelData( model, '<paragraph>1)[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>1) []</paragraph>' );
		} );

		it( 'should work when replacing hash character with heading', () => {
			_setModelData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<heading1>[]</heading1>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph># []</paragraph>' );
		} );

		it( 'should work when replacing two hash characters with heading level 2', () => {
			_setModelData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<heading2>[]</heading2>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
		} );

		it( 'should work when replacing greater-than character with block quote', () => {
			_setModelData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).to.equal( '<paragraph>> []</paragraph>' );
		} );
	} );

	describe( 'by pressing backspace', () => {
		let viewDocument, deleteEvent;

		beforeEach( async () => {
			const newEditor = await ModelTestEditor
				.create( {
					plugins: [
						Autoformat,
						Paragraph,
						BoldEditing,
						LegacyListEditing,
						Delete,
						UndoEditing
					]
				} );

			editor = newEditor;
			model = editor.model;
			doc = model.document;
			viewDocument = editor.editing.view.document;
			deleteEvent = new ObserverDomEventData(
				viewDocument,
				{ preventDefault: sinon.spy() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);
		} );

		it( 'should undo after inline autoformat', () => {
			_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( _getModelData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should undo after block autoformat', () => {
			_setModelData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( _getModelData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should not undo after selection has changed', () => {
			_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );

			model.change( writer => {
				const selection = model.createSelection();
				writer.setSelection( selection );
			} );

			viewDocument.fire( 'delete', deleteEvent );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foobar</$text></paragraph>' );
		} );
	} );

	async function createVirtualEditorInstance() {
		const newEditor = await VirtualTestEditor
			.create( {
				plugins: [
					Enter,
					UndoEditing,
					Paragraph,
					Autoformat,
					LegacyListEditing,
					HeadingEditing,
					BoldEditing,
					ItalicEditing,
					CodeEditing,
					StrikethroughEditing,
					BlockQuoteEditing
				]
			} );

		editor = newEditor;
		model = editor.model;
		doc = model.document;
	}
} );
