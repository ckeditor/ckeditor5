/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, setTimeout, atob, URL, Blob, HTMLCanvasElement, console, document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import ImageBlockEditing from '../../src/image/imageblockediting.js';
import ImageInlineEditing from '../../src/image/imageinlineediting.js';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting.js';
import UploadImageCommand from '../../src/imageupload/uploadimagecommand.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import DataTransfer from '@ckeditor/ckeditor5-engine/src/view/datatransfer.js';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository.js';
import { UploadAdapterMock, createNativeFileMock, NativeFileReaderMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData, stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification.js';
import { downcastImageAttribute } from '../../src/image/converters.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'ImageUploadEditing', () => {
	// eslint-disable-next-line max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

	let adapterMocks = [];
	let editor, editorElement, model, view, doc, fileRepository, viewDocument, nativeReaderMock, loader;

	testUtils.createSinonSandbox();

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
		editorElement = document.createElement( 'div' );

		document.body.appendChild( editorElement );

		sinon.stub( window, 'FileReader' ).callsFake( () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		return ClassicEditor
			.create( editorElement, {
				plugins: [
					ImageBlockEditing, ImageInlineEditing, ImageUploadEditing,
					Paragraph, UndoEditing, UploadAdapterPluginMock, ClipboardPipeline
				],
				image: { insert: { type: 'auto' } }
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
		editorElement.remove();
		sinon.restore();
		adapterMocks = [];

		return editor.destroy();
	} );

	it( 'should register proper schema rules when both ImageBlock and ImageInline are enabled', () => {
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadId' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadStatus' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadId' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadStatus' ) ).to.be.true;
	} );

	it( 'should register proper schema rules for image style when ImageBlock plugin is enabled', async () => {
		const newEditor = await VirtualTestEditor.create( { plugins: [ ImageBlockEditing, ImageUploadEditing ] } );
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadId' ) ).to.be.true;
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadStatus' ) ).to.be.true;
		await newEditor.destroy();
	} );

	it( 'should register proper schema rules for image style when ImageInline plugin is enabled', async () => {
		const newEditor = await VirtualTestEditor.create( { plugins: [ ImageInlineEditing, ImageUploadEditing ] } );
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadId' ) ).to.be.true;
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadStatus' ) ).to.be.true;
		await newEditor.destroy();
	} );

	it( 'should wait for ImageInlineEditing and ImageBlockEditing before extending their model elements in schema', async () => {
		const editor = await VirtualTestEditor.create( {
			plugins: [
				// The order matters.
				ImageUploadEditing, ImageBlockEditing, ImageInlineEditing
			]
		} );

		expect( editor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadId' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadStatus' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadId' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadStatus' ) ).to.be.true;

		await editor.destroy();
	} );

	it( 'should register the uploadImage command', () => {
		expect( editor.commands.get( 'uploadImage' ) ).to.be.instanceOf( UploadImageCommand );
	} );

	it( 'should register the imageUpload command as an alias for the uploadImage command', () => {
		expect( editor.commands.get( 'imageUpload' ) ).to.equal( editor.commands.get( 'uploadImage' ) );
	} );

	it( 'should load Clipboard plugin', () => {
		return VirtualTestEditor
			.create( {
				plugins: [
					ImageBlockEditing, ImageInlineEditing, ImageUploadEditing,
					Paragraph, UndoEditing, UploadAdapterPluginMock
				]
			} )
			.then( editor => {
				expect( editor.plugins.get( ClipboardPipeline ) ).to.be.instanceOf( ClipboardPipeline );
			} );
	} );

	it( 'should insert image when is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		setModelData( model, '<paragraph>foo[]</paragraph>' );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, { dataTransfer, targetRanges: null } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( model ) ).to.equal(
			`<paragraph>foo[<imageInline uploadId="${ id }" uploadStatus="reading"></imageInline>]</paragraph>`
		);
		expect( eventInfo.stop.called ).to.be.true;
	} );

	it( 'should insert image when is dropped', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( model ) ).to.equal(
			`<paragraph>foo</paragraph>[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]`
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
			`<paragraph>f[<imageInline uploadId="${ id }" uploadStatus="reading"></imageInline>]oo</paragraph>`
		);
	} );

	it( 'should insert multiple image files when are pasted (inline image type)', () => {
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new DataTransfer( { files, types: [ 'Files' ] } );
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange(
			model.createPositionAt( doc.getRoot().getChild( 0 ), 3 ),
			model.createPositionAt( doc.getRoot().getChild( 0 ), 3 )
		);
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id1 = fileRepository.getLoader( files[ 0 ] ).id;
		const id2 = fileRepository.getLoader( files[ 1 ] ).id;

		expect( getModelData( model ) ).to.equal(
			'<paragraph>' +
				`foo<imageInline uploadId="${ id1 }" uploadStatus="reading"></imageInline>` +
				`[<imageInline uploadId="${ id2 }" uploadStatus="reading"></imageInline>]` +
			'</paragraph>'
		);
	} );

	it( 'should insert multiple image files when are pasted', () => {
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new DataTransfer( { files, types: [ 'Files' ] } );
		setModelData( model, '[]' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id1 = fileRepository.getLoader( files[ 0 ] ).id;
		const id2 = fileRepository.getLoader( files[ 1 ] ).id;

		expect( getModelData( model ) ).to.equal(
			'<paragraph></paragraph>' +
			`<imageBlock uploadId="${ id1 }" uploadStatus="reading"></imageBlock>` +
			`[<imageBlock uploadId="${ id2 }" uploadStatus="reading"></imageBlock>]`
		);
	} );

	it( 'should display notification when no permission to upload from computer.', done => {
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new DataTransfer( { files, types: [ 'Files' ] } );
		const uploadImageCommand = editor.commands.get( 'uploadImage' );
		const notification = editor.plugins.get( Notification );

		notification.on( 'show:warning', ( evt, data ) => {
			tryExpect( done, () => {
				expect( data.message ).to.equal( 'No permission to upload from computer. Try using the file manager ' +
				'or contact your administrator.' );
				evt.stop();
			} );
		}, { priority: 'high' } );

		uploadImageCommand.set( 'isAccessAllowed', false );

		setModelData( model, '[]' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} );

	it( 'should insert image when is pasted on allowed position when UploadImageCommand is enabled', () => {
		setModelData( model, '<paragraph>foo</paragraph>[<imageBlock></imageBlock>]' );

		const fileMock = createNativeFileMock();
		const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );

		const command = editor.commands.get( 'uploadImage' );

		expect( command.isEnabled ).to.be.true;

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 0 ), model.createPositionAt( doc.getRoot(), 0 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( model ) ).to.equal(
			`[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]<paragraph>foo</paragraph><imageBlock></imageBlock>`
		);
	} );

	it( 'should not insert image when editor is in read-only mode', () => {
		// Clipboard plugin is required for this test.
		return VirtualTestEditor
			.create( {
				plugins: [
					ImageBlockEditing, ImageInlineEditing, ImageUploadEditing,
					Paragraph, UploadAdapterPluginMock, ClipboardPipeline
				]
			} )
			.then( editor => {
				const fileMock = createNativeFileMock();
				const dataTransfer = new DataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
				setModelData( editor.model, '<paragraph>[]foo</paragraph>' );

				const targetRange = editor.model.document.selection.getFirstRange();
				const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

				editor.enableReadOnlyMode( 'unit-test' );

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
			allowChildren: '$text',
			isLimit: true
		} );

		model.schema.addChildCheck( ( context, childDefinition ) => {
			if ( childDefinition.name.startsWith( 'imageBlock' ) && context.last.name === 'other' ) {
				return false;
			}
		} );

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
		editor.editing.downcastDispatcher.on( 'attribute:uploadId:imageBlock', ( evt, data, conversionApi ) => {
			conversionApi.consumable.consume( data.item, evt.name );
		}, { priority: 'high' } );

		setModelData( model, '<imageBlock uploadId="1234"></imageBlock>' );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false">' +
			'<img></img>' +
			'</figure>]' );
	} );

	it( 'should not use read data once it is present', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		model.document.once( 'change', () => {
			tryExpect( done, () => {
				expect( getViewData( view ) ).to.equal(
					'<p>[<span class="ck-widget image-inline" contenteditable="false">' +
						// Rendering the image data is left to a upload progress converter.
						'<img></img>' +
					'</span>}foo bar</p>'
				);

				expect( loader.status ).to.equal( 'uploading' );
			} );
		} );

		expect( loader.status ).to.equal( 'reading' );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	it( 'should replace read data with server response once it is present', async () => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png' } ) );
		} );

		expect( getViewData( view ) ).to.equal(
			'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="image.png"></img></span>}foo bar</p>'
		);
		expect( loader.status ).to.equal( 'idle' );
	} );

	it( 'should set image width and height after server response', async () => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: '/assets/sample.png' } ) );
		} );

		await timeout( 100 );

		expect( getModelData( model ) ).to.equal(
			'<paragraph>[<imageInline height="96" src="/assets/sample.png" width="96"></imageInline>]foo bar</paragraph>'
		);
	} );

	it( 'should not modify image width if width was set before server response', async () => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img width="50" src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: '/assets/sample.png', 800: 'image-800.png' } ) );
		} );

		await timeout( 100 );

		expect( getModelData( model ) ).to.equal(
			'[<imageBlock src="/assets/sample.png" srcset="image-800.png 800w" width="50"></imageBlock>]<paragraph>foo</paragraph>'
		);
	} );

	it( 'should not modify image width if height was set before server response', async () => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img height="50" src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: '/assets/sample.png', 800: 'image-800.png' } ) );
		} );

		await timeout( 100 );

		expect( getModelData( model ) ).to.equal(
			'[<imageBlock height="50" src="/assets/sample.png" srcset="image-800.png 800w"></imageBlock>]<paragraph>foo</paragraph>'
		);
	} );

	it( 'should support adapter response with the normalized `urls` property', async () => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { urls: { default: 'image.png' } } ) );
		} );

		expect( getViewData( view ) ).to.equal(
			'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="image.png"></img></span>}foo bar</p>'
		);
		expect( loader.status ).to.equal( 'idle' );
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
		editor.execute( 'uploadImage', { file } );

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
		editor.execute( 'uploadImage', { file } );

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
		editor.editing.downcastDispatcher.on( 'attribute:uploadStatus:imageInline', ( evt, data ) => {
			if ( data.attributeNewValue == 'uploading' ) {
				throw error;
			}
		} );

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		sinon.assert.calledOnce( loadSpy );

		const promise = loadSpy.returnValues[ 0 ];

		// Check if error can be caught.
		promise.catch( catchSpy );

		loader.file.then( () => {
			nativeReaderMock.mockSuccess();

			setTimeout( () => {
				sinon.assert.calledOnce( catchSpy );
				const error = catchSpy.getCall( 0 ).args[ 0 ];

				assertCKEditorError( error, /^Foo bar baz/ );

				done();
			}, 0 );
		} );
	} );

	it( 'should do nothing if image does not have uploadId', () => {
		setModelData( model, '<imageBlock src="image.png"></imageBlock>' );

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

		editor.execute( 'uploadImage', { file } );

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
		editor.execute( 'uploadImage', { file } );

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
		editor.execute( 'uploadImage', { file } );

		const abortSpy = sinon.spy( loader, 'abort' );
		const loadSpy = sinon.spy( loader, 'read' );

		const paragraph = doc.getRoot().getChild( 0 );
		const image = paragraph.getChild( 0 );

		model.change( writer => {
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( paragraph, 2 ) );
		} );

		expect( abortSpy.called ).to.be.false;
		expect( loadSpy.called ).to.be.false;
	} );

	it( 'should not abort if an image changed type (but with the same uploadId value)', async () => {
		const file = createNativeFileMock();

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
		const abortSpy = sinon.spy( loader, 'abort' );
		const id = fileRepository.getLoader( file ).id;
		const uploadCompleteSpy = sinon.spy();

		imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		expect( getModelData( model ) ).to.equal(
			`<paragraph>[<imageInline uploadId="${ id }" uploadStatus="uploading"></imageInline>]foo bar</paragraph>`
		);

		editor.execute( 'imageTypeBlock' );

		expect( getModelData( model ) ).to.equal(
			`[<imageBlock uploadId="${ id }" uploadStatus="uploading"></imageBlock>]<paragraph>foo bar</paragraph>`
		);

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png' } ) );
		} );

		expect( getModelData( model ) ).to.equal(
			'[<imageBlock src="image.png"></imageBlock>]<paragraph>foo bar</paragraph>'
		);

		sinon.assert.notCalled( abortSpy );
		sinon.assert.calledOnce( uploadCompleteSpy );
	} );

	it( 'should abort if an image changed type and then was removed', async () => {
		const file = createNativeFileMock();

		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
		const abortSpy = sinon.spy( loader, 'abort' );
		const id = fileRepository.getLoader( file ).id;
		const uploadCompleteSpy = sinon.spy();

		imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

		await loader.file;

		nativeReaderMock.mockSuccess( base64Sample );

		editor.execute( 'imageTypeBlock' );

		expect( getModelData( model ) ).to.equal(
			`[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]<paragraph>foo bar</paragraph>`
		);

		sinon.assert.notCalled( abortSpy );

		model.change( writer => {
			writer.remove( model.document.selection.getSelectedElement() );
		} );

		sinon.assert.calledOnce( abortSpy );
		sinon.assert.notCalled( uploadCompleteSpy );

		expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph>' );
	} );

	it( 'image should be permanently removed if it is removed by user during upload', done => {
		const file = createNativeFileMock();
		const notification = editor.plugins.get( Notification );
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'uploadImage', { file } );

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

		const image = doc.getRoot().getChild( 0 ).getChild( 0 );

		model.change( writer => {
			writer.remove( image );
		} );
	} );

	it( 'should create responsive image if the server returns multiple images', done => {
		const file = createNativeFileMock();
		setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expect( getViewData( view ) ).to.equal(
						'<p>[<span class="ck-widget image-inline" contenteditable="false">' +
							'<img sizes="100vw" src="image.png" srcset="image-500.png 500w, image-800.png 800w" width="800"></img>' +
						'</span>}foo bar</p>'
					);
					expect( loader.status ).to.equal( 'idle' );
				} );
			}, { priority: 'lowest' } );

			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png', 500: 'image-500.png', 800: 'image-800.png' } ) );
		} );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	describe( 'uploadComplete event', () => {
		it( 'should be fired when the upload adapter resolves with the image data', async () => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>[]foo bar</paragraph>' );

			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			const uploadCompleteSpy = sinon.spy();

			imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

			editor.execute( 'uploadImage', { file } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
			} );

			sinon.assert.notCalled( uploadCompleteSpy );

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png' } ) );
			} );

			sinon.assert.calledOnce( uploadCompleteSpy );

			const eventArgs = uploadCompleteSpy.firstCall.args[ 1 ];

			expect( eventArgs ).to.be.an( 'object' );
			expect( eventArgs.imageElement.is( 'model:element', 'imageInline' ) ).to.be.true;
			expect( eventArgs.data ).to.deep.equal( { default: 'image.png' } );
		} );

		it( 'should allow modifying the image element once the original image is uploaded', async () => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>[]foo bar</paragraph>' );

			editor.model.schema.extend( 'imageBlock', { allowAttributes: 'data-original' } );

			editor.conversion.for( 'downcast' )
				.add( downcastImageAttribute( editor.plugins.get( 'ImageUtils' ), 'data-original' ) );

			editor.conversion.for( 'upcast' )
				.attributeToAttribute( {
					view: {
						name: 'img',
						key: 'data-original'
					},
					model: 'data-original'
				} );

			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			let batch;

			imageUploadEditing.on( 'uploadComplete', ( evt, { imageElement, data } ) => {
				editor.model.change( writer => {
					writer.setAttribute( 'data-original', data.originalUrl, imageElement );
					batch = writer.batch;
				} );
			} );

			editor.execute( 'uploadImage', { file } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
			} );

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { originalUrl: 'original.jpg', default: 'image.jpg' } ) );
			} );

			// Make sure the custom attribute was set in the same non-undoable batch as the default handling (setting src and status).
			expect( batch.isUndoable ).to.be.false;
			expect( batch.operations.length ).to.equal( 3 );

			expect( batch.operations[ 0 ].type ).to.equal( 'changeAttribute' );
			expect( batch.operations[ 0 ].key ).to.equal( 'uploadStatus' );
			expect( batch.operations[ 0 ].newValue ).to.equal( 'complete' );

			expect( batch.operations[ 1 ].type ).to.equal( 'addAttribute' );
			expect( batch.operations[ 1 ].key ).to.equal( 'data-original' );
			expect( batch.operations[ 1 ].newValue ).to.equal( 'original.jpg' );

			expect( batch.operations[ 2 ].type ).to.equal( 'addAttribute' );
			expect( batch.operations[ 2 ].key ).to.equal( 'src' );
			expect( batch.operations[ 2 ].newValue ).to.equal( 'image.jpg' );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>[<imageInline data-original="original.jpg" src="image.jpg"></imageInline>]foo bar</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="image.jpg"></img></span>}foo bar</p>'
			);
		} );

		it( 'should allow stopping the original listener that sets image attributes based on the data', async () => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>[]foo bar</paragraph>' );

			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			let batch;

			imageUploadEditing.on( 'uploadComplete', ( evt, { imageElement } ) => {
				evt.stop();

				model.change( writer => {
					writer.setAttribute( 'src', 'foo.jpg', imageElement );
					batch = writer.batch;
				} );
			} );

			editor.execute( 'uploadImage', { file } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
			} );

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess(
					{ default: 'image.png', 500: 'image-500.png', 800: 'image-800.png' }
				) );
			} );

			// Make sure the custom attribute was set in the non-undoable batch as the default handling (setting src and status).
			expect( batch.isUndoable ).to.be.false;
			expect( batch.operations.length ).to.equal( 2 );

			expect( batch.operations[ 0 ].type ).to.equal( 'changeAttribute' );
			expect( batch.operations[ 0 ].key ).to.equal( 'uploadStatus' );
			expect( batch.operations[ 0 ].newValue ).to.equal( 'complete' );

			expect( batch.operations[ 1 ].type ).to.equal( 'addAttribute' );
			expect( batch.operations[ 1 ].key ).to.equal( 'src' );
			expect( batch.operations[ 1 ].newValue ).to.equal( 'foo.jpg' );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>[<imageInline src="foo.jpg"></imageInline>]foo bar</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="foo.jpg"></img></span>}foo bar</p>'
			);
		} );
	} );

	it( 'should prevent from browser redirecting when an image is dropped on another image', () => {
		const spy = sinon.spy();

		editor.editing.view.document.fire( 'dragover', {
			preventDefault: spy
		} );

		expect( spy.called ).to.equal( true );
	} );

	it( 'should upload image with base64 src', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>bar</p><img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = adapterMocks[ 0 ].loader.id;
		const expected =
			'<paragraph>bar</paragraph>' +
			'<paragraph>' +
				`<imageInline src="" uploadId="${ id }" uploadStatus="reading"></imageInline>[]foo` +
			'</paragraph>';

		expectModel( done, getModelData( model ), expected );
	} );

	it( 'should upload image with blob src', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		viewDocument.fire( 'clipboardInput', { dataTransfer } );

		const id = adapterMocks[ 0 ].loader.id;
		const expected =
			'<paragraph>' +
				`<imageInline src="" uploadId="${ id }" uploadStatus="reading"></imageInline>[]foo` +
			'</paragraph>';

		expectModel( done, getModelData( model ), expected );
	} );

	it( 'should not upload image if no loader available', done => {
		sinon.stub( fileRepository, 'createLoader' ).callsFake( () => null );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		viewDocument.fire( 'clipboardInput', { dataTransfer } );

		const expected = `<paragraph><imageInline src="${ base64Sample }"></imageInline>[]foo</paragraph>`;

		expectModel( done, getModelData( model ), expected );
	} );

	it( 'should not upload and remove image if fetch failed', done => {
		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		// Stub `fetch` so it can be rejected.
		sinon.stub( window, 'fetch' ).callsFake( () => {
			return new Promise( ( res, rej ) => rej( 'could not fetch' ) );
		} );

		let content = null;
		editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			content = data.content;
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer } );

		expectData(
			'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
			'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>[]foo</paragraph>',
			'<paragraph>[]foo</paragraph>',
			content,
			done,
			false
		);
	} );

	it( 'should upload only images which were successfully fetched and remove failed ones', done => {
		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		const expectedModel =
			'<paragraph>bar</paragraph>' +
			'<paragraph>' +
				'<imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>' +
				'<imageInline src="" uploadId="#loader2_id" uploadStatus="reading"></imageInline>' +
				'<imageInline src="" uploadId="#loader3_id" uploadStatus="reading"></imageInline>' +
				'[]foo' +
			'</paragraph>';
		const expectedFinalModel =
			'<paragraph>bar</paragraph>' +
			'<paragraph>' +
				'<imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>' +
				'<imageInline src="" uploadId="#loader2_id" uploadStatus="reading"></imageInline>' +
				'[]foo' +
			'</paragraph>';

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

		let content = null;
		editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			content = data.content;
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		expectData(
			'',
			expectedModel,
			expectedFinalModel,
			content,
			done
		);
	} );

	it( 'should not upload and remove image when `File` constructor is not present', done => {
		const fileFn = window.File;

		window.File = undefined;

		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } /><p>baz</p>`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		let content = null;
		editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			content = data.content;
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		expectData(
			'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img><p>baz</p>',
			'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline></paragraph>' +
			'<paragraph>baz[]foo</paragraph>',
			'<paragraph></paragraph>' +
			'<paragraph>baz[]foo</paragraph>',
			content,
			err => {
				window.File = fileFn;
				done( err );
			},
			false
		);
	} );

	it( 'should not upload and remove image when `File` constructor is not supported', done => {
		sinon.stub( window, 'File' ).throws( 'Function expected.' );

		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>baz</p><img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		let content = null;
		editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			content = data.content;
		} );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		expectData(
			'<p>baz</p><img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
			'<paragraph>baz</paragraph>' +
			'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>[]foo</paragraph>',
			'<paragraph>baz</paragraph><paragraph>[]foo</paragraph>',
			content,
			done,
			false
		);
	} );

	it( 'should get file extension from base64 string', done => {
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

		tryExpect( done, () => {
			loader.file.then( file => expect( file.name.split( '.' ).pop() ).to.equal( 'png' ) );
		} );
	} );

	it( 'should use fallback file extension', done => {
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

		tryExpect( done, () => {
			loader.file.then( file => expect( file.name.split( '.' ).pop() ).to.equal( 'jpeg' ) );
		} );
	} );

	it( 'should not show notification when file loader failed with no error', done => {
		const notification = editor.plugins.get( Notification );

		let notificationsCount = 0;
		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			notificationsCount++;
			evt.stop();
		}, { priority: 'high' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` in a way that it always fails.
		sinon.stub( window, 'fetch' ).callsFake( () => Promise.reject() );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		adapterMocks[ 0 ].loader.file.then( () => {
			expect.fail( 'Promise should be rejected.' );
		} ).catch( () => {
			// Deffer so the promise could be resolved.
			setTimeout( () => {
				expect( notificationsCount ).to.equal( 0 );
				done();
			} );
		} );
	} );

	describe( 'accessibility', () => {
		let announcerSpy;

		beforeEach( async () => {
			announcerSpy = sinon.spy( editor.ui.ariaLiveAnnouncer, 'announce' );
		} );

		it( 'should announce error in aria live', done => {
			const notification = editor.plugins.get( Notification );
			const file = createNativeFileMock();

			notification.on( 'show:warning', evt => {
				tryExpect( done, () => {
					expectAnnounce( 'Error during image upload' );
					evt.stop();
				} );
			}, { priority: 'high' } );

			setModelData( model, '<paragraph>{}foo bar</paragraph>' );
			editor.execute( 'uploadImage', { file } );

			loader.file.then( () => nativeReaderMock.mockError( 'Reading error.' ) );
		} );

		it( 'should announce uploading image in aria live', done => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>{}foo bar</paragraph>' );
			editor.execute( 'uploadImage', { file } );

			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expectAnnounce( 'Uploading image' );
				} );
			} );

			expect( loader.status ).to.equal( 'reading' );

			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		it( 'should allow modifying the image element once the original image is uploaded', async () => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>[]foo bar</paragraph>' );

			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			const uploadCompleteSpy = sinon.spy();

			imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

			editor.execute( 'uploadImage', { file } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
			} );

			sinon.assert.notCalled( uploadCompleteSpy );

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png' } ) );
			} );

			expectAnnounce( 'Image upload complete' );
		} );

		function expectAnnounce( message ) {
			expect( announcerSpy ).to.be.calledWithExactly( message );
		}
	} );

	describe( 'fallback image conversion on canvas', () => {
		// The following one simulates strict Content Security Policy (CSP) rules
		// that would make fetch() fail so that the the fallback procedure is triggered.
		beforeEach( () => {
			sinon.stub( window, 'fetch' ).callsFake( () => Promise.reject( new TypeError() ) );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/7957.
		it( 'should upload image using canvas conversion', done => {
			const spy = sinon.spy();
			const notification = editor.plugins.get( Notification );

			notification.on( 'show:warning', evt => {
				spy();
				evt.stop();
			}, { priority: 'high' } );

			setModelData( model, '<paragraph>[]foo</paragraph>' );

			const clipboardHtml = `<p>bar</p><img src=${ base64Sample } />`;
			const dataTransfer = mockDataTransfer( clipboardHtml );

			const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
			const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

			viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

			adapterMocks[ 0 ].loader.file.then( () => {
				setTimeout( () => {
					sinon.assert.notCalled( spy );
					done();
				} );
			} ).catch( () => {
				setTimeout( () => {
					expect.fail( 'Promise should be resolved.' );
				} );
			} );
		} );

		it( 'should not upload and remove image if canvas conversion failed', done => {
			setModelData( model, '<paragraph>[]foo</paragraph>' );

			const clipboardHtml = `<img src=${ base64Sample } />`;
			const dataTransfer = mockDataTransfer( clipboardHtml );

			// Stub `HTMLCanvasElement#toBlob` to return invalid blob, so image conversion always fails.
			sinon.stub( HTMLCanvasElement.prototype, 'toBlob' ).callsFake( fn => fn( null ) );

			let content = null;
			editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
				content = data.content;
			} );

			viewDocument.fire( 'clipboardInput', { dataTransfer } );

			expectData(
				'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
				'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>[]foo</paragraph>',
				'<paragraph>[]foo</paragraph>',
				content,
				done,
				false
			);
		} );

		it( 'should not show notification when image could not be loaded', done => {
			const spy = sinon.spy();
			const notification = editor.plugins.get( Notification );

			notification.on( 'show:warning', evt => {
				spy();
				evt.stop();
			}, { priority: 'high' } );

			setModelData( model, '<paragraph>[]foo</paragraph>' );

			const clipboardHtml = '<img src=data:image/png;base64,INVALID-DATA />';
			const dataTransfer = mockDataTransfer( clipboardHtml );

			const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
			const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

			viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

			adapterMocks[ 0 ].loader.file.then( () => {
				expect.fail( 'Promise should be rejected.' );
			} ).catch( () => {
				setTimeout( () => {
					sinon.assert.notCalled( spy );
					done();
				} );
			} );
		} );
	} );

	// Helper for validating clipboard and model data as a result of a paste operation. This function checks both clipboard
	// data and model data synchronously (`expectedClipboardData`, `expectedModel`) and then the model data after `loader.file`
	// promise is resolved (so model state after successful/failed file fetch attempt).
	//
	// @param {String} expectedClipboardData Expected clipboard data on `inputTransformation` event.
	// @param {String} expectedModel Expected model data on `inputTransformation` event.
	// @param {String} expectedModelOnFile Expected model data after all `file.loader` promises are fetched.
	// @param {DocumentFragment} content Content processed in inputTransformation
	// @param {Function} doneFn Callback function to be called when all assertions are done or error occurs.
	// @param {Boolean} [onSuccess=true] If `expectedModelOnFile` data should be validated
	// on `loader.file` a promise successful resolution or promise rejection.
	function expectData( expectedClipboardData, expectedModel, expectedModelOnFile, content, doneFn, onSuccess ) {
		const clipboardData = injectLoaderId( expectedClipboardData || '', adapterMocks );
		const modelData = injectLoaderId( expectedModel, adapterMocks );
		const finalModelData = injectLoaderId( expectedModelOnFile, adapterMocks );

		if ( clipboardData.length ) {
			expect( stringifyView( content ) ).to.equal( clipboardData );
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
// @returns {module:engine/view/datatransfer~DataTransfer} DataTransfer object.
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

function timeout( ms ) {
	return new Promise( res => setTimeout( res, ms ) );
}
