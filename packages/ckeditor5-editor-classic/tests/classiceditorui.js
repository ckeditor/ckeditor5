/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editor, browser-only */

'use strict';

import ClassicEditorUI from '/ckeditor5/editor-classic/classiceditorui.js';
import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

import Toolbar from '/ckeditor5/ui/toolbar/toolbar.js';
import StickyToolbarView from '/ckeditor5/ui/stickytoolbar/stickytoolbarview.js';

import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import InlineEditableUIView from '/ckeditor5/ui/editableui/inline/inlineeditableuiview.js';

import ClassicTestEditor from '/tests/ckeditor5/_utils/classictesteditor.js';

describe( 'ClassicEditorUI', () => {
	let editorElement, editor, editorUI;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = new ClassicTestEditor( editorElement );
		editorUI = new ClassicEditorUI( editor );
		editorUI.view = new BoxedEditorUIView( editor.locale );
	} );

	describe( 'constructor', () => {
		it( 'creates toolbar', () => {
			expect( editorUI.toolbar ).to.be.instanceof( Toolbar );
			expect( editorUI.toolbar.view ).to.be.instanceof( StickyToolbarView );
		} );

		it( 'creates editable', () => {
			expect( editorUI.editable ).to.be.instanceof( EditableUI );
			expect( editorUI.editable.view ).to.be.instanceof( InlineEditableUIView );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			document.body.appendChild( editorUI.view.element );

			return editorUI.init()
				.then( () => {
					expect( editorUI.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
				} );
		} );
	} );

	describe( 'init', () => {
		it( 'adds buttons', () => {
			editor.config.set( 'toolbar', [ 'foo', 'bar' ] );

			document.body.appendChild( editorUI.view.element );

			const spy = sinon.stub( editorUI.toolbar, 'addButtons' );

			return editorUI.init()
				.then( () => {
					expect( spy.calledOnce ).to.be.true;
					expect( spy.args[ 0 ][ 0 ] ).to.deep.equal( [ 'foo', 'bar' ] );
				} );
		} );

		it( 'returns a promise', () => {
			document.body.appendChild( editorUI.view.element );

			expect( editorUI.init() ).to.be.instanceof( Promise );
		} );
	} );
} );
