/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, console */

import Rect from '../../src/dom/rect';

describe( 'Rect', () => {
	let geometry;

	beforeEach( () => {
		geometry = {
			top: 10,
			right: 40,
			bottom: 30,
			left: 20,
			width: 20,
			height: 20
		};

		sinon.stub( console, 'warn' );
	} );

	afterEach( () => {
		sinon.restore();
	} );

	describe( 'constructor()', () => {
		it( 'should store passed object in #_source property', () => {
			const obj = {};
			const rect = new Rect( obj );

			expect( rect._source ).to.equal( obj );
		} );

		it( 'should accept HTMLElement', () => {
			const element = document.createElement( 'div' );

			sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			assertRect( new Rect( element ), geometry );
		} );

		it( 'should accept Range (non–collapsed)', () => {
			const range = document.createRange();

			range.selectNode( document.body );
			sinon.stub( range, 'getClientRects' ).returns( [ geometry ] );

			assertRect( new Rect( range ), geometry );
		} );

		it( 'should accept Range (non–collapsed, sequenced horizontally)', () => {
			const firstGeometry = geometry;
			const secondGeometry = Object.assign( {}, geometry, {
				right: 50,
				left: 40,
				width: 10
			} );

			const range = document.createRange();
			range.selectNode( document.body );
			sinon.stub( range, 'getClientRects' ).returns( [ firstGeometry, secondGeometry ] );

			const expectedGeometry = Object.assign( {}, geometry, {
				width: 30,
				right: 50
			} );

			assertRect( new Rect( range ), expectedGeometry );
		} );

		it( 'should accept Range (non–collapsed, sequenced vertically)', () => {
			const firstGeometry = geometry;
			const secondGeometry = Object.assign( {}, geometry, {
				top: 30,
				bottom: 40
			} );

			const range = document.createRange();
			range.selectNode( document.body );
			sinon.stub( range, 'getClientRects' ).returns( [ firstGeometry, secondGeometry ] );

			const expectedGeometry = Object.assign( {}, geometry, {
				height: 30,
				bottom: 40
			} );

			assertRect( new Rect( range ), expectedGeometry );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		it( 'should accept Range (collapsed)', () => {
			const range = document.createRange();

			range.collapse();
			sinon.stub( range, 'getClientRects' ).returns( [ geometry ] );

			assertRect( new Rect( range ), geometry );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		it( 'should accept Range (collapsed, no Range rects available)', () => {
			const range = document.createRange();
			const element = document.createElement( 'div' );

			range.setStart( element, 0 );
			range.collapse();
			sinon.stub( range, 'getClientRects' ).returns( [] );
			sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			const expectedGeometry = Object.assign( {}, geometry );
			expectedGeometry.right = expectedGeometry.left;
			expectedGeometry.width = 0;

			assertRect( new Rect( range ), expectedGeometry );
		} );

		it( 'should accept the window (viewport)', () => {
			sinon.stub( window, 'innerWidth' ).value( 1000 );
			sinon.stub( window, 'innerHeight' ).value( 500 );
			sinon.stub( window, 'scrollX' ).value( 100 );
			sinon.stub( window, 'scrollY' ).value( 200 );

			assertRect( new Rect( window ), {
				top: 0,
				right: 1000,
				bottom: 500,
				left: 0,
				width: 1000,
				height: 500
			} );
		} );

		it( 'should accept Rect', () => {
			const sourceRect = new Rect( geometry );
			const rect = new Rect( sourceRect );

			expect( rect ).to.not.equal( sourceRect );
			assertRect( rect, geometry );
		} );

		it( 'should accept ClientRect', () => {
			const clientRect = document.body.getBoundingClientRect();
			const { top, right, bottom, left, width, height } = clientRect;
			const rect = new Rect( clientRect );

			assertRect( rect, { top, right, bottom, left, width, height } );
		} );

		it( 'should accept geometry object', () => {
			assertRect( new Rect( geometry ), geometry );
		} );

		it( 'should accept objects from another window\'s scope', done => {
			const iframe = document.createElement( 'iframe' );

			iframe.addEventListener( 'load', () => {
				const iframeWindow = iframe.contentWindow;
				const element = iframeWindow.document.createElement( 'p' );
				const range = document.createRange();
				range.selectNode( iframeWindow.document.body );

				sinon.stub( range, 'getClientRects' ).returns( [ geometry ] );
				assertRect( new Rect( range ), geometry );

				sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );
				assertRect( new Rect( element ), geometry );

				iframe.remove();
				done();
			} );

			document.body.appendChild( iframe );
		} );

		it( 'should copy the properties (Rect)', () => {
			const sourceGeometry = Object.assign( {}, geometry );
			const sourceRect = new Rect( geometry );
			const rect = new Rect( sourceRect );

			assertRect( rect, geometry );

			rect.top = 100;
			rect.width = 200;

			assertRect( sourceRect, sourceGeometry );
		} );

		it( 'should copy the properties (geomerty object)', () => {
			const sourceGeometry = Object.assign( {}, geometry );
			const rect = new Rect( geometry );

			assertRect( rect, geometry );

			rect.top = 100;
			rect.width = 200;

			assertRect( geometry, sourceGeometry );
		} );
	} );

	describe( 'clone()', () => {
		it( 'should clone the source rect', () => {
			const rect = new Rect( geometry );
			const clone = rect.clone();

			expect( clone ).to.be.instanceOf( Rect );
			expect( clone ).not.equal( rect );
			assertRect( clone, rect );
		} );

		it( 'should preserve #_source', () => {
			const rect = new Rect( geometry );
			const clone = rect.clone();

			expect( clone._source ).to.equal( rect._source );
			assertRect( clone, rect );
		} );
	} );

	describe( 'moveTo()', () => {
		it( 'should return the source rect', () => {
			const rect = new Rect( geometry );
			const returned = rect.moveTo( 100, 200 );

			expect( returned ).to.equal( rect );
		} );

		it( 'should move the rect', () => {
			const rect = new Rect( geometry );

			rect.moveTo( 100, 200 );

			assertRect( rect, {
				top: 200,
				right: 120,
				bottom: 220,
				left: 100,
				width: 20,
				height: 20
			} );
		} );
	} );

	describe( 'moveBy()', () => {
		it( 'should return the source rect', () => {
			const rect = new Rect( geometry );
			const returned = rect.moveBy( 100, 200 );

			expect( returned ).to.equal( rect );
		} );

		it( 'should move the rect', () => {
			const rect = new Rect( geometry );

			rect.moveBy( 100, 200 );

			assertRect( rect, {
				top: 210,
				right: 140,
				bottom: 230,
				left: 120,
				width: 20,
				height: 20
			} );
		} );
	} );

	describe( 'getIntersection()', () => {
		it( 'should return a new rect', () => {
			const rect = new Rect( geometry );
			const insersect = rect.getIntersection( new Rect( geometry ) );

			expect( insersect ).to.be.instanceOf( Rect );
			expect( insersect ).to.not.equal( rect );
		} );

		it( 'should calculate the geometry (#1)', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 50,
				right: 150,
				bottom: 150,
				left: 50,
				width: 100,
				height: 100
			} );

			const insersect = rectA.getIntersection( rectB );

			assertRect( insersect, {
				top: 50,
				right: 100,
				bottom: 100,
				left: 50,
				width: 50,
				height: 50
			} );
		} );

		it( 'should calculate the geometry (#2)', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 0,
				right: 200,
				bottom: 100,
				left: 100,
				width: 100,
				height: 100
			} );

			const insersect = rectA.getIntersection( rectB );

			assertRect( insersect, {
				top: 0,
				right: 100,
				bottom: 100,
				left: 100,
				width: 0,
				height: 100
			} );
		} );

		it( 'should calculate the geometry (#3)', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 100,
				right: 300,
				bottom: 200,
				left: 200,
				width: 100,
				height: 100
			} );

			expect( rectA.getIntersection( rectB ) ).to.be.null;
		} );
	} );

	describe( 'getIntersectionArea()', () => {
		it( 'should calculate the area (#1)', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 50,
				right: 150,
				bottom: 150,
				left: 50,
				width: 100,
				height: 100
			} );

			expect( rectA.getIntersectionArea( rectB ) ).to.equal( 2500 );
		} );

		it( 'should calculate the area (#2)', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 0,
				right: 200,
				bottom: 100,
				left: 100,
				width: 100,
				height: 100
			} );

			expect( rectA.getIntersectionArea( rectB ) ).to.equal( 0 );
		} );

		it( 'should calculate the area (#3)', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 100,
				right: 300,
				bottom: 200,
				left: 200,
				width: 100,
				height: 100
			} );

			expect( rectA.getIntersectionArea( rectB ) ).to.equal( 0 );
		} );
	} );

	describe( 'getArea()', () => {
		it( 'should calculate the area', () => {
			const rect = new Rect( {
				width: 100,
				height: 50
			} );

			expect( rect.getArea() ).to.equal( 5000 );
		} );
	} );

	describe( 'getVisible()', () => {
		let element, range, ancestorA, ancestorB;

		beforeEach( () => {
			element = document.createElement( 'div' );
			range = document.createRange();
			ancestorA = document.createElement( 'div' );
			ancestorB = document.createElement( 'div' );

			ancestorA.appendChild( element );
			document.body.appendChild( ancestorA );
		} );

		afterEach( () => {
			ancestorA.remove();
			ancestorB.remove();
		} );

		it( 'should return a new rect', () => {
			const rect = new Rect( element );
			const visible = rect.getVisible();

			expect( visible ).to.not.equal( rect );
		} );

		it( 'should not fail when the rect is for document#body', () => {
			sinon.stub( document.body, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			assertRect( new Rect( document.body ).getVisible(), {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );
		} );

		it( 'should not fail when the rect is for an object in another window\'s scope', done => {
			const iframe = document.createElement( 'iframe' );

			iframe.addEventListener( 'load', () => {
				const iframeWindow = iframe.contentWindow;
				const element = iframeWindow.document.createElement( 'p' );
				const ancestor = iframeWindow.document.createElement( 'p' );

				ancestor.appendChild( element );
				iframeWindow.document.body.appendChild( ancestor );

				sinon.stub( ancestor, 'getBoundingClientRect' ).returns( {
					top: 0,
					right: 50,
					bottom: 50,
					left: 0,
					width: 50,
					height: 50
				} );

				sinon.stub( element, 'getBoundingClientRect' ).returns( {
					top: 0,
					right: 100,
					bottom: 100,
					left: 0,
					width: 100,
					height: 100
				} );

				assertRect( new Rect( element ).getVisible(), {
					top: 0,
					right: 50,
					bottom: 50,
					left: 0,
					width: 50,
					height: 50
				} );

				iframe.remove();
				done();
			} );

			document.body.appendChild( iframe );
		} );

		it( 'should return the visible rect (HTMLElement), partially cropped', () => {
			sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
				top: 50,
				right: 150,
				bottom: 150,
				left: 50,
				width: 100,
				height: 100
			} );

			assertRect( new Rect( element ).getVisible(), {
				top: 50,
				right: 100,
				bottom: 100,
				left: 50,
				width: 50,
				height: 50
			} );
		} );

		it( 'should return the visible rect (HTMLElement), fully visible', () => {
			sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 150,
				bottom: 150,
				left: 0,
				width: 150,
				height: 150
			} );

			assertRect( new Rect( element ).getVisible(), {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );
		} );

		it( 'should return the visible rect (HTMLElement), partially cropped, deep ancestor overflow', () => {
			ancestorB.appendChild( ancestorA );
			document.body.appendChild( ancestorB );

			sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
				top: 50,
				right: 100,
				bottom: 100,
				left: 0,
				width: 50,
				height: 50
			} );

			sinon.stub( ancestorB, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 150,
				bottom: 100,
				left: 50,
				width: 100,
				height: 100
			} );

			assertRect( new Rect( element ).getVisible(), {
				top: 50,
				right: 100,
				bottom: 100,
				left: 50,
				width: 50,
				height: 50
			} );
		} );

		it( 'should return the visible rect (Range), partially cropped', () => {
			range.setStart( ancestorA, 0 );
			range.setEnd( ancestorA, 1 );

			sinon.stub( range, 'getClientRects' ).returns( [ {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} ] );

			sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
				top: 50,
				right: 150,
				bottom: 150,
				left: 50,
				width: 100,
				height: 100
			} );

			assertRect( new Rect( range ).getVisible(), {
				top: 50,
				right: 100,
				bottom: 100,
				left: 50,
				width: 50,
				height: 50
			} );
		} );

		it( 'should return null if there\'s no visible rect', () => {
			sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
				top: 150,
				right: 200,
				bottom: 200,
				left: 150,
				width: 50,
				height: 50
			} );

			expect( new Rect( element ).getVisible() ).to.equal( null );
		} );
	} );

	describe( 'isEqual()', () => {
		it( 'returns `true` when rects are equal', () => {
			const rectA = new Rect( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40,
				width: 10,
				height: 20
			} );

			const rectB = new Rect( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40,
				width: 10,
				height: 20
			} );

			expect( rectA.isEqual( rectB ) ).to.be.true;
			expect( rectB.isEqual( rectA ) ).to.be.true;
			expect( rectA.isEqual( rectA ) ).to.be.true;
		} );

		it( 'returns `false` when rects are different', () => {
			const rectA = new Rect( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40,
				width: 10,
				height: 20
			} );

			const rectB = new Rect( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40,
				width: 10,
				height: 30 // !
			} );

			expect( rectA.isEqual( rectB ) ).to.be.false;
			expect( rectB.isEqual( rectA ) ).to.be.false;
		} );
	} );

	describe( 'contains()', () => {
		it( 'should return true if rects are the same', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			expect( rectA.isEqual( rectB ) ).to.be.true;
			expect( rectA.contains( rectB ) ).to.be.true;
			expect( rectB.contains( rectA ) ).to.be.true;
		} );

		it( 'should return true if rect is within', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 10,
				right: 90,
				bottom: 90,
				left: 10,
				width: 80,
				height: 80
			} );

			expect( rectA.contains( rectB ) ).to.be.true;
			expect( rectB.contains( rectA ) ).to.be.false;
		} );

		it( 'should return false if rect extends beyond the boundaries', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 10,
				right: 100,
				bottom: 110,
				left: 0,
				width: 100,
				height: 100
			} );

			expect( rectA.contains( rectB ) ).to.be.false;
			expect( rectB.contains( rectA ) ).to.be.false;
		} );

		it( 'should return false if rect is completely beyond the boundaries', () => {
			const rectA = new Rect( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const rectB = new Rect( {
				top: 110,
				right: 100,
				bottom: 210,
				left: 0,
				width: 100,
				height: 100
			} );

			expect( rectA.contains( rectB ) ).to.be.false;
			expect( rectB.contains( rectA ) ).to.be.false;
		} );
	} );

	describe( 'excludeScrollbarsAndBorders()', () => {
		it( 'should exclude scrollbars and borders of a HTMLElement (dir="ltr")', () => {
			const element = document.createElement( 'div' );

			sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );
			sinon.stub( window, 'getComputedStyle' )
				.withArgs( element )
				.returns( {
					borderTopWidth: '5px',
					borderRightWidth: '10px',
					borderLeftWidth: '5px',
					borderBottomWidth: '10px',
					direction: 'ltr'
				} );

			// Simulate 5px scrollbars.
			Object.defineProperties( element, {
				offsetWidth: {
					value: 20
				},
				offsetHeight: {
					value: 20
				},
				clientWidth: {
					value: 0
				},
				clientHeight: {
					value: 0
				}
			} );

			assertRect( new Rect( element ).excludeScrollbarsAndBorders(), {
				top: 15,
				right: 25,
				bottom: 15,
				left: 25,
				width: 0,
				height: 0
			} );
		} );

		it( 'should exclude scrollbars and borders of a HTMLElement (dir="rtl")', () => {
			const element = document.createElement( 'div' );

			element.setAttribute( 'dir', 'rtl' );
			sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );
			sinon.stub( window, 'getComputedStyle' )
				.withArgs( element )
				.returns( {
					borderTopWidth: '5px',
					borderRightWidth: '10px',
					borderLeftWidth: '5px',
					borderBottomWidth: '10px',
					direction: 'rtl'
				} );

			// Simulate 5px scrollbars.
			Object.defineProperties( element, {
				offsetWidth: {
					value: 20
				},
				offsetHeight: {
					value: 20
				},
				clientWidth: {
					value: 0
				},
				clientHeight: {
					value: 0
				}
			} );

			assertRect( new Rect( element ).excludeScrollbarsAndBorders(), {
				top: 15,
				right: 30,
				bottom: 15,
				left: 30,
				width: 0,
				height: 0
			} );
		} );

		it( 'should exclude scrollbars from viewport\'s rect (dir="ltr")', () => {
			sinon.stub( window, 'innerWidth' ).value( 1000 );
			sinon.stub( window, 'innerHeight' ).value( 500 );
			sinon.stub( window, 'scrollX' ).value( 100 );
			sinon.stub( window, 'scrollY' ).value( 200 );

			sinon.stub( document, 'documentElement' ).value( {
				clientWidth: 990,
				clientHeight: 490
			} );

			sinon.stub( window, 'getComputedStyle' )
				.withArgs( document.documentElement )
				.returns( {
					direction: 'ltr'
				} );

			assertRect( new Rect( window ).excludeScrollbarsAndBorders(), {
				top: 0,
				right: 990,
				bottom: 490,
				left: 0,
				width: 990,
				height: 490
			} );
		} );

		it( 'should exclude scrollbars from viewport\'s rect (dir="rtl")', () => {
			sinon.stub( window, 'innerWidth' ).value( 1000 );
			sinon.stub( window, 'innerHeight' ).value( 500 );
			sinon.stub( window, 'scrollX' ).value( 100 );
			sinon.stub( window, 'scrollY' ).value( 200 );

			sinon.stub( document, 'documentElement' ).value( {
				clientWidth: 990,
				clientHeight: 490
			} );

			sinon.stub( window, 'getComputedStyle' )
				.withArgs( document.documentElement )
				.returns( {
					direction: 'rtl'
				} );

			assertRect( new Rect( window ).excludeScrollbarsAndBorders(), {
				top: 0,
				right: 1000,
				bottom: 490,
				left: 10,
				width: 990,
				height: 490
			} );
		} );

		it( 'should work for a window in an iframe', done => {
			const iframe = document.createElement( 'iframe' );

			// Mock the properties of the top window. Then make sure the ones
			// from the child are used.
			sinon.stub( window, 'innerWidth' ).value( 1000 );
			sinon.stub( window, 'innerHeight' ).value( 500 );
			sinon.stub( window, 'scrollX' ).value( 100 );
			sinon.stub( window, 'scrollY' ).value( 200 );
			sinon.stub( document, 'documentElement' ).value( {
				clientWidth: 990,
				clientHeight: 490
			} );

			sinon.stub( window, 'getComputedStyle' )
				.withArgs( document.documentElement )
				.returns( {
					direction: 'ltr'
				} );

			iframe.addEventListener( 'load', () => {
				const iframeWindow = iframe.contentWindow;

				sinon.stub( iframeWindow, 'innerWidth' ).value( 500 );
				sinon.stub( iframeWindow, 'innerHeight' ).value( 250 );
				sinon.stub( iframeWindow, 'scrollX' ).value( 50 );
				sinon.stub( iframeWindow, 'scrollY' ).value( 100 );

				sinon.stub( iframeWindow.document, 'documentElement' ).value( {
					clientWidth: 480,
					clientHeight: 230
				} );

				sinon.stub( iframeWindow, 'getComputedStyle' )
					.withArgs( iframeWindow.document.documentElement )
					.returns( {
						direction: 'ltr'
					} );

				assertRect( new Rect( iframeWindow ).excludeScrollbarsAndBorders(), {
					top: 0,
					right: 480,
					bottom: 230,
					left: 0,
					width: 480,
					height: 230
				} );

				// Safari fails because of "afterEach()" hook tries to restore values from removed element.
				// We need to restore these values manually.
				sinon.restore();
				iframe.remove();
				done();
			} );

			document.body.appendChild( iframe );
		} );
	} );

	describe( 'getDomRangeRects() ', () => {
		it( 'should return rects for a Range (non–collapsed)', () => {
			const range = document.createRange();

			range.selectNode( document.body );
			sinon.stub( range, 'getClientRects' ).returns( [ geometry ] );

			const rects = Rect.getDomRangeRects( range );
			expect( rects ).to.have.length( 1 );
			assertRect( rects[ 0 ], geometry );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		it( 'should return rects for a Range (collapsed)', () => {
			const range = document.createRange();
			const secondGeometry = { top: 20, right: 80, bottom: 60, left: 40, width: 40, height: 40 };

			range.collapse();
			sinon.stub( range, 'getClientRects' ).returns( [ geometry, secondGeometry ] );

			const rects = Rect.getDomRangeRects( range );
			expect( rects ).to.have.length( 2 );

			assertRect( rects[ 0 ], geometry );
			assertRect( rects[ 1 ], secondGeometry );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		it( 'should return rects for a Range (collapsed, no Range rects available)', () => {
			const range = document.createRange();
			const element = document.createElement( 'div' );

			range.setStart( element, 0 );
			range.collapse();
			sinon.stub( range, 'getClientRects' ).returns( [] );
			sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			const expectedGeometry = Object.assign( {}, geometry );
			expectedGeometry.right = expectedGeometry.left;
			expectedGeometry.width = 0;

			const rects = Rect.getDomRangeRects( range );
			expect( rects ).to.have.length( 1 );
			assertRect( rects[ 0 ], expectedGeometry );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/317
		it( 'should return rects for a text node\'s parent (collapsed, no Range rects available)', () => {
			const range = document.createRange();
			const element = document.createElement( 'div' );
			const textNode = document.createTextNode( 'abc' );
			element.appendChild( textNode );

			range.setStart( textNode, 3 );
			range.collapse();
			sinon.stub( range, 'getClientRects' ).returns( [] );
			sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			const expectedGeometry = Object.assign( {}, geometry );
			expectedGeometry.right = expectedGeometry.left;
			expectedGeometry.width = 0;

			const rects = Rect.getDomRangeRects( range );
			expect( rects ).to.have.length( 1 );
			assertRect( rects[ 0 ], expectedGeometry );
		} );
	} );

	describe( 'getBoundingRect()', () => {
		it( 'should not return a rect instance when no rectangles were given', () => {
			expect( Rect.getBoundingRect( [] ) ).to.be.null;
		} );

		it( 'should calculate proper rectangle when multiple rectangles were given', () => {
			const rects = [
				new Rect( geometry ),
				new Rect( {
					top: 10,
					right: 100,
					bottom: 20,
					left: 80,
					width: 20,
					height: 10
				} ),
				new Rect( {
					top: 50,
					right: 50,
					bottom: 60,
					left: 30,
					width: 20,
					height: 10
				} )
			];

			assertRect( Rect.getBoundingRect( rects ), {
				top: 10,
				right: 100,
				bottom: 60,
				left: 20,
				width: 80,
				height: 50
			} );
		} );

		it( 'should calculate proper rectangle when a single rectangles was given', () => {
			const rectangles = new Set( [ new Rect( geometry ) ] );
			assertRect( Rect.getBoundingRect( rectangles ), geometry );
		} );

		it( 'should return proper type', () => {
			const rectangles = new Set( [ new Rect( geometry ) ] );
			expect( Rect.getBoundingRect( rectangles ) ).to.be.instanceOf( Rect );
		} );
	} );
} );

function assertRect( rect, expected ) {
	expect( rect ).to.deep.equal( expected );
}
