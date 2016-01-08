/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/document',
	'core/treemodel/operation/nooperation'
);

describe( 'NoOperation', () => {
	let Document, NoOperation;

	before( function() {
		Document = modules[ 'core/treemodel/document' ];
		NoOperation = modules[ 'core/treemodel/operation/nooperation' ];
	} );

	let noop, doc, root;

	beforeEach( () => {
		noop = new NoOperation( 0 );
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should not throw an error when applied', () => {
		expect( () => doc.applyOperation( noop ) ).to.not.throw( Error );
	} );

	it( 'should create a NoOperation as a reverse', () => {
		const reverse = noop.getReversed();

		expect( reverse ).to.be.an.instanceof( NoOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
	} );

	it( 'should create a do-nothing operation having same parameters when cloned', () => {
		const clone = noop.clone();

		expect( clone ).to.be.an.instanceof( NoOperation );
		expect( clone.baseVersion ).to.equal( 0 );
	} );
} );
