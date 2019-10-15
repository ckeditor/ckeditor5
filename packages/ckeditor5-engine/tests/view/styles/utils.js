/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { isColor, isLineStyle } from '../../../src/view/styles/utils';

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
		it( 'returns true for named widths', () => {
			testValues(
				[ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ],
				isLineStyle
			);
		} );
	} );

	describe( 'isRepeat()', () => {} );

	describe( 'isPosition()', () => {} );

	function testValues( values, callback ) {
		values.map( string => expect( callback( string ), string ).to.be.true );
	}
} );
