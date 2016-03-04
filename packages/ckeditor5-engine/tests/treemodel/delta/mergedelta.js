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

import MergeDelta from '/ckeditor5/core/treemodel/delta/mergedelta.js';
import SplitDelta from '/ckeditor5/core/treemodel/delta/splitdelta.js';

import MoveOperation from '/ckeditor5/core/treemodel/operation/moveoperation.js';
import RemoveOperation from '/ckeditor5/core/treemodel/operation/removeoperation.js';
import ReinsertOperation from '/ckeditor5/core/treemodel/operation/reinsertoperation.js';

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

describe( 'MergeDelta', () => {
	let mergeDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		mergeDelta = new MergeDelta();
	} );

	describe( 'constructor', () => {
		it( 'should create merge delta with no operations added', () => {
			expect( mergeDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( mergeDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position between merged nodes', () => {
			mergeDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 1, 4 ] ) ) );
			mergeDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 2, 0 ] ), 1 ) );

			expect( mergeDelta.position.root ).to.equal( root );
			expect( mergeDelta.position.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty SplitDelta if there are no operations in delta', () => {
			let reversed = mergeDelta.getReversed();

			expect( reversed ).to.be.instanceof( SplitDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct SplitDelta', () => {
			mergeDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 1, 4 ] ) ) );
			mergeDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 2, 0 ] ), 1 ) );

			let reversed = mergeDelta.getReversed();

			expect( reversed ).to.be.instanceof( SplitDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( ReinsertOperation );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 1 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 2, 0 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 1, 4 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 4 );
			expect( reversed.operations[ 1 ].targetPosition.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );
} );
