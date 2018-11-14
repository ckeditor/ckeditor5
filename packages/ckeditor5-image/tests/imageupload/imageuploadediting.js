/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, setTimeout */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ImageEditing from '../../src/image/imageediting';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import ImageUploadCommand from '../../src/imageupload/imageuploadcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import DataTransfer from '@ckeditor/ckeditor5-clipboard/src/datatransfer';

import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { UploadAdapterMock, createNativeFileMock, NativeFileReaderMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import log from '@ckeditor/ckeditor5-utils/src/log';
import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';

describe( 'ImageUploadEditing', () => {
	// eslint-disable-next-line max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	let editor, model, view, doc, fileRepository, viewDocument, nativeReaderMock, loader, adapterMock, uploadStartedCallback;

	const windowFilePolyfill = function( parts, filename, properties ) {
		this.name = filename;
		this.parts = parts;
		this.properties = properties;
	};

	testUtils.createSinonSandbox();

	class UploadAdapterPluginMock extends Plugin {
		init() {
			fileRepository = this.editor.plugins.get( FileRepository );
			fileRepository.createUploadAdapter = newLoader => {
				loader = newLoader;
				adapterMock = new UploadAdapterMock( loader );

				if ( uploadStartedCallback ) {
					adapterMock.uploadStartedCallback = uploadStartedCallback;
				}

				return adapterMock;
			};
		}
	}

	beforeEach( () => {
		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		testUtils.sinon.stub( env, 'isEdge' ).get( () => false );

		testUtils.sinon.stub( window, 'FileReader' ).callsFake( () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		// Use `File` polyfill so test can be run on Edge too (which lacks `File` constructor).
		if ( !window.File ) {
			window.File = windowFilePolyfill;
		}

		return VirtualTestEditor
			.create( {
				plugins: [ ImageEditing, ImageUploadEditing, Paragraph, UndoEditing, UploadAdapterPluginMock ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	afterEach( () => {
		adapterMock = null;
		uploadStartedCallback = null;

		if ( window.File === windowFilePolyfill ) {
			window.File = null;
		}

		return editor.destroy();
	} );

	it( 'should register proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'image' ], 'uploadId' ) ).to.be.true;
	} );

	it( 'should register imageUpload command', () => {
		expect( editor.commands.get( 'imageUpload' ) ).to.be.instanceOf( ImageUploadCommand );
	} );

	it( 'should insert image when is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( model ) ).to.equal(
			`<paragraph>foo</paragraph>[<image uploadId="${ id }" uploadStatus="reading"></image>]`
		);
	} );

	it( 'should insert image at optimized position when is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const paragraph = doc.getRoot().getChild( 0 );
		const targetRange = model.createRange( model.createPositionAt( paragraph, 1 ), model.createPositionAt( paragraph, 1 ) ); // f[]oo
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( model ) ).to.equal(
			`[<image uploadId="${ id }" uploadStatus="reading"></image>]<paragraph>foo</paragraph>`
		);
	} );

	it( 'should insert multiple image files when are pasted', () => {
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new DataTransfer( { files, types: [ 'Files' ] } );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id1 = fileRepository.getLoader( files[ 0 ] ).id;
		const id2 = fileRepository.getLoader( files[ 1 ] ).id;

		expect( getModelData( model ) ).to.equal(
			'<paragraph>foo</paragraph>' +
			`<image uploadId="${ id1 }" uploadStatus="reading"></image>` +
			`[<image uploadId="${ id2 }" uploadStatus="reading"></image>]`
		);
	} );

	it( 'should insert image when is pasted on allowed position when ImageUploadCommand is disabled', () => {
		setModelData( model, '<paragraph>foo</paragraph>[<image></image>]' );

		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );

		const command = editor.commands.get( 'imageUpload' );

		expect( command.isEnabled ).to.be.false;

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 0 ), model.createPositionAt( doc.getRoot(), 0 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( model ) ).to.equal(
			`[<image uploadId="${ id }" uploadStatus="reading"></image>]<paragraph>foo</paragraph><image></image>`
		);
	} );

	it( 'should not insert image when editor is in read-only mode', () => {
		// Clipboard plugin is required for this test.
		return VirtualTestEditor
			.create( {
				plugins: [ ImageEditing, ImageUploadEditing, Paragraph, UploadAdapterPluginMock, Clipboard ]
			} )
			.then( editor => {
				const fileMock = createNativeFileMock();
				const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
				setModelData( editor.model, '<paragraph>[]foo</paragraph>' );

				const targetRange = editor.model.document.selection.getFirstRange();
				const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

				editor.isReadOnly = true;

				editor.editing.view.document.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]foo</paragraph>' );

				return editor.destroy();
			} );
	} );

	it( 'should not insert image when file is not an image', () => {
		const viewDocument = editor.editing.view.document;
		const fileMock = {
			type: 'media/mp3',
			size: 1024
		};
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );

		setModelData( model, '<paragraph>foo[]</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
	} );

	it( 'should not insert image when there is non-empty HTML content pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( {
			files: [ fileMock ],
			types: [ 'Files', 'text/html' ],
			getData: type => type === 'text/html' ? '<p>SomeData</p>' : ''
		} );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		expect( getModelData( model ) ).to.equal( '<paragraph>[]foo</paragraph>' );
	} );

	it( 'should not insert image nor crash when pasted image could not be inserted', () => {
		model.schema.register( 'other', {
			allowIn: '$root',
			isLimit: true
		} );
		model.schema.extend( '$text', { allowIn: 'other' } );

		editor.conversion.elementToElement( { model: 'other', view: 'p' } );

		setModelData( model, '<other>[]</other>' );

		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
	} );

	it( 'should not throw when upload adapter is not set (FileRepository will log an error anyway) when image is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		const logStub = testUtils.sinon.stub( log, 'error' );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		fileRepository.createUploadAdapter = undefined;

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		expect( () => {
			viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
		} ).to.not.throw();

		expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
		sinon.assert.calledOnce( logStub );
	} );

	// https://github.com/ckeditor/ckeditor5-upload/issues/70
	it( 'should not crash on browsers which do not implement DOMStringList as a child class of an Array', () => {
		const typesDomStringListMock = {
			length: 2,
			'0': 'text/html',
			'1': 'text/plain'
		};
		const dataTransfer = new DataTransfer( {
			types: typesDomStringListMock,
			getData: type => type === 'text/html' ? '<p>SomeData</p>' : 'SomeData'
		} );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		// Well, there's no clipboard plugin, so nothing happens.
		expect( getModelData( model ) ).to.equal( '<paragraph>[]foo</paragraph>' );
	} );

	it( 'should not convert image\'s uploadId attribute if is consumed already', () => {
		editor.editing.downcastDispatcher.on( 'attribute:uploadId:image', ( evt, data, conversionApi ) => {
			conversionApi.consumable.consume( data.item, evt.name );
		}, { priority: 'high' } );

		setModelData( model, '<image uploadId="1234"></image>' );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false">' +
			'<img></img>' +
			'</figure>]' );
	} );

	it( 'should use read data once it is present', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );

		model.once( '_change', () => {
			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget image" contenteditable="false">' +
				`<img src="${ base64Sample }"></img>` +
				'</figure>]' +
				'<p>foo bar</p>' );
			expect( loader.status ).to.equal( 'uploading' );

			done();
		} );

		expect( loader.status ).to.equal( 'reading' );
		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should replace read data with server response once it is present', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				expect( getViewData( view ) ).to.equal(
					'[<figure class="ck-widget image" contenteditable="false"><img src="image.png"></img></figure>]<p>foo bar</p>'
				);
				expect( loader.status ).to.equal( 'idle' );

				done();
			}, { priority: 'lowest' } );

			adapterMock.mockSuccess( { default: 'image.png' } );
		} );

		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should fire notification event in case of error', done => {
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();

		notification.on( 'show:warning', ( evt, data ) => {
			expect( data.message ).to.equal( 'Reading error.' );
			expect( data.title ).to.equal( 'Upload failed' );
			evt.stop();

			done();
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );

		nativeReaderMock.mockError( 'Reading error.' );
	} );

	it( 'should not fire notification on abort', done => {
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();
		const spy = testUtils.sinon.spy();

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );
		nativeReaderMock.abort();

		setTimeout( () => {
			sinon.assert.notCalled( spy );
			done();
		}, 0 );
	} );

	it( 'should throw when other error happens during upload', done => {
		const file = createNativeFileMock();
		const error = new Error( 'Foo bar baz' );
		const uploadEditing = editor.plugins.get( ImageUploadEditing );
		const loadSpy = sinon.spy( uploadEditing, '_readAndUpload' );
		const catchSpy = sinon.spy();

		// Throw an error when async attribute change occur.
		editor.editing.downcastDispatcher.on( 'attribute:uploadStatus:image', ( evt, data ) => {
			if ( data.attributeNewValue == 'uploading' ) {
				throw error;
			}
		} );

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );

		sinon.assert.calledOnce( loadSpy );

		const promise = loadSpy.returnValues[ 0 ];

		// Check if error can be caught.
		promise.catch( catchSpy );

		nativeReaderMock.mockSuccess();

		setTimeout( () => {
			sinon.assert.calledOnce( catchSpy );
			sinon.assert.calledWithExactly( catchSpy, error );
			done();
		}, 0 );
	} );

	it( 'should do nothing if image does not have uploadId', () => {
		setModelData( model, '<image src="image.png"></image>' );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false"><img src="image.png"></img></figure>]'
		);
	} );

	it( 'should remove image in case of upload error', done => {
		const file = createNativeFileMock();
		const spy = testUtils.sinon.spy();
		const notification = editor.plugins.get( Notification );
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'imageUpload', { files: file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );
				sinon.assert.calledOnce( spy );

				done();
			} );
		} );

		nativeReaderMock.mockError( 'Upload error.' );
	} );

	it( 'should abort upload if image is removed', () => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );

		const abortSpy = testUtils.sinon.spy( loader, 'abort' );

		expect( loader.status ).to.equal( 'reading' );
		nativeReaderMock.mockSuccess( base64Sample );

		const image = doc.getRoot().getChild( 0 );
		model.change( writer => {
			writer.remove( image );
		} );

		expect( loader.status ).to.equal( 'aborted' );
		sinon.assert.calledOnce( abortSpy );
	} );

	it( 'should not abort and not restart upload when image is moved', () => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );

		const abortSpy = testUtils.sinon.spy( loader, 'abort' );
		const loadSpy = testUtils.sinon.spy( loader, 'read' );

		const image = doc.getRoot().getChild( 0 );

		model.change( writer => {
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( doc.getRoot(), 2 ) );
		} );

		expect( abortSpy.called ).to.be.false;
		expect( loadSpy.called ).to.be.false;
	} );

	it( 'image should be permanently removed if it is removed by user during upload', done => {
		const file = createNativeFileMock();
		const notification = editor.plugins.get( Notification );
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'imageUpload', { files: file } );

		model.document.once( 'change', () => {
			// This is called after "manual" remove.
			model.document.once( 'change', () => {
				// This is called after attributes are removed.
				let undone = false;

				model.document.once( 'change', () => {
					if ( !undone ) {
						undone = true;

						// This is called after abort remove.
						expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );

						editor.execute( 'undo' );

						// Expect that the image has not been brought back.
						expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );

						done();
					}
				} );
			} );
		} );

		const image = doc.getRoot().getChild( 0 );

		model.change( writer => {
			writer.remove( image );
		} );
	} );

	it( 'should create responsive image if server return multiple images', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { files: file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				expect( getViewData( view ) ).to.equal(
					'[<figure class="ck-widget image" contenteditable="false">' +
					'<img sizes="100vw" src="image.png" srcset="image-500.png 500w, image-800.png 800w" width="800"></img>' +
					'</figure>]<p>foo bar</p>'
				);
				expect( loader.status ).to.equal( 'idle' );

				done();
			}, { priority: 'lowest' } );

			adapterMock.mockSuccess( { default: 'image.png', 500: 'image-500.png', 800: 'image-800.png' } );
		} );

		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should prevent from browser redirecting when an image is dropped on another image', () => {
		const spy = testUtils.sinon.spy();

		editor.editing.view.document.fire( 'dragover', {
			preventDefault: spy
		} );

		expect( spy.calledOnce ).to.equal( true );
	} );

	it( 'should upload image inserted with base64 data', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		// Since upload starts asynchronously, success needs to be triggered after upload is started.
		uploadStartedCallback = function() {
			adapterMock.mockSuccess( { default: 'image.png' } );
		};

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				expectModel( done, model, '<paragraph><image src="image.png"></image>[]foo</paragraph>' );
			} );
		} );

		model.change( writer => {
			const image = writer.createElement( 'image' );

			writer.setAttribute( 'src', base64Sample, image );
			writer.insert( image, model.document.selection.getFirstPosition() );
		} );
	} );

	it( 'should upload if image src changed to base64 data', done => {
		setModelData( model, '<paragraph>bar[]</paragraph><image src="blob://image.jpeg"></image>' );

		// Since upload starts asynchronously, success needs to be triggered after upload is started.
		uploadStartedCallback = function() {
			adapterMock.mockSuccess( { default: 'image2.jpeg' } );
		};

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				expectModel( done, model, '<paragraph>bar[]</paragraph><image src="image2.jpeg"></image>' );
			} );
		} );

		model.change( writer => {
			const range = writer.createRangeIn( model.document.getRoot() );

			for ( const value of range ) {
				if ( value.item.is( 'element', 'image' ) ) {
					writer.setAttribute( 'src', base64Sample, value.item );
				}
			}
		} );
	} );

	it( 'should create responsive image if server return multiple images from base64 image', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		// Since upload starts asynchronously, success needs to be triggered after upload is started.
		uploadStartedCallback = function() {
			adapterMock.mockSuccess( { default: 'image.png', 500: 'image-500.png', 800: 'image-800.png' } );
		};

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				expectModel( done, model, '<paragraph><image src="image.png" ' +
					'srcset="{"data":"image-500.png 500w, image-800.png 800w","width":800}"></image>[]foo</paragraph>' );
			} );
		} );

		model.change( writer => {
			const image = writer.createElement( 'image' );

			writer.setAttribute( 'src', base64Sample, image );
			writer.insert( image, model.document.selection.getFirstPosition() );
		} );
	} );

	it( 'should not upload nor change image data when `File` constructor is not supported', done => {
		const fileFn = window.File;

		window.File = undefined;

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		model.document.once( 'change', () => {
			setTimeout( () => {
				window.File = fileFn;

				expect( adapterMock ).to.null;
				expectModel( done, model, `<paragraph><image src="${ base64Sample }"></image>[]foo</paragraph>` );

				done();
			}, 50 );
		} );

		model.change( writer => {
			const image = writer.createElement( 'image' );

			writer.setAttribute( 'src', base64Sample, image );
			writer.insert( image, model.document.selection.getFirstPosition() );
		} );
	} );

	it( 'should not initialize upload if inserted image have uploadId', () => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const imageUploadEditing = editor.plugins.get( ImageUploadEditing );
		const uploadSpy = sinon.spy( imageUploadEditing, '_uploadBase64Images' );

		model.document.once( 'change', () => {
			expect( uploadSpy.callCount ).to.equal( 0 );
			expect( getModelData( model ) ).to.equal(
				`<paragraph><image src="${ base64Sample }" uploadId="42"></image>[]foo</paragraph>` );
		} );

		model.change( writer => {
			const image = writer.createElement( 'image' );

			writer.setAttribute( 'src', base64Sample, image );
			writer.setAttribute( 'uploadId', 42, image );
			writer.insert( image, model.document.selection.getFirstPosition() );
		} );
	} );

	it( 'should not initialize upload if src of different element than image changed', () => {
		setModelData( model, '<paragraph src="foo">[]bar</paragraph>' );

		const imageUploadEditing = editor.plugins.get( ImageUploadEditing );
		const uploadSpy = sinon.spy( imageUploadEditing, '_uploadBase64Images' );

		model.document.once( 'change', () => {
			expect( uploadSpy.callCount ).to.equal( 0 );
			expect( getModelData( model ) ).to.equal( '<paragraph src="bar">[]bar</paragraph>' );
		} );

		model.change( writer => {
			const range = writer.createRangeIn( model.document.getRoot() );

			for ( const value of range ) {
				if ( value.item.is( 'element', 'paragraph' ) ) {
					writer.setAttribute( 'src', 'bar', value.item );
				}
			}
		} );
	} );

	it( 'should not change image src if upload aborted', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		// Since upload starts asynchronously, success needs to be triggered after upload is started.
		uploadStartedCallback = function() {
			adapterMock.abort();
		};

		model.document.once( 'change', () => {
			setTimeout( () => {
				expect( adapterMock.loader.status ).to.equal( 'error' );
				expectModel( done, model, `<paragraph><image src="${ base64Sample }"></image>[]foo</paragraph>` );
			}, 50 );
		} );

		model.change( writer => {
			const image = writer.createElement( 'image' );

			writer.setAttribute( 'src', base64Sample, image );
			writer.insert( image, model.document.selection.getFirstPosition() );
		} );
	} );

	it( 'should not throw error and not change image src if upload errored', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		// Since upload starts asynchronously, success needs to be triggered after upload is started.
		uploadStartedCallback = function() {
			adapterMock.mockError( 'Upload failed.' );
		};

		model.document.once( 'change', () => {
			setTimeout( () => {
				expect( adapterMock.loader.status ).to.equal( 'error' );
				expectModel( done, model, `<paragraph><image src="${ base64Sample }"></image>[]foo</paragraph>` );
			}, 50 );
		} );

		model.change( writer => {
			const image = writer.createElement( 'image' );

			writer.setAttribute( 'src', base64Sample, image );
			writer.insert( image, model.document.selection.getFirstPosition() );
		} );
	} );
} );

// Since this function is run inside Promise, all errors needs to be caught
// and rethrow to be correctly processed by testing framework.
function expectModel( done, model, expected ) {
	try {
		expect( getModelData( model ) ).to.equal( expected );
		done();
	} catch ( err ) {
		done( err );
	}
}
