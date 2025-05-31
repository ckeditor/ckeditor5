/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Batch from '../../src/model/batch.js';
import Operation from '../../src/model/operation/operation.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'Batch', () => {
	describe( 'constructor', () => {
		it( 'should set default types', () => {
			const batch = new Batch();

			expect( batch.isUndoable ).to.be.true;
			expect( batch.isLocal ).to.be.true;
			expect( batch.isUndo ).to.be.false;
			expect( batch.isTyping ).to.be.false;
		} );

		it( 'should set batch types accordingly', () => {
			const batch = new Batch( { isUndoable: false, isLocal: false, isUndo: true, isTyping: true } );

			expect( batch.isUndoable ).to.be.false;
			expect( batch.isLocal ).to.be.false;
			expect( batch.isUndo ).to.be.true;
			expect( batch.isTyping ).to.be.true;
		} );

		it( 'should allow setting only some of the batch types', () => {
			const batch = new Batch( { isUndoable: false, isLocal: false } );

			expect( batch.isUndoable ).to.be.false;
			expect( batch.isLocal ).to.be.false;
			expect( batch.isUndo ).to.be.false;
			expect( batch.isTyping ).to.be.false;
		} );

		describe( 'deprecated string type', () => {
			let stub;

			testUtils.createSinonSandbox();

			beforeEach( () => {
				stub = testUtils.sinon.stub( console, 'warn' );
			} );

			it( 'when set to "default" should set default properties and log warning on console', () => {
				const batch = new Batch( 'default' );

				expect( batch.isUndoable ).to.be.true;
				expect( batch.isLocal ).to.be.true;
				expect( batch.isUndo ).to.be.false;
				expect( batch.isTyping ).to.be.false;

				sinon.assert.calledWithMatch( stub, 'batch-constructor-deprecated-string-type' );
			} );

			it( 'when set to "transparent" should set isUndoable to false and log warning on console', () => {
				const batch = new Batch( 'transparent' );

				expect( batch.isUndoable ).to.be.false;
				expect( batch.isLocal ).to.be.true;
				expect( batch.isUndo ).to.be.false;
				expect( batch.isTyping ).to.be.false;

				sinon.assert.calledWithMatch( stub, 'batch-constructor-deprecated-string-type' );
			} );
		} );
	} );

	describe( 'addOperation()', () => {
		it( 'should add operation to the batch', () => {
			const batch = new Batch();
			const op = new Operation( 0 );

			batch.addOperation( op );

			expect( batch.operations.length ).to.equal( 1 );
			expect( batch.operations[ 0 ] ).to.equal( op );
		} );
	} );

	describe( 'baseVersion', () => {
		it( 'should return base version of the first operation from the batch', () => {
			const batch = new Batch();
			const operation = new Operation( 2 );
			batch.addOperation( operation );

			expect( batch.baseVersion ).to.equal( 2 );
		} );

		it( 'should return null if there are no operations in batch', () => {
			const batch = new Batch();

			expect( batch.baseVersion ).to.be.null;
		} );

		it( 'should return null if all operations in batch have base version set to null', () => {
			const batch = new Batch();

			const opA = new Operation( null );
			const opB = new Operation( null );

			batch.addOperation( opA );
			batch.addOperation( opB );

			expect( batch.baseVersion ).to.equal( null );
		} );
	} );
} );
