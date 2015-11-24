/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

/* bender-include: ../../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'document/document',
	'document/position',
	'document/element',
	'document/attribute',
	'ckeditorerror' );

describe( 'Transaction', () => {
	let Document, Position, Element, Attribute, CKEditorError;

	let doc, root, p1, p2;

	before( () => {
		Document = modules[ 'document/document' ];
		Position = modules[ 'document/position' ];
		Element = modules[ 'document/element' ];
		Attribute = modules[ 'document/attribute' ];
		CKEditorError = modules.ckeditorerror;
	} );

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		p1 = new Element( 'p', [ new Attribute( 'key1', 'value1' ) ], 'foo' );
		p2 = new Element( 'p', [ new Attribute( 'key2', 'value2' ) ], 'bar' );

		root.insertChildren( 0, [ p1, p2 ] );
	} );

	describe( 'merge', () => {
		it( 'should merge foo and bar into foobar', () => {
			doc.createTransaction().merge( new Position( [ 1 ], root ) );

			expect( root.getChildCount() ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).getChildCount() ).to.equal( 6 );
			expect( getIteratorCount( root.getChild( 0 ).getAttrIterator() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttr( 'key1' ) ).to.equal( 'value1' );
			expect( root.getChild( 0 ).getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 0 ).getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 0 ).getChild( 2 ).character ).to.equal( 'o' );
			expect( root.getChild( 0 ).getChild( 3 ).character ).to.equal( 'b' );
			expect( root.getChild( 0 ).getChild( 4 ).character ).to.equal( 'a' );
			expect( root.getChild( 0 ).getChild( 5 ).character ).to.equal( 'r' );
		} );

		it( 'should throw if there is no element after', () => {
			expect( () => {
				doc.createTransaction().merge( new Position( [ 2 ], root ) );
			} ).to.throw( CKEditorError, /^transaction-merge-no-element-after/ );
		} );

		it( 'should throw if there is no element before', () => {
			expect( () => {
				doc.createTransaction().merge( new Position( [ 0, 2 ], root ) );
			} ).to.throw( CKEditorError, /^transaction-merge-no-element-before/ );
		} );

		it( 'should be chainable', () => {
			const transaction = doc.createTransaction();

			const chain = transaction.merge( new Position( [ 1 ], root ) );
			expect( chain ).to.equal( transaction );
		} );
	} );
} );