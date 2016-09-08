/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, form */

import LinkFormView from '/ckeditor5/link/ui/linkformview.js';
import FormView from '/ckeditor5/ui/form/formview.js';

describe( 'LinkFormView', () => {
	let view;

	beforeEach( () => {
		view = new LinkFormView();

		view.init();
	} );

	describe( 'constructor', () => {
		it( 'should extend FormView class', () => {
			expect( view ).to.instanceof( FormView );
		} );

		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck-link-form' ) ).to.true;
		} );

		it( 'should register "actions" region', () => {
			expect( view.regions.get( 1 ).name ).to.equal( 'actions' );
			expect( view.regions.get( 1 ).element ).to.equal( view.element.querySelector( '.ck-link-form__actions' ) );
		} );
	} );
} );
