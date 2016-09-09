/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, form */

import LinkForm from '/ckeditor5/link/ui/linkform.js';
import LinkFormView from '/ckeditor5/link/ui/linkformview.js';
import Form from '/ckeditor5/ui/form/form.js';
import Model from '/ckeditor5/ui/model.js';

describe( 'LinkForm', () => {
	let linkForm, view;

	beforeEach( () => {
		view = new LinkFormView();
		linkForm = new LinkForm( new Model(), view );
	} );

	describe( 'constructor', () => {
		it( 'should extend Form class', () => {
			expect( linkForm ).to.instanceof( Form );
		} );

		it( 'should create empty "actions" collection', () => {
			expect( linkForm.collections.get( 'actions' ) ).to.have.length( 0 );
		} );
	} );
} );
