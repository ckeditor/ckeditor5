/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import getPositionedAncestor from '../../src/dom/getpositionedancestor';

describe( 'getPositionedAncestor', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'a' );

		document.body.appendChild( element );
	} );

	it( 'should return null when there is no element', () => {
		expect( getPositionedAncestor() ).to.be.null;
	} );

	it( 'should return null when there is no parent', () => {
		expect( getPositionedAncestor( element ) ).to.be.null;
	} );

	it( 'should consider passed element', () => {
		element.style.position = 'relative';

		expect( getPositionedAncestor( element ) ).to.equal( element );
	} );

	it( 'should find the positioned ancestor (direct parent)', () => {
		const parent = document.createElement( 'div' );

		parent.appendChild( element );
		document.body.appendChild( parent );
		parent.style.position = 'absolute';

		expect( getPositionedAncestor( element ) ).to.equal( parent );
	} );

	it( 'should find the positioned ancestor (far ancestor)', () => {
		const parentA = document.createElement( 'div' );
		const parentB = document.createElement( 'div' );

		parentB.appendChild( element );
		parentA.appendChild( parentB );
		document.body.appendChild( parentA );
		parentA.style.position = 'absolute';

		expect( getPositionedAncestor( element ) ).to.equal( parentA );
	} );
} );
