/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: dom */

import toPx from '/ckeditor5/utils/dom/topx.js';

describe( 'toPx', () => {
	it( 'should be a function', () => {
		expect( toPx ).to.be.a( 'function' );
	} );

	it( 'should always pixelize the value', () => {
		expect( toPx( null ) ).to.equal( 'nullpx' );
		expect( toPx( undefined ) ).to.equal( 'undefinedpx' );
		expect( toPx( '10' ) ).to.equal( '10px' );
		expect( toPx( 10 ) ).to.equal( '10px' );
	} );
} );
