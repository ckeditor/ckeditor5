/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event */

import TextAlternativeFormView from '../../../src/imagetextalternative/ui/textalternativeformview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

describe( 'TextAlternativeFormView', () => {
	let view;

	beforeEach( () => {
		view = new TextAlternativeFormView( { t: () => {} } );

		view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'cke-text-alternative-form' ) ).to.be.true;
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create child views', () => {
			expect( view.labeledInput ).to.be.instanceOf( View );
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

	describe( 'init()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new TextAlternativeFormView( { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.init();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
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
