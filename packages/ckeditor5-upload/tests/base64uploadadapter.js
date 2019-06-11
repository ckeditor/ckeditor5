/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, setTimeout */

import Base64UploadAdapter from '../src/base64uploadadapter';
import FileRepository from '../src/filerepository';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

const createNativeFileMock = () => ( {
	type: 'image/jpeg',
	size: 1024
} );

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

	it( 'should require FileRepository plugin', () => {
		expect( Base64UploadAdapter.requires ).to.deep.equal( [ FileRepository ] );
	} );

	it( 'should be named', () => {
		expect( Base64UploadAdapter.pluginName ).to.equal( 'Base64UploadAdapter' );
	} );

	describe( 'init()', () => {
		it( 'should set loader', () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [ Base64UploadAdapter ],
				} )
				.then( editor => {
					expect( editor.plugins.get( FileRepository ).createUploadAdapter ).is.a( 'function' );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'Adapter', () => {
		let editor, fileRepository;

		beforeEach( () => {
			return ClassicTestEditor.create( div, {
				plugins: [ Base64UploadAdapter ],
			} ).then( _editor => {
				editor = _editor;
				fileRepository = editor.plugins.get( FileRepository );
			} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'upload()', () => {
			it( 'returns a promise that resolves an image as base64 string', () => {
				const loader = fileRepository.createLoader( createNativeFileMock() );

				setTimeout( () => {
					// FileReader has loaded the file.
					stubs.onload();
				} );

				return loader.upload()
					.then( response => {
						expect( response.default ).to.equal( 'data:image/png;base64' );
						expect( stubs.readAsDataURL.calledOnce ).to.equal( true );
					} );
			} );

			it( 'returns a promise that rejects if something went wrong', () => {
				const loader = fileRepository.createLoader( createNativeFileMock() );
				const uploadError = new Error( 'Something went wrong.' );

				setTimeout( () => {
					// An error occurred while FileReader was reading the file.
					stubs.onerror( uploadError );
				} );

				return loader.upload()
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
				const loader = fileRepository.createLoader( createNativeFileMock() );

				setTimeout( () => {
					// FileReader aborted reading the file.
					stubs.onabort();
				} );

				return loader.upload()
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
			it( 'should not call abort on the non-existing FileReader uploader (`loader.file` not resolved)', () => {
				const loader = fileRepository.createLoader( createNativeFileMock() );

				expect( () => {
					loader.upload();
					loader.abort();
				} ).to.not.throw();

				expect( stubs.abort.called ).to.equal( false );
			} );

			it( 'should call abort on the FileReader uploader (`loader.file` resolved)', done => {
				const loader = fileRepository.createLoader( createNativeFileMock() );

				loader.upload();

				// Wait for the `loader.file` promise.
				setTimeout( () => {
					loader.abort();

					expect( stubs.abort.called ).to.equal( true );

					done();
				} );
			} );
		} );
	} );
} );
