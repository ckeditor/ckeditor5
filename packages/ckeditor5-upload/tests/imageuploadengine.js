/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, setTimeout */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageEngine from '@ckeditor/ckeditor5-image/src/image/imageengine';
import ImageUploadEngine from '../src/imageuploadengine';
import ImageUploadCommand from '../src/imageuploadcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import DataTransfer from '@ckeditor/ckeditor5-clipboard/src/datatransfer';
import FileRepository from '../src/filerepository';
import { AdapterMock, createNativeFileMock, NativeFileReaderMock } from './_utils/mocks';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';

describe( 'ImageUploadEngine', () => {
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	let editor, document, fileRepository, viewDocument, nativeReaderMock, loader, adapterMock;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'FileReader', () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		return ClassicTestEditor.create( {
			plugins: [ ImageEngine, ImageUploadEngine, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;
			document = editor.document;
			viewDocument = editor.editing.view;

			fileRepository = editor.plugins.get( FileRepository );
			fileRepository.createAdapter = newLoader => {
				loader = newLoader;
				adapterMock = new AdapterMock( loader );

				return adapterMock;
			};
		} );
	} );

	it( 'should register proper schema rules', () => {
		expect( document.schema.check( { name: 'image', attributes: [ 'uploadId' ], inside: '$root' } ) ).to.be.true;
	} );

	it( 'should register imageUpload command', () => {
		expect( editor.commands.get( 'imageUpload' ) ).to.be.instanceOf( ImageUploadCommand );
	} );

	it( 'should execute imageUpload command when image is pasted', () => {
		const spy = sinon.spy( editor, 'execute' );
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ] } );
		setModelData( document, '<paragraph>[]foo bar baz</paragraph>' );

		viewDocument.fire( 'clipboardInput', { dataTransfer } );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWith( spy, 'imageUpload' );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( document ) ).to.equal(
			`[<image uploadId="${ id }" uploadStatus="reading"></image>]<paragraph>foo bar baz</paragraph>`
		);
	} );

	it( 'should not execute imageUpload command when file is not an image', () => {
		const spy = sinon.spy( editor, 'execute' );
		const viewDocument = editor.editing.view;
		const fileMock = {
			type: 'media/mp3',
			size: 1024
		};
		const dataTransfer = new DataTransfer( { files: [ fileMock ] } );
		setModelData( document, '<paragraph>foo bar baz[]</paragraph>' );

		viewDocument.fire( 'clipboardInput', { dataTransfer } );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not convert image\'s uploadId attribute if is consumed already', () => {
		editor.editing.modelToView.on( 'addAttribute:uploadId:image', ( evt, data, consumable ) => {
			consumable.consume( data.item, eventNameToConsumableType( evt.name ) );
		}, { priority: 'high' } );

		setModelData( document, '<image uploadId="1234"></image>' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[]<figure class="image ck-widget" contenteditable="false">' +
				'<img></img>' +
			'</figure>' );
	} );

	it( 'should use read data once it is present', ( done ) => {
		const file = createNativeFileMock();
		setModelData( document, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		document.once( 'changesDone', () => {
			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget" contenteditable="false">' +
				`<img src="${ base64Sample }"></img>` +
				'</figure>]' +
				'<p>foo bar</p>' );
			expect( loader.status ).to.equal( 'uploading' );

			done();
		} );

		expect( loader.status ).to.equal( 'reading' );
		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should replace read data with server response once it is present', ( done ) => {
		const file = createNativeFileMock();
		setModelData( document, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		document.once( 'changesDone', () => {
			document.once( 'changesDone', () => {
				expect( getViewData( viewDocument ) ).to.equal(
					'[<figure class="image ck-widget" contenteditable="false"><img src="image.png"></img></figure>]<p>foo bar</p>'
				);
				expect( loader.status ).to.equal( 'idle' );

				done();
			} );

			adapterMock.mockSuccess( { original: 'image.png' } );
		} );

		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should fire notification event in case of error', ( done ) => {
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();

		notification.on( 'show:warning', ( evt, data ) => {
			expect( data.message ).to.equal( 'Reading error.' );
			evt.stop();

			done();
		}, { priority: 'high' } );

		setModelData( document, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		nativeReaderMock.mockError( 'Reading error.' );
	} );

	it( 'should not fire notification on abort', ( done ) => {
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();
		const spy = testUtils.sinon.spy();

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		setModelData( document, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );
		nativeReaderMock.abort();

		setTimeout( () => {
			sinon.assert.notCalled( spy );
			done();
		}, 0 );
	} );

	it( 'should do nothing if image does not have uploadId', () => {
		setModelData( document, '<image src="image.png"></image>' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[]<figure class="image ck-widget" contenteditable="false"><img src="image.png"></img></figure>'
		);
	} );

	it( 'should remove image in case of upload error', ( done ) => {
		const file = createNativeFileMock();
		const spy = testUtils.sinon.spy();
		const notification = editor.plugins.get( Notification );
		setModelData( document, '<paragraph>{}foo bar</paragraph>' );

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'imageUpload', { file } );

		document.once( 'changesDone', () => {
			document.once( 'changesDone', () => {
				expect( getModelData( document ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );
				sinon.assert.calledOnce( spy );

				done();
			} );
		} );

		nativeReaderMock.mockError( 'Upload error.' );
	} );

	it( 'should abort upload if image is removed', () => {
		const file = createNativeFileMock();
		setModelData( document, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );
		const abortSpy = testUtils.sinon.spy( loader, 'abort' );

		expect( loader.status ).to.equal( 'reading' );
		nativeReaderMock.mockSuccess( base64Sample );

		const image = document.getRoot().getChild( 0 );
		document.enqueueChanges( () => {
			const batch = document.batch();

			batch.remove( image );
		} );

		expect( loader.status ).to.equal( 'aborted' );
		sinon.assert.calledOnce( abortSpy );
	} );
} );
