/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import Position from '/ckeditor5/core/treemodel/position.js';

describe( 'Batch', () => {
	let doc, root, batch, chain, attrs;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		root.insertChildren( 0, 'abc' );

		batch = doc.batch();

		attrs = [
			new Attribute( 'bold', true ),
			new Attribute( 'foo', 'bar' )
		];

		doc.selection.attrs.setTo( attrs );

		chain = batch.weakInsert( new Position( root, [ 2 ] ), 'xyz' );
	} );

	describe( 'insert', () => {
		it( 'should insert given nodes at given position', () => {
			expect( root.getChildCount() ).to.equal( 6 );
			expect( root.getChild( 2 ).character ).to.equal( 'x' );
			expect( root.getChild( 3 ).character ).to.equal( 'y' );
			expect( root.getChild( 4 ).character ).to.equal( 'z' );
		} );

		it( 'should set inserted nodes attributes to same as current selection attributes', () => {
			expect( Array.from( root.getChild( 2 ).attrs ) ).to.deep.equal( attrs );
			expect( Array.from( root.getChild( 3 ).attrs ) ).to.deep.equal( attrs );
			expect( Array.from( root.getChild( 4 ).attrs ) ).to.deep.equal( attrs );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );
	} );
} );
