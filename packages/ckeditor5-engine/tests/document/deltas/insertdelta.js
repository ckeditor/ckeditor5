/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

/* bender-include: ../../_tools/tools.js */

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
	} );

	it( 'should insert text', () => {
		const position = new Position( [ 0 ], root );
		doc.makeTransaction().insert( position, 'foo' );

		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).character ).to.equal( 'f' );
		expect( root.getChild( 1 ).character ).to.equal( 'o' );
		expect( root.getChild( 2 ).character ).to.equal( 'o' );
	} );
} );