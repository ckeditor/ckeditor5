/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { Image, ImageInsert, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Dialog } from '@ckeditor/ckeditor5-ui';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { global } from '@ckeditor/ckeditor5-utils';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import UploadcareEditing from '../src/uploadcareediting.js';
import UploadcareCommand from '../src/uploadcarecommand.js';
import UploadcareUploadAdapter from '../src/uploadcareuploadadapter.js';

describe( 'UploadcareEditing', () => {
	let domElement, editor, view, model, schema, replaceImageSourceCommand;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Image,
				ImageUpload,
				ImageInsert,
				ImageUploadProgress,
				UploadcareEditing
			]
		} );

		view = editor.editing.view;
		model = editor.model;
		schema = model.schema;

		replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( UploadcareEditing.pluginName ).to.equal( 'UploadcareEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( UploadcareEditing ) ).to.be.instanceOf( UploadcareEditing );
	} );

	it( 'should load the upload adapter', () => {
		expect( UploadcareEditing.requires ).to.deep.equal( [ UploadcareUploadAdapter, Dialog ] );
	} );

	it( 'should register the "uploadcare" command', () => {
		expect( editor.commands.get( 'uploadcare' ) ).to.be.instanceOf( UploadcareCommand );
	} );

	describe( 'schema', () => {
		it( 'should extend the schema rules for block image', () => {
			expect( schema.checkAttribute( [ '$root', 'imageBlock' ], 'uploadcareImageId' ) ).to.be.true;
		} );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'should convert "data-uc-image-id" attribute from a block image', () => {
				editor.setData(
					'<figure class="image" data-uc-image-id="mock-uc-image-id">' +
						'<img src="/assets/sample.png">' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'uploadcareImageId="mock-uc-image-id">' +
					'</imageBlock>'
				);
			} );

			it( 'should not convert the "data-uc-image-id" attribute if empty', () => {
				editor.setData(
					'<figure class="image" data-uc-image-id>' +
						'<img src="/assets/sample.png">' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock ' +
						'src="/assets/sample.png">' +
					'</imageBlock>'
				);
			} );

			it( 'should not convert "data-uc-image-id" attribute from disallowed element', () => {
				editor.setData( '<p data-uc-image-id="mock-uc-image-id-1"><a data-uc-image-id="mock-uc-image-id-2">foo</a>bar</p>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );
			} );
		} );

		describe( 'downcast', () => {
			describe( 'editing', () => {
				it( 'should convert "data-uc-image-id" attribute from a block image', () => {
					editor.setData(
						'<p>foo</p>' +
						'<figure class="image" data-uc-image-id="mock-uc-image-id">' +
							'<img src="/assets/sample.png">' +
						'</figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>foo</p>' +
						'<figure class="ck-widget image" contenteditable="false" data-uc-image-id="mock-uc-image-id">' +
							'<img src="/assets/sample.png"></img>' +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</figure>'
					);
				} );

				it( 'should not convert "data-uc-image-id" attribute if empty', () => {
					editor.setData(
						'<p>foo</p>' +
						'<figure class="image" data-uc-image-id="">' +
							'<img src="/assets/sample.png">' +
						'</figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>foo</p>' +
						'<figure class="ck-widget image" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</figure>'
					);
				} );

				it( 'should not convert "data-uc-image-id" attribute from disallowed element', () => {
					editor.setData( '<p data-uc-image-id="mock-uc-image-id-1"><a data-uc-image-id="mock-uc-image-id-2">foo</a>bar</p>' );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal( '<p>foobar</p>' );
				} );
			} );

			describe( 'data', () => {
				it( 'should convert "data-uc-image-id" attribute from a block image', () => {
					editor.setData(
						'<p>foo</p>' +
						'<figure class="image" data-uc-image-id="mock-uc-image-id">' +
							'<img src="/assets/sample.png">' +
						'</figure>'
					);

					expect( editor.getData() ).to.equal(
						'<p>foo</p>' +
						'<figure class="image" data-uc-image-id="mock-uc-image-id">' +
							'<img src="/assets/sample.png">' +
						'</figure>'
					);
				} );

				it( 'should not convert "data-uc-image-id" attribute if empty', () => {
					editor.setData(
						'<p>foo</p>' +
						'<figure class="image" data-uc-image-id="">' +
							'<img src="/assets/sample.png">' +
						'</figure>'
					);

					expect( editor.getData() ).to.equal(
						'<p>foo</p>' +
						'<figure class="image">' +
							'<img src="/assets/sample.png">' +
						'</figure>'
					);
				} );

				it( 'should not convert "data-uc-image-id" attribute from disallowed element', () => {
					editor.setData( '<p data-uc-image-id="mock-uc-image-id-1"><a data-uc-image-id="mock-uc-image-id-2">foo</a>bar</p>' );

					expect( editor.getData() ).to.equal( '<p>foobar</p>' );
				} );
			} );
		} );

		it( 'should remove uploadcareImageId attribute on image replace', () => {
			setModelData( model, `[<imageBlock
				uploadcareImageId="mock-uc-image-id"
			></imageBlock>]` );

			const element = model.document.selection.getSelectedElement();

			expect( element.getAttribute( 'uploadcareImageId' ) ).to.equal( 'mock-uc-image-id' );

			replaceImageSourceCommand.execute( { source: 'bar/foo.jpg' } );

			expect( element.getAttribute( 'uploadcareImageId' ) ).to.be.undefined;
		} );
	} );
} );
