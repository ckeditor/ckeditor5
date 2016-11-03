/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, form */

import View from 'ckeditor5/ui/view.js';
import LinkFormView from 'ckeditor5/link/ui/linkformview.js';

describe( 'LinkFormView', () => {
	let view;

	beforeEach( () => {
		view = new LinkFormView();

		view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck-link-form' ) ).to.true;
		} );

		it( 'should create child views', () => {
			expect( view.urlInputView ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.cancelButtonView ).to.be.instanceOf( View );
			expect( view.unlinkButtonView ).to.be.instanceOf( View );
		} );

		describe( 'template', () => {
			it( 'has url input view', () => {
				expect( view.template.children.get( 0 ) ).to.equal( view.urlInputView );
			} );

			it( 'has form actions container', () => {
				expect( view.template.children.get( 1 ).attributes.class ).to.have.members( [ 'ck-link-form__actions' ] );
			} );

			it( 'has form action views', () => {
				const actions = view.template.children.get( 1 ).children;

				expect( actions.get( 0 ) ).to.equal( view.saveButtonView );
				expect( actions.get( 1 ) ).to.equal( view.cancelButtonView );
				expect( actions.get( 2 ) ).to.equal( view.unlinkButtonView );
			} );
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = sinon.spy();

				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy.calledOnce ).to.true;
			} );
		} );
	} );
} );
