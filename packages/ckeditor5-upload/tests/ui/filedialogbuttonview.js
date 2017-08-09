/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import FileDialogButtonView from '../../src/ui/filedialogbuttonview';

describe( 'FileDialogButtonView', () => {
	let view, editor;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement )
			.then( newEditor => {
				editor = newEditor;

				view = new FileDialogButtonView( editor.locale );
			} );
	} );

	it( 'should append input view to document body', () => {
		expect( view.fileInputView.element.parentNode ).to.equal( document.body );
	} );

	it( 'should remove input view from body after destroy', () => {
		view.destroy();

		expect( view.fileInputView.element.parentNode ).to.be.null;
	} );

	it( 'should open file dialog on execute', () => {
		const spy = sinon.spy( view.fileInputView, 'open' );
		view.fire( 'execute' );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should pass acceptedType to input view', () => {
		view.set( { acceptedType: 'audio/*' } );

		expect( view.fileInputView.acceptedType ).to.equal( 'audio/*' );
	} );

	it( 'should pass allowMultipleFiles to input view', () => {
		view.set( { allowMultipleFiles: true } );

		expect( view.fileInputView.allowMultipleFiles ).to.be.true;
	} );

	it( 'should delegate input view done event', done => {
		const files = [];

		view.on( 'done', ( evt, data ) => {
			expect( data ).to.equal( files );
			done();
		} );

		view.fileInputView.fire( 'done', files );
	} );
} );
