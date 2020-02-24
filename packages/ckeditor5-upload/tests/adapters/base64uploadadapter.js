/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, setTimeout */

import Base64UploadAdapter from '../../src/adapters/base64uploadadapter';
import FileRepository from '../../src/filerepository';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { createNativeFileMock } from '../_utils/mocks';

describe( 'Base64UploadAdapter', () => {
	let div, stubs;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		div = window.document.createElement( 'div' );
		window.document.body.appendChild( div );

		stubs = {
			addEventListener( event, callback ) {
				stubs[ `on${ event }` ] = callback;
			},
			readAsDataURL: testUtils.sinon.spy(),
			abort: testUtils.sinon.spy(),
			result: 'data:image/png;base64'
		};

		testUtils.sinon.stub( window, 'FileReader' ).callsFake( function FileReader() {
			return stubs;
		} );
	} );

	afterEach( () => {
		window.document.body.removeChild( div );
	} );

	it( 'should require the FileRepository plugin', () => {
		expect( Base64UploadAdapter.requires ).to.deep.equal( [ FileRepository ] );
	} );

	it( 'should be named', () => {
		expect( Base64UploadAdapter.pluginName ).to.equal( 'Base64UploadAdapter' );
	} );

	describe( 'init()', () => {
		it( 'should set the loader', () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [ Base64UploadAdapter ]
				} )
				.then( editor => {
					expect( editor.plugins.get( FileRepository ).createUploadAdapter ).is.a( 'function' );

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
			expect( adapter ).to.not.be.undefined;
			expect( adapter.upload ).to.be.a( 'function' );
			expect( adapter.abort ).to.be.a( 'function' );
		} );

		describe( 'upload()', () => {
			it( 'returns a promise that resolves an image as a base64 string', () => {
				setTimeout( () => {
					// FileReader has loaded the file.
					stubs.onload();
				} );

				return adapter.upload()
					.then( response => {
						expect( response.default ).to.equal( 'data:image/png;base64' );
						expect( stubs.readAsDataURL.calledOnce ).to.equal( true );
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
							expect( err ).to.equal( uploadError );
							expect( stubs.readAsDataURL.calledOnce ).to.equal( true );
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
							expect( stubs.readAsDataURL.calledOnce ).to.equal( true );
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
				} ).to.not.throw();

				expect( stubs.abort.called ).to.equal( false );
			} );

			it( 'should call abort() on the FileReader uploader (loader#file resolved)', done => {
				adapter.upload();

				// Wait for the `loader.file` promise.
				setTimeout( () => {
					adapter.abort();

					expect( stubs.abort.called ).to.equal( true );

					done();
				} );
			} );
		} );
	} );
} );
