/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import ImageUploadProgress from '../../src/imageupload/imageuploadprogress';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';

import { createNativeFileMock, NativeFileReaderMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ImageInlineEditing from '../../src/image/imageinlineediting';

describe( 'ImageUploadProgress', () => {
	// eslint-disable-next-line max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	let editor, model, doc, fileRepository, view, nativeReaderMock, loader, adapterMock, imagePlaceholder;

	class UploadAdapterPluginMock extends Plugin {
		init() {
			fileRepository = this.editor.plugins.get( FileRepository );
			fileRepository.createUploadAdapter = newLoader => {
				loader = newLoader;
				adapterMock = new UploadAdapterMock( loader );

				return adapterMock;
			};
		}
	}

	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'FileReader' ).callsFake( () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		return VirtualTestEditor
			.create( {
				plugins: [
					ImageBlockEditing, ImageInlineEditing, Paragraph, ImageUploadEditing,
					ImageUploadProgress, UploadAdapterPluginMock, ClipboardPipeline
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				view = editor.editing.view;

				fileRepository = editor.plugins.get( FileRepository );
				fileRepository.createUploadAdapter = newLoader => {
					loader = newLoader;
					adapterMock = new UploadAdapterMock( loader );

					return adapterMock;
				};

				imagePlaceholder = editor.plugins.get( 'ImageUploadProgress' ).placeholder;
			} );
	} );

	it( 'should convert image\'s "reading" uploadStatus attribute', () => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'uploadImage', { file: createNativeFileMock() } );

		expect( getViewData( view ) ).to.equal(
			'<p>[<span class="ck-appear ck-image-upload-placeholder ck-widget image-inline" contenteditable="false">' +
				`<img src="${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</span>}foo</p>'
		);
	} );

	it( 'should convert image\'s "uploading" uploadStatus attribute', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'uploadImage', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			try {
				expect( getViewData( view ) ).to.equal(
					'<p>[<span class="ck-appear ck-widget image-inline" contenteditable="false">' +
						`<img src="${ base64Sample }"></img>` +
						'<div class="ck-progress-bar"></div>' +
					'</span>}foo</p>'
				);

				done();
			} catch ( err ) {
				done( err );
			}
		}, { priority: 'lowest' } );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/1985.
	// Might be obsolete after changes in table refreshing (now it refreshes siblings of an image and not its parent).
	it( 'should work if image parent is refreshed by the differ', function( done ) {
		model.schema.register( 'outerBlock', {
			allowWhere: '$block',
			isBlock: true
		} );

		model.schema.register( 'innerBlock', {
			allowIn: 'outerBlock',
			isLimit: true
		} );

		model.schema.extend( '$block', { allowIn: 'innerBlock' } );
		editor.conversion.elementToElement( { model: 'outerBlock', view: 'outerBlock' } );
		editor.conversion.elementToElement( { model: 'innerBlock', view: 'innerBlock' } );

		model.document.registerPostFixer( () => {
			for ( const change of doc.differ.getChanges() ) {
				// The differ.refreshItem() simulates remove and insert of and image parent thus preventing image from proper work.
				if ( change.type == 'insert' && change.name == 'imageBlock' ) {
					doc.differ.refreshItem( change.position.parent );

					return false; // Refreshing item should not trigger calling post-fixer again.
				}
			}
		} );

		setModelData( model, '<outerBlock><innerBlock><paragraph>[]</paragraph></innerBlock></outerBlock>' );

		editor.execute( 'uploadImage', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			try {
				expect( getViewData( view ) ).to.equal(
					'<outerBlock>' +
						'<innerBlock>' +
							'[<figure class="ck-appear ck-widget image" contenteditable="false">' +
								`<img src="${ base64Sample }"></img>` +
								'<div class="ck-progress-bar"></div>' +
							'</figure>]' +
						'</innerBlock>' +
					'</outerBlock>'
				);

				done();
			} catch ( err ) {
				done( err );
			}
		}, { priority: 'lowest' } );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	it( 'should work correctly when there is no "reading" status and go straight to "uploading"', () => {
		const fileRepository = editor.plugins.get( FileRepository );
		const file = createNativeFileMock();
		const loader = fileRepository.createLoader( file );

		setModelData( model, '<imageBlock></imageBlock>' );
		const image = doc.getRoot().getChild( 0 );

		// Set attributes directly on image to simulate instant "uploading" status.
		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'uploading', image );
			writer.setAttribute( 'uploadId', loader.id, image );
			writer.setAttribute( 'src', 'image.png', image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-appear ck-widget image" contenteditable="false">' +
				'<img src="image.png"></img>' +
				'<div class="ck-progress-bar"></div>' +
			'</figure>]'
		);
	} );

	it( 'should work correctly when there is no "reading" status and go straight to "uploading" - external changes', () => {
		setModelData( model, '<imageBlock></imageBlock>' );
		const image = doc.getRoot().getChild( 0 );

		// Set attributes directly on image to simulate instant "uploading" status.
		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'uploading', image );
			writer.setAttribute( 'uploadId', '12345', image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-appear ck-image-upload-placeholder ck-widget image" contenteditable="false">' +
				`<img src="${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</figure>]'
		);
	} );

	it( 'should "clear" image when uploadId changes to null', () => {
		setModelData( model, '<imageBlock></imageBlock>' );
		const image = doc.getRoot().getChild( 0 );

		// Set attributes directly on image to simulate instant "uploading" status.
		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'uploading', image );
			writer.setAttribute( 'uploadId', '12345', image );
		} );

		model.change( writer => {
			writer.setAttribute( 'uploadStatus', null, image );
			writer.setAttribute( 'uploadId', null, image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false">' +
				`<img src="${ imagePlaceholder }"></img>` +
			'</figure>]'
		);
	} );

	it( 'should update progressbar width on progress', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'uploadImage', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			adapterMock.mockProgress( 40, 100 );

			try {
				expect( getViewData( view ) ).to.equal(
					'<p>[<span class="ck-appear ck-widget image-inline" contenteditable="false">' +
						`<img src="${ base64Sample }"></img>` +
						'<div class="ck-progress-bar" style="width:40%"></div>' +
					'</span>}foo</p>'
				);

				done();
			} catch ( err ) {
				done( err );
			}
		}, { priority: 'lowest' } );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	it( 'should convert image\'s "complete" uploadStatus attribute and display temporary icon', done => {
		const clock = testUtils.sinon.useFakeTimers();

		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'uploadImage', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				try {
					expect( getViewData( view ) ).to.equal(
						'<p>[<span class="ck-widget image-inline" contenteditable="false">' +
							'<img src="image.png"></img>' +
							'<div class="ck-image-upload-complete-icon"></div>' +
						'</span>}foo</p>'
					);

					clock.tick( 3000 );

					expect( getViewData( view ) ).to.equal(
						'<p>[<span class="ck-widget image-inline" contenteditable="false">' +
							'<img src="image.png"></img>' +
						'</span>}foo</p>'
					);

					done();
				} catch ( err ) {
					done( err );
				}
			}, { priority: 'lowest' } );

			loader.file.then( () => adapterMock.mockSuccess( { default: 'image.png' } ) );
		} );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	it( 'should allow to customize placeholder image', () => {
		const uploadProgress = editor.plugins.get( ImageUploadProgress );
		uploadProgress.placeholder = base64Sample;

		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'uploadImage', { file: createNativeFileMock() } );

		expect( getViewData( view ) ).to.equal(
			'<p>[<span class="ck-appear ck-image-upload-placeholder ck-widget image-inline" contenteditable="false">' +
				`<img src="${ base64Sample }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</span>}foo</p>'
		);
	} );

	it( 'should not process attribute change if it is already consumed', () => {
		editor.editing.downcastDispatcher.on( 'attribute:uploadStatus:imageInline', ( evt, data, conversionApi ) => {
			conversionApi.consumable.consume( data.item, evt.name );
		}, { priority: 'highest' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'uploadImage', { file: createNativeFileMock() } );

		expect( getViewData( view ) ).to.equal(
			'<p>[<span class="ck-widget image-inline" contenteditable="false"><img></img></span>}foo</p>'
		);
	} );

	it( 'should not show progress bar and complete icon if there is no loader with given uploadId', () => {
		setModelData( model, '<imageBlock uploadId="123" uploadStatus="reading"></imageBlock>' );

		const image = doc.getRoot().getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'uploading', image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-appear ck-image-upload-placeholder ck-widget image" contenteditable="false">' +
				`<img src="${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</figure>]'
		);

		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'complete', image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false">' +
				`<img src="${ imagePlaceholder }"></img>` +
			'</figure>]'
		);
	} );

	it( 'should work correctly when there is no ImageBlockEditing plugin enabled', async () => {
		const newEditor = await VirtualTestEditor.create( {
			plugins: [
				ImageInlineEditing, Paragraph, ImageUploadEditing,
				ImageUploadProgress, UploadAdapterPluginMock, ClipboardPipeline
			]
		} );

		setModelData( newEditor.model, '<paragraph>[]foo</paragraph>' );
		newEditor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( newEditor.editing.view ) ).to.equal(
			'<p>[<span class="ck-appear ck-image-upload-placeholder ck-widget image-inline" contenteditable="false">' +
				`<img src="${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</span>}foo</p>'
		);

		await newEditor.destroy();
	} );

	it( 'should work correctly when there is no ImageInlineEditing plugin enabled', async () => {
		const newEditor = await VirtualTestEditor.create( {
			plugins: [
				ImageBlockEditing, Paragraph, ImageUploadEditing,
				ImageUploadProgress, UploadAdapterPluginMock, ClipboardPipeline
			]
		} );

		setModelData( newEditor.model, '<paragraph>[]foo</paragraph>' );
		newEditor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( newEditor.editing.view ) ).to.equal(
			'[<figure class="ck-appear ck-image-upload-placeholder ck-widget image" contenteditable="false">' +
				`<img src="${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</figure>]<p>foo</p>'
		);

		await newEditor.destroy();
	} );
} );
