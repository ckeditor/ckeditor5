/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Image from '../../src/image.js';
import FileDialogButtonView from '@ckeditor/ckeditor5-ui/src/button/filedialogbuttonview.js';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository.js';
import ImageUploadUI from '../../src/imageupload/imageuploadui.js';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import { icons } from 'ckeditor5/src/core.js';

import { createNativeFileMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { MenuBarMenuListItemButtonView, MenuBarMenuListItemFileDialogButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'ImageUploadUI', () => {
	let editor, model, editorElement, fileRepository, button;

	testUtils.createSinonSandbox();

	class UploadAdapterPluginMock extends Plugin {
		init() {
			fileRepository = this.editor.plugins.get( FileRepository );
			fileRepository.createUploadAdapter = loader => {
				return new UploadAdapterMock( loader );
			};
		}
	}

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Paragraph, Image, ImageUploadEditing, ImageUploadUI, FileRepository, UploadAdapterPluginMock, Clipboard ],
				image: {
					upload: {
						types: [ 'svg+xml', 'jpeg', 'vnd.microsoft.icon', 'x-xbitmap' ]
					}
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				// Hide all notifications (prevent alert() calls).
				const notification = editor.plugins.get( Notification );
				notification.on( 'show', evt => evt.stop() );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'toolbar button', () => {
		describe( 'uploadImage', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'uploadImage' );
			} );

			testButton( 'uploadImage', 'Upload image from computer', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).to.be.true;
			} );
		} );

		// Check backward compatibility.
		describe( 'imageUpload', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'imageUpload' );
			} );

			testButton( 'uploadImage', 'Upload image from computer', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).to.be.true;
			} );
		} );
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:uploadImage' );
		} );

		testButton( 'uploadImage', 'Image from computer', MenuBarMenuListItemFileDialogButtonView );
	} );

	describe( 'InsertImageUI toolbar integration', () => {
		it( 'should create FileDialogButtonView in split button dropdown button', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );
			const dropdownButton = dropdown.buttonView.actionView;

			expect( dropdownButton ).to.be.instanceOf( FileDialogButtonView );
			expect( dropdownButton.withText ).to.be.false;
			expect( dropdownButton.icon ).to.equal( icons.imageUpload );
		} );

		it( 'should create FileDialogButtonView in dropdown panel', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			expect( buttonView ).to.be.instanceOf( FileDialogButtonView );
			expect( buttonView.withText ).to.be.true;
			expect( buttonView.icon ).to.equal( icons.imageUpload );
		} );

		it( 'should bind to #isImageSelected and #isAccessAllowed', () => {
			const insertImageUI = editor.plugins.get( 'ImageInsertUI' );
			const uploadImageCommand = editor.commands.get( 'uploadImage' );

			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const dropdownButton = dropdown.buttonView.actionView;
			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			insertImageUI.isImageSelected = false;
			expect( dropdownButton.label ).to.equal( 'Upload image from computer' );
			expect( buttonView.label ).to.equal( 'Upload from computer' );

			insertImageUI.isImageSelected = true;
			expect( dropdownButton.label ).to.equal( 'Replace image from computer' );
			expect( buttonView.label ).to.equal( 'Replace from computer' );

			uploadImageCommand.isAccessAllowed = false;
			expect( dropdownButton.label ).to.equal( 'No permission to upload from computer. ' +
				'Try using the file manager or contact your administrator.' );
			expect( buttonView.label ).to.equal( 'Replace from computer' );

			insertImageUI.isImageSelected = false;
			uploadImageCommand.isAccessAllowed = false;
			expect( dropdownButton.label ).to.equal( 'No permission to upload from computer. ' +
				'Try using the file manager or contact your administrator.' );
			expect( buttonView.label ).to.equal( 'Upload from computer' );
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

	describe( 'InsertImageUI menu bar integration', () => {
		it( 'should create FileDialogButtonView in insert image submenu', () => {
			mockAnotherIntegration();

			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );

			button = submenu.panelView.children.first.items.first.children.first;

			expect( button ).to.be.instanceOf( MenuBarMenuListItemFileDialogButtonView );
			expect( button.withText ).to.be.true;
			expect( button.icon ).to.equal( icons.imageUpload );
			expect( button.label ).to.equal( 'From computer' );
		} );

		it( 'should create FileDialogButtonView in insert image submenu - only integration', () => {
			button = editor.ui.componentFactory.create( 'menuBar:insertImage' );

			expect( button ).to.be.instanceOf( MenuBarMenuListItemFileDialogButtonView );
			expect( button.withText ).to.be.true;
			expect( button.icon ).to.equal( icons.imageUpload );
			expect( button.label ).to.equal( 'Image' );
		} );
	} );

	function mockAnotherIntegration() {
		const insertImageUI = editor.plugins.get( 'ImageInsertUI' );
		const observable = new Model( { isEnabled: true } );

		insertImageUI.registerIntegration( {
			name: 'assetManager',
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
				const button = new MenuBarMenuListItemButtonView( editor.locale );

				button.label = 'menu foo';

				return button;
			}
		} );
	}

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
			expect( button.allowMultipleFiles ).to.equal( true );
			expect( button.icon ).to.equal( icons.imageUpload );
		} );

		it( 'should set proper accepted mime-types for uploadImage button as defined in configuration', () => {
			expect( button.acceptedType ).to.equal( 'image/svg+xml,image/jpeg,image/vnd.microsoft.icon,image/x-xbitmap' );
		} );

		it( `should bind #isEnabled to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).to.be.false;

			const initState = command.isEnabled;
			expect( button.isEnabled ).to.equal( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).to.equal( !initState );
		} );

		// ckeditor5-upload/#77
		it( 'should be properly bound with UploadImageCommand', () => {
			const command = editor.commands.get( 'uploadImage' );
			const spy = sinon.spy();

			button.render();

			button.on( 'execute', spy );

			command.isEnabled = false;

			button.element.dispatchEvent( new Event( 'click' ) );

			sinon.assert.notCalled( spy );
		} );

		it( 'should execute uploadImage command', () => {
			const executeStub = sinon.stub( editor, 'execute' );
			const files = [ createNativeFileMock() ];

			button.fire( 'done', files );
			sinon.assert.calledOnce( executeStub );
			expect( executeStub.firstCall.args[ 0 ] ).to.equal( 'uploadImage' );
			expect( executeStub.firstCall.args[ 1 ].file ).to.deep.equal( files );
		} );

		it( 'should execute uploadImage command with multiple files', () => {
			const executeStub = sinon.stub( editor, 'execute' );
			const files = [ createNativeFileMock(), createNativeFileMock(), createNativeFileMock() ];

			button.fire( 'done', files );
			sinon.assert.calledOnce( executeStub );
			expect( executeStub.firstCall.args[ 0 ] ).to.equal( 'uploadImage' );
			expect( executeStub.firstCall.args[ 1 ].file ).to.deep.equal( files );
		} );

		it( 'should optimize the insertion position', () => {
			const files = [ createNativeFileMock() ];

			setModelData( model, '<paragraph>f[]oo</paragraph>' );

			button.fire( 'done', files );

			const id = fileRepository.getLoader( files[ 0 ] ).id;

			expect( getModelData( model ) ).to.equal(
				`[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]` +
			'<paragraph>foo</paragraph>'
			);
		} );

		it( 'should correctly insert multiple files', () => {
			const files = [ createNativeFileMock(), createNativeFileMock() ];

			setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			button.fire( 'done', files );

			const id1 = fileRepository.getLoader( files[ 0 ] ).id;
			const id2 = fileRepository.getLoader( files[ 1 ] ).id;

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
			`<imageBlock uploadId="${ id1 }" uploadStatus="reading"></imageBlock>` +
			`[<imageBlock uploadId="${ id2 }" uploadStatus="reading"></imageBlock>]` +
			'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should not execute uploadImage if the file is not an image', () => {
			const executeStub = sinon.stub( editor, 'execute' );
			const file = {
				type: 'media/mp3',
				size: 1024
			};

			button.fire( 'done', [ file ] );
			sinon.assert.notCalled( executeStub );
		} );

		it( 'should work even if the FileList does not support iterators', () => {
			const executeStub = sinon.stub( editor, 'execute' );
			const files = {
				0: createNativeFileMock(),
				length: 1
			};

			button.fire( 'done', files );
			sinon.assert.calledOnce( executeStub );
			expect( executeStub.firstCall.args[ 0 ] ).to.equal( 'uploadImage' );
			expect( executeStub.firstCall.args[ 1 ].file ).to.deep.equal( [ files[ 0 ] ] );
		} );

		it( 'should move focus to editable after executing the command', () => {
			const spy = sinon.spy( editor.editing.view, 'focus' );
			const file = [ createNativeFileMock() ];

			setModelData( model, '<paragraph>f[]oo</paragraph>' );

			button.fire( 'done', file );

			expect( spy ).to.be.calledOnce;
		} );
	}
} );
