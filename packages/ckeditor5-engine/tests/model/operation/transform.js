/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import { transform, transformSets } from '../../../src/model/operation/transform';

import Model from '../../../src/model/model';
import RootElement from '../../../src/model/rootelement';
import Node from '../../../src/model/node';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';

import InsertOperation from '../../../src/model/operation/insertoperation';
import AttributeOperation from '../../../src/model/operation/attributeoperation';
import RootAttributeOperation from '../../../src/model/operation/rootattributeoperation';
import MarkerOperation from '../../../src/model/operation/markeroperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import RenameOperation from '../../../src/model/operation/renameoperation';
import NoOperation from '../../../src/model/operation/nooperation';

describe( 'transform', () => {
	let model, doc, root, op, nodeA, nodeB, expected;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		nodeA = new Node();
		nodeB = new Node();
	} );

	afterEach( () => {
		sinon.restore();
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

	const strongContext = {
		aIsStrong: true
	};

	it( 'should throw an error when one of operations is invalid', () => {
		// Catches the 'Error during operation transformation!' warning in the CK_DEBUG mode.
		sinon.stub( console, 'warn' );

		const nodeA = new Node();
		const nodeB = new Node();

		const position = new Position( root, [ 0 ] );

		const a = new InsertOperation( position, [ nodeA ], 0 );
		const b = new InsertOperation( position, [ nodeB ], 0 );

		// Modify an operation so it will throw an error.
		a.position = null;

		expect( () => {
			transform( a, b, {
				aIsStrong: true,
				aWasUndone: false,
				bWasUndone: false,
				abRelation: null,
				baRelation: null
			} );
		} ).to.throw( TypeError );
	} );

	describe( 'InsertOperation', () => {
		let nodeC, nodeD, position;

		beforeEach( () => {
			nodeC = new Node();
			nodeD = new Node();

			position = new Position( root, [ 0, 2, 2 ] );

			op = new InsertOperation( position, [ nodeA, nodeB ], 0 );

			expected = {
				type: InsertOperation,
				position: position.clone()
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'target at different position: no position update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 1, 3, 2 ] ),
					[ nodeC, nodeD ],
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset before: increment offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 0 ] ),
					[ nodeC, nodeD ],
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at same offset and context.insertBefore = false: increment offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 2 ] ),
					[ nodeC, nodeD ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from path: increment index on path', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 1 ] ),
					[ nodeC, nodeD ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'no position update', () => {
				const transformBy = new AttributeOperation(
					Range._createFromPositionAndShift( position, 2 ),
					'foo',
					null,
					'bar',
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as insert position offset and is less important: increment offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 1, 1 ] ),
					2,
					new Position( root, [ 0, 2, 2 ] ),
					0
				);

				const transOp = transform( op, transformBy, strongContext );
				expected.position.offset += 2;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range is before node from insert position path: decrement index on path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 0 ] ),
					1,
					new Position( root, [ 1, 0 ] ),
					0
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
					0
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
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );
				expected.position.path = [ 1, 2 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 0, 2, 0 ] ), 'oldName', 'newName', 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 4 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, model.markers, false, 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'AttributeOperation', () => {
		let start, end, range;

		beforeEach( () => {
			start = new Position( root, [ 0, 2, 1 ] );
			end = new Position( root, [ 0, 2, 4 ] );

			range = new Range( start, end );

			op = new AttributeOperation( range, 'foo', 'abc', 'bar', 0 );

			expected = {
				type: AttributeOperation,
				range,
				key: 'foo',
				oldValue: 'abc',
				newValue: 'bar'
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'target at offset before: increment offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 0 ] ),
					[ nodeA, nodeB ],
					0
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
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.range.end.offset -= 2;

				expectOperation( transOp[ 0 ], expected );

				expected.range.start.path = [ 2, 4, 1 ];
				expected.range.end.path = [ 2, 4, 3 ];

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on right with change range: split into two operation', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 0 ] ),
					2,
					new Position( root, [ 2, 4, 1 ] ),
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.range.start.offset -= 1;
				expected.range.end.offset -= 2;

				expectOperation( transOp[ 0 ], expected );

				expected.range.start.path = [ 2, 4, 2 ];
				expected.range.end.path = [ 2, 4, 3 ];

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range contains change range: update change range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 1 ] ),
					3,
					new Position( root, [ 2, 4, 1 ] ),
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 3 );

				expected.range.start.path = [ 0, 2, 1 ];
				expected.range.end.path = [ 0, 2, 2 ];

				expectOperation( transOp[ 0 ], expected );

				expected.range.start.path = [ 0, 2, 2 ];
				expected.range.end.path = [ 0, 2, 3 ];

				expectOperation( transOp[ 1 ], expected );

				expected.range.start.path = [ 2, 4, 1 ];
				expected.range.end.path = [ 2, 4, 2 ];

				expectOperation( transOp[ 2 ], expected );
			} );

			it( 'range is same as change range: update change range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 1 ] ),
					3,
					new Position( root, [ 2, 4, 1 ] ),
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.range.end.offset = 2;

				expectOperation( transOp[ 0 ], expected );

				expected.range.start.offset = 4;
				expected.range.end.offset = 6;

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects change range and target inside change range: split into three operations', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 0, 2, 0 ] ),
					2,
					new Position( root, [ 0, 2, 3 ] ),
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 3 );

				expected.range.start.path = [ 0, 2, 0 ];
				expected.range.end.path = [ 0, 2, 1 ];

				expectOperation( transOp[ 0 ], expected );

				expected.range.start.path = [ 0, 2, 3 ];
				expected.range.end.path = [ 0, 2, 4 ];

				expectOperation( transOp[ 1 ], expected );

				expected.range.start.path = [ 0, 2, 2 ];
				expected.range.end.path = [ 0, 2, 3 ];

				expectOperation( transOp[ 2 ], expected );
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
				newValue: 'bar'
			};

			op = new RootAttributeOperation( root, 'foo', 'abc', 'bar', 0 );
		} );

		describe( 'by InsertOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0 ] ),
					'a',
					0
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
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation
				} );
			} );

			it( 'sets different value for same key on same root and is important: convert to NoOperation', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					'abc',
					'xyz',
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation
				} );
			} );

			it( 'sets different value for same key on same root and is less important: change oldValue', () => {
				const transformBy = new RootAttributeOperation(
					root,
					'foo',
					'abc',
					'xyz',
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expected.oldValue = 'xyz';

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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 0 ] ), 'oldName', 'newName', 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, model.markers, false, 0 );

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

			rangeEnd = sourcePosition.clone();
			rangeEnd.offset += howMany;

			op = new MoveOperation( sourcePosition, howMany, targetPosition, 0 );

			expected = {
				type: MoveOperation,
				sourcePosition: sourcePosition.clone(),
				targetPosition: targetPosition.clone(),
				howMany
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'target at different position than move range and target: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 1, 3, 2 ] ),
					[ nodeA, nodeB ],
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside node from move range: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 4, 1 ] ),
					[ nodeA, nodeB ],
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at offset before range offset: increment range offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 0 ] ),
					[ nodeA, nodeB ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from range start path: increment index on range start path', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 0 ] ),
					[ nodeA, nodeB ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset before move target offset: increment target offset', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 2 ] ),
					[ nodeA, nodeB ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from move target position path: increment index on move target position path', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3 ] ),
					[ nodeA, nodeB ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and is important: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 3 ] ),
					[ nodeA, nodeB ],
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target offset same as move target offset and is less important: no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 3, 3, 3 ] ),
					[ nodeA, nodeB ],
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside move range: expand range', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 2, 2, 5 ] ),
					[ nodeA, nodeB ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before node from transforming range start path: increment index on range start path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 1 ] ),
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.howMany = 1;
				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 6 ];
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'target at start boundary of transforming move range: increment source offset', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 4 ] ),
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expected.sourcePosition.offset = 6;

				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target at end boundary of transforming move range: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 6 ] ),
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target inside a node from transforming range: no operation update', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 4, 1, 0 ] ),
					2,
					new Position( root, [ 2, 2, 5, 1 ] ),
					0
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
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation
				} );
			} );

			it( 'range is same as transforming range and is less important: update range path', () => {
				const transformBy = new MoveOperation(
					op.sourcePosition,
					op.howMany,
					new Position( root, [ 4, 1, 0 ] ),
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expected.sourcePosition.path = [ 4, 1, 0 ];

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'range contains transforming range and is important: convert to NoOperation', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation
				} );
			} );

			it( 'range contains transforming range and is less important: update range path', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					0
				);

				const transOp = transform( op, transformBy, strongContext );

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
					0
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
					0
				);

				const transOp = transform( op, transformBy, strongContext );

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
					0
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
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition = new Position( otherRoot, [ 4, 1, 1 ] );
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition = new Position( root, [ 2, 2, 3 ] );
				expected.targetPosition = targetPosition.getShiftedBy( 1 );

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on right side of transforming range and is important: shrink range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					0
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
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition = sourcePosition;
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition = new Position( root, [ 4, 1, 0 ] );
				expected.targetPosition = targetPosition.getShiftedBy( 1 );

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on left side, target inside transforming range and is important: split into two operations', () => {
				op.howMany = 4;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					2,
					new Position( root, [ 2, 2, 6 ] ),
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 3 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 5 ];
				expected.howMany = 2;
				expected.targetPosition = targetPosition.getShiftedBy( 1 );

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects on left side, target inside transforming range and is less important: split into two operations', () => {
				op.howMany = 4;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 3 ] ),
					2,
					new Position( root, [ 2, 2, 6 ] ),
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 3 );

				expected.sourcePosition.path = [ 2, 2, 3 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 1;
				expected.targetPosition = targetPosition.getShiftedBy( 1 );

				expectOperation( transOp[ 1 ], expected );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 2;
				expected.targetPosition = targetPosition.getShiftedBy( 2 );

				expectOperation( transOp[ 2 ], expected );
			} );

			it( 'range intersects on right side of transforming range and is important: shrink range', () => {
				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					0
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
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition = sourcePosition;
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition = new Position( root, [ 4, 1, 0 ] );
				expected.targetPosition = targetPosition.getShiftedBy( 1 );

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects, target inside transforming range and is important: split into two operations', () => {
				op.targetPosition.path = [ 2, 2, 7 ];

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.targetPosition.path = [ 4, 1, 2 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 4, 1, 0 ];
				expected.targetPosition.path = [ 4, 1, 3 ];

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range intersects, target inside transforming range and is less important: shrink range', () => {
				op.targetPosition.path = [ 2, 2, 7 ];

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					4,
					new Position( root, [ 4, 1, 0 ] ),
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 2 );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.targetPosition = targetPosition.getShiftedBy( 1 );

				expectOperation( transOp[ 1 ], expected );
			} );

			it( 'range inside transforming range and is less important: split into three operations', () => {
				op.howMany = 4;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 4, 1, 0 ] ),
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 3 );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.howMany = 1;

				expectOperation( transOp[ 0 ], expected );

				expected.sourcePosition.path = [ 4, 1, 0 ];
				expected.targetPosition = targetPosition.getShiftedBy( 1 );
				expected.howMany = 2;

				expectOperation( transOp[ 1 ], expected );

				expected.sourcePosition.path = [ 2, 2, 4 ];
				expected.targetPosition = targetPosition.getShiftedBy( 3 );
				expected.howMany = 1;

				expectOperation( transOp[ 2 ], expected );
			} );

			it( 'range and target inside transforming range and is important: no operation update', () => {
				op.howMany = 6;

				const transformBy = new MoveOperation(
					new Position( root, [ 2, 2, 5 ] ),
					2,
					new Position( root, [ 2, 2, 9 ] ),
					0
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
					0
				);

				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 1 );

				expected.howMany = 6;

				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MoveOperation to graveyard', () => {
			let transformBy;

			beforeEach( () => {
				transformBy = new MoveOperation(
					op.sourcePosition.clone(),
					op.howMany,
					new Position( doc.graveyard, [ 0 ] ),
					0
				);
			} );

			it( 'should skip context.aIsStrong and be less important than MoveOperation', () => {
				const transOp = transform( op, transformBy, strongContext );

				expect( transOp.length ).to.equal( 1 );

				expectOperation( transOp[ 0 ], {
					type: NoOperation
				} );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 2, 2, 4 ] ), 'oldName', 'newName', 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 2, 2, 3 ] ), new Position( root, [ 2, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, model.markers, false, 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'MoveOperation to graveyard', () => {
		describe( 'by MoveOperation', () => {
			it( 'should force removing content even if was less important', () => {
				const op = new MoveOperation( new Position( root, [ 8 ] ), 2, new Position( doc.graveyard, [ 0 ] ), 0 );

				const targetPosition = op.targetPosition.clone();

				const transformBy = new MoveOperation( new Position( root, [ 8 ] ), 2, new Position( root, [ 1 ] ), 0 );

				const sourcePosition = transformBy.targetPosition.clone();

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );

				expectOperation( transOp[ 0 ], {
					type: MoveOperation,
					howMany: 2,
					sourcePosition,
					targetPosition
				} );
			} );
		} );
	} );

	describe( 'NoOperation', () => {
		beforeEach( () => {
			op = new NoOperation( 0 );

			expected = {
				type: NoOperation
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0 ] ),
					'a',
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by NoOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new NoOperation( 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no position update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 0, 2, 0 ] ), 'oldName', 'newName', 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no position update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, model.markers, false, 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );

	describe( 'RenameOperation', () => {
		beforeEach( () => {
			const position = new Position( root, [ 0, 2, 2 ] );

			op = new RenameOperation( position, 'oldName', 'newName', 0 );

			expected = {
				position,
				oldName: 'oldName',
				newName: 'newName'
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'target before renamed element: offset update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 2, 1 ] ),
					[ nodeA, nodeB ],
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target before a node on path to renamed element: path update', () => {
				const transformBy = new InsertOperation(
					new Position( root, [ 0, 1 ] ),
					[ nodeA, nodeB ],
					0
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
					0
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
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'no operation update', () => {
				const newRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 8 ] ) );
				const transformBy = new MarkerOperation( 'name', null, newRange, model.markers, false, 0 );

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
					0
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation
				} );
			} );

			it( 'same element and is not important: change old name to new name', () => {
				const transformBy = new RenameOperation(
					new Position( root, [ 0, 2, 2 ] ),
					'oldName',
					'otherName',
					0
				);

				const transOp = transform( op, transformBy, strongContext );

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
					0
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
					0
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
					0
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
					0
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
					0
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
					0
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
			oldRange = new Range( Position._createAt( root, 1 ), Position._createAt( root, 4 ) );
			newRange = new Range( Position._createAt( root, 10 ), Position._createAt( root, 12 ) );
			op = new MarkerOperation( 'name', oldRange, newRange, model.markers, false, 0 );

			expected = {
				name: 'name',
				oldRange,
				newRange
			};
		} );

		describe( 'by InsertOperation', () => {
			it( 'insert position affecting oldRange: update oldRange', () => {
				// Just CC things.
				op.newRange = null;
				const transformBy = new InsertOperation( Position._createAt( root, 0 ), [ nodeA, nodeB ], 0 );

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
				const transformBy = new InsertOperation( Position._createAt( root, 8 ), [ nodeA, nodeB ], 0 );

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
					0
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

				const transformBy = new MoveOperation( Position._createAt( root, 0 ), 1, Position._createAt( root, 20 ), 0 );
				const transOp = transform( op, transformBy );

				expected.newRange = null;
				expected.oldRange.start.offset = 0;
				expected.oldRange.end.offset = 3;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'moved range contains oldRange and is before newRange: update oldRange and newRange', () => {
				const transformBy = new MoveOperation( Position._createAt( root, 2 ), 2, Position._createAt( root, 20 ), 0 );
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

				const transformBy = new MoveOperation( Position._createAt( root, 20 ), 2, Position._createAt( root, 11 ), 0 );
				const transOp = transform( op, transformBy );

				expected.oldRange = null;
				expected.newRange.start.offset = 10;
				expected.newRange.end.offset = 14;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'target position is inside oldRange and before newRange: update oldRange and newRange', () => {
				const transformBy = new MoveOperation( Position._createAt( root, 20 ), 4, Position._createAt( root, 2 ), 0 );
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
					0
				);

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'no operation update', () => {
				const transformBy = new RenameOperation( new Position( root, [ 1 ] ), 'oldName', 'newName', 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'different marker name: no operation update', () => {
				const transformBy = new MarkerOperation( 'otherName', oldRange, newRange, model.markers, false, 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );

			it( 'same marker name and is important: convert to NoOperation', () => {
				const anotherRange = new Range( Position._createAt( root, 2 ), Position._createAt( root, 2 ) );
				const transformBy = new MarkerOperation( 'name', oldRange, anotherRange, model.markers, false, 0 );

				const transOp = transform( op, transformBy );

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], {
					type: NoOperation
				} );
			} );

			it( 'same marker name and is less important: update oldRange parameter', () => {
				const anotherRange = new Range( Position._createAt( root, 2 ), Position._createAt( root, 2 ) );
				const transformBy = new MarkerOperation( 'name', oldRange, anotherRange, model.markers, false, 0 );

				const transOp = transform( op, transformBy, strongContext );

				expected.oldRange = anotherRange;

				expect( transOp.length ).to.equal( 1 );
				expectOperation( transOp[ 0 ], expected );
			} );
		} );
	} );
} );

describe( 'transformSets', () => {
	let model, doc, root, node;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		node = new Node();
	} );

	it( 'originalOperations should correctly link transformed operations with original operations #1', () => {
		const position = new Position( root, [ 0 ] );

		const a = new InsertOperation( position, [ node ], 0 );

		const { operationsA, originalOperations } = transformSets( [ a ], [], {
			document: doc,
			useRelations: false,
			padWithNoOps: false
		} );

		expect( originalOperations.get( operationsA[ 0 ] ) ).to.equal( a );
	} );

	it( 'originalOperations should correctly link transformed operations with original operations #2', () => {
		const position = new Position( root, [ 0 ] );

		const b = new InsertOperation( position, [ node ], 0 );

		const { operationsB, originalOperations } = transformSets( [], [ b ], {
			document: doc,
			useRelations: false,
			padWithNoOps: false
		} );

		expect( originalOperations.get( operationsB[ 0 ] ) ).to.equal( b );
	} );

	it( 'originalOperations should correctly link transformed operations with original operations #3', () => {
		const position = new Position( root, [ 4 ] );

		const a = new InsertOperation( position, [ node ], 0 );
		const b = new AttributeOperation(
			new Range(
				new Position( root, [ 2 ] ),
				new Position( root, [ 11 ] )
			),
			'foo',
			'bar',
			'xyz',
			0
		);

		const { operationsA, operationsB, originalOperations } = transformSets( [ a ], [ b ], {
			document: doc,
			useRelations: false,
			padWithNoOps: false
		} );

		expect( originalOperations.get( operationsA[ 0 ] ) ).to.equal( a );
		expect( originalOperations.get( operationsB[ 0 ] ) ).to.equal( b );
		expect( originalOperations.get( operationsB[ 1 ] ) ).to.equal( b );
	} );
} );
