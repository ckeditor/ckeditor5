/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Delta from '/ckeditor5/engine/treemodel/delta/delta.js';
import InsertDelta from '/ckeditor5/engine/treemodel/delta/insertdelta.js';

import AttributeOperation from '/ckeditor5/engine/treemodel/operation/attributeoperation.js';
import InsertOperation from '/ckeditor5/engine/treemodel/operation/insertoperation.js';
import MoveOperation from '/ckeditor5/engine/treemodel/operation/moveoperation.js';
import NoOperation from '/ckeditor5/engine/treemodel/operation/nooperation.js';
import ReinsertOperation from '/ckeditor5/engine/treemodel/operation/reinsertoperation.js';
import RemoveOperation from '/ckeditor5/engine/treemodel/operation/removeoperation.js';
import RootAttributeOperation from '/ckeditor5/engine/treemodel/operation/rootattributeoperation.js';

import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

import DeltaFactory from '/ckeditor5/engine/treemodel/delta/deltafactory.js';

import Document from '/ckeditor5/engine/treemodel/document.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import Range from '/ckeditor5/engine/treemodel/range.js';
import { jsonParseStringify } from '/tests/engine/treemodel/_utils/utils.js';

class FooDelta extends Delta {
	static get className() {
		return 'tets.delta.foo';
	}
}

class BarDelta extends Delta {
	static get className() {
		return 'tets.delta.bar';
	}
}

describe( 'DeltaFactory', () => {
	describe( 'fromJSON', () => {
		let delta, root, doc;

		before( () => {
			DeltaFactory.register( FooDelta );
		} );

		beforeEach( () => {
			delta = new FooDelta();

			doc = new Document();
			root = doc.createRoot( 'root' );
		} );

		it( 'should throw error for unregistered delta', () => {
			expect( () => {
				DeltaFactory.fromJSON( jsonParseStringify( new BarDelta() ), {} );
			} ).to.throw( CKEditorError, /^delta-fromjson-no-deserializer/ );
		} );

		it( 'should create delta with AttributeOperation', () => {
			delta.addOperation( new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'foo',
				true,
				null,
				doc.version
			) );

			let deserialized = DeltaFactory.fromJSON( jsonParseStringify( delta ), doc );

			expect( deserialized ).to.deep.equal( delta );
		} );

		it( 'should create delta with InsertOperation', () => {
			delta.addOperation( new InsertOperation(
				new Position( root, [ 0 ] ),
				'x',
				doc.version
			) );

			let deserialized = DeltaFactory.fromJSON( jsonParseStringify( delta ), doc );

			expect( deserialized ).to.deep.equal( delta );
		} );

		it( 'should create delta with MoveOperation', () => {
			delta.addOperation( new MoveOperation(
				new Position( root, [ 0, 0 ] ),
				1,
				new Position( root, [ 1, 0 ] ),
				doc.version
			) );

			let deserialized = DeltaFactory.fromJSON( jsonParseStringify( delta ), doc );

			expect( deserialized ).to.deep.equal( delta );
		} );

		it( 'should create delta with NoOperation', () => {
			delta.addOperation( new NoOperation( 0 ) );

			let deserialized = DeltaFactory.fromJSON( jsonParseStringify( delta ), doc );

			expect( deserialized ).to.deep.equal( delta );
		} );

		it( 'should create delta with ReinsertOperation', () => {
			delta.addOperation( new ReinsertOperation(
				new Position( doc.graveyard, [ 0 ] ),
				2,
				new Position( root, [ 0 ] ),
				doc.version
			) );

			let deserialized = DeltaFactory.fromJSON( jsonParseStringify( delta ), doc );

			expect( deserialized ).to.deep.equal( delta );
		} );

		it( 'should create delta with RemoveOperation', () => {
			delta.addOperation( new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			) );

			let deserialized = DeltaFactory.fromJSON( jsonParseStringify( delta ), doc );

			expect( deserialized ).to.deep.equal( delta );
		} );

		it( 'should create delta with RootAttributeOperation', () => {
			delta.addOperation( new RootAttributeOperation( root, 'key', null, 'newValue', doc.version ) );

			let deserialized = DeltaFactory.fromJSON( jsonParseStringify( delta ), doc );

			expect( deserialized ).to.deep.equal( delta );
		} );

		it( 'should create InsertDelta instance from serialized JSON object', () => {
			let insertDelta = new InsertDelta();
			let serialized = jsonParseStringify( insertDelta );
			let deserialized = DeltaFactory.fromJSON( serialized, doc );

			expect( deserialized ).to.be.instanceOf( InsertDelta );
			expect( deserialized.operations ).to.have.length( 0 );
		} );
	} );

	describe( 'register', () => {
		it( 'should add delta deserializer', ( done ) => {
			class SomeDelta {
				constructor() {
					done();
				}

				static get className() {
					return 'foo';
				}
			}

			DeltaFactory.register( SomeDelta );

			DeltaFactory.fromJSON( { __className: 'foo', operations: [] } );
		} );
	} );
} );
