/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import getLongText from '../../tests/_utils/longtext';

describe( 'utils', () => {
	describe( 'getLongText', () => {
		it( 'should return text with 0 length', () => {
			expect( getLongText( 0 ).length ).to.equal( 0 );
		} );

		it( 'should return text with 553 length', () => {
			expect( getLongText( 553 ).length ).to.equal( 553 );
		} );

		it( 'should return text with 1500 length', () => {
			expect( getLongText( 1500 ).length ).to.equal( 1500 );
		} );

		it( 'should return text with 4000 length', () => {
			expect( getLongText( 4000 ).length ).to.equal( 4000 );
		} );

		it( 'should return different text with fromStart=false', () => {
			expect( getLongText( 100 ) ).to.not.equal( getLongText( 100, false ) );
		} );

		it( 'should return reversed text', () => {
			const text1 = getLongText( 100 );
			const text2 = getLongText( 100, true, true );

			expect( text1 ).to.not.equal( text2 );
			expect( text1 ).to.equal( text2.split( '' ).reverse().join( '' ) );
		} );

		it( 'should return reversed text (with fromStart=false)', () => {
			const text1 = getLongText( 150, false );
			const text2 = getLongText( 150, false, true );

			expect( text1 ).to.not.equal( text2 );
			expect( text1 ).to.equal( text2.split( '' ).reverse().join( '' ) );
		} );
	} );
} );
