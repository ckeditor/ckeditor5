/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

'use strict';

import count from '/ckeditor5/utils/count.js';
import Delta from '/ckeditor5/engine/model/delta/delta.js';
import Operation from '/ckeditor5/engine/model/operation/operation.js';
import AttributeOperation from '/ckeditor5/engine/model/operation/attributeoperation.js';
import InsertOperation from '/ckeditor5/engine/model/operation/insertoperation.js';
import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';
import NoOperation from '/ckeditor5/engine/model/operation/nooperation.js';
import ReinsertOperation from '/ckeditor5/engine/model/operation/reinsertoperation.js';
import RemoveOperation from '/ckeditor5/engine/model/operation/removeoperation.js';
import RootAttributeOperation from '/ckeditor5/engine/model/operation/rootattributeoperation.js';
import DeltaFactory from '/ckeditor5/engine/model/delta/deltafactory.js';
import Document from '/ckeditor5/engine/model/document.js';
import Position from '/ckeditor5/engine/model/position.js';
import Range from '/ckeditor5/engine/model/range.js';
import { jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

// Some test examples of operations.
class FooOperation extends Operation {
	constructor( string, baseVersion ) {
		super( baseVersion );
		this.string = string;
	}

	getReversed() {
		/* jshint ignore:start */
		return new BarOperation( this.string, this.baseVersion );
		/* jshint ignore:end */
	}
}

class BarOperation extends FooOperation {
	getReversed() {
		return new FooOperation( this.string, this.baseVersion );
	}
}

class FooDelta extends Delta {
	static get className() {
		return 'tets.delta.foo';
	}
}

describe( 'Delta', () => {
	describe( 'constructor', () => {
		it( 'should create an delta with empty properties', () => {
			const delta = new Delta();

			expect( delta ).to.have.property( 'batch' ).that.is.null;
			expect( delta ).to.have.property( 'operations' ).that.a( 'array' ).and.have.length( 0 );
		} );
	} );

	describe( 'addOperation', () => {
		it( 'should add operation to the delta', () => {
			const delta = new Delta();
			const operation = {};

			delta.addOperation( operation );

			expect( delta.operations ).to.have.length( 1 );
			expect( delta.operations[ 0 ] ).to.equal( operation );
		} );

		it( 'should add delta property to the operation', () => {
			const delta = new Delta();
			const operation = {};

			delta.addOperation( operation );

			expect( operation.delta ).to.equal( delta );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over delta operations', () => {
			const delta = new Delta();

			delta.addOperation( {} );
			delta.addOperation( {} );
			delta.addOperation( {} );

			const totalNumber = count( delta.operations );

			expect( totalNumber ).to.equal( 3 );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty Delta if there are no operations in delta', () => {
			const delta = new Delta();
			let reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( Delta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return Delta with all operations reversed and their order reversed', () => {
			const delta = new Delta();
			delta.addOperation( new FooOperation( 'a', 1 ) );
			delta.addOperation( new BarOperation( 'b', 2 ) );

			let reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( Delta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceOf( FooOperation );
			expect( reversed.operations[ 0 ].string ).to.equal( 'b' );
			expect( reversed.operations[ 1 ] ).to.be.instanceOf( BarOperation );
			expect( reversed.operations[ 1 ].string ).to.equal( 'a' );
		} );
	} );

	describe( 'toJSON', () => {
		let delta, root, doc;

		before( () => {
			DeltaFactory.register( FooDelta );
		} );

		beforeEach( () => {
			delta = new FooDelta();

			doc = new Document();
			root = doc.createRoot( 'root' );
		} );

		it( 'should return JSON representation for empty delta', () => {
			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: []
			} );
		} );

		it( 'should create delta with AttributeOperation', () => {
			let operation = new AttributeOperation(
				new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
				'foo',
				true,
				null,
				doc.version
			);

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with InsertOperation', () => {
			let operation = new InsertOperation(
				new Position( root, [ 0 ] ),
				'x',
				doc.version
			);

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with MoveOperation', () => {
			let operation = new MoveOperation(
				new Position( root, [ 0, 0 ] ),
				1,
				new Position( root, [ 1, 0 ] ),
				doc.version
			);

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with NoOperation', () => {
			let operation = new NoOperation( 0 );

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with ReinsertOperation', () => {
			let operation = new ReinsertOperation(
				new Position( doc.graveyard, [ 0 ] ),
				2,
				new Position( root, [ 0 ] ),
				doc.version
			);

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with RemoveOperation', () => {
			let operation = new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			);

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with RootAttributeOperation', () => {
			let operation = new RootAttributeOperation( root, 'key', null, 'newValue', doc.version );

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should remove batch reference', () => {
			delta.batch = { foo: 'bar' };

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: []
			} );
		} );
	} );
} );
