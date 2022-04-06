/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ImageInsert from '../../src/imageinsert';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Image from '../../src/image';

describe( 'ImageInsertUI', () => {
	let editor, editorElement, dropdown;

	describe( 'dropdown', () => {
		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicEditor
				.create( editorElement, {
					plugins: [ Notification, Image, ImageInsert ],
					toolbar: [ 'insertImage' ],
					image: {
						insert: {
							integrations: [
								'insertImageViaUrl'
							]
						}
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					dropdown = editor.ui.view.toolbar.children.first.children.first;

					// Hide all notifications (prevent alert() calls).
					const notification = editor.plugins.get( Notification );
					notification.on( 'show', evt => evt.stop() );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		describe( 'dropdown panel integrations', () => {
			describe( 'insert image via URL form', () => {
				it( 'should have "Insert image via URL" label on inserting new image', () => {
					const viewDocument = editor.editing.view.document;

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
				}, { priority: 'highest' } );

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
