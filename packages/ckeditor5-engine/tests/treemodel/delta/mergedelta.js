/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'Batch', () => {
	let doc, root, p1, p2;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		p1 = new Element( 'p', { key1: 'value1' }, 'foo' );
		p2 = new Element( 'p', { key2: 'value2' }, 'bar' );

		root.insertChildren( 0, [ p1, p2 ] );
	} );

	describe( 'merge', () => {
		it( 'should merge foo and bar into foobar', () => {
			doc.batch().merge( new Position( root, [ 1 ] ) );

			expect( root.getChildCount() ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).getChildCount() ).to.equal( 6 );
			expect( root.getChild( 0 )._attrs.size ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key1' ) ).to.equal( 'value1' );
			expect( root.getChild( 0 ).getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 0 ).getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 0 ).getChild( 2 ).character ).to.equal( 'o' );
			expect( root.getChild( 0 ).getChild( 3 ).character ).to.equal( 'b' );
			expect( root.getChild( 0 ).getChild( 4 ).character ).to.equal( 'a' );
			expect( root.getChild( 0 ).getChild( 5 ).character ).to.equal( 'r' );
		} );

		it( 'should throw if there is no element after', () => {
			expect( () => {
				doc.batch().merge( new Position( root, [ 2 ] ) );
			} ).to.throw( CKEditorError, /^batch-merge-no-element-after/ );
		} );

		it( 'should throw if there is no element before', () => {
			expect( () => {
				doc.batch().merge( new Position( root, [ 0, 2 ] ) );
			} ).to.throw( CKEditorError, /^batch-merge-no-element-before/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.merge( new Position( root, [ 1 ] ) );
			expect( chain ).to.equal( batch );
		} );
	} );
} );
