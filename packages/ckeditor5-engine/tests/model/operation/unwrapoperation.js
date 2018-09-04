/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import UnwrapOperation from '../../../src/model/operation/unwrapoperation';
import WrapOperation from '../../../src/model/operation/wrapoperation';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'UnwrapOperation', () => {
	let model, doc, root, gy, gyPos;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
		gyPos = new Position( gy, [ 0 ] );
	} );

	it( 'should have proper type', () => {
		const unwrap = new UnwrapOperation( new Position( root, [ 1, 0 ] ), 2, gyPos, 1 );

		expect( unwrap.type ).to.equal( 'unwrap' );
	} );

	it( 'should have proper targetPosition', () => {
		const unwrap = new UnwrapOperation( new Position( root, [ 1, 0 ] ), 2, gyPos, 1 );

		expect( unwrap.targetPosition.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should have proper unwrappedRange', () => {
		const unwrap = new UnwrapOperation( new Position( root, [ 1, 0 ] ), 2, gyPos, 1 );

		expect( unwrap.unwrappedRange.start.path ).to.deep.equal( [ 1, 0 ] );
		expect( unwrap.unwrappedRange.end.path ).to.deep.equal( [ 1, 2 ] );
	} );

	it( 'should unwrap an element', () => {
		const bq = new Element( 'blockQuote', null, [
			new Element( 'paragraph', null, new Text( 'Foo' ) ),
			new Element( 'listItem', null, new Text( 'bar' ) )
		] );

		root._insertChild( 0, [ bq ] );

		const operation = new UnwrapOperation( new Position( root, [ 0, 0 ] ), 2, gyPos, doc.version );

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).name ).to.equal( 'paragraph' );
		expect( root.getChild( 1 ).name ).to.equal( 'listItem' );
	} );

	it( 'should create a proper WrapOperation as a reverse', () => {
		const operation = new UnwrapOperation( new Position( root, [ 1, 0 ] ), 2, gyPos, doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( WrapOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.position.isEqual( new Position( root, [ 1 ] ) ) ).to.be.true;
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.element ).to.be.null;
		expect( reverse.graveyardPosition.isEqual( gyPos ) ).to.be.true;
	} );

	it( 'should undo unwrap by applying reverse operation', () => {
		const bq = new Element( 'blockQuote', null, [
			new Element( 'paragraph', null, new Text( 'Foo' ) ),
			new Element( 'listItem', null, new Text( 'bar' ) )
		] );

		root._insertChild( 0, [ bq ] );

		const operation = new UnwrapOperation( new Position( root, [ 0, 0 ] ), 2, gyPos, doc.version );

		model.applyOperation( operation );
		model.applyOperation( operation.getReversed() );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).name ).to.equal( 'blockQuote' );
		expect( root.getChild( 0 ).maxOffset ).to.equal( 2 );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new UnwrapOperation(
				new Position( root, [ 1, 0 ] ),
				3,
				gyPos,
				doc.version
			);

			expect( () => operation._validate() ).to.throw( CKEditorError, /unwrap-operation-position-invalid/ );
		} );

		it( 'should throw an error if number of nodes to unwrap is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new UnwrapOperation(
				new Position( root, [ 0, 0 ] ),
				5,
				gyPos,
				doc.version
			);

			expect( () => operation._validate() ).to.throw( CKEditorError, /unwrap-operation-how-many-invalid/ );
		} );
	} );

	it( 'should create UnwrapOperation with the same parameters when cloned', () => {
		const position = new Position( root, [ 1, 0 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new UnwrapOperation( position, howMany, gyPos, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( UnwrapOperation );
		expect( clone.position.isEqual( position ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.graveyardPosition.isEqual( gyPos ) ).to.be.true;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const position = new Position( root, [ 1, 0 ] );
			const op = new UnwrapOperation( position, 4, gyPos, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'UnwrapOperation',
				baseVersion: 0,
				howMany: 4,
				position: op.position.toJSON(),
				graveyardPosition: gyPos.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper UnwrapOperation from json object', () => {
			const position = new Position( root, [ 1, 0 ] );
			const op = new UnwrapOperation( position, 4, gyPos, doc.version );

			const serialized = op.toJSON();

			const deserialized = UnwrapOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
