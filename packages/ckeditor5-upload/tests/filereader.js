/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileReader } from '../src/filereader.js';
import { NativeFileReaderMock, createNativeFileMock } from './_utils/mocks.js';

describe( 'FileReader', () => {
	let reader, fileMock, nativeReaderMock;

	beforeEach( () => {
		vi.spyOn( window, 'FileReader' ).mockImplementation( function() {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		fileMock = createNativeFileMock();
		reader = new FileReader();
	} );

	it( 'should initialize loaded property', () => {
		expect( reader.loaded ).toEqual( 0 );
	} );

	it( 'should update loaded property', () => {
		nativeReaderMock.mockProgress( 10 );
		expect( reader.loaded ).toEqual( 10 );
		nativeReaderMock.mockProgress( 20 );
		expect( reader.loaded ).toEqual( 20 );
		nativeReaderMock.mockProgress( 55 );
		expect( reader.loaded ).toEqual( 55 );
	} );

	describe( 'data', () => {
		it( 'should be undefined if file was not loaded', () => {
			expect( reader.data ).toBeUndefined();
		} );

		it( 'should equal to loaded file data', () => {
			const promise = reader.read( fileMock )
				.then( () => {
					expect( reader.data ).toEqual( 'File contents.' );
				} );

			nativeReaderMock.mockSuccess( 'File contents.' );

			return promise;
		} );
	} );

	describe( 'read()', () => {
		it( 'should return a promise', () => {
			expect( reader.read( fileMock ) ).to.be.instanceOf( Promise );
		} );

		it( 'should resolve on loading complete', () => {
			const promise = reader.read( fileMock )
				.then( result => {
					expect( result ).toEqual( 'File contents.' );
				} );

			nativeReaderMock.mockSuccess( 'File contents.' );

			return promise;
		} );

		it( 'should reject on loading error', () => {
			const promise = reader.read( fileMock )
				.then( () => {
					throw new Error( 'Reader should not resolve.' );
				}, status => {
					expect( status ).toEqual( 'error' );
					expect( reader.error ).toEqual( 'Error during file reading.' );
				} );

			nativeReaderMock.mockError( 'Error during file reading.' );

			return promise;
		} );

		it( 'should reject promise on loading abort', () => {
			const promise = reader.read( fileMock )
				.then( () => {
					throw new Error( 'Reader should not resolve.' );
				}, status => {
					expect( status ).toEqual( 'aborted' );
				} );

			nativeReaderMock.abort();

			return promise;
		} );
	} );

	describe( 'abort()', () => {
		it( 'should allow to abort reading', () => {
			const promise = reader.read( fileMock )
				.then( () => {
					throw new Error( 'Reader should not resolve.' );
				}, status => {
					expect( status ).toEqual( 'aborted' );
				} );

			reader.abort();

			return promise;
		} );
	} );
} );
