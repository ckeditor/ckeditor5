/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FileUploader from '../../src/uploadgateway/fileuploader.js';
import Token from '../../src/token/token.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

const API_ADDRESS = 'https://example.dev';
const BASE_64_FILE = 'data:image/gif;base64,R0lGODlhCQAJAPIAAGFhYZXK/1FRUf///' +
	'9ra2gD/AAAAAAAAACH5BAEAAAUALAAAAAAJAAkAAAMYWFqwru2xERcYJLSNNWNBVimC5wjfaTkJADs=';

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
			expect( () => new FileUploader() ).to.throw( CKEditorError, 'fileuploader-missing-file' );
		} );

		it( 'should throw error when no token provided', () => {
			expect( () => new FileUploader( 'file' ) ).to.throw( CKEditorError, 'fileuploader-missing-token' );
		} );

		it( 'should throw error when no api address provided', () => {
			expect( () => new FileUploader( 'file', token ) ).to.throw( CKEditorError, 'fileuploader-missing-api-address' );
		} );

		it( 'should throw error when wrong Base64 file is provided', () => {
			expect( () => new FileUploader( 'data:image/gif;base64,R', token, API_ADDRESS ) )
				.to.throw( CKEditorError, 'fileuploader-decoding-image-data-error' );
		} );

		it( 'should convert base64 to file', done => {
			const fileReader = new FileReader();

			fileReader.readAsDataURL( fileUploader.file );
			fileReader.onloadend = () => {
				expect( fileReader.result ).to.equal( BASE_64_FILE );

				done();
			};
		} );

		it( 'should set `file` field', () => {
			const file = new File( [], 'test.jpg' );

			const fileUploader = new FileUploader( file, token, API_ADDRESS );

			expect( fileUploader.file.name ).to.equal( 'test.jpg' );
		} );
	} );

	describe( 'onProgress()', () => {
		it( 'should register callback for `progress` event', done => {
			fileUploader.onProgress( data => {
				expect( data ).to.be.deep.equal( { total: 12345, loaded: 123 } );
				done();
			} );

			fileUploader.fire( 'progress', { total: 12345, loaded: 123 } );
		} );
	} );

	describe( 'onError()', () => {
		it( 'should register callback for `error` event', done => {
			fileUploader.onError( data => {
				expect( data ).to.be.instanceOf( Error );
				expect( data.message ).to.equal( 'TEST' );

				done();
			} );

			fileUploader.fire( 'error', new Error( 'TEST' ) );
		} );

		it( 'should call registered callback for `error` event once', () => {
			const spy = sinon.spy();
			fileUploader.onError( spy );

			fileUploader.fire( 'error', new Error( 'TEST' ) );
			fileUploader.fire( 'error', new Error( 'TEST' ) );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'send()', () => {
		let request;

		beforeEach( () => {
			const xhr = sinon.useFakeXMLHttpRequest();

			xhr.onCreate = r => {
				request = r;
			};
		} );

		afterEach( () => {
			sinon.restore();
		} );

		it( 'should sent request with correct data (url, method, type, headers)', done => {
			fileUploader
				.send()
				.then( () => {
					expect( request.url ).to.equal( API_ADDRESS );
					expect( request.method ).to.equal( 'POST' );
					expect( request.responseType ).to.equal( 'json' );
					expect( request.requestHeaders ).to.be.deep.equal( { Authorization: tokenInitValue } );

					done();
				} )
				.catch( err => {
					console.log( err );
				} );

			request.respond( 200, { 'Content-Type': 'application/json' },
				JSON.stringify( { 'default': 'https://test.dev' } )
			);
		} );

		it( 'should fire `error` event with error message when response is failed', done => {
			fileUploader
				.onError( error => {
					expect( error ).to.equal( 'Message' );

					done();
				} )
				.send();

			request.respond( 400, { 'Content-Type': 'application/json' },
				JSON.stringify( {
					error: 'Error',
					message: 'Message'
				} )
			);
		} );

		it( 'should fire `error` event with error when response is failed', done => {
			fileUploader
				.onError( error => {
					expect( error ).to.equal( 'Error' );

					done();
				} )
				.send();

			request.respond( 400, { 'Content-Type': 'application/json' },
				JSON.stringify( {
					error: 'Error'
				} )
			);
		} );

		it( 'should fire `error` event when response is aborted', done => {
			fileUploader
				.onError( error => {
					expect( error ).to.equal( 'Abort' );

					done();
				} )
				.send();

			request.abort();
		} );

		it( 'should fire `error` event when network error occurs', done => {
			fileUploader
				.onError( error => {
					expect( error ).to.equal( 'Network Error' );

					done();
				} )
				.send();

			request.error();
		} );

		it( 'should fire `progress` event', done => {
			fileUploader
				.onProgress( data => {
					expect( data.total ).to.equal( 1 );
					expect( data.uploaded ).to.equal( 10 );

					done();
				} )
				.send();

			request.uploadProgress( { total: 1, loaded: 10 } );
			request.respond( 200 );
		} );
	} );

	describe( 'abort()', () => {
		let request;

		beforeEach( () => {
			const xhr = sinon.useFakeXMLHttpRequest();

			xhr.onCreate = r => {
				request = r;
			};
		} );

		afterEach( () => {
			sinon.restore();
		} );

		it( 'should abort xhr request', () => {
			fileUploader.send();
			fileUploader.abort();

			expect( request.aborted ).to.be.true;
		} );
	} );
} );
