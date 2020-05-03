/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import StickyPanelView from '../../../src/panel/sticky/stickypanelview';
import View from '../../../src/view';
import LabelView from '../../../src/label/labelview';
import ViewCollection from '../../../src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

describe( 'StickyPanelView', () => {
	let view, element, contentElement, placeholderElement, limiterElement, locale, windowStub;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {};
		limiterElement = document.createElement( 'div' );

		view = new StickyPanelView( locale );
		view.render();

		element = view.element;
		contentElement = view.element.lastChild;
		placeholderElement = view.element.firstChild;

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

	afterEach( () => {
		element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'inherits from View', () => {
			expect( view ).to.be.instanceof( View );
		} );

		it( 'should create element from template', () => {
			expect( element.tagName ).to.equal( 'DIV' );
			expect( element.classList.contains( 'ck' ) ).to.true;
			expect( element.classList.contains( 'ck-sticky-panel' ) ).to.true;

			expect( placeholderElement.tagName ).to.equal( 'DIV' );
			expect( placeholderElement.classList.contains( 'ck' ) ).to.true;
			expect( placeholderElement.classList.contains( 'ck-sticky-panel__placeholder' ) ).to.true;

			expect( contentElement.tagName ).to.equal( 'DIV' );
			expect( contentElement.classList.contains( 'ck' ) ).to.true;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content' ) ).to.true;
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

		it( 'creates view#content collection', () => {
			expect( view.content ).to.be.instanceOf( ViewCollection );
		} );
	} );

	describe( 'element view bindings', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		it( 'update the class on view#isSticky change', () => {
			view.isSticky = false;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).to.be.false;

			view.isSticky = true;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).to.be.true;
		} );

		it( 'update the class on view#_isStickyToTheLimiter change', () => {
			view._isStickyToTheLimiter = false;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).to.be.false;

			view._isStickyToTheLimiter = true;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).to.be.true;
		} );

		it( 'update the styles.top on view#_hasViewportTopOffset change', () => {
			view.viewportTopOffset = 100;

			view._hasViewportTopOffset = false;
			expect( contentElement.style.top ).to.equal( '' );

			view._hasViewportTopOffset = true;
			expect( contentElement.style.top ).to.equal( '100px' );
		} );

		it( 'update the styles.width on view#isSticky change', () => {
			testUtils.sinon.stub( view._contentPanelPlaceholder, 'getBoundingClientRect' ).returns( { width: 100 } );

			view.isSticky = false;
			expect( contentElement.style.width ).to.equal( '' );

			view.isSticky = true;
			expect( contentElement.style.width ).to.equal( '100px' );
		} );

		it( 'update the styles.bottom on view#_isStickyToTheLimiter change', () => {
			view._isStickyToTheLimiter = false;
			expect( contentElement.style.bottom ).to.equal( '' );

			view._isStickyToTheLimiter = true;
			expect( contentElement.style.bottom ).to.equal( '50px' );
		} );

		it( 'update the styles.marginLeft on view#marginLeft change', () => {
			view._marginLeft = '30px';
			expect( contentElement.style.marginLeft ).to.equal( '30px' );

			view._marginLeft = '10px';
			expect( contentElement.style.marginLeft ).to.equal( '10px' );
		} );
	} );

	describe( '_contentPanelPlaceholder view bindings', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		it( 'update the styles.display on view#isSticky change', () => {
			view.isSticky = false;
			expect( placeholderElement.style.display ).to.equal( 'none' );

			view.isSticky = true;
			expect( placeholderElement.style.display ).to.equal( 'block' );
		} );

		it( 'update the styles.height on view#isSticky change', () => {
			view._panelRect = { height: 50 };

			view.isSticky = false;
			expect( placeholderElement.style.height ).to.equal( '' );

			view.isSticky = true;
			expect( placeholderElement.style.height ).to.equal( '50px' );
		} );
	} );

	describe( 'children', () => {
		it( 'should react on view#content', () => {
			expect( contentElement.childNodes.length ).to.equal( 0 );

			const label = new LabelView( { t() {} } );

			view.content.add( label );
			expect( contentElement.childNodes.length ).to.equal( 1 );
		} );
	} );

	describe( 'render()', () => {
		let view;

		beforeEach( () => {
			view = new StickyPanelView();
			view.limiterElement = limiterElement;
		} );

		afterEach( () => {
			return view.destroy();
		} );

		it( 'calls render on parent class', () => {
			const spy = testUtils.sinon.spy( View.prototype, 'render' );

			view.render();
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'checks if the panel should be sticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'listens to window#scroll event and calls view._checkIfShouldBeSticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();

			global.window.fire( 'scroll' );
			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'listens to view.isActive and calls view._checkIfShouldBeSticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
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
			const spy = testUtils.sinon.spy( View.prototype, 'destroy' );

			view.destroy();
			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( '_checkIfShouldBeSticky', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		describe( 'view.isSticky', () => {
			beforeEach( () => {
				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );
			} );

			it( 'is true if beyond the top of the viewport (panel is active)', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( { top: -10, height: 100 } );

				expect( view.isSticky ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
			} );

			it( 'is false if beyond the top of the viewport (panel is inactive)', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( { top: -10, height: 100 } );

				expect( view.isSticky ).to.be.false;

				view.isActive = false;

				expect( view.isSticky ).to.be.false;
			} );

			it( 'is false if in the viewport (panel is active)', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( { top: 10, height: 100 } );

				expect( view.isSticky ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
			} );

			it( 'is false if view.limiterElement is smaller than the panel and view.limiterBottomOffset (panel is active)', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( { top: -10, height: 60 } );

				view.limiterBottomOffset = 50;

				expect( view.isSticky ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
			} );
		} );

		describe( 'view._isStickyToTheLimiter', () => {
			it( 'is true if view.isSticky is true and reached the bottom edge of view.limiterElement', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 10,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.true;
			} );

			it( 'is false if view.isSticky is true and not reached the bottom edge of view.limiterElement', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 90,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
			} );

			it( 'is false if view.isSticky is false', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
			} );
		} );

		describe( 'view._hasViewportTopOffset', () => {
			it( 'is true if view._isStickyToTheLimiter is false and view.viewportTopOffset has been specified', () => {
				view.viewportTopOffset = 100;

				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 90,
					bottom: 190,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._hasViewportTopOffset ).to.be.true;
			} );

			it( 'is false if view._isStickyToTheLimiter is true and view.viewportTopOffset has been specified', () => {
				view.viewportTopOffset = 100;

				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10,
					bottom: 110,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.true;
				expect( view._hasViewportTopOffset ).to.be.false;
			} );

			it( 'is false if view._isStickyToTheLimiter is false and view.viewportTopOffset is 0', () => {
				view.viewportTopOffset = 100;

				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 90,
					bottom: 190,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._hasViewportTopOffset ).to.be.true;
			} );
		} );

		describe( 'view._marginLeft', () => {
			it( 'is set if view.isSticky is true view._isStickyToTheLimiter is false', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 80,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				Object.assign( windowStub, {
					scrollX: 10,
					scrollY: 0
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( '-10px' );
			} );

			it( 'is not set if view._isStickyToTheLimiter is true', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 10,
					left: 60,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				testUtils.sinon.stub( document.body, 'getBoundingClientRect' ).returns( {
					left: 40
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheLimiter ).to.be.true;
				expect( view._marginLeft ).to.equal( null );
			} );

			it( 'is not set if view.isSticky is false', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );
			} );
		} );
	} );
} );
