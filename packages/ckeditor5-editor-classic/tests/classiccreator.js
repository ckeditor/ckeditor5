/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: creator */

'use strict';

import Editor from '/ckeditor5/editor.js';

import BoxedEditorUI from '/ckeditor5/ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import InlineEditableUIView from '/ckeditor5/ui/editableui/inline/inlineeditableuiview.js';

import StickyToolbar from '/ckeditor5/ui/bindings/stickytoolbar.js';
import StickyToolbarView from '/ckeditor5/ui/stickytoolbar/stickytoolbarview.js';

import StandardCreator from '/ckeditor5/creator/standardcreator.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';

import testUtils from '/tests/ckeditor5/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'ClassicCreator', () => {
	let creator, editor, fooElement, barElement;

	beforeEach( function() {
		fooElement = document.createElement( 'div' );
		fooElement.setAttribute( 'class', 'first' );
		fooElement.setAttribute( 'data-test', this.currentTest.title );

		document.body.appendChild( fooElement );

		barElement = document.createElement( 'div' );
		barElement.setAttribute( 'class', 'second' );
		barElement.setAttribute( 'data-test', this.currentTest.title );

		document.body.appendChild( barElement );

		editor = new Editor(
			{
				foo: fooElement,
				bar: barElement
			},
			{
				toolbar: [ 'bold', 'italic' ]
			}
		);

		creator = new ClassicCreator( editor, new HtmlDataProcessor() );
	} );

	describe( 'constructor', () => {
		it( 'inherits from the StandardCreator', () => {
			expect( creator ).to.be.instanceof( StandardCreator );
		} );

		it( 'creates a single instance of Editable ', () => {
			expect( editor.editables ).to.have.length( 1 );
			expect( editor.editables.get( 0 ).name ).to.equal( 'foo' );
		} );

		it( 'creates the UI using BoxedEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( BoxedEditorUI );
			expect( editor.ui.view ).to.be.instanceof( BoxedEditorUIView );
		} );

		it( 'creates a single document root', () => {
			expect( editor.document.rootNames ).to.have.members( [ 'foo' ] );
		} );
	} );

	describe( 'create', () => {
		it( 'returns a promise', () => {
			expect( creator.create() ).to.be.instanceof( Promise );
		} );

		it( 'calls _replaceElement', () => {
			const spy = testUtils.sinon.spy( creator, '_replaceElement' );

			return creator.create().then( () => {
				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		it( 'calls _createToolbar', () => {
			const spy = testUtils.sinon.spy( creator, '_createToolbar' );

			return creator.create().then( () => {
				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		it( 'creates the editable using EditableUI Controller in main region', () => {
			return creator.create().then( () => {
				expect( editor.ui.collections.get( 'main' ) ).to.have.length( 1 );
				expect( editor.ui.collections.get( 'main' ).get( 0 ) ).to.be.instanceof( EditableUI );
			} );
		} );

		it( 'creates the editable using InlineEditableUIView in main region', () => {
			return creator.create().then( () => {
				expect( editor.ui.collections.get( 'main' ).get( 0 ).view ).to.be.instanceof( InlineEditableUIView );
			} );
		} );

		it( 'binds the editable to InlineEditableUIView', () => {
			return creator.create().then( () => {
				const editableUIView = editor.ui.collections.get( 'main' ).get( 0 ).view;

				expect( editor.editables.get( 0 ).domElement ).to.equal( editableUIView.element );
			} );
		} );

		it( 'initializes the editor.ui', () => {
			const spy = testUtils.sinon.spy( editor.ui, 'init' );

			return creator.create().then( () => {
				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		it( 'calls loadDataFromEditorElement', () => {
			const spy = testUtils.sinon.spy( creator, 'loadDataFromEditorElement' );

			return creator.create().then( () => {
				expect( spy.calledOnce ).to.be.true;
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'returns a promise', () => {
			return creator.create().then( () => {
				expect( creator.destroy() ).to.be.instanceof( Promise );
			} );
		} );

		it( 'destroys parent class', () => {
			const spy = testUtils.sinon.spy( StandardCreator.prototype, 'destroy' );

			return creator.create().then( () => {
				return creator.destroy().then( () => {
					expect( spy.calledOnce ).to.be.true;
				} );
			} );
		} );

		it( 'calls updateEditorElement', () => {
			const spy = testUtils.sinon.spy( creator, 'updateEditorElement' );

			return creator.create().then( () => {
				return creator.destroy().then( () => {
					expect( spy.calledOnce ).to.be.true;
				} );
			} );
		} );

		it( 'destroys the UI', () => {
			return creator.create().then( () => {
				return creator.destroy().then( () => {
					expect( editor.ui.collections ).to.be.null;
				} );
			} );
		} );
	} );

	describe( '_createToolbar', () => {
		it( 'creates toolbar using StickyToolbar and StickyToolbarView', () => {
			return creator.create().then( () => {
				expect( editor.ui.collections.get( 'top' ) ).to.have.length( 1 );

				const toolbar = editor.ui.collections.get( 'top' ).get( 0 );

				expect( toolbar ).to.be.instanceof( StickyToolbar );
				expect( toolbar.view ).to.be.instanceof( StickyToolbarView );
			} );
		} );
	} );
} );
