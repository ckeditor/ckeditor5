/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/position' );

describe( 'Transaction', () => {
	let Document, Position;

	let doc, root;

	before( () => {
		Document = modules[ 'document/document' ];
		Position = modules[ 'document/position' ];
	} );

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		root.insertChildren( 0, 'foobar' );
	} );

	describe( 'remove', () => {
		it( 'should remove one element', () => {
			const position = new Position( root, [ 1 ] );
			doc.createTransaction().remove( position );

			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 2 ).character ).to.equal( 'b' );
			expect( root.getChild( 3 ).character ).to.equal( 'a' );
			expect( root.getChild( 4 ).character ).to.equal( 'r' );
		} );

		it( 'should remove 3 elements', () => {
			const position = new Position( root, [ 1 ] );
			doc.createTransaction().remove( position, 3 );

			expect( root.getChildCount() ).to.equal( 3 );
			expect( root.getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 1 ).character ).to.equal( 'a' );
			expect( root.getChild( 2 ).character ).to.equal( 'r' );
		} );

		it( 'should be chainable', () => {
			const position = new Position( root, [ 1 ] );
			const transaction = doc.createTransaction();

			const chain = transaction.remove( position );
			expect( chain ).to.equal( transaction );
		} );
	} );
} );
