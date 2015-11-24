/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/position',
	'document/range',
	'document/attribute',
	'document/operation/nooperation',
	'document/operation/insertoperation',
	'document/operation/changeoperation',
	'document/operation/moveoperation'
);

describe( 'NoOperation', () => {
	let Document, Position, Range, Attribute, NoOperation, InsertOperation, ChangeOperation, MoveOperation;

	before( function() {
		Document = modules[ 'document/document' ];
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Attribute = modules[ 'document/attribute' ];
		NoOperation = modules[ 'document/operation/nooperation' ];
		InsertOperation = modules[ 'document/operation/insertoperation' ];
		ChangeOperation = modules[ 'document/operation/changeoperation' ];
		MoveOperation = modules[ 'document/operation/moveoperation' ];
	} );

	let noop, doc, root;

	beforeEach( () => {
		noop = new NoOperation( 0 );
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	function expectNoTransformation( noop, transformBy ) {
		const transOp = noop.getTransformedBy( transformBy );

		expect( transOp ).to.be.instanceof( NoOperation );
		expect( transOp.baseVersion ).to.equal( 0 );
	}

	it( 'should not throw an error when applied', () => {
		expect( () => doc.applyOperation( noop ) ).to.not.throw( Error );
	} );

	it( 'should create a do-nothing operation as a reverse', () => {
		const reverse = noop.getReversed();

		expect( reverse ).to.be.an.instanceof( NoOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
	} );

	it( 'should create a do-nothing operation having same parameters when cloned', () => {
		const clone = noop.clone();

		expect( clone ).to.be.an.instanceof( NoOperation );
		expect( clone.baseVersion ).to.equal( 0 );
	} );

	it( 'should not change when transformed by InsertOperation', () => {
		const transformBy = new InsertOperation( new Position( [ 0 ], root ), 'abc', 0 );

		expectNoTransformation( noop, transformBy );
	} );

	it( 'should not change when transformed by ChangeOperation', () => {
		const transformBy = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
			null,
			new Attribute( 'foo', 'bar' ),
			0
		);

		expectNoTransformation( noop, transformBy );
	} );

	it( 'should not change when transformed by MoveOperation', () => {
		const transformBy = new MoveOperation(
			new Position( [ 0 ], root ),
			new Position( [ 1 ], root ),
			4,
			0
		);

		expectNoTransformation( noop, transformBy );
	} );

	it( 'should not change when transformed by NoOperation', () => {
		const transformBy = new NoOperation( 0 );
		expectNoTransformation( noop, transformBy );
	} );
} );
