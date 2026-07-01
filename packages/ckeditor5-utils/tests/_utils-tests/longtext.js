/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { getLongText } from '../../tests/_utils/longtext.js';

describe( 'utils', () => {
	describe( 'getLongText', () => {
		it( 'should return text with 0 length', () => {
			expect( getLongText( 0 ).length ).toBe( 0 );
		} );

		it( 'should return text with 553 length', () => {
			expect( getLongText( 553 ).length ).toBe( 553 );
		} );

		it( 'should return text with 1500 length', () => {
			expect( getLongText( 1500 ).length ).toBe( 1500 );
		} );

		it( 'should return text with 4000 length', () => {
			expect( getLongText( 4000 ).length ).toBe( 4000 );
		} );

		it( 'should return different text with fromStart=false', () => {
			expect( getLongText( 100 ) ).not.toBe( getLongText( 100, false ) );
		} );

		it( 'should return reversed text', () => {
			const text1 = getLongText( 100 );
			const text2 = getLongText( 100, true, true );

			expect( text1 ).not.toBe( text2 );
			expect( text1 ).toBe( text2.split( '' ).reverse().join( '' ) );
		} );

		it( 'should return reversed text (with fromStart=false)', () => {
			const text1 = getLongText( 150, false );
			const text2 = getLongText( 150, false, true );

			expect( text1 ).not.toBe( text2 );
			expect( text1 ).toBe( text2.split( '' ).reverse().join( '' ) );
		} );
	} );
} );
