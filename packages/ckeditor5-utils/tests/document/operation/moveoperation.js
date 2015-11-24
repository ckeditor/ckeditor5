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
			// insert in different spots than move op
			it( 'should not change if origin and destination are different than insert address', () => {
				let transformBy = new InsertOperation(
					new Position( [ 1, 3, 2 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			// insert inside moved node
			it( 'should not change if insert was inside moved sub-tree', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 2, 3, 1 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			// insert before to moved node
			it( 'should increment origin offset if insert was in the same parent but before moved node', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 2, 0 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			// insert after to moved node
			it( 'should not increment offset if insert was in the same parent but after moved node', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 2, 6 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			// insert next to a path to moved node
			it( 'should update origin path if insert was before a node from that path', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 0 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.sourcePosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not update origin path if insert was after a node from that path', () => {
				let transformBy = new InsertOperation(
					new Position( [ 2, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			// insert before to moved node
			it( 'should increment destination offset if insert was in the same parent but before moved node', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 2 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			// insert after to moved node
			it( 'should not increment destination offset if insert was in the same parent but after moved node', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 4 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			// insert next to a path to moved node
			it( 'should update destination path if insert was before a node from that path', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 0 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not update destination path if insert was after a node from that path', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 6 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should increment destination offset if insert is on the same position and move operation is weaker', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.offset += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should not increment destination offset if insert is on the same position and move operation is stronger', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy, true );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should update destination path if insert is at the same offset and move operation is weaker', () => {
				let transformBy = new InsertOperation(
					new Position( [ 3, 3 ], root ),
					[ nodeA, nodeB ],
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expected.targetPosition.path[ 1 ] += 2;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should be split into two operations if insert was inside the moved range', () => {
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
			it( 'should not get updated', () => {
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
			it( 'should not change if both operations are happening in different parts of tree', () => {
				let transformBy = new MoveOperation(
					new Position( [ 1, 2 ], root ),
					new Position( [ 4, 1, 0 ], root ),
					3,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			describe( 'when incoming move origin node does not and is not contained by on-site move origin node', () => {
				it( 'should increment origin offset if affected by on-site move-to', () => {
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

				it( 'should decrement origin offset if affected by on-site move-out', () => {
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

				it( 'should not decrement origin offset if on-site moved range is after incoming moved range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 2, 9 ], root ),
						new Position( [ 4, 1, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy, true );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update origin path if affected by on-site move-to', () => {
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

				it( 'should not update origin path if on-site moved range is after a node from that path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 3 ], root ),
						new Position( [ 4, 1, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update destination path if affected by on-site move-to', () => {
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

				it( 'should update origin path if affected by on-site move-out', () => {
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

				it( 'should update origin path if affected by on-site move-out', () => {
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

				it( 'should decrement destination offset if affected by on-site move-out', () => {
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

				it( 'should increment destination offset affected by on-site move-to', () => {
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

				it( 'should get split into two operations if on-site move-to was inside incoming move range', () => {
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
			} );

			describe( 'when incoming move origin node sub-tree contains on-site move origin', () => {
				it( 'should increment origin offset if affected by on-site move-to', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 2, 5, 1 ], root ),
						new Position( [ 2, 2, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.sourcePosition.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update origin path if affected by on-site move-to', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 2, 5, 1 ], root ),
						new Position( [ 2, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.sourcePosition.path[ 1 ] += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update destination path if affected by on-site move-to', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 2, 5, 1 ], root ),
						new Position( [ 3, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.targetPosition.path[ 1 ] += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should increment destination offset affected by on-site move-to', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 2, 5, 1 ], root ),
						new Position( [ 3, 3, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.targetPosition.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should get split into two operations if on-site move-to was inside incoming move range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 2, 5, 1 ], root ),
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
			} );

			it( 'should not change if on-site move is from non-affecting position to inside of moved sub-tree', () => {
				let transformBy = new MoveOperation(
					new Position( [ 4, 1, 0 ], root ),
					new Position( [ 2, 2, 5, 1 ], root ),
					2,
					baseVersion
				);

				let transOp = op.getTransformedBy( transformBy );

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'should update origin address if on-site move origin node sub-tree includes incoming move origin node', () => {
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

			it( 'should update destination address if incoming move destination is inside of on-site moved sub-tree', () => {
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

			describe( 'when both move operations\' destinations are inside of moved sub-trees', () => {
				it( 'should be changed to operation reversing site-on move', () => {
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
			} );

			describe( 'when both move operations have same range', () => {
				it( 'should be changed to no-op if incoming operation is weaker', () => {
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

				it( 'should have it\'s origin address changed if incoming operation is stronger', () => {
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
			} );

			describe( 'when incoming range is contained by on-site range', () => {
				it( 'should be changed to no-op if incoming operation is weaker', () => {
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

				it( 'should have it\'s origin address changed if incoming operation has higher site id', () => {
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
			} );

			describe( 'when incoming range intersects on right-side with on-site range', () => {
				it( 'should get shrunk if it is weaker', () => {
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

				it( 'should get split into two operations if it is stronger', () => {
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
			} );

			describe( 'when incoming range intersects on left-side with on-site range', () => {
				it( 'should get shrunk if it has lower site id', () => {
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

				it( 'should get split into two operations (one of them with updated address and offset) if it has higher site id', () => {
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
			} );

			describe( 'when incoming range contains on-site range', () => {
				it( 'should get shrunk if it has lower site id', () => {
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

				it( 'should get split into two operations if it has higher site id', () => {
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

				it( 'should get split into three operations if it has higher site id and on-site destination is inside moved range', () => {
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
		} );
	} );
} );
