/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, window */

import Rect from 'ckeditor5/utils/dom/rect.js';
import testUtils from 'tests/core/_utils/utils.js';

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
		it( 'should accept HTMLElement', () => {
			const element = document.createElement( 'div' );

			testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( geometry );

			assertRect( new Rect( element ), geometry );
		} );

		it( 'should accept Range', () => {
			const range = document.createRange();

			testUtils.sinon.stub( range, 'getBoundingClientRect' ).returns( geometry );

			assertRect( new Rect( range ), geometry );
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

	describe( 'getViewportRect()', () => {
		it( 'should reaturn a rect', () => {
			expect( Rect.getViewportRect() ).to.be.instanceOf( Rect );
		} );

		it( 'should return the viewport\'s rect', () => {
			window.scrollX = 100;
			window.scrollY = 200;
			window.innerWidth = 1000;
			window.innerHeight = 500;

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
} );

function assertRect( rect, expected ) {
	expect( rect ).to.deep.equal( expected );
}
