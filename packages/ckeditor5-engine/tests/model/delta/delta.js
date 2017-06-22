/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import count from '@ckeditor/ckeditor5-utils/src/count';
import Delta from '../../../src/model/delta/delta';
import Operation from '../../../src/model/operation/operation';
import AttributeOperation from '../../../src/model/operation/attributeoperation';
import InsertOperation from '../../../src/model/operation/insertoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import NoOperation from '../../../src/model/operation/nooperation';
import ReinsertOperation from '../../../src/model/operation/reinsertoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import RootAttributeOperation from '../../../src/model/operation/rootattributeoperation';
import DeltaFactory from '../../../src/model/delta/deltafactory';
import Document from '../../../src/model/document';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';
import { jsonParseStringify } from '../../../tests/model/_utils/utils';

// Some test examples of operations.
class FooOperation extends Operation {
	constructor( string, baseVersion ) {
		super( baseVersion );
		this.string = string;
	}

	getReversed() {
		return new BarOperation( this.string, this.baseVersion );
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
	describe( 'constructor()', () => {
		it( 'should create an delta with empty properties', () => {
			const delta = new Delta();

			expect( delta ).to.have.property( 'batch' ).that.is.null;
			expect( delta ).to.have.property( 'operations' ).that.a( 'array' ).and.have.length( 0 );
		} );
	} );

	describe( 'baseVersion', () => {
		it( 'should return baseVersion of first operation in the delta', () => {
			const delta = new Delta();

			delta.addOperation( { baseVersion: 0 } );
			delta.addOperation( { baseVersion: 1 } );
			delta.addOperation( { baseVersion: 2 } );

			expect( delta.baseVersion ).to.equal( 0 );
		} );

		it( 'should change baseVersion of it\'s operations', () => {
			const delta = new Delta();

			delta.addOperation( { baseVersion: 0 } );
			delta.addOperation( { baseVersion: 1 } );
			delta.addOperation( { baseVersion: 2 } );

			delta.baseVersion = 10;

			expect( delta.operations[ 0 ].baseVersion ).to.equal( 10 );
			expect( delta.operations[ 1 ].baseVersion ).to.equal( 11 );
			expect( delta.operations[ 2 ].baseVersion ).to.equal( 12 );
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
			const reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( Delta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return Delta with all operations reversed and their order reversed', () => {
			const delta = new Delta();
			delta.addOperation( new FooOperation( 'a', 1 ) );
			delta.addOperation( new BarOperation( 'b', 2 ) );

			const reversed = delta.getReversed();

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
			root = doc.createRoot();
		} );

		it( 'should return JSON representation for empty delta', () => {
			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: []
			} );
		} );

		it( 'should create delta with AttributeOperation', () => {
			const operation = new AttributeOperation(
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
			const operation = new InsertOperation(
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
			const operation = new MoveOperation(
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
			const operation = new NoOperation( 0 );

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with ReinsertOperation', () => {
			const operation = new ReinsertOperation(
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
			const operation = new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				new Position( doc.graveyard, [ 0 ] ),
				doc.version
			);

			delta.addOperation( operation );

			expect( jsonParseStringify( delta ) ).to.deep.equal( {
				__className: FooDelta.className,
				operations: [ jsonParseStringify( operation ) ]
			} );
		} );

		it( 'should create delta with RootAttributeOperation', () => {
			const operation = new RootAttributeOperation( root, 'key', null, 'newValue', doc.version );

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
