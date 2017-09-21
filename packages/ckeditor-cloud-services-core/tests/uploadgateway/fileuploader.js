/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env commonjs, browser */

'use strict';

import FileUploader from '../../src/uploadgateway/fileuploader';

const API_ADDRESS = 'https://example.dev';
const TOKEN = 'token';
const BASE_64_FILE = 'data:image/gif;base64,R0lGODlhCQAJAPIAAGFhYZXK/1FRUf///' +
	'9ra2gD/AAAAAAAAACH5BAEAAAUALAAAAAAJAAkAAAMYWFqwru2xERcYJLSNNWNBVimC5wjfaTkJADs=';

describe( 'FileUploader', () => {
	let fileUploader;

	beforeEach( () => {
		fileUploader = new FileUploader( BASE_64_FILE, TOKEN, API_ADDRESS );
	} );

	describe( 'constructor()', () => {
		it( 'should throw error when no fileOrData provided', () => {
			expect( () => new FileUploader() ).to.throw( 'File must be provided' );
		} );

		it( 'should throw error when no token provided', () => {
			expect( () => new FileUploader( 'file' ) ).to.throw( 'Token must be provided' );
		} );

		it( 'should throw error when no api address provided', () => {
			expect( () => new FileUploader( 'file', TOKEN ) ).to.throw( 'Api address must be provided' );
		} );

		it( 'should throw error when wrong Base64 file is provided', () => {
			expect( () => new FileUploader( 'data:image/gif;base64,R', TOKEN, API_ADDRESS ) )
				.to.throw( 'Problem with decoding Base64 image data.' );
		} );

		it( 'should convert base64 to file', done => {
			const fileReader = new FileReader();

			fileReader.readAsDataURL( fileUploader.file );
			fileReader.onloadend = () => {
				expect( fileReader.result ).to.be.equal( BASE_64_FILE );

				done();
			};
		} );

		it( 'should set `file` field', () => {
			const file = new File( [], 'test.jpg' );

			const fileUploader = new FileUploader( file, TOKEN, API_ADDRESS );

			expect( fileUploader.file.name ).to.be.equal( 'test.jpg' );
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
				expect( data.message ).to.be.equal( 'TEST' );

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
			global.xhr = sinon.useFakeXMLHttpRequest();

			global.xhr.onCreate = xhr => {
				request = xhr;
			};
		} );

		afterEach( () => global.xhr.restore() );

		it( 'should sent request with correct data (url, method, type, headers)', done => {
			fileUploader
				.send()
				.then( () => {
					expect( request.url ).to.be.equal( API_ADDRESS );
					expect( request.method ).to.be.equal( 'POST' );
					expect( request.responseType ).to.be.equal( 'json' );
					expect( request.requestHeaders ).to.be.deep.equal( { Authorization: 'token' } );

					done();
				} );

			request.respond( 200, { 'Content-Type': 'application/json' },
				JSON.stringify( { 'default': 'https://test.dev' } )
			);
		} );

		it( 'should fire `error` event with error message when response is failed', done => {
			fileUploader
				.onError( error => {
					expect( error ).to.be.equal( 'Message' );

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
					expect( error ).to.be.equal( 'Error' );

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
					expect( error ).to.be.equal( 'Abort' );

					done();
				} )
				.send();

			request.abort();
		} );

		it( 'should fire `error` event when network error occurs', done => {
			fileUploader
				.onError( error => {
					expect( error ).to.be.equal( 'Network Error' );

					done();
				} )
				.send();

			request.error();
		} );

		it( 'should fire `progress` event', done => {
			fileUploader
				.onProgress( data => {
					expect( data.total ).to.be.equal( 1 );
					expect( data.uploaded ).to.be.equal( 10 );

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
			global.xhr = sinon.useFakeXMLHttpRequest();

			global.xhr.onCreate = xhr => {
				request = xhr;
			};
		} );

		afterEach( () => global.xhr.restore() );

		it( 'should abort xhr request', () => {
			fileUploader.send();
			fileUploader.abort();

			expect( request.aborted ).to.be.true;
		} );
	} );
} );
