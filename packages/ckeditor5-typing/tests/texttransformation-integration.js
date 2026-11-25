/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { ListEditing } from '@ckeditor/ckeditor5-list';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { TextTransformation } from '../src/texttransformation.js';
import { Typing } from '../src/typing.js';

describe( 'Text transformation feature - integration', () => {
	let editorElement, editor, model, doc;

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

			editor.execute( 'insertText', { text: ')' } );

			expect( editor.getData(), 'inserted text' ).toEqual( '<p>foo©</p>' );

			editor.execute( 'undo' );

			expect( editor.getData(), 'after undo' ).toEqual( '<p>foo(c)</p>' );

			editor.execute( 'redo' );

			expect( editor.getData(), 'after redo' ).toEqual( '<p>foo©</p>' );
		} );

		it( 'should allow to undo-redo steps', () => {
			editor.setData( '<p></p>' );

			model.enqueueChange( model.createBatch(), writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
				writer.insertText( 'foo bar baz(c', doc.selection.focus );
			} );

			editor.execute( 'insertText', { text: ')' } );

			expect( editor.getData() ).toEqual( '<p>foo bar baz©</p>' );

			editor.execute( 'undo' );
			expect( editor.getData() ).toEqual( '<p>foo bar baz(c)</p>' );

			editor.execute( 'undo' );
			expect( editor.getData() ).toEqual( '<p>foo bar baz(c</p>' );

			editor.execute( 'redo' );
			expect( editor.getData() ).toEqual( '<p>foo bar baz(c)</p>' );

			editor.execute( 'redo' );
			expect( editor.getData() ).toEqual( '<p>foo bar baz©</p>' );
		} );
	} );

	describe( 'with autoformat', () => {
		beforeEach( () => {
			return ClassicTestEditor
				.create( editorElement, { plugins: [ Typing, Paragraph, TextTransformation, UndoEditing, Autoformat, ListEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should create a numbered list from "8) " typed at the beginning of a paragraph', () => {
			_setModelData( model, '<paragraph>[]</paragraph>' );

			simulateTyping( '8) ' );

			const paragraph = doc.getRoot().getChild( 0 );

			expect( paragraph.getAttribute( 'listType' ) ).toEqual( 'numbered' );
			expect( paragraph.isEmpty ).toBe( true );
		} );

		// The feature is disabled and enabled again, for example, when the selection goes through inline code.
		// Then the text transformation listener is added again, after the block autoformat listener. So the block
		// autoformat change runs first and removes the matched text before the text transformation change runs.
		it( 'should not fail when a block autoformat changes the matched text first', () => {
			const textTransformation = editor.plugins.get( TextTransformation );

			textTransformation.isEnabled = false;
			textTransformation.isEnabled = true;

			_setModelData( model, '<paragraph>[]</paragraph>' );

			expect( () => simulateTyping( '8) ' ) ).not.toThrow();

			const paragraph = doc.getRoot().getChild( 0 );

			expect( paragraph.getAttribute( 'listType' ) ).toEqual( 'numbered' );
			expect( paragraph.isEmpty ).toBe( true );
		} );

		function simulateTyping( text ) {
			for ( const letter of text.split( '' ) ) {
				editor.execute( 'insertText', { text: letter } );
			}
		}
	} );
} );
