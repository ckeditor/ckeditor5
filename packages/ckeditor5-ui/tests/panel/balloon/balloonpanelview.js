/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, Event */

import ViewCollection from '../../../src/viewcollection';
import BalloonPanelView, { generatePositions } from '../../../src/panel/balloon/balloonpanelview';
import ButtonView from '../../../src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { Rect } from '@ckeditor/ckeditor5-utils';

describe( 'BalloonPanelView', () => {
	let view;

	testUtils.createSinonSandbox();

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
			expect( view.element.tagName ).to.equal( 'DIV' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-balloon-panel' ) ).to.true;
		} );

		it( 'should set default values', () => {
			expect( view.top ).to.equal( 0 );
			expect( view.left ).to.equal( 0 );
			expect( view.position ).to.equal( 'arrow_nw' );
			expect( view.isVisible ).to.equal( false );
			expect( view.withArrow ).to.equal( true );
		} );

		it( 'creates view#content collection', () => {
			expect( view.content ).to.be.instanceOf( ViewCollection );
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'arrow', () => {
			it( 'should react on view#position', () => {
				expect( view.element.classList.contains( 'ck-balloon-panel_arrow_nw' ) ).to.true;

				view.position = 'arrow_ne';

				expect( view.element.classList.contains( 'ck-balloon-panel_arrow_ne' ) ).to.true;
			} );

			it( 'should react on view#withArrow', () => {
				expect( view.element.classList.contains( 'ck-balloon-panel_with-arrow' ) ).to.be.true;

				view.withArrow = false;

				expect( view.element.classList.contains( 'ck-balloon-panel_with-arrow' ) ).to.be.false;
			} );
		} );

		describe( 'isVisible', () => {
			it( 'should react on view#isvisible', () => {
				expect( view.element.classList.contains( 'ck-balloon-panel_visible' ) ).to.false;

				view.isVisible = true;

				expect( view.element.classList.contains( 'ck-balloon-panel_visible' ) ).to.true;
			} );
		} );

		describe( 'styles', () => {
			it( 'should react on view#top', () => {
				expect( view.element.style.top ).to.equal( '0px' );

				view.top = 10;

				expect( view.element.style.top ).to.equal( '10px' );
			} );

			it( 'should react on view#left', () => {
				expect( view.element.style.left ).to.equal( '0px' );

				view.left = 10;

				expect( view.element.style.left ).to.equal( '10px' );
			} );
		} );

		describe( 'class', () => {
			it( 'should set additional class to the view#element', () => {
				view.class = 'foo';

				expect( view.element.classList.contains( 'foo' ) ).to.true;

				view.class = '';

				expect( view.element.classList.contains( 'foo' ) ).to.false;
			} );
		} );

		describe( 'children', () => {
			it( 'should react on view#content', () => {
				expect( view.element.childNodes.length ).to.equal( 0 );

				const button = new ButtonView( { t() {} } );

				view.content.add( button );
				expect( view.element.childNodes.length ).to.equal( 1 );
			} );
		} );
	} );

	describe( 'show()', () => {
		it( 'should set view#isVisible as true', () => {
			view.isVisible = false;

			view.show();

			expect( view.isVisible ).to.true;
		} );
	} );

	describe( 'hide()', () => {
		it( 'should set view#isVisible as false', () => {
			view.isVisible = true;

			view.hide();

			expect( view.isVisible ).to.false;
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
			testUtils.sinon.stub( window, 'innerWidth' ).value( 500 );
			testUtils.sinon.stub( window, 'innerHeight' ).value( 500 );
			testUtils.sinon.stub( window, 'scrollX' ).value( 0 );
			testUtils.sinon.stub( window, 'scrollY' ).value( 0 );
		} );

		afterEach( () => {
			limiter.remove();
			target.remove();
		} );

		it( 'should use default options', () => {
			const spy = testUtils.sinon.spy( BalloonPanelView, '_getOptimalPosition' );

			view.attachTo( { target } );

			sinon.assert.calledWithExactly( spy, sinon.match( {
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
			testUtils.sinon.stub( BalloonPanelView, '_getOptimalPosition' ).returns( {
				top: 10.345,
				left: 10.345,
				name: 'position'
			} );

			view.attachTo( { target, limiter } );

			expect( view.top ).to.equal( 10 );
			expect( view.left ).to.equal( 10 );
		} );

		it( 'should set and override withArrow property', () => {
			testUtils.sinon.stub( BalloonPanelView, '_getOptimalPosition' ).returns( {
				top: 10.345,
				left: 10.345,
				name: 'position'
			} );

			view.withArrow = false;
			view.attachTo( { target, limiter } );

			expect( view.withArrow ).to.be.true;

			view.set( 'withArrow', false );
			view.attachTo( { target, limiter } );

			expect( view.withArrow ).to.be.true;

			BalloonPanelView._getOptimalPosition.restore();

			testUtils.sinon.stub( BalloonPanelView, '_getOptimalPosition' ).returns( {
				top: 10.345,
				left: 10.345,
				name: 'position',
				config: {
					withArrow: false
				}
			} );

			view.attachTo( { target, limiter } );
			expect( view.withArrow ).to.be.false;
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

				expect( view.position ).to.equal( 'arrow_n' );
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

				expect( view.position ).to.equal( 'arrow_nw' );
			} );

			it( 'should put balloon on the `south west` side of the target element when target is on the right side of the limiter', () => {
				mockBoundingBox( target, {
					top: 0,
					left: 450,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'arrow_ne' );
			} );

			it( 'should put balloon on the `north east` side of the target element when target is on the bottom of the limiter ', () => {
				mockBoundingBox( target, {
					top: 450,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'arrow_sw' );
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

				expect( view.position ).to.equal( 'arrow_se' );
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

				expect( view.top ).to.equal( BalloonPanelView.arrowVerticalOffset );
				expect( view.left ).to.equal( -100 );

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

				expect( view.top ).to.equal( BalloonPanelView.arrowVerticalOffset + 100 );
				expect( view.left ).to.equal( 0 );

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
				sinon.stub( window, 'innerWidth' ).value( 275 );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'arrow_ne' );
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

				expect( view.position ).to.equal( 'arrow_nw' );
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
				sinon.stub( window, 'innerHeight' ).value( 275 );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'arrow_sw' );
			} );

			it( 'should put balloon on the `south east` position when `north east` is limited', () => {
				mockBoundingBox( limiter, {
					left: 0,
					top: -400,
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

				expect( view.position ).to.equal( 'arrow_nw' );
			} );
		} );
	} );

	describe( 'pin() and unpin()', () => {
		let attachToSpy, target, targetParent, limiter, notRelatedElement;

		beforeEach( () => {
			attachToSpy = sinon.spy( view, 'attachTo' );
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
				const spy = sinon.spy( view, 'show' );

				view.hide();

				view.pin( { target, limiter } );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should start pinning when the balloon is visible', () => {
				view.pin( { target, limiter } );
				sinon.assert.calledOnce( attachToSpy );

				view.hide();
				targetParent.dispatchEvent( new Event( 'scroll' ) );

				view.show();
				sinon.assert.calledTwice( attachToSpy );

				targetParent.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.calledThrice( attachToSpy );
			} );

			it( 'should stop pinning when the balloon becomes invisible', () => {
				view.show();

				view.pin( { target, limiter } );
				sinon.assert.calledOnce( attachToSpy );

				view.hide();

				targetParent.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.calledOnce( attachToSpy );
			} );

			it( 'should unpin if already pinned', () => {
				const unpinSpy = testUtils.sinon.spy( view, 'unpin' );

				view.show();
				sinon.assert.notCalled( attachToSpy );

				view.pin( { target, limiter } );
				sinon.assert.calledOnce( attachToSpy );

				view.pin( { target, limiter } );
				sinon.assert.calledTwice( unpinSpy );

				targetParent.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.calledThrice( attachToSpy );
			} );

			it( 'should keep the balloon pinned to the target when any of the related elements is scrolled', () => {
				view.pin( { target, limiter } );

				sinon.assert.calledOnce( attachToSpy );
				sinon.assert.calledWith( attachToSpy.lastCall, { target, limiter } );

				targetParent.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( attachToSpy );
				sinon.assert.calledWith( attachToSpy.lastCall, { target, limiter } );

				limiter.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledThrice( attachToSpy );
				sinon.assert.calledWith( attachToSpy.lastCall, { target, limiter } );

				notRelatedElement.dispatchEvent( new Event( 'scroll' ) );

				// Nothing's changed.
				sinon.assert.calledThrice( attachToSpy );
				sinon.assert.calledWith( attachToSpy.lastCall, { target, limiter } );
			} );

			it( 'should keep the balloon pinned to the target when the browser window is being resized', () => {
				view.pin( { target, limiter } );

				sinon.assert.calledOnce( attachToSpy );
				sinon.assert.calledWith( attachToSpy.lastCall, { target, limiter } );

				window.dispatchEvent( new Event( 'resize' ) );

				sinon.assert.calledTwice( attachToSpy );
				sinon.assert.calledWith( attachToSpy.lastCall, { target, limiter } );
			} );

			it( 'should stop attaching when the balloon is hidden', () => {
				view.pin( { target, limiter } );

				sinon.assert.calledOnce( attachToSpy );

				view.hide();

				window.dispatchEvent( new Event( 'resize' ) );
				window.dispatchEvent( new Event( 'scroll' ) );

				// Still once.
				sinon.assert.calledOnce( attachToSpy );
			} );

			it( 'should stop attaching once the view is destroyed', () => {
				view.pin( { target, limiter } );

				sinon.assert.calledOnce( attachToSpy );

				view.destroy();
				view.element.remove();
				view = null;

				window.dispatchEvent( new Event( 'resize' ) );
				window.dispatchEvent( new Event( 'scroll' ) );

				// Still once.
				sinon.assert.calledOnce( attachToSpy );
			} );

			it( 'should set document.body as the default limiter', () => {
				view.pin( { target } );

				sinon.assert.calledOnce( attachToSpy );

				document.body.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( attachToSpy );
			} );

			it( 'should work for Range as a target', () => {
				const element = document.createElement( 'div' );
				const range = document.createRange();

				element.appendChild( document.createTextNode( 'foo bar' ) );
				document.body.appendChild( element );
				range.selectNodeContents( element );

				view.pin( { target: range } );

				sinon.assert.calledOnce( attachToSpy );

				element.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( attachToSpy );

				element.remove();
			} );

			it( 'should work for a Rect as a target', () => {
				// Just check if this normally works without errors.
				const rect = {};

				view.pin( { target: rect, limiter } );

				sinon.assert.calledOnce( attachToSpy );

				limiter.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( attachToSpy );
			} );

			it( 'should work for a function as a target/limiter', () => {
				// Just check if this normally works without errors.
				const rect = {};

				view.pin( {
					target() { return rect; },
					limiter() { return limiter; }
				} );

				sinon.assert.calledOnce( attachToSpy );

				limiter.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( attachToSpy );
			} );

			// https://github.com/ckeditor/ckeditor5-ui/issues/227
			it( 'should react to #scroll from anywhere when the target is not an HTMLElement or Range', () => {
				const rect = {};

				view.pin( { target: rect } );
				sinon.assert.calledOnce( attachToSpy );

				notRelatedElement.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.calledTwice( attachToSpy );
			} );

			// https://github.com/ckeditor/ckeditor5-ui/issues/260
			it( 'should react to #scroll from anywhere when the limiter is not an HTMLElement` or Range', () => {
				const rect = {};

				view.pin( { target, limiter: rect } );
				sinon.assert.calledOnce( attachToSpy );

				notRelatedElement.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.calledTwice( attachToSpy );
			} );
		} );

		describe( 'unpin()', () => {
			it( 'should hide the balloon if pinned', () => {
				const spy = sinon.spy( view, 'hide' );

				view.pin( { target, limiter } );
				view.unpin();

				sinon.assert.calledOnce( spy );
			} );

			it( 'should stop attaching', () => {
				view.pin( { target, limiter } );
				sinon.assert.calledOnce( attachToSpy );

				view.unpin();

				view.hide();
				window.dispatchEvent( new Event( 'resize' ) );
				document.dispatchEvent( new Event( 'scroll' ) );
				view.show();
				window.dispatchEvent( new Event( 'resize' ) );
				document.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledOnce( attachToSpy );
			} );
		} );
	} );

	describe( 'defaultPositions', () => {
		let positions, balloonRect, targetRect, viewportRect, arrowHOffset, arrowVOffset;

		beforeEach( () => {
			positions = BalloonPanelView.defaultPositions;
			arrowHOffset = BalloonPanelView.arrowHorizontalOffset;
			arrowVOffset = BalloonPanelView.arrowVerticalOffset;

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
			expect( Object.keys( positions ) ).to.have.length( 31 );
		} );

		// ------- North

		it( 'should define the "northArrowSouth" position', () => {
			expect( positions.northArrowSouth( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 125,
				name: 'arrow_s'
			} );
		} );

		it( 'should define the "northArrowSouthEast" position', () => {
			expect( positions.northArrowSouthEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 100 + arrowHOffset,
				name: 'arrow_se'
			} );
		} );

		it( 'should define the "northArrowSouthMiddleEast" position', () => {
			expect( positions.northArrowSouthMiddleEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 112.5 + arrowHOffset,
				name: 'arrow_sme'
			} );
		} );

		it( 'should define the "northArrowSouthWest" position', () => {
			expect( positions.northArrowSouthWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 150 - arrowHOffset,
				name: 'arrow_sw'
			} );
		} );

		it( 'should define the "northArrowSouthMiddleWest" position', () => {
			expect( positions.northArrowSouthMiddleWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 137.5 - arrowHOffset,
				name: 'arrow_smw'
			} );
		} );

		// ------- North west

		it( 'should define the "northWestArrowSouth" position', () => {
			expect( positions.northWestArrowSouth( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 75,
				name: 'arrow_s'
			} );
		} );

		it( 'should define the "northWestArrowSouthWest" position', () => {
			expect( positions.northWestArrowSouthWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 100 - arrowHOffset,
				name: 'arrow_sw'
			} );
		} );

		it( 'should define the "northWestArrowSouthMiddleWest" position', () => {
			expect( positions.northWestArrowSouthMiddleWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 87.5 - arrowHOffset,
				name: 'arrow_smw'
			} );
		} );

		it( 'should define the "northWestArrowSouthEast" position', () => {
			expect( positions.northWestArrowSouthEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 50 + arrowHOffset,
				name: 'arrow_se'
			} );
		} );

		it( 'should define the "northWestArrowSouthMiddleEast" position', () => {
			expect( positions.northWestArrowSouthMiddleEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 62.5 + arrowHOffset,
				name: 'arrow_sme'
			} );
		} );

		// ------- North east

		it( 'should define the "northEastArrowSouth" position', () => {
			expect( positions.northEastArrowSouth( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 175,
				name: 'arrow_s'
			} );
		} );

		it( 'should define the "northEastArrowSouthEast" position', () => {
			expect( positions.northEastArrowSouthEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 150 + arrowHOffset,
				name: 'arrow_se'
			} );
		} );

		it( 'should define the "northEastArrowSouthMiddleEast" position', () => {
			expect( positions.northEastArrowSouthMiddleEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 162.5 + arrowHOffset,
				name: 'arrow_sme'
			} );
		} );

		it( 'should define the "northEastArrowSouthWest" position', () => {
			expect( positions.northEastArrowSouthWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 200 - arrowHOffset,
				name: 'arrow_sw'
			} );
		} );

		it( 'should define the "northEastArrowSouthMiddleWest" position', () => {
			expect( positions.northEastArrowSouthMiddleWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 50 - arrowVOffset,
				left: 187.5 - arrowHOffset,
				name: 'arrow_smw'
			} );
		} );

		// ------- South

		it( 'should define the "southArrowNorth" position', () => {
			expect( positions.southArrowNorth( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 125,
				name: 'arrow_n'
			} );
		} );

		it( 'should define the "southArrowNorthEast" position', () => {
			expect( positions.southArrowNorthEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 100 + arrowHOffset,
				name: 'arrow_ne'
			} );
		} );

		it( 'should define the "southArrowNorthMiddleEast" position', () => {
			expect( positions.southArrowNorthMiddleEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 112.5 + arrowHOffset,
				name: 'arrow_nme'
			} );
		} );

		it( 'should define the "southArrowNorthWest" position', () => {
			expect( positions.southArrowNorthWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 150 - arrowHOffset,
				name: 'arrow_nw'
			} );
		} );

		it( 'should define the "southArrowNorthMiddleWest" position', () => {
			expect( positions.southArrowNorthMiddleWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 137.5 - arrowHOffset,
				name: 'arrow_nmw'
			} );
		} );

		// ------- South west

		it( 'should define the "southWestArrowNorth" position', () => {
			expect( positions.southWestArrowNorth( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 75,
				name: 'arrow_n'
			} );
		} );

		it( 'should define the "southWestArrowNorthWest" position', () => {
			expect( positions.southWestArrowNorthWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 100 - arrowHOffset,
				name: 'arrow_nw'
			} );
		} );

		it( 'should define the "southWestArrowNorthMiddleWest" position', () => {
			expect( positions.southWestArrowNorthMiddleWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 87.5 - arrowHOffset,
				name: 'arrow_nmw'
			} );
		} );

		it( 'should define the "southWestArrowNorthEast" position', () => {
			expect( positions.southWestArrowNorthEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 50 + arrowHOffset,
				name: 'arrow_ne'
			} );
		} );

		it( 'should define the "southWestArrowNorthMiddleEast" position', () => {
			expect( positions.southWestArrowNorthMiddleEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 62.5 + arrowHOffset,
				name: 'arrow_nme'
			} );
		} );

		// ------- South east

		it( 'should define the "southEastArrowNorth" position', () => {
			expect( positions.southEastArrowNorth( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 175,
				name: 'arrow_n'
			} );
		} );

		it( 'should define the "southEastArrowNorthEast" position', () => {
			expect( positions.southEastArrowNorthEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 150 + arrowHOffset,
				name: 'arrow_ne'
			} );
		} );

		it( 'should define the "southEastArrowNorthMiddleEast" position', () => {
			expect( positions.southEastArrowNorthMiddleEast( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 162.5 + arrowHOffset,
				name: 'arrow_nme'
			} );
		} );

		it( 'should define the "southEastArrowNorthWest" position', () => {
			expect( positions.southEastArrowNorthWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 200 - arrowHOffset,
				name: 'arrow_nw'
			} );
		} );

		it( 'should define the "southEastArrowNorthMiddleWest" position', () => {
			expect( positions.southEastArrowNorthMiddleWest( targetRect, balloonRect ) ).to.deep.equal( {
				top: 200 + arrowVOffset,
				left: 187.5 - arrowHOffset,
				name: 'arrow_nmw'
			} );
		} );

		// ------- Sticky

		it( 'should define the "viewportStickyNorth" position and return null if not sticky', () => {
			expect( positions.viewportStickyNorth( targetRect, balloonRect, viewportRect ) ).to.equal( null );
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

			expect( positions.viewportStickyNorth( targetRect, balloonRect, viewportRect ) ).to.deep.equal( {
				top: 300 + stickyOffset,
				left: 25,
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

			expect( positions.viewportStickyNorth( targetRect, balloonRect, viewportRect ) ).to.equal( null );
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
			const generatedPositions = generatePositions();

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );
				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).to.deep.equal( defaultResult, name );
			}
		} );

		it( 'should respect the "horizontalOffset" option', () => {
			const generatedPositions = generatePositions( {
				horizontalOffset: BalloonPanelView.arrowHorizontalOffset + 100
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				if ( name.match( /Arrow(South|North)(.+)?East/ ) ) {
					generatedResult.left -= 100;
				} else if ( name.match( /Arrow(South|North)(.+)?West/ ) ) {
					generatedResult.left += 100;
				}

				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).to.deep.equal( defaultResult, name );
			}
		} );

		it( 'should respect the "verticalOffset" option', () => {
			const generatedPositions = generatePositions( {
				verticalOffset: BalloonPanelView.arrowVerticalOffset + 100
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				if ( name.match( /^south/ ) ) {
					generatedResult.top -= 100;
				} else if ( name.match( /^north/ ) ) {
					generatedResult.top += 100;
				}

				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).to.deep.equal( defaultResult, name );
			}
		} );

		it( 'should respect the "stickyVerticalOffset" option', () => {
			const generatedPositions = generatePositions( {
				stickyVerticalOffset: BalloonPanelView.stickyVerticalOffset + 100
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				if ( name.match( /sticky/i ) ) {
					generatedResult.top -= 100;
				}

				const defaultResult = defaultPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult ).to.deep.equal( defaultResult, name );
			}
		} );

		it( 'should respect the "config" option', () => {
			const generatedPositions = generatePositions( {
				config: {
					foo: 'bar',
					withArrow: true
				}
			} );

			for ( const name in generatedPositions ) {
				const generatedResult = generatedPositions[ name ]( targetRect, balloonRect, viewportRect );

				expect( generatedResult.config ).to.deep.equal( {
					foo: 'bar',
					withArrow: true
				}, name );
			}
		} );
	} );
} );

function mockBoundingBox( element, data ) {
	const boundingBox = Object.assign( {}, data );

	boundingBox.right = boundingBox.left + boundingBox.width;
	boundingBox.bottom = boundingBox.top + boundingBox.height;

	testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( boundingBox );
}
