/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import global from '../../src/dom/global';
import Rect from '../../src/dom/rect';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

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
	} );

	describe( 'constructor()', () => {
		it( 'should store passed object in #_source property', () => {
			const obj = {};
			const rect = new Rect( obj );

			expect( rect._source ).to.equal( obj );
		} );

		it( 'should accept HTMLElement', () => {
			const element = document.createElement( 'div' );

			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			assertRect( new Rect( element ), geometry );
		} );

		it( 'should accept Range (non–collapsed)', () => {
			const range = document.createRange();

			range.selectNode( document.body );
			testUtils.sinon.stub( range, 'getClientRects' ).returns( [ geometry ] );

			assertRect( new Rect( range ), geometry );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		it( 'should accept Range (collapsed)', () => {
			const range = document.createRange();

			range.collapse();
			testUtils.sinon.stub( range, 'getClientRects' ).returns( [ geometry ] );

			assertRect( new Rect( range ), geometry );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		it( 'should accept Range (collapsed, no Range rects available)', () => {
			const range = document.createRange();
			const element = document.createElement( 'div' );

			range.setStart( element, 0 );
			range.collapse();
			testUtils.sinon.stub( range, 'getClientRects' ).returns( [] );
			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			const expectedGeometry = Object.assign( {}, geometry );
			expectedGeometry.right = expectedGeometry.left;
			expectedGeometry.width = 0;

			assertRect( new Rect( range ), expectedGeometry );
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

			ancestorA.append( element );
			document.body.appendChild( ancestorA );
		} );

		afterEach( () => {
			ancestorA.remove();
			ancestorB.remove();
		} );

		it( 'should return a new rect', () => {
			const rect = new Rect( {} );
			const visible = rect.getVisible();

			expect( visible ).to.not.equal( rect );
		} );

		it( 'should not fail when the rect is for document#body', () => {
			testUtils.sinon.stub( document.body, 'getBoundingClientRect' ).returns( {
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

		it( 'should return the visible rect (HTMLElement), partially cropped', () => {
			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			testUtils.sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
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
			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			testUtils.sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
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
			ancestorB.append( ancestorA );
			document.body.appendChild( ancestorB );

			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			testUtils.sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
				top: 50,
				right: 100,
				bottom: 100,
				left: 0,
				width: 50,
				height: 50
			} );

			testUtils.sinon.stub( ancestorB, 'getBoundingClientRect' ).returns( {
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

			testUtils.sinon.stub( range, 'getClientRects' ).returns( [ {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} ] );

			testUtils.sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
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
			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			testUtils.sinon.stub( ancestorA, 'getBoundingClientRect' ).returns( {
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

	describe( 'getViewportRect()', () => {
		it( 'should reaturn a rect', () => {
			expect( Rect.getViewportRect() ).to.be.instanceOf( Rect );
		} );

		it( 'should return the viewport\'s rect', () => {
			testUtils.sinon.stub( global, 'window', {
				innerWidth: 1000,
				innerHeight: 500,
				scrollX: 100,
				scrollY: 200
			} );

			assertRect( Rect.getViewportRect(), {
				top: 0,
				right: 1000,
				bottom: 500,
				left: 0,
				width: 1000,
				height: 500
			} );
		} );
	} );

	describe( 'getDomRangeRects() ', () => {
		it( 'should return rects for a Range (non–collapsed)', () => {
			const range = document.createRange();

			range.selectNode( document.body );
			testUtils.sinon.stub( range, 'getClientRects' ).returns( [ geometry ] );

			const rects = Rect.getDomRangeRects( range );
			expect( rects ).to.have.length( 1 );
			assertRect( rects[ 0 ], geometry );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		it( 'should return rects for a Range (collapsed)', () => {
			const range = document.createRange();
			const secondGeometry = { top: 20, right: 80, bottom: 60, left: 40, width: 40, height: 40 };

			range.collapse();
			testUtils.sinon.stub( range, 'getClientRects' ).returns( [ geometry, secondGeometry ] );

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
			testUtils.sinon.stub( range, 'getClientRects' ).returns( [] );
			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			const expectedGeometry = Object.assign( {}, geometry );
			expectedGeometry.right = expectedGeometry.left;
			expectedGeometry.width = 0;

			const rects = Rect.getDomRangeRects( range );
			expect( rects ).to.have.length( 1 );
			assertRect( rects[ 0 ], expectedGeometry );
		} );
	} );
} );

function assertRect( rect, expected ) {
	expect( rect ).to.deep.equal( expected );
}
