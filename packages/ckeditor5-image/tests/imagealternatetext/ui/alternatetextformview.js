/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event */

import AlternateTextFormView from '../../../src/imagealternatetext/ui/alternatetextformview';
import View from '@ckeditor/ckeditor5-ui/src/view';

describe( 'AlternateTextFormView', () => {
	let view;

	beforeEach( () => {
		view = new AlternateTextFormView( { t: () => {} } );

		view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck-alternate-text-form' ) ).to.be.true;
		} );

		it( 'should create child views', () => {
			expect( view.labeledTextarea ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.cancelButtonView ).to.be.instanceOf( View );
		} );

		it( 'should fire `cancel` event on cancelButtonView#execute', () => {
			const spy = sinon.spy();
			view.on( 'cancel', spy );
			view.cancelButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
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
