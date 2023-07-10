/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import StickyPanelView from '../../../src/panel/sticky/stickypanelview';
import View from '../../../src/view';
import LabelView from '../../../src/label/labelview';
import ViewCollection from '../../../src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'StickyPanelView', () => {
	let view, element, contentElement, placeholderElement, limiterElement, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {};
		limiterElement = document.createElement( 'div' );

		view = new StickyPanelView( locale );
		view.render();

		element = view.element;
		contentElement = view.element.lastChild;
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

			expect( contentElement.tagName ).to.equal( 'DIV' );
			expect( contentElement.classList.contains( 'ck' ) ).to.true;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content' ) ).to.true;
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
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).to.be.false;

			view.isSticky = true;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).to.be.true;
		} );

		it( 'update the class on view#_isStickyToTheBottomOfLimiter change', () => {
			view._isStickyToTheBottomOfLimiter = false;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).to.be.false;

			view._isStickyToTheBottomOfLimiter = true;
			expect( contentElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).to.be.true;
		} );

		it( 'update the style.top on view#_stickyTopOffset change', () => {
			view.viewportTopOffset = 100;

			view._stickyTopOffset = 0;
			expect( contentElement.style.top ).to.equal( '0px' );

			view._stickyTopOffset = 100;
			expect( contentElement.style.top ).to.equal( '100px' );
		} );

		it( 'update the style.width on view#isSticky change', () => {
			testUtils.sinon.stub( view._contentPanelPlaceholder, 'getBoundingClientRect' ).returns( { width: 100 } );

			view.isSticky = false;
			expect( contentElement.style.width ).to.equal( '' );

			view.isSticky = true;
			expect( contentElement.style.width ).to.equal( '100px' );
		} );

		it( 'update the style.bottom on view#_stickyBottomOffset change', () => {
			view._stickyBottomOffset = 0;
			expect( contentElement.style.bottom ).to.equal( '0px' );

			view._stickyBottomOffset = 50;
			expect( contentElement.style.bottom ).to.equal( '50px' );
		} );

		it( 'update the style.marginLeft on view#marginLeft change', () => {
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

		it( 'update the style.display on view#isSticky change', () => {
			view.isSticky = false;
			expect( placeholderElement.style.display ).to.equal( 'none' );

			view.isSticky = true;
			expect( placeholderElement.style.display ).to.equal( 'block' );
		} );

		it( 'update the style.height on view#isSticky change', () => {
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

		it( 'listens to document#scroll event and calls view._checkIfShouldBeSticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
			expect( spy.notCalled ).to.be.true;

			view.render();
			expect( spy.calledOnce ).to.be.true;

			global.document.dispatchEvent( new Event( 'scroll' ) );
			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'listens to view.isActive and calls view._checkIfShouldBeSticky', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );
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

	describe( '_checkIfShouldBeSticky', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		it( 'should unstick the panel if limiter element is not set', () => {
			view.limiterElement = null;

			expect( view.isSticky ).to.be.false;
		} );

		it( 'should unstick the panel if it is not active', () => {
			const spy = testUtils.sinon.spy( view, '_checkIfShouldBeSticky' );

			view.isActive = true;
			view.isActive = false;

			expect( view.isSticky ).to.be.false;
			expect( spy.calledTwice ).to.be.true;
		} );

		describe( 'called after scrolling', () => {
			it( 'should do nothing if scrolled element does not contain the panel', () => {
				view.isActive = true;

				const separateElement = document.createElement( 'div' );

				view._checkIfShouldBeSticky( separateElement );

				expect( view.isSticky ).to.be.false;
			} );

			describe( 'with/without #limiterBottomOffset ', () => {

			} );

			describe( 'with/without #viewportTopOffset ', () => {

			} );

			describe( 'isActive/ is not active ', () => {

			} );

			describe( 'if there is one scrollable non-window parent', () => {
				let scrollableContainer;

				beforeEach( () => {
					scrollableContainer = document.createElement( 'div' );
					scrollableContainer.className = 'scrollable';
					scrollableContainer.style.overflow = 'scroll';
					scrollableContainer.appendChild( limiterElement );
					global.document.body.appendChild( scrollableContainer );
				} );

				afterEach( () => {
					scrollableContainer.remove();
				} );

				describe( 'scrolled the container', () => {
					it( 'should not make panel sticky if the limiter top is still visible', () => {
						view.isActive = true;

						testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
							top: 20,
							bottom: 140,
							height: 120
						} );

						testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
							top: 20,
							bottom: 200,
							height: 180
						} );

						testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
							height: 20
						} );

						view._checkIfShouldBeSticky( scrollableContainer );

						expect( view.isSticky ).to.be.false;
					} );

					it( 'should make panel sticky if the limiter top is not visible', () => {
						view.isActive = true;

						testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
							top: 40,
							bottom: 140,
							height: 100
						} );

						testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
							top: 20,
							bottom: 200,
							height: 180
						} );

						testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
							height: 20
						} );

						view._checkIfShouldBeSticky( scrollableContainer );

						expect( view.isSticky ).to.be.true;
					} );

					it( 'should make panel sticky to the bottom if there is enough space left', () => {
						view.isActive = true;

						testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
							top: 40,
							bottom: 140,
							height: 100
						} );

						testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
							top: -80,
							bottom: 60,
							height: 140
						} );

						testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
							height: 20
						} );

						view._checkIfShouldBeSticky( scrollableContainer );

						expect( view.isSticky ).to.be.true;
						expect( view._isStickyToTheBottomOfLimiter ).to.be.true;
					} );

					it( 'should unstick the panel if there is not enough space left in the limiter', () => {
						view.isActive = true;

						testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
							top: 40,
							bottom: 140,
							height: 100
						} );

						testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
							top: -80,
							bottom: 60,
							height: 140
						} );

						testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
							height: 100
						} );

						view._checkIfShouldBeSticky( scrollableContainer );

						expect( view.isSticky ).to.be.false;
					} );

					it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
						view.isActive = true;

						testUtils.sinon.stub( scrollableContainer, 'getBoundingClientRect' ).returns( {
							top: 120,
							bottom: 140,
							height: 100
						} );

						testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
							top: -80,
							bottom: 60,
							height: 140
						} );

						testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
							height: 20
						} );

						view._checkIfShouldBeSticky( scrollableContainer );

						expect( view.isSticky ).to.be.false;
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
				} );

				afterEach( () => {
					scrollableInnerParent.remove();
					scrollableOuterParent.remove();
				} );

				it( 'should do something if scrolled element contains the panel', () => {
					view.isActive = true;

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 200,
						height: 180
					} );

					testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view._checkIfShouldBeSticky( scrollableOuterParent );

					expect( view.isSticky ).to.be.false;
				} );

				it( 'should not stick the panel if the limiter is still visible', () => {
					view.isActive = true;

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 10,
						bottom: 160,
						height: 150
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 100,
						height: 60
					} );

					testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view._checkIfShouldBeSticky( scrollableOuterParent );

					expect( view.isSticky ).to.be.false;
				} );

				it( 'should stick the panel if the outer container was scrolled over the limiter top', () => {
					view.isActive = true;

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 50,
						bottom: 160,
						height: 150
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 115,
						height: 60
					} );

					testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view._checkIfShouldBeSticky( scrollableOuterParent );

					expect( view.isSticky ).to.be.true;
				} );

				it( 'should not stick the panel to the bottom if the outer container was scrolled there is no space below', () => {
					view.isActive = true;

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 50,
						bottom: 160,
						height: 150
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: 20,
						bottom: 140,
						height: 120
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 40,
						bottom: 110,
						height: 60
					} );

					testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view._checkIfShouldBeSticky( scrollableOuterParent );

					expect( view.isSticky ).to.be.false;
				} );

				it( 'should not stick the panel if the outer container was scrolled over the inner container top', () => {
					view.isActive = true;

					testUtils.sinon.stub( scrollableOuterParent, 'getBoundingClientRect' ).returns( {
						top: 50,
						bottom: 160,
						height: 150
					} );

					testUtils.sinon.stub( scrollableInnerParent, 'getBoundingClientRect' ).returns( {
						top: -20,
						bottom: 50,
						height: 70
					} );

					testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
						top: 0,
						bottom: 40,
						height: 40
					} );

					testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
						height: 20
					} );

					view._checkIfShouldBeSticky( scrollableOuterParent );

					expect( view.isSticky ).to.be.false;
				} );
			} );
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

		describe( 'view._isStickyToTheBottomOfLimiter', () => {
			it( 'is true if view.isSticky is true and reached the bottom edge of view.limiterElement', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -80,
					bottom: 60,
					height: 140
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
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
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
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

		describe( 'view._stickyTopOffset', () => {
			it( 'is not null if view._isStickyToTheBottomOfLimiter is false and view.viewportTopOffset has been specified', () => {
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
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._stickyTopOffset ).to.equal( 100 );
				expect( view._stickyBottomOffset ).to.be.null;
			} );

			it( 'is null if view._isStickyToTheBottomOfLimiter is true and view.viewportTopOffset has been specified', () => {
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
				expect( view._isStickyToTheBottomOfLimiter ).to.be.true;
				expect( view._stickyTopOffset ).to.equal( null );
			} );

			it( 'is null if view._isStickyToTheBottomOfLimiter is false and view.viewportTopOffset is 0', () => {
				view.viewportTopOffset = 0;

				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: 90,
					bottom: 190,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				view.isActive = true;

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._stickyTopOffset ).to.equal( null );
			} );
		} );

		describe( 'view._stickyBottomOffset?', () => {

		} );

		describe( 'view._marginLeft', () => {
			it( 'is set if view.isSticky is true view._isStickyToTheBottomOfLimiter is false', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -10,
					bottom: 80,
					height: 100
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
					height: 20
				} );

				sinon.stub( global.window, 'scrollX' ).value( 10 );
				sinon.stub( global.window, 'scrollY' ).value( 0 );

				expect( view.isSticky ).to.be.false;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( null );

				view.isActive = true;

				expect( view.isSticky ).to.be.true;
				expect( view._isStickyToTheBottomOfLimiter ).to.be.false;
				expect( view._marginLeft ).to.equal( '-10px' );
			} );

			it( 'is null if view._isStickyToTheBottomOfLimiter is true', () => {
				testUtils.sinon.stub( limiterElement, 'getBoundingClientRect' ).returns( {
					top: -30,
					bottom: 50,
					left: 60,
					height: 80
				} );

				testUtils.sinon.stub( contentElement, 'getBoundingClientRect' ).returns( {
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
} );
