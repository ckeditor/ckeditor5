/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileUploader } from '../../src/uploadgateway/fileuploader.js';
import { Token } from '../../src/token/token.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

const API_ADDRESS = 'https://example.dev';
const BASE_64_FILE = 'data:image/gif;base64,R0lGODlhCQAJAPIAAGFhYZXK/1FRUf///' +
	'9ra2gD/AAAAAAAAACH5BAEAAAUALAAAAAAJAAkAAAMYWFqwru2xERcYJLSNNWNBVimC5wjfaTkJADs=';

function createFakeXHRServer() {
	const requests = [];

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

	class FakeXMLHttpRequest {
		constructor() {
			this.aborted = false;
			this.listeners = new Map();
			this.requestHeaders = {};
			this.responseType = '';
			this.upload = new FakeXMLHttpRequestUpload();
			requests.push( this );
		}

		open( method, url, async ) {
			this.method = method;
			this.url = url;
			this.async = async;
		}

		setRequestHeader( name, value ) {
			this.requestHeaders[ name ] = value;
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

	vi.stubGlobal( 'XMLHttpRequest', FakeXMLHttpRequest );

	return { requests };
}

describe( 'FileUploader', () => {
	const tokenInitValue = `header.${ btoa( JSON.stringify( { exp: Date.now() + 3600000 } ) ) }.signature`;
	let fileUploader, token;

	beforeEach( () => {
		token = new Token( 'url', { initValue: tokenInitValue, autoRefresh: false } );
		fileUploader = new FileUploader( BASE_64_FILE, token, API_ADDRESS );
	} );

	afterEach( () => {
		token.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should throw error when no fileOrData provided', () => {
			expect( () => new FileUploader() ).toThrow( CKEditorError );
			expect( () => new FileUploader() ).toThrow( /fileuploader-missing-file/ );
		} );

		it( 'should throw error when no token provided', () => {
			expect( () => new FileUploader( 'file' ) ).toThrow( CKEditorError );
			expect( () => new FileUploader( 'file' ) ).toThrow( /fileuploader-missing-token/ );
		} );

		it( 'should throw error when no api address provided', () => {
			expect( () => new FileUploader( 'file', token ) ).toThrow( CKEditorError );
			expect( () => new FileUploader( 'file', token ) ).toThrow( /fileuploader-missing-api-address/ );
		} );

		it( 'should throw error when wrong Base64 file is provided', () => {
			expect( () => new FileUploader( 'data:image/gif;base64,R', token, API_ADDRESS ) )
				.toThrow( CKEditorError );
			expect( () => new FileUploader( 'data:image/gif;base64,R', token, API_ADDRESS ) )
				.toThrow( /fileuploader-decoding-image-data-error/ );
		} );

		it( 'should convert base64 to file', () => {
			return new Promise( resolve => {
				const fileReader = new FileReader();
				fileReader.readAsDataURL( fileUploader.file );
				fileReader.onloadend = () => {
					expect( fileReader.result ).toBe( BASE_64_FILE );
					resolve();
				};
			} );
		} );

		it( 'should set `file` field', () => {
			const file = new File( [], 'test.jpg' );

			const fileUploader = new FileUploader( file, token, API_ADDRESS );

			expect( fileUploader.file.name ).toBe( 'test.jpg' );
		} );
	} );

	describe( 'onProgress()', () => {
		it( 'should register callback for `progress` event', () => {
			return new Promise( resolve => {
				fileUploader.onProgress( data => {
					expect( data ).toEqual( { total: 12345, loaded: 123 } );
					resolve();
				} );

				fileUploader.fire( 'progress', { total: 12345, loaded: 123 } );
			} );
		} );
	} );

	describe( 'onError()', () => {
		it( 'should register callback for `error` event', () => {
			return new Promise( resolve => {
				fileUploader.onError( data => {
					expect( data ).toBeInstanceOf( Error );
					expect( data.message ).toBe( 'TEST' );

					resolve();
				} );

				fileUploader.fire( 'error', new Error( 'TEST' ) );
			} );
		} );

		it( 'should call registered callback for `error` event once', () => {
			const spy = vi.fn();
			fileUploader.onError( spy );

			fileUploader.fire( 'error', new Error( 'TEST' ) );
			fileUploader.fire( 'error', new Error( 'TEST' ) );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'send()', () => {
		let requests;

		beforeEach( () => {
			( { requests } = createFakeXHRServer() );
		} );

		it( 'should sent request with correct data (url, method, type, headers)', () => {
			return new Promise( ( resolve, reject ) => {
				fileUploader
					.send()
					.then( () => {
						const request = requests[ 0 ];
						expect( request.url ).toBe( API_ADDRESS );
						expect( request.method ).toBe( 'POST' );
						expect( request.responseType ).toBe( 'json' );
						expect( request.requestHeaders ).toEqual( { Authorization: tokenInitValue } );

						resolve();
					} )
					.catch( err => {
						reject( err );
					} );

				requests[ 0 ].respond( 200, { 'Content-Type': 'application/json' },
					JSON.stringify( { 'default': 'https://test.dev' } )
				);
			} );
		} );

		it( 'should fire `error` event with error message when response is failed', () => {
			return new Promise( resolve => {
				fileUploader
					.onError( error => {
						expect( error ).toBe( 'Message' );

						resolve();
					} )
					.send()
					.catch( () => {} );

				requests[ 0 ].respond( 400, { 'Content-Type': 'application/json' },
					JSON.stringify( {
						error: 'Error',
						message: 'Message'
					} )
				);
			} );
		} );

		it( 'should fire `error` event with error when response is failed', () => {
			return new Promise( resolve => {
				fileUploader
					.onError( error => {
						expect( error ).toBe( 'Error' );

						resolve();
					} )
					.send()
					.catch( () => {} );

				requests[ 0 ].respond( 400, { 'Content-Type': 'application/json' },
					JSON.stringify( {
						error: 'Error'
					} )
				);
			} );
		} );

		it( 'should fire `error` event when response is aborted', () => {
			return new Promise( resolve => {
				fileUploader
					.onError( error => {
						expect( error ).toBe( 'Abort' );

						resolve();
					} )
					.send()
					.catch( () => {} );

				requests[ 0 ].abort();
			} );
		} );

		it( 'should fire `error` event when network error occurs', () => {
			return new Promise( resolve => {
				fileUploader
					.onError( error => {
						expect( error ).toBe( 'Network Error' );

						resolve();
					} )
					.send()
					.catch( () => {} );

				requests[ 0 ].error();
			} );
		} );

		it( 'should fire `progress` event', () => {
			return new Promise( resolve => {
				fileUploader
					.onProgress( data => {
						expect( data.total ).toBe( 1 );
						expect( data.uploaded ).toBe( 10 );

						resolve();
					} )
					.send();

				requests[ 0 ].uploadProgress( { total: 1, loaded: 10 } );
				requests[ 0 ].respond( 200 );
			} );
		} );

		it( 'should not fire `progress` event when `lengthComputable` is false', () => {
			const progressSpy = vi.fn();

			fileUploader.onProgress( progressSpy ).send();
			requests[ 0 ].upload.dispatchEvent( 'progress', { lengthComputable: false } );

			expect( progressSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'abort()', () => {
		let requests;

		beforeEach( () => {
			( { requests } = createFakeXHRServer() );
		} );

		it( 'should abort xhr request', () => {
			fileUploader.send().catch( () => {} );
			fileUploader.abort();

			expect( requests[ 0 ].aborted ).toBe( true );
		} );
	} );
} );
