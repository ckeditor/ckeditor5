/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import UploadcareEditing from '../src/uploadcareediting.js';
import UploadcareUploadAdapter from '../src/uploadcareuploadadapter.js';

import { createNativeFileMock, NativeFileReaderMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

const BASE64_SAMPLE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

describe( 'UploadcareUploadAdapter', () => {
	let editor, fileRepository, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [
					Clipboard,
					Paragraph,
					Image,
					ImageUploadEditing,
					ImageUploadProgress,
					UploadcareEditing,
					UploadcareUploadAdapter
				],
				uploadcare: {
					pubKey: 'KEY'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				fileRepository = editor.plugins.get( FileRepository );
			} );
	} );

	afterEach( () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( UploadcareUploadAdapter.pluginName ).to.equal( 'UploadcareUploadAdapter' );
	} );

	it( 'should require its dependencies', () => {
		expect( UploadcareUploadAdapter.requires ).to.deep.equal( [
			'ImageUploadEditing', 'ImageUploadProgress', FileRepository, UploadcareEditing
		] );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( UploadcareUploadAdapter ) ).to.be.instanceOf( UploadcareUploadAdapter );
	} );

	describe( 'initialization', () => {
		function uploadAdapterCreator() {}

		class OtherUploadAdapter extends Plugin {
			static get requires() {
				return [ FileRepository ];
			}

			async init() {
				this.editor.plugins.get( FileRepository ).createUploadAdapter = uploadAdapterCreator;
			}
		}

		it( 'should not overwrite existing upload adapter if `config.uploadcare` is missing', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						OtherUploadAdapter,
						Clipboard,
						Paragraph,
						Image,
						ImageUploadEditing,
						ImageUploadProgress,
						UploadcareEditing,
						UploadcareUploadAdapter
					]
				} );

			const fileRepositoryPlugin = editor.plugins.get( FileRepository );

			expect( fileRepositoryPlugin.createUploadAdapter ).to.equal( uploadAdapterCreator );

			editorElement.remove();
			return editor.destroy();
		} );

		it( 'should overwrite existing upload adapter if `config.uploadcare` is set', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						OtherUploadAdapter,
						Clipboard,
						Paragraph,
						Image,
						ImageUploadEditing,
						ImageUploadProgress,
						UploadcareEditing,
						UploadcareUploadAdapter
					],
					uploadcare: {
						pubKey: 'KEY'
					}
				} );

			const fileRepositoryPlugin = editor.plugins.get( FileRepository );

			expect( fileRepositoryPlugin.createUploadAdapter ).to.be.a( 'function' );
			expect( fileRepositoryPlugin.createUploadAdapter ).not.to.equal( uploadAdapterCreator );

			editorElement.remove();
			return editor.destroy();
		} );
	} );

	describe( 'Adapter', () => {
		let adapter, file, loader, uploadFileStub;

		beforeEach( () => {
			file = createNativeFileMock();
			file.name = 'image.jpg';

			loader = fileRepository.createLoader( file );
			adapter = editor.plugins.get( FileRepository ).createUploadAdapter( loader );

			uploadFileStub = sinon.stub( adapter, '_uploadFile' );
		} );

		it( 'createUploadAdapter should register adapter with upload and abort methods', () => {
			expect( adapter ).to.not.be.undefined;
			expect( adapter.upload ).to.be.a( 'function' );
			expect( adapter.abort ).to.be.a( 'function' );
		} );

		it( 'should return uploadcare image ID and default URL on successful upload', async () => {
			const mockResponse = { uuid: 'mocked-uuid', cdnUrl: 'http://mocked.cdn.url' };

			uploadFileStub.resolves( mockResponse );

			const result = await adapter.upload();

			expect( uploadFileStub ).to.be.calledOnce;
			expect( result ).to.deep.equal( {
				uploadcareImageId: 'mocked-uuid',
				default: 'http://mocked.cdn.url'
			} );
		} );

		it( 'should call `uploadFile` with proper parameters', async () => {
			const mockResponse = { uuid: 'mocked-uuid', cdnUrl: 'http://mocked.cdn.url' };

			uploadFileStub.resolves( mockResponse );

			await adapter.upload();

			sinon.assert.calledWithExactly( uploadFileStub, file, {
				publicKey: 'KEY',
				store: 'auto',
				signal: adapter.controller.signal
			} );
		} );

		it( 'should abort the upload if server results with an error while sending an image', () => {
			uploadFileStub.rejects( new Error( 'Upload failed' ) );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).to.equal( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'should throw an error on abort while uploading', () => {
			uploadFileStub.callsFake( () => {
				return new Promise( ( resolve, reject ) => {
					adapter.abort();

					reject( new Error( 'Request aborted' ) );
				} );
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Promise should throw.' );
				} )
				.catch( () => {
					expect( adapter.controller.signal.aborted ).to.equal( true );
				} );
		} );

		it( 'abort should not throw before upload', () => {
			expect( () => {
				adapter.abort();
			} ).to.not.throw();
		} );
	} );

	describe.skip( 'adding the "uploadcareImageId" attribute to the uploaded asset', () => {
		let nativeReaderMock, loader, adapterMock;

		const imgPath = '/assets/sample.png';
		const file = createNativeFileMock();
		file.name = 'image.jpg';

		it( 'should add the "uploadcareImageId" attribute to the uploaded image by default', async () => {
			sinon.stub( window, 'FileReader' ).callsFake( () => {
				nativeReaderMock = new NativeFileReaderMock();

				return nativeReaderMock;
			} );

			fileRepository.createUploadAdapter = newLoader => {
				loader = newLoader;
				adapterMock = new UploadAdapterMock( loader );

				return adapterMock;
			};

			editor.execute( 'uploadImage', { file } );

			loader.file.then( () => nativeReaderMock.mockSuccess( BASE64_SAMPLE ) );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					loader.file.then( () => adapterMock.mockSuccess( {
						default: imgPath,
						uploadcareImageId: 'id'
					} ) );

					resolve();
				} );
			} );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					expect( getData( editor.model ) ).to.equal(
						`[<imageBlock uploadcareImageId="id" src="${ imgPath }" uploadId="${ loader.id }" uploadStatus="complete">` +
						'</imageBlock>]'
					);

					resolve();
				} );
			} );

			loader.file.then( () => nativeReaderMock.mockSuccess( BASE64_SAMPLE ) );
		} );

		it( 'should not add the "uploadcareImageId" attribute to the uploaded image if disabled in a configuration', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						Clipboard,
						Paragraph,
						LinkEditing,
						Image,
						PictureEditing,
						ImageUploadEditing,
						ImageUploadProgress,
						UploadcareEditing,
						UploadcareUploadAdapter
					],
					uploadcare: {
						pubKey: 'KEY',
						ignoreDataId: true
					}
				} );

			sinon.stub( window, 'FileReader' ).callsFake( () => {
				nativeReaderMock = new NativeFileReaderMock();

				return nativeReaderMock;
			} );

			fileRepository = editor.plugins.get( FileRepository );
			fileRepository.createUploadAdapter = newLoader => {
				loader = newLoader;
				adapterMock = new UploadAdapterMock( loader );

				return adapterMock;
			};

			editor.execute( 'uploadImage', { file } );

			loader.file.then( () => nativeReaderMock.mockSuccess( BASE64_SAMPLE ) );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					loader.file.then( () => adapterMock.mockSuccess( {
						default: imgPath,
						uploadcareImageId: 'image-1'
					} ) );

					resolve();
				} );
			} );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					expect( getData( editor.model ) ).to.equal(
						`[<imageBlock src="${ imgPath }" uploadId="${ loader.id }" uploadStatus="complete"></imageBlock>]`
					);

					resolve();
				} );
			} );

			await editor.destroy();
			editorElement.remove();
		} );
	} );
} );
