/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	convertToHex,
	convertColor,
	registerCustomElement
} from './../../src/colorpicker/utils.js';
import parse from 'color-parse';

describe( 'utils', () => {
	describe( 'convertToHex()', () => {
		it( 'returns proper value if empty value passed', () => {
			expect( convertToHex( '' ) ).to.equal( '' );
		} );

		it( 'should return the same string if hex color was passed', () => {
			expect( convertToHex( '#123123' ) ).to.equal( '#123123' );
		} );

		it( 'returns proper value if invalid value passed', () => {
			expect( convertToHex( 'lorem ipsum' ) ).to.equal( '#000' );
		} );

		it( 'returns proper value if broken syntax value passed', () => {
			expect( convertToHex( 'hsl( a)' ) ).to.equal( '#000000' );
		} );

		describe( 'should correctly convert color from (integration)', () => {
			const testColors = {
				hsl: 'hsl( 0, 75%, 60% )',
				rgb: 'rgb( 230, 76, 76 )',
				hwb: 'hwb( 0, 30, 10 )',
				lab: 'lab( 55% 59 33 )',
				lch: 'lch( 55% 68 30 )'
			};

			for ( const color in testColors ) {
				it( `${ color }`, () => {
					assertSimilarity( '#E64C4C', convertToHex( testColors[ color ], color ) );
				} );
			}
		} );
	} );

	describe( 'convertColor()', () => {
		it( 'should return an empty string if no color was passed', () => {
			expect( convertColor() ).to.equal( '' );
		} );

		it( 'should return an empty string if a nullish value was passed', () => {
			expect( convertColor( '' ) ).to.equal( '' );
		} );

		it( 'should return an empty string a non-color string was passed', () => {
			expect( convertColor( 'foo' ) ).to.equal( '' );
		} );

		it( 'returns proper format for unknown color type', () => {
			expect( convertColor( '#f00', 'lorem ipsum' ) ).to.equal( '' );
		} );

		it( 'returns reasonable value for formats officially not supported', () => {
			expect( convertColor( '#001100', 'cmyk' ) ).to.equal( '' );
		} );

		it( 'should return an empty string if a `converted` object doens\'t have `space` attr value acceptable by`parsed` function', () => {
			expect( convertColor( 'lchu( 10%, 10, 10)', 'lch' ) ).to.equal( '' );
		} );

		it( 'should return the same string if color space is in the passed format (integration)', () => {
			expect( convertColor( '#123123', 'hex' ) ).to.equal( '#123123' );
			expect( convertColor( 'rgb( 10, 10, 10)', 'rgb' ) ).to.equal( 'rgb( 10, 10, 10)' );
			expect( convertColor( 'hsl( 10, 10%, 10%)', 'hsl' ) ).to.equal( 'hsl( 10, 10%, 10%)' );
			expect( convertColor( 'hwb( 10, 10, 10)', 'hwb' ) ).to.equal( 'hwb( 10, 10, 10)' );
			expect( convertColor( 'lab( 10%, 10, 10)', 'lab' ) ).to.equal( 'lab( 10%, 10, 10)' );
			expect( convertColor( 'lch( 10%, 10, 10)', 'lch' ) ).to.equal( 'lch( 10%, 10, 10)' );
		} );

		it( 'should return an empty string if a color keyword was expected', () => {
			expect( convertColor( '#123123', 'keyword' ) ).to.equal( '' );
		} );

		describe( 'should correctly convert the color', () => {
			const pickerOutputFormats = [ 'hex', 'rgb', 'hsl', 'hwb', 'lab', 'lch' ];
			const testColors = {
				hex: '#E64C4C',
				hsl: 'hsl( 0, 75%, 60% )',
				rgb: 'rgb( 230, 76, 76 )',
				hwb: 'hwb( 0, 30, 10 )',
				lab: 'lab( 55% 59 33 )',
				lch: 'lch( 55% 68 30 )'
			};

			pickerOutputFormats.forEach( format => {
				describe( `from ${ format }`, () => {
					for ( const color in testColors ) {
						if ( format === color ) {
							continue;
						}

						it( `to ${ color }`, () => {
							assertSimilarity( testColors[ color ], convertColor( testColors[ format ], color ) );
						} );
					}
				} );
			} );
		} );
	} );

	describe( 'registerCustomElement()', () => {
		it( 'should register custom element', () => {
			expect( customElements.get( 'test-element' ) ).to.be.undefined;

			registerCustomElement( 'test-element', TestElement );

			expect( customElements.get( 'test-element' ) ).to.be.a( 'function' );
		} );

		it( 'should not throw when trying to re-register the same custom element', () => {
			registerCustomElement( 'second-test-element', SecondTestElement );

			expect( () => registerCustomElement( 'second-test-element', SecondTestElement ) ).to.not.throw();
		} );
	} );
} );

// Some conversions are only provided indirectly (e.g. LAB to Hex is actually LAB -> XYZ -> RGB -> Hex).
// That causes some rounding errors in between them and some colors are not exactly the same, but "good enough".
// Let's take that into account and allow for an error margin.
function assertSimilarity( expected, actual ) {
	const expectedChannels = parse( expected ).values;
	const actualChannels = parse( actual ).values;

	for ( let i = 0; i < expectedChannels.values.length; i++ ) {
		// Silly workaround for conversion to hue 360 being the same as 0.
		if ( [ 'hsl', 'hwb' ].includes( actualChannels.space ) && actualChannels.values[ 0 ] === 360 ) {
			actualChannels.values[ 0 ] = 0;
		}

		expect( Math.abs( expectedChannels.values[ i ] - actualChannels.values[ i ] ) ).to.be.below( 3 );
	}
}

class TestElement {}

class SecondTestElement {}
