/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting.js';

import CKBoxImageEditEditing from '../../src/ckboximageedit/ckboximageeditediting.js';
import CKBoxImageEditCommand from '../../src/ckboximageedit/ckboximageeditcommand.js';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { ImageBlockEditing, ImageUploadEditing, ImageUploadProgress, PictureEditing } from '@ckeditor/ckeditor5-image';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import CloudServicesCoreMock from '../_utils/cloudservicescoremock.js';

describe( 'CKBoxImageEditEditing', () => {
	let editor, domElement;

	beforeEach( async () => {
		TokenMock.initialToken = 'ckbox-token';

		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				ImageBlockEditing,
				ImageEditing,
				ImageUploadEditing,
				ImageUploadProgress,
				PictureEditing,
				LinkEditing,
				CKBoxImageEditEditing,
				CloudServices
			],
			substitutePlugins: [
				CloudServicesCoreMock
			],
			ckbox: {
				tokenUrl: 'http://cs.example.com'
			}
		} );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( CKBoxImageEditEditing.pluginName ).to.equal( 'CKBoxImageEditEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxImageEditEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxImageEditEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should register the "ckboxImageEdit" command', () => {
		const command = editor.commands.get( 'ckboxImageEdit' );

		expect( command ).to.be.instanceOf( CKBoxImageEditCommand );
	} );
} );
