/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import indexOf from '../../src/dom/indexof.js';

describe( 'indexOf', () => {
	it( 'should return 0 if element has no parent', () => {
		const p = document.createElement( 'p' );

		expect( indexOf( p ) ).to.equal( 0 );
	} );

	it( 'should return index of the node in parent', () => {
		const div = document.createElement( 'div' );
		const p0 = document.createElement( 'p' );
		const p1 = document.createElement( 'p' );
		const p2 = document.createElement( 'p' );

		div.appendChild( p0 );
		div.appendChild( p1 );
		div.appendChild( p2 );

		expect( indexOf( p0 ) ).to.equal( 0 );
		expect( indexOf( p1 ) ).to.equal( 1 );
		expect( indexOf( p2 ) ).to.equal( 2 );
	} );
} );
