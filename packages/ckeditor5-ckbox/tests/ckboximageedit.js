/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

import CKBoxImageEdit from '../src/ckboximageedit.js';
import CKBoxImageEditEditing from '../src/ckboximageedit/ckboximageeditediting.js';
import CKBoxImageEditUI from '../src/ckboximageedit/ckboximageeditui.ts';

describe( 'CKBoxImageEdit', () => {
	it( 'should be correctly named', () => {
		expect( CKBoxImageEdit.pluginName ).to.equal( 'CKBoxImageEdit' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxImageEdit.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxImageEdit.isPremiumPlugin ).to.be.false;
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
					LinkEditing,
					PictureEditing,
					ImageUploadEditing,
					ImageUploadProgress,
					CloudServices,
					CKBoxImageEdit
				]
			} );
		} );

		afterEach( () => {
			domElement.remove();
			return editor.destroy();
		} );

		it( 'should load CKBoxImageEdit plugin', () => {
			const CKBoxImageEditPlugin = editor.plugins.get( 'CKBoxImageEdit' );

			expect( CKBoxImageEditPlugin ).to.be.an.instanceof( CKBoxImageEdit );
		} );

		it( 'should have proper "requires" value', () => {
			expect( CKBoxImageEdit.requires ).to.deep.equal( [
				CKBoxImageEditEditing,
				CKBoxImageEditUI
			] );
		} );

		it( 'should load CKBoxImageEditEditing plugin', () => {
			expect( editor.plugins.get( CKBoxImageEditEditing ) ).to.instanceOf( CKBoxImageEditEditing );
		} );

		it( 'should load CKBoxImageEditUI plugin', () => {
			expect( editor.plugins.get( CKBoxImageEditUI ) ).to.instanceOf( CKBoxImageEditUI );
		} );
	} );
} );
