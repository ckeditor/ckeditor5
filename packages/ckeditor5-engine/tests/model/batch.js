/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Batch } from '../../src/model/batch.js';
import { Operation } from '../../src/model/operation/operation.js';
import { Model } from '../../src/model/model.js';

describe( 'Batch', () => {
	describe( 'constructor', () => {
		it( 'should set default types', () => {
			const batch = new Batch();

			expect( batch.isUndoable ).toBe( true );
			expect( batch.isLocal ).toBe( true );
			expect( batch.isUndo ).toBe( false );
			expect( batch.isTyping ).toBe( false );
		} );

		it( 'should set batch types accordingly', () => {
			const batch = new Batch( { isUndoable: false, isLocal: false, isUndo: true, isTyping: true } );

			expect( batch.isUndoable ).toBe( false );
			expect( batch.isLocal ).toBe( false );
			expect( batch.isUndo ).toBe( true );
			expect( batch.isTyping ).toBe( true );
		} );

		it( 'should allow setting only some of the batch types', () => {
			const batch = new Batch( { isUndoable: false, isLocal: false } );

			expect( batch.isUndoable ).toBe( false );
			expect( batch.isLocal ).toBe( false );
			expect( batch.isUndo ).toBe( false );
			expect( batch.isTyping ).toBe( false );
		} );

		describe( 'deprecated string type', () => {
			let stub;

			beforeEach( () => {
				stub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			} );

			afterEach( () => {
				vi.restoreAllMocks();
			} );

			it( 'when set to "default" should set default properties and log warning on console', () => {
				const batch = new Batch( 'default' );

				expect( batch.isUndoable ).toBe( true );
				expect( batch.isLocal ).toBe( true );
				expect( batch.isUndo ).toBe( false );
				expect( batch.isTyping ).toBe( false );

				expect( stub ).toHaveBeenCalledWith(
					expect.stringContaining( 'batch-constructor-deprecated-string-type' ),
					expect.any( String )
				);
			} );

			it( 'when set to "transparent" should set isUndoable to false and log warning on console', () => {
				const batch = new Batch( 'transparent' );

				expect( batch.isUndoable ).toBe( false );
				expect( batch.isLocal ).toBe( true );
				expect( batch.isUndo ).toBe( false );
				expect( batch.isTyping ).toBe( false );

				expect( stub ).toHaveBeenCalledWith(
					expect.stringContaining( 'batch-constructor-deprecated-string-type' ),
					expect.any( String )
				);
			} );
		} );
	} );

	describe( 'addOperation()', () => {
		it( 'should add operation to the batch', () => {
			const batch = new Batch();
			const op = new Operation( 0 );

			batch.addOperation( op );

			expect( batch.operations.length ).toBe( 1 );
			expect( batch.operations[ 0 ] ).toBe( op );
		} );
	} );

	describe( 'baseVersion', () => {
		it( 'should return base version of the first operation from the batch', () => {
			const batch = new Batch();
			const operation = new Operation( 2 );
			batch.addOperation( operation );

			expect( batch.baseVersion ).toBe( 2 );
		} );

		it( 'should return null if there are no operations in batch', () => {
			const batch = new Batch();

			expect( batch.baseVersion ).toBeNull();
		} );

		it( 'should return null if all operations in batch have base version set to null', () => {
			const batch = new Batch();

			const opA = new Operation( null );
			const opB = new Operation( null );

			batch.addOperation( opA );
			batch.addOperation( opB );

			expect( batch.baseVersion ).toEqual( null );
		} );

		it( 'should skip operations with null baseVersion when looking for the first non-null', () => {
			const batch = new Batch();
			const opA = new Operation( 2 );

			batch.addOperation( opA );
			opA.baseVersion = null;

			expect( batch.baseVersion ).toBeNull();
		} );

		it( 'should return a non-null base version for a batch produced by a real model change', () => {
			const model = new Model();
			const root = model.document.createRoot();

			let batch;

			model.change( writer => {
				writer.insertText( 'foo', root, 0 );
				batch = writer.batch;
			} );

			expect( batch.baseVersion ).toBeGreaterThanOrEqual( 0 );
		} );
	} );
} );
