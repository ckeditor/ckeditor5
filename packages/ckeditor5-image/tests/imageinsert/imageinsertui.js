/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '../../src/image';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import ImageInsert from '../../src/imageinsert';
import ImageInsertViaUrl from '../../src/imageinsertviaurl';
import ImageInsertUI from '../../src/imageinsert/imageinsertui';
import ImageInsertPanelView from '../../src/imageinsert/ui/imageinsertpanelview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import DropdownButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/dropdownbuttonview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';

import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Link from '@ckeditor/ckeditor5-link/src/link';

describe( 'ImageInsertUI', () => {
	let editor, editorElement, fileRepository, dropdown;

	describe( 'dropdown (with uploadImage command)', () => {
		class UploadAdapterPluginMock extends Plugin {
			init() {
				fileRepository = this.editor.plugins.get( FileRepository );
				fileRepository.createUploadAdapter = loader => {
					return new UploadAdapterMock( loader );
				};
			}
		}

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicEditor.create( editorElement, {
				plugins: [ Paragraph, Image, ImageInsert, FileRepository, UploadAdapterPluginMock, Clipboard ],
				toolbar: [ 'insertImage' ],
				image: {
					insert: {
						integrations: [
							'insertImageViaUrl'
						]
					}
				}
			} );

			dropdown = editor.ui.view.toolbar.children.first.children.first;

			// Hide all notifications (prevent alert() calls).
			const notification = editor.plugins.get( Notification );
			notification.on( 'show', evt => evt.stop() );
		} );

		afterEach( async () => {
			editorElement.remove();

			await editor.destroy();
		} );

		it( 'should register the "insertImage" dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).to.be.instanceOf( DropdownView );
		} );

		it( 'should make the "insertImage" dropdown accessible via the property of the plugin', () => {
			expect( editor.plugins.get( 'ImageInsertUI' ).dropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'should register "imageInsert" dropdown as an alias for the "insertImage" dropdown', () => {
			const dropdownCreator = editor.ui.componentFactory._components.get( 'insertImage'.toLowerCase() );
			const dropdownAliasCreator = editor.ui.componentFactory._components.get( 'imageInsert'.toLowerCase() );

			expect( dropdownCreator.callback ).to.equal( dropdownAliasCreator.callback );
		} );

		it( 'should register the "insertImage" dropdown with basic properties', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );
			const dropdownButtonView = dropdown.buttonView;

			expect( dropdownButtonView ).to.have.property( 'label', 'Insert image' );
			expect( dropdownButtonView ).to.have.property( 'icon' );
			expect( dropdownButtonView ).to.have.property( 'tooltip', true );
		} );

		it( 'should bind the enabled state of the dropdown to the UploadImageCommand command', () => {
			const command = editor.commands.get( 'uploadImage' );

			expect( command.isEnabled, 'command state' ).to.be.true;
			expect( dropdown.isEnabled, 'dropdown state #1' ).to.be.true;

			command.forceDisabled( 'foo' );

			expect( dropdown.isEnabled, 'dropdown state #2' ).to.be.false;
		} );

		it( 'should insert panel view children on first dropdown open', () => {
			expect( dropdown.panelView.children.length ).to.equal( 0 );

			dropdown.isOpen = true;

			expect( dropdown.panelView.children.length ).to.equal( 1 );
			expect( dropdown.panelView.children.first ).to.be.instanceOf( ImageInsertPanelView );

			dropdown.isOpen = false;
			dropdown.isOpen = true;

			// Make sure it happens only once.
			expect( dropdown.panelView.children.length ).to.equal( 1 );
			expect( dropdown.panelView.children.first ).to.be.instanceOf( ImageInsertPanelView );
		} );

		describe( 'dropdown action button', () => {
			it( 'should belong to a split button', () => {
				expect( dropdown.buttonView ).to.be.instanceOf( SplitButtonView );
			} );

			it( 'should be an instance of FileDialogButtonView', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown.buttonView.actionView ).to.be.instanceOf( FileDialogButtonView );
			} );
		} );

		describe( 'dropdown panel buttons', () => {
			it( 'should have "Update" label on submit button when URL input is already filled', () => {
				const viewDocument = editor.editing.view.document;

				editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

				editor.editing.view.change( writer => {
					writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
				} );

				const img = viewDocument.selection.getSelectedElement();

				const data = fakeEventData();
				const eventInfo = new EventInfo( img, 'click' );
				const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

				viewDocument.fire( 'click', domEventDataMock );

				dropdown.buttonView.fire( 'open' );

				const inputValue = dropdown.panelView.children.first.imageURLInputValue;

				expect( inputValue ).to.equal( '/assets/sample.png' );
				expect( dropdown.panelView.children.first.insertButtonView.label ).to.equal( 'Update' );
			} );

			it( 'should have "Insert" label on submit button on uploading a new image', () => {
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

				dropdown.buttonView.fire( 'open' );

				const inputValue = dropdown.panelView.children.first.imageURLInputValue;

				expect( dropdown.isOpen ).to.be.true;
				expect( inputValue ).to.equal( '' );
				expect( dropdown.panelView.children.first.insertButtonView.label ).to.equal( 'Insert' );
			} );
		} );

		describe( 'dropdown panel integrations', () => {
			describe( 'insert image via URL form', () => {
				it( 'should have "Insert image via URL" label on inserting new image', () => {
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

					dropdown.buttonView.fire( 'open' );

					const inputValue = dropdown.panelView.children.first.imageURLInputValue;

					const insertImageViaUrlForm = dropdown.panelView.children.first.getIntegration( 'insertImageViaUrl' );

					expect( dropdown.isOpen ).to.be.true;
					expect( inputValue ).to.equal( '' );
					expect( insertImageViaUrlForm.label ).to.equal( 'Insert image via URL' );
				} );

				it( 'should have "Update image URL" label on updating the image source URL', () => {
					const viewDocument = editor.editing.view.document;

					editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

					editor.editing.view.change( writer => {
						writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
					} );

					const el = viewDocument.selection.getSelectedElement();

					const data = fakeEventData();
					const eventInfo = new EventInfo( el, 'click' );
					const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

					viewDocument.fire( 'click', domEventDataMock );

					dropdown.buttonView.fire( 'open' );

					const inputValue = dropdown.panelView.children.first.imageURLInputValue;
					const insertImageViaUrlForm = dropdown.panelView.children.first.getIntegration( 'insertImageViaUrl' );

					expect( dropdown.isOpen ).to.be.true;
					expect( inputValue ).to.equal( '/assets/sample.png' );
					expect( insertImageViaUrlForm.label ).to.equal( 'Update image URL' );
				} );
			} );
		} );

		it( 'should remove all attributes from model except "src" when updating the image source URL', () => {
			const viewDocument = editor.editing.view.document;
			const commandSpy = sinon.spy( editor.commands.get( 'insertImage' ), 'execute' );
			const submitSpy = sinon.spy();

			dropdown.buttonView.fire( 'open' );

			const insertButtonView = dropdown.panelView.children.first.insertButtonView;

			editor.setData( '<figure class="image"><img src="image-url-800w.jpg"' +
			'srcset="image-url-480w.jpg 480w,image-url-800w.jpg 800w"' +
			'sizes="(max-width: 600px) 480px,800px"' +
			'alt="test-image"></figure>' );

			editor.editing.view.change( writer => {
				writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
			} );

			const selectedElement = editor.model.document.selection.getSelectedElement();

			expect( selectedElement.getAttribute( 'src' ) ).to.equal( 'image-url-800w.jpg' );
			expect( selectedElement.hasAttribute( 'srcset' ) ).to.be.true;

			dropdown.panelView.children.first.imageURLInputValue = '/assets/sample3.png';

			dropdown.on( 'submit', submitSpy );

			insertButtonView.fire( 'execute' );

			sinon.assert.notCalled( commandSpy );
			sinon.assert.calledOnce( submitSpy );
			expect( dropdown.isOpen ).to.be.false;
			expect( selectedElement.getAttribute( 'src' ) ).to.equal( '/assets/sample3.png' );
			expect( selectedElement.hasAttribute( 'srcset' ) ).to.be.false;
			expect( selectedElement.hasAttribute( 'sizes' ) ).to.be.false;
		} );

		describe( 'events', () => {
			it( 'should emit "submit" event when clicking on submit button', () => {
				const commandSpy = sinon.spy( editor.commands.get( 'insertImage' ), 'execute' );
				const submitSpy = sinon.spy();

				dropdown.buttonView.fire( 'open' );

				dropdown.on( 'submit', submitSpy );

				const insertButtonView = dropdown.panelView.children.first.insertButtonView;

				insertButtonView.fire( 'execute' );

				expect( dropdown.isOpen ).to.be.false;
				sinon.assert.calledOnce( commandSpy );
				sinon.assert.calledOnce( submitSpy );
			} );

			it( 'should emit "cancel" event when clicking on cancel button', () => {
				const commandSpy = sinon.spy( editor.commands.get( 'insertImage' ), 'execute' );
				const cancelSpy = sinon.spy();

				dropdown.buttonView.fire( 'open' );

				dropdown.on( 'cancel', cancelSpy );

				const cancelButtonView = dropdown.panelView.children.first.cancelButtonView;

				cancelButtonView.fire( 'execute' );

				expect( dropdown.isOpen ).to.be.false;
				sinon.assert.notCalled( commandSpy );
				sinon.assert.calledOnce( cancelSpy );
			} );

			it( 'should focus on "insert image via URL" input after opening', () => {
				let spy;

				// The ImageInsertPanelView is added on first open.
				// See https://github.com/ckeditor/ckeditor5/pull/8019#discussion_r484069652
				dropdown.on( 'change:isOpen', () => {
					const imageInsertPanelView = dropdown.panelView.children.first;
					spy = sinon.spy( imageInsertPanelView, 'focus' );
				} );

				dropdown.buttonView.fire( 'open' );
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'should inject integrations to the dropdown panel view from the config', async () => {
			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Link,
						Image,
						CKFinderUploadAdapter,
						CKFinder,
						Paragraph,
						ImageInsert,
						ImageInsertUI,
						FileRepository,
						UploadAdapterPluginMock,
						Clipboard
					],
					image: {
						insert: {
							integrations: [
								'insertImageViaUrl',
								'openCKFinder'
							]
						}
					}
				} );

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			expect( dropdown.panelView.children.first._integrations.length ).to.equal( 2 );
			expect( dropdown.panelView.children.first._integrations.first ).to.be.instanceOf( LabeledFieldView );
			expect( dropdown.panelView.children.first._integrations.last ).to.be.instanceOf( ButtonView );

			editor.destroy();
		} );
	} );

	describe( 'dropdown (without uploadImage command)', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicEditor.create( editorElement, {
				plugins: [ Paragraph, Image, ImageInsertViaUrl ],
				toolbar: [ 'insertImage' ]
			} );

			dropdown = editor.ui.view.toolbar.children.first.children.first;
		} );

		afterEach( async () => {
			editorElement.remove();

			await editor.destroy();
		} );

		it( 'should register the "insertImage" dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).to.be.instanceOf( DropdownView );
		} );

		it( 'should make the "insertImage" dropdown accessible via the property of the plugin', () => {
			expect( editor.plugins.get( 'ImageInsertUI' ).dropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'should register "imageInsert" dropdown as an alias for the "insertImage" dropdown', () => {
			const dropdownCreator = editor.ui.componentFactory._components.get( 'insertImage'.toLowerCase() );
			const dropdownAliasCreator = editor.ui.componentFactory._components.get( 'imageInsert'.toLowerCase() );

			expect( dropdownCreator.callback ).to.equal( dropdownAliasCreator.callback );
		} );

		it( 'should bind the enabled state of the dropdown to the InsertImageCommand command', () => {
			const command = editor.commands.get( 'insertImage' );

			expect( command.isEnabled, 'command state' ).to.be.true;
			expect( dropdown.isEnabled, 'dropdown state #1' ).to.be.true;

			command.forceDisabled( 'foo' );

			expect( dropdown.isEnabled, 'dropdown state #2' ).to.be.false;
		} );

		it( 'should not insert panel view children until dropdown is not open for the first time', () => {
			expect( dropdown.panelView.children.length ).to.equal( 0 );

			dropdown.buttonView.fire( 'open' );

			expect( dropdown.panelView.children.length ).to.equal( 1 );
			expect( dropdown.panelView.children.first ).to.be.instanceOf( ImageInsertPanelView );
		} );

		describe( 'dropdown button', () => {
			it( 'should be an instance of DropdownButtonView', () => {
				expect( dropdown.buttonView ).to.be.instanceOf( DropdownButtonView );
			} );
		} );

		describe( 'dropdown panel buttons', () => {
			it( 'should have "Update" label on submit button when URL input is already filled', () => {
				const viewDocument = editor.editing.view.document;

				editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

				editor.editing.view.change( writer => {
					writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
				} );

				const img = viewDocument.selection.getSelectedElement();

				const data = fakeEventData();
				const eventInfo = new EventInfo( img, 'click' );
				const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

				viewDocument.fire( 'click', domEventDataMock );

				dropdown.buttonView.fire( 'open' );

				const inputValue = dropdown.panelView.children.first.imageURLInputValue;

				expect( inputValue ).to.equal( '/assets/sample.png' );
				expect( dropdown.panelView.children.first.insertButtonView.label ).to.equal( 'Update' );
			} );

			it( 'should have "Insert" label on submit button on uploading a new image', () => {
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

				dropdown.buttonView.fire( 'open' );

				const inputValue = dropdown.panelView.children.first.imageURLInputValue;

				expect( dropdown.isOpen ).to.be.true;
				expect( inputValue ).to.equal( '' );
				expect( dropdown.panelView.children.first.insertButtonView.label ).to.equal( 'Insert' );
			} );
		} );

		describe( 'dropdown panel integrations', () => {
			describe( 'insert image via URL form', () => {
				it( 'should have "Insert image via URL" label on inserting new image', () => {
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

					dropdown.buttonView.fire( 'open' );

					const inputValue = dropdown.panelView.children.first.imageURLInputValue;

					const insertImageViaUrlForm = dropdown.panelView.children.first.getIntegration( 'insertImageViaUrl' );

					expect( dropdown.isOpen ).to.be.true;
					expect( inputValue ).to.equal( '' );
					expect( insertImageViaUrlForm.label ).to.equal( 'Insert image via URL' );
				} );

				it( 'should have "Update image URL" label on updating the image source URL', () => {
					const viewDocument = editor.editing.view.document;

					editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

					editor.editing.view.change( writer => {
						writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
					} );

					const el = viewDocument.selection.getSelectedElement();

					const data = fakeEventData();
					const eventInfo = new EventInfo( el, 'click' );
					const domEventDataMock = new DomEventData( viewDocument, eventInfo, data );

					viewDocument.fire( 'click', domEventDataMock );

					dropdown.buttonView.fire( 'open' );

					const inputValue = dropdown.panelView.children.first.imageURLInputValue;
					const insertImageViaUrlForm = dropdown.panelView.children.first.getIntegration( 'insertImageViaUrl' );

					expect( dropdown.isOpen ).to.be.true;
					expect( inputValue ).to.equal( '/assets/sample.png' );
					expect( insertImageViaUrlForm.label ).to.equal( 'Update image URL' );
				} );
			} );
		} );

		it( 'should remove all attributes from model except "src" when updating the image source URL', () => {
			const viewDocument = editor.editing.view.document;
			const commandSpy = sinon.spy( editor.commands.get( 'insertImage' ), 'execute' );
			const submitSpy = sinon.spy();

			dropdown.buttonView.fire( 'open' );

			const insertButtonView = dropdown.panelView.children.first.insertButtonView;

			editor.setData( '<figure class="image"><img src="image-url-800w.jpg"' +
			'srcset="image-url-480w.jpg 480w,image-url-800w.jpg 800w"' +
			'sizes="(max-width: 600px) 480px,800px"' +
			'alt="test-image"></figure>' );

			editor.editing.view.change( writer => {
				writer.setSelection( viewDocument.getRoot().getChild( 0 ), 'on' );
			} );

			const selectedElement = editor.model.document.selection.getSelectedElement();

			expect( selectedElement.getAttribute( 'src' ) ).to.equal( 'image-url-800w.jpg' );
			expect( selectedElement.hasAttribute( 'srcset' ) ).to.be.true;

			dropdown.panelView.children.first.imageURLInputValue = '/assets/sample3.png';

			dropdown.on( 'submit', submitSpy );

			insertButtonView.fire( 'execute' );

			sinon.assert.notCalled( commandSpy );
			sinon.assert.calledOnce( submitSpy );
			expect( dropdown.isOpen ).to.be.false;
			expect( selectedElement.getAttribute( 'src' ) ).to.equal( '/assets/sample3.png' );
			expect( selectedElement.hasAttribute( 'srcset' ) ).to.be.false;
			expect( selectedElement.hasAttribute( 'sizes' ) ).to.be.false;
		} );

		describe( 'events', () => {
			it( 'should emit "submit" event when clicking on submit button', () => {
				const commandSpy = sinon.spy( editor.commands.get( 'insertImage' ), 'execute' );
				const submitSpy = sinon.spy();

				dropdown.buttonView.fire( 'open' );

				dropdown.on( 'submit', submitSpy );

				const insertButtonView = dropdown.panelView.children.first.insertButtonView;

				insertButtonView.fire( 'execute' );

				expect( dropdown.isOpen ).to.be.false;
				sinon.assert.calledOnce( commandSpy );
				sinon.assert.calledOnce( submitSpy );
			} );

			it( 'should emit "cancel" event when clicking on cancel button', () => {
				const commandSpy = sinon.spy( editor.commands.get( 'insertImage' ), 'execute' );
				const cancelSpy = sinon.spy();

				dropdown.buttonView.fire( 'open' );

				dropdown.on( 'cancel', cancelSpy );

				const cancelButtonView = dropdown.panelView.children.first.cancelButtonView;

				cancelButtonView.fire( 'execute' );

				expect( dropdown.isOpen ).to.be.false;
				sinon.assert.notCalled( commandSpy );
				sinon.assert.calledOnce( cancelSpy );
			} );

			it( 'should focus on "insert image via URL" input after opening', () => {
				let spy;

				// The ImageInsertPanelView is added on first open.
				// See https://github.com/ckeditor/ckeditor5/pull/8019#discussion_r484069652
				dropdown.on( 'change:isOpen', () => {
					const imageInsertPanelView = dropdown.panelView.children.first;
					spy = sinon.spy( imageInsertPanelView, 'focus' );
				} );

				dropdown.buttonView.fire( 'open' );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );

function fakeEventData() {
	return {
		preventDefault: sinon.spy()
	};
}
