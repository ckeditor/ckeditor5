/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Element from '../../../src/model/element';
import WrapOperation from '../../../src/model/operation/wrapoperation';
import Position from '../../../src/model/position';

describe( 'WrapOperation', () => {
	let model, doc, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
	} );

	describe( 'type', () => {
		it( 'should be wrap', () => {
			const op = new WrapOperation(
				new Position( root, [ 0 ] ),
				1,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			);

			expect( op.type ).to.equal( 'wrap' );
		} );
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
				__className: 'engine.model.operation.WrapOperation',
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
				__className: 'engine.model.operation.WrapOperation',
				baseVersion: 0,
				position: op.position.toJSON(),
				element: op.element.toJSON(),
				howMany: 1
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper WrapOperation from json object', () => {
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
	} );
} );
