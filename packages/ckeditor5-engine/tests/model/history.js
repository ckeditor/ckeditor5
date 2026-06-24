/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { History } from '../../src/model/history.js';
import { Operation } from '../../src/model/operation/operation.js';

describe( 'History', () => {
	let history;

	beforeEach( () => {
		history = new History();
	} );

	describe( 'constructor()', () => {
		it( 'should create an empty History instance', () => {
			expect( history.getOperations().length ).toBe( 0 );
			expect( history.getOperations().length ).toBe( 0 );
		} );

		it( 'should set the version to 0', () => {
			expect( history.version ).toBe( 0 );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should reset the history of operations', () => {
			const op1 = new Operation( 0 );
			const op2 = new Operation( 1 );
			history.addOperation( op1 );
			history.addOperation( op2 );

			history.reset();

			expect( history.getOperations() ).toEqual( [] );
			expect( history.version ).toBe( 0 );
			expect( history.lastOperation ).toBeUndefined();
		} );

		it( 'should reset the history of undone operations', () => {
			const undone = new Operation( 0 );
			const undoing = new Operation( 1 );

			history.addOperation( undone );
			history.addOperation( undoing );

			history.setOperationAsUndone( undone, undoing );

			history.reset();

			expect( history.isUndoingOperation( undoing ) ).toBe( false );
			expect( history.isUndoneOperation( undone ) ).toBe( false );
			expect( history.getUndoneOperation( undoing ) ).toBeUndefined();
		} );
	} );

	describe( 'addOperation()', () => {
		it( 'should save operation in the history', () => {
			const op = new Operation( 0 );

			history.addOperation( op );

			const ops = history.getOperations();
			expect( ops.length ).toBe( 1 );
			expect( ops[ 0 ] ).toBe( op );
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
			expect( historyOperations ).toEqual( ops );
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

			expect( historyOperation0 ).toBe( op0 );
			expect( historyOperation1 ).toBe( op1 );
			expect( historyOperation2 ).toBe( op2 );
		} );

		it( 'should return undefined if operation has not been found in history', () => {
			const op0 = new Operation( 0 );

			history.addOperation( op0 );

			expect( history.getOperation( -1 ) ).toBeUndefined();
			expect( history.getOperation( 10 ) ).toBeUndefined();
		} );
	} );

	describe( 'getOperations()', () => {
		it( 'should return all operations if no argument is provided', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			const versions = history.getOperations()
				.map( operation => operation.baseVersion );

			expect( versions ).toEqual( [ 0, 1, 2 ] );
		} );

		it( 'should return only operations from given base version', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			const versions = history.getOperations( 1 )
				.map( operation => operation.baseVersion );

			expect( versions ).toEqual( [ 1, 2 ] );
		} );

		it( 'should return only operations up to given base version', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			const ops = history.getOperations( 1, 2 );

			expect( ops.length ).toBe( 1 );
			expect( ops[ 0 ].baseVersion ).toBe( 1 );
		} );

		it( 'should return empty array if no operations match', () => {
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );

			expect( history.getOperations( 2 ).length ).toBe( 0 );
			expect( history.getOperations( -3, 0 ).length ).toBe( 0 );
		} );

		it( 'should return correct values if history holds operations with negative base version', () => {
			history.version = -2;

			history.addOperation( new Operation( -2 ) );
			history.addOperation( new Operation( -1 ) );
			history.addOperation( new Operation( 0 ) );
			history.addOperation( new Operation( 1 ) );
			history.addOperation( new Operation( 2 ) );

			expect( getVersions( history.getOperations( -1, 2 ) ) ).toEqual( [ -1, 0, 1 ] );
		} );

		describe( 'for history with version gaps', () => {
			it( 'should return correct operations if the history starts with a gap', () => {
				history.version = 10;

				history.addOperation( new Operation( 10 ) );
				history.addOperation( new Operation( 11 ) );
				history.addOperation( new Operation( 12 ) );
				history.addOperation( new Operation( 13 ) );

				expect( getVersions( history.getOperations( 0, 10 ) ) ).toEqual( [] );
				expect( getVersions( history.getOperations( 0 ) ) ).toEqual( [ 10, 11, 12, 13 ] );
				expect( getVersions( history.getOperations( 12 ) ) ).toEqual( [ 12, 13 ] );
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
					expect( getVersions( history.getOperations() ) ).toEqual( [ -10, -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -10 ) ) ).toEqual( [ -10, -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -30 ) ) ).toEqual( [ -10, -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -30, 300 ) ) ).toEqual( [ -10, -9, 0, 1, 10, 11 ] );
				} );

				it( 'range starts in the middle of the history', () => {
					expect( getVersions( history.getOperations( -9 ) ) ).toEqual( [ -9, 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -5 ) ) ).toEqual( [ 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( 0 ) ) ).toEqual( [ 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( 1 ) ) ).toEqual( [ 1, 10, 11 ] );
					expect( getVersions( history.getOperations( 5 ) ) ).toEqual( [ 10, 11 ] );
					expect( getVersions( history.getOperations( 11 ) ) ).toEqual( [ 11 ] );
					expect( getVersions( history.getOperations( 12 ) ) ).toEqual( [] );
				} );

				it( 'range ends in the middle of history', () => {
					expect( getVersions( history.getOperations( -5, 5 ) ) ).toEqual( [ 0, 1 ] );
					expect( getVersions( history.getOperations( -5, 10 ) ) ).toEqual( [ 0, 1 ] );
					expect( getVersions( history.getOperations( -5, 11 ) ) ).toEqual( [ 0, 1, 10 ] );
					expect( getVersions( history.getOperations( -5, 12 ) ) ).toEqual( [ 0, 1, 10, 11 ] );
					expect( getVersions( history.getOperations( -5, 300 ) ) ).toEqual( [ 0, 1, 10, 11 ] );
				} );

				it( 'empty ranges', () => {
					expect( getVersions( history.getOperations( -11, -11 ) ) ).toEqual( [] );
					expect( getVersions( history.getOperations( -10, -10 ) ) ).toEqual( [] );
					expect( getVersions( history.getOperations( -9, -9 ) ) ).toEqual( [] );
					expect( getVersions( history.getOperations( 0, 0 ) ) ).toEqual( [] );
					expect( getVersions( history.getOperations( 1, 1 ) ) ).toEqual( [] );
					expect( getVersions( history.getOperations( 9, 9 ) ) ).toEqual( [] );
					expect( getVersions( history.getOperations( 10, 10 ) ) ).toEqual( [] );
					expect( getVersions( history.getOperations( 12, 12 ) ) ).toEqual( [] );
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
			expect( history.isUndoingOperation( undoing ) ).toBe( true );
		} );

		it( 'should return false if operation is not an undoing operation', () => {
			const operation = new Operation();

			expect( history.isUndoingOperation( operation ) ).toBe( false );
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
			expect( history.isUndoneOperation( undone ) ).toBe( true );
		} );

		it( 'should return false if operation is not an undone', () => {
			const operation = new Operation();

			expect( history.isUndoneOperation( operation ) ).toBe( false );
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
			expect( history.getUndoneOperation( undoing ) ).toBe( undone );
		} );

		it( 'should return undefined if given operation is not an undoing operation', () => {
			const op = new Operation( 0 );

			expect( history.getUndoneOperation( undone ) ).toBeUndefined();
			expect( history.getUndoneOperation( op ) ).toBeUndefined();
		} );
	} );
} );

function getVersions( operations ) {
	return operations.map( op => op.baseVersion );
}
