/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import CloudServicesCoreMock from './_utils/cloudservicescoremock.js';
import ImageInsertUI from '@ckeditor/ckeditor5-image/src/imageinsert/imageinsertui.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { IconImageAssetManager, IconBrowseFiles } from 'ckeditor5/src/icons.js';

import CKBoxUI from '../src/ckboxui.js';
import CKBoxEditing from '../src/ckboxediting.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'CKBoxUI', () => {
	let editorElement, editor, button, command, originalCKBox;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
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
			substitutePlugins: [
				CloudServicesCoreMock
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
		expect( CKBoxUI.pluginName ).to.equal( 'CKBoxUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxUI.isPremiumPlugin ).to.be.false;
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
			],
			substitutePlugins: [
				CloudServicesCoreMock
			]
		} );

		expect( editor.ui.componentFactory.has( 'ckbox' ) ).to.be.false;
		expect( editor.ui.componentFactory.has( 'menuBar:ckbox' ) ).to.be.false;
		expect( editor.commands.get( 'ckbox' ) ).to.be.undefined;

		editorElement.remove();

		await editor.destroy();
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'ckbox' );
		} );

		testButton( ButtonView, 'Open file manager' );

		it( 'should enable tooltips for the #buttonView', () => {
			expect( button.tooltip ).to.be.true;
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

			expect( dropdownButton ).to.be.instanceOf( ButtonView );
			expect( dropdownButton.withText ).to.be.false;
			expect( dropdownButton.icon ).to.equal( IconImageAssetManager );
			expect( dropdownButton.label ).to.equal( 'Insert image with file manager' );
		} );

		it( 'should create CKBox button in dropdown panel', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.withText ).to.be.true;
			expect( buttonView.icon ).to.equal( IconImageAssetManager );
			expect( buttonView.label ).to.equal( 'Insert with file manager' );
		} );

		it( 'should create CKBox button in menu bar', () => {
			mockAnotherIntegration();

			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
			const buttonView = submenu.panelView.children.first.items.first.children.first;

			expect( buttonView ).to.be.instanceOf( MenuBarMenuListItemButtonView );
			expect( buttonView.withText ).to.be.true;
			expect( buttonView.icon ).to.equal( IconImageAssetManager );
			expect( buttonView.label ).to.equal( 'With file manager' );
		} );

		it( 'should create CKBox button in menu bar - only integration', () => {
			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
			const buttonView = submenu.panelView.children.first.items.first.children.first;

			expect( buttonView ).to.be.instanceOf( MenuBarMenuListItemButtonView );
			expect( buttonView.withText ).to.be.true;
			expect( buttonView.icon ).to.equal( IconImageAssetManager );
			expect( buttonView.label ).to.equal( 'Image' );
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
			expect( dropdownButton.label ).to.equal( 'Insert image with file manager' );
			expect( buttonView.label ).to.equal( 'Insert with file manager' );

			insertImageUI.isImageSelected = true;
			expect( dropdownButton.label ).to.equal( 'Replace image with file manager' );
			expect( buttonView.label ).to.equal( 'Replace with file manager' );
		} );

		it( 'should close dropdown on execute', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			sinon.stub( editor, 'execute' );

			buttonView.fire( 'execute' );

			expect( dropdown.isOpen ).to.be.false;
		} );
	} );

	function testButton( Component, label ) {
		it( 'should add the "ckbox" component to the factory if the "ckbox" command exists', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should bind #isEnabled to the command', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should bind #isOn to the command', () => {
			command.value = true;
			expect( button.isOn ).to.be.true;

			command.value = false;
			expect( button.isOn ).to.be.false;
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).to.equal( label );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).to.equal( IconBrowseFiles );
		} );

		it( 'should execute the command afer firing the event', () => {
			const executeSpy = sinon.spy( editor, 'execute' );

			command.on( 'ckbox', eventInfo => eventInfo.stop(), { priority: 'high' } );

			button.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.be.true;
			expect( executeSpy.args[ 0 ][ 0 ] ).to.equal( 'ckbox' );
		} );
	}

	function mockAnotherIntegration() {
		const insertImageUI = editor.plugins.get( 'ImageInsertUI' );
		const observable = new Model( { isEnabled: true } );

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
