/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, form */

import LinkForm from '/ckeditor5/link/ui/linkform.js';
import LinkFormView from '/ckeditor5/link/ui/linkformview.js';
import Model from '/ckeditor5/ui/model.js';

describe( 'LinkForm', () => {
	let linkForm, view, model;

	beforeEach( () => {
		view = new LinkFormView();
		model = new Model();
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
} );
