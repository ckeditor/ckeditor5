/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import SplitOperation from '../../../src/model/operation/splitoperation';
import MergeOperation from '../../../src/model/operation/mergeoperation';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

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
		const split = new SplitOperation( new Position( root, [ 1, 3 ] ), 2, null, 1 );

		expect( split.type ).to.equal( 'split' );
	} );

	it( 'should have proper insertionPosition', () => {
		const split = new SplitOperation( new Position( root, [ 1, 3 ] ), 2, null, 1 );

		expect( split.insertionPosition.path ).to.deep.equal( [ 2 ] );
	} );

	it( 'should have proper moveTargetPosition', () => {
		const split = new SplitOperation( new Position( root, [ 1, 3 ] ), 2, null, 1 );

		expect( split.moveTargetPosition.path ).to.deep.equal( [ 2, 0 ] );
	} );

	it( 'should have proper movedRange', () => {
		const split = new SplitOperation( new Position( root, [ 1, 3 ] ), 2, null, 1 );

		expect( split.movedRange.start.path ).to.deep.equal( [ 1, 3 ] );
		expect( split.movedRange.end.path ).to.deep.equal( [ 1, Number.POSITIVE_INFINITY ] );
	} );

	it( 'should split an element', () => {
		const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

		root._insertChild( 0, [ p1 ] );

		model.applyOperation( new SplitOperation( new Position( root, [ 0, 3 ] ), 3, null, doc.version ) );

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

		model.applyOperation( new SplitOperation( new Position( root, [ 0, 3 ] ), 3, gyPos, doc.version ) );

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
		const operation = new SplitOperation( new Position( root, [ 1, 3 ] ), 3, null, doc.version );
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

		const operation = new SplitOperation( new Position( root, [ 0, 3 ] ), 3, null, doc.version );

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

			const operation = new SplitOperation( new Position( root, [ 0, 8 ] ), 3, null, doc.version );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-position-invalid/, model );
		} );

		it( 'should throw an error if split position is in root', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new SplitOperation( new Position( root, [ 0, 0 ] ), 3, null, doc.version );
			operation.splitPosition = new Position( root, [ 1 ] );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-split-in-root/, model );
		} );

		it( 'should throw an error if number of nodes to move is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new SplitOperation( new Position( root, [ 0, 2 ] ), 6, null, doc.version );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-how-many-invalid/, model );
		} );

		it( 'should throw an error if graveyard position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new SplitOperation( new Position( root, [ 0, 2 ] ), 4, gyPos, doc.version );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-graveyard-position-invalid/, model );
		} );
	} );

	it( 'should create SplitOperation with the same parameters when cloned #1', () => {
		const position = new Position( root, [ 1, 2 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new SplitOperation( position, howMany, null, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.equal( op );

		expect( clone ).to.be.instanceof( SplitOperation );
		expect( clone.splitPosition.isEqual( position ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.insertionPosition.isEqual( op.insertionPosition ) );
		expect( clone.graveyardPosition ).to.be.null;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	it( 'should create SplitOperation with the same parameters when cloned #2', () => {
		const position = new Position( root, [ 1, 2 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new SplitOperation( position, howMany, gyPos, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.equal( op );

		expect( clone ).to.be.instanceof( SplitOperation );
		expect( clone.splitPosition.isEqual( position ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.insertionPosition.isEqual( op.insertionPosition ) );
		expect( clone.graveyardPosition.isEqual( gyPos ) ).to.be.true;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object #1', () => {
			const position = new Position( root, [ 0, 3 ] );
			const op = new SplitOperation( position, 2, null, doc.version );

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
			const op = new SplitOperation( position, 2, gyPos, doc.version );

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
			const op = new SplitOperation( position, 2, null, doc.version );

			const serialized = op.toJSON();

			const deserialized = SplitOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );

		it( 'should create proper SplitOperation from json object #2', () => {
			const position = new Position( root, [ 0, 3 ] );
			const op = new SplitOperation( position, 2, gyPos, doc.version );

			const serialized = op.toJSON();

			const deserialized = SplitOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
