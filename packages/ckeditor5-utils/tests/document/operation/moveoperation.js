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
	'document/operation/moveoperation',
	'document/operation/insertoperation',
	'document/operation/changeoperation',
	'document/operation/nooperation',
	'document/attribute',
	'document/position',
	'document/range',
	'document/element',
	'document/node',
	'document/nodelist',
	'ckeditorerror'
);

describe( 'MoveOperation', () => {
	let Document, MoveOperation, InsertOperation, ChangeOperation, NoOperation,
		Attribute, Position, Range, Element, Node, NodeList, CKEditorError;

	before( () => {
		Document = modules[ 'document/document' ];
		MoveOperation = modules[ 'document/operation/moveoperation' ];
		InsertOperation = modules[ 'document/operation/insertoperation' ];
		ChangeOperation = modules[ 'document/operation/changeoperation' ];
		NoOperation = modules[ 'document/operation/nooperation' ];
		Attribute = modules[ 'document/attribute' ];
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Element = modules[ 'document/element' ];
		Node = modules[ 'document/node' ];
		NodeList = modules[ 'document/nodelist' ];
		CKEditorError = modules.ckeditorerror;
	} );

	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should move from one node to another', () => {
		let p1 = new Element( 'p1', [], new Element( 'x' ) );
		let p2 = new Element( 'p2' );

		root.insertChildren( 0, [ p1, p2 ] );

		doc.applyOperation(
			new MoveOperation(
				new Position( [ 0, 0 ], root ),
				new Position( [ 1, 0 ], root ),
				1,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 2 );
		expect( root.getChild( 0 ).name ).to.equal( 'p1' );
		expect( root.getChild( 1 ).name ).to.equal( 'p2' );
		expect( p1.getChildCount() ).to.equal( 0 );
		expect( p2.getChildCount() ).to.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.equal( 'x' );
	} );

	it( 'should move position of children in one node backward', () => {
		root.insertChildren( 0, 'xbarx' );

		doc.applyOperation(
			new MoveOperation(
				new Position( [ 2 ], root ),
				new Position( [ 1 ], root ),
				2,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 5 );
		expect( root.getChild( 0 ).character ).to.equal( 'x' );
		expect( root.getChild( 1 ).character ).to.equal( 'a' );
		expect( root.getChild( 2 ).character ).to.equal( 'r' );
		expect( root.getChild( 3 ).character ).to.equal( 'b' );
		expect( root.getChild( 4 ).character ).to.equal( 'x' );
	} );

	it( 'should move position of children in one node forward', () => {
		root.insertChildren( 0, 'xbarx' );

		doc.applyOperation(
			new MoveOperation(
				new Position( [ 1 ], root ),
				new Position( [ 4 ], root ),
				2,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 5 );
		expect( root.getChild( 0 ).character ).to.equal( 'x' );
		expect( root.getChild( 1 ).character ).to.equal( 'r' );
		expect( root.getChild( 2 ).character ).to.equal( 'b' );
		expect( root.getChild( 3 ).character ).to.equal( 'a' );
		expect( root.getChild( 4 ).character ).to.equal( 'x' );
	} );

	it( 'should create a move operation as a reverse', () => {
		let nodeList = new NodeList( 'bar' );

		let sourcePosition = new Position( [ 0 ], root );
		let targetPosition = new Position( [ 4 ], root );

		let operation = new MoveOperation( sourcePosition, targetPosition, nodeList.length, doc.version );

		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( MoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( nodeList.length );
		expect( reverse.sourcePosition.isEqual( targetPosition ) ).to.be.true;
		expect( reverse.targetPosition.isEqual( sourcePosition ) ).to.be.true;
	} );

	it( 'should undo move node by applying reverse operation', () => {
		let p1 = new Element( 'p1', [], new Element( 'x' ) );
		let p2 = new Element( 'p2' );

		root.insertChildren( 0, [ p1, p2 ] );

		let operation = new MoveOperation(
			new Position( [ 0, 0 ], root ),
			new Position( [ 1, 0 ], root ),
			1,
			doc.version
		);

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 2 );
		expect( p1.getChildCount() ).to.equal( 0 );
		expect( p2.getChildCount() ).to.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.equal( 'x' );

		doc.applyOperation( operation.getReversed() );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 2 );
		expect( p1.getChildCount() ).to.equal( 1 );
		expect( p1.getChild( 0 ).name ).to.equal( 'x' );
		expect( p2.getChildCount() ).to.equal( 0 );
	} );

	it( 'should throw an error if number of nodes to move exceeds the number of existing nodes in given element', () => {
		root.insertChildren( 0, 'xbarx' );

		let operation = new MoveOperation(
			new Position( [ 3 ], root ),
			new Position( [ 1 ], root ),
			3,
			doc.version
		);

		expect( () => doc.applyOperation( operation ) ).to.throw( CKEditorError, /operation-move-nodes-do-not-exist/ );
	} );

	it( 'should throw an error if target or source parent-element specified by position does not exist', () => {
		let p = new Element( 'p' );
		p.insertChildren( 0, 'foo' );
		root.insertChildren( 0, [ 'ab', p ] );

		let operation = new MoveOperation(
			new Position( [ 2, 0 ], root ),
			new Position( [ 1 ], root ),
			3,
			doc.version
		);

		root.removeChildren( 2, 1 );

		expect( () => doc.applyOperation( operation ) ).to.throw( CKEditorError, /operation-move-position-invalid/ );
	} );

	it( 'should throw an error if operation tries to move a range between the beginning and the end of that range', () => {
		root.insertChildren( 0, 'xbarx' );

		let operation = new MoveOperation(
			new Position( [ 1 ], root ),
			new Position( [ 2 ], root ),
			3,
			doc.version
		);

		expect( () => doc.applyOperation( operation ) ).to.throw( CKEditorError, /operation-move-range-into-itself/ );
	} );

	it( 'should throw an error if operation tries to move a range into a sub-tree of a node that is in that range', () => {
		let p = new Element( 'p', [], [ new Element( 'p' ) ] );
		root.insertChildren( 0, [ 'ab', p, 'xy' ] );

		let operation = new MoveOperation(
			new Position( [ 1 ], root ),
			new Position( [ 2, 0, 0 ], root ),
			3,
			doc.version
		);

		expect( () => doc.applyOperation( operation ) ).to.throw( CKEditorError, /operation-move-node-into-itself/ );
	} );

	it( 'should not throw an error if operation move a range into a sibling', () => {
		let p = new Element( 'p' );
		root.insertChildren( 0, [ 'ab', p, 'xy' ] );

		let operation = new MoveOperation(
			new Position( [ 1 ], root ),
			new Position( [ 2, 0 ], root ),
			1,
			doc.version
		);

		expect(
			() => {
				doc.applyOperation( operation );
			}
		).not.to.throw();

		expect( root.getChildCount() ).to.equal( 4 );
		expect( p.getChildCount() ).to.equal( 1 );
		expect( p.getChild( 0 ).character ).to.equal( 'b' );
	} );

	it( 'should create operation with the same parameters when cloned', () => {
		let sourcePosition = new Position( [ 0 ], root );
		let targetPosition = new Position( [ 1 ], root );
		let howMany = 4;
		let baseVersion = doc.version;

		let op = new MoveOperation( sourcePosition, targetPosition, howMany, baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( MoveOperation );
		expect( clone.sourcePosition.isEqual( sourcePosition ) ).to.be.true;
		expect( clone.targetPosition.isEqual( targetPosition ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'getTransformedBy', () => {
		let nodeA, nodeB, op, baseVersion, sourcePosition, targetPosition, rangeEnd, howMany, expected;
		let expectOperation;

		beforeEach( () => {
			nodeA = new Node();
			nodeB = new Node();

			baseVersion = doc.version;

			sourcePosition = new Position( [ 2, 2, 4 ], root );
			targetPosition = new Position( [ 3, 3, 3 ], root );
			howMany = 2;

			rangeEnd = sourcePosition.clone();
			rangeEnd.offset += howMany;

			op = new MoveOperation( sourcePosition, targetPosition, howMany, baseVersion );

			expected = {
				type: MoveOperation,
				sourcePosition: sourcePosition.clone(),
				targetPosition: targetPosition.clone(),
				howMany: howMany,
				baseVersion: baseVersion + 1
			};

			expectOperation = bender.tools.operations.expectOperation( Position, Range );
		} );

		describe( 'InsertOperation', () => {
			it( 'target at different position than move range and target: no operation update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 1, 3, 2 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside node from move range: no operation update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 2, 3, 1 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset before range offset: increment range offset', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 2, 0 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset after range offset: no operation update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 2, 6 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from range start path: increment index on range start path', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 0 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from range start path: no operation update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before move target offset: increment target offset', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 2 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after move target offset: no operation update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 4 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from move target position path: increment index on move target position path', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 0 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from move target position path: no operation update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 6 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and is important: increment target offset', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and is less important: no operation update', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and is important: increment target offset', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside move range: split into two operations', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 2, 5 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expect( transOp ).to.be.instanceof( Array );
				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 7 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 1;
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );
		} );

		describe( 'ChangeOperation', () => {
			it( 'no operation update', () => {
				let transformBy = new ChangeOperation(
					new Range( sourcePosition, rangeEnd ),
					new Attribute( 'abc', true ),
					new Attribute( 'abc', false ),
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'MoveOperation', () => {
			it( 'range and target different than transforming range and target: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 2 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					3,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before transforming range start offset: increment range offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 2, 2, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after transforming range start offset: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 2, 2, 7 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range start offset before transforming range start offset: decrement range offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 0 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.offset -= 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range start offset after transforming range start offset: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 9 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from transforming range start path: increment index on range start path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 2, 1 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from transforming range start path: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 2, 5 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range before node from transforming range start path: decrement index on range start path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 0 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.path[ 1 ] -= 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range after node from transforming range start path: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 3 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before transforming target offset: increment target offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 3, 3, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after transforming target offset: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 3, 3, 5 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range offset before transforming target offset: decrement target offset', () => {
				let transformBy = new MoveOperation(
					new Position( [ 3, 3, 0 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.offset -= 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range offset after transforming target offset: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 3, 3, 5 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from transforming target path: increment index on target path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 3, 1 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from transforming target path: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 3, 5 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range before node from transforming target path: decrement index on target path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 3, 0 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.path[ 1 ] -= 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range after node from transforming target path: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 3, 5 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside transforming move range: split into two operations', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 2, 2, 5 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expect( transOp ).to.be.instanceof( Array );
				expect( transOp.length ).to.equal( 2 );

				expected.howMany = 1;
				expected.sourcePosition.offset = 7;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.offset = 4;
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'target inside a node from transforming range: no operation update', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 2, 2, 5, 1 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range has node that contains transforming range: update range path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 1 ], root ),
					new Position( [ 4, 2 ], root ),
					3,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.path = [ 4, 3, 4 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range has node that contains transforming target: update target path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 3, 2 ], root ),
					new Position( [ 0, 1 ], root ),
					3,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.path = [ 0, 2, 3 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside a node from transforming range and vice versa: reverse transform-by operation', () => {
				let transformBy = new MoveOperation(
					new Position( [ 3, 2 ], root ),
					new Position( [ 2, 2, 5, 0 ], root ),
					3,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );
				let reversed = transformBy.getReversed();

				expected.sourcePosition = reversed.sourcePosition;
				expected.targetPosition = reversed.targetPosition;
				expected.howMany = reversed.howMany;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is same as transforming range and is important: convert to NoOperation', () => {
				let transformBy = new MoveOperation(
					op.sourcePosition.clone(),
					new Position( [ 4, 1, 0 ], root ),
					op.howMany,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'range is same as transforming range and is less important: update range path', () => {
				let transformBy = new MoveOperation(
					op.sourcePosition.clone(),
					new Position( [ 4, 1, 0 ], root ),
					op.howMany,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expected.sourcePosition.path = [ 4, 1, 0 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range contains transforming range and is important: convert to NoOperation', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 3 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					4,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'range contains transforming range and is less important: update range path', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 3 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					4,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expected.sourcePosition.path = [ 4, 1, 1 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range intersects on left with transforming range and is important: shrink range', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 3 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.path = [ 2, 2, 3 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range intersects on left with transforming range and is less important: split into two operations', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 3 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expect( transOp ).to.be.instanceof( Array );
				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 3 ];

				expectOperation( transOp[ 0 ], {
					type: MoveOperation,
					sourcePosition: new Position( [ 4, 1, 1 ], root ),
					targetPosition: expected.targetPosition,
					howMany: 1,
					baseVersion: expected.baseVersion
				} );

				expected.howMany = 1;
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on right with transforming range and is important: shrink range', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 5 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range intersects on right with transforming range and is less important: split into two operations', () => {
				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 5 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expect( transOp ).to.be.instanceof( Array );
				expect( transOp.length ).to.equal( 2 );

				expectOperation( transOp[ 0 ], {
					type: MoveOperation,
					sourcePosition: new Position( [ 4, 1, 0 ], root ),
					targetPosition: expected.targetPosition,
					howMany: 1,
					baseVersion: expected.baseVersion
				} );

				expected.howMany = 1;
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range inside transforming range and is important: shrink range', () => {
				op.howMany = 4;

				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 5 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.howMany = 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range inside transforming range and is less important: split into two operations', () => {
				op.howMany = 4;

				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 5 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expect( transOp ).to.be.instanceof( Array );
				expect( transOp.length ).to.equal( 2 );

				expectOperation( transOp[ 0 ], {
					type: MoveOperation,
					sourcePosition: new Position( [ 4, 1, 0 ], root ),
					targetPosition: expected.targetPosition,
					howMany: 2,
					baseVersion: expected.baseVersion
				} );

				expected.howMany = 2;
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range and target inside transforming range and is less important: split into three operations', () => {
				op.howMany = 6;

				let transformBy = new MoveOperation(
					new Position( [ 2, 2, 5 ], root ),
					new Position( [ 2, 2, 9 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expect( transOp ).to.be.instanceof( Array );
				expect( transOp.length ).to.equal( 3 );

				expected.sourcePosition.path = [ 2, 2, 9 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 7 ];
				expected.howMany = 2;
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 3;
				expected.baseVersion++;

				expectOperation( transOp[ 2 ], expected );
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
