/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { PictureEditing, ImageUpload, ImageBlockEditing, ImageInlineEditing } from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { CloudServicesCoreMock } from './_utils/cloudservicescoremock.js';

import { CKBox } from '../src/ckbox.js';
import { CKBoxUI } from '../src/ckboxui.js';
import { CKBoxEditing } from '../src/ckboxediting.js';
import { CKBoxUtils } from '../src/ckboxutils.js';

describe( 'CKBox', () => {
	let editorElement, editor;

	beforeEach( async () => {
		// `CKBoxEditing#init()` and `CKBoxUtils#init()` fire unawaited network requests (the upload permission
		// check and the private categories authorization). Stub them out so they do not end up as unhandled
		// rejections that fail the Vitest run.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();

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

		vi.restoreAllMocks();
	} );

	it( 'should load CKBox, CKBoxUI and CKBoxEditing plugins', () => {
		expect( editor.plugins.get( CKBox ) ).toBeInstanceOf( CKBox );
		expect( editor.plugins.get( CKBoxUI ) ).toBeInstanceOf( CKBoxUI );
		expect( editor.plugins.get( CKBoxEditing ) ).toBeInstanceOf( CKBoxEditing );
	} );

	it( 'should have proper name', () => {
		expect( CKBox.pluginName ).toEqual( 'CKBox' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBox.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBox.isPremiumPlugin ).toBe( false );
	} );
} );
