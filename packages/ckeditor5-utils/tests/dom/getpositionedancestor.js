/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import getPositionedAncestor from '../../src/dom/getpositionedancestor';

describe( 'getPositionedAncestor', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'a' );

		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
	} );

	it( 'should return null when there is no element', () => {
		expect( getPositionedAncestor() ).to.be.null;
	} );

	it( 'should return null when there is no positioned ancestor', () => {
		expect( getPositionedAncestor( element ) ).to.be.null;
	} );

	it( 'should not consider the passed element', () => {
		element.style.position = 'relative';

		expect( getPositionedAncestor( element ) ).to.be.null;
	} );

	it( 'should find the positioned ancestor (direct parent)', () => {
		const parent = document.createElement( 'div' );

		parent.appendChild( element );
		document.body.appendChild( parent );
		parent.style.position = 'absolute';

		expect( getPositionedAncestor( element ) ).to.equal( parent );

		parent.remove();
	} );

	it( 'should find the positioned ancestor (far ancestor)', () => {
		const parentA = document.createElement( 'div' );
		const parentB = document.createElement( 'div' );

		parentB.appendChild( element );
		parentA.appendChild( parentB );
		document.body.appendChild( parentA );
		parentA.style.position = 'absolute';

		expect( getPositionedAncestor( element ) ).to.equal( parentA );

		parentA.remove();
	} );
} );
