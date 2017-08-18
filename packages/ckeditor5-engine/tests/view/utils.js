/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewAttributeElement from '../../src/view/attributeelement';
import ViewContainerElement from '../../src/view/containerelement';
import ViewText from '../../src/view/text';

import { getTouchingTextNode } from '../../src/view/utils';

describe( 'getTouchingTextNode()', () => {
	let a, b, x, y;

	beforeEach( () => {
		a = new ViewText( 'a' );
		b = new ViewText( 'b' );
		x = new ViewText( 'x' );
		y = new ViewText( 'y' );

		// <div><p>ab</p><p><em><strong>x</strong></em>y</p></div>
		/* eslint-disable no-new */
		new ViewContainerElement( 'div', null, [
			new ViewContainerElement( 'p', null, [ a, b ] ),

			new ViewContainerElement( 'p', null, [
				new ViewAttributeElement( 'em', null, new ViewAttributeElement( 'strong', null, x ) ),
				y
			] )
		] );
	} );

	it( 'should return next touching view text node', () => {
		expect( getTouchingTextNode( a, true ) ).to.equal( b );
	} );

	it( 'should return previous touching view text node', () => {
		expect( getTouchingTextNode( b, false ) ).to.equal( a );
	} );

	it( 'should go outside of attribute element looking for text nodes', () => {
		expect( getTouchingTextNode( x, true ) ).to.equal( y );
	} );

	it( 'should go inside attribute element looking for text nodes', () => {
		expect( getTouchingTextNode( y, false ) ).to.equal( x );
	} );

	it( 'should return null if there is no next text node in given container element', () => {
		expect( getTouchingTextNode( b, true ) ).to.be.null;
		expect( getTouchingTextNode( y, true ) ).to.be.null;
	} );

	it( 'should return null if there is no previous text node in given container element', () => {
		expect( getTouchingTextNode( a, false ) ).to.be.null;
		expect( getTouchingTextNode( x, false ) ).to.be.null;
	} );
} );
