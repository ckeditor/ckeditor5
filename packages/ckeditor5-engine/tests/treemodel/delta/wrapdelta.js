/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'Batch', () => {
	let doc, root, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		root.insertChildren( 0, 'foobar' );

		range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
	} );

	describe( 'wrap', () => {
		it( 'should wrap flat range with given element', () => {
			let p = new Element( 'p' );
			doc.batch().wrap( range, p );

			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 2 ) ).to.equal( p );
			expect( p.getChild( 0 ).character ).to.equal( 'o' );
			expect( p.getChild( 1 ).character ).to.equal( 'b' );
			expect( root.getChild( 3 ).character ).to.equal( 'a' );
			expect( root.getChild( 4 ).character ).to.equal( 'r' );
		} );

		it( 'should wrap flat range with an element of given name', () => {
			doc.batch().wrap( range, 'p' );

			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 2 ).name ).to.equal( 'p' );
			expect( root.getChild( 2 ).getChild( 0 ).character ).to.equal( 'o' );
			expect( root.getChild( 2 ).getChild( 1 ).character ).to.equal( 'b' );
			expect( root.getChild( 3 ).character ).to.equal( 'a' );
			expect( root.getChild( 4 ).character ).to.equal( 'r' );
		} );

		it( 'should throw if range to wrap is not flat', () => {
			root.insertChildren( 6, [ new Element( 'p', [], 'xyz' ) ] );
			let notFlatRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 6, 2 ] ) );

			expect( () => {
				doc.batch().wrap( notFlatRange, 'p' );
			} ).to.throw( CKEditorError, /^batch-wrap-range-not-flat/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			let p = new Element( 'p', [], 'a' );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-not-empty/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			let p = new Element( 'p' );
			root.insertChildren( 0, p );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-attached/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.wrap( range, 'p' );
			expect( chain ).to.equal( batch );
		} );
	} );
} );
