/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ButtonView, UIModel, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import {
	PictureEditing,
	ImageUploadEditing,
	ImageUploadProgress,
	ImageBlockEditing,
	ImageInlineEditing,
	ImageInsertUI
} from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { mockCreateToken } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/mockcloudservicescoretoken.js';
import { IconImageAssetManager, IconBrowseFiles } from '@ckeditor/ckeditor5-icons';

import { CKBoxUI } from '../src/ckboxui.js';
import { CKBoxEditing } from '../src/ckboxediting.js';
import { CKBoxUtils } from '../src/ckboxutils.js';

describe( 'CKBoxUI', () => {
	let editorElement, editor, button, command, originalCKBox;

	beforeEach( async () => {
		// `CKBoxEditing#init()` and `CKBoxUtils#init()` fire unawaited network requests (the upload permission
		// check and the private categories authorization). Stub them out so they do not end up as unhandled
		// rejections that fail the Vitest run.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();
		mockCreateToken( 'ckbox-token' );

		originalCKBox = window.CKBox;
		window.CKBox = {};

		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				LinkEditing,
				PictureEditing,
				ImageBlockEditing,
				ImageInlineEditing,
				ImageUploadEditing,
				ImageUploadProgress,
				ImageInsertUI,
				CloudServices,
				CKBoxUI,
				CKBoxEditing
			],
			toolbar: [ 'ckbox' ],
			ckbox: {
				tokenUrl: 'foo'
			}
		} );

		button = editor.ui.componentFactory.create( 'ckbox' );
		command = editor.commands.get( 'ckbox' );
	} );

	afterEach( async () => {
		window.CKBox = originalCKBox;
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( CKBoxUI.pluginName ).toEqual( 'CKBoxUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should not add the "ckbox" component to the factory if the "ckbox" command does not exist', async () => {
		delete window.CKBox;

		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				LinkEditing,
				PictureEditing,
				ImageBlockEditing,
				ImageInlineEditing,
				ImageUploadEditing,
				ImageUploadProgress,
				CloudServices,
				CKBoxUI,
				CKBoxEditing
			]
		} );

		expect( editor.ui.componentFactory.has( 'ckbox' ) ).toBe( false );
		expect( editor.ui.componentFactory.has( 'menuBar:ckbox' ) ).toBe( false );
		expect( editor.commands.get( 'ckbox' ) ).toBeUndefined();

		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should still register the "ckbox" components when the "ImageInsertUI" plugin is not loaded', async () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				LinkEditing,
				PictureEditing,
				ImageBlockEditing,
				ImageInlineEditing,
				ImageUploadEditing,
				ImageUploadProgress,
				CloudServices,
				CKBoxUI,
				CKBoxEditing
			],
			ckbox: {
				tokenUrl: 'foo'
			}
		} );

		expect( editor.plugins.has( 'ImageInsertUI' ) ).toBe( false );
		expect( editor.ui.componentFactory.has( 'ckbox' ) ).toBe( true );
		expect( editor.ui.componentFactory.has( 'menuBar:ckbox' ) ).toBe( true );

		editorElement.remove();

		await editor.destroy();
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'ckbox' );
		} );

		testButton( ButtonView, 'Open file manager' );

		it( 'should enable tooltips for the #buttonView', () => {
			expect( button.tooltip ).toBe( true );
		} );
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:ckbox' );
		} );

		testButton( MenuBarMenuListItemButtonView, 'File' );
	} );

	describe( 'InsertImageUI integration', () => {
		it( 'should create CKBox button in split button dropdown button', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );
			const dropdownButton = dropdown.buttonView.actionView;

			expect( dropdownButton ).toBeInstanceOf( ButtonView );
			expect( dropdownButton.withText ).toBe( false );
			expect( dropdownButton.icon ).toEqual( IconImageAssetManager );
			expect( dropdownButton.label ).toEqual( 'Insert image with file manager' );
		} );

		it( 'should create CKBox button in dropdown panel', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			expect( buttonView ).toBeInstanceOf( ButtonView );
			expect( buttonView.withText ).toBe( true );
			expect( buttonView.icon ).toEqual( IconImageAssetManager );
			expect( buttonView.label ).toEqual( 'Insert with file manager' );
		} );

		it( 'should create CKBox button in menu bar', () => {
			mockAnotherIntegration();

			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
			const buttonView = submenu.panelView.children.first.items.first.children.first;

			expect( buttonView ).toBeInstanceOf( MenuBarMenuListItemButtonView );
			expect( buttonView.withText ).toBe( true );
			expect( buttonView.icon ).toEqual( IconImageAssetManager );
			expect( buttonView.label ).toEqual( 'With file manager' );
		} );

		it( 'should create CKBox button in menu bar - only integration', () => {
			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
			const buttonView = submenu.panelView.children.first.items.first.children.first;

			expect( buttonView ).toBeInstanceOf( MenuBarMenuListItemButtonView );
			expect( buttonView.withText ).toBe( true );
			expect( buttonView.icon ).toEqual( IconImageAssetManager );
			expect( buttonView.label ).toEqual( 'Image' );
		} );

		it( 'should bind to #isImageSelected', () => {
			const insertImageUI = editor.plugins.get( 'ImageInsertUI' );

			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const dropdownButton = dropdown.buttonView.actionView;
			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			insertImageUI.isImageSelected = false;
			expect( dropdownButton.label ).toEqual( 'Insert image with file manager' );
			expect( buttonView.label ).toEqual( 'Insert with file manager' );

			insertImageUI.isImageSelected = true;
			expect( dropdownButton.label ).toEqual( 'Replace image with file manager' );
			expect( buttonView.label ).toEqual( 'Replace with file manager' );
		} );

		it( 'should close dropdown on execute', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );

			buttonView.fire( 'execute' );

			expect( dropdown.isOpen ).toBe( false );
		} );
	} );

	function testButton( Component, label ) {
		it( 'should add the "ckbox" component to the factory if the "ckbox" command exists', () => {
			expect( button ).toBeInstanceOf( Component );
		} );

		it( 'should bind #isEnabled to the command', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( button.isEnabled ).toBe( false );
		} );

		it( 'should bind #isOn to the command', () => {
			command.value = true;
			expect( button.isOn ).toBe( true );

			command.value = false;
			expect( button.isOn ).toBe( false );
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).toEqual( label );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).toEqual( IconBrowseFiles );
		} );

		it( 'should execute the command afer firing the event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			command.on( 'ckbox', eventInfo => eventInfo.stop(), { priority: 'high' } );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( 'ckbox' );
		} );
	}

	function mockAnotherIntegration() {
		const insertImageUI = editor.plugins.get( 'ImageInsertUI' );
		const observable = new UIModel( { isEnabled: true } );

		insertImageUI.registerIntegration( {
			name: 'url',
			observable,
			buttonViewCreator() {
				const button = new ButtonView( editor.locale );

				button.label = 'foo';

				return button;
			},
			formViewCreator() {
				const button = new ButtonView( editor.locale );

				button.label = 'bar';

				return button;
			},
			menuBarButtonViewCreator() {
				const button = new ButtonView( editor.locale );

				button.label = 'bar';

				return button;
			}
		} );
	}
} );
