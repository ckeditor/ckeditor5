/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Base64UploadAdapter } from '../../src/adapters/base64uploadadapter.js';
import { FileRepository } from '../../src/filerepository.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { createNativeFileMock } from '../_utils/mocks.js';

describe( 'Base64UploadAdapter', () => {
	let div, stubs;

	beforeEach( () => {
		div = window.document.createElement( 'div' );
		window.document.body.appendChild( div );

		stubs = {
			addEventListener( event, callback ) {
				stubs[ `on${ event }` ] = callback;
			},
			readAsDataURL: vi.fn(),
			abort: vi.fn(),
			result: 'data:image/png;base64'
		};

		vi.spyOn( window, 'FileReader' ).mockImplementation( function FileReader() {
			return stubs;
		} );
	} );

	afterEach( () => {
		window.document.body.removeChild( div );
	} );

	it( 'should require the FileRepository plugin', () => {
		expect( Base64UploadAdapter.requires ).toEqual( [ FileRepository ] );
	} );

	it( 'should be named', () => {
		expect( Base64UploadAdapter.pluginName ).toEqual( 'Base64UploadAdapter' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Base64UploadAdapter.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( Base64UploadAdapter.isPremiumPlugin ).toBe( true );
	} );

	it( 'should have `licenseFeatureCode` static flag set to `B64A`', () => {
		expect( Base64UploadAdapter.licenseFeatureCode ).toEqual( 'B64A' );
	} );

	describe( 'init()', () => {
		it( 'should set the loader', () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [ Base64UploadAdapter ]
				} )
				.then( editor => {
					expect( editor.plugins.get( FileRepository ).createUploadAdapter ).toBeInstanceOf( Function );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'Adapter', () => {
		let editor, fileRepository, adapter;

		beforeEach( () => {
			return ClassicTestEditor.create( div, {
				plugins: [ Base64UploadAdapter ]
			} ).then( _editor => {
				editor = _editor;
				fileRepository = editor.plugins.get( FileRepository );
				adapter = fileRepository.createLoader( createNativeFileMock() );
			} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'crateAdapter method should be registered and have upload() and abort() methods', () => {
			expect( adapter ).not.toBeUndefined();
			expect( adapter.upload ).toBeInstanceOf( Function );
			expect( adapter.abort ).toBeInstanceOf( Function );
		} );

		describe( 'upload()', () => {
			it( 'returns a promise that resolves an image as a base64 string', () => {
				setTimeout( () => {
					// FileReader has loaded the file.
					stubs.onload();
				} );

				return adapter.upload()
					.then( response => {
						expect( response.default ).toEqual( 'data:image/png;base64' );
						expect( stubs.readAsDataURL ).toHaveBeenCalledTimes( 1 );
					} );
			} );

			it( 'returns a promise that rejects if something went wrong', () => {
				const uploadError = new Error( 'Something went wrong.' );

				setTimeout( () => {
					// An error occurred while FileReader was reading the file.
					stubs.onerror( uploadError );
				} );

				return adapter.upload()
					.then(
						() => {
							return new Error( 'Supposed to be rejected.' );
						},
						err => {
							expect( err ).toEqual( uploadError );
							expect( stubs.readAsDataURL ).toHaveBeenCalledTimes( 1 );
						}
					);
			} );

			it( 'returns a promise that rejects if FileReader aborted reading a file', () => {
				setTimeout( () => {
					// FileReader aborted reading the file.
					stubs.onabort();
				} );

				return adapter.upload()
					.then(
						() => {
							return new Error( 'Supposed to be rejected.' );
						},
						() => {
							expect( stubs.readAsDataURL ).toHaveBeenCalledTimes( 1 );
						}
					);
			} );
		} );

		describe( 'abort()', () => {
			it( 'should not call abort() on the non-existing FileReader uploader (loader#file not resolved)', () => {
				const adapter = fileRepository.createLoader( createNativeFileMock() );

				expect( () => {
					// Catch the upload error to prevent uncaught promise errors
					adapter.upload().catch( () => {} );
					adapter.abort();
				} ).not.toThrow();

				expect( stubs.abort ).not.toHaveBeenCalled();
			} );

			it( 'should call abort() on the FileReader uploader (loader#file resolved)', () => {
				adapter.upload();

				// Wait for the `loader.file` promise.
				return new Promise( resolve => {
					setTimeout( () => {
						adapter.abort();

						expect( stubs.abort ).toHaveBeenCalled();

						resolve();
					} );
				} );
			} );
		} );
	} );
} );
