/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	getBoxSidesStyleShorthandValue,
	getBoxSidesStyleValues,
	getShorthandStylesValues,
	isColorStyleValue,
	isLengthStyleValue,
	isLineStyleValue,
	isPercentageStyleValue
} from '../../../src/view/styles/utils.js';

describe( 'Styles utils', () => {
	describe( 'isColor()', () => {
		it( 'returns true for #RGB color', () => {
			testValues( [ '#f00', '#ba2', '#F00', '#BA2', '#AbC' ], isColorStyleValue );
		} );

		it( 'returns true for #RRGGBB color', () => {
			testValues( [ '#ff0000', '#bbaa22', '#FF0000', '#BBAA22', '#AabBCC' ], isColorStyleValue );
		} );

		it( 'returns true for #RGBA color', () => {
			testValues( [ '#f000', '#ba24', '#F000', '#BA24', '#aBcD' ], isColorStyleValue );
		} );

		it( 'returns true for #RRGGBBAA color', () => {
			testValues( [ '#ff000000', '#bbaa2244', '#FF000000', '#BBAA2244', '#AabBCCdd' ], isColorStyleValue );
		} );

		it( 'returns false for invalid # color', () => {
			testValues( [ '#ttt', '#1', '#12', '#12345' ], value => !isColorStyleValue( value ) );
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
			], isColorStyleValue );
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
			], value => !isColorStyleValue( value ) );
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
			], isColorStyleValue );
		} );

		it( 'returns false for wrong rgba() color', () => {
			testValues( [
				'rgba(1,2,3,0.7',
				'rgba((1,2,3,0.7',
				'rgba(1,a,3,0.7)',
				'rgba(1,2,3,*)'
			], value => !isColorStyleValue( value ) );
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
			], isColorStyleValue );
		} );

		it( 'returns true for hsla() color', () => {
			testValues( [ 'hsla(240, 100%, 50%, 1)', 'hsla(240, 100%, 50%, .05)' ], isColorStyleValue );
		} );

		it( 'returns true for color keywords', () => {
			testValues( [ 'currentColor', 'transparent' ], isColorStyleValue );
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
			], isColorStyleValue );
		} );

		it( 'returns false for unknown color keyword', () => {
			testValues( [ 'redx', 'greenx', 'bluex' ], value => !isColorStyleValue( value ) );
		} );
	} );

	describe( 'isLineStyle()', () => {
		it( 'returns true for line style', () => {
			testValues(
				[ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ],
				isLineStyleValue
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
				isLengthStyleValue
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
				isLengthStyleValue
			);
		} );

		// s/ckeditor5/3
		it( 'should handle invalid values with repeated characters', () => {
			expect( isLengthStyleValue( '9'.repeat( 1000000 ) ) ).to.be.false;
		} );
	} );

	describe( 'isPercentage()', () => {
		it( 'returns true valid values', () => {
			testValues( [ '1%', '100%', '1123.1312%', '0.9876%' ], isPercentageStyleValue );
		} );

		it( 'returns false for not a percentage values', () => {
			testValues( [ '0', '1px', '1000px', '1.1px', '345.457px', '.457px' ], value => !isPercentageStyleValue( value ) );
		} );

		// s/ckeditor5/3
		it( 'should handle invalid values with repeated characters', () => {
			expect( isPercentageStyleValue( '9'.repeat( 1000000 ) ) ).to.be.false;
		} );
	} );

	describe( 'getBoxSidesStyleShorthandValue()', () => {
		it( 'should output one value for same values', () => {
			expect( getBoxSidesStyleShorthandValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'foo' } ) ).to.equal( 'foo' );
		} );

		it( 'should output two value for top == bottom and right == left', () => {
			expect( getBoxSidesStyleShorthandValue( { top: 'foo', right: 'bar', bottom: 'foo', left: 'bar' } ) ).to.equal( 'foo bar' );
		} );

		it( 'should output three values if bottom is different then top', () => {
			expect( getBoxSidesStyleShorthandValue( { top: 'foo', right: 'foo', bottom: 'bar', left: 'foo' } ) )
				.to.equal( 'foo foo bar' );
		} );

		it( 'should output four values if left is different then right', () => {
			expect( getBoxSidesStyleShorthandValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'bar' } ) )
				.to.equal( 'foo foo foo bar' );
		} );
	} );

	describe( 'getBoxSidesStyleValues()', () => {
		it( 'should parse empty string', () => {
			expect( getBoxSidesStyleValues( '' ) ).to.deep.equal( {
				top: undefined,
				right: undefined,
				bottom: undefined,
				left: undefined
			} );
		} );

		it( 'should parse one value', () => {
			expect( getBoxSidesStyleValues( 'foo' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'foo',
				left: 'foo'
			} );
		} );

		it( 'should parse two value', () => {
			expect( getBoxSidesStyleValues( 'foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'bar',
				bottom: 'foo',
				left: 'bar'
			} );
		} );

		it( 'should parse three values', () => {
			expect( getBoxSidesStyleValues( 'foo foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'bar',
				left: 'foo'
			} );
		} );

		it( 'should output four values if left is different then right', () => {
			expect( getBoxSidesStyleValues( 'foo foo foo bar' ) ).to.deep.equal( {
				top: 'foo',
				right: 'foo',
				bottom: 'foo',
				left: 'bar'
			} );
		} );

		it( 'should work with values containing white spaces', () => {
			expect( getBoxSidesStyleValues(
				'   rgb(10 , 10,   10 )  rgba(100,    100,   100, .3   )' +
				'   rgb(  20%   20%  20% )    rgba(  255   255  255   /  .5 ) '
			) )
				.to.deep.equal( {
					top: 'rgb(10 , 10,   10 )',
					right: 'rgba(100,    100,   100, .3   )',
					bottom: 'rgb(  20%   20%  20% )',
					left: 'rgba(  255   255  255   /  .5 )'
				} );
		} );

		it( 'should work with values containing nested declarations', () => {
			expect( getBoxSidesStyleValues( '  calc( 10px  -  3px )  calc(  var( --foo-var ) + 20px  )' ) ).to.deep.equal( {
				top: 'calc( 10px  -  3px )',
				right: 'calc(  var( --foo-var ) + 20px  )',
				bottom: 'calc( 10px  -  3px )',
				left: 'calc(  var( --foo-var ) + 20px  )'
			} );
		} );
	} );

	describe( 'getShorthandStylesValues()', () => {
		it( 'should split string to separate values', () => {
			expect( getShorthandStylesValues( 'foo bar' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should trim truncate analyzed content to 1500 characters', () => {
			const attribute = 'abc(10, 1)'.repeat( 160 );

			expect( getShorthandStylesValues( '   ' + attribute ) ).to.be.deep.equal(
				[ ...Array( 150 ) ].fill( 'abc(10, 1)' )
			);
		} );

		it( 'should split string to separate values when value contain grouping parens', () => {
			expect( getShorthandStylesValues( 'foo bar(1, 3, 5) url("example.com:foo/bar?q=b")' ) )
				.to.deep.equal( [ 'foo', 'bar(1, 3, 5)', 'url("example.com:foo/bar?q=b")' ] );
		} );

		describe( 'for colors', () => {
			it( 'should split color declarations: named colors', () => {
				expect( getShorthandStylesValues( 'red green black' ) ).to.deep.equal( [
					'red', 'green', 'black'
				] );
			} );

			it( 'should split color declarations: hex colors', () => {
				expect( getShorthandStylesValues( '#000 #000000EE' ) ).to.deep.equal( [
					'#000', '#000000EE'
				] );
			} );

			it( 'should split color declarations: rgb colors', () => {
				expect( getShorthandStylesValues( 'rgb(10, 10, 10) rgba(100, 100, 100, .3) rgb(20% 20% 20%) rgba(255 255 255 / .5)' ) )
					.to.deep.equal( [
						'rgb(10, 10, 10)', 'rgba(100, 100, 100, .3)', 'rgb(20% 20% 20%)', 'rgba(255 255 255 / .5)'
					] );
			} );

			it( 'should split color declarations: hsl colors', () => {
				expect(
					getShorthandStylesValues( 'hsl(50 80% 40%) hsl(212.4, 89.3%, 89%) hsla(209, 90%, 72%,.3) hsla(0.3turn 60% 45% / .7)' )
				)
					.to.deep.equal( [
						'hsl(50 80% 40%)', 'hsl(212.4, 89.3%, 89%)', 'hsla(209, 90%, 72%,.3)', 'hsla(0.3turn 60% 45% / .7)'
					] );
			} );

			it( 'should split color declarations: other color formats', () => {
				expect( getShorthandStylesValues( 'hwb(50deg 30% 40%) cmyk(0 81% 81% 30%) color(xyz 22% 26% 53%) lab(30 59.4 -96)' ) )
					.to.deep.equal( [
						'hwb(50deg 30% 40%)', 'cmyk(0 81% 81% 30%)', 'color(xyz 22% 26% 53%)', 'lab(30 59.4 -96)'
					] );
			} );

			describe( 'with additional white spaces in declarations', () => {
				it( 'should split color declarations: named colors', () => {
					expect( getShorthandStylesValues( ' red   green  black ' ) ).to.deep.equal( [
						'red', 'green', 'black'
					] );
				} );

				it( 'should split color declarations: hex colors', () => {
					expect( getShorthandStylesValues( ' #000    #000000EE ' ) ).to.deep.equal( [
						'#000', '#000000EE'
					] );
				} );

				it( 'should split color declarations: rgb colors', () => {
					expect( getShorthandStylesValues(
						'   rgb(10 , 10,   10 )  rgba(100,    100,   100, .3   )' +
						'   rgb(  20%   20%  20% )    rgba(  255   255  255   /  .5 ) '
					) )
						.to.deep.equal( [
							'rgb(10 , 10,   10 )',
							'rgba(100,    100,   100, .3   )',
							'rgb(  20%   20%  20% )',
							'rgba(  255   255  255   /  .5 )'
						] );
				} );

				it( 'should split color declarations: hsl colors', () => {
					expect( getShorthandStylesValues(
						' hsl( 50  80%  40%)   hsl(  212.4,   89.3%,   89% )' +
						' hsla(  209,  90%,   72%, .3  ) hsla( 0.3turn  60%   45%  /  .7  )'
					) )
						.to.deep.equal( [
							'hsl( 50  80%  40%)',
							'hsl(  212.4,   89.3%,   89% )',
							'hsla(  209,  90%,   72%, .3  )',
							'hsla( 0.3turn  60%   45%  /  .7  )'
						] );
				} );

				it( 'should split color declarations: other color formats', () => {
					expect( getShorthandStylesValues(
						'  hwb(  50deg  30%   40%  )  cmyk( 0   81%  81%    30% )' +
						'  color( xyz   22%  26%  53%)  lab(  30 59.4  -96 ) '
					) )
						.to.deep.equal( [
							'hwb(  50deg  30%   40%  )',
							'cmyk( 0   81%  81%    30% )',
							'color( xyz   22%  26%  53%)',
							'lab(  30 59.4  -96 )'
						] );
				} );
			} );
		} );

		describe( 'for non-color declarations', () => {
			it( 'should split size declarations: simple units', () => {
				expect( getShorthandStylesValues( '3px 2em 10vw 20%' ) ).to.deep.equal( [
					'3px', '2em', '10vw', '20%'
				] );
			} );

			it( 'should split size declarations: values with calc() expressions', () => {
				expect( getShorthandStylesValues( 'calc(10px - 3px) calc(var(--foo-var) + 20px)' ) ).to.deep.equal( [
					'calc(10px - 3px)', 'calc(var(--foo-var) + 20px)'
				] );
			} );

			describe( 'with additional white spaces', () => {
				it( 'should split size declarations: simple units', () => {
					expect( getShorthandStylesValues( ' 3px   2em  10vw   20%  ' ) ).to.deep.equal( [
						'3px', '2em', '10vw', '20%'
					] );
				} );

				it( 'should split size declarations: values with calc() expressions', () => {
					expect( getShorthandStylesValues( '  calc( 10px  -  3px )  calc(  var( --foo-var ) + 20px  )' ) ).to.deep.equal( [
						'calc( 10px  -  3px )', 'calc(  var( --foo-var ) + 20px  )'
					] );
				} );
			} );
		} );
	} );

	function testValues( values, callback ) {
		values.map( string => expect( callback( string ), string ).to.be.true );
	}
} );
