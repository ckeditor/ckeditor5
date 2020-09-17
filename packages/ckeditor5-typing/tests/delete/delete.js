/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Delete from '../../src/delete';
import DeleteCommand from '../../src/deletecommand';
import DeleteObserver from '../../src/deleteobserver';
import { fireBeforeInputDomEvent } from '../_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Delete', () => {
	describe( 'Delete plugin', () => {
		let domElement;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );
		} );

		afterEach( () => {
			domElement.remove();
		} );

		describe( 'init()', () => {
			it( 'should register two editor commands', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Delete ]
				} );

				expect( editor.commands.get( 'delete' ) ).to.have.property( 'direction', 'backward' );
				expect( editor.commands.get( 'forwardDelete' ) ).to.have.property( 'direction', 'forward' );

				expect( editor.commands.get( 'delete' ) ).to.be.instanceOf( DeleteCommand );
				expect( editor.commands.get( 'forwardDelete' ) ).to.be.instanceOf( DeleteCommand );

				await editor.destroy();
			} );

			it( 'should add the DeleteObserver to the editing view', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Delete ]
				} );

				expect( editor.editing.view.getObserver( DeleteObserver ) ).to.be.instanceOf( DeleteObserver );

				await editor.destroy();
			} );

			it( 'should enable key events-based delete when the Input Events are not supported by the browser', async () => {
				// Force the browser to not use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => false );

				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Delete, Paragraph ],
					initialData: '<p>foo</p>'
				} );

				// "foo[]"
				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot(), 'end' );
				} );

				const viewDocument = editor.editing.view.document;
				const deleteCommandSpy = testUtils.sinon.spy( editor.commands.get( 'delete' ), 'execute' );

				// First, let's try if the key events work.
				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'backspace' )
				} ) );

				sinon.assert.calledOnce( deleteCommandSpy );
				sinon.assert.calledWith( deleteCommandSpy.firstCall, sinon.match( { sequence: 1, unit: 'codePoint' } ) );

				// "fo[]"
				const domRange = document.createRange();
				domRange.setStart( editor.ui.getEditableElement().firstChild.firstChild, 2 );
				domRange.setEnd( editor.ui.getEditableElement().firstChild.firstChild, 2 );

				// Then, let's make sure beforeinput is not supported.
				fireBeforeInputDomEvent( editor.ui.getEditableElement(), {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				sinon.assert.calledOnce( deleteCommandSpy );

				await editor.destroy();
			} );

			it( 'should enable beforeinput-based delete when the Input Events are supported by the browser', async () => {
				// Force the browser to not use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [ Delete, Paragraph ],
					initialData: '<p>foo</p>'
				} );

				// "foo[]"
				const domRange = document.createRange();
				domRange.setStart( editor.ui.getEditableElement().firstChild.firstChild, 3 );
				domRange.setEnd( editor.ui.getEditableElement().firstChild.firstChild, 3 );

				const viewDocument = editor.editing.view.document;
				const deleteCommandSpy = testUtils.sinon.spy( editor.commands.get( 'delete' ), 'execute' );

				// First, let's try if the beforeinput delete work.
				fireBeforeInputDomEvent( editor.ui.getEditableElement(), {
					inputType: 'deleteContentBackward',
					ranges: [ domRange ]
				} );

				sinon.assert.calledOnce( deleteCommandSpy );
				// Note: Sequence is 0 because only beforeinput was fired without preceding keydown.
				sinon.assert.calledWith( deleteCommandSpy.firstCall, sinon.match( { sequence: 0, unit: 'codePoint' } ) );

				// "fo[]"
				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot(), 'end' );
				} );

				// Then, let's make sure key event are not supported.
				viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
					keyCode: getCode( 'backspace' )
				} ) );

				sinon.assert.calledOnce( deleteCommandSpy );

				await editor.destroy();
			} );

			function getDomEvent() {
				return {
					preventDefault: sinon.spy()
				};
			}
		} );
	} );
} );
