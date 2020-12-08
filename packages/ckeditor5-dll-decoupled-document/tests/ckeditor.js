/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BaseDecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import { Paragraph } from 'ckeditor5/src/paragraph';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { Enter, ShiftEnter } from 'ckeditor5/src/enter';
import { Typing } from 'ckeditor5/src/typing';
import { Undo } from 'ckeditor5/src/undo';
import { SelectAll } from 'ckeditor5/src/select-all';

import DecoupledEditor from '../src/ckeditor';

describe( 'CKEditor balloon DLL build', () => {
	let editor, editorData, editorElement;

	beforeEach( () => {
		editorData = '<p>foo bar</p>';

		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = editorData;

		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
		editor = null;
	} );

	describe( 'build', () => {
		it( 'contains plugins', () => {
			expect( DecoupledEditor.builtinPlugins ).to.deep.equal( [
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
			expect( DecoupledEditor.defaultConfig.toolbar ).to.not.be.empty;
		} );
	} );

	describe( 'editor with data', () => {
		test( () => editorData );

		it( 'does not define the UI DOM structure', () => {
			return DecoupledEditor.create( editorData )
				.then( newEditor => {
					expect( newEditor.ui.view.element ).to.be.null;
					expect( newEditor.ui.view.toolbar.element.parentElement ).to.be.null;
					expect( newEditor.ui.view.editable.element.parentElement ).to.be.null;

					return newEditor.destroy();
				} );
		} );
	} );

	describe( 'editor with editable element', () => {
		test( () => editorElement );

		it( 'uses the provided editable element', () => {
			return DecoupledEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.ui.view.editable.element.parentElement ).to.equal( document.body );

					return newEditor.destroy();
				} );
		} );
	} );

	function test( getEditorDataOrElement ) {
		describe( 'create()', () => {
			beforeEach( () => {
				return DecoupledEditor.create( getEditorDataOrElement() )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			it( 'creates an instance which inherits from the DecoupledEditor', () => {
				expect( editor ).to.be.instanceof( BaseDecoupledEditor );
				expect( editor ).to.be.instanceof( BaseDecoupledEditor );
			} );

			it( 'loads passed data', () => {
				expect( editor.getData() ).to.equal( '<p>foo bar</p>' );
			} );
		} );

		describe( 'destroy()', () => {
			beforeEach( () => {
				return DecoupledEditor.create( getEditorDataOrElement() )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );
		} );

		describe( 'config', () => {
			afterEach( () => {
				return editor.destroy();
			} );

			// https://github.com/ckeditor/ckeditor5/issues/572
			it( 'allows configure toolbar items through config.toolbar', () => {
				return DecoupledEditor
					.create( getEditorDataOrElement(), {
						toolbar: [ 'undo' ]
					} )
					.then( newEditor => {
						editor = newEditor;

						expect( editor.ui.view.toolbar.items.length ).to.equal( 1 );
					} );
			} );
		} );
	}
} );
