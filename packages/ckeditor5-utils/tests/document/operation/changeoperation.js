/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */
/* global describe, before, beforeEach, it, expect */

/* bender-include: ../../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'document/document',
	'document/node',
	'document/operation/changeoperation',
	'document/operation/insertoperation',
	'document/operation/moveoperation',
	'document/operation/nooperation',
	'document/position',
	'document/range',
	'document/character',
	'document/attribute',
	'document/nodelist',
	'document/text',
	'ckeditorerror'
);

describe( 'ChangeOperation', () => {
	let Document, Node, ChangeOperation, InsertOperation, MoveOperation, NoOperation, Position, Range, Character, Attribute, NodeList, Text, CKEditorError;

	before( () => {
		Document = modules[ 'document/document' ];
		Node = modules[ 'document/node' ];
		ChangeOperation = modules[ 'document/operation/changeoperation' ];
		InsertOperation = modules[ 'document/operation/insertoperation' ];
		MoveOperation = modules[ 'document/operation/moveoperation' ];
		NoOperation = modules[ 'document/operation/nooperation' ];
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Character = modules[ 'document/character' ];
		Attribute = modules[ 'document/attribute' ];
		NodeList = modules[ 'document/nodelist' ];
		Text = modules[ 'document/text' ];
		CKEditorError = modules.ckeditorerror;
	} );

	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should insert attribute to the set of nodes', () => {
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 2 ], root ) ),
				null,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 0 );
	} );

	it( 'should add attribute to the existing attributes', () => {
		let newAttr = new Attribute( 'isNew', true );
		let fooAttr = new Attribute( 'foo', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, barAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				null,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should change attribute to the set of nodes', () => {
		let oldAttr = new Attribute( 'isNew', false );
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 2 ], root ) ),
				oldAttr,
				newAttr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( newAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( newAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should change attribute in the middle of existing attributes', () => {
		let fooAttr = new Attribute( 'foo', true );
		let x1Attr = new Attribute( 'x', 1 );
		let x2Attr = new Attribute( 'x', 2 );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, x1Attr, barAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				x1Attr,
				x2Attr,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 3 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( x2Attr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should remove attribute', () => {
		let fooAttr = new Attribute( 'foo', true );
		let xAttr = new Attribute( 'x', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, new Character( 'x', [ fooAttr, xAttr, barAttr ] ) );

		doc.applyOperation(
			new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				xAttr,
				null,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 2 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( root.getChild( 0 ).hasAttr( barAttr ) ).to.be.true;
	} );

	it( 'should create a change operation as a reverse', () => {
		let oldAttr = new Attribute( 'x', 'old' );
		let newAttr = new Attribute( 'x', 'new' );
		let range = new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) );
		let operation = new ChangeOperation( range, oldAttr, newAttr, doc.version );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( ChangeOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.range ).to.equal( range );
		expect( reverse.oldAttr ).to.equal( newAttr );
		expect( reverse.newAttr ).to.equal( oldAttr );
	} );

	it( 'should undo adding attribute by applying reverse operation', () => {
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, 'bar' );

		let operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			null,
			newAttr,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );
		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 0 );
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 0 );
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 0 );
	} );

	it( 'should undo changing attribute by applying reverse operation', () => {
		let oldAttr = new Attribute( 'isNew', false );
		let newAttr = new Attribute( 'isNew', true );

		root.insertChildren( 0, new Text( 'bar', [ oldAttr ] ) );

		let operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			oldAttr,
			newAttr,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( oldAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( oldAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( oldAttr ) ).to.be.true;
	} );

	it( 'should undo remove attribute by applying reverse operation', () => {
		let fooAttr = new Attribute( 'foo', false );

		root.insertChildren( 0, new Text( 'bar', [ fooAttr ] ) );

		let operation = new ChangeOperation(
			new Range( new Position( [ 0 ], root ), new Position( [ 3 ], root ) ),
			fooAttr,
			null,
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( getIteratorCount( root.getChild( 0 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 0 ).hasAttr( fooAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 1 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 1 ).hasAttr( fooAttr ) ).to.be.true;
		expect( getIteratorCount( root.getChild( 2 ).getAttrs() ) ).to.equal( 1 );
		expect( root.getChild( 2 ).hasAttr( fooAttr ) ).to.be.true;
	} );

	it( 'should throw an error when one try to change and the new and old attributes have different keys', () => {
		let fooAttr = new Attribute( 'foo', true );
		let barAttr = new Attribute( 'bar', true );

		root.insertChildren( 0, 'x' );

		expect(
			() => {
				doc.applyOperation(
					new ChangeOperation(
						new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
						fooAttr,
						barAttr,
						doc.version
					)
				);
			}
		).to.throw( CKEditorError, /operation-change-different-keys/ );
	} );

	it( 'should create operation with the same parameters when cloned', () => {
		let range = new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) );
		let oldAttr = new Attribute( 'foo', 'old' );
		let newAttr = new Attribute( 'foo', 'bar' );
		let baseVersion = doc.version;

		let op = new ChangeOperation( range, oldAttr, newAttr, baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( ChangeOperation );
		expect( clone.range.isEqual( range ) ).to.be.true;
		expect( clone.oldAttr.isEqual( oldAttr ) ).to.be.true;
		expect( clone.newAttr.isEqual( newAttr ) ).to.be.true;
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'have conflicting attributes', () => {
		it( 'if it sets an attribute that is removed by the other operation', () => {
			let op = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				new Attribute( 'foo', 'old' ),
				new Attribute( 'foo', 'bar' ),
				doc.version
			);

			let op2 = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				new Attribute( 'foo', 'old' ),
				null,
				doc.version
			);

			let conflicts = op.conflictsAttributesWith( op2 );

			expect( conflicts ).to.be.true;
		} );

		it( 'if it removes an attribute that is set by the other operation', () => {
			let op = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				new Attribute( 'foo', 'old' ),
				null,
				doc.version
			);

			let op2 = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				new Attribute( 'foo', 'old' ),
				new Attribute( 'foo', 'bar' ),
				doc.version
			);

			let conflicts = op.conflictsAttributesWith( op2 );

			expect( conflicts ).to.be.true;
		} );

		it( 'if it sets different value than the other operation', () => {
			let op = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				new Attribute( 'foo', 'old' ),
				new Attribute( 'foo', 'bar' ),
				doc.version
			);

			let op2 = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				new Attribute( 'foo', 'old' ),
				new Attribute( 'foo', 'xyz' ),
				doc.version
			);

			let conflicts = op.conflictsAttributesWith( op2 );

			expect( conflicts ).to.be.true;
		} );

		it( 'if it sets a value for an attribute that is being removed by the operation', () => {
			let op = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				null,
				new Attribute( 'foo', 'bar' ),
				doc.version
			);

			let op2 = new ChangeOperation(
				new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) ),
				new Attribute( 'foo', 'old' ),
				null,
				doc.version
			);

			let conflicts = op.conflictsAttributesWith( op2 );

			expect( conflicts ).to.be.true;
		} );
	} );

	describe( 'getTransformedBy', () => {
		let nodeA, nodeB, start, end, range, oldAttr, newAttr, op, baseVersion, expected;

		beforeEach( () => {
			nodeA = new Node();
			nodeB = new Node();

			baseVersion = doc.version;

			oldAttr = new Attribute( 'foo', 'abc' );
			newAttr = new Attribute( 'foo', 'bar' );

			expected = {
				type: ChangeOperation,
				oldAttr: oldAttr,
				newAttr: newAttr,
				baseVersion: baseVersion + 1
			};
		} );

		function expectOperation( op, params ) {
			for ( let i in params ) {
				if ( params.hasOwnProperty( i ) ) {
					if ( i == 'type' ) {
						expect( op ).to.be.instanceof( params[ i ] );
					}
					else if ( params[ i ] instanceof Array ) {
						expect( op[ i ].length ).to.equal( params[ i ].length );

						for ( let j = 0; j < params[ i ].length; j++ ) {
							expect( op[ i ][ j ] ).to.equal( params[ i ][ j ] );
						}
					} else if ( params[ i ] instanceof Position || params[ i ] instanceof Range ) {
						expect( op[ i ].isEqual( params[ i ] ) ).to.be.true;
					} else {
						expect( op[ i ] ).to.equal( params[ i ] );
					}
				}
			}
		}

		describe( 'single-level range', () => {
			beforeEach( () => {
				start = new Position( [ 0, 2, 1 ], root );
				end = new Position( [ 0, 2, 4 ], root );

				range = new Range( start, end );

				op = new ChangeOperation( range, oldAttr, newAttr, baseVersion );

				expected.range = new Range( start.clone(), end.clone() );
			} );

			describe( 'InsertOperation', () => {
				it( 'should not change when positions are different', () => {
					let transformBy = new InsertOperation(
						new Position( [ 1, 3, 2 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should increment offset if addresses are same and offset is after applied operation', () => {
					let transformBy = new InsertOperation(
						new Position( [ 0, 2, 0 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset += 2;
					expected.range.end.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should increment offset if positions are same', () => {
					let transformBy = new InsertOperation(
						new Position( [ 0, 2, 1 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset += 2;
					expected.range.end.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not increment offset if addresses are same and offset is before applied operation', () => {
					let transformBy = new InsertOperation(
						new Position( [ 0, 2, 6 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', () => {
					let transformBy = new InsertOperation(
						new Position( [ 0, 1 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path[ 1 ] += 2;
					expected.range.end.path[ 1 ] += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not update address at node(i) if applied operation\'s address was a prefix and its offset is after node(i)', () => {
					let transformBy = new InsertOperation(
						new Position( [ 0, 6 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should be split into two operations if insert was inside the range of incoming change operation', () => {
					let transformBy = new InsertOperation(
						new Position( [ 0, 2, 2 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.start.offset = 4;
					expected.range.end.offset = 6;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.offset = op.range.start.offset;
					expected.range.end.offset = 2;
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );
			} );

			describe( 'ChangeOperation', () => {
				it( 'should remain the same if attributes are not conflicting', () => {
					let transformBy = new ChangeOperation(
						range.clone(),
						new Attribute( 'abc', true ),
						new Attribute( 'abc', false ),
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				describe( 'when attributes are conflicting', () => {
					describe( 'when incoming range and on-site range are the same', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformBy = new ChangeOperation(
								range.clone(),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should become do-nothing operation if it is weaker', () => {
							let transformBy = new ChangeOperation(
								range.clone(),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expectOperation( transOp[ 0 ], {
								type: NoOperation,
								baseVersion: baseVersion + 1
							} );
						} );
					} );

					describe( 'when incoming range is contained by on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformRange = range.clone();
							transformRange.start.offset--;
							transformRange.end.offset++;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should become do-nothing operation if it has lower site id', () => {
							let transformRange = range.clone();
							transformRange.start.offset--;
							transformRange.end.offset++;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expectOperation( transOp[ 0 ], {
								type: NoOperation,
								baseVersion: baseVersion + 1
							} );
						} );
					} );

					// [ incoming range   <   ]   on site range >
					describe( 'when incoming range intersects on right-side with on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformRange = range.clone();
							transformRange.start.offset++;
							transformRange.end.offset++;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should get shrunk if it is weaker', () => {
							let transformRange = range.clone();
							transformRange.start.offset++;
							transformRange.end.offset++;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expected.range.end.offset = 2;

							expectOperation( transOp[ 0 ], expected );
						} );
					} );

					// [ on site range   <   ]   incoming range >
					describe( 'when incoming range intersects on left-side with on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformRange = range.clone();
							transformRange.start.offset--;
							transformRange.end.offset--;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should get shrunk if it is weaker', () => {
							let transformRange = range.clone();
							transformRange.start.offset--;
							transformRange.end.offset--;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expected.range.start.offset = 3;

							expectOperation( transOp[ 0 ], expected );
						} );
					} );

					describe( 'when incoming range contains on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformRange = range.clone();
							transformRange.start.offset++;
							transformRange.end.offset--;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should get split if it is weaker', () => {
							let transformRange = range.clone();
							transformRange.start.offset++;
							transformRange.end.offset--;

							let transformBy = new ChangeOperation(
								transformRange,
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expect( transOp ).to.be.instanceof( Array );
							expect( transOp.length ).to.equal( 2 );

							expected.range.end.offset = 2;

							expectOperation( transOp[ 0 ], expected );

							expected.range.start.offset = 3;
							expected.range.end.offset = 4;
							expected.baseVersion++;

							expectOperation( transOp[ 1 ], expected );
						} );
					} );
				} );
			} );

			describe( 'MoveOperation', () => {
				it( 'should not update address or offset if change target is in different path than move origin and destination', () => {
					let transformBy = new MoveOperation(
						new Position( [ 1, 2 ], root ),
						new Position( [ 2, 4 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should have it\'s address merged with destination address if change was inside moved node sub-tree', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 1 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						3,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path = [ 2, 4, 2, 1 ];
					expected.range.end.path = [ 2, 4, 2, 4 ];

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should decrement offset if address is same as move origin and change offset is after moved node offset', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 2, 0 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						1,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset--;
					expected.range.end.offset--;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should increment offset if address is same as move destination and change offset is after move-to offset', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 4, 1 ], root ),
						new Position( [ 0, 2, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset += 2;
					expected.range.end.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update address if moved node is before a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 0 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path[ 1 ] -= 2;
					expected.range.end.path[ 1 ] -= 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not update address if moved node is after a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 4 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update address if move-in destination is before a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 4, 1 ], root ),
						new Position( [ 0, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path[ 1 ] += 2;
					expected.range.end.path[ 1 ] += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not update address if move-in destination is after a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 4, 1 ], root ),
						new Position( [ 0, 4 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should get split into two ranges and one of them have it\'s address merged if change range intersects on right-side with moved range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 2, 2 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						4,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.end.offset -= 2;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 2, 4, 1 ];
					expected.range.end.path = [ 2, 4, 3 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should get split into two ranges and one of them have it\'s address merged if change range intersects on left-side with moved range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 2, 0 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.start.offset -= 1;
					expected.range.end.offset -= 2;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 2, 4, 2 ];
					expected.range.end.path = [ 2, 4, 3 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should get split into two ranges and one of them have it\'s address merged if change range contains moved range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 2, 2 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						1,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.end.offset--;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 2, 4, 1 ];
					expected.range.end.path = [ 2, 4, 2 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should have it\'s address set to destination address and offset updated if change range is same as move range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 2, 1 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						3,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start = new Position( [ 2, 4, 1 ], root );
					expected.range.end = new Position( [ 2, 4, 4 ], root );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should get split into two ranges if move-in destination is inside change range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 4, 1 ], root ),
						new Position( [ 0, 2, 2 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.start.offset = 4;
					expected.range.end.offset = 6;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.offset = op.range.start.offset;
					expected.range.end.offset = 2;
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should get split into three ranges if moved range intersects change range and move-in destination is inside change range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0, 2, 0 ], root ),
						new Position( [ 0, 2, 3 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 3 );

					expected.range.start.offset = 3;
					expected.range.end.offset = 4;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.offset = 0;
					expected.range.end.offset = 1;
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );

					expected.range.start.offset = 2;
					expected.range.end.offset = 3;
					expected.baseVersion++;

					expectOperation( transOp[ 2 ], expected );
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

		describe( 'multi-level range', () => {
			beforeEach( () => {
				start = new Position( [ 1, 2 ], root );
				end = new Position( [ 2, 2, 4 ], root );

				range = new Range( start, end );

				op = new ChangeOperation( range, oldAttr, newAttr, baseVersion );

				expected.range = new Range( start.clone(), end.clone() );
			} );

			describe( 'InsertOperation', () => {
				it( 'should not change when positions are different', () => {
					let transformBy = new InsertOperation(
						new Position( [ 3, 3, 2 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should increment offset if addresses are same and offset is after applied operation', () => {
					let transformBy = new InsertOperation(
						new Position( [ 1, 1 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should increment offset if positions are same', () => {
					let transformBy = new InsertOperation(
						new Position( [ 1, 2 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not increment offset if insert position is after change range', () => {
					let transformBy = new InsertOperation(
						new Position( [ 3, 2 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', () => {
					let transformBy = new InsertOperation(
						new Position( [ 0 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path[ 0 ] += 2;
					expected.range.end.path[ 0 ] += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not update address at node(i) if applied operation\'s address was a prefix and its offset is after node(i)', () => {
					let transformBy = new InsertOperation(
						new Position( [ 2, 6 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should be split into two operations if insert was inside the range of incoming change operation', () => {
					let transformBy = new InsertOperation(
						new Position( [ 1, 3, 1 ], root ),
						[ nodeA, nodeB ],
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.start.path = [ 1, 3, 3 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start = op.range.start;
					expected.range.end.path = [ 1, 3, 1 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );
			} );

			describe( 'ChangeOperation', () => {
				describe( 'when attributes are conflicting', () => {
					describe( 'when incoming range is contained by on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1, 1, 4 ], root ), new Position( [ 3 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should become do-nothing operation if it has lower site id', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1, 1, 4 ], root ), new Position( [ 3 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expectOperation( transOp[ 0 ], {
								type: NoOperation,
								baseVersion: baseVersion + 1
							} );
						} );
					} );

					// [ incoming range   <   ]   on site range >
					describe( 'when incoming range intersects on right-side with on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1, 4, 2 ], root ), new Position( [ 3 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should get shrunk if it is weaker', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1, 4, 2 ], root ), new Position( [ 3 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expected.range.end = new Position( [ 1, 4, 2 ], root );

							expectOperation( transOp[ 0 ], expected );
						} );
					} );

					// [ on site range   <   ]   incoming range >
					describe( 'when incoming range intersects on left-side with on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1 ], root ), new Position( [ 2, 1 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should get shrunk if it is weaker', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1 ], root ), new Position( [ 2, 1 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expected.range.start = new Position( [ 2, 1 ], root );

							expectOperation( transOp[ 0 ], expected );
						} );
					} );

					describe( 'when incoming range contains on-site range', () => {
						it( 'should remain the same if it is stronger', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1, 4, 1 ], root ), new Position( [ 2, 1 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy, true );

							expectOperation( transOp[ 0 ], expected );
						} );

						it( 'should get split if it is weaker', () => {
							let transformBy = new ChangeOperation(
								new Range( new Position( [ 1, 4, 1 ], root ), new Position( [ 2, 1 ], root ) ),
								oldAttr,
								null,
								baseVersion
							);

							let transOp = op.getTransformedBy( transformBy );

							expect( transOp ).to.be.instanceof( Array );
							expect( transOp.length ).to.equal( 2 );

							expected.range.end.path = [ 1, 4, 1 ];

							expectOperation( transOp[ 0 ], expected );

							expected.range.start.path = [ 2, 1 ];
							expected.range.end = op.range.end;
							expected.baseVersion++;

							expectOperation( transOp[ 1 ], expected );
						} );
					} );
				} );
			} );

			describe( 'MoveOperation', () => {
				it( 'should not update address or offset if change target is in different path than move origin and destination', () => {
					let transformBy = new MoveOperation(
						new Position( [ 1, 1, 2 ], root ),
						new Position( [ 3, 4 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should have it\'s address merged with destination address if change was inside moved node sub-tree', () => {
					let transformBy = new MoveOperation(
						new Position( [ 1 ], root ),
						new Position( [ 3, 4, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path = [ 1, 4, 1, 2 ];
					expected.range.end.path = [ 1, 4, 2, 2, 4 ];

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should decrement offset if address is same as move origin and change offset is after moved node offset', () => {
					let transformBy = new MoveOperation(
						new Position( [ 1, 0 ], root ),
						new Position( [ 3, 4, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset -= 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should increment offset if address is same as move destination and change offset is after move-to offset', () => {
					let transformBy = new MoveOperation(
						new Position( [ 3, 4, 1 ], root ),
						new Position( [ 1, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.offset += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update address if moved node is before a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 0 ], root ),
						new Position( [ 2, 4, 1 ], root ),
						1,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path[ 0 ]--;
					expected.range.end.path[ 0 ]--;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not update address if moved node is after a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 3 ], root ),
						new Position( [ 0, 1 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should update address if move-in destination is before a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 3, 4, 1 ], root ),
						new Position( [ 1, 0 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expected.range.start.path[ 1 ] += 2;

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should not update address if move-in destination is after a node from change path', () => {
					let transformBy = new MoveOperation(
						new Position( [ 3, 4, 1 ], root ),
						new Position( [ 3 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'should get split into two ranges and one of them have it\'s address merged if change range intersects on right-side with moved range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 2, 1 ], root ),
						new Position( [ 4 ], root ),
						3,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.end.path = [ 2, 1 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 4 ];
					expected.range.end.path = [ 5, 4 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should get split into two ranges and one of them have it\'s address merged if change range intersects on left-side with moved range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 1, 1 ], root ),
						new Position( [ 0, 0 ], root ),
						3,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.start.path = [ 1, 1 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 0, 1 ];
					expected.range.end.path = [ 0, 3 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should get split into two ranges and one of them have it\'s address merged if change range contains moved range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 1, 4 ], root ),
						new Position( [ 3, 2 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 3, 2 ];
					expected.range.end.path = [ 3, 4 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should get split into two ranges if move-in destination is inside change range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 3, 4, 1 ], root ),
						new Position( [ 1, 4 ], root ),
						2,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 2 );

					expected.range.start.path = [ 1, 6 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start = op.range.start;
					expected.range.end.path = [ 1, 4 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'should get split into three ranges if moved range intersects change range and move-in destination is inside change range', () => {
					let transformBy = new MoveOperation(
						new Position( [ 1, 1 ], root ),
						new Position( [ 2 ], root ),
						3,
						baseVersion
					);

					let transOp = op.getTransformedBy( transformBy );

					expect( transOp ).to.be.instanceof( Array );
					expect( transOp.length ).to.equal( 3 );

					expected.range.start.path = [ 5 ];
					expected.range.end.path = [ 5, 2, 4 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 1, 1 ];
					expected.range.end.path = [ 2 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );

					expected.range.start.path = [ 3 ];
					expected.range.end.path = [ 5 ];
					expected.baseVersion++;

					expectOperation( transOp[ 2 ], expected );
				} );
			} );
		} );
	} );
} );
