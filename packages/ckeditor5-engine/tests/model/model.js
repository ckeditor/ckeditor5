/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../src/model/model';

describe( 'Model', () => {
	let model;
	let changes = '';

	beforeEach( () => {
		model = new Model();
		changes = '';
	} );

	describe( 'change & enqueueChange', () => {
		it( 'should execute changes immediately', () => {
			model.change( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'A' );
		} );

		it( 'should pass returned value', () => {
			const ret = model.change( () => {
				changes += 'A';

				return 'B';
			} );

			changes += ret;

			expect( changes ).to.equal( 'AB' );
		} );

		it( 'should not mixed the order when nested change is called', () => {
			const ret = model.change( () => {
				changes += 'A';

				nested();

				return 'D';
			} );

			changes += ret;

			expect( changes ).to.equal( 'ABCD' );

			function nested() {
				const ret = model.change( () => {
					changes += 'B';

					return 'C';
				} );

				changes += ret;
			}
		} );

		it( 'should execute enqueueChanges immediately if its the first block', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nested();
			} );

			expect( changes ).to.equal( 'ABC' );

			function nested() {
				const ret = model.change( () => {
					changes += 'B';

					return 'C';
				} );

				changes += ret;
			}
		} );

		it( 'should be possible to enqueueChanges immediately if its the first block', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nested();
			} );

			expect( changes ).to.equal( 'AB' );

			function nested() {
				model.change( () => {
					changes += 'B';
				} );
			}
		} );

		it( 'should be possible to nest change in enqueueChanges', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nested();

				changes += 'D';
			} );

			expect( changes ).to.equal( 'ABCD' );

			function nested() {
				const ret = model.change( () => {
					changes += 'B';

					return 'C';
				} );

				changes += ret;
			}
		} );

		it( 'should be possible to nest enqueueChanges in enqueueChanges', () => {
			model.enqueueChange( () => {
				changes += 'A';

				nestedEnqueue();

				changes += 'B';
			} );

			expect( changes ).to.equal( 'ABC' );

			function nestedEnqueue() {
				model.enqueueChange( () => {
					changes += 'C';
				} );
			}
		} );

		it( 'should be possible to nest enqueueChanges in changes', () => {
			const ret = model.change( () => {
				changes += 'A';

				nestedEnqueue();

				changes += 'B';

				return 'D';
			} );

			changes += ret;

			expect( changes ).to.equal( 'ABCD' );

			function nestedEnqueue() {
				model.enqueueChange( () => {
					changes += 'C';
				} );
			}
		} );

		it( 'should be possible to nest enqueueChanges in enqueueChanges event', () => {
			model.once( 'change', () => {
				model.enqueueChange( () => {
					changes += 'C';
				} );

				changes += 'B';
			} );

			model.on( 'changesDone', () => {
				changes += 'D';
			} );

			model.enqueueChange( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABCD' );
		} );

		it( 'should be possible to nest enqueueChanges in changes event', () => {
			model.once( 'change', () => {
				model.enqueueChange( () => {
					changes += 'C';
				} );

				changes += 'B';
			} );

			model.on( 'changesDone', () => {
				changes += 'D';
			} );

			model.change( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABCD' );
		} );

		it( 'should be possible to nest changes in enqueueChanges event', () => {
			model.once( 'change', () => {
				model.change( () => {
					changes += 'B';
				} );

				changes += 'C';
			} );

			model.on( 'changesDone', () => {
				changes += 'D';
			} );

			model.enqueueChange( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABCD' );
		} );

		it( 'should be possible to nest changes in changes event', () => {
			model.once( 'change', () => {
				model.change( () => {
					changes += 'B';
				} );

				changes += 'C';
			} );

			model.on( 'changesDone', () => {
				changes += 'D';
			} );

			model.change( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABCD' );
		} );

		it( 'should let mix blocks', () => {
			model.once( 'change', () => {
				model.change( () => {
					changes += 'B';

					nestedEnqueue();
				} );

				model.change( () => {
					changes += 'C';
				} );

				changes += 'D';
			} );

			model.on( 'changesDone', () => {
				changes += 'F';
			} );

			model.change( () => {
				changes += 'A';
			} );

			expect( changes ).to.equal( 'ABCDEF' );

			function nestedEnqueue() {
				model.enqueueChange( () => {
					changes += 'E';
				} );
			}
		} );

		it( 'should use the same writer in all change blocks (change & change)', () => {
			model.change( outerWriter => {
				model.change( innerWriter => {
					expect( innerWriter ).to.equal( outerWriter );
				} );
			} );
		} );

		it( 'should create new writer in enqueue block', () => {
			model.change( outerWriter => {
				model.enqueueChange( innerWriter => {
					expect( innerWriter ).to.not.equal( outerWriter );
					expect( innerWriter.batch ).to.not.equal( outerWriter.batch );
				} );
			} );
		} );

		it( 'should let you pass batch', () => {
			let outerBatch;

			model.change( outerWriter => {
				outerBatch = outerWriter.batch;

				model.enqueueChange( outerBatch, innerWriter => {
					expect( innerWriter.batch ).to.equal( outerBatch );
				} );
			} );
		} );

		it( 'should let you create transparent batch', () => {
			model.enqueueChange( 'transparent', writer => {
				expect( writer.batch.type ).to.equal( 'transparent' );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy document', () => {
			sinon.spy( model.document, 'destroy' );

			model.destroy();

			sinon.assert.calledOnce( model.document.destroy );
		} );

		it( 'should stop listening', () => {
			const spy = sinon.spy();

			model.on( 'event', spy );

			model.destroy();

			model.fire( 'event' );

			sinon.assert.notCalled( spy );
		} );
	} );
} );
