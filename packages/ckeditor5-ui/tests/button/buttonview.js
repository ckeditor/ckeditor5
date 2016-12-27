/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */
/* bender-tags: ui, button */

import testUtils from 'ckeditor5-core/tests/_utils/utils';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import IconView from 'ckeditor5-ui/src/icon/iconview';

testUtils.createSinonSandbox();

describe( 'ButtonView', () => {
	let locale, view;

	beforeEach( () => {
		locale = { t() {} };

		return ( view = new ButtonView( locale ) ).init();
	} );

	describe( '<button> bindings', () => {
		describe( 'class', () => {
			it( 'is set initially', () => {
				expect( view.element.classList ).to.have.length( 4 );
				expect( view.element.classList.contains( 'ck-button' ) ).to.true;
				expect( view.element.classList.contains( 'ck-off' ) ).to.true;
				expect( view.element.classList.contains( 'ck-tooltip_s' ) ).to.true;
			} );

			it( 'reacts on view#isEnabled', () => {
				view.isEnabled = true;
				expect( view.element.classList.contains( 'ck-disabled' ) ).to.false;

				view.isEnabled = false;
				expect( view.element.classList.contains( 'ck-disabled' ) ).to.true;
			} );

			it( 'reacts on view#isOn', () => {
				view.isOn = true;
				expect( view.element.classList.contains( 'ck-on' ) ).to.true;

				view.isOn = false;
				expect( view.element.classList.contains( 'ck-on' ) ).to.false;
			} );

			it( 'reacts on view#withText', () => {
				view.withText = true;
				expect( view.element.classList.contains( 'ck-button_with-text' ) ).to.true;

				view.withText = false;
				expect( view.element.classList.contains( 'ck-button_with-text' ) ).to.false;
			} );

			it( 'reacts on view#type', () => {
				// Default value.
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'button' );

				view.type = 'submit';
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'submit' );

				// Default value.
				view.type = null;
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'button' );
			} );
		} );

		describe( 'tooltip', () => {
			it( 'is not initially set ', () => {
				expect( view.element.dataset.ckTooltip ).to.undefined;
			} );

			it( 'is always equal to view#title if is defined', () => {
				view.title = 'bar';
				view.label = 'foo';
				view.keystroke = 'A';

				expect( view.element.dataset.ckTooltip ).to.equal( 'bar' );
			} );

			it( 'is equal to view#label when view#title is not defined', () => {
				view.label = 'bar';

				expect( view.element.dataset.ckTooltip ).to.equal( 'bar' );
			} );

			it( 'contains keystroke when view#label and view#keystroke is defined', () => {
				view.label = 'bar';
				view.keystroke = 'A';

				expect( view.element.dataset.ckTooltip ).to.equal( 'bar (A)' );
			} );
		} );

		describe( 'text', () => {
			it( 'is not initially set ', () => {
				expect( view.element.textContent ).to.equal( '' );
			} );

			it( 'reacts on view#label', () => {
				view.label = 'bar';

				expect( view.element.textContent ).to.equal( 'bar' );
			} );
		} );

		describe( 'mousedown event', () => {
			it( 'should be prevented', () => {
				const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

				expect( ret ).to.false;
			} );
		} );

		describe( 'execute event', () => {
			it( 'triggers view#execute event if button is not disabled', () => {
				const spy = sinon.spy();

				view.on( 'execute', spy );
				view.set( 'isEnabled', true );

				view.element.dispatchEvent( new Event( 'click' ) );
				sinon.assert.callCount( spy, 1 );

				view.isEnabled = false;

				view.element.dispatchEvent( new Event( 'click' ) );
				sinon.assert.callCount( spy, 1 );
			} );
		} );
	} );

	describe( 'icon', () => {
		it( 'is not initially set', () => {
			expect( view.element.childNodes ).to.have.length( 1 );
			expect( view.iconView ).to.undefined;
		} );

		it( 'is set when view#icon is defined', () => {
			view = new ButtonView( locale );
			view.icon = 'foo';

			return view.init().then( () => {
				expect( view.element.childNodes ).to.have.length( 2 );
				expect( view.element.childNodes[ 0 ] ).to.equal( view.iconView.element );

				expect( view.iconView ).to.instanceOf( IconView );
				expect( view.iconView.content ).to.equal( 'foo' );

				view.icon = 'bar';
				expect( view.iconView.content ).to.equal( 'bar' );
			} );
		} );

		it( 'is destroyed with the view', () => {
			view = new ButtonView( locale );
			view.icon = 'foo';

			return view.init().then( () => {
				const spy = sinon.spy( view.iconView, 'destroy' );

				return view.destroy().then( () => {
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );
	} );
} );
