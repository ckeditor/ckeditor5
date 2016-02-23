/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, button */

'use strict';

import ButtonView from '/ckeditor5/core/ui/button/buttonview.js';
import Model from '/ckeditor5/core/ui/model.js';

describe( 'ButtonView', () => {
	let model, view;

	beforeEach( () => {
		model = new Model( {
			label: 'foo',
			isEnabled: true,
			isOn: false
		} );
		view = new ButtonView( model );

		return view.init();
	} );

	describe( '<button> bindings', () => {
		describe( 'class', () => {
			it( 'is set initially', () => {
				expect( view.element.classList.contains( 'ck-button' ) ).to.be.true( 'ck-button' );
				expect( view.element.classList.contains( 'ck-enabled' ) ).to.be.true( 'ck-enabled' );
				expect( view.element.classList.contains( 'ck-off' ) ).to.be.true( 'ck-off' );
			} );

			it( 'reacts on model.isEnabled', () => {
				model.isEnabled = false;

				expect( view.element.classList.contains( 'ck-disabled' ) ).to.be.true( 'ck-disabled' );
			} );

			it( 'reacts on model.isOn', () => {
				model.isOn = true;

				expect( view.element.classList.contains( 'ck-on' ) ).to.be.true( 'ck-on' );
			} );
		} );

		describe( 'text', () => {
			it( 'is set initially', () => {
				expect( view.element.textContent ).to.equal( 'foo' );
			} );

			it( 'reacts on model.label', () => {
				model.label = 'bar';

				expect( view.element.textContent ).to.equal( 'bar' );
			} );
		} );

		describe( 'mousedown event', () => {
			it( 'should be prevented', () => {
				const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

				expect( ret ).to.be.false;
			} );
		} );

		describe( 'click event', () => {
			it( 'triggers click event if button is not disabled', () => {
				const spy = sinon.spy();

				view.on( 'click', spy );

				view.element.dispatchEvent( new Event( 'click' ) );
				expect( spy.callCount ).to.equal( 1 );

				model.isEnabled = false;

				view.element.dispatchEvent( new Event( 'click' ) );
				expect( spy.callCount ).to.equal( 1 );
			} );
		} );
	} );
} );
