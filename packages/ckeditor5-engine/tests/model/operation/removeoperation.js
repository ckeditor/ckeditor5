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

describe( 'RemoveOperation', () => {
	let model, doc, root, graveyard;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		graveyard = doc.graveyard;
	} );

	it( 'should have proper type', () => {
		const op = new RemoveOperation(
			new Position( root, [ 2 ] ),
			2,
			new Position( doc.graveyard, [ 0 ] ),
			doc.version
		);

		expect( op.type ).to.equal( 'remove' );
	} );

	it( 'should extend MoveOperation class', () => {
		const operation = new RemoveOperation(
			new Position( root, [ 2 ] ),
			2,
			new Position( doc.graveyard, [ 0 ] ),
			doc.version
		);

		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should be able to remove set of nodes and append them to graveyard root', () => {
		root._insertChild( 0, new Text( 'fozbar' ) );

		model.applyOperation(
			new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 4 );
		expect( root.getChild( 0 ).data ).to.equal( 'foar' );

		expect( graveyard.maxOffset ).to.equal( 2 );
		expect( graveyard.getChild( 0 ).data ).to.equal( 'zb' );
	} );

	it( 'should create RemoveOperation with same parameters when cloned', () => {
		const pos = new Position( root, [ 2 ] );

		const operation = new RemoveOperation( pos, 2, new Position( doc.graveyard, [ 0 ] ), doc.version );
		const clone = operation.clone();

		expect( clone ).to.be.instanceof( RemoveOperation );
		expect( clone.sourcePosition.isEqual( pos ) ).to.be.true;
		expect( clone.targetPosition.isEqual( operation.targetPosition ) ).to.be.true;
		expect( clone.howMany ).to.equal( operation.howMany );
		expect( clone.baseVersion ).to.equal( operation.baseVersion );
	} );

	it( 'should create ReinsertOperation when reversed', () => {
		const position = new Position( root, [ 0 ] );
		const operation = new RemoveOperation( position, 2, new Position( doc.graveyard, [ 0 ] ), 0 );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( ReinsertOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition.isEqual( operation.targetPosition ) ).to.be.true;
		expect( reverse.targetPosition.isEqual( position ) ).to.be.true;
	} );

	it( 'should create correct ReinsertOperation when reversed if source range was in graveyard', () => {
		const operation = new RemoveOperation( new Position( doc.graveyard, [ 2 ] ), 1, new Position( doc.graveyard, [ 0 ] ), 0 );
		const reverse = operation.getReversed();

		expect( reverse.sourcePosition.path ).to.deep.equal( [ 0 ] );
		expect( reverse.targetPosition.path ).to.deep.equal( [ 3 ] );
	} );

	it( 'should undo remove set of nodes by applying reverse operation', () => {
		const position = new Position( root, [ 0 ] );
		const operation = new RemoveOperation( position, 3, new Position( doc.graveyard, [ 0 ] ), 0 );
		const reverse = operation.getReversed();

		root._insertChild( 0, new Text( 'bar' ) );

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 0 );

		model.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( root.getChild( 0 ).data ).to.equal( 'bar' );
	} );

	it( 'should properly remove a node that is already in a graveyard', () => {
		doc.graveyard._appendChild( [ new Element( 'x' ), new Element( 'y' ), new Element( 'z' ) ] );

		const position = new Position( doc.graveyard, [ 2 ] );
		const operation = new RemoveOperation( position, 1, new Position( doc.graveyard, [ 0 ] ), 0 );

		model.applyOperation( operation );

		expect( doc.graveyard.childCount ).to.equal( 3 );
		expect( doc.graveyard.getChild( 0 ).name ).to.equal( 'z' );
		expect( doc.graveyard.getChild( 1 ).name ).to.equal( 'x' );
		expect( doc.graveyard.getChild( 2 ).name ).to.equal( 'y' );
	} );

	describe( '_validate()', () => {
		it( 'should throw when is executed on detached item', () => {
			const docFrag = new DocumentFragment();
			const item = new Element( 'foo' );

			docFrag._appendChild( [ item ] );

			const op = new RemoveOperation(
				new Position( docFrag, [ 0 ] ),
				1,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			);

			expect( () => {
				op._validate();
			} ).to.throw( CKEditorError, /^remove-operation-on-detached-item/ );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const op = new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			);

			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.RemoveOperation',
				baseVersion: 0,
				howMany: 2,
				sourcePosition: jsonParseStringify( op.sourcePosition ),
				targetPosition: jsonParseStringify( op.targetPosition )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper RemoveOperation from json object', () => {
			const op = new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			);

			const serialized = jsonParseStringify( op );
			const deserialized = RemoveOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
