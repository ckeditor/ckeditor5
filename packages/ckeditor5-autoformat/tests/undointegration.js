/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Autoformat from '../src/autoformat';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import CodeEditing from '@ckeditor/ckeditor5-basic-styles/src/code/codeediting';
import StrikethroughEditing from '@ckeditor/ckeditor5-basic-styles/src/strikethrough/strikethroughediting';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import Undo from '@ckeditor/ckeditor5-undo/src/undoediting';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { DomEventData } from '@ckeditor/ckeditor5-engine';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Autoformat undo integration', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'inline', () => {
		beforeEach( createVirtualEditorInstance );

		it( 'should undo replacing "**" with bold', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should undo replacing "__" with bold', () => {
			setData( model, '<paragraph>__foobar_[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>__foobar__[]</paragraph>' );
		} );

		it( 'should undo replacing "*" with italic', () => {
			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should undo replacing "_" with italic', () => {
			setData( model, '<paragraph>_foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>_foobar_[]</paragraph>' );
		} );

		it( 'should undo replacing "`" with code', () => {
			setData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>`foobar`[]</paragraph>' );
		} );

		it( 'should undo replacing "~~" with strikethrough', () => {
			setData( model, '<paragraph>~~foobar~[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '~', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text strikethrough="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>~~foobar~~[]</paragraph>' );
		} );
	} );

	describe( 'block', () => {
		beforeEach( createVirtualEditorInstance );

		it( 'should work when replacing asterisk', () => {
			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>* []</paragraph>' );
		} );

		it( 'should work when replacing minus character', () => {
			setData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the dot format', () => {
			setData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );

			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>1. []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the parenthesis format', () => {
			setData( model, '<paragraph>1)[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>1) []</paragraph>' );
		} );

		it( 'should work when replacing hash character with heading', () => {
			setData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph># []</paragraph>' );
		} );

		it( 'should work when replacing two hash characters with heading level 2', () => {
			setData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading2>[]</heading2>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
		} );

		it( 'should work when replacing greater-than character with block quote', () => {
			setData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>> []</paragraph>' );
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
						ListEditing,
						Delete,
						Undo
					]
				} );

			editor = newEditor;
			model = editor.model;
			doc = model.document;
			viewDocument = editor.editing.view.document;
			deleteEvent = new DomEventData(
				viewDocument,
				{ preventDefault: sinon.spy() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);
		} );

		it( 'should undo after inline autoformat', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( getData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should undo after block autoformat', () => {
			setData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( getData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should not undo after selection has changed', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );

			model.change( writer => {
				const selection = model.createSelection();
				writer.setSelection( selection );
			} );

			viewDocument.fire( 'delete', deleteEvent );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foobar</$text></paragraph>' );
		} );
	} );

	async function createVirtualEditorInstance() {
		const newEditor = await VirtualTestEditor
			.create( {
				plugins: [
					Enter,
					Undo,
					Paragraph,
					Autoformat,
					ListEditing,
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
