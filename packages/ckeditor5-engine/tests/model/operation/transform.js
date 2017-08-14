/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transform from '../../../src/model/operation/transform';

import Document from '../../../src/model/document';
import RootElement from '../../../src/model/rootelement';
import Node from '../../../src/model/node';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';

import InsertOperation from '../../../src/model/operation/insertoperation';
import AttributeOperation from '../../../src/model/operation/attributeoperation';
import RootAttributeOperation from '../../../src/model/operation/rootattributeoperation';
import MarkerOperation from '../../../src/model/operation/markeroperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import RenameOperation from '../../../src/model/operation/renameoperation';
import NoOperation from '../../../src/model/operation/nooperation';

describe( 'transform', () => {
	let doc, root, op, nodeA, nodeB, expected, baseVersion;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		nodeA = new Node();
		nodeB = new Node();

		baseVersion = 0;
	} );

	function expectOperation( op, params ) {
		for ( const i in params ) {
			if ( params.hasOwnProperty( i ) ) {
				if ( i == 'type' ) {
					expect( op, 'type' ).to.be.instanceof( params[ i ] );
				}
				else if ( params[ i ] instanceof Array ) {
					expect( op[ i ].length, i ).to.equal( params[ i ].length );

					for ( let j = 0; j < params[ i ].length; j++ ) {
						expect( op[ i ][ j ] ).to.equal( params[ i ][ j ] );
					}
				} else if ( params[ i ] instanceof Position || params[ i ] instanceof Range ) {
					expect( op[ i ].isEqual( params[ i ] ), i ).to.be.true;
				} else {
					expect( op[ i ], i ).to.equal( params[ i ] );
				}
			}
		}
	}

	describe( 'InsertOperation', () => {
		let nodeC, nodeD, position;

		beforeEach( () => {
			nodeC = new Node();
			nodeD = new Node();

			position = new Position( root, [ 0, 2, 2 ] );

			op = new InsertOperation( position, [ nodeA, nodeB ], baseVersion );

			expected = {
				type: InsertOperation,
				position: Position.createFromPosition( position ),
				baseVersion: baseVersion + 1
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'target at different position: no position update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 1, 3, 2 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset before: increment offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 0 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at same offset and is important: increment offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 2 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at same offset and is less important: no position update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 2 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at same offset and context.insertBefore = true: no position update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 2 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( transformBy, { isStrong: false, insertBefore: false } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at same offset and context.insertBefore = false: increment offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 2 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset after: no position update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 3 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from path: increment index on path', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 1 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.path[ 1 ] += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from path: no position update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 6 ] ),
					[ nodeC, nodeD ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'no position update', () => {
				const transformBy = new AttributeOperation(
					Range.createFromPositionAndShift( position, 2 ),
					'foo',
					null,
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RootAttributeOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					null,
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'range and target are different than insert position: no position update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 3, 2 ] ),
					2,
					new Position( root, [ 2, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is before insert position offset: decrement offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 0 ] ),
					1,
					new Position( root, [ 1, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.offset--;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range offset is after insert position offset: no position update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 5 ] ),
					1,
					new Position( root, [ 1, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before insert position offset: increment offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 1 ] ),
					2,
					new Position( root, [ 0, 2, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after insert position offset: no position update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 1 ] ),
					2,
					new Position( root, [ 0, 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as insert position offset and is important: increment offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 1 ] ),
					2,
					new Position( root, [ 0, 2, 2 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as insert position offset and is less important: no position update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 1 ] ),
					2,
					new Position( root, [ 0, 2, 2 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as insert position offset and context.insertBefore = true: increment offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 1 ] ),
					2,
					new Position( root, [ 0, 2, 2 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true, insertBefore: true } );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as insert position offset and context.insertBefore = false: no position update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 1 ] ),
					2,
					new Position( root, [ 0, 2, 2 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: false, insertBefore: false } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is before node from insert position path: decrement index on path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 0 ] ),
					1,
					new Position( root, [ 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.path[ 1 ] -= 1;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is after node from insert position path: no position update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 4 ] ),
					2,
					new Position( root, [ 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from insert position path: increment index on path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 0 ] ),
					2,
					new Position( root, [ 0, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.path[ 1 ] += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from insert position path: no position update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 0 ] ),
					2,
					new Position( root, [ 0, 4 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range has node that contains insert position: update position', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 1 ] ),
					2,
					new Position( root, [ 1, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.path = [ 1, 2, 2 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range contains insert position (on same level): update position', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 0 ] ),
					4,
					new Position( root, [ 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				expected.position.path = [ 1, 2 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 0, 2, 0 ] ), 'oldName', 'newName', baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 4 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'AttributeOperation', () => {
		let start, end, range;

		beforeEach( () => {
			expected = {
				type: AttributeOperation,
				key: 'foo',
				oldValue: 'abc',
				newValue: 'bar',
				baseVersion: baseVersion + 1
			};
		} );

		describe( 'with multi-level range', () => {
			beforeEach( () => {
				start = new Position( root, [ 1, 2 ] );
				end = new Position( root, [ 2, 2, 4 ] );

				range = new Range( start, end );

				op = new AttributeOperation( range, 'foo', 'abc', 'bar', baseVersion );

				expected.range = new Range( start, end );
			} );

			describe( 'by InsertOperation', () => {
				it( 'target at different position: no operation update', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 3, 3, 2 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target at offset before: increment offset', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 1, 1 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target at same offset: increment offset', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 1, 2 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target at offset after: no operation update', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 3, 2 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target before node from path: increment index on path', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 0 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.path[ 0 ] += 2;
					expected.range.end.path[ 0 ] += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target after node from path: no position change', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 2, 6 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target inside change range: split into two operations', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 1, 3, 1 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.start.path = [ 1, 3, 3 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start = op.range.start;
					expected.range.end.path = [ 1, 3, 1 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );
			} );

			describe( 'by AttributeOperation', () => {
				it( 'attributes have different key: no operation update', () => {
					const transformBy = new AttributeOperation(
						Range.createFromRange( range ),
						'differentKey',
						true,
						false,
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'same key and value: convert to NoOperation', () => {
					const transformBy = new AttributeOperation(
						Range.createFromRange( range ),
						'foo',
						'abc',
						'bar',
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], {
						type: NoOperation,
						baseVersion: baseVersion + 1
					} );
				} );

				describe( 'that is less important and', () => {
					it( 'both operations removes same attribute: change old value to null', () => {
						op.newValue = null;
						expected.newValue = null;

						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 1, 4 ] ), new Position( root, [ 3 ] ) ),
							'foo',
							'another',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy, { isStrong: true } );

						expected.oldValue = null;

						expect( transOp.length ).to.equal( 1 );
					} );

					it( 'range does not intersect original range: no operation update', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 3, 0 ] ), new Position( root, [ 4 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy, { isStrong: true } );

						expect( transOp.length ).to.equal( 1 );
						expectOperation( transOp[ 0 ], expected );
					} );

					it( 'range contains original range: update oldValue', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 1, 4 ] ), new Position( root, [ 3 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy, { isStrong: true } );

						expected.oldValue = null;

						expect( transOp.length ).to.equal( 1 );
						expectOperation( transOp[ 0 ], expected );
					} );

					// [ original range   <   ]   range transformed by >
					it( 'range intersects on left: split into two operations, update oldValue', () => {
						// Get more test cases and better code coverage
						op.newValue = null;
						expected.newValue = null;

						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 4, 2 ] ), new Position( root, [ 3 ] ) ),
							'foo',
							null,
							// Get more test cases and better code coverage
							'another',
							baseVersion
						);

						const transOp = transform( op, transformBy, { isStrong: true } );

						expect( transOp.length ).to.equal( 2 );

						expected.range.end.path = [ 1, 4, 2 ];

						expectOperation( transOp[ 0 ], expected );

						expected.range.start.path = [ 1, 4, 2 ];
						expected.range.end = op.range.end;
						expected.oldValue = 'another';
						expected.baseVersion++;

						expectOperation( transOp[ 1 ], expected );
					} );

					// [  range transformed by  <   ]  original range  >
					it( 'range intersects on right: split into two operations, update oldValue', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1 ] ), new Position( root, [ 2, 1 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy, { isStrong: true } );

						expect( transOp.length ).to.equal( 2 );

						expected.range.start.path = [ 2, 1 ];

						expectOperation( transOp[ 0 ], expected );

						expected.range.start = op.range.start;
						expected.range.end.path = [ 2, 1 ];
						expected.oldValue = null;
						expected.baseVersion++;

						expectOperation( transOp[ 1 ], expected );
					} );

					it( 'range is inside original range: split into three operations, update oldValue', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 4, 1 ] ), new Position( root, [ 2, 1 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy, { isStrong: true } );

						expect( transOp.length ).to.equal( 3 );

						expected.range.end.path = [ 1, 4, 1 ];

						expectOperation( transOp[ 0 ], expected );

						expected.range.start.path = [ 2, 1 ];
						expected.range.end = op.range.end;
						expected.baseVersion++;

						expectOperation( transOp[ 1 ], expected );

						expected.range.start.path = [ 1, 4, 1 ];
						expected.range.end.path = [ 2, 1 ];
						expected.oldValue = null;
						expected.baseVersion++;

						expectOperation( transOp[ 2 ], expected );
					} );
				} );

				describe( 'that is more important and', () => {
					it( 'both operations removes same attribute: convert to NoOperation', () => {
						op.newValue = null;
						expected.newValue = null;

						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 1, 4 ] ), new Position( root, [ 3 ] ) ),
							'foo',
							'another',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy );

						expect( transOp.length ).to.equal( 1 );
						expectOperation( transOp[ 0 ], {
							type: NoOperation,
							baseVersion: baseVersion + 1
						} );
					} );

					it( 'range does not intersect original range: no operation update', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 3, 0 ] ), new Position( root, [ 4 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy );

						expect( transOp.length ).to.equal( 1 );
						expectOperation( transOp[ 0 ], expected );
					} );

					it( 'range contains original range: convert to NoOperation', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 1, 4 ] ), new Position( root, [ 3 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy );

						expect( transOp.length ).to.equal( 1 );
						expectOperation( transOp[ 0 ], {
							type: NoOperation,
							baseVersion: baseVersion + 1
						} );
					} );

					// [ original range   <   ]   range transformed by >
					it( 'range intersects on left: shrink original range', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 4, 2 ] ), new Position( root, [ 3 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy );

						expected.range.end.path = [ 1, 4, 2 ];

						expect( transOp.length ).to.equal( 1 );
						expectOperation( transOp[ 0 ], expected );
					} );

					// [  range transformed by  <   ]  original range  >
					it( 'range intersects on right: shrink original range', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1 ] ), new Position( root, [ 2, 1 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy );

						expected.range.start.path = [ 2, 1 ];

						expect( transOp.length ).to.equal( 1 );
						expectOperation( transOp[ 0 ], expected );
					} );

					it( 'range is inside original range: split into two operations', () => {
						const transformBy = new AttributeOperation(
							new Range( new Position( root, [ 1, 4, 1 ] ), new Position( root, [ 2, 1 ] ) ),
							'foo',
							'abc',
							null,
							baseVersion
						);

						const transOp = transform( op, transformBy );

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

			describe( 'by RootAttributeOperation', () => {
				it( 'no operation update', () => {
					const transformBy = new RootAttributeOperation(
						root,
						'foo',
						null,
						'bar',
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );
			} );

			describe( 'by MoveOperation', () => {
				it( 'range and target are different than change range: no operation update', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 1, 1, 2 ] ),
						2,
						new Position( root, [ 3, 4 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'range offset is before change range start offset: decrement offset', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 1, 0 ] ),
						2,
						new Position( root, [ 3, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset -= 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target offset is before change range start offset: increment offset', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 3, 4, 1 ] ),
						2,
						new Position( root, [ 1, 0 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'range is before node from path to change range: decrement index on path', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0 ] ),
						1,
						new Position( root, [ 2, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.path[ 0 ]--;
					expected.range.end.path[ 0 ]--;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'range is after node from path to change range: no position change', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 3 ] ),
						2,
						new Position( root, [ 0, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target before node from path to change range: increment index on path', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 3, 4, 1 ] ),
						2,
						new Position( root, [ 1, 0 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.path[ 1 ] += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target after node from path to change range: no position change', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 3, 4, 1 ] ),
						2,
						new Position( root, [ 3 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'range intersects on left with change range: split into two operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 2, 1 ] ),
						3,
						new Position( root, [ 4 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.end.path = [ 2, 1 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 4 ];
					expected.range.end.path = [ 5, 4 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'range intersects on right with change range: split into two operation', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 1, 1 ] ),
						3,
						new Position( root, [ 0, 0 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.start.path = [ 1, 1 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 0, 1 ];
					expected.range.end.path = [ 0, 3 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'range contains change range: update change range', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 1 ] ),
						2,
						new Position( root, [ 3, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.path = [ 1, 4, 1, 2 ];
					expected.range.end.path = [ 1, 4, 2, 2, 4 ];

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'range is inside change range: split into two operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 1, 4 ] ),
						2,
						new Position( root, [ 3, 2 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 3, 2 ];
					expected.range.end.path = [ 3, 4 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'target inside change range: split into two operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 3, 4, 1 ] ),
						2,
						new Position( root, [ 1, 4 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.start.path = [ 1, 6 ];

					expectOperation( transOp[ 0 ], expected );

					expected.range.start = op.range.start;
					expected.range.end.path = [ 1, 4 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'range intersects change range and target inside change range: split into three operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 1, 1 ] ),
						3,
						new Position( root, [ 2 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

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

			describe( 'by NoOperation', () => {
				it( 'no operation update', () => {
					const transformBy = new NoOperation( baseVersion );

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );
			} );

			describe( 'by RenameOperation', () => {
				it( 'no position update', () => {
					const transformBy = new RenameOperation( new Position( root, [ 1, 0 ] ), 'oldName', 'newName', baseVersion );

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );
			} );

			describe( 'by MarkerOperation', () => {
				it( 'no operation update', () => {
					const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 8 ] ) );
					const transformBy = new MarkerOperation( 'name', null, newRange, doc.markers, baseVersion );

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );
			} );
		} );

		// Some extra cases for a AttributeOperation that operates on single tree level range.
		// This means that the change range start and end differs only on offset value.
		// This test suite also have some modifications to the original operation
		// to get more test cases covered and better code coverage.
		describe( 'with single-level range', () => {
			beforeEach( () => {
				start = new Position( root, [ 0, 2, 1 ] );
				end = new Position( root, [ 0, 2, 4 ] );

				range = new Range( start, end );

				op = new AttributeOperation( range, 'foo', 'abc', 'bar', baseVersion );

				expected.range = new Range( start, end );
			} );

			describe( 'by InsertOperation', () => {
				it( 'target at offset before: increment offset', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 0, 2, 0 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset += 2;
					expected.range.end.offset += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target at same offset: increment offset', () => {
					const transformBy = new InsertOperation(
						new Position( root, [ 0, 2, 1 ] ),
						[ nodeA, nodeB ],
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset += 2;
					expected.range.end.offset += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );
			} );

			describe( 'by MoveOperation', () => {
				it( 'range offset is before change range start offset: decrement offset', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0, 2, 0 ] ),
						1,
						new Position( root, [ 2, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset--;
					expected.range.end.offset--;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target offset is before change range start offset: increment offset', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 2, 4, 1 ] ),
						2,
						new Position( root, [ 0, 2, 0 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.offset += 2;
					expected.range.end.offset += 2;

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'range intersects on left with change range: split into two operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0, 2, 2 ] ),
						4,
						new Position( root, [ 2, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.end.offset -= 2;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 2, 4, 1 ];
					expected.range.end.path = [ 2, 4, 3 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'range intersects on right with change range: split into two operation', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0, 2, 0 ] ),
						2,
						new Position( root, [ 2, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.start.offset -= 1;
					expected.range.end.offset -= 2;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 2, 4, 2 ];
					expected.range.end.path = [ 2, 4, 3 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'range contains change range: update change range', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0, 1 ] ),
						3,
						new Position( root, [ 2, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.path = [ 2, 4, 2, 1 ];
					expected.range.end.path = [ 2, 4, 2, 4 ];

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'range is inside change range: split into two operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0, 2, 2 ] ),
						1,
						new Position( root, [ 2, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.end.offset--;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.path = [ 2, 4, 1 ];
					expected.range.end.path = [ 2, 4, 2 ];
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'range is same as change range: update change range', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0, 2, 1 ] ),
						3,
						new Position( root, [ 2, 4, 1 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expected.range.start.path = [ 2, 4, 1 ];
					expected.range.end.path = [ 2, 4, 4 ];

					expect( transOp.length ).to.equal( 1 );
					expectOperation( transOp[ 0 ], expected );
				} );

				it( 'target inside change range: split into two operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 2, 4, 1 ] ),
						2,
						new Position( root, [ 0, 2, 2 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

					expect( transOp.length ).to.equal( 2 );

					expected.range.start.offset = 4;
					expected.range.end.offset = 6;

					expectOperation( transOp[ 0 ], expected );

					expected.range.start.offset = op.range.start.offset;
					expected.range.end.offset = 2;
					expected.baseVersion++;

					expectOperation( transOp[ 1 ], expected );
				} );

				it( 'range intersects change range and target inside change range: split into three operations', () => {
					const transformBy = new MoveOperation(
						new Position( root, [ 0, 2, 0 ] ),
						2,
						new Position( root, [ 0, 2, 3 ] ),
						baseVersion
					);

					const transOp = transform( op, transformBy );

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
		} );

		describe( 'by RemoveOperation', () => {
			beforeEach( () => {
				start = new Position( doc.graveyard, [ 2, 0 ] );
				end = new Position( doc.graveyard, [ 2, 4 ] );

				range = new Range( start, end );

				op = new AttributeOperation( range, 'foo', 'abc', 'bar', baseVersion );

				expected.range = new Range( start, end );
			} );

			it( 'remove operation inserted elements before attribute operation range: increment path', () => {
				const transformBy = new RemoveOperation(
					new Position( root, [ 0 ] ),
					2,
					new Position( doc.graveyard, [ 0 ] ),
					baseVersion
				);

				transformBy.targetPosition.path = [ 0 ];

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.range.start.path = [ 4, 0 ];
				expected.range.end.path = [ 4, 4 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'remove operation inserted elements after attribute operation range: do nothing', () => {
				const transformBy = new RemoveOperation(
					new Position( root, [ 0 ] ),
					2,
					new Position( doc.graveyard, [ 0 ] ),
					baseVersion
				);

				transformBy.targetPosition.path = [ 4 ];

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'RootAttributeOperation', () => {
		const diffRoot = new RootElement( null );

		beforeEach( () => {
			expected = {
				type: RootAttributeOperation,
				key: 'foo',
				oldValue: 'abc',
				newValue: 'bar',
				baseVersion: baseVersion + 1
			};

			op = new RootAttributeOperation( root, 'foo', 'abc', 'bar', baseVersion );
		} );

		describe( 'by InsertOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0 ] ),
					'a',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new AttributeOperation(
					new Range(
						new Position( root, [ 0 ] ),
						new Position( root, [ 1 ] )
					),
					'foo',
					'bar',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RootAttributeOperation', () => {
			it( 'changes different root: no operation update', () => {
				const transformBy = new RootAttributeOperation(
					diffRoot,
					'foo',
					'abc',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'changes different key: no operation update', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'abc',
					'abc',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'sets same value for same key: convert to NoOperation', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					'abc',
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'sets different value for same key on same root and is important: no operation update', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					'abc',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'sets different value for same key on same root and is less important: convert to NoOperation', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					'abc',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0 ] ),
					2,
					new Position( root, [ 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 0 ] ), 'oldName', 'newName', baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'MoveOperation', () => {
		let sourcePosition, targetPosition, rangeEnd, howMany;

		beforeEach( () => {
			sourcePosition = new Position( root, [ 2, 2, 4 ] );
			targetPosition = new Position( root, [ 3, 3, 3 ] );
			howMany = 2;

			rangeEnd = Position.createFromPosition( sourcePosition );
			rangeEnd.offset += howMany;

			op = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );

			expected = {
				type: MoveOperation,
				sourcePosition: Position.createFromPosition( sourcePosition ),
				targetPosition: Position.createFromPosition( targetPosition ),
				howMany,
				baseVersion: baseVersion + 1
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'target at different position than move range and target: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 1, 3, 2 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside node from move range: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 4, 1 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset before range offset: increment range offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 0 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset after range offset: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 7 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from range start path: increment index on range start path', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 0 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.path[ 1 ] += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from range start path: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before move target offset: increment target offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 2 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after move target offset: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 4 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from move target position path: increment index on move target position path', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.path[ 1 ] += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from move target position path: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 6 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and is important: increment target offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and is less important: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and context.insertBefore = true: increment target offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true, insertBefore: true } );

				expected.targetPosition.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and context.insertBefore = false: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: false, insertBefore: false } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside move range: expand range', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 5 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.howMany = 4;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset same as range end boundary: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 6 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset same as range end boundary (sticky move): expand range', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 6 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				op.isSticky = true;

				const transOp = transform( op, transformBy );

				expected.howMany = 4;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new AttributeOperation(
					new Range( sourcePosition, rangeEnd ),
					'abc',
					true,
					false,
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RootAttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					null,
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'range and target different than transforming range and target: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 2 ] ),
					3,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before transforming range start offset: increment range offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after transforming range start offset: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 7 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range start offset before transforming range start offset: decrement range offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 0 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.offset -= 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range start offset after transforming range start offset: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 9 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from transforming range start path: increment index on range start path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.path[ 1 ] += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from transforming range start path: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range before node from transforming range start path: decrement index on range start path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 0 ] ),
					1,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.path[ 1 ] -= 1;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range after node from transforming range start path: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 3 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before transforming target offset: increment target offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 3, 3, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset after transforming target offset: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 3, 3, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range offset before transforming target offset: decrement target offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 3, 3, 0 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.offset -= 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range offset after transforming target offset: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 3, 3, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from transforming target path: increment index on target path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 3, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.path[ 1 ] += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after node from transforming target path: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 3, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range before node from transforming target path: decrement index on target path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 3, 0 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.path[ 1 ] -= 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range after node from transforming target path: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 3, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside transforming move range: split into two operations', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.howMany = 1;
				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 6 ];
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.baseVersion++;
				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'target at start boundary of transforming move range: increment source offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 4 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.sourcePosition.offset = 6;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at start boundary of transforming move range (sticky move): expand move range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 4 ] ),
					baseVersion
				);

				op.isSticky = true;

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.howMany = 4;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at end boundary of transforming move range: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 6 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at end boundary of transforming move range (sticky move): expand move range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 6 ] ),
					baseVersion
				);

				op.isSticky = true;

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.howMany = 4;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside a node from transforming range: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 5, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range has node that contains transforming range: update range path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 1 ] ),
					3,
					new Position( root, [ 4, 2 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.path = [ 4, 3, 4 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range has node that contains transforming target: update target path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 3, 2 ] ),
					3,
					new Position( root, [ 0, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.targetPosition.path = [ 0, 2, 3 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside a node from transforming range and vice versa: reverse transform-by operation', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 3, 2 ] ),
					3,
					new Position( root, [ 2, 2, 5, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );
				const reversed = transformBy.getReversed();

				expected.sourcePosition = reversed.sourcePosition;
				expected.targetPosition = reversed.targetPosition;
				expected.howMany = reversed.howMany;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is same as transforming range and is important: convert to NoOperation', () => {
				const transformBy = new MoveOperation(
					op.sourcePosition,
					op.howMany,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'range is same as transforming range and is less important: update range path', () => {
				const transformBy = new MoveOperation(
					op.sourcePosition,
					op.howMany,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expected.sourcePosition.path = [ 4, 1, 0 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range contains transforming range and is important: convert to NoOperation', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'range contains transforming range and is less important: update range path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expected.sourcePosition.path = [ 4, 1, 1 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range contains transforming range and target and is important: update range path and target', () => {
				op.targetPosition.path = [ 2, 2, 7 ];

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					5,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.sourcePosition.path = [ 4, 1, 1 ];
				expected.targetPosition.path = [ 4, 1, 4 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range contains transforming range and target and is less important: update range path and target', () => {
				op.targetPosition.path = [ 2, 2, 7 ];

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					5,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );

				expected.sourcePosition.path = [ 4, 1, 1 ];
				expected.targetPosition.path = [ 4, 1, 4 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range intersects on left side of transforming range and is important: shrink range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.sourcePosition.path = [ 2, 2, 3 ];
				expected.howMany = 1;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range intersects on left side of transforming range and is less important: split into two operations', () => {
				// Get more test cases and better code coverage
				const otherRoot = new RootElement( null );

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					2,
					new Position( otherRoot, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition = new Position( otherRoot, [ 4, 1, 1 ] );
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition = new Position( root, [ 2, 2, 3 ] );
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on right side of transforming range and is important: shrink range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.howMany = 1;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range intersects on right side of transforming range and is less important: split into two operations', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition = sourcePosition;
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition = new Position( root, [ 4, 1, 0 ] );
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on left side, target inside transforming range and is important: split into two operations', () => {
				op.howMany = 4;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					2,
					new Position( root, [ 2, 2, 6 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 3 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 5 ];
				expected.howMany = 2;
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on left side, target inside transforming range and is less important: split into two operations', () => {
				op.howMany = 4;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					2,
					new Position( root, [ 2, 2, 6 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 3 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 5 ];
				expected.howMany = 2;
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on right side of transforming range and is important: shrink range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expected.howMany = 1;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range intersects on right side of transforming range and is less important: split into two operations', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition = sourcePosition;
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition = new Position( root, [ 4, 1, 0 ] );
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects, target inside transforming range and is important: split into two operations', () => {
				op.targetPosition.path = [ 2, 2, 7 ];

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.targetPosition.path = [ 4, 1, 2 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 4, 1, 0 ];
				expected.targetPosition.path = [ 4, 1, 3 ];
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects, target inside transforming range and is less important: shrink range', () => {
				op.targetPosition.path = [ 2, 2, 7 ];

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.targetPosition.path = [ 4, 1, 2 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range inside transforming range and is important: split into two operations', () => {
				op.howMany = 4;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range inside transforming range and is less important: split into three operations', () => {
				op.howMany = 4;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 3 );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 4, 1, 0 ];
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.howMany = 2;
				expected.baseVersion++;

				expectOperation( transOp[ 1 ], expected );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.targetPosition = targetPosition.getShiftedBy( 3 );
				expected.howMany = 1;
				expected.baseVersion++;

				expectOperation( transOp[ 2 ], expected );
			} );

			it( 'range and target inside transforming range and is important: no operation update', () => {
				op.howMany = 6;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 2, 2, 9 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.howMany = 6;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range and target inside transforming range and is less important: no operation update', () => {
				op.howMany = 6;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 2, 2, 9 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );

				expected.howMany = 6;

				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RemoveOperation', () => {
			let transformBy;

			beforeEach( () => {
				transformBy = new RemoveOperation(
					Position.createFromPosition( op.sourcePosition ),
					op.howMany,
					new Position( doc.graveyard, [ 0 ] ),
					baseVersion
				);
			} );

			it( 'should skip context.isStrong and be less important than RemoveOperation', () => {
				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );

				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'should use context.isStrong if forceWeakRemove flag is used', () => {
				const transOp = transform( op, transformBy, { isStrong: true, forceWeakRemove: true } );

				expect( transOp.length ).to.equal( 1 );

				expected.sourcePosition = transformBy.targetPosition;

				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 2, 2, 4 ] ), 'oldName', 'newName', baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 2, 2, 3 ] ), new Position( root, [ 2, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'RemoveOperation', () => {
		describe( 'by MoveOperation', () => {
			it( 'should force removing content even if was less important', () => {
				const op = new RemoveOperation( new Position( root, [ 8 ] ), 2, new Position( doc.graveyard, [ 0 ] ), baseVersion );

				const targetPosition = Position.createFromPosition( op.targetPosition );

				const transformBy = new MoveOperation( new Position( root, [ 8 ] ), 2, new Position( root, [ 1 ] ), baseVersion );

				const sourcePosition = Position.createFromPosition( transformBy.targetPosition );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expectOperation( transOp[ 0 ], {
					type: RemoveOperation,
					howMany: 2,
					sourcePosition,
					targetPosition,
					baseVersion: baseVersion + 1
				} );
			} );
		} );
	} );

	describe( 'NoOperation', () => {
		beforeEach( () => {
			op = new NoOperation( baseVersion );

			expected = {
				type: NoOperation,
				baseVersion: baseVersion + 1
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0 ] ),
					'a',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new AttributeOperation(
					new Range(
						new Position( root, [ 0 ] ),
						new Position( root, [ 1 ] )
					),
					'foo',
					'bar',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RootAttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					null,
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0 ] ),
					2,
					new Position( root, [ 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 0, 2, 0 ] ), 'oldName', 'newName', baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'RenameOperation', () => {
		beforeEach( () => {
			const position = new Position( root, [ 0, 2, 2 ] );

			op = new RenameOperation( position, 'oldName', 'newName', baseVersion );

			expected = {
				position,
				oldName: 'oldName',
				newName: 'newName',
				baseVersion: baseVersion + 1
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'target before renamed element: offset update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 1 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.offset = 4;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after renamed element: no change', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before a node on path to renamed element: path update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 1 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.path = [ 0, 4, 2 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target after a node on path to renamed element: no change', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 3 ] ),
					[ nodeA, nodeB ],
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new AttributeOperation(
					new Range(
						new Position( root, [ 0, 2, 1 ] ),
						new Position( root, [ 1, 3 ] )
					),
					'foo',
					'bar',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RootAttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					null,
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no operation update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'different element: no change', () => {
				const transformBy = new RenameOperation(
					new Position( root, [ 0, 2, 1 ] ),
					'foo',
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'same element and is important: convert to NoOperation', () => {
				const transformBy = new RenameOperation(
					new Position( root, [ 0, 2, 2 ] ),
					'oldName',
					'otherName',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'same element and is not important: change old name to new name', () => {
				const transformBy = new RenameOperation(
					new Position( root, [ 0, 2, 2 ] ),
					'oldName',
					'otherName',
					baseVersion
				);

				const transOp = transform( op, transformBy, { isStrong: true } );

				expect( transOp.length ).to.equal( 1 );

				expected.oldName = 'otherName';
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'moved range before renamed element: update offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 0 ] ),
					2,
					new Position( root, [ 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.offset = 0;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'moved range before an element on path to renamed element: update path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 0 ] ),
					2,
					new Position( root, [ 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.path = [ 0, 0, 2 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'moved range contains renamed element: update path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 1 ] ),
					3,
					new Position( root, [ 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.path = [ 2, 6 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'moved range contains renamed element parent: updated path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 1 ] ),
					3,
					new Position( root, [ 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.path = [ 2, 6, 2 ];

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'move target before renamed element: update offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 5 ] ),
					2,
					new Position( root, [ 0, 2, 1 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.offset = 4;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'move target before an element on path to renamed element: update path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 0 ] ),
					2,
					new Position( root, [ 2, 5 ] ),
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.position.offset = 0;

				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'MarkerOperation', () => {
		let oldRange, newRange;

		beforeEach( () => {
			oldRange = Range.createFromParentsAndOffsets( root, 1, root, 4 );
			newRange = Range.createFromParentsAndOffsets( root, 10, root, 12 );
			op = new MarkerOperation( 'name', oldRange, newRange, doc.markers, baseVersion );

			expected = {
				name: 'name',
				oldRange,
				newRange,
				baseVersion: baseVersion + 1
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'insert position affecting oldRange: update oldRange', () => {
				// Just CC things.
				op.newRange = null;
				const transformBy = new InsertOperation( Position.createAt( root, 0 ), [ nodeA, nodeB ], baseVersion );

				const transOp = transform( op, transformBy );

				expected.newRange = null;
				expected.oldRange.start.offset = 3;
				expected.oldRange.end.offset = 6;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'insert position affecting newRange: update newRange', () => {
				// Just CC things.
				op.oldRange = null;
				const transformBy = new InsertOperation( Position.createAt( root, 8 ), [ nodeA, nodeB ], baseVersion );

				const transOp = transform( op, transformBy );

				expected.oldRange = null;
				expected.newRange.start.offset = 12;
				expected.newRange.end.offset = 14;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new AttributeOperation(
					new Range(
						new Position( root, [ 2 ] ),
						new Position( root, [ 11 ] )
					),
					'foo',
					'bar',
					'xyz',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'moved range is before oldRange: update oldRange', () => {
				// Just CC things.
				op.newRange = null;

				const transformBy = new MoveOperation( Position.createAt( root, 0 ), 1, Position.createAt( root, 20 ), baseVersion );
				const transOp = transform( op, transformBy );

				expected.newRange = null;
				expected.oldRange.start.offset = 0;
				expected.oldRange.end.offset = 3;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'moved range contains oldRange and is before newRange: update oldRange and newRange', () => {
				const transformBy = new MoveOperation( Position.createAt( root, 2 ), 2, Position.createAt( root, 20 ), baseVersion );
				const transOp = transform( op, transformBy );

				expected.oldRange.start.offset = 1;
				expected.oldRange.end.offset = 2;
				expected.newRange.start.offset = 8;
				expected.newRange.end.offset = 10;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target position is inside newRange: update newRange', () => {
				// Just CC things.
				op.oldRange = null;

				const transformBy = new MoveOperation( Position.createAt( root, 20 ), 2, Position.createAt( root, 11 ), baseVersion );
				const transOp = transform( op, transformBy );

				expected.oldRange = null;
				expected.newRange.start.offset = 10;
				expected.newRange.end.offset = 14;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target position is inside oldRange and before newRange: update oldRange and newRange', () => {
				const transformBy = new MoveOperation( Position.createAt( root, 20 ), 4, Position.createAt( root, 2 ), baseVersion );
				const transOp = transform( op, transformBy );

				expected.oldRange.start.offset = 1;
				expected.oldRange.end.offset = 8;
				expected.newRange.start.offset = 14;
				expected.newRange.end.offset = 16;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RootAttributeOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					null,
					'bar',
					baseVersion
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 1 ] ), 'oldName', 'newName', baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'different marker name: no operation update', () => {
				const transformBy = new MarkerOperation( 'otherName', oldRange, newRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'same marker name and is important: convert to NoOperation', () => {
				const anotherRange = Range.createFromParentsAndOffsets( root, 2, root, 2 );
				const transformBy = new MarkerOperation( 'name', oldRange, anotherRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation,
					baseVersion: baseVersion + 1
				} );
			} );

			it( 'same marker name and is less important: update oldRange parameter', () => {
				const anotherRange = Range.createFromParentsAndOffsets( root, 2, root, 2 );
				const transformBy = new MarkerOperation( 'name', oldRange, anotherRange, doc.markers, baseVersion );

				const transOp = transform( op, transformBy, { isStrong: true } );

				expected.oldRange = anotherRange;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );
} );
