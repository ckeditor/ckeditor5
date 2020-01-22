/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	getShorthandValues,
	getTopRightBottomLeftShorthandValue,
	getTopRightBottomLeftValues,
	isColor,
	isLength,
	isLineStyle
} from '../../../src/view/styles/utils';

describe( 'Styles utils', () => {
	describe( 'isColor()', () => {
		it( 'returns true for #RGB color', () => {
			testValues( [ '#f00', '#ba2' ], isColor );
		} );

		it( 'returns true for #RRGGBB color', () => {
			testValues( [ '#ff0000', '#bbaa22' ], isColor );
		} );

		it( 'returns true for #RGBA color', () => {
			testValues( [ '#f000', '#ba24' ], isColor );
		} );

		it( 'returns true for #RRGGBBAA color', () => {
			testValues( [ '#ff000000', '#bbaa2244' ], isColor );
		} );

		it( 'returns true for rgb() color', () => {
			testValues( [ 'rgb(255, 255, 255)', 'rgb(23%,0,100%)' ], isColor );
		} );

		it( 'returns true for rgba() color', () => {
			testValues( [ 'rgba(1,2,3,0.7)', 'rgba(12%,0,0,1)' ], isColor );
		} );

		it( 'returns true for hsl() color', () => {
			testValues( [ 'hsl(0, 100%, 50%)', 'hsl(340,80%,40%)' ], isColor );
		} );

		it( 'returns true for hsla() color', () => {
			testValues( [ 'hsla(240, 100%, 50%, 1)', 'hsla(240, 100%, 50%, .05)' ], isColor );
		} );

		it( 'returns true for currentColor color', () => {
			testValues( [ 'currentColor' ], isColor );
		} );
	} );

	describe( 'isLineStyle()', () => {
		it( 'returns true for line style', () => {
			testValues(
				[ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ],
				isLineStyle
			);
		} );
	} );

	describe( 'isLength()', () => {
		it( 'returns true for various units', () => {
			testValues(
				[ '1px', '2rem', '34.5px', '.2em', '0', '1346vmax' ],
				isLength
			);
		} );
	} );

	describe( 'getTopRightBottomLeftShorthandValue()', () => {
		it( 'should output one value for same values', () => {
			expect( getTopRightBottomLeftShorthandValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'foo' } ) ).to.equal( 'foo' );
		} );

		it( 'should output two value for top == bottom and right == left', () => {
			expect( getTopRightBottomLeftShorthandValue( { top: 'foo', right: 'bar', bottom: 'foo', left: 'bar' } ) ).to.equal( 'foo bar' );
		} );

		it( 'should output three values if bottom is different then top', () => {
			expect( getTopRightBottomLeftShorthandValue( { top: 'foo', right: 'foo', bottom: 'bar', left: 'foo' } ) )
				.to.equal( 'foo foo bar' );
		} );

		it( 'should output four values if left is different then right', () => {
			expect( getTopRightBottomLeftShorthandValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'bar' } ) )
				.to.equal( 'foo foo foo bar' );
		} );
	} );

	describe( 'getTopRightBottomLeftValues()', () => {
		it( 'should parse empty string', () => {
			expect( getTopRightBottomLeftValues( '' ) ).to.deep.equal( {
				top: undefined,
				right: undefined,
				bottom: undefined,
				left: undefined
			} );
		} );

		it( 'should parse one value', () => {
			expect( getTopRightBottomLeftValues( 'foo' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'foo',
				left: 'foo'
			} );
		} );

		it( 'should parse one value', () => {
			expect( getTopRightBottomLeftValues( 'foo' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'foo',
				left: 'foo'
			} );
		} );

		it( 'should parse two value', () => {
			expect( getTopRightBottomLeftValues( 'foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'bar',
				bottom: 'foo',
				left: 'bar'
			} );
		} );

		it( 'should parse three values', () => {
			expect( getTopRightBottomLeftValues( 'foo foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'bar',
				left: 'foo'
			} );
		} );

		it( 'should output four values if left is different then right', () => {
			expect( getTopRightBottomLeftValues( 'foo foo foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'foo',
				left: 'bar'
			} );
		} );
	} );

	describe( 'getParts()', () => {
		it( 'should split string to separate values', () => {
			expect( getShorthandValues( 'foo bar' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should split string to separate values when value contain grouping parens', () => {
			expect( getShorthandValues( 'foo bar(1, 3, 5) url("example.com:foo/bar?q=b")' ) )
				.to.deep.equal( [ 'foo', 'bar(1, 3, 5)', 'url("example.com:foo/bar?q=b")' ] );
		} );
	} );

	function testValues( values, callback ) {
		values.map( string => expect( callback( string ), string ).to.be.true );
	}
} );
