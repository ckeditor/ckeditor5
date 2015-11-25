/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */
/* bender-include: ../../_tools/tools.js */
/* global describe, before, beforeEach, it, expect */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/node',
	'document/nodelist',
	'document/operation/insertoperation',
	'document/operation/removeoperation',
	'document/operation/changeoperation',
	'document/operation/moveoperation',
	'document/operation/nooperation',
	'document/position',
	'document/range',
	'document/character',
	'document/nodelist',
	'document/attribute'
);

describe( 'InsertOperation', () => {
	let Document, Node, NodeList, InsertOperation, RemoveOperation, ChangeOperation,
		MoveOperation, NoOperation, Position, Range, Character, Attribute;

	before( () => {
		Document = modules[ 'document/document' ];
		Node = modules[ 'document/node' ];
		NodeList = modules[ 'document/nodelist' ];
		InsertOperation = modules[ 'document/operation/insertoperation' ];
		RemoveOperation = modules[ 'document/operation/removeoperation' ];
		ChangeOperation = modules[ 'document/operation/changeoperation' ];
		MoveOperation = modules[ 'document/operation/moveoperation' ];
		NoOperation = modules[ 'document/operation/nooperation' ];
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Character = modules[ 'document/character' ];
		Attribute = modules[ 'document/attribute' ];
	} );

	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should insert node', () => {
		doc.applyOperation(
			new InsertOperation(
				new Position( [ 0 ], root ),
				new Character( 'x' ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).character ).to.equal( 'x' );
	} );

	it( 'should insert set of nodes', () => {
		doc.applyOperation(
			new InsertOperation(
				new Position( [ 0 ], root ),
				'bar',
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).character ).to.equal( 'b' );
		expect( root.getChild( 1 ).character ).to.equal( 'a' );
		expect( root.getChild( 2 ).character ).to.equal( 'r' );
	} );

	it( 'should insert between existing nodes', () => {
		root.insertChildren( 0, 'xy' );

		doc.applyOperation(
			new InsertOperation(
				new Position( [ 1 ], root ),
				'bar',
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 5 );
		expect( root.getChild( 0 ).character ).to.equal( 'x' );
		expect( root.getChild( 1 ).character ).to.equal( 'b' );
		expect( root.getChild( 2 ).character ).to.equal( 'a' );
		expect( root.getChild( 3 ).character ).to.equal( 'r' );
		expect( root.getChild( 4 ).character ).to.equal( 'y' );
	} );

	it( 'should insert text', () => {
		doc.applyOperation(
			new InsertOperation(
				new Position( [ 0 ], root ),
				[ 'foo', new Character( 'x' ), 'bar' ],
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 7 );
		expect( root.getChild( 0 ).character ).to.equal( 'f' );
		expect( root.getChild( 1 ).character ).to.equal( 'o' );
		expect( root.getChild( 2 ).character ).to.equal( 'o' );
		expect( root.getChild( 3 ).character ).to.equal( 'x' );
		expect( root.getChild( 4 ).character ).to.equal( 'b' );
		expect( root.getChild( 5 ).character ).to.equal( 'a' );
		expect( root.getChild( 6 ).character ).to.equal( 'r' );
	} );

	it( 'should create a remove operation as a reverse', () => {
		let position = new Position( [ 0 ], root );
		let operation = new InsertOperation(
			position,
			[ 'foo', new Character( 'x' ), 'bar' ],
			0
		);

		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.sourcePosition ).to.equal( position );
		expect( reverse.howMany ).to.equal( 7 );
	} );

	it( 'should undo insert node by applying reverse operation', () => {
		let operation = new InsertOperation(
			new Position( [ 0 ], root ),
			new Character( 'x' ),
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 0 );
	} );

	it( 'should undo insert set of nodes by applying reverse operation', () => {
		let operation = new InsertOperation(
			new Position( [ 0 ], root ),
			'bar',
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 0 );
	} );

	it( 'should create operation with the same parameters when cloned', () => {
		let position = new Position( [ 0 ], root );
		let nodeA = new Node();
		let nodeB = new Node();
		let nodes = new NodeList( [ nodeA, nodeB ] );
		let baseVersion = doc.version;

		let op = new InsertOperation( position, nodes, baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( InsertOperation );
		expect( clone.position.isEqual( position ) ).to.be.true;
		expect( clone.nodeList.get( 0 ) ).to.equal( nodeA );
		expect( clone.nodeList.get( 1 ) ).to.equal( nodeB );
		expect( clone.nodeList.length ).to.equal( 2 );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'getTransformedBy', () => {
		let nodeA, nodeB, nodeC, nodeD, position, op, baseVersion, expected;
		let expectOperation;

		beforeEach( () => {
			nodeA = new Node();
			nodeB = new Node();
			nodeC = new Node();
			nodeD = new Node();

			baseVersion = doc.version;

			position = new Position( [ 0, 2, 1 ], root );

			op = new InsertOperation( position, [ nodeA, nodeB ], baseVersion );

			expected = {
				type: InsertOperation,
				position: position.clone(),
				baseVersion: baseVersion + 1
			};

			expectOperation = bender.tools.operations.expectOperation( Position, Range );
		} );

		describe( 'InsertOperation', () => {
			it( 'target at different position: no position update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 1, 3, 2 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset before: increment offset', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 0 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at same offset and is important: increment offset', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 1 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at same offset and is less important: no position update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 1 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset after: no position update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 2 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from path: increment index on path', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 1 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from path: no position update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 6 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'ChangeOperation', () => {
			it( 'no position update', () => {
				let rangeStart = position.clone();
				let rangeEnd = position.clone();
				rangeEnd.offset += 2;

				let transformBy = new ChangeOperation(
					new Range( rangeStart, rangeEnd ),
					null,
					new Attribute( 'foo', 'bar' ),
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'MoveOperation', () => {
			it( 'range and target are different than insert position: no position update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 3, 2 ], root ),
					new Position( [ 2, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range offset is before insert position offset: decrement offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 2, 0 ], root ),
					new Position( [ 1, 1 ], root ),
					1
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset--;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range offset is after insert position offset: no position update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 2, 4 ], root ),
					new Position( [ 1, 1 ], root ),
					1
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before insert position offset: increment offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after insert position offset: no position update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 4 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as insert position offset and is important: increment offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as insert position offset and is less important: no position update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is before node from insert position path: decrement index on path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 0 ], root ),
					new Position( [ 1, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path[ 1 ] -= 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is after node from insert position path: no position update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 4 ], root ),
					new Position( [ 1, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from insert position path: increment index on path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 0 ], root ),
					new Position( [ 0, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from insert position path: no position update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 0 ], root ),
					new Position( [ 0, 4 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range has node that contains insert position: update position', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 1 ], root ),
					new Position( [ 1, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path = [ 1, 2, 1 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range contains insert position (on same level): set position offset to range start', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 2, 0 ], root ),
					new Position( [ 1, 0 ], root ),
					3
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset = 0;

				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'NoOperation', () => {
			it( 'no operation update', () => {
				let transformBy = new NoOperation( baseVersion );

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );
} );
