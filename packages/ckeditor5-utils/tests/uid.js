/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import uid from 'ckeditor5/utils/uid.js';

describe( 'utils', () => {
	describe( 'uid', () => {
		it( 'should return different ids', () => {
			let id1 = uid();
			let id2 = uid();
			let id3 = uid();

			expect( id1 ).to.be.a( 'string' );
			expect( id2 ).to.be.a( 'string' ).to.not.equal( id1 ).to.not.equal( id3 );
			expect( id3 ).to.be.a( 'string' ).to.not.equal( id1 ).to.not.equal( id2 );

			expect( id1[ 0 ] ).to.match( /[a-z]/ );
			expect( id2[ 0 ] ).to.match( /[a-z]/ );
			expect( id3[ 0 ] ).to.match( /[a-z]/ );

			expect( id1 ).to.have.length( 33 );
			expect( id2 ).to.have.length( 33 );
			expect( id3 ).to.have.length( 33 );
		} );
	} );
} );
