/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ElementReplacer from '../src/elementreplacer.js';

describe( 'ElementReplacer', () => {
	let replacer;
	let container, el1, el2, elNew1;

	beforeEach( () => {
		replacer = new ElementReplacer();
		container = document.createElement( 'div' );
		container.innerHTML = '<p>a</p><p>b</p>';

		el1 = container.firstChild;
		el2 = container.lastChild;

		elNew1 = document.createElement( 'h1' );
	} );

	describe( 'replace', () => {
		it( 'hides the given element', () => {
			replacer.replace( el1 );

			expect( el1.style.display ).to.equal( 'none' );
		} );

		it( 'replaces one element with another', () => {
			replacer.replace( el1, elNew1 );

			expect( el1.style.display ).to.equal( 'none' );
			expect( elNew1.previousSibling ).to.equal( el1 );
		} );
	} );

	describe( 'restore', () => {
		it( 'reverts all changes', () => {
			replacer.replace( el1, elNew1 );
			replacer.replace( el2 );

			replacer.restore();

			expect( el1.style.display ).to.equal( '' );
			expect( el2.style.display ).to.equal( '' );
			expect( elNew1.parentNode ).to.be.null;
		} );
	} );
} );
