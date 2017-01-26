/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import diff from '../src/diff';

describe( 'diff', () => {
	it( 'should diff strings', () => {
		expect( diff( 'aba', 'acca' ) ).to.deep.equals( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
	} );

	it( 'should diff arrays', () => {
		expect( diff( Array.from( 'aba' ), Array.from( 'acca' ) ) ).to.deep.equals( [ 'equal', 'insert', 'insert', 'delete', 'equal' ] );
	} );

	it( 'should reverse result if the second string is shorter', () => {
		expect( diff( 'acca', 'aba' ) ).to.deep.equals( [ 'equal', 'delete', 'delete', 'insert', 'equal' ] );
	} );

	it( 'should diff if strings are same', () => {
		expect( diff( 'abc', 'abc' ) ).to.deep.equals( [ 'equal', 'equal', 'equal' ] );
	} );

	it( 'should diff if one string is empty', () => {
		expect( diff( '', 'abc' ) ).to.deep.equals( [ 'insert', 'insert', 'insert' ] );
	} );

	it( 'should use custom comparator', () => {
		expect( diff( 'aBc', 'abc' ) ).to.deep.equals( [ 'equal', 'insert', 'delete', 'equal' ] );
		expect( diff( 'aBc', 'abc', ( a, b ) => a.toLowerCase() == b.toLowerCase() ) ).to.deep.equals( [ 'equal', 'equal', 'equal' ] );
	} );
} );
