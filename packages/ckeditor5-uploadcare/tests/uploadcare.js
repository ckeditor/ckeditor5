/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Uploadcare from '../src/uploadcare.js';
import UploadcareUI from '../src/uploadcareui.js';
import UploadcareEditing from '../src/uploadcareediting.js';

describe( 'Uploadcare', () => {
	let editorElement, editor;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				ImageBlockEditing,
				ImageInlineEditing,
				ImageUpload,
				CloudServices,
				Uploadcare
			],
			uploadcare: {
				pubkey: 'KEY'
			}
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should load Uploadcare, UploadcareUI and UploadcareEditing plugins', () => {
		expect( editor.plugins.get( Uploadcare ) ).to.be.instanceOf( Uploadcare );
		expect( editor.plugins.get( UploadcareUI ) ).to.instanceOf( UploadcareUI );
		expect( editor.plugins.get( UploadcareEditing ) ).to.instanceOf( UploadcareEditing );
	} );

	it( 'should have proper name', () => {
		expect( Uploadcare.pluginName ).to.equal( 'Uploadcare' );
	} );

	it( 'should define default sources in config', () => {
		expect( editor.config.get( 'uploadcare.sourceList' ) ).to.deep.equal( [ 'local', 'url' ] );
	} );

	it.skip( 'should define Uploacare components', () => {
		// TODO: the mock is needed.
	} );
} );

