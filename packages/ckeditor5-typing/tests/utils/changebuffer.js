/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ChangeBuffer from '../../src/utils/changebuffer';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';

describe( 'ChangeBuffer', () => {
	const CHANGE_LIMIT = 3;
	let model, doc, buffer, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		buffer = new ChangeBuffer( model, CHANGE_LIMIT );
	} );

	describe( 'constructor()', () => {
		it( 'sets all properties', () => {
			expect( buffer ).to.have.property( 'model', model );
			expect( buffer ).to.have.property( 'limit', CHANGE_LIMIT );
			expect( buffer ).to.have.property( 'size', 0 );
			expect( buffer ).to.have.property( 'isLocked', false );
		} );

		it( 'sets limit property according to default value', () => {
			buffer = new ChangeBuffer( model );

			expect( buffer ).to.have.property( 'limit', 20 );
		} );
	} );

	describe( 'locking', () => {
		it( 'is unlocked by default', () => {
			expect( buffer.isLocked ).to.be.false;
		} );

		it( 'is locked by lock method', () => {
			buffer.lock();

			expect( buffer.isLocked ).to.be.true;
		} );

		it( 'is unlocked by unlock method', () => {
			buffer.isLocked = true;

			buffer.unlock();

			expect( buffer.isLocked ).to.be.false;
		} );
	} );

	describe( 'batch', () => {
		it( 'it is set initially', () => {
			expect( buffer ).to.have.property( 'batch' );
			expect( buffer.batch ).to.be.instanceof( Batch );
		} );

		it( 'is reset once changes reaches the limit', () => {
			const batch1 = buffer.batch;

			buffer.input( CHANGE_LIMIT - 1 );

			expect( buffer.batch ).to.equal( batch1 );

			buffer.input( 1 );

			const batch2 = buffer.batch;

			expect( batch2 ).to.be.instanceof( Batch );
			expect( batch2 ).to.not.equal( batch1 );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is reset once changes exceedes the limit', () => {
			const batch1 = buffer.batch;

			// Exceed the limit with one big jump to ensure that >= operator was used.
			buffer.input( CHANGE_LIMIT + 1 );

			expect( buffer.batch ).to.not.equal( batch1 );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is reset once a new batch appears in the document', () => {
			const batch1 = buffer.batch;

			// Ensure that size is reset too.
			buffer.input( 1 );

			model.change( writer => {
				writer.insertText( 'a', root );
			} );

			expect( buffer.batch ).to.not.equal( batch1 );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is not reset when changes are added to the buffer\'s batch', () => {
			const batch1 = buffer.batch;

			model.enqueueChange( buffer.batch, writer => {
				writer.insert( 'a', root );
			} );
			expect( buffer.batch ).to.equal( batch1 );

			model.enqueueChange( buffer.batch, writer => {
				writer.insert( 'b', root );
			} );
			expect( buffer.batch ).to.equal( batch1 );
		} );

		it( 'is not reset when changes are added to batch which existed previously', () => {
			const externalBatch = model.createBatch();

			model.change( writer => {
				writer.insertText( 'a', root );
			} );

			model.enqueueChange( externalBatch, writer => {
				writer.insertText( 'a', root );
			} );

			const bufferBatch = buffer.batch;

			model.enqueueChange( bufferBatch, writer => {
				writer.insertText( 'b', root );
			} );

			expect( buffer.batch ).to.equal( bufferBatch );

			model.change( writer => {
				writer.insertText( 'c', root );
			} );
			expect( buffer.batch ).to.not.equal( bufferBatch );
		} );

		it( 'is not reset when changes are applied in transparent batch', () => {
			const bufferBatch = buffer.batch;

			model.enqueueChange( 'transparent', writer => {
				writer.insert( 'a', root );
			} );

			expect( buffer.batch ).to.equal( bufferBatch );
		} );

		it( 'is not reset while locked', () => {
			const initialBatch = buffer.batch;

			buffer.lock();

			buffer.input( 1 );
			buffer._reset();

			buffer.unlock();

			expect( buffer.batch ).to.equal( initialBatch );
			expect( buffer.size ).to.equal( 1 );
		} );

		it( 'is reset while locked with ignoreLock used', () => {
			const initialBatch = buffer.batch;

			buffer.lock();

			buffer.input( 1 );
			buffer._reset( true );

			buffer.unlock();

			expect( buffer.batch ).to.not.equal( initialBatch );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is reset while locked and limit exceeded', () => {
			const initialBatch = buffer.batch;

			buffer.lock();

			buffer.input( CHANGE_LIMIT + 1 );

			buffer.unlock();

			expect( buffer.batch ).to.not.equal( initialBatch );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is reset while locked and new batch is applied', () => {
			const initialBatch = buffer.batch;

			buffer.lock();

			model.change( writer => {
				writer.insertText( 'a', root );
			} );

			buffer.unlock();

			expect( buffer.batch ).to.not.equal( initialBatch );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is reset on selection change:range', () => {
			const initialBatch = buffer.batch;

			doc.selection.fire( 'change:range' );

			expect( buffer.batch ).to.not.equal( initialBatch );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is reset on selection change:attribute', () => {
			const initialBatch = buffer.batch;

			doc.selection.fire( 'change:attribute' );

			expect( buffer.batch ).to.not.equal( initialBatch );
			expect( buffer.size ).to.equal( 0 );
		} );

		it( 'is not reset on selection change:range while locked', () => {
			const initialBatch = buffer.batch;
			buffer.size = 1;

			buffer.lock();

			doc.selection.fire( 'change:range' );

			buffer.unlock();

			expect( buffer.batch ).to.equal( initialBatch );
			expect( buffer.size ).to.equal( 1 );
		} );

		it( 'is not reset on selection change:attribute while locked', () => {
			const initialBatch = buffer.batch;
			buffer.size = 1;

			buffer.lock();

			doc.selection.fire( 'change:attribute' );

			buffer.unlock();

			expect( buffer.batch ).to.equal( initialBatch );
			expect( buffer.size ).to.equal( 1 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'offs the buffer from the document', () => {
			const batch1 = buffer.batch;

			buffer.destroy();

			model.change( writer => {
				writer.insertText( 'a', root );
			} );

			expect( buffer.batch ).to.equal( batch1 );
		} );

		it( 'offs the buffer from the selection change:range', () => {
			const batch1 = buffer.batch;

			buffer.destroy();

			doc.selection.fire( 'change:attribute' );

			expect( buffer.batch ).to.equal( batch1 );
		} );

		it( 'offs the buffer from the selection change:attribute', () => {
			const batch1 = buffer.batch;

			buffer.destroy();

			doc.selection.fire( 'change:range' );

			expect( buffer.batch ).to.equal( batch1 );
		} );
	} );
} );
