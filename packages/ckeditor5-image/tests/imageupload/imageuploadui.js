/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '../../src/image';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import ImageUploadUI from '../../src/imageupload/imageuploadui';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import { createNativeFileMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageUploadUI', () => {
	let editor, model, editorElement, fileRepository;

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
				plugins: [ Paragraph, Image, ImageUploadEditing, ImageUploadUI, FileRepository, UploadAdapterPluginMock, Clipboard ]
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

	it( 'should register imageUpload dropdown', () => {
		const button = editor.ui.componentFactory.create( 'imageUpload' );

		expect( button ).to.be.instanceOf( DropdownView );
	} );

	it( 'should set proper accepted mime-types for imageUpload button as defined in configuration', () => {
		editor.config.set( 'image.upload.types', [ 'svg+xml', 'jpeg', 'vnd.microsoft.icon', 'x-xbitmap' ] );

		const plugin = editor.plugins.get( 'ImageUploadUI' );
		const fileDialogButton = plugin._createFileDialogButtonView( editor.locale );

		expect( fileDialogButton.acceptedType ).to.equal( 'image/svg+xml,image/jpeg,image/vnd.microsoft.icon,image/x-xbitmap' );
	} );

	it( 'should be disabled while ImageUploadCommand is disabled', () => {
		const button = editor.ui.componentFactory.create( 'imageUpload' );
		const command = editor.commands.get( 'imageUpload' );

		command.isEnabled = true;

		expect( button.buttonView.isEnabled ).to.true;

		command.isEnabled = false;

		expect( button.buttonView.isEnabled ).to.false;
	} );

	// ckeditor5-upload/#77
	it( 'should be properly bound with ImageUploadCommand', () => {
		const dropdown = editor.ui.componentFactory.create( 'imageUpload' );
		const command = editor.commands.get( 'imageUpload' );
		const spy = sinon.spy();

		dropdown.render();

		dropdown.buttonView.on( 'execute', spy );

		command.isEnabled = false;

		dropdown.buttonView.element.dispatchEvent( new Event( 'click' ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should execute imageUpload command', () => {
		const executeStub = sinon.stub( editor, 'execute' );
		const plugin = editor.plugins.get( 'ImageUploadUI' );
		const fileDialogButton = plugin._createFileDialogButtonView( editor.locale );
		const files = [ createNativeFileMock() ];

		fileDialogButton.fire( 'done', files );
		sinon.assert.calledOnce( executeStub );
		expect( executeStub.firstCall.args[ 0 ] ).to.equal( 'imageUpload' );
		expect( executeStub.firstCall.args[ 1 ].file ).to.deep.equal( files );
	} );

	it( 'should execute imageUpload command with multiple files', () => {
		const executeStub = sinon.stub( editor, 'execute' );
		const plugin = editor.plugins.get( 'ImageUploadUI' );
		const fileDialogButton = plugin._createFileDialogButtonView( editor.locale );
		const files = [ createNativeFileMock(), createNativeFileMock(), createNativeFileMock() ];

		fileDialogButton.fire( 'done', files );
		sinon.assert.calledOnce( executeStub );
		expect( executeStub.firstCall.args[ 0 ] ).to.equal( 'imageUpload' );
		expect( executeStub.firstCall.args[ 1 ].file ).to.deep.equal( files );
	} );

	it( 'should optimize the insertion position', () => {
		const plugin = editor.plugins.get( 'ImageUploadUI' );
		const fileDialogButton = plugin._createFileDialogButtonView( editor.locale );
		const files = [ createNativeFileMock() ];

		setModelData( model, '<paragraph>f[]oo</paragraph>' );

		fileDialogButton.fire( 'done', files );

		const id = fileRepository.getLoader( files[ 0 ] ).id;

		expect( getModelData( model ) ).to.equal(
			`[<image uploadId="${ id }" uploadStatus="reading"></image>]` +
			'<paragraph>foo</paragraph>'
		);
	} );

	it( 'should correctly insert multiple files', () => {
		const plugin = editor.plugins.get( 'ImageUploadUI' );
		const fileDialogButton = plugin._createFileDialogButtonView( editor.locale );
		const files = [ createNativeFileMock(), createNativeFileMock() ];

		setModelData( model, '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

		fileDialogButton.fire( 'done', files );

		const id1 = fileRepository.getLoader( files[ 0 ] ).id;
		const id2 = fileRepository.getLoader( files[ 1 ] ).id;

		expect( getModelData( model ) ).to.equal(
			'<paragraph>foo</paragraph>' +
			`<image uploadId="${ id1 }" uploadStatus="reading"></image>` +
			`[<image uploadId="${ id2 }" uploadStatus="reading"></image>]` +
			'<paragraph>bar</paragraph>'
		);
	} );

	it( 'should not execute imageUpload if the file is not an image', () => {
		const executeStub = sinon.stub( editor, 'execute' );
		const plugin = editor.plugins.get( 'ImageUploadUI' );
		const fileDialogButton = plugin._createFileDialogButtonView( editor.locale );
		const file = {
			type: 'media/mp3',
			size: 1024
		};

		fileDialogButton.fire( 'done', [ file ] );
		sinon.assert.notCalled( executeStub );
	} );

	it( 'should work even if the FileList does not support iterators', () => {
		const executeStub = sinon.stub( editor, 'execute' );
		const plugin = editor.plugins.get( 'ImageUploadUI' );
		const fileDialogButton = plugin._createFileDialogButtonView( editor.locale );
		const files = {
			0: createNativeFileMock(),
			length: 1
		};

		fileDialogButton.fire( 'done', files );
		sinon.assert.calledOnce( executeStub );
		expect( executeStub.firstCall.args[ 0 ] ).to.equal( 'imageUpload' );
		expect( executeStub.firstCall.args[ 1 ].file ).to.deep.equal( [ files[ 0 ] ] );
	} );

	describe( 'dropdown action button', () => {
		it( 'should be an instance of FileDialogButtonView', () => {
			const dropdown = editor.ui.componentFactory.create( 'imageUpload' );

			expect( dropdown.buttonView.actionView ).to.be.instanceOf( FileDialogButtonView );
		} );
	} );

	describe( 'dropdown panel buttons', () => {
		it( 'should have "Update" label on submit button when URL input is already filled', () => {
			const dropdown = editor.ui.componentFactory.create( 'imageUpload' );
			const viewDocument = editor.editing.view.document;

			editor.setData( '<figure><img src="image-url.png" /></figure>' );

			editor.editing.view.change( writer => {
				writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
			} );

			const img = viewDocument.selection.getSelectedElement();

			const data = fakeEventData();
			const eventInfo = new EventInfo( img, 'click' );
			const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

			viewDocument.fire( 'click', domEventDataMock );

			dropdown.isOpen = true;

			const inputValue = dropdown.panelView.children.first.imageURLInputValue;

			expect( dropdown.isOpen ).to.be.true;
			expect( inputValue ).to.equal( 'image-url.png' );
			expect( dropdown.panelView.children.first.insertButtonView.label ).to.equal( 'Update' );
		} );

		it( 'should have "Insert" label on submit button on uploading a new image', () => {
			const dropdown = editor.ui.componentFactory.create( 'imageUpload' );
			const viewDocument = editor.editing.view.document;

			editor.setData( '<p>test</p>' );

			editor.editing.view.change( writer => {
				writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'end' );
			} );

			const el = viewDocument.selection.getSelectedElement();

			const data = fakeEventData();
			const eventInfo = new EventInfo( el, 'click' );
			const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

			viewDocument.fire( 'click', domEventDataMock );

			dropdown.isOpen = true;

			const inputValue = dropdown.panelView.children.first.imageURLInputValue;

			expect( dropdown.isOpen ).to.be.true;
			expect( inputValue ).to.equal( '' );
			expect( dropdown.panelView.children.first.insertButtonView.label ).to.equal( 'Insert' );
		} );
	} );

	it( 'should remove all attributes from model except "src" when updating the image source URL', () => {
		const viewDocument = editor.editing.view.document;
		const dropdown = editor.ui.componentFactory.create( 'imageUpload' );
		const insertButtonView = dropdown.panelView.children.first.insertButtonView;
		const commandSpy = sinon.spy( editor.commands.get( 'imageInsert' ), 'execute' );
		const submitSpy = sinon.spy();

		dropdown.isOpen = true;

		editor.setData( '<figure><img src="image-url-800w.jpg"' +
			'srcset="image-url-480w.jpg 480w,image-url-800w.jpg 800w"' +
			'sizes="(max-width: 600px) 480px,800px"' +
			'alt="test-image"></figure>' );

		editor.editing.view.change( writer => {
			writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
		} );

		const selectedElement = editor.model.document.selection.getSelectedElement();

		expect( selectedElement.getAttribute( 'src' ) ).to.equal( 'image-url-800w.jpg' );
		expect( selectedElement.hasAttribute( 'srcset' ) ).to.be.true;

		dropdown.panelView.children.first.imageURLInputValue = 'new-url.png';

		dropdown.on( 'submit', submitSpy );

		insertButtonView.fire( 'execute' );

		sinon.assert.notCalled( commandSpy );
		sinon.assert.calledOnce( submitSpy );
		expect( dropdown.isOpen ).to.be.false;
		expect( selectedElement.getAttribute( 'src' ) ).to.equal( 'new-url.png' );
		expect( selectedElement.hasAttribute( 'srcset' ) ).to.be.false;
		expect( selectedElement.hasAttribute( 'sizes' ) ).to.be.false;
	} );

	describe( 'events', () => {
		it( 'should emit "submit" event when clicking on submit button', () => {
			const dropdown = editor.ui.componentFactory.create( 'imageUpload' );
			const insertButtonView = dropdown.panelView.children.first.insertButtonView;
			const commandSpy = sinon.spy( editor.commands.get( 'imageInsert' ), 'execute' );
			const submitSpy = sinon.spy();

			dropdown.isOpen = true;

			dropdown.on( 'submit', submitSpy );

			insertButtonView.fire( 'execute' );

			expect( dropdown.isOpen ).to.be.false;
			sinon.assert.calledOnce( commandSpy );
			sinon.assert.calledOnce( submitSpy );
		} );

		it( 'should emit "cancel" event when clicking on cancel button', () => {
			const dropdown = editor.ui.componentFactory.create( 'imageUpload' );
			const cancelButtonView = dropdown.panelView.children.first.cancelButtonView;
			const commandSpy = sinon.spy( editor.commands.get( 'imageInsert' ), 'execute' );
			const cancelSpy = sinon.spy();

			dropdown.isOpen = true;

			dropdown.on( 'cancel', cancelSpy );

			cancelButtonView.fire( 'execute' );

			expect( dropdown.isOpen ).to.be.false;
			sinon.assert.notCalled( commandSpy );
			sinon.assert.calledOnce( cancelSpy );
		} );
	} );

	it( 'should inject integrations to the dropdown panel view from the config', async () => {
		const editor = await ClassicEditor
			.create( editorElement, {
				plugins: [
					CKFinder,
					Paragraph,
					Image,
					ImageUploadEditing,
					ImageUploadUI,
					FileRepository,
					UploadAdapterPluginMock,
					Clipboard
				],
				image: {
					upload: {
						panel: {
							items: [
								'insertImageViaUrl',
								'openCKFinder'
							]
						}
					}
				}
			} );

		const dropdown = editor.ui.componentFactory.create( 'imageUpload' );

		expect( dropdown.panelView.children.first._integrations.length ).to.equal( 2 );
		expect( dropdown.panelView.children.first._integrations.first ).to.be.instanceOf( LabeledFieldView );
		expect( dropdown.panelView.children.first._integrations.last ).to.be.instanceOf( ButtonView );

		editor.destroy();
	} );
} );

function fakeEventData() {
	return {
		preventDefault: sinon.spy()
	};
}
