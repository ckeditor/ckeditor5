/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BaseClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { Paragraph } from 'ckeditor5/src/paragraph';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { Enter, ShiftEnter } from 'ckeditor5/src/enter';
import { Typing } from 'ckeditor5/src/typing';
import { Undo } from 'ckeditor5/src/undo';
import { SelectAll } from 'ckeditor5/src/selectall';

import ClassicEditor from '../src/ckeditor';

describe( 'CKEditor classic DLL build', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'build', () => {
		it( 'contains plugins', () => {
			expect( ClassicEditor.builtinPlugins ).to.deep.equal( [
				Clipboard,
				Enter,
				Paragraph,
				SelectAll,
				ShiftEnter,
				Typing,
				Undo
			] );
		} );

		it( 'contains config', () => {
			expect( ClassicEditor.defaultConfig.toolbar ).to.not.be.empty;
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return ClassicEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the ClassicEditor', () => {
			expect( editor ).to.be.instanceof( ClassicEditor );
			expect( editor ).to.be.instanceof( BaseClassicEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p>foo bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			return ClassicEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'sets the data back to the editor element', () => {
			editor.setData( '<p>foo</p>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML ).to.equal( '<p>foo</p>' );
				} );
		} );
	} );
} );
