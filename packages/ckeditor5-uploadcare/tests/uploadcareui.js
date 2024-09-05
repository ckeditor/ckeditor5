/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ImageInsertUI from '@ckeditor/ckeditor5-image/src/imageinsert/imageinsertui.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { icons } from 'ckeditor5/src/core.js';
import dropboxIcon from '../theme/icons/dropbox.svg';
import facebookIcon from '../theme/icons/facebook.svg';
import googleDriveIcon from '../theme/icons/google-drive.svg';
import googlePhotosIcon from '../theme/icons/google-photos.svg';
import instagramIcon from '../theme/icons/instagram.svg';
import linkIcon from '../theme/icons/link.svg';
import oneDriveIcon from '../theme/icons/onedrive.svg';

import UploadcareUI from '../src/uploadcareui.js';
import UploadcareEditing from '../src/uploadcareediting.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'UploadcareUI', () => {
	let editorElement, editor, command;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should have proper name', async () => {
		editor = await createEditor();

		expect( UploadcareUI.pluginName ).to.equal( 'UploadcareUI' );
	} );

	describe( 'InsertImageUI integration', () => {
		testUploadcareButton( 'local', icons.imageUpload, 'Upload from computer', 'From computer' );
		testUploadcareButton( 'url', linkIcon, 'Insert via URL', 'Via URL' );
		testUploadcareButton( 'dropbox', dropboxIcon, 'Insert with Dropbox', 'With Dropbox' );
		testUploadcareButton( 'facebook', facebookIcon, 'Insert with Facebook', 'With Facebook' );
		testUploadcareButton( 'gdrive', googleDriveIcon, 'Insert with Google Drive', 'With Google Drive' );
		testUploadcareButton( 'gphotos', googlePhotosIcon, 'Insert with Google Photos', 'With Google Photos' );
		testUploadcareButton( 'instagram', instagramIcon, 'Insert with Instagram', 'With Instagram' );
		testUploadcareButton( 'onedrive', oneDriveIcon, 'Insert with OneDrive', 'With OneDrive' );

		it( 'should not register integration if the "uploadcare" command does not exist', async () => {
			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [
					ImageBlockEditing,
					ImageInlineEditing,
					ImageUploadEditing,
					ImageUploadProgress,
					CloudServices,
					UploadcareUI
				]
			} );

			expect( editor.ui.componentFactory.has( 'imageInsert' ) ).to.be.false;
			expect( editor.commands.get( 'uploadcare' ) ).to.be.undefined;
		} );

		it( 'should create Uploadcare buttons for multiple sources in dropdown panel', async () => {
			editor = await createEditor( {
				sourceList: [ 'local', 'url', 'dropbox', 'gdrive', 'facebook', 'gphotos', 'instagram', 'onedrive' ]
			} );

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonViews = formView.children;

			expect( buttonViews.length ).to.be.equal( 8 );
		} );

		it( 'should create Uploadcare buttons for multiple sources in menu bar', async () => {
			editor = await createEditor( {
				sourceList: [ 'local', 'url', 'dropbox', 'gdrive', 'facebook', 'gphotos', 'instagram', 'onedrive' ]
			} );

			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
			const listItemViews = submenu.panelView.children.first.items;

			expect( listItemViews.length ).to.be.equal( 8 );
		} );

		function testUploadcareButton( sourceType, expectedIcon, expectedLabel, expectedShortLabel ) {
			it( `should create Uploadcare button for ${ sourceType } in toolbar`, async () => {
				editor = await createEditor( { sourceList: [ sourceType ] } );
				command = editor.commands.get( 'uploadcare' );

				const executeStub = sinon.stub( command, 'execute' );
				const buttonView = editor.ui.componentFactory.create( 'imageInsert' );

				expect( buttonView ).to.be.instanceOf( ButtonView );
				expect( buttonView.withText ).to.be.false;
				expect( buttonView.icon ).to.equal( expectedIcon );
				expect( buttonView.label ).to.equal( expectedLabel );

				buttonView.fire( 'execute' );

				sinon.assert.calledOnce( executeStub );
				sinon.assert.calledWithExactly( executeStub, sourceType );
			} );

			it( `should create Uploadcare button for ${ sourceType } button in menu bar`, async () => {
				editor = await createEditor( { sourceList: [ sourceType ] } );
				command = editor.commands.get( 'uploadcare' );

				const executeStub = sinon.stub( command, 'execute' );
				const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
				const buttonView = submenu.panelView.children.first.items.first.children.first;

				expect( buttonView ).to.be.instanceOf( MenuBarMenuListItemButtonView );
				expect( buttonView.withText ).to.be.true;
				expect( buttonView.icon ).to.equal( expectedIcon );
				expect( buttonView.label ).to.equal( expectedShortLabel );

				buttonView.fire( 'execute' );

				sinon.assert.calledOnce( executeStub );
				sinon.assert.calledWithExactly( executeStub, sourceType );
			} );
		}
	} );

	async function createEditor( uploadcareProps = {} ) {
		return await ClassicTestEditor.create( editorElement, {
			plugins: [
				ImageBlockEditing,
				ImageInlineEditing,
				ImageUploadEditing,
				ImageUploadProgress,
				ImageInsertUI,
				CloudServices,
				UploadcareUI,
				UploadcareEditing
			],
			toolbar: [ 'uploadcare' ],
			uploadcare: {
				pubKey: 'KEY',
				sourceList: [ 'url' ],
				...uploadcareProps
			}
		} );
	}
} );
