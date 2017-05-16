/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import uid from '../src/uid';

describe( 'utils', () => {
	describe( 'uid', () => {
		it( 'should return different ids', () => {
			const id1 = uid();
			const id2 = uid();
			const id3 = uid();

			expect( id1 ).to.be.a( 'string' );
			expect( id2 ).to.be.a( 'string' ).to.not.equal( id1 ).to.not.equal( id3 );
			expect( id3 ).to.be.a( 'string' ).to.not.equal( id1 ).to.not.equal( id2 );

			expect( id1 ).to.match( /^[a-z][a-z0-9]{32}$/ );
			expect( id2 ).to.match( /^[a-z][a-z0-9]{32}$/ );
			expect( id3 ).to.match( /^[a-z][a-z0-9]{32}$/ );
		} );
	} );
} );
