/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document */
/* bender-tags: ui, balloonPanel, browser-only */

import global from 'ckeditor5-utils/src/dom/global';
import ViewCollection from 'ckeditor5-ui/src/viewcollection';
import BalloonPanelView from 'ckeditor5-ui/src/balloonpanel/balloonpanelview';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import testUtils from 'ckeditor5-core/tests/_utils/utils';
import * as positionUtils from 'ckeditor5-utils/src/dom/position';

testUtils.createSinonSandbox();

describe( 'BalloonPanelView', () => {
	let view, windowStub;

	beforeEach( () => {
		view = new BalloonPanelView();

		view.set( 'maxWidth', 200 );

		windowStub = {
			innerWidth: 1000,
			innerHeight: 1000,
			scrollX: 0,
			scrollY: 0,
			getComputedStyle: ( el ) => {
				return window.getComputedStyle( el );
			}
		};

		testUtils.sinon.stub( global, 'window', windowStub );

		return view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'DIV' );
			expect( view.element.classList.contains( 'ck-balloon-panel' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should set default values', () => {
			expect( view.top ).to.equal( 0 );
			expect( view.left ).to.equal( 0 );
			expect( view.position ).to.equal( 'se' );
			expect( view.isVisible ).to.equal( false );
		} );

		it( 'creates view#content collection', () => {
			expect( view.content ).to.be.instanceOf( ViewCollection );
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'arrow', () => {
			it( 'should react on view#position', () => {
				expect( view.element.classList.contains( 'ck-balloon-panel_arrow_se' ) ).to.true;

				view.position = 'sw';

				expect( view.element.classList.contains( 'ck-balloon-panel_arrow_sw' ) ).to.true;
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

			it( 'should react on view#maxWidth', () => {
				expect( view.element.style.maxWidth ).to.equal( '200px' );

				view.maxWidth = 10;

				expect( view.element.style.maxWidth ).to.equal( '10px' );
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

	describe( 'isVisible', () => {
		it( 'should return view#isVisible value', () => {
			expect( view.isVisible ).to.false;

			view.isVisible = true;

			expect( view.isVisible ).to.true;
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

			// Mock balloon panel element dimensions.
			mockBoundingBox( view.element, {
				top: 0,
				left: 0,
				width: 100,
				height: 100
			} );

			// Make sure that limiter is fully visible in viewport.
			Object.assign( windowStub, {
				innerWidth: 500,
				innerHeight: 500
			} );
		} );

		it( 'should use default options', () => {
			const spy = testUtils.sinon.spy( positionUtils, 'getOptimalPosition' );

			view.attachTo( { target } );

			sinon.assert.calledWithExactly( spy, sinon.match( {
				element: view.element,
				target: target,
				positions: [
					BalloonPanelView.defaultPositions.se,
					BalloonPanelView.defaultPositions.sw,
					BalloonPanelView.defaultPositions.ne,
					BalloonPanelView.defaultPositions.nw
				],
				limiter: document.body,
				fitInViewport: true
			} ) );
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

				expect( view.position ).to.equal( 'se' );
			} );

			it( 'should put balloon on the `south east` side of the target element when target is on the top left side of the limiter', () => {
				mockBoundingBox( target, {
					top: 0,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'se' );
			} );

			it( 'should put balloon on the `south west` side of the target element when target is on the right side of the limiter', () => {
				mockBoundingBox( target, {
					top: 0,
					left: 450,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'sw' );
			} );

			it( 'should put balloon on the `north east` side of the target element when target is on the bottom of the limiter ', () => {
				mockBoundingBox( target, {
					top: 450,
					left: 0,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'ne' );
			} );

			it( 'should put balloon on the `north west` side of the target element when target is on the bottom right of the limiter', () => {
				mockBoundingBox( target, {
					top: 450,
					left: 450,
					width: 50,
					height: 50
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'nw' );
			} );

			// #126
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

				expect( view.top ).to.equal( 15 );
				expect( view.left ).to.equal( -80 );
			} );

			// #126
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

				expect( view.top ).to.equal( 115 );
				expect( view.left ).to.equal( 20 );
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

				Object.assign( windowStub, {
					innerWidth: 275
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'sw' );
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

				expect( view.position ).to.equal( 'se' );
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

				Object.assign( windowStub, {
					innerHeight: 275
				} );

				view.attachTo( { target, limiter } );

				expect( view.position ).to.equal( 'ne' );
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

				expect( view.position ).to.equal( 'se' );
			} );
		} );
	} );
} );

function mockBoundingBox( element, data ) {
	const boundingBox = Object.assign( {}, data );

	boundingBox.right = boundingBox.left + boundingBox.width;
	boundingBox.bottom = boundingBox.top + boundingBox.height;

	testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( boundingBox );
}
