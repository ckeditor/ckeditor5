/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewCollection } from '../../../src/viewcollection.js';
import { BalloonPanelView } from '../../../src/panel/balloon/balloonpanelview.js';
import { ButtonView } from '../../../src/button/buttonview.js';
import { Rect, ResizeObserver, global } from '@ckeditor/ckeditor5-utils';

describe( 'BalloonPanelView', () => {
	let view;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		view = new BalloonPanelView();
		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		if ( view ) {
			view.element.remove();

			view.destroy();
		}
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).toBe( 'DIV' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-balloon-panel' ) ).toBe( true );
		} );

		it( 'should set default values', () => {
			expect( view.top ).toBe( 0 );
			expect( view.left ).toBe( 0 );
			expect( view.position ).toBe( 'arrow_nw' );
			expect( view.isVisible ).toBe( false );
			expect( view.withArrow ).toBe( true );
		} );

		it( 'creates view#content collection', () => {
			expect( view.content ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should initialize _resizeObserver with null value', () => {
			expect( view._resizeObserver ).toBeNull();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should hide the panel if it is pinned', () => {
			view.isVisible = false;

			view.show();

			expect( view.isVisible ).toBe( true );

			view.destroy();

			expect( view.isVisible ).toBe( false );
		} );

		it( 'should destroy the _resizeObserver if present', () => {
			const target = document.createElement( 'div' );
			const limiter = document.createElement( 'div' );

			document.body.appendChild( target );
			document.body.appendChild( limiter );

			view.show();
			view.pin( {
				target,
				limiter
			} );

			const spy = vi.spyOn( view._resizeObserver, 'destroy' );

			expect( spy ).not.toHaveBeenCalled();

			view.destroy();

			expect( spy ).toHaveBeenCalledOnce();

			target.remove();
			limiter.remove();
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'arrow', () => {
			it( 'should react on view#position', () => {
				expect( view.element.classList.contains( 'ck-balloon-panel_arrow_nw' ) ).toBe( true );

				view.position = 'arrow_ne';

				expect( view.element.classList.contains( 'ck-balloon-panel_arrow_ne' ) ).toBe( true );
			} );

			it( 'should react on view#withArrow', () => {
				expect( view.element.classList.contains( 'ck-balloon-panel_with-arrow' ) ).toBe( true );

				view.withArrow = false;

				expect( view.element.classList.contains( 'ck-balloon-panel_with-arrow' ) ).toBe( false );
			} );
		} );

		describe( 'isVisible', () => {
			it( 'should react on view#isvisible', () => {
				expect( view.element.classList.contains( 'ck-balloon-panel_visible' ) ).toBe( false );

				view.isVisible = true;

				expect( view.element.classList.contains( 'ck-balloon-panel_visible' ) ).toBe( true );
			} );
		} );

		describe( 'styles', () => {
			it( 'should react on view#top', () => {
				expect( view.element.style.top ).toBe( '0px' );

				view.top = 10;

				expect( view.element.style.top ).toBe( '10px' );
			} );

			it( 'should react on view#left', () => {
				expect( view.element.style.left ).toBe( '0px' );

				view.left = 10;

				expect( view.element.style.left ).toBe( '10px' );
			} );
		} );

		describe( 'class', () => {
			it( 'should set additional class to the view#element', () => {
				view.class = 'foo';

				expect( view.element.classList.contains( 'foo' ) ).toBe( true );

				view.class = '';

				expect( view.element.classList.contains( 'foo' ) ).toBe( false );
			} );
		} );

		describe( 'children', () => {
			it( 'should react on view#content', () => {
				expect( view.element.childNodes.length ).toBe( 0 );

				const button = new ButtonView( { t() {} } );

				view.content.add( button );
				expect( view.element.childNodes.length ).toBe( 1 );
			} );
		} );
	} );

	describe( 'show()', () => {
		it( 'should set view#isVisible as true', () => {
			view.isVisible = false;

			view.show();

			expect( view.isVisible ).toBe( true );
		} );
	} );

	describe( 'hide()', () => {
		it( 'should set view#isVisible as false', () => {
			view.isVisible = true;

			view.hide();

			expect( view.isVisible ).toBe( false );
		} );
	} );

	describe( 'attachTo()', () => {
		let target, limiter;

		beforeEach( () => {
			limiter = document.createElement( 'div' );
			target = document.createElement( 'div' );

			document.body.appendChild( limiter );
			document.body.appendChild( target );

			// Mock balloon panel element dimensions.
			mockBoundingBox( view.element, {
				top: 0,
				left: 0,
				width: 100,
				height: 100
			} );

			// Mock window dimensions.
			vi.spyOn( window, 'innerWidth', 'get' ).mockReturnValue( 500 );
			vi.spyOn( window, 'innerHeight', 'get' ).mockReturnValue( 500 );
			vi.spyOn( window, 'scrollX', 'get' ).mockReturnValue( 0 );
			vi.spyOn( window, 'scrollY', 'get' ).mockReturnValue( 0 );
		} );

		afterEach( () => {
			limiter.remove();
			target.remove();
		} );

		it( 'should use default options', () => {
			const spy = vi.spyOn( BalloonPanelView, '_getOptimalPosition' );

			view.attachTo( { target } );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( {
				element: view.element,
				target,
				positions: [
					BalloonPanelView.defaultPositions.southArrowNorth,
					BalloonPanelView.defaultPositions.southArrowNorthMiddleWest,
					BalloonPanelView.defaultPositions.southArrowNorthMiddleEast,
					BalloonPanelView.defaultPositions.southArrowNorthWest,
					BalloonPanelView.defaultPositions.southArrowNorthEast,
					BalloonPanelView.defaultPositions.northArrowSouth,
					BalloonPanelView.defaultPositions.northArrowSouthMiddleWest,
					BalloonPanelView.defaultPositions.northArrowSouthMiddleEast,
					BalloonPanelView.defaultPositions.northArrowSouthWest,
					BalloonPanelView.defaultPositions.northArrowSouthEast,
					BalloonPanelView.defaultPositions.viewportStickyNorth
				],
				limiter: document.body,
				fitInViewport: true
			} ) );
		} );

		it( 'should parse optimal position offset to int', () => {
			vi.spyOn( BalloonPanelView, '_getOptimalPosition' ).mockReturnValue( {
				top: 10.345,
				left: 10.345,
				name: 'position'
			} );

			view.attachTo( { target, limiter } );

			expect( view.top ).toBe( 10 );
			expect( view.left ).toBe( 10 );
		} );

		it( 'should set and override withArrow property', () => {
			const stub = vi.spyOn( BalloonPanelView, '_getOptimalPosition' ).mockReturnValue( {
				top: 10.345,
				left: 10.345,
				name: 'position'
			} );

			view.withArrow = false;
			view.attachTo( { target, limiter } );

			expect( view.withArrow ).toBe( true );

			view.set( 'withArrow', false );
			view.attachTo( { target, limiter } );

			expect( view.withArrow ).toBe( true );

			stub.mockRestore();

			vi.spyOn( BalloonPanelView, '_getOptimalPosition' ).mockReturnValue( {
				top: 10.345,
				left: 10.345,
				name: 'position',
				config: {
					withArrow: false
				}
			} );

			view.attachTo( { target, limiter } );
			expect( view.withArrow ).toBe( false );
		} );

		describe( 'limited by limiter element', () => {
			beforeEach( () => {
				// Mock limiter element dimensions.
				mockBoundingBox( limiter, {
					left: 0,
					top: 0,
					width: 500,
					height: 500
				} );
			} );

			it( 'should put balloon on the `south east` side of the target element at default', () => {
				// Place target element at the center of the limiter.
				mockBoundingBox( target, {
					top: 225,
					left: 225,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_n' );
			} );

			it( 'should put balloon on the `south east` side of the target element when ' +
				'target is on the top left side of the limiter', () => {
				mockBoundingBox( target, {
					top: 0,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_nw' );
			} );

			it( 'should put balloon on the `south west` side of the target element when target is on the right side of the limiter', () => {
				mockBoundingBox( target, {
					top: 0,
					left: 450,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_ne' );
			} );

			it( 'should put balloon on the `north east` side of the target element when target is on the bottom of the limiter ', () => {
				mockBoundingBox( target, {
					top: 450,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_sw' );
			} );

			it( 'should put balloon on the `north west` side of the target element when ' +
				'target is on the bottom right of the limiter', () => {
				mockBoundingBox( target, {
					top: 450,
					left: 450,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_se' );
			} );

			// https://github.com/ckeditor/ckeditor5-ui-default/issues/126
			it( 'works in a positioned ancestor (position: absolute)', () => {
				const positionedAncestor = document.createElement( 'div' );

				positionedAncestor.style.position = 'absolute';
				positionedAncestor.style.top = '100px';
				positionedAncestor.style.left = '100px';
				positionedAncestor.appendChild( view.element );

				document.body.appendChild( positionedAncestor );
				positionedAncestor.appendChild( view.element );

				mockBoundingBox( positionedAncestor, {
					top: 100,
					left: 100,
					width: 10,
					height: 10
				} );

				mockBoundingBox( target, {
					top: 0,
					left: 0,
					width: 100,
					height: 100
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( BalloonPanelView.arrowHeightOffset );
				expect( view.left ).toBe( -100 );

				positionedAncestor.remove();
			} );

			// https://github.com/ckeditor/ckeditor5-ui-default/issues/126
			it( 'works in a positioned ancestor (position: static)', () => {
				const positionedAncestor = document.createElement( 'div' );

				positionedAncestor.style.position = 'static';
				positionedAncestor.appendChild( view.element );

				document.body.appendChild( positionedAncestor );
				positionedAncestor.appendChild( view.element );

				mockBoundingBox( target, {
					top: 0,
					left: 0,
					width: 100,
					height: 100
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( BalloonPanelView.arrowHeightOffset + 100 );
				expect( view.left ).toBe( 0 );

				positionedAncestor.remove();
			} );
		} );

		describe( 'limited by viewport', () => {
			it( 'should put balloon on the `south west` position when `south east` is limited', () => {
				mockBoundingBox( limiter, {
					left: 0,
					top: 0,
					width: 500,
					height: 500
				} );

				mockBoundingBox( target, {
					top: 0,
					left: 225,
					width: 50,
					height: 50
				} );

				// Note: No sandboxing here. Otherwise, it would restore to the previously stubbed value.
				vi.spyOn( window, 'innerWidth', 'get' ).mockReturnValue( 275 );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_ne' );
			} );

			it( 'should put balloon on the `south east` position when `south west` is limited', () => {
				mockBoundingBox( limiter, {
					top: 0,
					left: -400,
					width: 500,
					height: 500
				} );

				mockBoundingBox( target, {
					top: 0,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_nw' );
			} );

			it( 'should put balloon on the `north east` position when `south east` is limited', () => {
				mockBoundingBox( limiter, {
					left: 0,
					top: 0,
					width: 500,
					height: 500
				} );

				mockBoundingBox( target, {
					top: 225,
					left: 0,
					width: 50,
					height: 50
				} );

				// Note: No sandboxing here. Otherwise, it would restore to the previously stubbed value.
				vi.spyOn( window, 'innerHeight', 'get' ).mockReturnValue( 275 );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_sw' );
			} );

			it( 'should put balloon on the `south east` position when `north east` is limited', () => {
				mockBoundingBox( limiter, {
					left: 0,
					top: -350,
					width: 500,
					height: 500
				} );

				mockBoundingBox( target, {
					top: 0,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).toBe( 'arrow_nw' );
			} );
		} );

		describe( 'limited by parent with overflow', () => {
			let parentWithOverflow, limiter, target;
			const OFF_THE_SCREEN_POSITION = -99999;

			beforeEach( () => {
				parentWithOverflow = document.createElement( 'div' );
				parentWithOverflow.style.overflow = 'scroll';
				parentWithOverflow.style.width = '100px';
				parentWithOverflow.style.height = '100px';

				limiter = document.createElement( 'div' );
				target = document.createElement( 'div' );

				// Mock parent dimensions.
				mockBoundingBox( parentWithOverflow, {
					left: 0,
					top: 0,
					width: 100,
					height: 100
				} );

				target.style.width = '50px';
				target.style.height = '50px';

				parentWithOverflow.appendChild( limiter );
				parentWithOverflow.appendChild( target );
				document.body.appendChild( parentWithOverflow );
			} );

			afterEach( () => {
				limiter.remove();
				target.remove();
				parentWithOverflow.remove();
			} );

			it( 'should not show the balloon if the target is not visible (vertical top)', () => {
				mockBoundingBox( target, {
					top: -51,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should not show the balloon if the target is not visible (vertical bottom)', () => {
				mockBoundingBox( target, {
					top: 101,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should not show the balloon if the target is not visible (horizontal left)', () => {
				mockBoundingBox( target, {
					top: 0,
					left: -100,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should not show the balloon if the target is not visible (horizontal right)', () => {
				mockBoundingBox( target, {
					top: 0,
					left: 101,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should get proper HTML element when callback is passed as a target', () => {
				const callback = vi.fn().mockReturnValue( document.createElement( 'a' ) );

				view.attachTo( { target: callback, limiter } );

				expect( callback ).toHaveBeenCalled();
			} );

			it( 'should show the balloon when limiter is not defined', () => {
				mockBoundingBox( target, {
					top: 50,
					left: 50,
					width: 50,
					height: 50
				} );

				view.attachTo( { target } );

				expect( view.left ).toBe( 25 );
			} );
		} );

		describe( 'limited by editor with overflow', () => {
			let limiter, target;
			const OFF_THE_SCREEN_POSITION = -99999;

			beforeEach( () => {
				limiter = document.createElement( 'div' );
				limiter.style.overflow = 'scroll';
				limiter.style.width = '100px';
				limiter.style.height = '100px';

				// Mock parent dimensions.
				mockBoundingBox( limiter, {
					left: 0,
					top: 0,
					width: 100,
					height: 100
				} );

				target = document.createElement( 'div' );
				target.style.width = '200px';
				target.style.height = '200px';

				limiter.appendChild( target );
				document.body.appendChild( limiter );
			} );

			afterEach( () => {
				limiter.remove();
				target.remove();
			} );

			it( 'should not show the balloon if the target is not visible (vertical top)', () => {
				mockBoundingBox( target, {
					top: -51,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should not show the balloon if the target is not visible (vertical bottom)', () => {
				mockBoundingBox( target, {
					top: 159,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should not show the balloon if the target is not visible (horizontal left)', () => {
				mockBoundingBox( target, {
					top: 0,
					left: -100,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should not show the balloon if the target is not visible (horizontal right)', () => {
				mockBoundingBox( target, {
					top: 0,
					left: 101,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );

			it( 'should show the balloon when limiter is not defined', () => {
				mockBoundingBox( target, {
					top: 50,
					left: 50,
					width: 50,
					height: 50
				} );

				view.attachTo( { target } );

				expect( view.left ).toBe( 25 );
			} );
		} );

		describe( 'limited by editor with overflow and a parent with overflow', () => {
			let limiter, target, parentWithOverflow, limiterParent;
			const OFF_THE_SCREEN_POSITION = -99999;

			beforeEach( () => {
				limiter = document.createElement( 'div' );
				limiter.style.overflow = 'scroll';

				parentWithOverflow = document.createElement( 'div' );
				parentWithOverflow.style.overflow = 'scroll';

				limiterParent = document.createElement( 'div' );

				target = document.createElement( 'div' );

				// Mock parent dimensions.
				mockBoundingBox( parentWithOverflow, {
					left: 0,
					top: 0,
					width: 200,
					height: 200
				} );

				// Mock limiter parent dimensions.
				mockBoundingBox( limiterParent, {
					left: 0,
					top: 0,
					width: 400,
					height: 400
				} );

				// Mock limiter dimensions.
				mockBoundingBox( limiter, {
					left: 0,
					top: 0,
					width: 100,
					height: 100
				} );

				limiter.appendChild( target );
				limiterParent.appendChild( limiter );
				parentWithOverflow.appendChild( limiterParent );
				document.body.appendChild( parentWithOverflow );
			} );

			afterEach( () => {
				limiter.remove();
				target.remove();
				parentWithOverflow.remove();
			} );

			it( 'should not show the balloon if the target is not visible ( target higher than scrollable ancestor )', () => {
				mockBoundingBox( target, {
					top: -250,
					left: 0,
					width: 200,
					height: 200
				} );

				view.attachTo( { target, limiter } );

				expect( view.top ).toBe( OFF_THE_SCREEN_POSITION );
				expect( view.left ).toBe( OFF_THE_SCREEN_POSITION );
			} );
		} );
	} );

	describe( 'pin() and unpin()', () => {
		let attachToSpy, target, targetParent, limiter, notRelatedElement;

		beforeEach( () => {
			attachToSpy = vi.spyOn( view, 'attachTo' );
			limiter = document.createElement( 'div' );
			targetParent = document.createElement( 'div' );
			target = document.createElement( 'div' );
			notRelatedElement = document.createElement( 'div' );

			view.show();

			targetParent.appendChild( target );
			document.body.appendChild( targetParent );
			document.body.appendChild( limiter );
			document.body.appendChild( notRelatedElement );
		} );

		afterEach( () => {
			targetParent.remove();
			limiter.remove();
			notRelatedElement.remove();
		} );

		describe( 'pin()', () => {
			it( 'should show the balloon', () => {
				const spy = vi.spyOn( view, 'show' );

				view.hide();

				view.pin( { target, limiter } );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should start pinning when the balloon is visible', () => {
				view.pin( { target, limiter } );
				expect( attachToSpy ).toHaveBeenCalledOnce();

				view.hide();
				targetParent.dispatchEvent( new Event( 'scroll' ) );

				view.show();
				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );

				targetParent.dispatchEvent( new Event( 'scroll' ) );
				expect( attachToSpy ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'should stop pinning when the balloon becomes invisible', () => {
				view.show();

				view.pin( { target, limiter } );
				expect( attachToSpy ).toHaveBeenCalledOnce();

				view.hide();

				targetParent.dispatchEvent( new Event( 'scroll' ) );
				expect( attachToSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should unpin if already pinned', () => {
				const unpinSpy = vi.spyOn( view, 'unpin' );

				view.show();
				expect( attachToSpy ).not.toHaveBeenCalled();

				view.pin( { target, limiter } );
				expect( attachToSpy ).toHaveBeenCalledOnce();

				view.pin( { target, limiter } );
				expect( unpinSpy ).toHaveBeenCalledTimes( 2 );

				targetParent.dispatchEvent( new Event( 'scroll' ) );
				expect( attachToSpy ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'should keep the balloon pinned to the target when any of the related elements is scrolled', () => {
				view.pin( { target, limiter } );

				expect( attachToSpy ).toHaveBeenCalledOnce();
				expect( attachToSpy ).toHaveBeenLastCalledWith( { target, limiter } );

				targetParent.dispatchEvent( new Event( 'scroll' ) );

				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );
				expect( attachToSpy ).toHaveBeenLastCalledWith( { target, limiter } );

				limiter.dispatchEvent( new Event( 'scroll' ) );

				expect( attachToSpy ).toHaveBeenCalledTimes( 3 );
				expect( attachToSpy ).toHaveBeenLastCalledWith( { target, limiter } );

				notRelatedElement.dispatchEvent( new Event( 'scroll' ) );

				// Nothing's changed.
				expect( attachToSpy ).toHaveBeenCalledTimes( 3 );
				expect( attachToSpy ).toHaveBeenLastCalledWith( { target, limiter } );
			} );

			it( 'should keep the balloon pinned to the target when the browser window is being resized', () => {
				view.pin( { target, limiter } );

				expect( attachToSpy ).toHaveBeenCalledOnce();
				expect( attachToSpy ).toHaveBeenLastCalledWith( { target, limiter } );

				window.dispatchEvent( new Event( 'resize' ) );

				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );
				expect( attachToSpy ).toHaveBeenLastCalledWith( { target, limiter } );
			} );

			it( 'should stop attaching when the balloon is hidden', () => {
				view.pin( { target, limiter } );

				expect( attachToSpy ).toHaveBeenCalledOnce();

				view.hide();

				window.dispatchEvent( new Event( 'resize' ) );
				window.dispatchEvent( new Event( 'scroll' ) );

				// Still once.
				expect( attachToSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should stop attaching once the view is destroyed', () => {
				view.pin( { target, limiter } );

				expect( attachToSpy ).toHaveBeenCalledOnce();

				view.destroy();
				view.element.remove();
				view = null;

				window.dispatchEvent( new Event( 'resize' ) );
				window.dispatchEvent( new Event( 'scroll' ) );

				// Still once.
				expect( attachToSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should set document.body as the default limiter', () => {
				view.pin( { target } );

				expect( attachToSpy ).toHaveBeenCalledOnce();

				document.body.dispatchEvent( new Event( 'scroll' ) );

				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should work for Range as a target', () => {
				const element = document.createElement( 'div' );
				const range = document.createRange();

				element.appendChild( document.createTextNode( 'foo bar' ) );
				document.body.appendChild( element );
				range.selectNodeContents( element );

				view.pin( { target: range } );

				expect( attachToSpy ).toHaveBeenCalledOnce();

				element.dispatchEvent( new Event( 'scroll' ) );

				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );

				element.remove();
			} );

			it( 'should work for a Rect as a target', () => {
				// Just check if this normally works without errors.
				const rect = {};

				view.pin( { target: rect, limiter } );

				expect( attachToSpy ).toHaveBeenCalledOnce();

				limiter.dispatchEvent( new Event( 'scroll' ) );

				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should work for a function as a target/limiter', () => {
				// Just check if this normally works without errors.
				const rect = {};

				view.pin( {
					target() { return rect; },
					limiter() { return limiter; }
				} );

				expect( attachToSpy ).toHaveBeenCalledOnce();

				limiter.dispatchEvent( new Event( 'scroll' ) );

				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );
			} );

			// https://github.com/ckeditor/ckeditor5-ui/issues/227
			it( 'should react to #scroll from anywhere when the target is not an HTMLElement or Range', () => {
				const rect = {};

				view.pin( { target: rect } );
				expect( attachToSpy ).toHaveBeenCalledOnce();

				notRelatedElement.dispatchEvent( new Event( 'scroll' ) );
				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );
			} );

			// https://github.com/ckeditor/ckeditor5-ui/issues/260
			it( 'should react to #scroll from anywhere when the limiter is not an HTMLElement` or Range', () => {
				const rect = {};

				view.pin( { target, limiter: rect } );
				expect( attachToSpy ).toHaveBeenCalledOnce();

				notRelatedElement.dispatchEvent( new Event( 'scroll' ) );
				expect( attachToSpy ).toHaveBeenCalledTimes( 2 );
			} );

			describe( 'observe element visibility', () => {
				beforeEach( () => {
					vi.useFakeTimers();
				} );

				afterEach( () => {
					vi.useRealTimers();
				} );

				it( 'should hide if the target is not visible (display: none)', () => {
					const showSpy = vi.spyOn( view, 'show' );
					const hideSpy = vi.spyOn( view, 'hide' );

					target.style.display = 'none';
					view.pin( { target, limiter } );

					expect( hideSpy ).not.toHaveBeenCalled();
					expect( showSpy ).not.toHaveBeenCalled();
				} );

				it( 'should not hide if the target is not visible (visibility: hidden)', () => {
					const showSpy = vi.spyOn( view, 'show' );
					const hideSpy = vi.spyOn( view, 'hide' );

					target.style.visibility = 'hidden';
					view.pin( { target, limiter } );

					expect( hideSpy ).not.toHaveBeenCalled();
					expect( showSpy ).toHaveBeenCalledOnce();
				} );

				it( 'should hide if the target is being hidden (display: none)', () => {
					const resizeCallbackRef = createResizeObserverCallbackRef();

					view.pin( { target, limiter } );
					vi.advanceTimersByTime( 100 );

					expect( view.isVisible ).toBe( true );

					// It's still visible, nothing changed.
					resizeCallbackRef.current( [ { target } ] );
					vi.advanceTimersByTime( 100 );
					expect( view.isVisible ).toBe( true );

					// Hide the target and force call resize callback.
					target.style.display = 'none';
					resizeCallbackRef.current( [ { target } ] );

					// It should be hidden now.
					vi.advanceTimersByTime( 100 );
					expect( view.isVisible ).toBe( false );
				} );

				it( 'should not hide if the target is being hidden (visibility: hidden)', () => {
					const resizeCallbackRef = createResizeObserverCallbackRef();

					view.pin( { target, limiter } );
					vi.advanceTimersByTime( 100 );

					expect( view.isVisible ).toBe( true );

					// It's still visible, nothing changed.
					resizeCallbackRef.current( [ { target } ] );
					vi.advanceTimersByTime( 100 );
					expect( view.isVisible ).toBe( true );

					// Hide the target and force call resize callback.
					target.style.visibility = 'hidden';
					resizeCallbackRef.current( [ { target } ] );

					// It should be still visible.
					vi.advanceTimersByTime( 100 );
					expect( view.isVisible ).toBe( true );
				} );

				it( 'should properly cleanup resize observer when stop pinning', () => {
					view.pin( { target, limiter } );
					vi.advanceTimersByTime( 100 );

					expect( view._resizeObserver ).not.toBeNull();

					const destroyObserverSpy = vi.spyOn( view._resizeObserver, 'destroy' );

					view.unpin();
					vi.advanceTimersByTime( 100 );

					expect( destroyObserverSpy ).toHaveBeenCalledOnce();
					expect( view._resizeObserver ).toBeNull();
				} );

				it( 'should watch parent element visibility changes if target is text node', () => {
					const resizeCallbackRef = createResizeObserverCallbackRef();
					const textNode = target.appendChild(
						document.createTextNode( 'Hello World' )
					);

					const range = document.createRange();
					range.setStart( textNode, 1 );
					range.setEnd( textNode, 8 );

					view.pin( { target: range, limiter } );
					vi.advanceTimersByTime( 100 );

					expect( view.isVisible ).toBe( true );

					// It's still visible, nothing changed.
					resizeCallbackRef.current( [ { target } ] );
					vi.advanceTimersByTime( 100 );
					expect( view.isVisible ).toBe( true );

					// Hide the target and force call resize callback.
					target.style.display = 'none';
					resizeCallbackRef.current( [ { target } ] );

					// It should be hidden now.
					vi.advanceTimersByTime( 100 );
					expect( view.isVisible ).toBe( false );
				} );

				function createResizeObserverCallbackRef() {
					const resizeCallbackRef = { current: null };

					ResizeObserver._observerInstance = null;
					vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function( callback ) {
						resizeCallbackRef.current = callback;

						return {
							observe() {},
							unobserve() {}
						};
					} );

					return resizeCallbackRef;
				}
			} );
		} );

		describe( 'unpin()', () => {
			it( 'should hide the balloon if pinned', () => {
				const spy = vi.spyOn( view, 'hide' );

				view.pin( { target, limiter } );
				view.unpin();

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should stop attaching', () => {
				view.pin( { target, limiter } );
				expect( attachToSpy ).toHaveBeenCalledOnce();

				view.unpin();

				view.hide();
				window.dispatchEvent( new Event( 'resize' ) );
				document.dispatchEvent( new Event( 'scroll' ) );
				view.show();
				window.dispatchEvent( new Event( 'resize' ) );
				document.dispatchEvent( new Event( 'scroll' ) );

				expect( attachToSpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'defaultPositions', () => {
		let positions, balloonRect, targetRect, viewportRect, arrowHOffset, arrowVOffset;

		beforeEach( () => {
			positions = BalloonPanelView.defaultPositions;
			arrowHOffset = BalloonPanelView.arrowSideOffset;
			arrowVOffset = BalloonPanelView.arrowHeightOffset;

			viewportRect = new Rect( {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 200,
				height: 200
			} );

			targetRect = new Rect( {
				top: 100,
				bottom: 200,
				left: 100,
				right: 200,
				width: 100,
				height: 100
			} );

			balloonRect = new Rect( {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 50,
				height: 50
			} );
		} );

		it( 'should have a proper length', () => {
			expect( Object.keys( positions ) ).toHaveLength( 33 );
		} );

		// ------- North

		it( 'should define the "northArrowSouth" position', () => {
			expect( positions.northArrowSouth( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 125,
				name: 'arrow_s'
			} );
		} );

		it( 'should define the "northArrowSouthEast" position', () => {
			expect( positions.northArrowSouthEast( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 100 + arrowHOffset,
				name: 'arrow_se'
			} );
		} );

		it( 'should define the "northArrowSouthMiddleEast" position', () => {
			expect( positions.northArrowSouthMiddleEast( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 112.5 + arrowHOffset,
				name: 'arrow_sme'
			} );
		} );

		it( 'should define the "northArrowSouthWest" position', () => {
			expect( positions.northArrowSouthWest( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 150 - arrowHOffset,
				name: 'arrow_sw'
			} );
		} );

		it( 'should define the "northArrowSouthMiddleWest" position', () => {
			expect( positions.northArrowSouthMiddleWest( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 137.5 - arrowHOffset,
				name: 'arrow_smw'
			} );
		} );

		// ------- North west

		it( 'should define the "northWestArrowSouth" position', () => {
			expect( positions.northWestArrowSouth( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 75,
				name: 'arrow_s'
			} );
		} );

		it( 'should define the "northWestArrowSouthWest" position', () => {
			expect( positions.northWestArrowSouthWest( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 100 - arrowHOffset,
				name: 'arrow_sw'
			} );
		} );

		it( 'should define the "northWestArrowSouthMiddleWest" position', () => {
			expect( positions.northWestArrowSouthMiddleWest( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 87.5 - arrowHOffset,
				name: 'arrow_smw'
			} );
		} );

		it( 'should define the "northWestArrowSouthEast" position', () => {
			expect( positions.northWestArrowSouthEast( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 50 + arrowHOffset,
				name: 'arrow_se'
			} );
		} );

		it( 'should define the "northWestArrowSouthMiddleEast" position', () => {
			expect( positions.northWestArrowSouthMiddleEast( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 62.5 + arrowHOffset,
				name: 'arrow_sme'
			} );
		} );

		// ------- North east

		it( 'should define the "northEastArrowSouth" position', () => {
			expect( positions.northEastArrowSouth( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 175,
				name: 'arrow_s'
			} );
		} );

		it( 'should define the "northEastArrowSouthEast" position', () => {
			expect( positions.northEastArrowSouthEast( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 150 + arrowHOffset,
				name: 'arrow_se'
			} );
		} );

		it( 'should define the "northEastArrowSouthMiddleEast" position', () => {
			expect( positions.northEastArrowSouthMiddleEast( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 162.5 + arrowHOffset,
				name: 'arrow_sme'
			} );
		} );

		it( 'should define the "northEastArrowSouthWest" position', () => {
			expect( positions.northEastArrowSouthWest( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 200 - arrowHOffset,
				name: 'arrow_sw'
			} );
		} );

		it( 'should define the "northEastArrowSouthMiddleWest" position', () => {
			expect( positions.northEastArrowSouthMiddleWest( targetRect, balloonRect ) ).toEqual( {
				top: 50 - arrowVOffset,
				left: 187.5 - arrowHOffset,
				name: 'arrow_smw'
			} );
		} );

		// ------- South

		it( 'should define the "southArrowNorth" position', () => {
			expect( positions.southArrowNorth( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 125,
				name: 'arrow_n'
			} );
		} );

		it( 'should define the "southArrowNorthEast" position', () => {
			expect( positions.southArrowNorthEast( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 100 + arrowHOffset,
				name: 'arrow_ne'
			} );
		} );

		it( 'should define the "southArrowNorthMiddleEast" position', () => {
			expect( positions.southArrowNorthMiddleEast( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 112.5 + arrowHOffset,
				name: 'arrow_nme'
			} );
		} );

		it( 'should define the "southArrowNorthWest" position', () => {
			expect( positions.southArrowNorthWest( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 150 - arrowHOffset,
				name: 'arrow_nw'
			} );
		} );

		it( 'should define the "southArrowNorthMiddleWest" position', () => {
			expect( positions.southArrowNorthMiddleWest( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 137.5 - arrowHOffset,
				name: 'arrow_nmw'
			} );
		} );

		// ------- South west

		it( 'should define the "southWestArrowNorth" position', () => {
			expect( positions.southWestArrowNorth( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 75,
				name: 'arrow_n'
			} );
		} );

		it( 'should define the "southWestArrowNorthWest" position', () => {
			expect( positions.southWestArrowNorthWest( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 100 - arrowHOffset,
				name: 'arrow_nw'
			} );
		} );

		it( 'should define the "southWestArrowNorthMiddleWest" position', () => {
			expect( positions.southWestArrowNorthMiddleWest( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 87.5 - arrowHOffset,
				name: 'arrow_nmw'
			} );
		} );

		it( 'should define the "southWestArrowNorthEast" position', () => {
			expect( positions.southWestArrowNorthEast( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 50 + arrowHOffset,
				name: 'arrow_ne'
			} );
		} );

		it( 'should define the "southWestArrowNorthMiddleEast" position', () => {
			expect( positions.southWestArrowNorthMiddleEast( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 62.5 + arrowHOffset,
				name: 'arrow_nme'
			} );
		} );

		// ------- South east

		it( 'should define the "southEastArrowNorth" position', () => {
			expect( positions.southEastArrowNorth( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 175,
				name: 'arrow_n'
			} );
		} );

		it( 'should define the "southEastArrowNorthEast" position', () => {
			expect( positions.southEastArrowNorthEast( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 150 + arrowHOffset,
				name: 'arrow_ne'
			} );
		} );

		it( 'should define the "southEastArrowNorthMiddleEast" position', () => {
			expect( positions.southEastArrowNorthMiddleEast( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 162.5 + arrowHOffset,
				name: 'arrow_nme'
			} );
		} );

		it( 'should define the "southEastArrowNorthWest" position', () => {
			expect( positions.southEastArrowNorthWest( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 200 - arrowHOffset,
				name: 'arrow_nw'
			} );
		} );

		it( 'should define the "southEastArrowNorthMiddleWest" position', () => {
			expect( positions.southEastArrowNorthMiddleWest( targetRect, balloonRect ) ).toEqual( {
				top: 200 + arrowVOffset,
				left: 187.5 - arrowHOffset,
				name: 'arrow_nmw'
			} );
		} );

		// ------- West

		it( 'should define the "westArrowEast" position', () => {
			expect( positions.westArrowEast( targetRect, balloonRect ) ).toEqual( {
				top: 125,
				left: 50 - arrowVOffset,
				name: 'arrow_e'
			} );
		} );

		// ------- East

		it( 'should define the "eastArrowWest" position', () => {
			expect( positions.eastArrowWest( targetRect, balloonRect ) ).toEqual( {
				top: 125,
				left: 200 + arrowVOffset,
				name: 'arrow_w'
			} );
		} );

		// ------- Sticky

		it( 'should define the "viewportStickyNorth" position and return null if not sticky', () => {
			expect( positions.viewportStickyNorth( targetRect, balloonRect, viewportRect ) ).toBeNull();
		} );
	} );

	describe( 'stickyPositions', () => {
		let positions, balloonRect, targetRect, viewportRect, stickyOffset;

		beforeEach( () => {
			positions = BalloonPanelView.defaultPositions;
			stickyOffset = BalloonPanelView.stickyVerticalOffset;

			balloonRect = new Rect( {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 50,
				height: 50
			} );
		} );

		it( 'should stick position to the top when top position of the element is above the viewport and the element' +
			'area intersects with the viewport area', () => {
			mockBoundingBox( document.body, {
				top: 300,
				bottom: 800,
				left: 0,
				right: 200,
				width: 200,
				height: 500
			} );

			viewportRect = new Rect( {
				top: 300,
				bottom: 800,
				left: 0,
				right: 200,
				width: 200,
				height: 500
			} );

			targetRect = new Rect( {
				top: 400,
				bottom: 800,
				left: 50,
				right: 100,
				width: 50,
				height: 600
			} );

			expect( positions.viewportStickyNorth( targetRect, balloonRect, viewportRect ) ).toEqual( {
				top: 300 + stickyOffset,
				left: 50,
				name: 'arrowless',
				config: {
					withArrow: false
				}
			} );
		} );

		it( 'should stick position to the top when top position of the element is below the viewport and the balloon' +
			'is too tall to place it above the viewport', () => {
			mockBoundingBox( document.body, {
				top: 0,
				bottom: 800,
				left: 0,
				right: 600,
				width: 600,
				height: 800
			} );

			viewportRect = new Rect( {
				top: 0,
				bottom: 800,
				left: 0,
				right: 600,
				width: 600,
				height: 800
			} );

			targetRect = new Rect( {
				top: 10,
				bottom: 900,
				left: 100,
				right: 500,
				width: 400,
				height: 890
			} );

			expect( positions.viewportStickyNorth( targetRect, balloonRect, viewportRect ) ).toEqual( {
				top: stickyOffset,
				left: 275,
				name: 'arrowless',
				config: {
					withArrow: false
				}
			} );
		} );

		it( 'should return null if not sticky because element is fully outside of the viewport', () => {
			viewportRect = new Rect( {
				top: 200,
				bottom: 0,
				left: 0,
				right: 0,
				width: 200,
				height: 200
			} );

			targetRect = new Rect( {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 100,
				height: 100
			} );

			expect( positions.viewportStickyNorth( targetRect, balloonRect, viewportRect ) ).toBeNull();
		} );
	} );

	describe( 'generatePositions()', () => {
		let defaultPositions, balloonRect, targetRect, viewportRect;

		beforeEach( () => {
			defaultPositions = BalloonPanelView.defaultPositions;

			viewportRect = new Rect( {
				top: 300,
				bottom: 800,
				left: 0,
				right: 200,
				width: 0,
				height: 0
			} );

			targetRect = new Rect( {
				top: 200,
				bottom: 400,
				left: 50,
				right: 100,
				width: 0,
				height: 0
			} );

			balloonRect = new Rect( {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 50,
				height: 50
			} );
		} );

		it( 'should generate the same set of positions as BalloonPanelView#defaultPositions when no options specified', () => {
			const generatedPositions = BalloonPanelView.generatePositions();

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );
				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).toEqual( defaultResult );
			}
		} );

		it( 'should respect the "sideOffset" option', () => {
			const generatedPositions = BalloonPanelView.generatePositions( {
				sideOffset: BalloonPanelView.arrowSideOffset + 100
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				if ( name.match( /Arrow(South|North)(.+)?East/ ) ) {
					generatedResult.left -= 100;
				} else if ( name.match( /Arrow(South|North)(.+)?West/ ) ) {
					generatedResult.left += 100;
				}

				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).toEqual( defaultResult );
			}
		} );

		it( 'should respect the "heightOffset" option', () => {
			const generatedPositions = BalloonPanelView.generatePositions( {
				heightOffset: BalloonPanelView.arrowHeightOffset + 100
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				if ( name.startsWith( 'south' ) ) {
					generatedResult.top -= 100;
				}

				if ( name.startsWith( 'north' ) ) {
					generatedResult.top += 100;
				}

				if ( name.startsWith( 'west' ) ) {
					generatedResult.left += 100;
				}

				if ( name.startsWith( 'east' ) ) {
					generatedResult.left -= 100;
				}

				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).toEqual( defaultResult );
			}
		} );

		it( 'should respect the "stickyVerticalOffset" option', () => {
			mockBoundingBox( document.body, {
				top: 300,
				bottom: 800,
				left: 0,
				right: 200,
				width: 200,
				height: 500
			} );

			viewportRect = new Rect( {
				top: 300,
				bottom: 800,
				left: 0,
				right: 200,
				width: 200,
				height: 500
			} );

			targetRect = new Rect( {
				top: 300,
				bottom: 800,
				left: 50,
				right: 100,
				width: 50,
				height: 500
			} );

			const generatedPositions = BalloonPanelView.generatePositions( {
				stickyVerticalOffset: BalloonPanelView.stickyVerticalOffset + 100
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				if ( name.match( /sticky/i ) ) {
					generatedResult.top -= 100;
				}

				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).toEqual( defaultResult );
			}
		} );

		it( 'should respect the "config" option', () => {
			mockBoundingBox( document.body, {
				top: 300,
				bottom: 800,
				left: 0,
				right: 200,
				width: 200,
				height: 500
			} );

			viewportRect = new Rect( {
				top: 300,
				bottom: 800,
				left: 0,
				right: 200,
				width: 200,
				height: 500
			} );

			targetRect = new Rect( {
				top: 300,
				bottom: 800,
				left: 50,
				right: 100,
				width: 50,
				height: 500
			} );

			const generatedPositions = BalloonPanelView.generatePositions( {
				config: {
					foo: 'bar',
					withArrow: true
				}
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult.config ).toEqual( {
					foo: 'bar',
					withArrow: true
				} );
			}
		} );
	} );
} );

function mockBoundingBox( element, data ) {
	const boundingBox = Object.assign( {}, data );

	boundingBox.right = boundingBox.left + boundingBox.width;
	boundingBox.bottom = boundingBox.top + boundingBox.height;

	vi.spyOn( element, 'getBoundingClientRect' ).mockReturnValue( boundingBox );
}
