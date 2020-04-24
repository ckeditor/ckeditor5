/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import MergeOperation from '../../../src/model/operation/mergeoperation';
import SplitOperation from '../../../src/model/operation/splitoperation';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'MergeOperation', () => {
	let model, doc, root, gy, gyPos;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
		gyPos = new Position( gy, [ 0 ] );
	} );

	it( 'should have proper type', () => {
		const merge = new MergeOperation( new Position( root, [ 1, 0 ] ), 2, new Position( root, [ 0, 1 ] ), gyPos, 1 );

		expect( merge.type ).to.equal( 'merge' );
	} );

	it( 'should have proper deletionPosition', () => {
		const merge = new MergeOperation( new Position( root, [ 1, 0 ] ), 2, new Position( root, [ 0, 1 ] ), gyPos, 1 );

		expect( merge.deletionPosition.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should have proper movedRange', () => {
		const merge = new MergeOperation( new Position( root, [ 1, 0 ] ), 2, new Position( root, [ 0, 1 ] ), gyPos, 1 );

		expect( merge.movedRange.start.path ).to.deep.equal( [ 1, 0 ] );
		expect( merge.movedRange.end.path ).to.deep.equal( [ 1, Number.POSITIVE_INFINITY ] );
	} );

	it( 'should merge two nodes together', () => {
		const p1 = new Element( 'p1', null, new Text( 'Foo' ) );
		const p2 = new Element( 'p2', null, new Text( 'bar' ) );

		root._insertChild( 0, [ p1, p2 ] );

		model.applyOperation(
			new MergeOperation(
				new Position( root, [ 1, 0 ] ),
				3,
				new Position( root, [ 0, 3 ] ),
				gyPos,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).name ).to.equal( 'p1' );
		expect( p1.maxOffset ).to.equal( 6 );
		expect( p1.getChild( 0 ).data ).to.equal( 'Foobar' );
	} );

	it( 'should create a proper SplitOperation as a reverse', () => {
		const sourcePosition = new Position( root, [ 1, 0 ] );
		const targetPosition = new Position( root, [ 0, 3 ] );

		const operation = new MergeOperation( sourcePosition, 2, targetPosition, gyPos, doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( SplitOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.splitPosition.isEqual( targetPosition ) ).to.be.true;
		expect( reverse.insertionPosition.isEqual( new Position( root, [ 1 ] ) ) ).to.be.true;
		expect( reverse.graveyardPosition.isEqual( gyPos ) ).to.be.true;
	} );

	it( 'should undo merge by applying reverse operation', () => {
		const p1 = new Element( 'p1', null, new Text( 'Foo' ) );
		const p2 = new Element( 'p2', null, new Text( 'bar' ) );

		root._insertChild( 0, [ p1, p2 ] );

		const operation = new MergeOperation(
			new Position( root, [ 1, 0 ] ),
			3,
			new Position( root, [ 0, 3 ] ),
			gyPos,
			doc.version
		);

		model.applyOperation( operation );
		model.applyOperation( operation.getReversed() );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( p1.maxOffset ).to.equal( 3 );
		expect( p1.getChild( 0 ).data ).to.equal( 'Foo' );
		expect( p2.maxOffset ).to.equal( 3 );
		expect( p2.getChild( 0 ).data ).to.equal( 'bar' );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if source position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );
			const p2 = new Element( 'p2', null, new Text( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new Position( root, [ 0, 3 ] ),
				3,
				new Position( root, [ 2, 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /model-position-path-incorrect/, model );
		} );

		it( 'should throw an error if source position is in root', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );
			const p2 = new Element( 'p2', null, new Text( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new Position( root, [ 0 ] ),
				3,
				new Position( root, [ 0, 3 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /merge-operation-source-position-invalid/, model );
		} );

		it( 'should throw an error if target position is in root', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );
			const p2 = new Element( 'p2', null, new Text( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new Position( root, [ 0, 3 ] ),
				3,
				new Position( root, [ 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /merge-operation-target-position-invalid/, model );
		} );

		it( 'should throw an error if target position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );
			const p2 = new Element( 'p2', null, new Text( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new Position( root, [ 2, 3 ] ),
				3,
				new Position( root, [ 1, 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /model-position-path-incorrect/, model );
		} );

		it( 'should throw an error if number of nodes to move is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );
			const p2 = new Element( 'p2', null, new Text( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new Position( root, [ 0, 3 ] ),
				5,
				new Position( root, [ 1, 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /merge-operation-how-many-invalid/, model );
		} );
	} );

	it( 'should create MergeOperation with the same parameters when cloned', () => {
		const sourcePosition = new Position( root, [ 1, 0 ] );
		const targetPosition = new Position( root, [ 0, 3 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new MergeOperation( sourcePosition, howMany, targetPosition, gyPos, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.equal( op );

		expect( clone ).to.be.instanceof( MergeOperation );
		expect( clone.sourcePosition.isEqual( sourcePosition ) ).to.be.true;
		expect( clone.targetPosition.isEqual( targetPosition ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.graveyardPosition.isEqual( gyPos ) ).to.be.true;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const sourcePosition = new Position( root, [ 1, 0 ] );
			const targetPosition = new Position( root, [ 0, 3 ] );
			const op = new MergeOperation( sourcePosition, 1, targetPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'MergeOperation',
				baseVersion: 0,
				howMany: 1,
				sourcePosition: op.sourcePosition.toJSON(),
				targetPosition: op.targetPosition.toJSON(),
				graveyardPosition: gyPos.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper MergeOperation from json object', () => {
			const sourcePosition = new Position( root, [ 1, 0 ] );
			const targetPosition = new Position( root, [ 0, 3 ] );
			const op = new MergeOperation( sourcePosition, 1, targetPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			const deserialized = MergeOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
