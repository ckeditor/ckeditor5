/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { global } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { Image, ImageUploadEditing, ImageUploadProgress, PictureEditing } from '@ckeditor/ckeditor5-image';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import { CloudServicesCoreMock } from '../_utils/cloudservicescoremock.js';

import { CKBoxImageEditEditing } from '../../src/ckboximageedit/ckboximageeditediting.js';
import { CKBoxImageEditUI } from '../../src/ckboximageedit/ckboximageeditui.js';
import { CKBoxUtils } from '../../src/ckboxutils.js';

describe( 'CKBoxImageEditUI', () => {
	let editor, model, element, button, command;
	let originalCKBox;

	beforeEach( () => {
		// `CKBoxEditing#init()` and `CKBoxUtils#init()` fire unawaited network requests (the upload permission
		// check and the private categories authorization). Stub them out so they do not end up as unhandled
		// rejections that fail the Vitest run.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();

		TokenMock.initialToken = [
			// Header.
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
			// Payload.
			btoa( JSON.stringify( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } ) ),
			// Signature.
			'signature'
		].join( '.' );

		originalCKBox = window.CKBox;
		window.CKBox = {
			mountImageEditor: vi.fn()
		};

		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [
					CKBoxImageEditEditing,
					CKBoxImageEditUI,
					Image,
					ImageUploadEditing,
					ImageUploadProgress,
					Paragraph,
					PictureEditing,
					LinkEditing,
					CloudServices
				],
				ckbox: {
					tokenUrl: 'foo'
				},
				substitutePlugins: [
					CloudServicesCoreMock
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				button = editor.ui.componentFactory.create( 'ckboxImageEdit' );
				command = editor.commands.get( 'ckboxImageEdit' );
			} );
	} );

	afterEach( () => {
		// Browser tests run in a shared page, so globals must not leak between files.
		window.CKBox = originalCKBox;

		element.remove();

		if ( global.document.querySelector( '.ck.ckbox-wrapper' ) ) {
			global.document.querySelector( '.ck.ckbox-wrapper' ).remove();
		}

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( CKBoxImageEditUI.pluginName ).toBe( 'CKBoxImageEditUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxImageEditUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxImageEditUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'the "editImage" button', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( button ).toBeInstanceOf( ButtonView );
		} );

		it( 'should have a label', () => {
			expect( button.label ).toBe( 'Edit image' );
		} );

		it( 'should have a label binded to #isAccessAllowed', () => {
			const uploadImageCommand = editor.commands.get( 'uploadImage' );
			uploadImageCommand.set( 'isAccessAllowed', false );

			expect( button.label ).toBe( 'You have no image editing permissions.' );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).toMatch( /^<svg/ );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).toBe( true );
		} );

		it( 'should have #isEnabled bound to the command isEnabled', () => {
			expect( button.isEnabled ).toBe( false );

			editor.commands.get( 'ckboxImageEdit' ).isEnabled = false;

			expect( button.isEnabled ).toBe( false );

			_setModelData( model, '[<paragraph>Foo</paragraph>]' );

			expect( button.isEnabled ).toBe( false );

			_setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/sample.png"></imageBlock>]' );

			expect( button.isEnabled ).toBe( true );
		} );

		it( 'should have #isOn bound to the command value', () => {
			editor.commands.get( 'ckboxImageEdit' ).value = false;

			expect( button.isOn ).toBe( false );

			editor.commands.get( 'ckboxImageEdit' ).value = true;

			_setModelData( model, '[<paragraph>Foo</paragraph>]' );

			expect( button.isOn ).toBe( false );

			_setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/sample.png"></imageBlock>]' );

			command.execute();

			expect( button.isOn ).toBe( true );
		} );

		it( 'should execute the "ckboxImageEdit" command and focus the editing view', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'ckboxImageEdit' );
			expect( focusSpy ).toHaveBeenCalledOnce();
		} );
	} );
} );
