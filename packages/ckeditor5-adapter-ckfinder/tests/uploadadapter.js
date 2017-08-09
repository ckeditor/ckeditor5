/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-upload/src/imageupload';
import CKFinderUploadAdapter from '../src/uploadadapter';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import log from '@ckeditor/ckeditor5-utils/src/log';

describe( 'CKFinderUploadAdapter', () => {
	let editor, sinonXHR;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		sinonXHR = testUtils.sinon.useFakeServer();

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, ImageUpload, CKFinderUploadAdapter ],
				ckfinder: {
					uploadUrl: 'http://example.com'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		sinonXHR.restore();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKFinderUploadAdapter ) ).to.be.instanceOf( CKFinderUploadAdapter );
	} );

	describe( 'Adapter', () => {
		let adapter, loaderMock;

		beforeEach( () => {
			const file = createNativeFileMock();
			file.name = 'image.jpeg';
			loaderMock = { file	};

			adapter = editor.plugins.get( FileRepository ).createAdapter( loaderMock );
		} );

		it( 'crateAdapter method should be registered and have upload and abort methods', () => {
			expect( adapter ).to.not.be.undefined;
			expect( adapter.upload ).to.be.a( 'function' );
			expect( adapter.abort ).to.be.a( 'function' );
		} );

		it( 'should log warning when there is no configuration', () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );
			const warnSub = testUtils.sinon.stub( log, 'warn' );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageUpload, CKFinderUploadAdapter ],
				} )
				.then( () => {
					sinon.assert.calledOnce( warnSub );
					sinon.assert.calledWithExactly(
						warnSub,
						'ckfinder-upload-adapter-no-config: Please provide "ckfinder.uploadUrl" config option.'
					);
				} );
		} );

		describe( 'upload', () => {
			it( 'should return promise', () => {
				expect( adapter.upload() ).to.be.instanceof( Promise );
			} );

			it( 'should call url from config', () => {
				let request;
				const validResponse = {
					uploaded: 1
				};

				const promise = adapter.upload()
					.then( () => {
						expect( request.url ).to.equal( 'http://example.com' );
					} );

				request = sinonXHR.requests[ 0 ];
				request.respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( validResponse ) );

				return promise;
			} );

			it( 'should throw an error on generic request error', () => {
				const promise = adapter.upload()
					.then( () => {
						throw new Error( 'Promise should throw.' );
					} )
					.catch( msg => {
						expect( msg ).to.equal( 'Cannot upload file: image.jpeg.' );
					} );

				const request = sinonXHR.requests[ 0 ];
				request.error();

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
						expect( msg ).to.equal( 'Foo bar baz.' );
					} );

				const request = sinonXHR.requests[ 0 ];
				request.respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( responseError ) );

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
						expect( msg ).to.equal( 'Cannot upload file: image.jpeg.' );
					} );

				const request = sinonXHR.requests[ 0 ];
				request.respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( responseError ) );

				return promise;
			} );

			it( 'should throw an error on abort', () => {
				let request;

				const promise = adapter.upload()
					.then( () => {
						throw new Error( 'Promise should throw.' );
					} )
					.catch( () => {
						expect( request.aborted ).to.be.true;
					} );

				request = sinonXHR.requests[ 0 ];
				adapter.abort();

				return promise;
			} );

			it( 'abort should not throw before upload', () => {
				expect( () => {
					adapter.abort();
				} ).to.not.throw();
			} );

			it( 'should update progress', () => {
				adapter.upload();

				const request = sinonXHR.requests[ 0 ];
				request.uploadProgress( { loaded: 4, total: 10 } );

				expect( loaderMock.uploadTotal ).to.equal( 10 );
				expect( loaderMock.uploaded ).to.equal( 4 );
			} );
		} );
	} );
} );
