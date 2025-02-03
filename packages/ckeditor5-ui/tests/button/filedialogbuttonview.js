/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FileDialogButtonView from '../../src/button/filedialogbuttonview.ts';
import ButtonView from '../../src/button/buttonview.js';
import View from '../../src/view.js';

describe( 'FileDialogButtonView', () => {
	let view, localeMock;

	beforeEach( () => {
		localeMock = { t: val => val };
		view = new FileDialogButtonView( localeMock );

		view.render();
	} );

	it( 'should be rendered from a template', () => {
		expect( view.element.classList.contains( 'ck-file-dialog-button' ) ).to.true;
	} );

	describe( 'child views', () => {
		describe( 'button view', () => {
			it( 'should be rendered', () => {
				expect( view ).to.instanceof( ButtonView );
			} );

			it( 'should open file dialog on execute', () => {
				const spy = sinon.spy( view._fileInputView, 'open' );
				const stub = sinon.stub( view._fileInputView.element, 'click' );
				view.fire( 'execute' );

				sinon.assert.calledOnce( spy );
				stub.restore();
			} );
		} );

		describe( 'file dialog', () => {
			it( 'should be rendered', () => {
				expect( view._fileInputView ).to.instanceof( View );
				expect( view._fileInputView ).to.equal( view.children.get( 1 ) );
			} );

			it( 'should be bound to view#acceptedType', () => {
				view.set( { acceptedType: 'audio/*' } );

				expect( view._fileInputView.acceptedType ).to.equal( 'audio/*' );
			} );

			it( 'should be bound to view#allowMultipleFiles', () => {
				view.set( { allowMultipleFiles: true } );

				expect( view._fileInputView.allowMultipleFiles ).to.be.true;
			} );

			it( 'should delegate done event to view', () => {
				const spy = sinon.spy();
				const files = [];

				view.on( 'done', spy );
				view._fileInputView.fire( 'done', files );

				sinon.assert.calledOnce( spy );
				expect( spy.lastCall.args[ 1 ] ).to.equal( files );
			} );
		} );
	} );
} );
