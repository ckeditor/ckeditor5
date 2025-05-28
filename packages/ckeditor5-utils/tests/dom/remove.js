/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import remove from '../../src/dom/remove.js';

describe( 'remove', () => {
	it( 'should remove element form parent', () => {
		const div = document.createElement( 'div' );
		const p0 = document.createElement( 'p' );
		const p1 = document.createElement( 'p' );
		const p2 = document.createElement( 'p' );

		div.appendChild( p0 );
		div.appendChild( p1 );
		div.appendChild( p2 );

		remove( p1 );

		expect( p1.parentNode ).to.be.null;
		expect( div.childNodes.length ).to.equal( 2 );
	} );

	it( 'should do nothing if element has no parent', () => {
		const div = document.createElement( 'div' );

		remove( div );

		expect( div.parentNode ).to.be.null;
	} );
} );
