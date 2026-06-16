/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Rect, global, env } from '@ckeditor/ckeditor5-utils';
import { StickyPanelView } from '../../../src/panel/sticky/stickypanelview.js';
import { View } from '../../../src/view.js';
import { LabelView } from '../../../src/label/labelview.js';
import { ViewCollection } from '../../../src/viewcollection.js';

describe( 'StickyPanelView', () => {
	let view, element, contentPanelElement, placeholderElement, limiterElement, locale;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		locale = {};
		limiterElement = document.createElement( 'div' );

		view = new StickyPanelView( locale );
		view.render();

		element = view.element;
		contentPanelElement = view.contentPanelElement;
		placeholderElement = view.element.firstChild;

		vi.spyOn( global.window, 'innerWidth', 'get' ).mockReturnValue( 1000 );
		vi.spyOn( global.window, 'innerHeight', 'get' ).mockReturnValue( 500 );

		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'inherits from View', () => {
			expect( view ).toBeInstanceOf( View );
		} );

		it( 'should create element from template', () => {
			expect( element.tagName ).toBe( 'DIV' );
			expect( element.classList.contains( 'ck' ) ).toBe( true );
			expect( element.classList.contains( 'ck-sticky-panel' ) ).toBe( true );

			expect( placeholderElement.tagName ).toBe( 'DIV' );
			expect( placeholderElement.classList.contains( 'ck' ) ).toBe( true );
			expect( placeholderElement.classList.contains( 'ck-sticky-panel__placeholder' ) ).toBe( true );

			expect( element.lastElementChild ).toBe( contentPanelElement );
		} );

		it( 'should create #contentPanel from template', () => {
			expect( view.contentPanelElement.tagName ).toBe( 'DIV' );
			expect( view.contentPanelElement.classList.contains( 'ck' ) ).toBe( true );
			expect( view.contentPanelElement.classList.contains( 'ck-sticky-panel__content' ) ).toBe( true );
		} );

		it( 'sets view attributes', () => {
			expect( view.isActive ).toBe( false );
			expect( view.isSticky ).toBe( false );
			expect( view.limiterElement ).toBeNull();
			expect( view.limiterBottomOffset ).toBe( 50 );
			expect( view.viewportTopOffset ).toBe( 0 );

			expect( view._marginLeft ).toBeNull();
			expect( view._isStickyToTheBottomOfLimiter ).toBe( false );
			expect( view._stickyTopOffset ).toBeNull();
			expect( view._stickyBottomOffset ).toBeNull();
		} );

		it( 'accepts the locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'creates view#content collection', () => {
			expect( view.content ).toBeInstanceOf( ViewCollection );
		} );
	} );

	describe( 'element view bindings', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		it( 'update the class on view#isSticky change', () => {
			view.isSticky = false;
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).toBe( false );

			view.isSticky = true;
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky' ) ).toBe( true );
		} );

		it( 'update the class on view#_isStickyToTheBottomOfLimiter change', () => {
			view._isStickyToTheBottomOfLimiter = false;
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).toBe( false );

			view._isStickyToTheBottomOfLimiter = true;
			expect( contentPanelElement.classList.contains( 'ck-sticky-panel__content_sticky_bottom-limit' ) ).toBe( true );
		} );

		it( 'update the style.top on view#_stickyTopOffset change', () => {
			view.viewportTopOffset = 100;

			view._stickyTopOffset = 0;
			expect( contentPanelElement.style.top ).toBe( '0px' );

			view._stickyTopOffset = 100;
			expect( contentPanelElement.style.top ).toBe( '100px' );
		} );

		it( 'update the style.width on view#isSticky change', () => {
			vi.spyOn( view._contentPanelPlaceholder, 'getBoundingClientRect' ).mockReturnValue( { width: 100 } );

			view.isSticky = false;
			expect( contentPanelElement.style.width ).toBe( '' );

			view.isSticky = true;
			expect( contentPanelElement.style.width ).toBe( '100px' );
		} );

		it( 'update the style.bottom on view#_stickyBottomOffset change', () => {
			view._stickyBottomOffset = 0;
			expect( contentPanelElement.style.bottom ).toBe( '0px' );

			view._stickyBottomOffset = 50;
			expect( contentPanelElement.style.bottom ).toBe( '50px' );
		} );

		it( 'update the style.marginLeft on view#marginLeft change', () => {
			view._marginLeft = '30px';
			expect( contentPanelElement.style.marginLeft ).toBe( '30px' );

			view._marginLeft = '10px';
			expect( contentPanelElement.style.marginLeft ).toBe( '10px' );
		} );
	} );

	describe( '_contentPanelPlaceholder view bindings', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;
		} );

		it( 'update the style.display on view#isSticky change', () => {
			view.isSticky = false;
			expect( placeholderElement.style.display ).toBe( 'none' );

			view.isSticky = true;
			expect( placeholderElement.style.display ).toBe( 'block' );
		} );

		it( 'update the style.height on view#isSticky change', () => {
			vi.spyOn( view, '_contentPanelRect', 'get' ).mockReturnValue( new Rect( {
				top: 0, right: 50, left: 0, bottom: 50, height: 50, width: 50
			} ) );

			view.isSticky = false;
			expect( placeholderElement.style.height ).toBe( '' );

			view.isSticky = true;
			expect( placeholderElement.style.height ).toBe( '50px' );
		} );
	} );

	describe( 'children', () => {
		it( 'should react on view#content', () => {
			expect( contentPanelElement.childNodes.length ).toBe( 0 );

			const label = new LabelView( { t() {} } );

			view.content.add( label );
			expect( contentPanelElement.childNodes.length ).toBe( 1 );
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
			const spy = vi.spyOn( View.prototype, 'render' );

			view.render();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'checks if the panel should be sticky', () => {
			const spy = vi.spyOn( view, 'checkIfShouldBeSticky' );
			expect( spy ).not.toHaveBeenCalled();

			view.render();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'listens to document#scroll event and calls view.checkIfShouldBeSticky()', () => {
			const spy = vi.spyOn( view, 'checkIfShouldBeSticky' );
			expect( spy ).not.toHaveBeenCalled();

			view.render();
			expect( spy ).toHaveBeenCalledOnce();

			global.document.dispatchEvent( new Event( 'scroll' ) );
			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'listens to visualViewport#scroll event and calls view.checkIfShouldBeSticky()', () => {
			const spy = vi.spyOn( view, 'checkIfShouldBeSticky' );
			expect( spy ).not.toHaveBeenCalled();

			view.render();
			expect( spy ).toHaveBeenCalledOnce();

			global.window.visualViewport.dispatchEvent( new Event( 'scroll' ) );
			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'listens to visualViewport#resize event and calls view.checkIfShouldBeSticky()', () => {
			const spy = vi.spyOn( view, 'checkIfShouldBeSticky' );
			expect( spy ).not.toHaveBeenCalled();

			view.render();
			expect( spy ).toHaveBeenCalledOnce();

			global.window.visualViewport.dispatchEvent( new Event( 'resize' ) );
			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'does not listen to visualViewport events when visualViewport is not supported', () => {
			vi.spyOn( global.window, 'visualViewport', 'get' ).mockReturnValue( null );

			const spy = vi.spyOn( view, 'checkIfShouldBeSticky' );

			view.render();
			spy.mockClear();

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'listens to view.isActive and calls view.checkIfShouldBeSticky()', () => {
			const spy = vi.spyOn( view, 'checkIfShouldBeSticky' );
			expect( spy ).not.toHaveBeenCalled();

			view.render();
			expect( spy ).toHaveBeenCalledOnce();

			view.isActive = true;
			expect( spy ).toHaveBeenCalledTimes( 2 );

			view.isActive = false;
			expect( spy ).toHaveBeenCalledTimes( 3 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'can be called multiple times', () => {
			expect( () => {
				view.destroy();
				view.destroy();
			} ).not.toThrow();
		} );

		it( 'calls destroy on parent class', () => {
			const spy = vi.spyOn( View.prototype, 'destroy' );

			view.destroy();
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'checkIfShouldBeSticky()', () => {
		beforeEach( () => {
			view.limiterElement = limiterElement;

			// Set visual viewport offsets - those should be ignored on non iOS and non Safari.
			vi.spyOn( visualViewport, 'offsetLeft', 'get' ).mockReturnValue( 15 );
			vi.spyOn( visualViewport, 'offsetTop', 'get' ).mockReturnValue( 25 );
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

			const unstickSpy = vi.spyOn( view, '_unstick' );

			view.isActive = false;

			expect( unstickSpy ).toHaveBeenCalledOnce();
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
				vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
					height: 20
				} );
			} );

			it( 'is true if beyond the top of the viewport (panel is active)', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( { top: -10, height: 100 } );

				expect( view.isSticky ).toBe( false );

				view.isActive = true;

				expect( view.isSticky ).toBe( true );
			} );

			it( 'is false if beyond the top of the viewport (panel is inactive)', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( { top: -10, height: 100 } );

				expect( view.isSticky ).toBe( false );

				view.isActive = false;

				expect( view.isSticky ).toBe( false );
			} );

			it( 'is false if in the viewport (panel is active)', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( { top: 10, height: 100 } );

				expect( view.isSticky ).toBe( false );

				view.isActive = true;

				expect( view.isSticky ).toBe( false );
			} );

			it( 'is false if view.limiterElement is smaller than the panel and view.limiterBottomOffset (panel is active)', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( { top: -10, height: 60 } );

				view.limiterBottomOffset = 50;

				expect( view.isSticky ).toBe( false );

				view.isActive = true;

				expect( view.isSticky ).toBe( false );
			} );
		} );

		describe( 'view._isStickyToTheBottomOfLimiter', () => {
			it( 'is true if view.isSticky is true and reached the bottom edge of view.limiterElement', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
					top: -80,
					bottom: 60,
					height: 140,
					width: 100,
					left: 0,
					right: 100
				} );

				vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
					height: 20
				} );

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );

				view.isActive = true;

				expect( view.isSticky ).toBe( true );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( true );
			} );

			it( 'is false if view.isSticky is true and not reached the bottom edge of view.limiterElement', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
					top: -10,
					bottom: 90,
					height: 100,
					width: 100,
					left: 0,
					right: 100
				} );

				vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
					height: 20
				} );

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );

				view.isActive = true;

				expect( view.isSticky ).toBe( true );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );
			} );

			it( 'is false if view.isSticky is false', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
					top: 10
				} );

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );

				view.isActive = true;

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );
			} );
		} );

		describe( 'after scrolling', () => {
			describe( 'if there is only window scrollable', () => {
				beforeEach( () => {
					view.isActive = true;
				} );

				it( 'should make panel sticky to the top if the limiter top is not visible', () => {
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -10,
						bottom: 190,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToTopSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 0,
						_stickyBottomOffset: null,
						_marginLeft: '0px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -140,
						bottom: 60,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).toBe( true );
					expect( view._isStickyToTheBottomOfLimiter ).toBe( true );

					expect( stickToBottomSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '0px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 220,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToBottomSpy ).not.toHaveBeenCalled();
					expect( stickToTopSpy ).not.toHaveBeenCalled();
					expect( unstickSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -152,
						bottom: 48,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 150
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -210,
						bottom: -10,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should avoid flickering after stickiness change', () => {
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -2,
						bottom: 69,
						height: 71,
						width: 100,
						left: 0,
						right: 100
					} );

					const panelRectStub = vi.spyOn( contentPanelElement, 'getBoundingClientRect' );

					panelRectStub.mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( unstickSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );

					// Sticky style adds bottom border so the height of the panel is 1px bigger.
					panelRectStub.mockReturnValue( {
						height: 21
					} );

					view.checkIfShouldBeSticky();

					expect( unstickSpy ).toHaveBeenCalledTimes( 2 );
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
					vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
					view.isActive = true;
				} );

				it( 'should make panel sticky to the top if the limiter top is not visible', () => {
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -10,
						bottom: 190,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToTopSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 25,
						_stickyBottomOffset: null,
						_marginLeft: '15px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -140,
						bottom: 60,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).toBe( true );
					expect( view._isStickyToTheBottomOfLimiter ).toBe( true );

					expect( stickToBottomSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '15px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 220,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToBottomSpy ).not.toHaveBeenCalled();
					expect( stickToTopSpy ).not.toHaveBeenCalled();
					expect( unstickSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -152,
						bottom: 48,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 150
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -210,
						bottom: -10,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
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
					vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
					view.viewportTopOffset = 5;
					view.isActive = true;
				} );

				it( 'should make panel sticky to the top if the limiter top is not visible', () => {
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -10,
						bottom: 190,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToTopSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 30,
						_stickyBottomOffset: null,
						_marginLeft: '15px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -140,
						bottom: 60,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).toBe( true );
					expect( view._isStickyToTheBottomOfLimiter ).toBe( true );

					expect( stickToBottomSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '15px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 220,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToBottomSpy ).not.toHaveBeenCalled();
					expect( stickToTopSpy ).not.toHaveBeenCalled();
					expect( unstickSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -152,
						bottom: 48,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 150
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -210,
						bottom: -10,
						height: 200,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
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
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );

					vi.spyOn( scrollableContainer, 'getBoundingClientRect' ).mockReturnValue( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 200,
						height: 180,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToTopSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 40,
						_stickyBottomOffset: null,
						_marginLeft: '0px'
					} );
				} );

				it( 'should make panel sticky to the bottom if there is enough space left', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );

					vi.spyOn( scrollableContainer, 'getBoundingClientRect' ).mockReturnValue( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -80,
						bottom: 60,
						height: 140,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( view.isSticky ).toBe( true );
					expect( view._isStickyToTheBottomOfLimiter ).toBe( true );

					expect( stickToBottomSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: true,
						_stickyTopOffset: null,
						_stickyBottomOffset: 50,
						_marginLeft: '0px'
					} );
				} );

				it( 'should unstick the panel if the limiter top is still visible', () => {
					const stickToBottomSpy = vi.spyOn( view, '_stickToBottomOfLimiter' );
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( scrollableContainer, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 200,
						height: 180,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToBottomSpy ).not.toHaveBeenCalled();
					expect( stickToTopSpy ).not.toHaveBeenCalled();
					expect( unstickSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if there is not enough space left in the limiter', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( scrollableContainer, 'getBoundingClientRect' ).mockReturnValue( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -80,
						bottom: 60,
						height: 140,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 100
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if panel limiter is not visible in the viewport', () => {
					const spy = vi.spyOn( view, '_unstick' );

					vi.spyOn( scrollableContainer, 'getBoundingClientRect' ).mockReturnValue( {
						top: 120,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: -80,
						bottom: 60,
						height: 140,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( spy ).toHaveBeenCalledOnce();
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
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( scrollableOuterParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: 10,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( scrollableInnerParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 40,
						bottom: 100,
						height: 60,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( unstickSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should stick the panel to the top if the outer container was scrolled over the limiter top', () => {
					const stickToTopSpy = vi.spyOn( view, '_stickToTopOfAncestors' );

					vi.spyOn( scrollableOuterParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: 50,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( scrollableInnerParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 40,
						bottom: 140,
						height: 100,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( stickToTopSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: true,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: 50,
						_stickyBottomOffset: null,
						_marginLeft: '0px'
					} );
				} );

				it( 'should unstick the panel if the outer container was scrolled but there is no space below', () => {
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( scrollableOuterParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: 50,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( scrollableInnerParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: 20,
						bottom: 140,
						height: 120,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 40,
						bottom: 110,
						height: 60,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( unstickSpy ).toHaveBeenCalledOnce();
					assureStickiness( {
						isSticky: false,
						_isStickyToTheBottomOfLimiter: false,
						_stickyTopOffset: null,
						_stickyBottomOffset: null,
						_marginLeft: null
					} );
				} );

				it( 'should unstick the panel if the outer container was scrolled over the inner container top', () => {
					const unstickSpy = vi.spyOn( view, '_unstick' );

					vi.spyOn( scrollableOuterParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: 50,
						bottom: 160,
						height: 150,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( scrollableInnerParent, 'getBoundingClientRect' ).mockReturnValue( {
						top: -20,
						bottom: 50,
						height: 70,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
						top: 0,
						bottom: 40,
						height: 40,
						width: 100,
						left: 0,
						right: 100
					} );

					vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
						height: 20
					} );

					view.checkIfShouldBeSticky();

					expect( unstickSpy ).toHaveBeenCalledOnce();
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
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
					top: -10,
					bottom: 70,
					height: 100,
					width: 100,
					left: 0,
					right: 100
				} );

				vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
					height: 20
				} );

				vi.spyOn( global.window, 'scrollX', 'get' ).mockReturnValue( 10 );
				vi.spyOn( global.window, 'scrollY', 'get' ).mockReturnValue( 0 );

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );
				expect( view._marginLeft ).toBe( null );

				view.isActive = true;

				expect( view.isSticky ).toBe( true );
				expect( view._stickyTopOffset ).not.toBe( null );
				expect( view._marginLeft ).toBe( '-10px' );
			} );

			it( 'is set if view._isStickyToTheBottomOfLimiter is true', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
					top: -30,
					bottom: 50,
					left: 60,
					height: 80,
					width: 100,
					right: 160
				} );

				vi.spyOn( contentPanelElement, 'getBoundingClientRect' ).mockReturnValue( {
					height: 20
				} );

				vi.spyOn( document.body, 'getBoundingClientRect' ).mockReturnValue( {
					left: 40
				} );

				vi.spyOn( global.window, 'innerHeight', 'get' ).mockReturnValue( 100 );

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );
				expect( view._marginLeft ).toBe( null );

				view.isActive = true;

				expect( view.isSticky ).toBe( true );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( true );
				expect( view._marginLeft ).toBe( '0px' );
			} );

			it( 'is null if view.isSticky is false', () => {
				vi.spyOn( limiterElement, 'getBoundingClientRect' ).mockReturnValue( {
					top: 10
				} );

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );
				expect( view._marginLeft ).toBe( null );

				view.isActive = true;

				expect( view.isSticky ).toBe( false );
				expect( view._isStickyToTheBottomOfLimiter ).toBe( false );
				expect( view._marginLeft ).toBe( null );
			} );
		} );
	} );

	function assureStickiness( options ) {
		expect( view.isSticky, 'isSticky is incorrect' ).toBe( options.isSticky );
		expect( view._isStickyToTheBottomOfLimiter, '_isStickyToTheBottomOfLimiter is incorrect' )
			.toBe( options._isStickyToTheBottomOfLimiter );
		expect( view._stickyTopOffset, '_stickyTopOffset is incorrect' ).toBe( options._stickyTopOffset );
		expect( view._stickyBottomOffset, '_stickyBottomOffset is incorrect' ).toBe( options._stickyBottomOffset );
		expect( view._marginLeft, '_marginLeft is incorrect' ).toBe( options._marginLeft );
	}
} );
