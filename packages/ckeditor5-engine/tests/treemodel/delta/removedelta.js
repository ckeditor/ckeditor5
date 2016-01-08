/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */
/* bender-include: ../../_tools/tools.js */

'use strict';

const getNodesAndText = bender.tools.treemodel.getNodesAndText;

const modules = bender.amd.require(
	'core/treemodel/document',
	'core/treemodel/position',
	'core/treemodel/range',
	'core/treemodel/element'
);

describe( 'Batch', () => {
	let Document, Position, Range, Element;

	let doc, root, div, p, batch, chain, range;

	before( () => {
		Document = modules[ 'core/treemodel/document' ];
		Position = modules[ 'core/treemodel/position' ];
		Range = modules[ 'core/treemodel/range' ];
		Element = modules[ 'core/treemodel/element' ];
	} );

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		div = new Element( 'div', [], 'foobar' );
		p = new Element( 'p', [], 'abcxyz' );

		div.insertChildren( 4, [ new Element( 'p', [], 'gggg' ) ] );
		div.insertChildren( 2, [ new Element( 'p', [], 'hhhh' ) ] );

		root.insertChildren( 0, [ div, p ] );

		batch = doc.batch();

		// Range starts in ROOT > DIV > P > gg|gg.
		// Range ends in ROOT > DIV > ...|ar.
		range = new Range( new Position( root, [ 0, 2, 2 ] ), new Position( root, [ 0, 6 ] ) );
	} );

	describe( 'remove', () => {
		it( 'should remove specified node', () => {
			batch.remove( div );

			expect( root.getChildCount() ).to.equal( 1 );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should move any range of nodes', () => {
			batch.remove( range );

			expect( getNodesAndText( Range.createFromElement( root.getChild( 0 ) ) ) ).to.equal( 'foPhhPar' );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should create minimal number of operations when removing a range', () => {
			batch.remove( range );

			expect( batch.deltas.length ).to.equal( 1 );
			expect( batch.deltas[ 0 ].operations.length ).to.equal( 2 );
		} );

		it( 'should be chainable', () => {
			chain = batch.remove( range );

			expect( chain ).to.equal( batch );
		} );
	} );
} );
