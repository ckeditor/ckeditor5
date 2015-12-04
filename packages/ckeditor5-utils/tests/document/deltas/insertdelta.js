/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/position' );

describe( 'Batch', () => {
	let Document, Position;

	let doc, root;

	before( () => {
		Document = modules[ 'document/document' ];
		Position = modules[ 'document/position' ];
	} );

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should insert text', () => {
		const position = new Position( root, [ 0 ] );
		doc.batch().insert( position, 'foo' );

		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).character ).to.equal( 'f' );
		expect( root.getChild( 1 ).character ).to.equal( 'o' );
		expect( root.getChild( 2 ).character ).to.equal( 'o' );
	} );

	it( 'should be chainable', () => {
		const position = new Position( root, [ 0 ] );
		const batch = doc.batch();

		const chain = batch.insert( position, 'foo' );
		expect( chain ).to.equal( batch );
	} );
} );
