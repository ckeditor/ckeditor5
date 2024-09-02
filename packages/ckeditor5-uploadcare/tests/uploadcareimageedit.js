/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import { Image, ImageUpload, ImageInsert, ImageUploadProgress } from '@ckeditor/ckeditor5-image';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

import UploadcareImageEdit from '../src/uploadcareimageedit.js';
import UploadcareImageEditEditing from '../src/uploadcareimageedit/uploadcareimageeditediting.js';
import UploadcareImageEditUI from '../src/uploadcareimageedit/uploadcareimageeditui.ts';

describe( 'UploadcareImageEdit', () => {
	it( 'should be correctly named', () => {
		expect( UploadcareImageEdit.pluginName ).to.equal( 'UploadcareImageEdit' );
	} );

	describe( 'init()', () => {
		let domElement, editor;

		beforeEach( async () => {
			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicEditor.create( domElement, {
				plugins: [
					Paragraph,
					Heading,
					Essentials,
					Image,
					ImageUpload,
					ImageInsert,
					ImageUploadProgress,
					UploadcareImageEdit
				]
			} );
		} );

		afterEach( () => {
			domElement.remove();
			return editor.destroy();
		} );

		it( 'should load UploadcareImageEdit plugin', () => {
			const UploadcareImageEditPlugin = editor.plugins.get( 'UploadcareImageEdit' );

			expect( UploadcareImageEditPlugin ).to.be.an.instanceof( UploadcareImageEdit );
		} );

		it( 'should have proper "requires" value', () => {
			expect( UploadcareImageEdit.requires ).to.deep.equal( [
				UploadcareImageEditEditing,
				UploadcareImageEditUI
			] );
		} );

		it( 'should load UploadcareImageEditEditing plugin', () => {
			expect( editor.plugins.get( UploadcareImageEditEditing ) ).to.instanceOf( UploadcareImageEditEditing );
		} );

		it( 'should load UploadcareImageEditUI plugin', () => {
			expect( editor.plugins.get( UploadcareImageEditUI ) ).to.instanceOf( UploadcareImageEditUI );
		} );
	} );
} );
