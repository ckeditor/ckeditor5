/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import ReinsertOperation from '/ckeditor5/core/treemodel/operation/reinsertoperation.js';
import RemoveOperation from '/ckeditor5/core/treemodel/operation/removeoperation.js';
import MoveOperation from '/ckeditor5/core/treemodel/operation/moveoperation.js';
import Position from '/ckeditor5/core/treemodel/position.js';

describe( 'RemoveOperation', () => {
	let doc, root, graveyard;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		graveyard = doc.graveyard;
	} );

	it( 'should have proper type', () => {
		const op = new RemoveOperation(
			new Position( root, [ 2 ] ),
			2,
			doc.version
		);

		expect( op.type ).to.equal( 'remove' );
	} );

	it( 'should extend MoveOperation class', () => {
		let operation = new RemoveOperation(
			new Position( root, [ 2 ] ),
			2,
			doc.version
		);

		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should remove set of nodes and append them to graveyard root', () => {
		root.insertChildren( 0, 'fozbar' );

		let z = root.getChild( 2 );
		let b = root.getChild( 3 );
		let a = root.getChild( 4 );

		doc.applyOperation(
			new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 4 );
		expect( root.getChild( 2 ) ).to.equal( a );

		expect( graveyard.getChildCount() ).to.equal( 2 );
		expect( graveyard.getChild( 0 ) ).to.equal( z );
		expect( graveyard.getChild( 1 ) ).to.equal( b );
	} );

	it( 'should create RemoveOperation with same parameters when cloned', () => {
		let pos = new Position( root, [ 2 ] );

		let operation = new RemoveOperation( pos, 2, doc.version );
		let clone = operation.clone();

		expect( clone ).to.be.instanceof( RemoveOperation );
		expect( clone.sourcePosition.isEqual( pos ) ).to.be.true;
		expect( clone.howMany ).to.equal( operation.howMany );
		expect( clone.baseVersion ).to.equal( operation.baseVersion );
	} );

	it( 'should create a ReinsertOperation as a reverse', () => {
		let position = new Position( root, [ 0 ] );
		let operation = new RemoveOperation( position, 2, 0 );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( ReinsertOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition.isEqual( operation.targetPosition ) ).to.be.true;
		expect( reverse.targetPosition.isEqual( position ) ).to.be.true;
	} );

	it( 'should undo remove set of nodes by applying reverse operation', () => {
		let position = new Position( root, [ 0 ] );
		let operation = new RemoveOperation( position, 3, 0 );
		let reverse = operation.getReversed();

		root.insertChildren( 0, 'bar' );

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 0 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).character ).to.equal( 'b' );
		expect( root.getChild( 1 ).character ).to.equal( 'a' );
		expect( root.getChild( 2 ).character ).to.equal( 'r' );
	} );
} );
