/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BaseBalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/paragraph';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard/clipboard';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter/enter';
import { Typing } from '@ckeditor/ckeditor5-typing/typing';
import { Undo } from '@ckeditor/ckeditor5-undo/undo';
import { SelectAll } from '@ckeditor/ckeditor5-select-all/selectall';

import BalloonEditor from '../src/ckeditor';

describe( 'CKEditor balloon DLL build', () => {
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
			expect( BalloonEditor.builtinPlugins ).to.deep.equal( [
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
			expect( BalloonEditor.defaultConfig.toolbar ).to.not.be.empty;
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return BalloonEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the BalloonEditor', () => {
			expect( editor ).to.be.instanceof( BalloonEditor );
			expect( editor ).to.be.instanceof( BaseBalloonEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p>foo bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			return BalloonEditor.create( editorElement )
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
