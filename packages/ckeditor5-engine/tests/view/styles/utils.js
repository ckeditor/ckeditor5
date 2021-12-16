/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	getBoxSidesShorthandValue,
	getBoxSidesValues,
	getShorthandValues,
	isColor,
	isLength,
	isLineStyle, isPercentage
} from '../../../src/view/styles/utils';

describe( 'Styles utils', () => {
	describe( 'isColor()', () => {
		it( 'returns true for #RGB color', () => {
			testValues( [ '#f00', '#ba2', '#F00', '#BA2', '#AbC' ], isColor );
		} );

		it( 'returns true for #RRGGBB color', () => {
			testValues( [ '#ff0000', '#bbaa22', '#FF0000', '#BBAA22', '#AabBCC' ], isColor );
		} );

		it( 'returns true for #RGBA color', () => {
			testValues( [ '#f000', '#ba24', '#F000', '#BA24', '#aBcD' ], isColor );
		} );

		it( 'returns true for #RRGGBBAA color', () => {
			testValues( [ '#ff000000', '#bbaa2244', '#FF000000', '#BBAA2244', '#AabBCCdd' ], isColor );
		} );

		it( 'returns false for invalid # color', () => {
			testValues( [ '#ttt', '#1', '#12', '#12345' ], value => !isColor( value ) );
		} );

		it( 'returns true for rgb() color', () => {
			testValues( [
				'rgb(255,0,153)',
				'rgb(255, 0, 153)',
				'rgb(100%,0%,60%)',
				'rgb(100%, 0%, 60%)'
				// Unsupported:
				// 'rgb(11, 22, 33, 0.1)', // rgba() is equal to rgb()
				// 'rgb(255, 0, 153.0)', // Floats are valid
				// 'rgb(255 0 153)', // CSS Level 4 notation
			], isColor );
		} );

		it( 'returns false for invalid rgb() color', () => {
			testValues( [
				'rgb()',
				'rgb(1)',
				'rgb(1,2)',
				'rgb(11,',
				'rgb(11, 22,',
				'rgb(11, 22, 33',
				'rgb((11, 22, 33',
				'rgb((11, 22, 33)',
				'rgb(11, 22, 33))',
				'rgb(11, 22, 33, 0.1)',
				'rgb(11, 22, 33, .153)'
				// Unsupported:
				// 'rgb(100%, 0, 60%)', // Mixed numbers and percentages - adds complexity.,
			], value => !isColor( value ) );
		} );

		it( 'returns true for rgba() color', () => {
			testValues( [
				'rgba(1,2,3,0.7)',
				'rgba(12%,0,0,1)',
				'rgba(255,0,153, 0.123)',
				'rgba(255, 0, 153, 0.123)',
				'rgba(100%,0%,60%, 0.123)',
				'rgba(100%, 0%, 60%, 0.123)',
				'rgba(255,0,153, 0)',
				'rgba(255, 0, 153, 0)',
				'rgba(100%,0%,60%, 0)',
				'rgba(100%, 0%, 60%, 0)',
				'rgba(255,0,153, 1)',
				'rgba(255, 0, 153, 1)',
				'rgba(100%,0%,60%, 1)',
				'rgba(100%, 0%, 60%, 1)'
			], isColor );
		} );

		it( 'returns false for wrong rgba() color', () => {
			testValues( [
				'rgba(1,2,3,0.7',
				'rgba((1,2,3,0.7',
				'rgba(1,a,3,0.7)',
				'rgba(1,2,3,*)'
			], value => !isColor( value ) );
		} );

		it( 'returns true for hsl() color', () => {
			testValues( [
				'hsl(270,60%,70%)',
				'hsl(270, 60%, 70%)',
				'hsl(270, 60%, 50%, .15)',
				'hsl(270, 60%, 50%, 0.15)',
				'hsl(270, 60%, 50%, 15%)'
				// Unsupported:
				// 'hsl(270deg, 60%, 70%)', // Valid deg unit
				// 'hsl(4.71239rad, 60%, 70%)', // Valid rad unit
				// 'hsl(.75turn, 60%, 70%)', // Valid turn unit
				// 'hsl(270 60% 70%)', // CSS Level 4 notation
				// 'hsl(270 60% 50% / .15)', // CSS Level 4 notation
				// 'hsl(270 60% 50% / 15%)' // CSS Level 4 notation
			], isColor );
		} );

		it( 'returns true for hsla() color', () => {
			testValues( [ 'hsla(240, 100%, 50%, 1)', 'hsla(240, 100%, 50%, .05)' ], isColor );
		} );

		it( 'returns true for color keywords', () => {
			testValues( [ 'currentColor', 'transparent' ], isColor );
		} );

		it( 'returns true for color keyword', () => {
			testValues( [
				// CSS Level 1
				'red', 'green', 'blue', // ...
				// CSS Level 2
				'orange',
				// CSS Level 3
				'cyan', 'azure', 'wheat',
				// CSS Level 3 System Colors
				'windowtext',
				// CSS Level 4
				'rebeccapurple'
			], isColor );
		} );

		it( 'returns false for unknown color keyword', () => {
			testValues( [ 'redx', 'greenx', 'bluex' ], value => !isColor( value ) );
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
				[
					'1px',
					'1cm',
					'1mm',
					'1in',
					'1pc',
					'1pt',
					'1ch',
					'1em',
					'1ex',
					'1rem',
					'1vh',
					'1vw',
					'1vmin',
					'1vmax'
				],
				isLength
			);
		} );

		it( 'returns true for various values notation', () => {
			testValues(
				[
					'0',
					'1px',
					'1000px',
					'1.1px',
					'345.457px',
					'.457px'
				],
				isLength
			);
		} );

		// s/ckeditor5/3
		it( 'should handle invalid values with repeated characters', () => {
			expect( isLength( '9'.repeat( 1000000 ) ) ).to.be.false;
		} );
	} );

	describe( 'isPercentage()', () => {
		it( 'returns true valid values', () => {
			testValues( [ '1%', '100%', '1123.1312%', '0.9876%' ], isPercentage );
		} );

		it( 'returns false for not a percentage values', () => {
			testValues( [ '0', '1px', '1000px', '1.1px', '345.457px', '.457px' ], value => !isPercentage( value ) );
		} );

		// s/ckeditor5/3
		it( 'should handle invalid values with repeated characters', () => {
			expect( isPercentage( '9'.repeat( 1000000 ) ) ).to.be.false;
		} );
	} );

	describe( 'getBoxSidesShorthandValue()', () => {
		it( 'should output one value for same values', () => {
			expect( getBoxSidesShorthandValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'foo' } ) ).to.equal( 'foo' );
		} );

		it( 'should output two value for top == bottom and right == left', () => {
			expect( getBoxSidesShorthandValue( { top: 'foo', right: 'bar', bottom: 'foo', left: 'bar' } ) ).to.equal( 'foo bar' );
		} );

		it( 'should output three values if bottom is different then top', () => {
			expect( getBoxSidesShorthandValue( { top: 'foo', right: 'foo', bottom: 'bar', left: 'foo' } ) )
				.to.equal( 'foo foo bar' );
		} );

		it( 'should output four values if left is different then right', () => {
			expect( getBoxSidesShorthandValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'bar' } ) )
				.to.equal( 'foo foo foo bar' );
		} );
	} );

	describe( 'getBoxSidesValues()', () => {
		it( 'should parse empty string', () => {
			expect( getBoxSidesValues( '' ) ).to.deep.equal( {
				top: undefined,
				right: undefined,
				bottom: undefined,
				left: undefined
			} );
		} );

		it( 'should parse one value', () => {
			expect( getBoxSidesValues( 'foo' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'foo',
				left: 'foo'
			} );
		} );

		it( 'should parse two value', () => {
			expect( getBoxSidesValues( 'foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'bar',
				bottom: 'foo',
				left: 'bar'
			} );
		} );

		it( 'should parse three values', () => {
			expect( getBoxSidesValues( 'foo foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'bar',
				left: 'foo'
			} );
		} );

		it( 'should output four values if left is different then right', () => {
			expect( getBoxSidesValues( 'foo foo foo bar' ) ).to.deep.equal( {
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
