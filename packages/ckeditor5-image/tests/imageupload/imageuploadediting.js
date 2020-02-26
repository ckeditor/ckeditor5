/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, setTimeout, atob, URL, Blob, console */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ImageEditing from '../../src/image/imageediting';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import ImageUploadCommand from '../../src/imageupload/imageuploadcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import DataTransfer from '@ckeditor/ckeditor5-clipboard/src/datatransfer';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { UploadAdapterMock, createNativeFileMock, NativeFileReaderMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData, stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import env from '@ckeditor/ckeditor5-utils/src/env';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';

describe( 'ImageUploadEditing', () => {
	// eslint-disable-next-line max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	const isEdgeEnv = env.isEdge;

	let adapterMocks = [];
	let editor, model, view, doc, fileRepository, viewDocument, nativeReaderMock, loader;

	class UploadAdapterPluginMock extends Plugin {
		init() {
			fileRepository = this.editor.plugins.get( FileRepository );
			fileRepository.createUploadAdapter = newLoader => {
				loader = newLoader;
				const adapterMock = new UploadAdapterMock( loader );

				adapterMocks.push( adapterMock );

				return adapterMock;
			};
		}
	}

	beforeEach( () => {
		if ( isEdgeEnv ) {
			sinon.stub( window, 'File' ).callsFake( () => {
				return { name: 'file.jpg' };
			} );
		}

		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		sinon.stub( env, 'isEdge' ).get( () => false );

		sinon.stub( window, 'FileReader' ).callsFake( () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		return VirtualTestEditor
			.create( {
				plugins: [ ImageEditing, ImageUploadEditing, Paragraph, UndoEditing, UploadAdapterPluginMock, Clipboard ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				view = editor.editing.view;
				viewDocument = view.document;

				// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
				sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
			} );
	} );

	afterEach( () => {
		sinon.restore();
		adapterMocks = [];

		return editor.destroy();
	} );

	it( 'should register proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'image' ], 'uploadId' ) ).to.be.true;
	} );

	it( 'should register imageUpload command', () => {
		expect( editor.commands.get( 'imageUpload' ) ).to.be.instanceOf( ImageUploadCommand );
	} );

	it( 'should load Clipboard plugin', () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageEditing, ImageUploadEditing, Paragraph, UndoEditing, UploadAdapterPluginMock ]
			} )
			.then( editor => {
				expect( editor.plugins.get( Clipboard ) ).to.be.instanceOf( Clipboard );
			} );
	} );

	it( 'should insert image when is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( model ) ).to.equal(
			`<paragraph>foo</paragraph>[<image uploadId="${ id }" uploadStatus="reading"></image>]`
		);
		expect( eventInfo.stop.called ).to.be.true;
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
		const dataTransfer = new DataTransfer( {
			files: [ fileMock ],
			types: [ 'Files' ],
			getData: () => ''
		} );

		setModelData( model, '<paragraph>foo[]</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, { dataTransfer, targetRanges: [ targetViewRange ] } );

		expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
		expect( eventInfo.stop.called ).to.be.undefined;
	} );

	it( 'should not insert image when file is not an configured image type', () => {
		const viewDocument = editor.editing.view.document;
		const fileMock = {
			type: 'image/svg+xml',
			size: 1024
		};
		const dataTransfer = new DataTransfer( {
			files: [ fileMock ],
			types: [ 'Files' ],
			getData: () => ''
		} );

		setModelData( model, '<paragraph>foo[]</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, { dataTransfer, targetRanges: [ targetViewRange ] } );

		expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
		expect( eventInfo.stop.called ).to.be.undefined;
	} );

	it( 'should not insert image when file is null', () => {
		const viewDocument = editor.editing.view.document;
		const dataTransfer = new DataTransfer( { files: [ null ], types: [ 'Files' ], getData: () => null } );

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

		expect( getModelData( model ) ).to.equal( '<paragraph>SomeData[]foo</paragraph>' );
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

	it( 'should not throw when upload adapter is not set (FileRepository will log an warn anyway) when image is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		const consoleWarnStub = sinon.stub( console, 'warn' );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		fileRepository.createUploadAdapter = undefined;

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		expect( () => {
			viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
		} ).to.not.throw();

		expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
		sinon.assert.calledOnce( consoleWarnStub );
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
		expect( getModelData( model ) ).to.equal( '<paragraph>SomeData[]foo</paragraph>' );
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

	it( 'should not use read data once it is present', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		model.document.once( 'change', () => {
			tryExpect( done, () => {
				expect( getViewData( view ) ).to.equal(
					'[<figure class="ck-widget image" contenteditable="false">' +
						// Rendering the image data is left to a upload progress converter.
						'<img></img>' +
						'</figure>]' +
					'<p>foo bar</p>'
				);

				expect( loader.status ).to.equal( 'uploading' );
			} );
		} );

		expect( loader.status ).to.equal( 'reading' );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	it( 'should replace read data with server response once it is present', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expect( getViewData( view ) ).to.equal(
						'[<figure class="ck-widget image" contenteditable="false"><img src="image.png"></img></figure>]<p>foo bar</p>'
					);
					expect( loader.status ).to.equal( 'idle' );
				} );
			}, { priority: 'lowest' } );

			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png' } ) );
		} );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	it( 'should fire notification event in case of error', done => {
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();

		notification.on( 'show:warning', ( evt, data ) => {
			tryExpect( done, () => {
				expect( data.message ).to.equal( 'Reading error.' );
				expect( data.title ).to.equal( 'Upload failed' );
				evt.stop();
			} );
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		loader.file.then( () => nativeReaderMock.mockError( 'Reading error.' ) );
	} );

	it( 'should not fire notification on abort', done => {
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();
		const spy = sinon.spy();

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		loader.file.then( () => {
			nativeReaderMock.abort();

			setTimeout( () => {
				sinon.assert.notCalled( spy );
				done();
			}, 0 );
		} );
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
		editor.execute( 'imageUpload', { file } );

		sinon.assert.calledOnce( loadSpy );

		const promise = loadSpy.returnValues[ 0 ];

		// Check if error can be caught.
		promise.catch( catchSpy );

		loader.file.then( () => {
			nativeReaderMock.mockSuccess();

			setTimeout( () => {
				sinon.assert.calledOnce( catchSpy );
				const error = catchSpy.getCall( 0 ).args[ 0 ];

				expect( error ).to.be.instanceOf( Error );
				expect( error ).to.haveOwnProperty( 'message', 'Foo bar baz' );

				done();
			}, 0 );
		} );
	} );

	it( 'should do nothing if image does not have uploadId', () => {
		setModelData( model, '<image src="image.png"></image>' );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false"><img src="image.png"></img></figure>]'
		);
	} );

	it( 'should remove image in case of upload error', done => {
		const file = createNativeFileMock();
		const spy = sinon.spy();
		const notification = editor.plugins.get( Notification );
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'imageUpload', { file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );

		loader.file.then( () => nativeReaderMock.mockError( 'Upload error.' ) );
	} );

	it( 'should abort upload if image is removed', () => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		const abortSpy = sinon.spy( loader, 'abort' );

		expect( loader.status ).to.equal( 'reading' );

		return loader.file.then( () => {
			nativeReaderMock.mockSuccess( base64Sample );

			const image = doc.getRoot().getChild( 0 );
			model.change( writer => {
				writer.remove( image );
			} );

			expect( loader.status ).to.equal( 'aborted' );
			sinon.assert.calledOnce( abortSpy );
		} );
	} );

	it( 'should not abort and not restart upload when image is moved', () => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		const abortSpy = sinon.spy( loader, 'abort' );
		const loadSpy = sinon.spy( loader, 'read' );

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

		editor.execute( 'imageUpload', { file } );

		const stub = sinon.stub();
		model.document.on( 'change', stub );

		// The first `change` event is fired after the "manual" remove.
		// The second `change` event is fired after cleaning attributes.
		stub.onSecondCall().callsFake( () => {
			expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );

			editor.execute( 'undo' );

			// Expect that the image has not been brought back.
			expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );

			done();
		} );

		const image = doc.getRoot().getChild( 0 );

		model.change( writer => {
			writer.remove( image );
		} );
	} );

	it( 'should create responsive image if server return multiple images', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'imageUpload', { file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expect( getViewData( view ) ).to.equal(
						'[<figure class="ck-widget image" contenteditable="false">' +
						'<img sizes="100vw" src="image.png" srcset="image-500.png 500w, image-800.png 800w" width="800"></img>' +
						'</figure>]<p>foo bar</p>'
					);
					expect( loader.status ).to.equal( 'idle' );
				} );
			}, { priority: 'lowest' } );

			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png', 500: 'image-500.png', 800: 'image-800.png' } ) );
		} );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	it( 'should prevent from browser redirecting when an image is dropped on another image', () => {
		const spy = sinon.spy();

		editor.editing.view.document.fire( 'dragover', {
			preventDefault: spy
		} );

		expect( spy.calledOnce ).to.equal( true );
	} );

	it( 'should upload image with base64 src', done => {
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', () => {
			const id = adapterMocks[ 0 ].loader.id;
			const expected = '<paragraph>bar</paragraph>' +
				`[<image src="" uploadId="${ id }" uploadStatus="reading"></image>]` +
				'<paragraph>foo</paragraph>';

			expectModel( done, getModelData( model ), expected );
		}, { priority: 'low' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>bar</p><img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should upload image with blob src', done => {
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', () => {
			const id = adapterMocks[ 0 ].loader.id;
			const expected = `[<image src="" uploadId="${ id }" uploadStatus="reading"></image>]` +
				'<paragraph>foo</paragraph>';

			expectModel( done, getModelData( model ), expected );
		}, { priority: 'low' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should not upload image if no loader available', done => {
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', () => {
			const expected = `[<image src="${ base64Sample }"></image>]<paragraph>foo</paragraph>`;

			expectModel( done, getModelData( model ), expected );
		}, { priority: 'low' } );

		sinon.stub( fileRepository, 'createLoader' ).callsFake( () => null );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should not upload and remove image if fetch failed', done => {
		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		expectData(
			'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
			'[<image src="" uploadId="#loader1_id" uploadStatus="reading"></image>]<paragraph>foo</paragraph>',
			'<paragraph>[]foo</paragraph>',
			done,
			false
		);

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` so it can be rejected.
		sinon.stub( window, 'fetch' ).callsFake( () => {
			return new Promise( ( res, rej ) => rej( 'could not fetch' ) );
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should upload only images which were successfully fetched and remove failed ones', done => {
		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		const expectedModel = '<paragraph>bar</paragraph>' +
			'<image src="" uploadId="#loader1_id" uploadStatus="reading"></image>' +
			'<image src="" uploadId="#loader2_id" uploadStatus="reading"></image>' +
			'[<image src="" uploadId="#loader3_id" uploadStatus="reading"></image>]' +
			'<paragraph>foo</paragraph>';
		const expectedFinalModel = '<paragraph>bar</paragraph>' +
			'<image src="" uploadId="#loader1_id" uploadStatus="reading"></image>' +
			'[<image src="" uploadId="#loader2_id" uploadStatus="reading"></image>]' +
			'<paragraph>foo</paragraph>';

		expectData(
			'',
			expectedModel,
			expectedFinalModel,
			done
		);

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>bar</p><img src=${ base64Sample } />` +
			`<img src=${ base64ToBlobUrl( base64Sample ) } /><img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` in a way that 2 first calls are successful and 3rd fails.
		let counter = 0;
		const fetch = window.fetch;
		sinon.stub( window, 'fetch' ).callsFake( src => {
			counter++;
			if ( counter < 3 ) {
				return fetch( src );
			} else {
				return Promise.reject();
			}
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should not upload and remove image when `File` constructor is not present', done => {
		const fileFn = window.File;

		window.File = undefined;

		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		expectData(
			'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img><p>baz</p>',
			'<image src="" uploadId="#loader1_id" uploadStatus="reading"></image><paragraph>baz[]foo</paragraph>',
			'<paragraph>baz[]foo</paragraph>',
			err => {
				window.File = fileFn;
				done( err );
			},
			false
		);

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } /><p>baz</p>`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should not upload and remove image when `File` constructor is not supported', done => {
		if ( isEdgeEnv ) {
			// Since on Edge `File` is already stubbed, restore it to it native form so that exception will be thrown.
			sinon.restore();
			// Since all stubs were restored, re-stub `scrollToTheSelection`.
			sinon.stub( editor.editing.view, 'scrollToTheSelection' ).callsFake( () => {} );
		} else {
			sinon.stub( window, 'File' ).throws( 'Function expected.' );
		}

		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		expectData(
			'<p>baz</p><img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
			'<paragraph>baz</paragraph>[<image src="" uploadId="#loader1_id" uploadStatus="reading"></image>]<paragraph>foo</paragraph>',
			'<paragraph>baz[]</paragraph><paragraph>foo</paragraph>',
			done,
			false
		);

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>baz</p><img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	// Skip this test on Edge as we mock `File` object there so there is no sense in testing it.
	( isEdgeEnv ? it.skip : it )( 'should get file extension from base64 string', done => {
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', () => {
			tryExpect( done, () => {
				loader.file.then( file => expect( file.name.split( '.' ).pop() ).to.equal( 'png' ) );
			} );
		}, { priority: 'low' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` to return custom blob without type.
		sinon.stub( window, 'fetch' ).callsFake( () => {
			return new Promise( res => res( {
				blob() {
					return new Promise( res => res( new Blob( [ 'foo', 'bar' ] ) ) );
				}
			} ) );
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	// Skip this test on Edge as we mock `File` object there so there is no sense in testing it.
	( isEdgeEnv ? it.skip : it )( 'should use fallback file extension', done => {
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', () => {
			tryExpect( done, () => {
				loader.file.then( file => expect( file.name.split( '.' ).pop() ).to.equal( 'jpeg' ) );
			} );
		}, { priority: 'low' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` to return custom blob without type.
		sinon.stub( window, 'fetch' ).callsFake( () => {
			return new Promise( res => res( {
				blob() {
					return new Promise( res => res( new Blob( [ 'foo', 'bar' ] ) ) );
				}
			} ) );
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should not show notification when file loader failed with no error', done => {
		const notification = editor.plugins.get( Notification );

		let notificationsCount = 0;
		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			notificationsCount++;
			evt.stop();
		}, { priority: 'high' } );

		// Check data after paste.
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', () => {
			adapterMocks[ 0 ].loader.file.then( () => {
				expect.fail( 'Promise should be rejected.' );
			} ).catch( () => {
				// Deffer so the promise could be resolved.
				setTimeout( () => {
					expect( notificationsCount ).to.equal( 0 );
					done();
				} );
			} );
		}, { priority: 'low' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` in a way that it always fails.
		sinon.stub( window, 'fetch' ).callsFake( () => Promise.reject() );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	// Helper for validating clipboard and model data as a result of a paste operation. This function checks both clipboard
	// data and model data synchronously (`expectedClipboardData`, `expectedModel`) and then the model data after `loader.file`
	// promise is resolved (so model state after successful/failed file fetch attempt).
	//
	// @param {String} expectedClipboardData Expected clipboard data on `inputTransformation` event.
	// @param {String} expectedModel Expected model data on `inputTransformation` event.
	// @param {String} expectedModelOnFile Expected model data after all `file.loader` promises are fetched.
	// @param {Function} doneFn Callback function to be called when all assertions are done or error occures.
	// @param {Boolean} [onSuccess=true] If `expectedModelOnFile` data should be validated
	// on `loader.file` a promise successful resolution or promise rejection.
	function expectData( expectedClipboardData, expectedModel, expectedModelOnFile, doneFn, onSuccess ) {
		// Check data after paste.
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', ( evt, data ) => {
			const clipboardData = injectLoaderId( expectedClipboardData || '', adapterMocks );
			const modelData = injectLoaderId( expectedModel, adapterMocks );
			const finalModelData = injectLoaderId( expectedModelOnFile, adapterMocks );

			if ( clipboardData.length ) {
				expect( stringifyView( data.content ) ).to.equal( clipboardData );
			}
			expect( getModelData( model ) ).to.equal( modelData );

			if ( onSuccess !== false ) {
				adapterMocks[ 0 ].loader.file.then( () => {
					// Deffer so the promise could be resolved.
					setTimeout( () => {
						expectModel( doneFn, getModelData( model ), finalModelData );
					} );
				} );
			} else {
				adapterMocks[ 0 ].loader.file.then( () => {
					expect.fail( 'The `loader.file` should be rejected.' );
				} ).catch( () => {
					// Deffer so the promise could be resolved.
					setTimeout( () => {
						expectModel( doneFn, getModelData( model ), finalModelData );
					} );
				} );
			}
		}, { priority: 'low' } );
	}
} );

// Replaces '#loaderX_id' parameter in the given string with a loader id. It is used
// so data string could be created before loader is initialized.
//
// @param {String} data String which have 'loader params' replaced.
// @param {Array.<UploadAdapterMock>} adapters Adapters list. Each adapter holds a reference to a loader which id is used.
// @returns {String} Data string with 'loader params' replaced.
function injectLoaderId( data, adapters ) {
	let newData = data;

	if ( newData.includes( '#loader1_id' ) ) {
		newData = newData.replace( '#loader1_id', adapters[ 0 ].loader.id );
	}
	if ( newData.includes( '#loader2_id' ) ) {
		newData = newData.replace( '#loader2_id', adapters[ 1 ].loader.id );
	}
	if ( newData.includes( '#loader3_id' ) ) {
		newData = newData.replace( '#loader3_id', adapters[ 2 ].loader.id );
	}

	return newData;
}

// Asserts actual and expected model data.
//
// @param {function} done Callback function to be called when assertion is done.
// @param {String} actual Actual model data.
// @param {String} expected Expected model data.
function expectModel( done, actual, expected ) {
	tryExpect( done, () => {
		expect( actual ).to.equal( expected );
	} );
}

// Runs given expect function in a try-catch. It should be used only when `expect` is called as a result of a `Promise`
// resolution as all errors may be caught by tested code and needs to be rethrow to be correctly processed by a testing framework.
//
// @param {Function} doneFn Function to run when assertion is done.
// @param {Function} expectFn Function containing all assertions.
function tryExpect( doneFn, expectFn ) {
	try {
		expectFn();
		doneFn();
	} catch ( err ) {
		doneFn( err );
	}
}

// Creates data transfer object with predefined data.
//
// @param {String} content The content returned as `text/html` when queried.
// @returns {module:clipboard/datatransfer~DataTransfer} DataTransfer object.
function mockDataTransfer( content ) {
	return new DataTransfer( {
		types: [ 'text/html' ],
		getData: type => type === 'text/html' ? content : ''
	} );
}

// Creates blob url from the given base64 data.
//
// @param {String} base64 The base64 string from which blob url will be generated.
// @returns {String} Blob url.
function base64ToBlobUrl( base64 ) {
	return URL.createObjectURL( base64ToBlob( base64.trim() ) );
}

// Transforms base64 data into a blob object.
//
// @param {String} The base64 data to be transformed.
// @returns {Blob} Blob object representing given base64 data.
function base64ToBlob( base64Data ) {
	const [ type, data ] = base64Data.split( ',' );
	const byteCharacters = atob( data );
	const byteArrays = [];

	for ( let offset = 0; offset < byteCharacters.length; offset += 512 ) {
		const slice = byteCharacters.slice( offset, offset + 512 );
		const byteNumbers = new Array( slice.length );

		for ( let i = 0; i < slice.length; i++ ) {
			byteNumbers[ i ] = slice.charCodeAt( i );
		}

		byteArrays.push( new Uint8Array( byteNumbers ) );
	}

	return new Blob( byteArrays, { type } );
}
