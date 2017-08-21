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
import UndoEngine from '@ckeditor/ckeditor5-undo/src/undoengine';
import DataTransfer from '@ckeditor/ckeditor5-clipboard/src/datatransfer';

import FileRepository from '../src/filerepository';
import { AdapterMock, createNativeFileMock, NativeFileReaderMock } from './_utils/mocks';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';

describe( 'ImageUploadEngine', () => {
	// eslint-disable-next-line max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	let editor, doc, fileRepository, viewDocument, nativeReaderMock, loader, adapterMock;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'FileReader' ).callsFake( () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		return ClassicTestEditor
			.create( {
				plugins: [ ImageEngine, ImageUploadEngine, Paragraph, UndoEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
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
		expect( doc.schema.check( { name: 'image', attributes: [ 'uploadId' ], inside: '$root' } ) ).to.be.true;
	} );

	it( 'should register imageUpload command', () => {
		expect( editor.commands.get( 'imageUpload' ) ).to.be.instanceOf( ImageUploadCommand );
	} );

	it( 'should execute imageUpload command when image is pasted', () => {
		const spy = sinon.spy( editor, 'execute' );
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ] } );
		setModelData( doc, '<paragraph>[]foo</paragraph>' );

		const targetRange = Range.createFromParentsAndOffsets( doc.getRoot(), 1, doc.getRoot(), 1 );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWith( spy, 'imageUpload' );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( doc ) ).to.equal(
			`<paragraph>foo</paragraph>[<image uploadId="${ id }" uploadStatus="reading"></image>]`
		);
	} );

	it( 'should execute imageUpload command with an optimized position when image is pasted', () => {
		const spy = sinon.spy( editor, 'execute' );
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ] } );
		setModelData( doc, '<paragraph>[]foo</paragraph>' );

		const paragraph = doc.getRoot().getChild( 0 );
		const targetRange = Range.createFromParentsAndOffsets( paragraph, 1, paragraph, 1 ); // f[]oo
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWith( spy, 'imageUpload' );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( doc ) ).to.equal(
			`[<image uploadId="${ id }" uploadStatus="reading"></image>]<paragraph>foo</paragraph>`
		);
	} );

	it( 'should execute imageUpload command when multiple files image are pasted', () => {
		const spy = sinon.spy( editor, 'execute' );
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new DataTransfer( { files } );
		setModelData( doc, '<paragraph>[]foo</paragraph>' );

		const targetRange = Range.createFromParentsAndOffsets( doc.getRoot(), 1, doc.getRoot(), 1 );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		sinon.assert.calledTwice( spy );
		sinon.assert.calledWith( spy, 'imageUpload' );

		const id1 = fileRepository.getLoader( files[ 0 ] ).id;
		const id2 = fileRepository.getLoader( files[ 1 ] ).id;

		expect( getModelData( doc ) ).to.equal(
			'<paragraph>foo</paragraph>' +
			`<image uploadId="${ id1 }" uploadStatus="reading"></image>` +
			`[<image uploadId="${ id2 }" uploadStatus="reading"></image>]`
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

		setModelData( doc, '<paragraph>foo[]</paragraph>' );

		const targetRange = Range.createFromParentsAndOffsets( doc.getRoot(), 1, doc.getRoot(), 1 );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not convert image\'s uploadId attribute if is consumed already', () => {
		editor.editing.modelToView.on( 'addAttribute:uploadId:image', ( evt, data, consumable ) => {
			consumable.consume( data.item, eventNameToConsumableType( evt.name ) );
		}, { priority: 'high' } );

		setModelData( doc, '<image uploadId="1234"></image>' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<figure class="image ck-widget" contenteditable="false">' +
				'<img></img>' +
			'</figure>]' );
	} );

	it( 'should use read data once it is present', done => {
		const file = createNativeFileMock();
		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		doc.once( 'changesDone', () => {
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

	it( 'should replace read data with server response once it is present', done => {
		const file = createNativeFileMock();
		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		doc.once( 'changesDone', () => {
			doc.once( 'changesDone', () => {
				expect( getViewData( viewDocument ) ).to.equal(
					'[<figure class="image ck-widget" contenteditable="false"><img src="image.png"></img></figure>]<p>foo bar</p>'
				);
				expect( loader.status ).to.equal( 'idle' );

				done();
			} );

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

		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

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

		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );
		nativeReaderMock.abort();

		setTimeout( () => {
			sinon.assert.notCalled( spy );
			done();
		}, 0 );
	} );

	it( 'should do nothing if image does not have uploadId', () => {
		setModelData( doc, '<image src="image.png"></image>' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<figure class="image ck-widget" contenteditable="false"><img src="image.png"></img></figure>]'
		);
	} );

	it( 'should remove image in case of upload error', done => {
		const file = createNativeFileMock();
		const spy = testUtils.sinon.spy();
		const notification = editor.plugins.get( Notification );
		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'imageUpload', { file } );

		doc.once( 'changesDone', () => {
			doc.once( 'changesDone', () => {
				expect( getModelData( doc ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );
				sinon.assert.calledOnce( spy );

				done();
			} );
		} );

		nativeReaderMock.mockError( 'Upload error.' );
	} );

	it( 'should abort upload if image is removed', () => {
		const file = createNativeFileMock();
		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );
		const abortSpy = testUtils.sinon.spy( loader, 'abort' );

		expect( loader.status ).to.equal( 'reading' );
		nativeReaderMock.mockSuccess( base64Sample );

		const image = doc.getRoot().getChild( 0 );
		doc.enqueueChanges( () => {
			const batch = doc.batch();

			batch.remove( image );
		} );

		expect( loader.status ).to.equal( 'aborted' );
		sinon.assert.calledOnce( abortSpy );
	} );

	it( 'image should be permanently removed if it is removed by user during upload', done => {
		const file = createNativeFileMock();
		const notification = editor.plugins.get( Notification );
		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'imageUpload', { file } );

		doc.once( 'changesDone', () => {
			// This is called after "manual" remove.
			doc.once( 'changesDone', () => {
				// This is called after attributes are removed.
				let undone = false;

				doc.once( 'changesDone', () => {
					if ( !undone ) {
						undone = true;

						// This is called after abort remove.
						expect( getModelData( doc ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );

						editor.execute( 'undo' );

						// Expect that the image has not been brought back.
						expect( getModelData( doc ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );

						done();
					}
				} );
			} );
		} );

		const image = doc.getRoot().getChild( 0 );
		doc.enqueueChanges( () => {
			const batch = doc.batch();

			batch.remove( image );
		} );
	} );

	it( 'should create responsive image if server return multiple images', done => {
		const file = createNativeFileMock();
		setModelData( doc, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		doc.once( 'changesDone', () => {
			doc.once( 'changesDone', () => {
				expect( getViewData( viewDocument ) ).to.equal(
					'[<figure class="image ck-widget" contenteditable="false">' +
						'<img sizes="100vw" src="image.png" srcset="image-500.png 500w, image-800.png 800w"></img>' +
					'</figure>]<p>foo bar</p>'
				);
				expect( loader.status ).to.equal( 'idle' );

				done();
			} );

			adapterMock.mockSuccess( { default: 'image.png', 500: 'image-500.png', 800: 'image-800.png' } );
		} );

		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should prevent from browser redirecting when an image is dropped on another image', () => {
		const spy = testUtils.sinon.spy();

		editor.editing.view.fire( 'dragover', {
			preventDefault: spy
		} );

		expect( spy.calledOnce ).to.equal( true );
	} );
} );
