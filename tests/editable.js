/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Editable from '/ckeditor5/editable.js';
import EditingController from '/ckeditor5/engine/treecontroller/editingcontroller.js';
import ViewElement from '/ckeditor5/engine/treeview/element.js';

describe( 'Editable', () => {
	const ELEMENT_NAME = 'h1';
	const EDITABLE_NAME = 'editableNaNaNaNa';

	let editable, editor;

	beforeEach( () => {
		editor = new Editor();
		editable = new Editable( editor, EDITABLE_NAME );
	} );

	describe( 'constructor', () => {
		it( 'sets the properties', () => {
			expect( editable ).to.have.property( 'editor', editor );
			expect( editable ).to.have.property( 'name', EDITABLE_NAME );
			expect( editable ).to.have.property( 'isEditable', true );
			expect( editable ).to.have.property( 'isFocused', false );
		} );
	} );

	describe( 'isEditable', () => {
		it( 'is observable', () => {
			const spy = sinon.spy();

			editable.on( 'change:isEditable', spy );

			editable.isEditable = false;

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isFocused', () => {
		it( 'is observable', () => {
			const spy = sinon.spy();

			editable.on( 'change:isFocused', spy );

			editable.isFocused = true;

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'bindTo', () => {
		let domElement, editingView;

		beforeEach( () => {
			domElement = document.createElement( ELEMENT_NAME );

			editor.editing = new EditingController();
			editingView = editor.editing.view;

			editable.bindTo( domElement );
		} );

		it( 'creates view root element', () => {
			expect( editable.viewElement ).to.be.instanceof( ViewElement );
			expect( editable.viewElement ).to.have.property( 'name', ELEMENT_NAME );

			expect( editingView.viewRoots.get( EDITABLE_NAME ) ).to.equal( editable.viewElement );
		} );

		describe( 'isFocused binding', () => {
			it( 'reacts on editingView#focus', () => {
				editingView.fire( 'focus', {
					target: editable.viewElement
				} );

				expect( editable ).to.have.property( 'isFocused', true );
			} );

			it( 'reacts on editingView#blur', () => {
				editable.isFocused = true;

				editingView.fire( 'blur', {
					target: editable.viewElement
				} );

				expect( editable ).to.have.property( 'isFocused', false );
			} );

			it( 'reacts on editingView#focus only if target matches', () => {
				editingView.fire( 'focus', {
					target: new ViewElement( 'foo' )
				} );

				expect( editable ).to.have.property( 'isFocused', false );
			} );

			it( 'reacts on editingView#blur only if target matches', () => {
				editable.isFocused = true;

				editingView.fire( 'blur', {
					target: new ViewElement( 'foo' )
				} );

				expect( editable ).to.have.property( 'isFocused', true );
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'offs everything', () => {
			const spy = sinon.spy( editable, 'stopListening' );

			editable.destroy();

			expect( spy.calledOnce ).to.be.true;
			expect( editable.viewElement ).to.be.null;
			expect( editable.domElement ).to.be.null;
		} );
	} );
} );
