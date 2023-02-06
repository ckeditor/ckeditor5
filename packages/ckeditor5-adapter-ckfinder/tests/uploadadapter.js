/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import { Image, ImageUpload } from '@ckeditor/ckeditor5-image';
import CKFinderUploadAdapter from '../src/uploadadapter';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'CKFinderUploadAdapter', () => {
	let editor, sinonXHR, fileRepository, editorElement;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		sinonXHR = testUtils.sinon.useFakeServer();

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
		sinonXHR.restore();

		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKFinderUploadAdapter ) ).to.be.instanceOf( CKFinderUploadAdapter );
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
			expect( adapter ).to.not.be.undefined;
			expect( adapter.upload ).to.be.a( 'function' );
			expect( adapter.abort ).to.be.a( 'function' );
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

					expect( fileRepository ).to.not.have.property( 'createUploadAdapter' );

					editorElement.remove();

					return editor.destroy();
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

				adapter.upload();

				return loader.file.then( () => {
					request = sinonXHR.requests[ 0 ];
					request.respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( validResponse ) );

					expect( request.url ).to.equal( 'http://example.com' );
				} );
			} );

			it( 'should throw an error on generic request error', () => {
				const promise = adapter.upload()
					.then( () => {
						throw new Error( 'Promise should throw.' );
					} )
					.catch( msg => {
						expect( msg ).to.equal( 'Cannot upload file: image.jpeg.' );
					} );

				loader.file.then( () => {
					const request = sinonXHR.requests[ 0 ];
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
						expect( msg ).to.equal( 'Foo bar baz.' );
					} );

				loader.file.then( () => {
					const request = sinonXHR.requests[ 0 ];
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
						expect( msg ).to.equal( 'Cannot upload file: image.jpeg.' );
					} );

				loader.file.then( () => {
					const request = sinonXHR.requests[ 0 ];
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
						expect( request.aborted ).to.be.true;
					} );

				loader.file.then( () => {
					request = sinonXHR.requests[ 0 ];
					adapter.abort();
				} );

				return promise;
			} );

			it( 'abort should not throw before upload', () => {
				expect( () => {
					adapter.abort();
				} ).to.not.throw();
			} );

			it( 'should update progress', () => {
				adapter.upload();

				return loader.file.then( () => {
					const request = sinonXHR.requests[ 0 ];
					request.uploadProgress( { loaded: 4, total: 10 } );

					expect( loader.uploadTotal ).to.equal( 10 );
					expect( loader.uploaded ).to.equal( 4 );
				} );
			} );
		} );
	} );
} );
