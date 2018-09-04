/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import WrapOperation from '../../../src/model/operation/wrapoperation';
import UnwrapOperation from '../../../src/model/operation/unwrapoperation';
import Position from '../../../src/model/position';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'WrapOperation', () => {
	let model, doc, root, gy, gyPos;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
		gyPos = new Position( gy, [ 0 ] );
	} );

	it( 'should have proper type', () => {
		const wrap = new WrapOperation( new Position( root, [ 1 ] ), 2, new Element( 'paragraph' ), 1 );

		expect( wrap.type ).to.equal( 'wrap' );
	} );

	it( 'should have proper targetPosition', () => {
		const wrap = new WrapOperation( new Position( root, [ 1 ] ), 2, new Element( 'paragraph' ), 1 );

		expect( wrap.targetPosition.path ).to.deep.equal( [ 1, 0 ] );
	} );

	it( 'should have proper wrappedRange', () => {
		const wrap = new WrapOperation( new Position( root, [ 1 ] ), 2, new Element( 'paragraph' ), 1 );

		expect( wrap.wrappedRange.start.path ).to.deep.equal( [ 1 ] );
		expect( wrap.wrappedRange.end.path ).to.deep.equal( [ 3 ] );
	} );

	it( 'should wrap nodes into an element', () => {
		root._insertChild( 0, [
			new Element( 'paragraph', null, new Text( 'Foo' ) ),
			new Element( 'listItem', null, new Text( 'bar' ) )
		] );

		const operation = new WrapOperation( new Position( root, [ 0 ] ), 2, new Element( 'blockQuote' ), doc.version );

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).name ).to.equal( 'blockQuote' );
		expect( root.getChild( 0 ).maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).getChild( 0 ).name ).to.equal( 'paragraph' );
		expect( root.getChild( 0 ).getChild( 1 ).name ).to.equal( 'listItem' );
	} );

	it( 'should wrap nodes into an element from graveyard', () => {
		root._insertChild( 0, [
			new Element( 'paragraph', null, new Text( 'Foo' ) ),
			new Element( 'listItem', null, new Text( 'bar' ) )
		] );

		gy._insertChild( 0, [ new Element( 'blockQuote' ) ] );

		const operation = new WrapOperation( new Position( root, [ 0 ] ), 2, gyPos, doc.version );

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).name ).to.equal( 'blockQuote' );
		expect( root.getChild( 0 ).maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).getChild( 0 ).name ).to.equal( 'paragraph' );
		expect( root.getChild( 0 ).getChild( 1 ).name ).to.equal( 'listItem' );
		expect( gy.maxOffset ).to.equal( 0 );
	} );

	it( 'should create a proper UnwrapOperation as a reverse', () => {
		const operation = new WrapOperation( new Position( root, [ 1 ] ), 2, new Element( 'blockQuote' ), doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( UnwrapOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.position.isEqual( new Position( root, [ 1, 0 ] ) ) ).to.be.true;
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.graveyardPosition.isEqual( gyPos ) ).to.be.true;
	} );

	it( 'should undo wrap by applying reverse operation', () => {
		root._insertChild( 0, [
			new Element( 'paragraph', null, new Text( 'Foo' ) ),
			new Element( 'listItem', null, new Text( 'bar' ) )
		] );

		const operation = new WrapOperation( new Position( root, [ 0 ] ), 2, new Element( 'blockQuote' ), doc.version );

		model.applyOperation( operation );
		model.applyOperation( operation.getReversed() );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).name ).to.equal( 'paragraph' );
		expect( root.getChild( 1 ).name ).to.equal( 'listItem' );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new WrapOperation(
				new Position( root, [ 4 ] ),
				3,
				new Element( 'blockQuote' ),
				doc.version
			);

			expect( () => operation._validate() ).to.throw( CKEditorError, /wrap-operation-position-invalid/ );
		} );

		it( 'should throw an error if number of nodes to wrap is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new WrapOperation(
				new Position( root, [ 0 ] ),
				5,
				new Element( 'blockQuote' ),
				doc.version
			);

			expect( () => operation._validate() ).to.throw( CKEditorError, /wrap-operation-how-many-invalid/ );
		} );

		it( 'should throw an error if graveyard position is invalid', () => {
			const p1 = new Element( 'p1', null, new Text( 'Foo' ) );

			root._insertChild( 0, [ p1 ] );

			const operation = new WrapOperation(
				new Position( root, [ 0 ] ),
				1,
				gyPos,
				doc.version
			);

			expect( () => operation._validate() ).to.throw( CKEditorError, /wrap-operation-graveyard-position-invalid/ );
		} );
	} );

	it( 'should create WrapOperation with the same parameters when cloned #1', () => {
		const position = new Position( root, [ 1, 0 ] );
		const howMany = 4;
		const baseVersion = doc.version;
		const element = new Element( 'blockQuote' );

		const op = new WrapOperation( position, howMany, element, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( WrapOperation );
		expect( clone.position.isEqual( position ) ).to.be.true;
		expect( clone.element ).not.to.equal( element );
		expect( clone.element ).to.deep.equal( element );
		expect( clone.graveyardPosition ).to.be.null;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	it( 'should create WrapOperation with the same parameters when cloned #2', () => {
		const position = new Position( root, [ 1, 0 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new WrapOperation( position, howMany, gyPos, baseVersion );

		const clone = op.clone();

		expect( clone.position.isEqual( position ) ).to.be.true;
		expect( clone.graveyardPosition.isEqual( gyPos ) ).to.be.true;
		expect( clone.element ).to.be.null;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object #1', () => {
			const op = new WrapOperation(
				new Position( root, [ 0 ] ),
				1,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			);

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'WrapOperation',
				baseVersion: 0,
				position: op.position.toJSON(),
				graveyardPosition: op.graveyardPosition.toJSON(),
				howMany: 1
			} );
		} );

		it( 'should create proper serialized object #2', () => {
			const op = new WrapOperation(
				new Position( root, [ 0 ] ),
				1,
				new Element( 'paragraph' ),
				doc.version
			);

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'WrapOperation',
				baseVersion: 0,
				position: op.position.toJSON(),
				element: op.element.toJSON(),
				howMany: 1
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper WrapOperation from json object #1', () => {
			const op = new WrapOperation(
				new Position( root, [ 0 ] ),
				1,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			);

			const serialized = op.toJSON();
			const deserialized = WrapOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );

		it( 'should create proper WrapOperation from json object #2', () => {
			const op = new WrapOperation(
				new Position( root, [ 0 ] ),
				1,
				new Element( 'blockQuote' ),
				doc.version
			);

			const serialized = op.toJSON();
			const deserialized = WrapOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
