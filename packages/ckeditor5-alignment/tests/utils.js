/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { isDefault, isSupported, supportedOptions } from '../src/utils';

describe( 'utils', () => {
	describe( 'isDefault()', () => {
		it( 'should return true for "left" alignment only', () => {
			expect( isDefault( 'left' ) ).to.be.true;
			expect( isDefault( 'right' ) ).to.be.false;
			expect( isDefault( 'center' ) ).to.be.false;
			expect( isDefault( 'justify' ) ).to.be.false;
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
