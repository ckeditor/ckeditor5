/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import FileReader from '../src/filereader';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { NativeFileReaderMock, createNativeFileMock } from './_utils/mocks';

describe( 'FileReader', () => {
	let reader, fileMock, nativeReaderMock;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'FileReader' ).callsFake( () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		fileMock = createNativeFileMock();
		reader = new FileReader();
	} );

	it( 'should initialize loaded property', () => {
		expect( reader.loaded ).to.equal( 0 );
	} );

	it( 'should update loaded property', () => {
		nativeReaderMock.mockProgress( 10 );
		expect( reader.loaded ).to.equal( 10 );
		nativeReaderMock.mockProgress( 20 );
		expect( reader.loaded ).to.equal( 20 );
		nativeReaderMock.mockProgress( 55 );
		expect( reader.loaded ).to.equal( 55 );
	} );

	describe( 'read', () => {
		it( 'should return a promise', () => {
			expect( reader.read( fileMock ) ).to.be.instanceOf( Promise );
		} );

		it( 'should resolve on loading complete', () => {
			const promise = reader.read( fileMock )
				.then( result => {
					expect( result ).to.equal( 'File contents.' );
				} );

			nativeReaderMock.mockSuccess( 'File contents.' );

			return promise;
		} );

		it( 'should reject on loading error', () => {
			const promise = reader.read( fileMock )
				.then( () => {
					throw new Error( 'Reader should not resolve.' );
				}, status => {
					expect( status ).to.equal( 'error' );
					expect( reader.error ).to.equal( 'Error during file reading.' );
				} );

			nativeReaderMock.mockError( 'Error during file reading.' );

			return promise;
		} );

		it( 'should reject promise on loading abort', () => {
			const promise = reader.read( fileMock )
				.then( () => {
					throw new Error( 'Reader should not resolve.' );
				}, status => {
					expect( status ).to.equal( 'aborted' );
				} );

			nativeReaderMock.abort();

			return promise;
		} );
	} );

	describe( 'abort', () => {
		it( 'should allow to abort reading', () => {
			const promise = reader.read( fileMock )
				.then( () => {
					throw new Error( 'Reader should not resolve.' );
				}, status => {
					expect( status ).to.equal( 'aborted' );
				} );

			reader.abort();

			return promise;
		} );
	} );
} );
