/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { ImageBlockEditing } from '../../src/image/imageblockediting.js';
import { ImageInlineEditing } from '../../src/image/imageinlineediting.js';
import { ImageUploadEditing } from '../../src/imageupload/imageuploadediting.js';
import { UploadImageCommand } from '../../src/imageupload/uploadimagecommand.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { ViewDataTransfer, _setModelData, _getModelData, _getViewData, _stringifyView, ModelWriter } from '@ckeditor/ckeditor5-engine';
import { EventInfo } from '@ckeditor/ckeditor5-utils';

import { FileRepository } from '@ckeditor/ckeditor5-upload';
import { UploadAdapterMock, createNativeFileMock, NativeFileReaderMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

import { Notification } from '@ckeditor/ckeditor5-ui';
import { downcastImageAttribute } from '../../src/image/converters.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'ImageUploadEditing', () => {
	// eslint-disable-next-line @stylistic/max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

	let adapterMocks = [];
	let editor, editorElement, model, view, doc, fileRepository, viewDocument, nativeReaderMock, loader;

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

		vi.spyOn( window, 'FileReader' ).mockImplementation( function() {
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
				vi.spyOn( view, 'scrollToTheSelection' ).mockImplementation( () => {} );
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		adapterMocks = [];

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageUploadEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageUploadEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should register proper schema rules when both ImageBlock and ImageInline are enabled', () => {
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadId' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadStatus' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadId' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadStatus' ) ).toBe( true );
	} );

	it( 'should register proper schema rules for image style when ImageBlock plugin is enabled', async () => {
		const newEditor = await VirtualTestEditor.create( { plugins: [ ImageBlockEditing, ImageUploadEditing ] } );
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadId' ) ).toBe( true );
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadStatus' ) ).toBe( true );
		await newEditor.destroy();
	} );

	it( 'should register proper schema rules for image style when ImageInline plugin is enabled', async () => {
		const newEditor = await VirtualTestEditor.create( { plugins: [ ImageInlineEditing, ImageUploadEditing ] } );
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadId' ) ).toBe( true );
		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadStatus' ) ).toBe( true );
		await newEditor.destroy();
	} );

	it( 'should wait for ImageInlineEditing and ImageBlockEditing before extending their model elements in schema', async () => {
		const editor = await VirtualTestEditor.create( {
			plugins: [
				// The order matters.
				ImageUploadEditing, ImageBlockEditing, ImageInlineEditing
			]
		} );

		expect( editor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadId' ) ).toBe( true );
		expect( editor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadStatus' ) ).toBe( true );
		expect( editor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadId' ) ).toBe( true );
		expect( editor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'uploadStatus' ) ).toBe( true );

		await editor.destroy();
	} );

	it( 'should register the uploadImage command', () => {
		expect( editor.commands.get( 'uploadImage' ) ).toBeInstanceOf( UploadImageCommand );
	} );

	it( 'should register the imageUpload command as an alias for the uploadImage command', () => {
		expect( editor.commands.get( 'imageUpload' ) ).toBe( editor.commands.get( 'uploadImage' ) );
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
				expect( editor.plugins.get( ClipboardPipeline ) ).toBeInstanceOf( ClipboardPipeline );
			} );
	} );

	it( 'should insert image when is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		_setModelData( model, '<paragraph>foo[]</paragraph>' );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, { dataTransfer, targetRanges: null } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( _getModelData( model ) ).toBe(
			`<paragraph>foo[<imageInline uploadId="${ id }" uploadStatus="reading"></imageInline>]</paragraph>`
		);
		expect( eventInfo.stop.called ).toBe( true );
	} );

	it( 'should insert image when is dropped', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ], getData: () => '' } );
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( _getModelData( model ) ).toBe(
			`<paragraph>foo</paragraph>[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]`
		);
		expect( eventInfo.stop.called ).toBe( true );
	} );

	it( 'should insert image at optimized position when is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ], getData: () => '' } );
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const paragraph = doc.getRoot().getChild( 0 );
		const targetRange = model.createRange( model.createPositionAt( paragraph, 1 ), model.createPositionAt( paragraph, 1 ) ); // f[]oo
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( _getModelData( model ) ).toBe(
			`<paragraph>f[<imageInline uploadId="${ id }" uploadStatus="reading"></imageInline>]oo</paragraph>`
		);
	} );

	it( 'should insert multiple image files when are pasted (inline image type)', () => {
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new ViewDataTransfer( { files, types: [ 'Files' ], getData: () => '' } );
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange(
			model.createPositionAt( doc.getRoot().getChild( 0 ), 3 ),
			model.createPositionAt( doc.getRoot().getChild( 0 ), 3 )
		);
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		const id1 = fileRepository.getLoader( files[ 0 ] ).id;
		const id2 = fileRepository.getLoader( files[ 1 ] ).id;

		expect( _getModelData( model ) ).toBe(
			'<paragraph>' +
				`foo<imageInline uploadId="${ id1 }" uploadStatus="reading"></imageInline>` +
				`[<imageInline uploadId="${ id2 }" uploadStatus="reading"></imageInline>]` +
			'</paragraph>'
		);
	} );

	it( 'should insert multiple image files when are pasted', () => {
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new ViewDataTransfer( { files, types: [ 'Files' ] } );
		_setModelData( model, '[]' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id1 = fileRepository.getLoader( files[ 0 ] ).id;
		const id2 = fileRepository.getLoader( files[ 1 ] ).id;

		expect( _getModelData( model ) ).toBe(
			'<paragraph></paragraph>' +
			`<imageBlock uploadId="${ id1 }" uploadStatus="reading"></imageBlock>` +
			`[<imageBlock uploadId="${ id2 }" uploadStatus="reading"></imageBlock>]`
		);
	} );

	it( 'should display notification when no permission to upload from computer.', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		const files = [ createNativeFileMock(), createNativeFileMock() ];
		const dataTransfer = new ViewDataTransfer( { files, types: [ 'Files' ] } );
		const uploadImageCommand = editor.commands.get( 'uploadImage' );
		const notification = editor.plugins.get( Notification );

		notification.on( 'show:warning', ( evt, data ) => {
			tryExpect( done, () => {
				expect( data.message ).toBe( 'You have no image upload permissions.' );
				evt.stop();
			} );
		}, { priority: 'high' } );

		uploadImageCommand.set( 'isAccessAllowed', false );

		_setModelData( model, '[]' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
	} ) );

	it( 'should insert image when is pasted on allowed position when UploadImageCommand is enabled', () => {
		_setModelData( model, '<paragraph>foo</paragraph>[<imageBlock></imageBlock>]' );

		const fileMock = createNativeFileMock();
		const dataTransfer = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );

		const command = editor.commands.get( 'uploadImage' );

		expect( command.isEnabled ).toBe( true );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 0 ), model.createPositionAt( doc.getRoot(), 0 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( _getModelData( model ) ).toBe(
			`[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]<paragraph>foo</paragraph><imageBlock></imageBlock>`
		);
	} );

	describe( 'in an inline root', () => {
		let inlineEditorElement, inlineEditor, inlineModel;

		beforeEach( async () => {
			inlineEditorElement = document.createElement( 'div' );
			document.body.appendChild( inlineEditorElement );

			// Note: no `image.insert.type` config, so it defaults to `'block'`. The upload must still produce an
			// inline image because a block image cannot land in an inline root.
			inlineEditor = await ClassicEditor.create( inlineEditorElement, {
				plugins: [
					ImageBlockEditing, ImageInlineEditing, ImageUploadEditing,
					Paragraph, UndoEditing, UploadAdapterPluginMock, ClipboardPipeline
				],
				root: { modelElement: '$inlineRoot' }
			} );

			inlineModel = inlineEditor.model;

			vi.spyOn( inlineEditor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );
		} );

		afterEach( async () => {
			await inlineEditor.destroy();
			inlineEditorElement.remove();
		} );

		it( 'should enable the uploadImage command', () => {
			expect( inlineEditor.commands.get( 'uploadImage' ).isEnabled ).toBe( true );
		} );

		it( 'should upload as an inline image because a block image cannot land', () => {
			const fileMock = createNativeFileMock();

			_setModelData( inlineModel, 'foo[]bar' );

			inlineEditor.commands.get( 'uploadImage' ).execute( { file: fileMock } );

			const id = inlineEditor.plugins.get( FileRepository ).getLoader( fileMock ).id;

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				`foo<imageInline uploadId="${ id }" uploadStatus="reading"></imageInline>bar`
			);
		} );
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
				const dataTransfer = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
				_setModelData( editor.model, '<paragraph>[]foo</paragraph>' );

				const targetRange = editor.model.document.selection.getFirstRange();
				const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

				editor.enableReadOnlyMode( 'unit-test' );

				editor.editing.view.document.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

				expect( _getModelData( editor.model ) ).toBe( '<paragraph>[]foo</paragraph>' );

				return editor.destroy();
			} );
	} );

	it( 'should not insert image when file is not an image', () => {
		const viewDocument = editor.editing.view.document;
		const fileMock = {
			type: 'media/mp3',
			size: 1024
		};
		const dataTransfer = new ViewDataTransfer( {
			files: [ fileMock ],
			types: [ 'Files' ],
			getData: () => ''
		} );

		_setModelData( model, '<paragraph>foo[]</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph>' );
		expect( eventInfo.stop.called ).toBeUndefined();
	} );

	it( 'should not insert image when file is not an configured image type', () => {
		const viewDocument = editor.editing.view.document;
		const fileMock = {
			type: 'image/svg+xml',
			size: 1024
		};
		const dataTransfer = new ViewDataTransfer( {
			files: [ fileMock ],
			types: [ 'Files' ],
			getData: () => ''
		} );

		_setModelData( model, '<paragraph>foo[]</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		viewDocument.fire( eventInfo, {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph>' );
		expect( eventInfo.stop.called ).toBeUndefined();
	} );

	it( 'should not insert image when file is null', () => {
		const viewDocument = editor.editing.view.document;
		const dataTransfer = new ViewDataTransfer( { files: [ null ], types: [ 'Files' ], getData: () => '' } );

		_setModelData( model, '<paragraph>foo[]</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph>' );
	} );

	it( 'should not insert image when there is non-empty HTML content pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new ViewDataTransfer( {
			files: [ fileMock ],
			types: [ 'Files', 'text/html' ],
			getData: type => type === 'text/html' ? '<p>SomeData</p>' : ''
		} );
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		expect( _getModelData( model ) ).toBe( '<paragraph>SomeData[]foo</paragraph>' );
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

		_setModelData( model, '<other>[]</other>' );

		const fileMock = createNativeFileMock();
		const dataTransfer = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );

		expect( _getModelData( model ) ).toBe( '<other>[]</other>' );
	} );

	it( 'should not throw when upload adapter is not set (FileRepository will log an warn anyway) when image is pasted', () => {
		const fileMock = createNativeFileMock();
		const dataTransfer = new ViewDataTransfer( { files: [ fileMock ], types: [ 'Files' ] } );
		const consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		fileRepository.createUploadAdapter = undefined;

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		expect( () => {
			viewDocument.fire( 'clipboardInput', { dataTransfer, targetRanges: [ targetViewRange ] } );
		} ).not.toThrow();

		expect( _getModelData( model ) ).toBe( '<paragraph>foo[]</paragraph>' );
		expect( consoleWarnStub ).toHaveBeenCalledTimes( 1 );
	} );

	// https://github.com/ckeditor/ckeditor5-upload/issues/70
	it( 'should not crash on browsers which do not implement DOMStringList as a child class of an Array', () => {
		const typesDomStringListMock = {
			length: 2,
			'0': 'text/html',
			'1': 'text/plain'
		};
		const dataTransfer = new ViewDataTransfer( {
			types: typesDomStringListMock,
			getData: type => type === 'text/html' ? '<p>SomeData</p>' : 'SomeData'
		} );
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const targetRange = doc.selection.getFirstRange();
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		// Well, there's no clipboard plugin, so nothing happens.
		expect( _getModelData( model ) ).toBe( '<paragraph>SomeData[]foo</paragraph>' );
	} );

	it( 'should not convert image\'s uploadId attribute if is consumed already', () => {
		editor.editing.downcastDispatcher.on( 'attribute:uploadId:imageBlock', ( evt, data, conversionApi ) => {
			conversionApi.consumable.consume( data.item, evt.name );
		}, { priority: 'high' } );

		_setModelData( model, '<imageBlock uploadId="1234"></imageBlock>' );

		expect( _getViewData( view ) ).toBe(
			'[<figure class="ck-widget image" contenteditable="false">' +
			'<img></img>' +
			'</figure>]' );
	} );

	it( 'should not use read data once it is present', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		const file = createNativeFileMock();
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		model.document.once( 'change', () => {
			tryExpect( done, () => {
				expect( _getViewData( view ) ).toBe(
					'<p>[<span class="ck-widget image-inline" contenteditable="false">' +
						// Rendering the image data is left to a upload progress converter.
						'<img></img>' +
					'</span>}foo bar</p>'
				);

				expect( loader.status ).toBe( 'uploading' );
			} );
		} );

		expect( loader.status ).toBe( 'reading' );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} ) );

	it( 'should replace read data with server response once it is present', async () => {
		const file = createNativeFileMock();
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'assets/sample.png' } ) );
		} );

		expect( _getViewData( view ) ).toBe(
			'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="assets/sample.png"></img></span>}foo bar</p>'
		);
		expect( loader.status ).toBe( 'idle' );
	} );

	it( 'should set image width and height after server response', async () => {
		const file = createNativeFileMock();
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: '/sample.png' } ) );
		} );

		await timeout( 100 );

		expect( _getModelData( model ) ).toBe(
			'<paragraph>[<imageInline height="96" src="/sample.png" width="96"></imageInline>]foo bar</paragraph>'
		);
	} );

	it( 'should not modify image width if width was set before server response', async () => {
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img width="50" src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: '/sample.png', 800: '/sample2.png' } ) );
		} );

		await timeout( 100 );

		expect( _getModelData( model ) ).toBe(
			'[<imageBlock src="/sample.png" srcset="/sample2.png 800w" width="50"></imageBlock>]<paragraph>foo</paragraph>'
		);
	} );

	it( 'should not modify image width if height was set before server response', async () => {
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img height="50" src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: '/sample.png', 800: '/sample2.png' } ) );
		} );

		await timeout( 100 );

		expect( _getModelData( model ) ).toBe(
			'[<imageBlock height="50" src="/sample.png" srcset="/sample2.png 800w"></imageBlock>]<paragraph>foo</paragraph>'
		);
	} );

	it( 'should support adapter response with the normalized `urls` property', async () => {
		const file = createNativeFileMock();
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		await new Promise( res => {
			model.document.once( 'change', res );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { urls: { default: 'assets/sample.png' } } ) );
		} );

		expect( _getViewData( view ) ).toBe(
			'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="assets/sample.png"></img></span>}foo bar</p>'
		);
		expect( loader.status ).toBe( 'idle' );
	} );

	it( 'should fire notification event in case of error', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();

		notification.on( 'show:warning', ( evt, data ) => {
			tryExpect( done, () => {
				expect( data.message ).toBe( 'Reading error.' );
				expect( data.title ).toBe( 'Upload failed' );
				evt.stop();
			} );
		}, { priority: 'high' } );

		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		loader.file.then( () => nativeReaderMock.mockError( 'Reading error.' ) );
	} ) );

	it( 'should not fire notification on abort', () => new Promise( resolve => {
		const notification = editor.plugins.get( Notification );
		const file = createNativeFileMock();
		const spy = vi.fn();

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		loader.file.then( () => {
			nativeReaderMock.abort();

			setTimeout( () => {
				expect( spy ).not.toHaveBeenCalled();
				resolve();
			}, 0 );
		} );
	} ) );

	it( 'should throw when other error happens during upload', () => new Promise( resolve => {
		const file = createNativeFileMock();
		const error = new Error( 'Foo bar baz' );
		const uploadEditing = editor.plugins.get( ImageUploadEditing );
		const loadSpy = vi.spyOn( uploadEditing, '_readAndUpload' );
		const catchSpy = vi.fn();

		// Throw an error when async attribute change occur.
		editor.editing.downcastDispatcher.on( 'attribute:uploadStatus:imageInline', ( evt, data ) => {
			if ( data.attributeNewValue == 'uploading' ) {
				throw error;
			}
		} );

		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		expect( loadSpy ).toHaveBeenCalledTimes( 1 );

		const promise = loadSpy.mock.results[ 0 ].value;

		// Check if error can be caught.
		promise.catch( catchSpy );

		loader.file.then( () => {
			nativeReaderMock.mockSuccess();

			setTimeout( () => {
				expect( catchSpy ).toHaveBeenCalledTimes( 1 );
				const error = catchSpy.mock.calls[ 0 ][ 0 ];

				assertCKEditorError( error, 'Foo bar baz' );

				resolve();
			}, 0 );
		} );
	} ) );

	it( 'should do nothing if image does not have uploadId', () => {
		_setModelData( model, '<imageBlock src="assets/sample.png"></imageBlock>' );

		expect( _getViewData( view ) ).toBe(
			'[<figure class="ck-widget image" contenteditable="false"><img src="assets/sample.png"></img></figure>]'
		);
	} );

	it( 'should remove image in case of upload error', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		const file = createNativeFileMock();
		const spy = vi.fn();
		const notification = editor.plugins.get( Notification );
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );

		notification.on( 'show:warning', evt => {
			spy();
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'uploadImage', { file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expect( _getModelData( model ) ).toBe( '<paragraph>[]foo bar</paragraph>' );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );

		loader.file.then( () => nativeReaderMock.mockError( 'Upload error.' ) );
	} ) );

	it( 'should abort upload if image is removed', () => {
		const file = createNativeFileMock();
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		const abortSpy = vi.spyOn( loader, 'abort' );

		expect( loader.status ).toBe( 'reading' );

		return loader.file.then( () => {
			nativeReaderMock.mockSuccess( base64Sample );

			const image = doc.getRoot().getChild( 0 );
			model.change( writer => {
				writer.remove( image );
			} );

			expect( loader.status ).toBe( 'aborted' );
			expect( abortSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	it( 'should not abort and not restart upload when image is moved', () => {
		const file = createNativeFileMock();
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		const abortSpy = vi.spyOn( loader, 'abort' );
		const loadSpy = vi.spyOn( loader, 'read' );

		const paragraph = doc.getRoot().getChild( 0 );
		const image = paragraph.getChild( 0 );

		model.change( writer => {
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( paragraph, 2 ) );
		} );

		expect( abortSpy ).not.toHaveBeenCalled();
		expect( loadSpy ).not.toHaveBeenCalled();
	} );

	it( 'should not abort if an image changed type (but with the same uploadId value)', async () => {
		const file = createNativeFileMock();

		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
		const abortSpy = vi.spyOn( loader, 'abort' );
		const id = fileRepository.getLoader( file ).id;
		const uploadCompleteSpy = vi.fn();

		imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		expect( _getModelData( model ) ).toBe(
			`<paragraph>[<imageInline uploadId="${ id }" uploadStatus="uploading"></imageInline>]foo bar</paragraph>`
		);

		editor.execute( 'imageTypeBlock' );

		expect( _getModelData( model ) ).toBe(
			`[<imageBlock uploadId="${ id }" uploadStatus="uploading"></imageBlock>]<paragraph>foo bar</paragraph>`
		);

		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'assets/sample.png' } ) );
		} );

		expect( _getModelData( model ) ).toBe(
			'[<imageBlock src="assets/sample.png"></imageBlock>]<paragraph>foo bar</paragraph>'
		);

		expect( abortSpy ).not.toHaveBeenCalled();
		expect( uploadCompleteSpy ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should not abort the loader when only one of two images sharing the same uploadId is moved to graveyard', async () => {
		// This test covers the false-branch of `allImagesThatShareUploaderInGraveyard`:
		// after `imageTypeBlock` the original inline element goes to graveyard but the new block element
		// is still in the document, so `allImagesThatShareUploaderInGraveyard` is false and the loader
		// must NOT be aborted.
		const file = createNativeFileMock();

		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		const abortSpy = vi.spyOn( loader, 'abort' );

		// Let the read phase complete so the image transitions to "uploading" status.
		await new Promise( res => {
			model.document.once( 'change', res, { priority: 'lowest' } );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} );

		// Swap inline → block: the inline element lands in graveyard, a new block element is inserted.
		// Both share the same uploadId and are tracked in _uploadImageElements.
		editor.execute( 'imageTypeBlock' );

		// The document-change listener fires; it sees the inline element in graveyard but the block
		// element is still active, so `allImagesThatShareUploaderInGraveyard` is false.
		expect( abortSpy ).not.toHaveBeenCalled();
	} );

	it( 'should abort if an image changed type and then was removed', async () => {
		const file = createNativeFileMock();

		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
		const abortSpy = vi.spyOn( loader, 'abort' );
		const id = fileRepository.getLoader( file ).id;
		const uploadCompleteSpy = vi.fn();

		imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

		await loader.file;

		nativeReaderMock.mockSuccess( base64Sample );

		editor.execute( 'imageTypeBlock' );

		expect( _getModelData( model ) ).toBe(
			`[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]<paragraph>foo bar</paragraph>`
		);

		expect( abortSpy ).not.toHaveBeenCalled();

		model.change( writer => {
			writer.remove( model.document.selection.getSelectedElement() );
		} );

		expect( abortSpy ).toHaveBeenCalledTimes( 1 );
		expect( uploadCompleteSpy ).not.toHaveBeenCalled();

		expect( _getModelData( model ) ).toBe( '<paragraph>[]foo bar</paragraph>' );
	} );

	it( 'image should be permanently removed if it is removed by user during upload', () => new Promise( resolve => {
		const file = createNativeFileMock();
		const notification = editor.plugins.get( Notification );
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		editor.execute( 'uploadImage', { file } );

		let stubCallCount = 0;
		const stub = vi.fn( () => {
			stubCallCount++;
			if ( stubCallCount === 2 ) {
				expect( _getModelData( model ) ).toBe( '<paragraph>[]foo bar</paragraph>' );

				editor.execute( 'undo' );

				// Expect that the image has not been brought back.
				expect( _getModelData( model ) ).toBe( '<paragraph>[]foo bar</paragraph>' );

				resolve();
			}
		} );
		model.document.on( 'change', stub );

		const image = doc.getRoot().getChild( 0 ).getChild( 0 );

		model.change( writer => {
			writer.remove( image );
		} );
	} ) );

	it( 'should create responsive image if the server returns multiple images', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		const file = createNativeFileMock();
		_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
		editor.execute( 'uploadImage', { file } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expect( _getViewData( view ) ).toBe(
						'<p>[<span class="ck-widget image-inline" contenteditable="false">' +
							'<img sizes="100vw" src="assets/sample.png" ' +
							'srcset="assets/sample2.png 500w, assets/sample3.png 800w" width="800"></img>' +
						'</span>}foo bar</p>'
					);
					expect( loader.status ).toBe( 'idle' );
				} );
			}, { priority: 'lowest' } );

			loader.file.then( () =>
				adapterMocks[ 0 ].mockSuccess( {
					default: 'assets/sample.png',
					500: 'assets/sample2.png',
					800: 'assets/sample3.png'
				} )
			);
		} );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} ) );

	describe( 'uploadComplete event', () => {
		it( 'should be fired when the upload adapter resolves with the image data', async () => {
			const file = createNativeFileMock();
			_setModelData( model, '<paragraph>[]foo bar</paragraph>' );

			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			const uploadCompleteSpy = vi.fn();

			imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

			editor.execute( 'uploadImage', { file } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
			} );

			expect( uploadCompleteSpy ).not.toHaveBeenCalled();

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'assets/sample.png' } ) );
			} );

			expect( uploadCompleteSpy ).toHaveBeenCalledTimes( 1 );

			const eventArgs = uploadCompleteSpy.mock.calls[ 0 ][ 1 ];

			expect( typeof eventArgs ).toBe( 'object' );
			expect( eventArgs.imageElement.is( 'model:element', 'imageInline' ) ).toBe( true );
			expect( eventArgs.data ).toEqual( { default: 'assets/sample.png' } );
		} );

		it( 'should allow modifying the image element once the original image is uploaded', async () => {
			const file = createNativeFileMock();
			_setModelData( model, '<paragraph>[]foo bar</paragraph>' );

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
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { originalUrl: 'original.jpg', default: 'assets/sample.png' } ) );
			} );

			// Make sure the custom attribute was set in the same non-undoable batch as the default handling (setting src and status).
			expect( batch.isUndoable ).toBe( false );
			expect( batch.operations.length ).toBe( 3 );

			expect( batch.operations[ 0 ].type ).toBe( 'changeAttribute' );
			expect( batch.operations[ 0 ].key ).toBe( 'uploadStatus' );
			expect( batch.operations[ 0 ].newValue ).toBe( 'complete' );

			expect( batch.operations[ 1 ].type ).toBe( 'addAttribute' );
			expect( batch.operations[ 1 ].key ).toBe( 'data-original' );
			expect( batch.operations[ 1 ].newValue ).toBe( 'original.jpg' );

			expect( batch.operations[ 2 ].type ).toBe( 'addAttribute' );
			expect( batch.operations[ 2 ].key ).toBe( 'src' );
			expect( batch.operations[ 2 ].newValue ).toBe( 'assets/sample.png' );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>[<imageInline data-original="original.jpg" src="assets/sample.png"></imageInline>]foo bar</paragraph>'
			);

			expect( _getViewData( view ) ).toBe(
				'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="assets/sample.png"></img></span>}foo bar</p>'
			);
		} );

		it( 'should allow stopping the original listener that sets image attributes based on the data', async () => {
			const file = createNativeFileMock();
			_setModelData( model, '<paragraph>[]foo bar</paragraph>' );

			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			let batch;

			imageUploadEditing.on( 'uploadComplete', ( evt, { imageElement } ) => {
				evt.stop();

				model.change( writer => {
					writer.setAttribute( 'src', 'assets/sample.png', imageElement );
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
					{ default: 'assets/sample.png', 500: 'assets/sample2.png', 800: 'assets/sample3.png' }
				) );
			} );

			// Make sure the custom attribute was set in the non-undoable batch as the default handling (setting src and status).
			expect( batch.isUndoable ).toBe( false );
			expect( batch.operations.length ).toBe( 2 );

			expect( batch.operations[ 0 ].type ).toBe( 'changeAttribute' );
			expect( batch.operations[ 0 ].key ).toBe( 'uploadStatus' );
			expect( batch.operations[ 0 ].newValue ).toBe( 'complete' );

			expect( batch.operations[ 1 ].type ).toBe( 'addAttribute' );
			expect( batch.operations[ 1 ].key ).toBe( 'src' );
			expect( batch.operations[ 1 ].newValue ).toBe( 'assets/sample.png' );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>[<imageInline src="assets/sample.png"></imageInline>]foo bar</paragraph>'
			);

			expect( _getViewData( view ) ).toBe(
				'<p>[<span class="ck-widget image-inline" contenteditable="false"><img src="assets/sample.png"></img></span>}foo bar</p>'
			);
		} );
	} );

	it( 'should prevent from browser redirecting when an image is dropped on another image', () => {
		const spy = vi.fn();
		const dataTransfer = mockDataTransfer( '' );

		editor.editing.view.document.fire( 'dragover', {
			dataTransfer,
			content: dataTransfer.getData( 'text/html' ),
			preventDefault: spy
		} );

		expect( spy ).toHaveBeenCalled();
	} );

	it( 'should upload image with base64 src', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>bar</p><img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		const id = adapterMocks[ 0 ].loader.id;
		const expected =
			'<paragraph>bar</paragraph>' +
			'<paragraph>' +
				`<imageInline src="" uploadId="${ id }" uploadStatus="reading"></imageInline>[]foo` +
			'</paragraph>';

		expectModel( done, _getModelData( model ), expected );
	} ) );

	it( 'should upload image with blob src', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			content: dataTransfer.getData( 'text/html' )
		} );

		const id = adapterMocks[ 0 ].loader.id;
		const expected =
			'<paragraph>' +
				`<imageInline src="" uploadId="${ id }" uploadStatus="reading"></imageInline>[]foo` +
			'</paragraph>';

		expectModel( done, _getModelData( model ), expected );
	} ) );

	it( 'should not upload image if no loader available', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		vi.spyOn( fileRepository, 'createLoader' ).mockImplementation( () => null );

		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			content: dataTransfer.getData( 'text/html' )
		} );

		const expected = `<paragraph><imageInline src="${ base64Sample }"></imageInline>[]foo</paragraph>`;

		expectModel( done, _getModelData( model ), expected );
	} ) );

	it( 'should not upload and remove image if fetch failed', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		// Stub `fetch` so it can be rejected.
		vi.spyOn( window, 'fetch' ).mockImplementation( () => {
			return new Promise( ( res, rej ) => rej( 'could not fetch' ) );
		} );

		let content = null;
		editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			content = data.content;
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			content: dataTransfer.getData( 'text/html' )
		} );

		expectData(
			'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
			'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>[]foo</paragraph>',
			'<paragraph>[]foo</paragraph>',
			content,
			done,
			false
		);
	} ) );

	it( 'should upload only images which were successfully fetched and remove failed ones', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
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

		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>bar</p><img src=${ base64Sample } />` +
			`<img src=${ base64ToBlobUrl( base64Sample ) } /><img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` in a way that 2 first calls are successful and 3rd fails.
		let counter = 0;
		const fetch = window.fetch;
		vi.spyOn( window, 'fetch' ).mockImplementation( src => {
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

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		expectData(
			'',
			expectedModel,
			expectedFinalModel,
			content,
			done
		);
	} ) );

	it( 'should not upload and remove image when `File` constructor is not present', () => new Promise( ( resolve, reject ) => {
		const fileFn = window.File;

		window.File = undefined;

		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } /><p>baz</p>`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		let content = null;
		editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			content = data.content;
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		expectData(
			'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img><p>baz</p>',
			'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline></paragraph>' +
			'<paragraph>baz[]foo</paragraph>',
			'<paragraph></paragraph>' +
			'<paragraph>baz[]foo</paragraph>',
			content,
			err => {
				window.File = fileFn;
				err ? reject( err ) : resolve();
			},
			false
		);
	} ) );

	it( 'should not upload and remove image when `File` constructor is not supported', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		vi.spyOn( window, 'File' ).mockImplementation( () => {
			throw new Error( 'Function expected.' );
		} );

		const notification = editor.plugins.get( Notification );

		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			evt.stop();
		}, { priority: 'high' } );

		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<p>baz</p><img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		let content = null;
		editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			content = data.content;
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		expectData(
			'<p>baz</p><img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
			'<paragraph>baz</paragraph>' +
			'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>[]foo</paragraph>',
			'<paragraph>baz</paragraph><paragraph>[]foo</paragraph>',
			content,
			done,
			false
		);
	} ) );

	it( 'should get file extension from base64 string', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` to return custom blob without type.
		vi.spyOn( window, 'fetch' ).mockImplementation( () => {
			return new Promise( res => res( {
				blob() {
					return new Promise( res => res( new Blob( [ 'foo', 'bar' ] ) ) );
				}
			} ) );
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		tryExpect( done, () => {
			loader.file.then( file => expect( file.name.split( '.' ).pop() ).toBe( 'png' ) );
		} );
	} ) );

	it( 'should use fallback file extension', () => new Promise( ( resolve, reject ) => {
		const done = err => err ? reject( err ) : resolve();
		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64ToBlobUrl( base64Sample ) } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` to return custom blob without type.
		vi.spyOn( window, 'fetch' ).mockImplementation( () => {
			return new Promise( res => res( {
				blob() {
					return new Promise( res => res( new Blob( [ 'foo', 'bar' ] ) ) );
				}
			} ) );
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		tryExpect( done, () => {
			loader.file.then( file => expect( file.name.split( '.' ).pop() ).toBe( 'jpeg' ) );
		} );
	} ) );

	it( 'should not show notification when file loader failed with no error', () => new Promise( resolve => {
		const notification = editor.plugins.get( Notification );

		let notificationsCount = 0;
		// Prevent popping up alert window.
		notification.on( 'show:warning', evt => {
			notificationsCount++;
			evt.stop();
		}, { priority: 'high' } );

		_setModelData( model, '<paragraph>[]foo</paragraph>' );

		const clipboardHtml = `<img src=${ base64Sample } />`;
		const dataTransfer = mockDataTransfer( clipboardHtml );

		const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
		const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

		// Stub `fetch` in a way that it always fails.
		vi.spyOn( window, 'fetch' ).mockImplementation( () => Promise.reject() );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer,
			targetRanges: [ targetViewRange ],
			content: dataTransfer.getData( 'text/html' )
		} );

		adapterMocks[ 0 ].loader.file.then( () => {
			expect.fail( 'Promise should be rejected.' );
		} ).catch( () => {
			// Deffer so the promise could be resolved.
			setTimeout( () => {
				expect( notificationsCount ).toBe( 0 );
				resolve();
			} );
		} );
	} ) );

	describe( 'accessibility', () => {
		let announcerSpy;

		beforeEach( async () => {
			announcerSpy = vi.spyOn( editor.ui.ariaLiveAnnouncer, 'announce' );
		} );

		it( 'should announce error in aria live', () => new Promise( ( resolve, reject ) => {
			const done = err => err ? reject( err ) : resolve();
			const notification = editor.plugins.get( Notification );
			const file = createNativeFileMock();

			notification.on( 'show:warning', evt => {
				tryExpect( done, () => {
					expectAnnounce( 'Error during image upload' );
					evt.stop();
				} );
			}, { priority: 'high' } );

			_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
			editor.execute( 'uploadImage', { file } );

			loader.file.then( () => nativeReaderMock.mockError( 'Reading error.' ) );
		} ) );

		it( 'should announce uploading image in aria live', () => new Promise( ( resolve, reject ) => {
			const done = err => err ? reject( err ) : resolve();
			const file = createNativeFileMock();
			_setModelData( model, '<paragraph>{}foo bar</paragraph>' );
			editor.execute( 'uploadImage', { file } );

			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expectAnnounce( 'Uploading image' );
				} );
			} );

			expect( loader.status ).toBe( 'reading' );

			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
		} ) );

		it( 'should allow modifying the image element once the original image is uploaded', async () => {
			const file = createNativeFileMock();
			_setModelData( model, '<paragraph>[]foo bar</paragraph>' );

			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			const uploadCompleteSpy = vi.fn();

			imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

			editor.execute( 'uploadImage', { file } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
			} );

			expect( uploadCompleteSpy ).not.toHaveBeenCalled();

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'assets/sample.png' } ) );
			} );

			expectAnnounce( 'Image upload complete' );
		} );

		function expectAnnounce( message ) {
			expect( announcerSpy ).toHaveBeenCalledWith( message );
		}
	} );

	describe( 'fallback image conversion on canvas', () => {
		// The following one simulates strict Content Security Policy (CSP) rules
		// that would make fetch() fail so that the the fallback procedure is triggered.
		beforeEach( () => {
			vi.spyOn( window, 'fetch' ).mockImplementation( () => Promise.reject( new TypeError() ) );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/7957.
		it( 'should upload image using canvas conversion', () => new Promise( resolve => {
			const spy = vi.fn();
			const notification = editor.plugins.get( Notification );

			notification.on( 'show:warning', evt => {
				spy();
				evt.stop();
			}, { priority: 'high' } );

			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			const clipboardHtml = `<p>bar</p><img src=${ base64Sample } />`;
			const dataTransfer = mockDataTransfer( clipboardHtml );

			const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
			const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				targetRanges: [ targetViewRange ],
				content: dataTransfer.getData( 'text/html' )
			} );

			adapterMocks[ 0 ].loader.file.then( () => {
				setTimeout( () => {
					expect( spy ).not.toHaveBeenCalled();
					resolve();
				} );
			} ).catch( () => {
				setTimeout( () => {
					expect.fail( 'Promise should be resolved.' );
				} );
			} );
		} ) );

		it( 'should not upload and remove image if canvas conversion failed', () => new Promise( ( resolve, reject ) => {
			const done = err => err ? reject( err ) : resolve();
			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			const clipboardHtml = `<img src=${ base64Sample } />`;
			const dataTransfer = mockDataTransfer( clipboardHtml );

			// Stub `HTMLCanvasElement#toBlob` to return invalid blob, so image conversion always fails.
			vi.spyOn( HTMLCanvasElement.prototype, 'toBlob' ).mockImplementation( fn => fn( null ) );

			let content = null;
			editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
				content = data.content;
			} );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expectData(
				'<img src="" uploadId="#loader1_id" uploadProcessed="true"></img>',
				'<paragraph><imageInline src="" uploadId="#loader1_id" uploadStatus="reading"></imageInline>[]foo</paragraph>',
				'<paragraph>[]foo</paragraph>',
				content,
				done,
				false
			);
		} ) );

		it( 'should not show notification when image could not be loaded', () => new Promise( resolve => {
			const spy = vi.fn();
			const notification = editor.plugins.get( Notification );

			notification.on( 'show:warning', evt => {
				spy();
				evt.stop();
			}, { priority: 'high' } );

			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			const clipboardHtml = '<img src=data:image/png;base64,INVALID-DATA />';
			const dataTransfer = mockDataTransfer( clipboardHtml );

			const targetRange = model.createRange( model.createPositionAt( doc.getRoot(), 1 ), model.createPositionAt( doc.getRoot(), 1 ) );
			const targetViewRange = editor.editing.mapper.toViewRange( targetRange );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				targetRanges: [ targetViewRange ],
				content: dataTransfer.getData( 'text/html' )
			} );

			adapterMocks[ 0 ].loader.file.then( () => {
				expect.fail( 'Promise should be rejected.' );
			} ).catch( () => {
				setTimeout( () => {
					expect( spy ).not.toHaveBeenCalled();
					resolve();
				} );
			} );
		} ) );

		it( 'should not remove image when it is already in graveyard', () => new Promise( ( resolve, reject ) => {
			const done = err => err ? reject( err ) : resolve();
			const notification = editor.plugins.get( Notification );
			const file = createNativeFileMock();

			notification.on( 'show:warning', evt => {
				evt.stop();
			}, { priority: 'high' } );

			_setModelData( model, '<paragraph>[]foo bar</paragraph>' );
			editor.execute( 'uploadImage', { file } );

			const image = doc.getRoot().getChild( 0 ).getChild( 0 );

			editor.execute( 'undo' );

			const removeMock = vi.spyOn( ModelWriter.prototype, 'remove' );

			model.document.once( 'change', () => {
				tryExpect( done, () => {
					expect( image.root.rootName ).toBe( '$graveyard' );
					expect( removeMock ).not.toHaveBeenCalled();
				} );
			} );

			loader.file.then( () => {
				nativeReaderMock.onerror = () => {};
				nativeReaderMock.mockError( 'Upload error.' );
			} );
		} ) );
	} );

	describe( 'data downcast conversion of images with uploading state', () => {
		it( 'should dump the `data-ck-upload-id` into the data', async () => {
			const onDispatch = vi.fn( ( evt, data, conversionApi ) => {
				const wasConsumed = conversionApi.consumable.test( data.item, 'attribute:uploadId:imageInline' );

				expect( wasConsumed ).toBe( true );
			} );

			editor.conversion.for( 'downcast' ).add( dispatcher =>
				dispatcher.on( 'attribute:uploadId:imageInline', onDispatch, { priority: 'high' } )
			);

			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			const file = createNativeFileMock();
			editor.execute( 'uploadImage', { file } );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );

			await timeout( 50 );

			const uploadId = adapterMocks[ 0 ].loader.id;

			expect( _getModelData( editor.model ) ).toBe(
				`<paragraph>[<imageInline uploadId="${ uploadId }" uploadStatus="uploading"></imageInline>]foo</paragraph>`
			);

			expect( onDispatch ).toHaveBeenCalledTimes( 1 );
			expect( editor.getData() ).toBe(
				`<p><img data-ck-upload-id="${ uploadId }">foo</p>`
			);
		} );

		it( 'should not crash if uploadId of down casted image is not found in loaders repository', async () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			const file = createNativeFileMock();
			editor.execute( 'uploadImage', { file } );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );

			await timeout( 50 );

			const uploadId = adapterMocks[ 0 ].loader.id;

			vi.spyOn( fileRepository.loaders, 'get' ).mockImplementation( id => id === uploadId ? null : undefined );

			expect( _getModelData( editor.model ) ).toBe(
				`<paragraph>[<imageInline uploadId="${ uploadId }" uploadStatus="uploading"></imageInline>]foo</paragraph>`
			);

			expect( editor.getData() ).toBe( '<p><img>foo</p>' );
		} );

		it( 'should not downcast consumed uploadId image attribute', async () => {
			editor.conversion.for( 'downcast' ).add( dispatcher =>
				dispatcher.on( 'attribute:uploadId:imageInline', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:uploadId:imageInline' );
				}, { priority: 'high' } )
			);

			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			const file = createNativeFileMock();
			editor.execute( 'uploadImage', { file } );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );

			await timeout( 50 );

			const uploadId = adapterMocks[ 0 ].loader.id;

			expect( _getModelData( editor.model ) ).toBe(
				`<paragraph>[<imageInline uploadId="${ uploadId }" uploadStatus="uploading"></imageInline>]foo</paragraph>`
			);

			expect( editor.getData() ).toBe( '<p><img>foo</p>' );
		} );

		it( 'should restore image from `_uploadedImages` if it was pasted from clipboard', async () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			const file = createNativeFileMock();
			editor.execute( 'uploadImage', { file } );
			loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );

			await timeout( 50 );

			// Let's copy image in uploading state.
			const uploadId = adapterMocks[ 0 ].loader.id;
			expect( _getModelData( editor.model ) ).toBe(
				`<paragraph>[<imageInline uploadId="${ uploadId }" uploadStatus="uploading"></imageInline>]foo</paragraph>`
			);

			// Lets check if content of clipboard is correct.
			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			viewDocument.fire( 'copy', data );
			expect( data.dataTransfer.getData( 'text/html' ) ).toBe( `<img data-ck-upload-id="${ uploadId }">` );

			// Let's resolve uploading status and ensure that image is loaded.
			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: '/sample.png', 800: 'assets/sample2.png' } ) );
			} );

			expect( editor.getData() ).toBe(
				'<p><img src="/sample.png" srcset="assets/sample2.png 800w" sizes="100vw" width="800">foo</p>'
			);

			// Make sure it's no longer present in registry, so image upload is completed.
			expect( fileRepository.loaders.get( uploadId ) ).toBeNull();

			// Let's paste the image from clipboard, it has upload id, which should be stored in plugin cache.
			_setModelData( model, '<paragraph>hello[]</paragraph>' );

			viewDocument.fire( 'paste', {
				dataTransfer: mockDataTransfer( `<img data-ck-upload-id=${ uploadId } />` ),
				preventDefault: () => {},
				stopPropagation: () => {}
			} );

			expect( editor.getData() ).toBe(
				'<p>hello<img src="/sample.png" srcset="assets/sample2.png 800w" sizes="100vw" width="800"></p>'
			);
		} );
	} );

	describe( 'data upcast of `data-ck-upload-id` attribute', () => {
		it( 'should upcast `data-ck-upload-id` attribute', () => {
			editor.setData( '<p><img data-ck-upload-id="123"></p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
				'<paragraph><imageInline uploadId="123"></imageInline></paragraph>'
			);
		} );

		it( 'should not upcast empty `data-ck-upload-id` attribute', () => {
			editor.setData( '<p><img data-ck-upload-id=""></p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
				'<paragraph><imageInline></imageInline></paragraph>'
			);
		} );

		it( 'should not crash when the image cannot be inserted into the current context', () => {
			// Disallow both image types everywhere, the same way an inline root ($inlineRoot) does for blocks.
			model.schema.addChildCheck( () => false, 'imageBlock' );
			model.schema.addChildCheck( () => false, 'imageInline' );

			expect( () => {
				editor.setData( '<p><img src="/sample.png" data-ck-upload-id="123"></p>' );
			} ).not.toThrow();
		} );

		it( 'should not upcast already consumed element', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher =>
				dispatcher.on( 'element:img', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-ck-upload-id' ] } );
				}, { priority: 'high' } )
			);

			editor.setData( '<p><img data-ck-upload-id="123"></p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
				'<paragraph><imageInline></imageInline></paragraph>'
			);
		} );

		it( 'should upcast `uploadStatus` if image is present in registry', () => {
			vi.spyOn( fileRepository.loaders, 'get' ).mockImplementation( id => {
				if ( id === '123' ) {
					return { status: 'uploading', data: {} };
				}
			} );

			editor.setData( '<p><img data-ck-upload-id="123"></p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
				'<paragraph><imageInline uploadId="123" uploadStatus="uploading"></imageInline></paragraph>'
			);
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
			expect( _stringifyView( content ) ).toBe( clipboardData );
		}
		expect( _getModelData( model ) ).toBe( modelData );

		if ( onSuccess !== false ) {
			adapterMocks[ 0 ].loader.file.then( () => {
				// Deffer so the promise could be resolved.
				setTimeout( () => {
					expectModel( doneFn, _getModelData( model ), finalModelData );
				} );
			} );
		} else {
			adapterMocks[ 0 ].loader.file.then( () => {
				expect.fail( 'The `loader.file` should be rejected.' );
			} ).catch( () => {
				// Deffer so the promise could be resolved.
				setTimeout( () => {
					expectModel( doneFn, _getModelData( model ), finalModelData );
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
		expect( actual ).toBe( expected );
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
// @returns {module:engine/view/datatransfer~ViewDataTransfer} DataTransfer object.
function mockDataTransfer( content ) {
	return new ViewDataTransfer( {
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

function createDataTransfer() {
	const store = new Map();

	return {
		setData( type, data ) {
			store.set( type, data );
		},

		getData( type ) {
			return store.get( type );
		}
	};
}
