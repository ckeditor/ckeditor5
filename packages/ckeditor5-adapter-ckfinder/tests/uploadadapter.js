/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Image, ImageUpload } from '@ckeditor/ckeditor5-image';
import { CKFinderUploadAdapter } from '../src/uploadadapter.js';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

describe( 'CKFinderUploadAdapter', () => {
	let editor, fakeXHR, fileRepository, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		fakeXHR = createFakeXHRServer();

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Clipboard, Image, ImageUpload, CKFinderUploadAdapter ],
				ckfinder: {
					uploadUrl: 'http://example.com'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				fileRepository = editor.plugins.get( FileRepository );
			} );
	} );

	afterEach( () => {
		vi.unstubAllGlobals();

		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKFinderUploadAdapter.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKFinderUploadAdapter.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKFinderUploadAdapter ) ).toBeInstanceOf( CKFinderUploadAdapter );
	} );

	describe( 'UploadAdapter', () => {
		let adapter, loader;

		beforeEach( () => {
			const file = createNativeFileMock();
			file.name = 'image.jpeg';

			loader = fileRepository.createLoader( file );

			adapter = editor.plugins.get( FileRepository ).createUploadAdapter( loader );
		} );

		it( 'crateAdapter method should be registered and have upload and abort methods', () => {
			expect( adapter ).not.toBeUndefined();
			expect( adapter.upload ).toBeInstanceOf( Function );
			expect( adapter.abort ).toBeInstanceOf( Function );
		} );

		it( 'should not set the FileRepository.createUploadAdapter factory if not configured', () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Clipboard, Image, ImageUpload, CKFinderUploadAdapter ]
				} )
				.then( editor => {
					const fileRepository = editor.plugins.get( FileRepository );

					expect( fileRepository ).not.toHaveProperty( 'createUploadAdapter' );

					editorElement.remove();

					return editor.destroy();
				} );
		} );

		describe( 'upload', () => {
			it( 'should return promise', () => {
				expect( adapter.upload() ).toBeInstanceOf( Promise );
			} );

			it( 'should call url from config', () => {
				let request;
				const validResponse = {
					uploaded: 1
				};

				adapter.upload();

				return loader.file.then( () => {
					request = fakeXHR.requests[ 0 ];
					request.respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( validResponse ) );

					expect( request.url ).toBe( 'http://example.com' );
				} );
			} );

			it( 'should throw an error on generic request error', () => {
				const promise = adapter.upload()
					.then( () => {
						throw new Error( 'Promise should throw.' );
					} )
					.catch( msg => {
						expect( msg ).toBe( 'Cannot upload file: image.jpeg.' );
					} );

				loader.file.then( () => {
					const request = fakeXHR.requests[ 0 ];
					request.error();
				} );

				return promise;
			} );

			it( 'should throw an error on error from server', () => {
				const responseError = {
					error: {
						message: 'Foo bar baz.'
					}
				};

				const promise = adapter.upload()
					.then( () => {
						throw new Error( 'Promise should throw.' );
					} )
					.catch( msg => {
						expect( msg ).toBe( 'Foo bar baz.' );
					} );

				loader.file.then( () => {
					const request = fakeXHR.requests[ 0 ];
					request.respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( responseError ) );
				} );

				return promise;
			} );

			it( 'should throw a generic error on error from server without message', () => {
				const responseError = {
					error: {}
				};

				const promise = adapter.upload()
					.then( () => {
						throw new Error( 'Promise should throw.' );
					} )
					.catch( msg => {
						expect( msg ).toBe( 'Cannot upload file: image.jpeg.' );
					} );

				loader.file.then( () => {
					const request = fakeXHR.requests[ 0 ];
					request.respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( responseError ) );
				} );

				return promise;
			} );

			it( 'should throw an error on abort', () => {
				let request;

				const promise = adapter.upload()
					.then( () => {
						throw new Error( 'Promise should throw.' );
					} )
					.catch( () => {
						expect( request.aborted ).toBe( true );
					} );

				loader.file.then( () => {
					request = fakeXHR.requests[ 0 ];
					adapter.abort();
				} );

				return promise;
			} );

			it( 'abort should not throw before upload', () => {
				expect( () => {
					adapter.abort();
				} ).not.toThrow();
			} );

			it( 'should update progress', () => {
				adapter.upload();

				return loader.file.then( () => {
					const request = fakeXHR.requests[ 0 ];
					request.uploadProgress( { loaded: 4, total: 10 } );

					expect( loader.uploadTotal ).toBe( 10 );
					expect( loader.uploaded ).toBe( 4 );
				} );
			} );

			it( 'should not update progress when progress event length is not computable', () => {
				adapter.upload();

				return loader.file.then( () => {
					const request = fakeXHR.requests[ 0 ];

					request.uploadProgress( { lengthComputable: false, loaded: 4, total: 10 } );

					expect( loader.uploadTotal ).toBeNull();
					expect( loader.uploaded ).toBe( 0 );
				} );
			} );
		} );
	} );
} );

function createFakeXHRServer() {
	const requests = [];

	class FakeXMLHttpRequest {
		constructor() {
			this.aborted = false;
			this.listeners = new Map();
			this.upload = new FakeXMLHttpRequestUpload();

			requests.push( this );
		}

		open( method, url, async ) {
			this.method = method;
			this.url = url;
			this.async = async;
		}

		send( body ) {
			this.requestBody = body;
		}

		abort() {
			this.aborted = true;
			this.dispatchEvent( 'abort' );
		}

		addEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];

			callbacks.push( callback );
			this.listeners.set( event, callbacks );
		}

		respond( status, headers, body ) {
			this.status = status;
			this.responseHeaders = headers;
			this.responseText = body;
			this.response = this.responseType === 'json' ? JSON.parse( body ) : body;

			this.dispatchEvent( 'load' );
		}

		error() {
			this.dispatchEvent( 'error' );
		}

		uploadProgress( event ) {
			this.upload.dispatchEvent( 'progress', {
				lengthComputable: true,
				...event
			} );
		}

		dispatchEvent( event, data ) {
			for ( const callback of this.listeners.get( event ) || [] ) {
				callback( data );
			}
		}
	}

	class FakeXMLHttpRequestUpload {
		constructor() {
			this.listeners = new Map();
		}

		addEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];

			callbacks.push( callback );
			this.listeners.set( event, callbacks );
		}

		dispatchEvent( event, data ) {
			for ( const callback of this.listeners.get( event ) || [] ) {
				callback( data );
			}
		}
	}

	vi.stubGlobal( 'XMLHttpRequest', FakeXMLHttpRequest );

	return { requests };
}
