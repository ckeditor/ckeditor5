/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Rect, global } from '@ckeditor/ckeditor5-utils';
import StickyPanelView from '../../../src/panel/sticky/stickypanelview.js';
import View from '../../../src/view.js';
import LabelView from '../../../src/label/labelview.js';
import ViewCollection from '../../../src/viewcollection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';

describe( 'StickyPanelView', () => {
	let view, element, contentPanelElement, placeholderElement, limiterElement, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {};
		limiterElement = document.createElement( 'div' );

		view = new StickyPanelView( locale );
		view.render();

		element = view.element;
		contentPanelElement = view.contentPanelElement;
		placeholderElement = view.element.firstChild;

		sinon.stub( global.window, 'innerWidth' ).value( 1000 );
		sinon.stub( global.window, 'innerHeight' ).value( 500 );

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

			expect( element.lastElementChild ).to.equal( contentPanelElement );
		} );

		it( 'should create #contentPanel from template', () => {
			expect( view.contentPanelElement.tagName ).to.equal( 'DIV' );
			expect( view.contentPanelElement.classList.contains( 'ck' ) ).to.true;
			expect( view.contentPanelElement.classList.contains( 'ck-sticky-panel__content' ) ).to.true;
		} );

		it( 'sets view attributes', () => {
			expect( view.isActive ).to.be.false;
			expect( view.isSticky ).to.be.false;
			expect( view.limiterElement ).to.be.null;
			expect( view.limiterBottomOffset ).to.equal( 50 );
			expect( view.viewportTopOffset ).to.equal( 0 );

			expect( view._marginLeft ).to.be.null;
			expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
			expect( view._stickyTopOffset ).to.be.null;
			expect( view._stickyBottomOffset ).to.be.null;
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
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).to.be.false;

			view.isSticky = true;
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).to.be.true;
		} );

		it( 'update the class on view#_isStickyToTheBottomOfLimiter change', () => {
			view._isStickyToTheBottomOfLimiter = false;
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).to.be.false;

			view._isStickyToTheBottomOfLimiter = true;
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).to.be.true;
		} );

		it( 'update the style.top on view#_stickyTopOffset change', () => {
			view.viewportTopOffset = 100;

			view._stickyTopOffset = 0;
			expect( contentPanelElement.style.top ).to.equal( '0px' );

			view._stickyTopOffset = 100;
			expect( contentPanelElement.style.top ).to.equal( '100px' );
		} );

		it( 'update the style.width on view#isSticky change', () => {
			testUtils.sinon.stub( view._contentPanelPlaceholder, 'getBoundingClientRect' ).returns( { width: 100 } );

			view.isSticky = false;
			expect( contentPanelElement.style.width ).to.equal( '' );

			view.isSticky = true;
			expect( contentPanelElement.style.width ).to.equal( '100px' );
		} );

		it( 'update the style.bottom on view#_stickyBottomOffset change', () => {
			view._stickyBottomOffset = 0;
			expect( contentPanelElement.style.bottom ).to.equal( '0px' );

			view._stickyBottomOffset = 50;
			expect( contentPanelElement.style.bottom ).to.equal( '50px' );
		} );

		it( 'update the style.marginLeft on view#marginLeft change', () => {
			view._marginLeft = '30px';
			expect( contentPanelElement.style.marginLeft ).to.equal( '30px' );

			view._marginLeft = '10px';
			expect( contentPanelElement.style.marginLeft ).to.equal( '10px' );
		} );
	} );

	describe( '_contentPanelPlaceholder view bindings', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		it( 'update the style.display on view#isSticky change', () => {
			view.isSticky = false;
			expect( placeholderElement.style.display ).to.equal( 'none' );

			view.isSticky = true;
			expect( placeholderElement.style.display ).to.equal( 'block' );
		} );

		it( 'update the style.height on view#isSticky change', () => {
			sinon.stub( view, '_contentPanelRect' ).get( () => new Rect( {
				top: 0, right: 50, left: 0, bottom: 50, height: 50, width: 50
			} ) );

			view.isSticky = false;
			expect( placeholderElement.style.height ).to.equal( '' );

			view.isSticky = true;
			expect( placeholderElement.style.height ).to.equal( '50px' );
		} );
	} );

	describe( 'children', () => {
		it( 'should react on view#content', () => {
			expect( contentPanelElement.childNodes.length ).to.equal( 0 );

			const label = new LabelView( { t() {} } );

			view.content.add( label );
			expect( contentPanelElement.childNodes.length ).to.equal( 1 );
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
			const spy = testUtils.sinon.spy( view, 'checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'listens to document#scroll event and calls view.checkIfShouldBeSticky()', () => {
			const spy = testUtils.sinon.spy( view, 'checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
			expect( spy.calledOnce ).to.be.true;

			global.document.dispatchEvent( new Event( 'scroll' ) );
			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'listens to visualViewport#scroll event and calls view.checkIfShouldBeSticky()', () => {
			const spy = testUtils.sinon.spy( view, 'checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
			expect( spy.calledOnce ).to.be.true;

			global.window.visualViewport.dispatchEvent( new Event( 'scroll' ) );
			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'listens to visualViewport#resize event and calls view.checkIfShouldBeSticky()', () => {
			const spy = testUtils.sinon.spy( view, 'checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
			expect( spy.calledOnce ).to.be.true;

			global.window.visualViewport.dispatchEvent( new Event( 'resize' ) );
			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'listens to view.isActive and calls view.checkIfShouldBeSticky()', () => {
			const spy = testUtils.sinon.spy( view, 'checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
			expect( spy.calledOnce ).to.be.true;

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

	describe( 'checkIfShouldBeSticky()', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;

			// Set visual viewport offsets - those should be ignored on non iOS and non Safari.
			sinon.stub( visualViewport, 'offsetLeft' ).get( () => 15 );
			sinon.stub( visualViewport, 'offsetTop' ).get( () => 25 );
		} );

		it( 'should unstick the panel if limiter element is not set', () => {
			view.limiterElement = null;

			assureStickiness( {
				isSticky: false,
				_isStickyToTheBottomOfLimiter: false,
				_stickyTopOffset: null,
				_stickyBottomOffset: null,
				_marginLeft: null
			} );
		} );

		it( 'should unstick the panel if it is not active', () => {
			view.isActive = true;

			const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

			view.isActive = false;

			sinon.assert.calledOnce( unstickSpy );
			assureStickiness( {
				isSticky: false,
				_isStickyToTheBottomOfLimiter: false,
				_stickyTopOffset: null,
				_stickyBottomOffset: null,
				_marginLeft: null
			} );
		} );

		describe( 'view.isSticky', () => {
			beforeEach( () => {
				testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
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

		describe( 'view._isStickyToTheBottomOfLimiter', () => {
			it( 'is true if view.isSticky is true and reached the bottom edge of view.limiterElement', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -80,
					bottom: 60,
					height: 140,
					width: 100,
					left: 0,
					right: 100
				} );

				testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.true;
			} );

			it( 'is false if view.isSticky is true and not reached the bottom edge of view.limiterElement', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 90,
					height: 100,
					width: 100,
					left: 0,
					right: 100
				} );

				testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
			} );

			it( 'is false if view.isSticky is false', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
			} );
		} );

		describe( 'after scrolling', () => {
			describe( 'if there is only window scrollable', () => {
				beforeEach( () => {
					view.isActive = true;
				} );

				it( 'should make panel sticky to the top if the limiter top is not visible', () => {
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -10,
						bottom: 190,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( stickToTopSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 0,
						_stickyBottomOffset: null,
						_marginLeft: '0px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -140,
						bottom: 60,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).to.be.true;
					expect( view._isStickyToTheBottomOfLimiter ).to.be.true;

					sinon.assert.calledOnce( stickToBottomSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '0px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 220,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.notCalled( stickToBottomSpy );
					sinon.assert.notCalled( stickToTopSpy );
					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -152,
						bottom: 48,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 150
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -210,
						bottom: -10,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should avoid flickering after stickiness change', () => {
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -2,
						bottom: 69,
						height: 71,
						width: 100,
						left: 0,
						right: 100
					} );

					const panelRectStub = testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' );

					panelRectStub.returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );

					// Sticky style adds bottom border so the height of the panel is 1px bigger.
					panelRectStub.returns( {
						height: 21
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledTwice( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );
			} );

			describe( 'if there is window scrollable and visual viewport (iOS)', () => {
				beforeEach( () => {
					sinon.stub( env, 'isiOS' ).get( () => true );
					view.isActive = true;
				} );

				it( 'should make panel sticky to the top if the limiter top is not visible', () => {
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -10,
						bottom: 190,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( stickToTopSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 25,
						_stickyBottomOffset: null,
						_marginLeft: '15px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -140,
						bottom: 60,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).to.be.true;
					expect( view._isStickyToTheBottomOfLimiter ).to.be.true;

					sinon.assert.calledOnce( stickToBottomSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '15px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 220,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.notCalled( stickToBottomSpy );
					sinon.assert.notCalled( stickToTopSpy );
					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -152,
						bottom: 48,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 150
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -210,
						bottom: -10,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );
			} );

			describe( 'if there is window scrollable and visual viewport and viewport top offset (iOS)', () => {
				beforeEach( () => {
					sinon.stub( env, 'isiOS' ).get( () => true );
					view.viewportTopOffset = 5;
					view.isActive = true;
				} );

				it( 'should make panel sticky to the top if the limiter top is not visible', () => {
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -10,
						bottom: 190,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( stickToTopSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 30,
						_stickyBottomOffset: null,
						_marginLeft: '15px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -140,
						bottom: 60,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).to.be.true;
					expect( view._isStickyToTheBottomOfLimiter ).to.be.true;

					sinon.assert.calledOnce( stickToBottomSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '15px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 220,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.notCalled( stickToBottomSpy );
					sinon.assert.notCalled( stickToTopSpy );
					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -152,
						bottom: 48,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 150
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -210,
						bottom: -10,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );
			} );

			describe( 'if there is one scrollable non-window parent', () => {
				let scrollableContainer;

				beforeEach( () => {
					scrollableContainer = document.createElement( 'div' );
					scrollableContainer.className = 'scrollable';
					scrollableContainer.style.overflow = 'scroll';
					scrollableContainer.appendChild( limiterElement );
					global.document.body.appendChild( scrollableContainer );

					view.isActive = true;
				} );

				afterEach( () => {
					scrollableContainer.remove();
				} );

				it( 'should make panel sticky to the top if the limiter top is not visible', () => {
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );

					testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 200,
						height: 180,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( stickToTopSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 40,
						_stickyBottomOffset: null,
						_marginLeft: '0px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );

					testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -80,
						bottom: 60,
						height: 140,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).to.be.true;
					expect( view._isStickyToTheBottomOfLimiter ).to.be.true;

					sinon.assert.calledOnce( stickToBottomSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '0px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = testUtils.sinon.spy( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 200,
						height: 180,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.notCalled( stickToBottomSpy );
					sinon.assert.notCalled( stickToTopSpy );
					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -80,
						bottom: 60,
						height: 140,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 100
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
						top: 120,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: -80,
						bottom: 60,
						height: 140,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( spy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );
			} );

			describe( 'if there are multiple scrollable non-window parents', () => {
				let scrollableOuterParent, scrollableInnerParent;

				beforeEach( () => {
					scrollableOuterParent = document.createElement( 'div' );
					scrollableOuterParent.className = 'scrollable-outer';
					scrollableOuterParent.style.overflow = 'scroll';

					scrollableInnerParent = document.createElement( 'div' );
					scrollableInnerParent.className = 'scrollable-inner';
					scrollableInnerParent.style.overflow = 'scroll';

					scrollableInnerParent.appendChild( limiterElement );
					scrollableOuterParent.appendChild( scrollableInnerParent );
					global.document.body.appendChild( scrollableOuterParent );

					view.isActive = true;
				} );

				afterEach( () => {
					scrollableInnerParent.remove();
					scrollableOuterParent.remove();
				} );

				it( 'should unstick the panel if the limiter is still visible', () => {
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 10,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 100,
						height: 60,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should stick the panel to the top if the outer container was scrolled over the limiter top', () => {
					const stickToTopSpy = testUtils.sinon.spy( view, '_stickToTopOfAncestors' );

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 50,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( stickToTopSpy );
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 50,
						_stickyBottomOffset: null,
						_marginLeft: '0px'
					} );
				} );

				it( 'should unstick the panel if the outer container was scrolled but there is no space below', () => {
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 50,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 110,
						height: 60,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if the outer container was scrolled over the inner container top', () => {
					const unstickSpy = testUtils.sinon.spy( view, '_unstick' );

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 50,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: -20,
						bottom: 50,
						height: 70,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 0,
						bottom: 40,
						height: 40,
						width: 100,
						left: 0,
						right: 100
					} );

					testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					sinon.assert.calledOnce( unstickSpy );
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );
			} );
		} );

		describe( 'view._marginLeft', () => {
			it( 'is set if view.isSticky is true view._stickyTopOffset is set', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 70,
					height: 100,
					width: 100,
					left: 0,
					right: 100
				} );

				testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				sinon.stub( global.window, 'scrollX' ).value( 10 );
				sinon.stub( global.window, 'scrollY' ).value( 0 );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._stickyTopOffset ).to.not.equal( null );
				expect( view._marginLeft ).to.equal( '-10px' );
			} );

			it( 'is set if view._isStickyToTheBottomOfLimiter is true', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -30,
					bottom: 50,
					left: 60,
					height: 80,
					width: 100,
					right: 160
				} );

				testUtils.sinon.stub( contentPanelElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				testUtils.sinon.stub( document.body, 'getBoundingClientRect' ).returns( {
					left: 40
				} );

				sinon.stub( global.window, 'innerHeight' ).value( 100 );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.true;
				expect( view._marginLeft ).to.equal( '0px' );
			} );

			it( 'is null if view.isSticky is false', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 10
				} );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );
			} );
		} );
	} );

	function assureStickiness( options ) {
		expect( view.isSticky, 'isSticky is incorrect' ).to.equal( options.isSticky );
		expect( view._isStickyToTheBottomOfLimiter, '_isStickyToTheBottomOfLimiter is incorrect' )
			.to.equal( options._isStickyToTheBottomOfLimiter );
		expect( view._stickyTopOffset, '_stickyTopOffset is incorrect' ).to.equal( options._stickyTopOffset );
		expect( view._stickyBottomOffset, '_stickyBottomOffset is incorrect' ).to.equal( options._stickyBottomOffset );
		expect( view._marginLeft, '_marginLeft is incorrect' ).to.equal( options._marginLeft );
	}
} );
