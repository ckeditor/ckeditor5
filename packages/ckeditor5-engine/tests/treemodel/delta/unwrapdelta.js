/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

/* bender-include: ../../_tools/tools.js */

'use strict';

const modules = bender.amd.require(
	'treemodel/document',
	'treemodel/position',
	'treemodel/range',
	'treemodel/element',
	'ckeditorerror'
);

describe( 'Batch', () => {
	let Document, Position, Element, CKEditorError;

	let doc, root, p;

	before( () => {
		Document = modules[ 'treemodel/document' ];
		Position = modules[ 'treemodel/position' ];
		Element = modules[ 'treemodel/element' ];
		CKEditorError = modules.ckeditorerror;
	} );

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		p = new Element( 'p', [], 'xyz' );
		root.insertChildren( 0, [ 'a', p, 'b' ] );
	} );

	describe( 'unwrap', () => {
		it( 'should unwrap given element', () => {
			doc.batch().unwrap( p );

			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 0 ).character ).to.equal( 'a' );
			expect( root.getChild( 1 ).character ).to.equal( 'x' );
			expect( root.getChild( 2 ).character ).to.equal( 'y' );
			expect( root.getChild( 3 ).character ).to.equal( 'z' );
			expect( root.getChild( 4 ).character ).to.equal( 'b' );
		} );

		it( 'should throw if element to unwrap has no parent', () => {
			let element = new Element( 'p' );

			expect( () => {
				doc.batch().unwrap( element );
			} ).to.throw( CKEditorError, /^batch-unwrap-element-no-parent/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.unwrap( p );
			expect( chain ).to.equal( batch );
		} );
	} );
} );
