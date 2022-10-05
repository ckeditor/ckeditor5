/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import CloudServicesCoreMock from './_utils/cloudservicescoremock';

import CKBox from '../src/ckbox';
import CKBoxUI from '../src/ckboxui';
import CKBoxEditing from '../src/ckboxediting';

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
} );

