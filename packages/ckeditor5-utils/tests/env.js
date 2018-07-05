/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import env, { isEdge, isMac } from '../src/env';

describe( 'Env', () => {
	beforeEach( () => {
	} );

	it( 'is an object', () => {
		expect( env ).to.be.an( 'object' );
	} );

	describe( 'isMac', () => {
		it( 'is a boolean', () => {
			expect( env.isMac ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isEdge', () => {
		it( 'is a boolean', () => {
			expect( env.isEdge ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isMac()', () => {
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

	describe( 'isEdge()', () => {
		it( 'returns true for Edge UA strings', () => {
			expect( isEdge( 'edge' ) ).to.be.true;
			expect( isEdge( 'foo edge bar' ) ).to.be.true;
		} );

		it( 'returns false for non–Edge UA strings', () => {
			expect( isEdge( '' ) ).to.be.false;
			expect( isEdge( 'mac' ) ).to.be.false;
			expect( isEdge( 'foo' ) ).to.be.false;
		} );
	} );
} );
