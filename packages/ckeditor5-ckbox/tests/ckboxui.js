/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, window */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import CloudServicesCoreMock from './_utils/cloudservicescoremock';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import CKBoxUI from '../src/ckboxui';
import CKBoxEditing from '../src/ckboxediting';
import browseFilesIcon from '../theme/icons/browse-files.svg';

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

	it( 'should add the "ckbox" component to the factory if the "ckbox" command exists', () => {
		expect( button ).to.be.instanceOf( ButtonView );
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
		expect( editor.commands.get( 'ckbox' ) ).to.be.undefined;

		editorElement.remove();

		await editor.destroy();
	} );

	describe( 'button', () => {
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
			expect( button.label ).to.equal( 'Open file manager' );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).to.equal( browseFilesIcon );
		} );

		it( 'should enable tooltips for the #buttonView', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should execute the command afer firing the event', () => {
			const executeSpy = sinon.spy( editor, 'execute' );

			command.on( 'ckbox', eventInfo => eventInfo.stop(), { priority: 'high' } );

			button.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.be.true;
			expect( executeSpy.args[ 0 ][ 0 ] ).to.equal( 'ckbox' );
		} );
	} );
} );
