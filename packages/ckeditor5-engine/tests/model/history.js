/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import History from '../../src/model/history.js';
import Operation from '../../src/model/operation/operation.js';

describe( 'History', () => {
	let history;

	beforeEach( () => {
		history = new History();
	} );

	describe( 'constructor()', () => {
		it( 'should create an empty History instance', () => {
			expect( history.getOperations().length ).to.equal( 0 );
			expect( history.getOperations().length ).to.equal( 0 );
		} );

		it( 'should set the version to 0', () => {
			expect( history.version ).to.equal( 0 );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should reset the history of operations', () => {
			const op1 = new Operation( 0 );
			const op2 = new Operation( 1 );
			history.addOperation( op1 );
			history.addOperation( op2 );

			history.reset();

			expect( history.getOperations() ).to.deep.equal( [] );
			expect( history.version ).to.equal( 0 );
			expect( history.lastOperation ).to.be.undefined;
		} );

		it( 'should reset the history of undone operations', () => {
			const undone = new Operation( 0 );
			const undoing = new Operation( 1 );

			history.addOperation( undone );
			history.addOperation( undoing );

			history.setOperationAsUndone( undone, undoing );

			history.reset();

			expect( history.isUndoingOperation( undoing ) ).to.equal( false );
			expect( history.isUndoneOperation( undone ) ).to.equal( false );
			expect( history.getUndoneOperation( undoing ) ).to.be.undefined;
		} );
	} );

	describe( 'addOperation()', () => {
		it( 'should save operation in the history', () => {
			const op = new Operation( 0 );

			history.addOperation( op );

			const ops = history.getOperations();
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

	describe( 'getOperation()', () => {
		it( 'should return operation with given base version', () => {
			const op0 = new Operation( 0 );
			const op1 = new Operation( 1 );
			const op2 = new Operation( 2 );

			history.addOperation( op0 );
			history.addOperation( op1 );
			history.addOperation( op2 );

			const historyOperation0 = history.getOperation( 0 );
			const historyOperation1 = history.getOperation( 1 );
			const historyOperation2 = history.getOperation( 2 );

			expect( historyOperation0 ).to.equal( op0 );
			expect( historyOperation1 ).to.equal( op1 );
			expect( historyOperation2 ).to.equal( op2 );
		} );

		it( 'should return undefined if operation has not been found in history', () => {
			const op0 = new Operation( 0 );

			history.addOperation( op0 );

			expect( history.getOperation( -1 ) ).to.be.undefined;
			expect( history.getOperation( 10 ) ).to.be.undefined;
		} );
	} );

	describe( 'getOperations()', () => {
		it( 'should return all operations if no argument is provided', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			const versions = history.getOperations()
				.map( operation => operation.baseVersion );

			expect( versions ).to.deep.equal( [ 0, 1, 2 ] );
		} );

		it( 'should return only operations from given base version', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			const versions = history.getOperations( 1 )
				.map( operation => operation.baseVersion );

			expect( versions ).to.deep.equal( [ 1, 2 ] );
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

			expect( history.getOperations( 2 ).length ).to.equal( 0 );
			expect( history.getOperations( -3, 0 ).length ).to.equal( 0 );
		} );

		it( 'should return correct values if history holds operations with negative base version', () => {
			history.version = -2;

			history.addOperation( new Operation( -2 ) );
			history.addOperation( new Operation( -1 ) );
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			expect( getVersions( history.getOperations( -1, 2 ) ) ).to.deep.equal( [ -1, 0, 1 ] );
		} );

		describe( 'for history with version gaps', () => {
			it( 'should return correct operations if the history starts with a gap', () => {
				history.version = 10;

				history.addOperation( new Operation( 10 ) );
				history.addOperation( new Operation( 11 ) );
				history.addOperation( new Operation( 12 ) );
				history.addOperation( new Operation( 13 ) );

				expect( getVersions( history.getOperations( 0, 10 ) ) ).to.deep.equal( [] );
				expect( getVersions( history.getOperations( 0 ) ) ).to.deep.equal( [ 10, 11, 12, 13 ] );
				expect( getVersions( history.getOperations( 12 ) ) ).to.deep.equal( [ 12, 13 ] );
			} );

			describe( 'should return correct operations if the history contains a gap', () => {
				beforeEach( () => {
					history.version = -10;

					history.addOperation( new Operation( -10 ) );
					history.addOperation( new Operation( -9 ) );

					history.version = 0;

					history.addOperation( new Operation( 0 ) );
					history.addOperation( new Operation( 1 ) );

					history.version = 10;

					history.addOperation( new Operation( 10 ) );
					history.addOperation( new Operation( 11 ) );
				} );

				it( 'range larger than the history', () => {
					expect( getVersions( history.getOperations() ) ).to.deep.equal( [ -10, -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -10 ) ) ).to.deep.equal( [ -10, -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -30 ) ) ).to.deep.equal( [ -10, -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -30, 300 ) ) ).to.deep.equal( [ -10, -9, 0, 1, 10, 11 ] );
				} );

				it( 'range starts in the middle of the history', () => {
					expect( getVersions( history.getOperations( -9 ) ) ).to.deep.equal( [ -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -5 ) ) ).to.deep.equal( [ 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( 0 ) ) ).to.deep.equal( [ 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( 1 ) ) ).to.deep.equal( [ 1, 10, 11 ] );
					expect( getVersions( history.getOperations( 5 ) ) ).to.deep.equal( [ 10, 11 ] );
					expect( getVersions( history.getOperations( 11 ) ) ).to.deep.equal( [ 11 ] );
					expect( getVersions( history.getOperations( 12 ) ) ).to.deep.equal( [] );
				} );

				it( 'range ends in the middle of history', () => {
					expect( getVersions( history.getOperations( -5, 5 ) ) ).to.deep.equal( [ 0, 1 ] );
					expect( getVersions( history.getOperations( -5, 10 ) ) ).to.deep.equal( [ 0, 1 ] );
					expect( getVersions( history.getOperations( -5, 11 ) ) ).to.deep.equal( [ 0, 1, 10 ] );
					expect( getVersions( history.getOperations( -5, 12 ) ) ).to.deep.equal( [ 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -5, 300 ) ) ).to.deep.equal( [ 0, 1, 10, 11 ] );
				} );

				it( 'empty ranges', () => {
					expect( getVersions( history.getOperations( -11, -11 ) ) ).to.deep.equal( [] );
					expect( getVersions( history.getOperations( -10, -10 ) ) ).to.deep.equal( [] );
					expect( getVersions( history.getOperations( -9, -9 ) ) ).to.deep.equal( [] );
					expect( getVersions( history.getOperations( 0, 0 ) ) ).to.deep.equal( [] );
					expect( getVersions( history.getOperations( 1, 1 ) ) ).to.deep.equal( [] );
					expect( getVersions( history.getOperations( 9, 9 ) ) ).to.deep.equal( [] );
					expect( getVersions( history.getOperations( 10, 10 ) ) ).to.deep.equal( [] );
					expect( getVersions( history.getOperations( 12, 12 ) ) ).to.deep.equal( [] );
				} );
			} );
		} );
	} );

	describe( 'isUndoingOperation()', () => {
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

	describe( 'isUndoneOperation()', () => {
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

	describe( 'getUndoneOperation()', () => {
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

function getVersions( operations ) {
	return operations.map( op => op.baseVersion );
}
