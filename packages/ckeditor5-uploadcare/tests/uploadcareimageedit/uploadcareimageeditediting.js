/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { Image, ImageInsert, ImageUpload } from '@ckeditor/ckeditor5-image';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { global } from '@ckeditor/ckeditor5-utils';

import UploadcareImageEditEditing from '../../src/uploadcareimageedit/uploadcareimageeditediting.js';
import UploadcareImageEditCommand from '../../src/uploadcareimageedit/uploadcareimageeditcommand.js';

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
				UploadcareImageEditEditing
			]
		} );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( UploadcareImageEditEditing.pluginName ).to.equal( 'UploadcareImageEditEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( UploadcareImageEditEditing ) ).to.be.instanceOf( UploadcareImageEditEditing );
	} );

	it( 'should register the "uploadcare" command', () => {
		expect( editor.commands.get( 'uploadcareImageEdit' ) ).to.be.instanceOf( UploadcareImageEditCommand );
	} );
} );
