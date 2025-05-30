/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import CloudServicesCoreMock from './_utils/cloudservicescoremock.js';

import CKBox from '../src/ckbox.js';
import CKBoxUI from '../src/ckboxui.js';
import CKBoxEditing from '../src/ckboxediting.js';

describe( 'CKBox', () => {
	let editorElement, editor;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				LinkEditing,
				PictureEditing,
				ImageBlockEditing,
				ImageInlineEditing,
				ImageUpload,
				CloudServices,
				CKBox
			],
			substitutePlugins: [
				CloudServicesCoreMock
			],
			ckbox: {
				tokenUrl: 'foo'
			}
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should load CKBox, CKBoxUI and CKBoxEditing plugins', () => {
		expect( editor.plugins.get( CKBox ) ).to.be.instanceOf( CKBox );
		expect( editor.plugins.get( CKBoxUI ) ).to.instanceOf( CKBoxUI );
		expect( editor.plugins.get( CKBoxEditing ) ).to.instanceOf( CKBoxEditing );
	} );

	it( 'should have proper name', () => {
		expect( CKBox.pluginName ).to.equal( 'CKBox' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBox.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBox.isPremiumPlugin ).to.be.false;
	} );
} );

