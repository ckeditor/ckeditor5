/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Position from '/ckeditor5/core/treemodel/position.js';

describe( 'Batch', () => {
	let doc, root, batch, p, ul, chain;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		root.insertChildren( 0, 'abc' );

		batch = doc.batch();

		p = new Element( 'p' );
		ul = new Element( 'ul' );

		chain = batch.insert( new Position( root, [ 2 ] ), [ p, ul ] );
	} );

	describe( 'insert', () => {
		it( 'should insert given nodes at given position', () => {
			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 2 ) ).to.equal( p );
			expect( root.getChild( 3 ) ).to.equal( ul );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );
	} );
} );
