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

import UploadcareEditing from '../src/uploadcareediting.js';
import UploadcareCommand from '../src/uploadcarecommand.js';
import UploadcareUploadAdapter from '../src/uploadcareuploadadapter.js';

describe( 'UploadcareEditing', () => {
	let domElement, editor;

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
} );
