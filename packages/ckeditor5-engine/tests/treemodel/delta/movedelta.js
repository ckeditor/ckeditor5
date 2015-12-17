/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */
/* bender-include: ../../_tools/tools.js */

'use strict';

const getNodesAndText = bender.tools.treemodel.getNodesAndText;

const modules = bender.amd.require(
	'treemodel/document',
	'treemodel/position',
	'treemodel/range',
	'treemodel/element',
	'ckeditorerror'
);

describe( 'Batch', () => {
	let Document, Position, Range, Element, CKEditorError;

	let doc, root, div, p, batch, chain;

	before( () => {
		Document = modules[ 'treemodel/document' ];
		Position = modules[ 'treemodel/position' ];
		Range = modules[ 'treemodel/range' ];
		Element = modules[ 'treemodel/element' ];
		CKEditorError = modules.ckeditorerror;
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
	} );

	describe( 'move', () => {
		it( 'should move specified node', () => {
			batch.move( div, new Position( root, [ 2 ] ) );

			expect( root.getChildCount() ).to.equal( 2 );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 1 ) ) ) ).to.equal( 'foPhhhhPobPggggPar' );
		} );

		it( 'should move flat range of nodes', () => {
			let range = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 7 ] ) );
			batch.move( range, new Position( root, [ 1, 3 ] ) );

			expect( getNodesAndText( Range.createFromElement( root.getChild( 0 ) ) ) ).to.equal( 'foPhhhhPr' );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 1 ) ) ) ).to.equal( 'abcobPggggPaxyz' );
		} );

		it( 'should throw if given range is not flat', () => {
			let notFlatRange = new Range( new Position( root, [ 0, 2, 2 ] ), new Position( root, [ 0, 6 ] ) );

			expect( () => {
				doc.batch().move( notFlatRange, new Position( root, [ 1, 3 ] ) );
			} ).to.throw( CKEditorError, /^batch-move-range-not-flat/ );
		} );

		it( 'should be chainable', () => {
			chain = batch.move( div, new Position( root, [ 1, 3 ] ) );

			expect( chain ).to.equal( batch );
		} );
	} );
} );
