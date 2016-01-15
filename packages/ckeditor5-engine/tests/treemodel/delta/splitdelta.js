/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'Batch', () => {
	let doc, root, p;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		p = new Element( 'p', [ new Attribute( 'key', 'value' ) ], 'foobar' );

		root.insertChildren( 0, p );
	} );

	describe( 'split', () => {
		it( 'should split foobar to foo and bar', () => {
			doc.batch().split( new Position( root, [ 0, 3 ] ) );

			expect( root.getChildCount() ).to.equal( 2 );

			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).getChildCount() ).to.equal( 3 );
			expect( root.getChild( 0 ).attrs.size ).to.equal( 1 );
			expect( root.getChild( 0 ).attrs.getValue( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 0 ).getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 0 ).getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 0 ).getChild( 2 ).character ).to.equal( 'o' );

			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).getChildCount() ).to.equal( 3 );
			expect( root.getChild( 1 ).attrs.size ).to.equal( 1 );
			expect( root.getChild( 1 ).attrs.getValue( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 1 ).getChild( 0 ).character ).to.equal( 'b' );
			expect( root.getChild( 1 ).getChild( 1 ).character ).to.equal( 'a' );
			expect( root.getChild( 1 ).getChild( 2 ).character ).to.equal( 'r' );
		} );

		it( 'should create an empty paragraph if we split at the end', () => {
			doc.batch().split( new Position( root, [ 0, 6 ] ) );

			expect( root.getChildCount() ).to.equal( 2 );

			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).getChildCount() ).to.equal( 6 );
			expect( root.getChild( 0 ).attrs.size ).to.equal( 1 );
			expect( root.getChild( 0 ).attrs.getValue( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 0 ).getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 0 ).getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 0 ).getChild( 2 ).character ).to.equal( 'o' );
			expect( root.getChild( 0 ).getChild( 3 ).character ).to.equal( 'b' );
			expect( root.getChild( 0 ).getChild( 4 ).character ).to.equal( 'a' );
			expect( root.getChild( 0 ).getChild( 5 ).character ).to.equal( 'r' );

			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).getChildCount() ).to.equal( 0 );
			expect( root.getChild( 1 ).attrs.size ).to.equal( 1 );
			expect( root.getChild( 1 ).attrs.getValue( 'key' ) ).to.equal( 'value' );
		} );

		it( 'should throw if we try to split a root', () => {
			expect( () => {
				doc.batch().split( new Position( root, [ 0 ] ) );
			} ).to.throw( CKEditorError, /^batch-split-root/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.split( new Position( root, [ 0, 3 ] ) );
			expect( chain ).to.equal( batch );
		} );
	} );
} );
