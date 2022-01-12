/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import History from '../../src/model/history';
import Operation from '../../src/model/operation/operation';

describe( 'History', () => {
	let history;

	beforeEach( () => {
		history = new History();
	} );

	describe( 'constructor()', () => {
		it( 'should create an empty History instance', () => {
			expect( Array.from( history.getOperations() ).length ).to.equal( 0 );
		} );
	} );

	describe( 'addOperation', () => {
		it( 'should save operation in the history', () => {
			const op = new Operation( 0 );

			history.addOperation( op );

			const ops = Array.from( history.getOperations() );
			expect( ops.length ).to.equal( 1 );
			expect( ops[ 0 ] ).to.equal( op );
		} );

		it( 'should save each operation only once', () => {
			const op = new Operation( 0 );

			history.addOperation( op );
			history.addOperation( op );

			const ops = Array.from( history.getOperations() );
			expect( ops.length ).to.equal( 1 );
			expect( ops[ 0 ] ).to.equal( op );
		} );

		it( 'should save multiple operations and keep their order', () => {
			const ops = [];

			ops.push( new Operation( 0 ) );
			ops.push( new Operation( 1 ) );
			ops.push( new Operation( 2 ) );

			for ( const op of ops ) {
				history.addOperation( op );
			}

			const historyOperations = history.getOperations();
			expect( historyOperations ).to.deep.equal( ops );
		} );
	} );

	describe( 'getOperation', () => {
		it( 'should return operation with given base version', () => {
			const op0 = new Operation( 0 );
			const op1 = new Operation( 1 );
			const op2 = new Operation( 2 );

			history.addOperation( op0 );
			history.addOperation( op1 );
			history.addOperation( op2 );

			const historyOperation = history.getOperation( 1 );
			expect( historyOperation ).to.equal( op1 );
		} );

		it( 'should return undefined if operation has not been found in history', () => {
			const op0 = new Operation( 0 );

			history.addOperation( op0 );

			expect( history.getOperation( -1 ) ).to.be.undefined;
			expect( history.getOperation( 10 ) ).to.be.undefined;
		} );
	} );

	describe( 'getOperations', () => {
		it( 'should return only operations from given base version', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			const ops = history.getOperations( 1 );

			expect( ops.length ).to.equal( 2 );
			expect( ops[ 0 ].baseVersion ).to.equal( 1 );
			expect( ops[ 1 ].baseVersion ).to.equal( 2 );
		} );

		it( 'should return only operations up to given base version', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			const ops = history.getOperations( 1, 2 );

			expect( ops.length ).to.equal( 1 );
			expect( ops[ 0 ].baseVersion ).to.equal( 1 );
		} );

		it( 'should return empty array if no operations match', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );

			expect( history.getOperations( 20 ).length ).to.equal( 0 );
			expect( history.getOperations( -3, 0 ).length ).to.equal( 0 );
		} );

		it( 'should return correct values if history holds operations with negative base version', () => {
			history.addOperation( new Operation( -2 ) );
			history.addOperation( new Operation( -1 ) );
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			expect( history.getOperations( -1, 2 ).map( op => op.baseVersion ) ).to.deep.equal( [ -1, 0, 1 ] );
		} );

		it( 'should return correct values if history holds operations with base versions that differ by more than one', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 4 ) );
			history.addOperation( new Operation( 6 ) );
			history.addOperation( new Operation( 9 ) );
			history.addOperation( new Operation( 13 ) );

			expect( history.getOperations( 2, 11 ).map( op => op.baseVersion ) ).to.deep.equal( [ 4, 6, 9 ] );
		} );
	} );

	describe( 'isUndoingOperation', () => {
		let undoing, undone;

		beforeEach( () => {
			undone = new Operation( 0 );
			undoing = new Operation( 1 );

			history.addOperation( undone );
			history.addOperation( undoing );

			history.setOperationAsUndone( undone, undoing );
		} );

		it( 'should return true if operation is an undoing operation', () => {
			expect( history.isUndoingOperation( undoing ) ).to.be.true;
		} );

		it( 'should return false if operation is not an undoing operation', () => {
			const operation = new Operation();

			expect( history.isUndoingOperation( operation ) ).to.be.false;
		} );
	} );

	describe( 'isUndoneOperation', () => {
		let undoing, undone;

		beforeEach( () => {
			undone = new Operation( 0 );
			undoing = new Operation( 1 );

			history.addOperation( undone );
			history.addOperation( undoing );

			history.setOperationAsUndone( undone, undoing );
		} );

		it( 'should return true if operation has been set as undone', () => {
			expect( history.isUndoneOperation( undone ) ).to.be.true;
		} );

		it( 'should return false if operation is not an undone', () => {
			const operation = new Operation();

			expect( history.isUndoneOperation( operation ) ).to.be.false;
		} );
	} );

	describe( 'getUndoneOperation', () => {
		let undoing, undone;

		beforeEach( () => {
			undone = new Operation( 0 );
			undoing = new Operation( 1 );

			history.addOperation( undone );
			history.addOperation( undoing );

			history.setOperationAsUndone( undone, undoing );
		} );

		it( 'should return undone operation basing on undoing operation', () => {
			expect( history.getUndoneOperation( undoing ) ).to.equal( undone );
		} );

		it( 'should return undefined if given operation is not an undoing operation', () => {
			const op = new Operation( 0 );

			expect( history.getUndoneOperation( undone ) ).to.be.undefined;
			expect( history.getUndoneOperation( op ) ).to.be.undefined;
		} );
	} );
} );
