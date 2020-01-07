/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { isDefault, isSupported, supportedOptions } from '../src/utils';

describe( 'utils', () => {
	describe( 'isDefault()', () => {
		it( 'should return true for "left" alignment only (LTR)', () => {
			const locale = {
				contentLanguageDirection: 'ltr'
			};

			expect( isDefault( 'left', locale ) ).to.be.true;
			expect( isDefault( 'right', locale ) ).to.be.false;
			expect( isDefault( 'center', locale ) ).to.be.false;
			expect( isDefault( 'justify', locale ) ).to.be.false;
		} );

		it( 'should return true for "right" alignment only (RTL)', () => {
			const locale = {
				contentLanguageDirection: 'rtl'
			};

			expect( isDefault( 'left', locale ) ).to.be.false;
			expect( isDefault( 'right', locale ) ).to.be.true;
			expect( isDefault( 'center', locale ) ).to.be.false;
			expect( isDefault( 'justify', locale ) ).to.be.false;
		} );
	} );

	describe( 'isSupported()', () => {
		it( 'should return true for supported alignments', () => {
			expect( isSupported( 'left' ) ).to.be.true;
			expect( isSupported( 'right' ) ).to.be.true;
			expect( isSupported( 'center' ) ).to.be.true;
			expect( isSupported( 'justify' ) ).to.be.true;

			expect( isSupported( '' ) ).to.be.false;
			expect( isSupported( 'middle' ) ).to.be.false;
		} );
	} );

	describe( 'supportedOptions', () => {
		it( 'should be set', () => {
			expect( supportedOptions ).to.deep.equal( [ 'left', 'right', 'center', 'justify' ] );
		} );
	} );
} );
