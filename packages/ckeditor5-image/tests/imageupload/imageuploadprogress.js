/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageEditing from '../../src/image/imageediting';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import ImageUploadProgress from '../../src/imageupload/imageuploadprogress';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import { createNativeFileMock, NativeFileReaderMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import svgPlaceholder from '../../theme/icons/image_placeholder.svg';

describe( 'ImageUploadProgress', () => {
	const imagePlaceholder = encodeURIComponent( svgPlaceholder );

	// eslint-disable-next-line max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	let editor, model, doc, fileRepository, view, nativeReaderMock, loader, adapterMock;

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
				plugins: [ ImageEditing, Paragraph, ImageUploadEditing, ImageUploadProgress, UploadAdapterPluginMock, Clipboard ]
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
			} );
	} );

	it( 'should convert image\'s "reading" uploadStatus attribute', () => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-appear ck-image-upload-placeholder ck-widget image" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</figure>]<p>foo</p>'
		);
	} );

	it( 'should convert image\'s "uploading" uploadStatus attribute', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			try {
				expect( getViewData( view ) ).to.equal(
					'[<figure class="ck-appear ck-widget image" contenteditable="false">' +
					`<img src="${ base64Sample }"></img>` +
					'<div class="ck-progress-bar"></div>' +
					'</figure>]<p>foo</p>'
				);

				done();
			} catch ( err ) {
				done( err );
			}
		}, { priority: 'lowest' } );

		loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/1985.
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
				if ( change.type == 'insert' && change.name == 'image' ) {
					doc.differ.refreshItem( change.position.parent );

					return true;
				}
			}
		} );

		setModelData( model, '<outerBlock><innerBlock><paragraph>[]</paragraph></innerBlock></outerBlock>' );

		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			try {
				expect( getViewData( view ) ).to.equal(
					'<outerBlock><innerBlock>[<figure class="ck-appear ck-widget image" contenteditable="false">' +
					`<img src="${ base64Sample }"></img>` +
					'<div class="ck-progress-bar"></div>' +
					'</figure>]</innerBlock></outerBlock>'
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

		setModelData( model, '<image></image>' );
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
		setModelData( model, '<image></image>' );
		const image = doc.getRoot().getChild( 0 );

		// Set attributes directly on image to simulate instant "uploading" status.
		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'uploading', image );
			writer.setAttribute( 'uploadId', '12345', image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-appear ck-image-upload-placeholder ck-widget image" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</figure>]'
		);
	} );

	it( 'should "clear" image when uploadId changes to null', () => {
		setModelData( model, '<image></image>' );
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
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
			'</figure>]'
		);
	} );

	it( 'should update progressbar width on progress', done => {
		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			adapterMock.mockProgress( 40, 100 );

			try {
				expect( getViewData( view ) ).to.equal(
					'[<figure class="ck-appear ck-widget image" contenteditable="false">' +
					`<img src="${ base64Sample }"></img>` +
					'<div class="ck-progress-bar" style="width:40%"></div>' +
					'</figure>]<p>foo</p>'
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
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		model.document.once( 'change', () => {
			model.document.once( 'change', () => {
				try {
					expect( getViewData( view ) ).to.equal(
						'[<figure class="ck-widget image" contenteditable="false">' +
						'<img src="image.png"></img>' +
						'<div class="ck-image-upload-complete-icon"></div>' +
						'</figure>]<p>foo</p>'
					);

					clock.tick( 3000 );

					expect( getViewData( view ) ).to.equal(
						'[<figure class="ck-widget image" contenteditable="false">' +
						'<img src="image.png"></img>' +
						'</figure>]<p>foo</p>'
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
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-appear ck-image-upload-placeholder ck-widget image" contenteditable="false">' +
				`<img src="${ base64Sample }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</figure>]<p>foo</p>'
		);
	} );

	it( 'should not process attribute change if it is already consumed', () => {
		editor.editing.downcastDispatcher.on( 'attribute:uploadStatus:image', ( evt, data, conversionApi ) => {
			conversionApi.consumable.consume( data.item, evt.name );
		}, { priority: 'highest' } );

		setModelData( model, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false"><img></img></figure>]<p>foo</p>'
		);
	} );

	it( 'should not show progress bar and complete icon if there is no loader with given uploadId', () => {
		setModelData( model, '<image uploadId="123" uploadStatus="reading"></image>' );

		const image = doc.getRoot().getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'uploading', image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-appear ck-image-upload-placeholder ck-widget image" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
				'<div class="ck-upload-placeholder-loader"></div>' +
			'</figure>]'
		);

		model.change( writer => {
			writer.setAttribute( 'uploadStatus', 'complete', image );
		} );

		expect( getViewData( view ) ).to.equal(
			'[<figure class="ck-widget image" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
			'</figure>]'
		);
	} );
} );
