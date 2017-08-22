/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewAttributeElement from '../../src/view/attributeelement';
import ViewContainerElement from '../../src/view/containerelement';
import ViewText from '../../src/view/text';

import { getTouchingTextNode } from '../../src/view/treewalker-utils';

describe( 'getTouchingTextNode()', () => {
	let a, b, x, y, z;

	beforeEach( () => {
		a = new ViewText( 'a' );
		b = new ViewText( 'b' );
		x = new ViewText( 'x' );
		y = new ViewText( 'y' );
		z = new ViewText( 'z' );

		// <div><p>ab</p><p><em><strong>x</strong></em>y</p></div>
		/* eslint-disable no-new */
		new ViewContainerElement( 'div', null, [
			new ViewContainerElement( 'p', null, [ a, b ] ),

			new ViewContainerElement( 'p', null, [
				new ViewAttributeElement( 'em', null, new ViewAttributeElement( 'strong', null, x ) ),
				y
			] ),

			z,

			new ViewContainerElement( 'p', null, [ new ViewText( '_' ) ] )
		] );
	} );

	it( 'should return next touching view text node when direction is not specified', () => {
		expect( getTouchingTextNode( a ) ).to.equal( b );
	} );

	it( 'should return next touching view text node', () => {
		expect( getTouchingTextNode( a, 'forward' ) ).to.equal( b );
	} );

	it( 'should return previous touching view text node', () => {
		expect( getTouchingTextNode( b, 'backward' ) ).to.equal( a );
	} );

	it( 'should go outside of attribute element looking for text nodes', () => {
		expect( getTouchingTextNode( x, 'forward' ) ).to.equal( y );
	} );

	it( 'should go inside attribute element looking for text nodes', () => {
		expect( getTouchingTextNode( y, 'backward' ) ).to.equal( x );
	} );

	it( 'should return null if there is no next text node in given container element', () => {
		expect( getTouchingTextNode( b, 'forward' ) ).to.be.null;
		expect( getTouchingTextNode( y, 'forward' ) ).to.be.null;
	} );

	it( 'should return null if there is no previous text node in given container element', () => {
		expect( getTouchingTextNode( a, 'backward' ) ).to.be.null;
		expect( getTouchingTextNode( x, 'backward' ) ).to.be.null;
	} );

	it( 'should not enter container element when looking for touching text node', () => {
		expect( getTouchingTextNode( z ) ).to.be.null;
		expect( getTouchingTextNode( z, 'backward' ) ).to.be.null;
	} );
} );
