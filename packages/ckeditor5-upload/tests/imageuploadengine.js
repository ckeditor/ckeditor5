/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

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
import imagePlaceholder from '../theme/icons/image_placeholder.svg';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe.only( 'ImageUploadEngine', () => {
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
		setModelData( document, '<paragraph>foo bar baz[]</paragraph>' );

		viewDocument.fire( 'input', { dataTransfer } );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWith( spy, 'imageUpload' );

		const id = fileRepository.getLoader( fileMock ).id;
		expect( getModelData( document ) ).to.equal(
			`<image uploadId="${ id }"></image><paragraph>foo bar baz[]</paragraph>`
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

		viewDocument.fire( 'input', { dataTransfer } );

		sinon.assert.notCalled( spy );
	} );

	it( 'should convert image\'s uploadId attribute from model to view', () => {
		setModelData( document, '<image uploadId="1234"></image>' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[]<figure class="image ck-widget" contenteditable="false">' +
				`<img src="data:image/svg+xml;utf8,${ imagePlaceholder }"></img>` +
			'</figure>'
		);
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
} );
