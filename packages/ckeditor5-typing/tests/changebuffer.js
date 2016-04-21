/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ChangeBuffer from '/ckeditor5/typing/changebuffer.js';
import Document from '/ckeditor5/engine/model/document.js';
import Batch from '/ckeditor5/engine/model/batch.js';
import Position from '/ckeditor5/engine/model/position.js';

describe( 'ChangeBuffer', () => {
	const CHANGE_LIMIT = 3;
	let doc, buffer, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'main' );
		buffer = new ChangeBuffer( doc, CHANGE_LIMIT );
	} );

	describe( 'constructor', () => {
		it( 'sets all properties', () => {
			expect( buffer ).to.have.property( 'document', doc );
			expect( buffer ).to.have.property( 'limit', CHANGE_LIMIT );
			expect( buffer ).to.have.property( 'size', 0 );
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
		} );

		it( 'is reset once changes exceedes the limit', () => {
			const batch1 = buffer.batch;

			// Exceed the limit with one big jump to ensure that >= operator was used.
			buffer.input( CHANGE_LIMIT + 1 );

			expect( buffer.batch ).to.not.equal( batch1 );
		} );

		it( 'is reset once a new batch appears in the document', () => {
			const batch1 = buffer.batch;

			doc.batch().insert( Position.createAt( root, 0 ), 'a' );

			expect( buffer.batch ).to.not.equal( batch1 );
		} );

		it( 'is not reset when changes are added to the buffer\'s batch', () => {
			const batch1 = buffer.batch;

			buffer.batch.insert( Position.createAt( root, 0 ), 'a' );
			expect( buffer.batch ).to.equal( batch1 );

			buffer.batch.insert( Position.createAt( root, 0 ), 'b' );
			expect( buffer.batch ).to.equal( batch1 );
		} );

		it( 'is not reset when changes are added to batch which existed previously', () => {
			const externalBatch = doc.batch();

			externalBatch.insert( Position.createAt( root, 0 ), 'a' );

			const bufferBatch = buffer.batch;

			buffer.batch.insert( Position.createAt( root, 0 ), 'b' );
			expect( buffer.batch ).to.equal( bufferBatch );

			doc.batch().insert( Position.createAt( root, 0 ), 'c' );
			expect( buffer.batch ).to.not.equal( bufferBatch );
		} );
	} );

	describe( 'destory', () => {
		it( 'offs the buffer from the document', () => {
			const batch1 = buffer.batch;

			buffer.destroy();

			doc.batch().insert( Position.createAt( root, 0 ), 'a' );

			expect( buffer.batch ).to.equal( batch1 );
		} );
	} );
} );
