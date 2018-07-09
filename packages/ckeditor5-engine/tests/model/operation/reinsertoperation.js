/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import ReinsertOperation from '../../../src/model/operation/reinsertoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import Position from '../../../src/model/position';
import DocumentFragment from '../../../src/model/documentfragment';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { jsonParseStringify } from '../../../tests/model/_utils/utils';

describe( 'ReinsertOperation', () => {
	let model, doc, root, graveyard, operation, graveyardPosition, rootPosition;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		graveyard = doc.graveyard;

		graveyardPosition = new Position( graveyard, [ 0 ] );
		rootPosition = new Position( root, [ 0 ] );

		operation = new ReinsertOperation(
			graveyardPosition,
			2,
			rootPosition,
			doc.version
		);
	} );

	it( 'should have position property equal to the position where node will be reinserted', () => {
		expect( operation.position.isEqual( rootPosition ) ).to.be.true;

		// Setting also works:
		operation.position = new Position( root, [ 1 ] );
		expect( operation.position.isEqual( new Position( root, [ 1 ] ) ) ).to.be.true;
	} );

	it( 'should have proper type', () => {
		expect( operation.type ).to.equal( 'reinsert' );
	} );

	it( 'should extend MoveOperation class', () => {
		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should create ReinsertOperation with same parameters when cloned', () => {
		const clone = operation.clone();

		expect( clone ).to.be.instanceof( ReinsertOperation );
		expect( clone.sourcePosition.isEqual( operation.sourcePosition ) ).to.be.true;
		expect( clone.targetPosition.isEqual( operation.targetPosition ) ).to.be.true;
		expect( clone.howMany ).to.equal( operation.howMany );
		expect( clone.baseVersion ).to.equal( operation.baseVersion );
	} );

	it( 'should create RemoveOperation as a reverse', () => {
		graveyard._appendChild( new Element( 'x' ) );

		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition.isEqual( rootPosition ) ).to.be.true;
		expect( reverse.targetPosition.isEqual( graveyardPosition ) ).to.be.true;
	} );

	it( 'should create correct RemoveOperation when reversed if target position was in graveyard', () => {
		const operation = new ReinsertOperation( new Position( doc.graveyard, [ 0 ] ), 1, new Position( doc.graveyard, [ 3 ] ), 0 );
		const reverse = operation.getReversed();

		expect( reverse.sourcePosition.path ).to.deep.equal( [ 2 ] );
		expect( reverse.targetPosition.path ).to.deep.equal( [ 0 ] );
	} );

	it( 'should undo reinsert set of nodes by applying reverse operation', () => {
		const reverse = operation.getReversed();

		graveyard._insertChild( 0, new Text( 'xx' ) );

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( graveyard.maxOffset ).to.equal( 0 );

		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 0 );
		expect( graveyard.maxOffset ).to.equal( 2 );
	} );

	describe( '_validate()', () => {
		it( 'should throw when target position is not in the document', () => {
			const docFrag = new DocumentFragment();

			graveyard._insertChild( 0, new Text( 'xx' ) );

			operation = new ReinsertOperation(
				graveyardPosition,
				1,
				Position.createAt( docFrag ),
				doc.version
			);

			expect( () => {
				operation._validate();
			} ).to.throw( CKEditorError, /^reinsert-operation-to-detached-parent/ );
		} );

		it( 'should throw when source position is not in the document', () => {
			const docFrag = new DocumentFragment( new Text( 'xx' ) );

			operation = new ReinsertOperation(
				Position.createAt( docFrag ),
				1,
				rootPosition,
				doc.version
			);

			expect( () => {
				operation._validate();
			} ).to.throw( CKEditorError, /^reinsert-operation-on-detached-item/ );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const serialized = jsonParseStringify( operation );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.ReinsertOperation',
				baseVersion: 0,
				howMany: 2,
				sourcePosition: jsonParseStringify( operation.sourcePosition ),
				targetPosition: jsonParseStringify( operation.targetPosition )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper ReinsertOperation from json object', () => {
			const serialized = jsonParseStringify( operation );
			const deserialized = ReinsertOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( operation );
		} );
	} );
} );
