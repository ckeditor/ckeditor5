/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, form */

import LinkForm from '/ckeditor5/link/ui/linkform.js';
import LinkFormView from '/ckeditor5/link/ui/linkformview.js';
import Model from '/ckeditor5/ui/model.js';

import Button from '/ckeditor5/ui/button/button.js';
import LabeledInput from '/ckeditor5/ui/labeledinput/labeledinput.js';

describe( 'LinkForm', () => {
	let linkForm, view, model;

	beforeEach( () => {
		view = new LinkFormView( {
			t: () => {}
		} );
		model = new Model( {
			url: 'foo'
		} );
		linkForm = new LinkForm( model, view );
	} );

	describe( 'constructor', () => {
		it( 'creates view#submit -> model#submit binding', () => {
			const spy = sinon.spy();

			model.on( 'submit', spy );

			view.fire( 'submit' );
			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'child components', () => {
		describe( 'urlInput', () => {
			it( 'is created', () => {
				expect( linkForm.urlInput ).to.be.instanceOf( LabeledInput );
			} );

			it( 'belongs to anonymous collection', () => {
				expect( linkForm.collections.get( '_anonymous' ).find( ( item ) => {
					return item === linkForm.urlInput;
				} ) ).to.be.not.undefined;
			} );

			it( 'binds urlInput.model#value to linkForm.model#url', () => {
				expect( linkForm.urlInput.model.value ).to.equal( 'foo' );

				model.url = 'bar';

				expect( linkForm.urlInput.model.value ).to.equal( 'bar' );
			} );
		} );

		describe( 'saveButton', () => {
			it( 'is created', () => {
				expect( linkForm.saveButton ).to.be.instanceOf( Button );
			} );

			it( 'belongs to anonymous collection', () => {
				expect( linkForm.collections.get( '_anonymous' ).find( ( item ) => {
					return item === linkForm.saveButton;
				} ) ).to.be.not.undefined;
			} );
		} );

		describe( 'cancelButton', () => {
			it( 'is created', () => {
				expect( linkForm.cancelButton ).to.be.instanceOf( Button );
			} );

			it( 'belongs to anonymous collection', () => {
				expect( linkForm.collections.get( '_anonymous' ).find( ( item ) => {
					return item === linkForm.cancelButton;
				} ) ).to.be.not.undefined;
			} );

			it( 'passes cancelButton.model#execute as linkForm.model#cancel', ( done ) => {
				model.on( 'cancel', () => {
					done();
				} );

				linkForm.cancelButton.model.fire( 'execute' );
			} );
		} );

		describe( 'unlinkButton', () => {
			it( 'is created', () => {
				expect( linkForm.unlinkButton ).to.be.instanceOf( Button );
			} );

			it( 'belongs to anonymous collection', () => {
				expect( linkForm.collections.get( '_anonymous' ).find( ( item ) => {
					return item === linkForm.unlinkButton;
				} ) ).to.be.not.undefined;
			} );

			it( 'passes unlinkButton.model#execute as linkForm.model#unlink', ( done ) => {
				model.on( 'unlink', () => {
					done();
				} );

				linkForm.unlinkButton.model.fire( 'execute' );
			} );
		} );
	} );
} );
