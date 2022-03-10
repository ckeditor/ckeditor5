/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import TextTransformation from '../src/texttransformation';
import Typing from '../src/typing';

describe( 'Text transformation feature - integration', () => {
	let editorElement, editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'with undo', () => {
		beforeEach( () => {
			return ClassicTestEditor
				.create( editorElement, { plugins: [ Typing, Paragraph, TextTransformation, UndoEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should undo text transformation', () => {
			editor.setData( '<p>foo</p>' );

			model.enqueueChange( model.createBatch(), writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
				writer.insertText( '(c', doc.selection.focus );
			} );

			editor.execute( 'input', { text: ')' } );

			expect( editor.getData(), 'inserted text' ).to.equal( '<p>foo©</p>' );

			editor.execute( 'undo' );

			expect( editor.getData(), 'after undo' ).to.equal( '<p>foo(c)</p>' );

			editor.execute( 'redo' );

			expect( editor.getData(), 'after redo' ).to.equal( '<p>foo©</p>' );
		} );

		it( 'should allow to undo-redo steps', () => {
			editor.setData( '<p></p>' );

			model.enqueueChange( model.createBatch(), writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
				writer.insertText( 'foo bar baz(c', doc.selection.focus );
			} );

			editor.execute( 'input', { text: ')' } );

			expect( editor.getData() ).to.equal( '<p>foo bar baz©</p>' );

			editor.execute( 'undo' );
			expect( editor.getData() ).to.equal( '<p>foo bar baz(c)</p>' );

			editor.execute( 'undo' );
			expect( editor.getData() ).to.equal( '<p>foo bar baz(c</p>' );

			editor.execute( 'redo' );
			expect( editor.getData() ).to.equal( '<p>foo bar baz(c)</p>' );

			editor.execute( 'redo' );
			expect( editor.getData() ).to.equal( '<p>foo bar baz©</p>' );
		} );
	} );
} );
