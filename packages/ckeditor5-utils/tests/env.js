/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import env, { isEdge, isMac, isGecko } from '../src/env';

function toLowerCase( str ) {
	return str.toLowerCase();
}

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

	describe( 'isGecko', () => {
		it( 'is a boolean', () => {
			expect( env.isGecko ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isMac()', () => {
		it( 'returns true for macintosh UA strings', () => {
			expect( isMac( 'macintosh' ) ).to.be.true;
			expect( isMac( 'foo macintosh bar' ) ).to.be.true;

			expect( isMac( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) ' +
				'Chrome/61.0.3163.100 Safari/537.36'
			) ) ).to.be.true;
		} );

		it( 'returns false for non–macintosh UA strings', () => {
			expect( isMac( '' ) ).to.be.false;
			expect( isMac( 'mac' ) ).to.be.false;
			expect( isMac( 'foo' ) ).to.be.false;
		} );
	} );

	describe( 'isEdge()', () => {
		it( 'returns true for Edge UA strings', () => {
			expect( isEdge( 'edge/12' ) ).to.be.true;
			expect( isEdge( 'foo edge/12 bar' ) ).to.be.true;

			expect( isEdge( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
				'Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393'
			) ) ).to.be.true;
		} );

		it( 'returns false for non–Edge UA strings', () => {
			expect( isEdge( '' ) ).to.be.false;
			expect( isEdge( 'mac' ) ).to.be.false;
			expect( isEdge( 'foo' ) ).to.be.false;
			expect( isEdge( 'ledge' ) ).to.be.false;
			expect( isEdge( 'foo edge bar' ) ).to.be.false;

			// Chrome
			expect( isEdge( toLowerCase(
				'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
			) ) ).to.be.false;
			// IE11
			expect( isEdge( toLowerCase(
				'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko'
			) ) ).to.be.false;
		} );
	} );

	describe( 'isGecko()', () => {
		it( 'returns true for Firefox UA strings', () => {
			expect( isGecko( 'gecko/42' ) ).to.be.true;
			expect( isGecko( 'foo gecko/42 bar' ) ).to.be.true;

			expect( isGecko( toLowerCase(
				'mozilla/5.0 (macintosh; intel mac os x 10.13; rv:62.0) gecko/20100101 firefox/62.0'
			) ) ).to.be.true;
		} );

		it( 'returns false for non–Edge UA strings', () => {
			expect( isGecko( '' ) ).to.be.false;
			expect( isGecko( 'foo' ) ).to.be.false;
			expect( isGecko( 'Mozilla' ) ).to.be.false;

			// Chrome
			expect( isGecko( toLowerCase(
				'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
			) ) ).to.be.false;
		} );
	} );
} );
