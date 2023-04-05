/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	FONT_COLOR,
	FONT_BACKGROUND_COLOR,
	addColorTableToDropdown,
	renderDowncastElement,
	convertColor,
	convertToHex
} from './../src/utils';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ColorTableView from './../src/ui/colortableview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { Locale } from '@ckeditor/ckeditor5-utils';
import parse from 'color-parse';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

	it( 'plugin names has proper values', () => {
		expect( FONT_COLOR ).to.equal( 'fontColor' );
		expect( FONT_BACKGROUND_COLOR ).to.equal( 'fontBackgroundColor' );
	} );

	describe( 'addColorTableToDropdown()', () => {
		it( 'should create dropdown with color table', () => {
			const locale = new Locale();
			const dropdown = createDropdown( locale );
			dropdown.render();

			addColorTableToDropdown( {
				dropdownView: dropdown,
				colors: [
					{
						label: 'Black',
						color: '#000',
						options: {
							hasBorder: false
						}
					},
					{
						label: 'White',
						color: '#FFFFFF',
						options: {
							hasBorder: true
						}
					}
				],
				columns: 2,
				removeButtonLabel: 'Remove Color'
			} );

			expect( dropdown.colorTableView ).to.be.instanceOf( ColorTableView );
			expect( dropdown.panelView.children.length ).to.equal( 1 );
			expect( dropdown.colorTableView.element ).to.equal( dropdown.panelView.children.first.element );
		} );
	} );

	describe( 'renderDowncastElement()', () => {
		it( 'should create function executes viewWriter with proper arguments', () => {
			const downcastViewConverterFn = renderDowncastElement( 'color' );
			const fake = testUtils.sinon.fake();
			const fakeViewWriter = { createAttributeElement: fake };

			downcastViewConverterFn( 'blue', { writer: fakeViewWriter } );

			sinon.assert.calledWithExactly( fake, 'span', { style: 'color:blue' }, { priority: 7 } );
		} );
	} );

	describe( 'convertColor', () => {
		it( 'should return an empty string if no color was passed', () => {
			expect( convertColor() ).to.equal( '' );
		} );

		it( 'should return an empty string if a nullish value was passed', () => {
			expect( convertColor( '' ) ).to.equal( '' );
		} );

		it( 'should return an empty string a non-color string was passed', () => {
			expect( convertColor( 'foo' ) ).to.equal( '' );
		} );

		it( 'should return the same string if color space is in the passed format', () => {
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

	describe( 'convertToHex', () => {
		it( 'should return an empty string if no color was passed', () => {
			expect( convertToHex() ).to.equal( '' );
		} );

		it( 'should return the same string if hex color was passed', () => {
			expect( convertToHex( '#123123' ) ).to.equal( '#123123' );
		} );

		describe( 'should correctly convert color from', () => {
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
