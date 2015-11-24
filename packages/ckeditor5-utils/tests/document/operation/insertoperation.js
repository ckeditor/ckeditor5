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
			it( 'should not change when positions are different', () => {
				let transformBy = new InsertOperation(
					new Position( [ 1, 3, 2 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should increment offset if addresses are same and offset is after applied operation', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 0 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should increment offset if positions are same and operation to transform is weaker', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 1 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not increment offset if positions are same and operation to transform is stronger', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 1 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not increment offset if addresses are same and offset is before applied operation', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 2, 2 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', () => {
				let transformBy = new InsertOperation(
					new Position( [ 0, 1 ], root ),
					[ nodeC, nodeD ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not update address at node(i) if applied operation\'s address was a prefix and its offset is after node(i)', () => {
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
			it( 'should not get updated', () => {
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
			it( 'should not change if insert is in different path than move origin and destination', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 3, 2 ], root ),
					new Position( [ 2, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should have it\'s address merged with destination address if insert was inside moved node sub-tree', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 1 ], root ),
					new Position( [ 1, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path = [ 1, 2, 1 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should decrement offset if address is same as move origin and insert offset is after moved node offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 2, 0 ], root ),
					new Position( [ 1, 1 ], root ),
					1
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset--;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not decrement offset if address is same as move origin and insert offset is after moved node offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 2, 4 ], root ),
					new Position( [ 1, 1 ], root ),
					1
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should increment offset if address is same as move destination and insert offset is after move-to offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not increment offset if address is same as move destination and insert offset is before move-to offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 4 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should increment offset if position is same as move operation and insert operation is weaker', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not increment offset if position is same as move operation and insert operation is stronger', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 1 ], root ),
					new Position( [ 0, 2, 1 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should update address if moved node is before a node from insert path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 0 ], root ),
					new Position( [ 1, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path[ 1 ] -= 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not update address if moved node is after a node from insert path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 0, 4 ], root ),
					new Position( [ 1, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should update address if move-in destination is before a node from insert path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 0 ], root ),
					new Position( [ 0, 0 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );
				expected.position.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not update address if move-in destination after a node from insert path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 0 ], root ),
					new Position( [ 0, 4 ], root ),
					2
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should decrement offset if address is same as move origin and insert offset is in the middle of moved range', () => {
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
			it( 'should not get updated', () => {
				let transformBy = new NoOperation( baseVersion );

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );
} );
