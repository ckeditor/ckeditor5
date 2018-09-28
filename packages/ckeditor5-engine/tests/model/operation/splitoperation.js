/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import SplitOperation from '../../../src/model/operation/splitoperation';
import MergeOperation from '../../../src/model/operation/mergeoperation';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'SplitOperation', () => {
	let model, doc, root, gy, gyPos;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
		gyPos = new Position( gy, [ 0 ] );
	} );

	it( 'should have proper type', () => {
		const position = new Position( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		const split = new SplitOperation( position, 2, insertionPosition, null, 1 );

		expect( split.type ).to.equal( 'split' );
	} );

	it( 'should have proper insertionPosition', () => {
		const position = new Position( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		const split = new SplitOperation( position, 2, insertionPosition, null, 1 );

		expect( split.insertionPosition.path ).to.deep.equal( [ 2 ] );
	} );

	it( 'should have proper moveTargetPosition', () => {
		const position = new Position( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		const split = new SplitOperation( position, 2, insertionPosition, null, 1 );

		expect( split.moveTargetPosition.path ).to.deep.equal( [ 2, 0 ] );
	} );

	it( 'should have proper movedRange', () => {
		const position = new Position( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		const split = new SplitOperation( position, 2, insertionPosition, null, 1 );

		expect( split.movedRange.start.path ).to.deep.equal( [ 1, 3 ] );
		expect( split.movedRange.end.path ).to.deep.equal( [ 1, Number.POSITIVE_INFINITY ] );
	} );

	it( 'should split an element', () => {
		const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

		root._insertChild( 0, [ p1 ] );

		const position = new Position( root, [ 0, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		model.applyOperation( new SplitOperation( position, 3, insertionPosition, null, doc.version ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).name ).to.equal( 'p1' );
		expect( root.getChild( 1 ).name ).to.equal( 'p1' );

		expect( p1.maxOffset ).to.equal( 3 );
		expect( p1.getChild( 0 ).data ).to.equal( 'Foo' );

		expect( root.getChild( 1 ).maxOffset ).to.equal( 3 );
		expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'bar' );
	} );

	it( 'should split an element using graveyard element', () => {
		const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );
		const p2 = new Element( 'p2' );

		root._insertChild( 0, [ p1 ] );
		gy._insertChild( 0, [ p2 ] );

		const position = new Position( root, [ 0, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		model.applyOperation( new SplitOperation( position, 3, insertionPosition, gyPos, doc.version ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).name ).to.equal( 'p1' );
		expect( root.getChild( 1 ).name ).to.equal( 'p2' );

		expect( p1.maxOffset ).to.equal( 3 );
		expect( p1.getChild( 0 ).data ).to.equal( 'Foo' );

		expect( root.getChild( 1 ).maxOffset ).to.equal( 3 );
		expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'bar' );

		expect( gy.maxOffset ).to.equal( 0 );
	} );

	it( 'should create a proper MergeOperation as a reverse', () => {
		const position = new Position( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		const operation = new SplitOperation( position, 3, insertionPosition, null, doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( MergeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 3 );
		expect( reverse.sourcePosition.isEqual( new Position( root, [ 2, 0 ] ) ) ).to.be.true;
		expect( reverse.targetPosition.isEqual( new Position( root, [ 1, 3 ] ) ) ).to.be.true;
		expect( reverse.graveyardPosition.isEqual( gyPos ) ).to.be.true;
	} );

	it( 'should undo split by applying reverse operation', () => {
		const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

		root._insertChild( 0, [ p1 ] );

		const position = new Position( root, [ 0, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );

		const operation = new SplitOperation( position, 3, insertionPosition, null, doc.version );

		model.applyOperation( operation );
		model.applyOperation( operation.getReversed() );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( p1.maxOffset ).to.equal( 6 );
		expect( p1.getChild( 0 ).data ).to.equal( 'Foobar' );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if split position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const position = new Position( root, [ 0, 8 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );

			const operation = new SplitOperation( position, 3, insertionPosition, null, doc.version );

			expect( () => operation._validate() ).to.throw( CKEditorError, /split-operation-position-invalid/ );
		} );

		it( 'should throw an error if split position is in root', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new SplitOperation( new Position( root, [ 1 ] ), 3, new Position( root, [ 2 ] ), null, doc.version );

			expect( () => operation._validate() ).to.throw( CKEditorError, /split-operation-split-in-root/ );
		} );

		it( 'should throw an error if number of nodes to move is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new SplitOperation( new Position( root, [ 0, 2 ] ), 6, new Position( root, [ 1 ] ), null, doc.version );

			expect( () => operation._validate() ).to.throw( CKEditorError, /split-operation-how-many-invalid/ );
		} );

		it( 'should throw an error if graveyard position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new SplitOperation( new Position( root, [ 0, 2 ] ), 4, new Position( root, [ 1 ] ), gyPos, doc.version );

			expect( () => operation._validate() ).to.throw( CKEditorError, /split-operation-graveyard-position-invalid/ );
		} );
	} );

	it( 'should create SplitOperation with the same parameters when cloned #1', () => {
		const position = new Position( root, [ 1, 2 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new SplitOperation( position, howMany, insertionPosition, null, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( SplitOperation );
		expect( clone.splitPosition.isEqual( position ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.insertionPosition.isEqual( insertionPosition ) );
		expect( clone.graveyardPosition ).to.be.null;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	it( 'should create SplitOperation with the same parameters when cloned #2', () => {
		const position = new Position( root, [ 1, 2 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new SplitOperation( position, howMany, insertionPosition, gyPos, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( SplitOperation );
		expect( clone.splitPosition.isEqual( position ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.insertionPosition.isEqual( insertionPosition ) );
		expect( clone.graveyardPosition.isEqual( gyPos ) ).to.be.true;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object #1', () => {
			const position = new Position( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, null, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'SplitOperation',
				baseVersion: 0,
				howMany: 2,
				splitPosition: op.splitPosition.toJSON(),
				insertionPosition: op.insertionPosition.toJSON(),
				graveyardPosition: null
			} );
		} );

		it( 'should create proper json object #2', () => {
			const position = new Position( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'SplitOperation',
				baseVersion: 0,
				howMany: 2,
				splitPosition: op.splitPosition.toJSON(),
				insertionPosition: op.insertionPosition.toJSON(),
				graveyardPosition: op.graveyardPosition.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper SplitOperation from json object #1', () => {
			const position = new Position( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, null, doc.version );

			const serialized = op.toJSON();

			const deserialized = SplitOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );

		it( 'should create proper SplitOperation from json object #2', () => {
			const position = new Position( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			const deserialized = SplitOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
