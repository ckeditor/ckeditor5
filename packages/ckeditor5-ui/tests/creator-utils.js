/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */

'use strict';

import { createEditableUI, createEditorUI } from '/ckeditor5/ui/creator-utils.js';
import ObservableMixin from '/ckeditor5/utils/observablemixin.js';
import mix from '/ckeditor5/utils/mix.js';
import Editor from '/ckeditor5/editor.js';
import Controller from '/ckeditor5/ui/controller.js';
import View from '/ckeditor5/ui/view.js';
import Model from '/ckeditor5/ui/model.js';

describe( 'creator-utils', () => {
	let editor;

	beforeEach( () => {
		editor = new Editor();
	} );

	describe( 'createEditableUI', () => {
		let editable;

		class Editable {}
		mix( Editable, ObservableMixin );

		class TestController extends Controller {
			constructor( editor, editable ) {
				super();

				this.editor = editor;
				this.editable = editable;

				this.viewModel = new Model();
			}
		}

		class TestView extends View {
			constructor( model, locale, editableElement ) {
				super( model, locale );

				this.editableElement = editableElement;
			}
		}

		beforeEach( () => {
			editable = new Editable();
			editable.bindTo = sinon.spy();
		} );

		it( 'creates an instance of editable UI', () => {
			const editableUI = createEditableUI( editor, editable, TestController, TestView );

			expect( editableUI ).to.be.instanceof( TestController );
			expect( editableUI ).to.have.property( 'editor', editor );
			expect( editableUI ).to.have.property( 'editable', editable );

			const view = editableUI.view;
			expect( view ).to.be.instanceof( TestView );
			expect( view.model ).to.equal( editableUI.viewModel );
			expect( view.editableElement ).to.be.undefined;
			expect( view.locale ).to.equal( editor.locale );
		} );

		it( 'passes the editable.domElement to the view and do not try to bind it again', () => {
			const editableElement = document.createElement( 'div' );

			editable.domElement = editableElement;
			editable.bindTo = sinon.spy();

			const editableUI = createEditableUI( editor, editable, TestController, TestView );

			expect( editableUI.view.editableElement ).to.equal( editableElement );
			expect( editable.bindTo.callCount ).to.equal( 0 );
		} );

		it( 'passes the editable.domElement to the view and do not try to bind it again', () => {
			const editableElement = document.createElement( 'div' );

			editable.domElement = editableElement;

			const editableUI = createEditableUI( editor, editable, TestController, TestView );

			expect( editableUI.view.editableElement ).to.equal( editableElement );
			expect( editable.bindTo.callCount ).to.equal( 0 );
		} );

		it( 'if editable.domElement is not yet defined, tries to bind the editable element', () => {
			const editableElement = document.createElement( 'div' );
			const editableUI = createEditableUI( editor, editable, TestController, TestView );

			editableUI.view.editableElement = editableElement;
			editableUI.fire( 'ready' );

			expect( editable.bindTo.calledWith( editableElement ) ).to.be.true;
		} );
	} );

	describe( 'createEditorUI', () => {
		class TestController extends Controller {
			constructor( editor ) {
				super();

				this.editor = editor;
				this.viewModel = new Model();
			}
		}

		class TestView extends View {}

		it( 'creates an instance of the EditorUI', () => {
			const editorUI = createEditorUI( editor, TestController, TestView );

			expect( editorUI ).to.be.instanceof( TestController );
			expect( editorUI.editor ).to.equal( editor );

			expect( editorUI.view ).to.be.instanceof( TestView );
			expect( editorUI.view.model ).to.equal( editorUI.viewModel );
			expect( editorUI.view.locale ).to.equal( editor.locale );
		} );
	} );
} );
