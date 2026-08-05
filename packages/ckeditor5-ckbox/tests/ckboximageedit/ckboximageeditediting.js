/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { global } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ImageEditing, ImageBlockEditing, ImageUploadEditing, ImageUploadProgress, PictureEditing } from '@ckeditor/ckeditor5-image';

import { CKBoxImageEditEditing } from '../../src/ckboximageedit/ckboximageeditediting.js';
import { CKBoxImageEditCommand } from '../../src/ckboximageedit/ckboximageeditcommand.js';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import { mockCreateToken } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/mockcloudservicescoretoken.js';
import { CKBoxUtils } from '../../src/ckboxutils.js';

describe( 'CKBoxImageEditEditing', () => {
	let editor, domElement;

	beforeEach( async () => {
		TokenMock.initialToken = 'ckbox-token';

		// `CKBoxEditing#init()` and `CKBoxUtils#init()` fire unawaited network requests (the upload permission
		// check and the private categories authorization). Stub them out so they do not end up as unhandled
		// rejections that fail the Vitest run.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();
		mockCreateToken( 'ckbox-token' );

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
		expect( CKBoxImageEditEditing.pluginName ).toBe( 'CKBoxImageEditEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxImageEditEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxImageEditEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should register the "ckboxImageEdit" command', () => {
		const command = editor.commands.get( 'ckboxImageEdit' );

		expect( command ).toBeInstanceOf( CKBoxImageEditCommand );
	} );
} );
