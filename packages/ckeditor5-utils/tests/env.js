/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import env, { isMac } from '../src/env';

describe( 'Env', () => {
	beforeEach( () => {
	} );

	it( 'is an object', () => {
		expect( env ).to.be.an( 'object' );
	} );

	describe( 'mac', () => {
		it( 'is a boolean', () => {
			expect( env.mac ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isMac', () => {
		it( 'returns true for macintosh UA strings', () => {
			expect( isMac( 'macintosh' ) ).to.be.true;
			expect( isMac( 'foo macintosh bar' ) ).to.be.true;
		} );

		it( 'returns false for non–macintosh UA strings', () => {
			expect( isMac( '' ) ).to.be.false;
			expect( isMac( 'mac' ) ).to.be.false;
			expect( isMac( 'foo' ) ).to.be.false;
		} );
	} );
} );
