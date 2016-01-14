/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import coreTestUtils from '/tests/core/_utils/utils.js';
import Document from '/ckeditor5/core/treemodel/document.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

const getNodesAndText = coreTestUtils.treemodel.getNodesAndText;

describe( 'Batch', () => {
	let doc, root, div, p, batch, chain;

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
