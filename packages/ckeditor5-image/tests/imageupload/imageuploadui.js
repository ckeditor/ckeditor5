/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Plugin } from '@ckeditor/ckeditor5-core';
import { Image } from '../../src/image.js';
import {
	FileDialogButtonView,
	Notification,
	ButtonView,
	UIModel,
	MenuBarMenuListItemButtonView,
	MenuBarMenuListItemFileDialogButtonView
} from '@ckeditor/ckeditor5-ui';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import { ImageInlineEditing } from '../../src/image/imageinlineediting.js';
import { ImageUploadUI } from '../../src/imageupload/imageuploadui.js';
import { ImageUploadEditing } from '../../src/imageupload/imageuploadediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { IconImageUpload } from '@ckeditor/ckeditor5-icons';

import { createNativeFileMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

describe( 'ImageUploadUI', () => {
	let editor, model, editorElement, fileRepository, button;

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageUploadUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageUploadUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		describe( 'uploadImage', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'uploadImage' );
			} );

			testButton( 'uploadImage', 'Upload image from computer', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).toBe( true );
			} );
		} );

		// Check backward compatibility.
		describe( 'imageUpload', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'imageUpload' );
			} );

			testButton( 'uploadImage', 'Upload image from computer', ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).toBe( true );
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

			expect( dropdownButton ).toBeInstanceOf( FileDialogButtonView );
			expect( dropdownButton.withText ).toBe( false );
			expect( dropdownButton.icon ).toBe( IconImageUpload );
		} );

		it( 'should create FileDialogButtonView in dropdown panel', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			expect( buttonView ).toBeInstanceOf( FileDialogButtonView );
			expect( buttonView.withText ).toBe( true );
			expect( buttonView.icon ).toBe( IconImageUpload );
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
			expect( dropdownButton.label ).toBe( 'Upload image from computer' );
			expect( buttonView.label ).toBe( 'Upload from computer' );

			insertImageUI.isImageSelected = true;
			expect( dropdownButton.label ).toBe( 'Replace image from computer' );
			expect( buttonView.label ).toBe( 'Replace from computer' );

			uploadImageCommand.isAccessAllowed = false;
			expect( dropdownButton.label ).toBe( 'You have no image upload permissions.' );
			expect( buttonView.label ).toBe( 'Replace from computer' );

			insertImageUI.isImageSelected = false;
			uploadImageCommand.isAccessAllowed = false;
			expect( dropdownButton.label ).toBe( 'You have no image upload permissions.' );
			expect( buttonView.label ).toBe( 'Upload from computer' );
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

	describe( 'InsertImageUI menu bar integration', () => {
		it( 'should create FileDialogButtonView in insert image submenu', () => {
			mockAnotherIntegration();

			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );

			button = submenu.panelView.children.first.items.first.children.first;

			expect( button ).toBeInstanceOf( MenuBarMenuListItemFileDialogButtonView );
			expect( button.withText ).toBe( true );
			expect( button.icon ).toBe( IconImageUpload );
			expect( button.label ).toBe( 'From computer' );
		} );

		it( 'should create FileDialogButtonView in insert image submenu - only integration', () => {
			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );

			button = submenu.panelView.children.first.items.first.children.first;

			expect( button ).toBeInstanceOf( MenuBarMenuListItemFileDialogButtonView );
			expect( button.withText ).toBe( true );
			expect( button.icon ).toBe( IconImageUpload );
			expect( button.label ).toBe( 'Image' );
		} );
	} );

	describe( 'without ImageInsertUI', () => {
		let editorWithoutInsertUI, editorElementWithoutInsertUI;

		class UploadAdapterPluginMockLocal extends Plugin {
			init() {
				const fileRepo = this.editor.plugins.get( FileRepository );
				fileRepo.createUploadAdapter = loaderInstance => new UploadAdapterMock( loaderInstance );
			}
		}

		beforeEach( () => {
			editorElementWithoutInsertUI = document.createElement( 'div' );
			document.body.appendChild( editorElementWithoutInsertUI );

			return ClassicEditor
				.create( editorElementWithoutInsertUI, {
					// Use only the editing layer plugins — ImageInlineEditing does NOT pull in ImageInsertUI.
					plugins: [ Paragraph, ImageInlineEditing, ImageUploadEditing, ImageUploadUI, FileRepository,
						UploadAdapterPluginMockLocal, Clipboard ]
				} )
				.then( newEditor => {
					editorWithoutInsertUI = newEditor;
				} );
		} );

		afterEach( () => {
			editorElementWithoutInsertUI.remove();

			return editorWithoutInsertUI.destroy();
		} );

		it( 'should register the uploadImage button in the component factory even when ImageInsertUI is not loaded', () => {
			expect( editorWithoutInsertUI.plugins.has( 'ImageInsertUI' ) ).toBe( false );
			expect( editorWithoutInsertUI.ui.componentFactory.has( 'uploadImage' ) ).toBe( true );
			expect( editorWithoutInsertUI.ui.componentFactory.has( 'imageUpload' ) ).toBe( true );
		} );
	} );

	function mockAnotherIntegration() {
		const insertImageUI = editor.plugins.get( 'ImageInsertUI' );
		const observable = new UIModel( { isEnabled: true } );

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
			expect( button ).toBeInstanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).toBe( false );
			expect( button.label ).toBe( label );
			expect( button.allowMultipleFiles ).toBe( true );
			expect( button.icon ).toBe( IconImageUpload );
		} );

		it( 'should set proper accepted mime-types for uploadImage button as defined in configuration', () => {
			expect( button.acceptedType ).toBe( 'image/svg+xml,image/jpeg,image/vnd.microsoft.icon,image/x-xbitmap' );
		} );

		it( `should bind #isEnabled to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).toBe( false );

			const initState = command.isEnabled;
			expect( button.isEnabled ).toBe( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).toBe( !initState );
		} );

		// ckeditor5-upload/#77
		it( 'should be properly bound with UploadImageCommand', () => {
			const command = editor.commands.get( 'uploadImage' );
			const spy = vi.fn();

			button.render();

			button.on( 'execute', spy );

			command.isEnabled = false;

			button.element.dispatchEvent( new Event( 'click' ) );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should execute uploadImage command', () => {
			const executeStub = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const files = [ createNativeFileMock() ];

			button.fire( 'done', files );
			expect( executeStub ).toHaveBeenCalledTimes( 1 );
			expect( executeStub.mock.calls[ 0 ][ 0 ] ).toBe( 'uploadImage' );
			expect( executeStub.mock.calls[ 0 ][ 1 ].file ).toEqual( files );
		} );

		it( 'should execute uploadImage command with multiple files', () => {
			const executeStub = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const files = [ createNativeFileMock(), createNativeFileMock(), createNativeFileMock() ];

			button.fire( 'done', files );
			expect( executeStub ).toHaveBeenCalledTimes( 1 );
			expect( executeStub.mock.calls[ 0 ][ 0 ] ).toBe( 'uploadImage' );
			expect( executeStub.mock.calls[ 0 ][ 1 ].file ).toEqual( files );
		} );

		it( 'should optimize the insertion position', () => {
			const files = [ createNativeFileMock() ];

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			button.fire( 'done', files );

			const id = fileRepository.getLoader( files[ 0 ] ).id;

			expect( _getModelData( model ) ).toBe(
				`[<imageBlock uploadId="${ id }" uploadStatus="reading"></imageBlock>]` +
			'<paragraph>foo</paragraph>'
			);
		} );

		it( 'should correctly insert multiple files', () => {
			const files = [ createNativeFileMock(), createNativeFileMock() ];

			_setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			button.fire( 'done', files );

			const id1 = fileRepository.getLoader( files[ 0 ] ).id;
			const id2 = fileRepository.getLoader( files[ 1 ] ).id;

			expect( _getModelData( model ) ).toBe(
				'<paragraph>foo</paragraph>' +
			`<imageBlock uploadId="${ id1 }" uploadStatus="reading"></imageBlock>` +
			`[<imageBlock uploadId="${ id2 }" uploadStatus="reading"></imageBlock>]` +
			'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should not execute uploadImage if the file is not an image', () => {
			const executeStub = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const file = {
				type: 'media/mp3',
				size: 1024
			};

			button.fire( 'done', [ file ] );
			expect( executeStub ).not.toHaveBeenCalled();
		} );

		it( 'should work even if the FileList does not support iterators', () => {
			const executeStub = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const files = {
				0: createNativeFileMock(),
				length: 1
			};

			button.fire( 'done', files );
			expect( executeStub ).toHaveBeenCalledTimes( 1 );
			expect( executeStub.mock.calls[ 0 ][ 0 ] ).toBe( 'uploadImage' );
			expect( executeStub.mock.calls[ 0 ][ 1 ].file ).toEqual( [ files[ 0 ] ] );
		} );

		it( 'should move focus to editable after executing the command', () => {
			const spy = vi.spyOn( editor.editing.view, 'focus' );
			const file = [ createNativeFileMock() ];

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			button.fire( 'done', file );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	}
} );
