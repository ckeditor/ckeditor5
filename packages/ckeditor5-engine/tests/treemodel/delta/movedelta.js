/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

const modules = bender.amd.require(
	'treemodel/document',
	'treemodel/position',
	'treemodel/range',
	'treemodel/element'
);

describe( 'Batch', () => {
	let Document, Position, Range, Element;

	let doc, root, div, p, batch, chain, range;

	before( () => {
		Document = modules[ 'treemodel/document' ];
		Position = modules[ 'treemodel/position' ];
		Range = modules[ 'treemodel/range' ];
		Element = modules[ 'treemodel/element' ];
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

	function getNodesAndText( element ) {
		let range = Range.createFromElement( element );
		let txt = '';

		for ( let step of range ) {
			let node = step.node;

			if ( node.character ) {
				txt += node.character.toLowerCase();
			} else if ( node.name ) {
				txt += node.name.toUpperCase();
			}
		}

		return txt;
	}

	describe( 'move', () => {
		it( 'should move specified node', () => {
			batch.move( div, new Position( root, [ 2 ] ) );

			expect( root.getChildCount() ).to.equal( 2 );
			expect( getNodesAndText( root.getChild( 0 ) ) ).to.equal( 'abcxyz' );
			expect( getNodesAndText( root.getChild( 1 ) ) ).to.equal( 'foPhhhhPobPggggPar' );
		} );

		it( 'should move any range of nodes', () => {
			batch.move( range, new Position( root, [ 1, 3 ] ) );

			expect( getNodesAndText( root.getChild( 0 ) ) ).to.equal( 'foPhhPar' );
			expect( getNodesAndText( root.getChild( 1 ) ) ).to.equal( 'abchhobPggggPxyz' );
		} );

		it( 'should create minimal number of operations when moving a range', () => {
			batch.move( range, new Position( root, [ 1, 3 ] ) );

			expect( batch.deltas.length ).to.equal( 1 );
			expect( batch.deltas[ 0 ].operations.length ).to.equal( 2 );
		} );

		it( 'should be chainable', () => {
			chain = batch.move( range, new Position( root, [ 1, 3 ] ) );

			expect( chain ).to.equal( batch );
		} );
	} );
} );
