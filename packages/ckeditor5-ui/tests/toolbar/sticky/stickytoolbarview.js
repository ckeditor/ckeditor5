/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import StickyToolbarView from '../../../src/toolbar/sticky/stickytoolbarview';
import ToolbarView from '../../../src/toolbar/toolbarview';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

testUtils.createSinonSandbox();

describe( 'StickyToolbarView', () => {
	let view, element, limiterElement, locale, windowStub;

	beforeEach( () => {
		locale = {};
		limiterElement = document.createElement( 'div' );

		view = new StickyToolbarView( locale );
		element = view.element;

		// Dummy values just to let non–geometrical tests pass without reference errors.
		view._toolbarRect = { top: 10, right: 20, bottom: 30, left: 40, width: 50, height: 60 };
		view._limiterRect = { top: 5, right: 10, bottom: 15, left: 20, width: 25, height: 30 };

		windowStub = Object.create( DomEmitterMixin );

		Object.assign( windowStub, {
			scrollX: 0,
			scrollY: 0
		} );

		testUtils.sinon.stub( global, 'window' ).value( windowStub );

		document.body.appendChild( element );
	} );

	describe( 'constructor()', () => {
		it( 'inherits from ToolbarView', () => {
			expect( view ).to.be.instanceof( ToolbarView );
		} );

		it( 'sets view attributes', () => {
			expect( view.isSticky ).to.be.false;
			expect( view.limiterElement ).to.be.null;
			expect( view.limiterBottomOffset ).to.equal( 50 );
			expect( view.viewportTopOffset ).to.equal( 0 );

			expect( view._isStickyToTheLimiter ).to.be.false;
			expect( view._hasViewportTopOffset ).to.be.false;
			expect( view._marginLeft ).to.be.null;
		} );

		it( 'accepts the locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'creates the _elementPlaceholder', () => {
			expect( view._elementPlaceholder.classList.contains( 'ck-toolbar__placeholder' ) ).to.be.true;
		} );
	} );

	describe( 'element view bindings', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		it( 'update the class on view#isSticky change', () => {
			view.isSticky = false;
			expect( element.classList.contains( 'ck-toolbar_sticky' ) ).to.be.false;

			view.isSticky = true;
			expect( element.classList.contains( 'ck-toolbar_sticky' ) ).to.be.true;
		} );

		it( 'update the class on view#_isStickyToTheLimiter change', () => {
			view._isStickyToTheLimiter = false;
			expect( element.classList.contains( 'ck-toolbar_sticky_bottom-limit' ) ).to.be.false;

			view._isStickyToTheLimiter = true;
			expect( element.classList.contains( 'ck-toolbar_sticky_bottom-limit' ) ).to.be.true;
		} );

		it( 'update the styles.top on view#_hasViewportTopOffset change', () => {
			view.viewportTopOffset = 100;

			view._hasViewportTopOffset = false;
			expect( element.style.top ).to.equal( '' );

			view._hasViewportTopOffset = true;
			expect( element.style.top ).to.equal( '100px' );
		} );

		it( 'update the styles.width on view#isSticky change', () => {
			testUtils.sinon.stub( view._elementPlaceholder, 'getBoundingClientRect' ).returns( { width: 100 } );

			view.isSticky = false;
			expect( element.style.width ).to.equal( '' );

			view.isSticky = true;
			expect( element.style.width ).to.equal( '100px' );
		} );

		it( 'update the styles.bottom on view#_isStickyToTheLimiter change', () => {
			view._isStickyToTheLimiter = false;
			expect( element.style.bottom ).to.equal( '' );

			view._isStickyToTheLimiter = true;
			expect( element.style.bottom ).to.equal( '50px' );
		} );

		it( 'update the styles.marginLeft on view#marginLeft change', () => {
			view._marginLeft = '30px';
			expect( element.style.marginLeft ).to.equal( '30px' );

			view._marginLeft = '10px';
			expect( element.style.marginLeft ).to.equal( '10px' );
		} );
	} );

	describe( '_elementPlaceholder view bindings', () => {
		it( 'update the styles.display on view#isSticky change', () => {
			view.isSticky = false;
			expect( view._elementPlaceholder.style.display ).to.equal( 'none' );

			view.isSticky = true;
			expect( view._elementPlaceholder.style.display ).to.equal( 'block' );
		} );

		it( 'update the styles.height on view#isSticky change', () => {
			view._toolbarRect = { height: 50 };

			view.isSticky = false;
			expect( view._elementPlaceholder.style.height ).to.equal( '' );

			view.isSticky = true;
			expect( view._elementPlaceholder.style.height ).to.equal( '50px' );
		} );
	} );

	describe( 'init()', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		afterEach( () => {
			return view.destroy();
		} );

		it( 'calls init on parent class', () => {
			const spy = testUtils.sinon.spy( ToolbarView.prototype, 'init' );

			view.init();
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'puts the view._elementPlaceholder before view.element', () => {
			view.init();
			expect( element.previousSibling ).to.equal( view._elementPlaceholder );
		} );

		it( 'checks if the toolbar should be sticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.init();
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'listens to window#scroll event and calls view._checkIfShouldBeSticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.init();
			global.window.fire( 'scroll' );
			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'listens to view.isActive and calls view._checkIfShouldBeSticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.init();
			view.isActive = true;
			expect( spy.calledTwice ).to.be.true;

			view.isActive = false;
			expect( spy.calledThrice ).to.be.true;
		} );
	} );

	describe( 'destroy()', () => {
		it( 'can be called multiple times', () => {
			expect( () => {
				view.destroy();
				view.destroy();
			} ).to.not.throw();
		} );

		it( 'calls destroy on parent class', () => {
			const spy = testUtils.sinon.spy( ToolbarView.prototype, 'destroy' );

			view.destroy();
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'removes view._elementPlaceholder from DOM', () => {
			view.destroy();
			expect( view._elementPlaceholder.parentNode ).to.be.null;
		} );
	} );

	describe( '_checkIfShouldBeSticky', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		describe( 'view.isSticky', () => {
			beforeEach( () => {
				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );
			} );

			it( 'is true if beyond the top of the viewport (toolbar is active)', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( { top: -10, height: 100 } );
				view.isActive = true;

				expect( view.isSticky ).to.be.false;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
			} );

			it( 'is false if beyond the top of the viewport (toolbar is inactive)', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( { top: -10, height: 100 } );
				view.isActive = false;

				expect( view.isSticky ).to.be.false;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.false;
			} );

			it( 'is false if in the viewport (toolbar is active)', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( { top: 10, height: 100 } );
				view.isActive = true;

				expect( view.isSticky ).to.be.false;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.false;
			} );

			it( 'is false if view.limiterElement is smaller than the toolbar and view.limiterBottomOffset (toolbar is active)', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( { top: -10, height: 60 } );
				view.isActive = true;
				view.limiterBottomOffset = 50;

				expect( view.isSticky ).to.be.false;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.false;
			} );
		} );

		describe( 'view._isStickyToTheLimiter', () => {
			it( 'is true if view.isSticky is true and reached the bottom edge of view.limiterElement', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 10,
					height: 100
				} );

				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.true;
			} );

			it( 'is false if view.isSticky is true and not reached the bottom edge of view.limiterElement', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 90,
					height: 100
				} );

				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
			} );

			it( 'is false if view.isSticky is false', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10,
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
			} );
		} );

		describe( 'view._hasViewportTopOffset', () => {
			it( 'is true if view._isStickyToTheLimiter is false and view.viewportTopOffset has been specified', () => {
				view.viewportTopOffset = 100;

				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: 90,
					bottom: 190,
					height: 100
				} );

				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._hasViewportTopOffset ).to.be.true;
			} );

			it( 'is false if view._isStickyToTheLimiter is true and view.viewportTopOffset has been specified', () => {
				view.viewportTopOffset = 100;

				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10,
					bottom: 110,
					height: 100
				} );

				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.true;
				expect( view._hasViewportTopOffset ).to.be.false;
			} );

			it( 'is false if view._isStickyToTheLimiter is false and view.viewportTopOffset is 0', () => {
				view.viewportTopOffset = 100;

				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: 90,
					bottom: 190,
					height: 100
				} );

				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._hasViewportTopOffset ).to.be.true;
			} );
		} );

		describe( 'view._marginLeft', () => {
			it( 'is set if view.isSticky is true view._isStickyToTheLimiter is false', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 80,
					height: 100
				} );

				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				Object.assign( windowStub, {
					scrollX: 10,
					scrollY: 0
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( '-10px' );
			} );

			it( 'is not set if view._isStickyToTheLimiter is true', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 10,
					left: 60,
					height: 100
				} );

				testUtils.sinon.stub( view.element, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				testUtils.sinon.stub( document.body, 'getBoundingClientRect' ).returns( {
					left: 40
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.true;
				expect( view._marginLeft ).to.equal( null );
			} );

			it( 'is not set if view.isSticky is false', () => {
				testUtils.sinon.stub( view.limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10,
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view._checkIfShouldBeSticky();
				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );
			} );
		} );
	} );
} );
