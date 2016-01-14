/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'core/utils-diff' );

describe( 'diff', () => {
	let diff;

	before( () => {
		diff = modules[ 'core/utils-diff' ];
	} );

	it( 'should diff arrays', () => {
		expect( diff( 'aba', 'acca' ) ).to.deep.equals( [ 0, 1, 1, -1, 0 ] );
	} );

	it( 'should reverse result if the second array is shorter', () => {
		expect( diff( 'acca', 'aba' ) ).to.deep.equals( [ 0, -1, -1, 1, 0 ] );
	} );

	it( 'should diff if arrays are same', () => {
		expect( diff( 'abc', 'abc' ) ).to.deep.equals( [ 0, 0, 0 ] );
	} );

	it( 'should diff if one array is empty', () => {
		expect( diff( '', 'abc' ) ).to.deep.equals( [ 1, 1, 1 ] );
	} );

	it( 'should use custom comparator', () => {
		expect( diff( 'aBc', 'abc' ) ).to.deep.equals( [ 0, 1, -1, 0 ] );
		expect( diff( 'aBc', 'abc', ( a, b ) => a.toLowerCase() == b.toLowerCase() ) ).to.deep.equals( [ 0, 0, 0 ] );
	} );
} );