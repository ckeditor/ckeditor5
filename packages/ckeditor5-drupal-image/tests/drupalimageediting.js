/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { Plugin } from 'ckeditor5/src/core';
import { FileRepository } from 'ckeditor5/src/upload';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting';
import ImageStyleEditing from '@ckeditor/ckeditor5-image/src/imagestyle/imagestyleediting';
import { UploadAdapterMock, createNativeFileMock, NativeFileReaderMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

import DrupalImageEditing from '../src/drupalimageediting';

// eslint-disable-next-line max-len
const base64Sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

describe( 'DrupalImageEditing', () => {
	let editor, model, fileRepository, loader;
	let adapterMocks = [];

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

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph,
				ImageBlockEditing,
				ImageInlineEditing,
				ImageCaptionEditing,
				ImageStyleEditing,
				ImageUploadEditing,
				DrupalImageEditing,
				UploadAdapterPluginMock,
				FileRepository
			]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( DrupalImageEditing.pluginName ).to.equal( 'DrupalImageEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( DrupalImageEditing ) ).to.be.instanceOf( DrupalImageEditing );
	} );

	/**
	 * data-align
	 * data-caption
	 * data-entity-file
	 * data-entity-uuid
	 */

	it( 'should convert data-caption', () => {
		editor.setData(
			'<img src="/drupal/image.jpg" alt="Alternative text" data-caption="Some caption" />'
		);

		expect( getModelData( model, { withoutSelection: true } ) )
			.to.equal(
				'<imageBlock alt="Alternative text" src="/drupal/image.jpg">' +
					'<caption>Some caption</caption>' +
				'</imageBlock>'
			);

		// Might move it to a test section with downcast.
		expect( editor.getData() )
			.to.equal(
				'<img src="/drupal/image.jpg" alt="Alternative text" data-caption="Some caption">'
			);
	} );

	it( 'should convert data-align - block image', () => {
		editor.setData(
			'<img src="/drupal/image.jpg" alt="Alternative text" data-align="right" />'
		);

		expect( getModelData( model, { withoutSelection: true } ) )
			.to.equal(
				'<imageBlock alt="Alternative text" imageStyle="alignBlockRight" src="/drupal/image.jpg">' +
				'</imageBlock>'
			);

		// Might move it to a test section with downcast.
		expect( editor.getData() )
			.to.equal(
				'<img src="/drupal/image.jpg" data-align="right" alt="Alternative text">'
			);
	} );

	it( 'should convert data-align - inline image', () => {
		editor.setData(
			'<p>Some text' +
				'<img src="/drupal/image.jpg" alt="Alternative text" data-align="right" />' +
			'</p>'
		);

		expect( getModelData( model, { withoutSelection: true } ) )
			.to.equal(
				'<paragraph>' +
					'Some text' +
					'<imageInline alt="Alternative text" imageStyle="alignRight" src="/drupal/image.jpg"></imageInline>' +
				'</paragraph>'
			);

		// Might move it to a test section with downcast.
		expect( editor.getData() )
			.to.equal(
				'<p>' +
					'Some text' +
					'<img src="/drupal/image.jpg" data-align="right" alt="Alternative text">' +
				'</p>'
			);
	} );

	it( 'should convert data-entity-uuid', () => {
		editor.setData(
			'<p>Some text' +
				'<img src="/drupal/image.jpg" alt="Alternative text" data-entity-uuid="AAAA-0000-BBBB-1111" />' +
			'</p>'
		);

		expect( getModelData( model, { withoutSelection: true } ) )
			.to.equal(
				'<paragraph>' +
					'Some text' +
					'<imageInline alt="Alternative text" dataEntityUuid="AAAA-0000-BBBB-1111" src="/drupal/image.jpg">' +
					'</imageInline>' +
				'</paragraph>'
			);

		// Might move it to a test section with downcast.
		expect( editor.getData() )
			.to.equal(
				'<p>' +
					'Some text' +
					'<img src="/drupal/image.jpg" data-entity-uuid="AAAA-0000-BBBB-1111" alt="Alternative text">' +
				'</p>'
			);
	} );

	it( 'should convert data-entity-type', () => {
		editor.setData(
			'<p>Some text' +
				'<img src="/drupal/image.jpg" alt="Alternative text" data-entity-type="file" />' +
			'</p>'
		);

		expect( getModelData( model, { withoutSelection: true } ) )
			.to.equal(
				'<paragraph>' +
					'Some text' +
					'<imageInline alt="Alternative text" dataEntityType="file" src="/drupal/image.jpg">' +
					'</imageInline>' +
				'</paragraph>'
			);

		// Might move it to a test section with downcast.
		expect( editor.getData() )
			.to.equal(
				'<p>' +
					'Some text' +
					'<img src="/drupal/image.jpg" data-entity-type="file" alt="Alternative text">' +
				'</p>'
			);
	} );

	describe( 'File upload', () => {
		let nativeReaderMock;

		beforeEach( () => {
			sinon.stub( window, 'FileReader' ).callsFake( () => {
				nativeReaderMock = new NativeFileReaderMock();

				return nativeReaderMock;
			} );
		} );

		afterEach( () => {
			sinon.restore();
			adapterMocks = [];

			return editor.destroy();
		} );

		it( 'should upload successfully', async () => {
			const file = createNativeFileMock();
			const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
			const uploadCompleteSpy = sinon.spy();

			setModelData( model, '<paragraph>[]foo bar</paragraph>' );
			imageUploadEditing.on( 'uploadComplete', uploadCompleteSpy );

			editor.execute( 'uploadImage', { file } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( base64Sample ) );
			} );
			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => adapterMocks[ 0 ].mockSuccess( { default: 'image.png' } ) );
			} );

			const eventArgs = uploadCompleteSpy.firstCall.args[ 1 ];
			const fileUuid = adapterMocks[ 0 ].loader.id;

			expect( eventArgs.imageElement.getAttribute( 'dataEntityUuid' ) ).to.equal( fileUuid );
			expect( eventArgs.imageElement.getAttribute( 'dataEntityType' ) ).to.equal( 'file' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>' +
					`<imageInline dataEntityType="file" dataEntityUuid="${ fileUuid }" src="image.png"></imageInline>` +
					'foo bar' +
				'</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					`<img data-entity-uuid="${ fileUuid }" data-entity-type="file" src="image.png">` +
					'foo bar' +
				'</p>'
			);
		} );
	} );
} );
