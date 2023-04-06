/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	convertToHex,
	convertColor
} from './../../src/colorpicker/utils';

describe( 'utils', () => {
	describe( 'convertToHex()', () => {
		it( 'returns proper value if empty value passed', () => {
			expect( '' ).to.equal( convertToHex( '' ) );
		} );

		it( 'returns proper value if invalid value passed', () => {
			expect( '#000' ).to.equal( convertToHex( 'lorem ipsum' ) );
		} );

		it( 'returns proper value if broken syntax value passed', () => {
			expect( '#000000' ).to.equal( convertToHex( 'hsl( a)' ) );
		} );
	} );

	describe( 'convertColor()', () => {
		it( 'returns proper format for unknown color type', () => {
			expect( '' ).to.equal( convertColor( '#f00', 'lorem ipsum' ) );
		} );

		it( 'returns reasonable value for formats officially not supported', () => {
			expect( '' ).to.equal( convertColor( '#001100', 'cmyk' ) );
		} );
	} );
} );
