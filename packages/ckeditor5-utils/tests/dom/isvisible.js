/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import isVisible from '../../src/dom/isvisible.js';

describe( 'isVisible()', () => {
	let ancestor, element;

	beforeEach( () => {
		ancestor = document.createElement( 'div' );
		element = document.createElement( 'div' );
	} );

	afterEach( () => {
		element.remove();
		ancestor.remove();
	} );

	it( 'returns true for items attached to the document with no specific styles', () => {
		document.body.appendChild( element );

		expect( isVisible( element ) ).to.be.true;
	} );

	it( 'returns true for items attached to the document with visibility:hidden', () => {
		document.body.appendChild( element );

		element.style.visibility = 'hidden';

		expect( isVisible( element ) ).to.be.true;
	} );

	it( 'returns true for items attached to the document with position:fixed', () => {
		document.body.appendChild( element );

		element.style.position = 'fixed';

		// This would fail if #offsetParent was used in the implementation.
		// #offsetParent is null for elements with position: fixed.
		expect( isVisible( element ) ).to.be.true;
	} );

	it( 'returns false for invalid arguments', () => {
		expect( isVisible() ).to.be.false;
		expect( isVisible( null ) ).to.be.false;
		expect( isVisible( false ) ).to.be.false;
		expect( isVisible( true ) ).to.be.false;
		expect( isVisible( document.createTextNode( 'foo' ) ) ).to.be.false;
	} );

	it( 'returns false for items detached from the document with no specific styles', () => {
		expect( isVisible( element ) ).to.be.false;
	} );

	it( 'returns false for items attached to the document with display:none', () => {
		document.body.appendChild( element );

		element.style.display = 'none';

		expect( isVisible( element ) ).to.be.false;
	} );

	it( 'returns false for items in a branch detached from the document (detached ancestor)', () => {
		ancestor.appendChild( element );

		expect( isVisible( element ) ).to.be.false;
	} );

	it( 'returns false for items with ancestors with display:none', () => {
		ancestor.appendChild( element );
		document.body.appendChild( ancestor );

		expect( isVisible( element ) ).to.be.true;

		ancestor.style.display = 'none';

		expect( isVisible( element ) ).to.be.false;
	} );

	it( 'should return visibility of parent element if text node is passed', () => {
		document.body.appendChild( element );

		const textNode = document.createTextNode( 'foo' );
		element.appendChild( textNode );

		expect( isVisible( textNode ) ).to.be.true;

		element.style.display = 'none';

		expect( isVisible( textNode ) ).to.be.false;
	} );
} );
