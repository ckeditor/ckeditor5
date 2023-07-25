/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, window */

import { getElementsIntersectionRect } from '../../src';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'getElementsIntersectionRect()', () => {
	let element1, element2, element3;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'getComputedStyle' );
		window.getComputedStyle.callThrough();

		stubWindow( {
			innerWidth: 10000,
			innerHeight: 10000,
			scrollX: 0,
			scrollY: 0
		} );
	} );

	afterEach( () => {
		if ( element1 ) {
			element1.remove();
		}

		if ( element2 ) {
			element2.remove();
		}

		if ( element3 ) {
			element3.remove();
		}
	} );

	it( 'should return intersection from given list of elements', () => {
		element1 = getElement( {
			top: 0,
			right: 100,
			bottom: 100,
			left: 0,
			width: 100,
			height: 100
		} );

		element2 = getElement( {
			top: 0,
			right: 80,
			bottom: 80,
			left: 0,
			width: 80,
			height: 80
		} );

		element3 = getElement( {
			top: 0,
			right: 60,
			bottom: 60,
			left: 0,
			width: 60,
			height: 60
		} );

		expect( getElementsIntersectionRect( [ element1, element2, element3 ] ) ).to.deep.equal( {
			top: 0,
			right: 60,
			bottom: 60,
			left: 0,
			width: 60,
			height: 60
		} );
	} );

	it( 'should return intersection from given list of elements including `document`', () => {
		element1 = getElement( {
			top: 0,
			right: 100,
			bottom: 100,
			left: 0,
			width: 100,
			height: 100
		} );

		element2 = getElement( {
			top: 0,
			right: 80,
			bottom: 80,
			left: 0,
			width: 80,
			height: 80
		} );

		expect( getElementsIntersectionRect( [ element1, element2, document ] ) ).to.deep.equal( {
			top: 0,
			right: 80,
			bottom: 80,
			left: 0,
			width: 80,
			height: 80
		} );
	} );

	it( 'should return null when there is no intersection between given elements', () => {
		element1 = getElement( {
			top: 0,
			right: 100,
			bottom: 100,
			left: 0,
			width: 100,
			height: 100
		} );

		element2 = getElement( {
			top: 200,
			right: 300,
			bottom: 300,
			left: 200,
			width: 100,
			height: 100
		} );

		expect( getElementsIntersectionRect( [ element1, element2, document ] ) ).to.deep.equal( null );
	} );

	it( 'should return document cropped by top offset', () => {
		expect( getElementsIntersectionRect( [ document ], 100 ) ).to.deep.equal( {
			bottom: 10000,
			height: 9900,
			left: 0,
			right: 10000,
			top: 100,
			width: 10000
		} );
	} );
} );

// Returns a synthetic element.
//
// @private
// @param {Object} properties A set of properties for the element.
// @param {Object} styles A set of styles in `window.getComputedStyle()` format.
function getElement( rect = {}, styles = {} ) {
	expect( rect.right - rect.left ).to.equal( rect.width, 'getElement incorrect horizontal values' );
	expect( rect.bottom - rect.top ).to.equal( rect.height, 'getElement incorrect vertical values' );

	const element = document.createElement( 'div' );
	document.body.appendChild( element );

	sinon.stub( element, 'getBoundingClientRect' ).returns( rect );

	Object.assign( element.style, styles );

	return element;
}

// Stubs the window.
//
// @private
// @param {Object} properties A set of properties the window should have.
function stubWindow( properties ) {
	for ( const p in properties ) {
		testUtils.sinon.stub( window, p ).value( properties[ p ] );
	}
}
