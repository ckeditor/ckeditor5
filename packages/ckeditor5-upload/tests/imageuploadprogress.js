/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageEngine from '@ckeditor/ckeditor5-image/src/image/imageengine';
import ImageUploadEngine from '../src/imageuploadengine';
import ImageUploadProgress from '../src/imageuploadprogress';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import FileRepository from '../src/filerepository';
import { AdapterMock, createNativeFileMock, NativeFileReaderMock } from './_utils/mocks';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import imagePlaceholder from '../theme/icons/image_placeholder.svg';

describe( 'ImageUploadProgress', () => {
	// eslint-disable-next-line max-len
	const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	let editor, document, fileRepository, viewDocument, nativeReaderMock, loader, adapterMock;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'FileReader' ).callsFake( () => {
			nativeReaderMock = new NativeFileReaderMock();

			return nativeReaderMock;
		} );

		return ClassicTestEditor
			.create( {
				plugins: [ ImageEngine, Paragraph, ImageUploadProgress ]
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

	it( 'should include ImageUploadEngine', () => {
		expect( editor.plugins.get( ImageUploadEngine ) ).to.be.instanceOf( ImageUploadEngine );
	} );

	it( 'should convert image\'s "reading" uploadStatus attribute', () => {
		setModelData( document, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<figure class="image ck-widget ck-appear ck-infinite-progress" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
			'</figure>]<p>foo</p>'
		);
	} );

	it( 'should convert image\'s "uploading" uploadStatus attribute', done => {
		setModelData( document, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		document.once( 'changesDone', () => {
			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-appear" contenteditable="false">' +
					`<img src="${ base64Sample }"></img>` +
					'<div class="ck-progress-bar"></div>' +
				'</figure>]<p>foo</p>'
			);

			done();
		} );

		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should update progressbar width on progress', done => {
		setModelData( document, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		document.once( 'changesDone', () => {
			adapterMock.mockProgress( 40, 100 );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-appear" contenteditable="false">' +
				`<img src="${ base64Sample }"></img>` +
				'<div class="ck-progress-bar" style="width:40%;"></div>' +
				'</figure>]<p>foo</p>'
			);

			done();
		} );

		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should convert image\'s "complete" uploadStatus attribute', done => {
		setModelData( document, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		document.once( 'changesDone', () => {
			document.once( 'changesDone', () => {
				expect( getViewData( viewDocument ) ).to.equal(
					'[<figure class="image ck-widget" contenteditable="false">' +
						'<img src="image.png"></img>' +
					'</figure>]<p>foo</p>'
				);

				done();
			} );

			adapterMock.mockSuccess( { default: 'image.png' } );
		} );

		nativeReaderMock.mockSuccess( base64Sample );
	} );

	it( 'should allow to customize placeholder image', () => {
		const uploadProgress = editor.plugins.get( ImageUploadProgress );
		uploadProgress.placeholder = base64Sample;

		setModelData( document, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<figure class="image ck-widget ck-appear ck-infinite-progress" contenteditable="false">' +
				`<img src="${ base64Sample }"></img>` +
			'</figure>]<p>foo</p>'
		);
	} );

	it( 'should not process attribute change if it is already consumed', () => {
		editor.editing.modelToView.on( 'addAttribute:uploadStatus:image', ( evt, data, consumable ) => {
			consumable.consume( data.item, eventNameToConsumableType( evt.name ) );
		}, { priority: 'highest' } );

		setModelData( document, '<paragraph>[]foo</paragraph>' );
		editor.execute( 'imageUpload', { file: createNativeFileMock() } );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<figure class="image ck-widget" contenteditable="false"><img></img></figure>]<p>foo</p>'
		);
	} );

	it( 'should not show progress bar if there is no loader with given uploadId', () => {
		setModelData( document, '<image uploadId="123" uploadStatus="reading"></image>' );

		const image = document.getRoot().getChild( 0 );

		document.enqueueChanges( () => {
			document.batch().setAttribute( image, 'uploadStatus', 'uploading' );
		} );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<figure class="image ck-widget ck-appear ck-infinite-progress" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
			'</figure>]'
		);

		document.enqueueChanges( () => {
			document.batch().setAttribute( image, 'uploadStatus', 'complete' );
		} );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<figure class="image ck-widget" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
			'</figure>]'
		);
	} );
} );
