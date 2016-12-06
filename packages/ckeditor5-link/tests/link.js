/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from 'tests/core/_utils/classictesteditor.js';
import testUtils from 'tests/core/_utils/utils.js';
import { keyCodes } from 'ckeditor5/utils/keyboard.js';
import { setData as setModelData } from 'ckeditor5/engine/dev-utils/model.js';

import Link from 'ckeditor5/link/link.js';
import LinkEngine from 'ckeditor5/link/linkengine.js';
import ButtonView from 'ckeditor5/ui/button/buttonview.js';
import BalloonPanelView from 'ckeditor5/ui/balloonpanel/balloonpanelview.js';

import Range from 'ckeditor5/engine/view/range.js';
import ClickObserver from 'ckeditor5/engine/view/observer/clickobserver.js';

testUtils.createSinonSandbox();

describe( 'Link', () => {
	let editor, linkFeature, linkButton, unlinkButton, balloonPanelView, formView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Link ]
		} )
		.then( newEditor => {
			newEditor.editing.view.attachDomRoot( editorElement );

			editor = newEditor;

			linkFeature = editor.plugins.get( Link );
			linkButton = editor.ui.componentFactory.create( 'link' );
			unlinkButton = editor.ui.componentFactory.create( 'unlink' );
			balloonPanelView = linkFeature.balloonPanelView;
			formView = linkFeature.formView;
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( linkFeature ).to.instanceOf( Link );
	} );

	it( 'should load LinkEngine', () => {
		expect( editor.plugins.get( LinkEngine ) ).to.instanceOf( LinkEngine );
	} );

	it( 'should register click observer', () => {
		expect( editor.editing.view.getObserver( ClickObserver ) ).to.instanceOf( ClickObserver );
	} );

	describe( 'link toolbar button', () => {
		it( 'should register link button', () => {
			expect( linkButton ).to.instanceOf( ButtonView );
		} );

		it( 'should bind linkButtonView to link command', () => {
			const command = editor.commands.get( 'link' );

			command.isEnabled = true;
			expect( linkButton.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( linkButton.isEnabled ).to.be.false;
		} );

		it( 'should open panel on linkButtonView execute event', () => {
			linkButton.fire( 'execute' );

			expect( linkFeature.balloonPanelView.isVisible ).to.true;
		} );

		it( 'should open panel attached to the link element, when collapsed selection is inside link element', () => {
			const attachToSpy = testUtils.sinon.spy( balloonPanelView, 'attachTo' );

			editor.document.schema.allow( { name: '$text', inside: '$root' } );
			setModelData( editor.document, '<$text linkHref="url">some[] url</$text>' );
			editor.editing.view.isFocused = true;

			linkButton.fire( 'execute' );

			const linkElement = editorElement.querySelector( 'a' );

			sinon.assert.calledWithExactly( attachToSpy, sinon.match( {
				target: linkElement,
				limiter: editorElement
			} ) );
		} );

		it( 'should open panel attached to the selection, when there is non-collapsed selection', () => {
			const attachToSpy = testUtils.sinon.spy( balloonPanelView, 'attachTo' );

			editor.document.schema.allow( { name: '$text', inside: '$root' } );
			setModelData( editor.document, 'so[me ur]l' );
			editor.editing.view.isFocused = true;

			linkButton.fire( 'execute' );

			const selectedRange = editorElement.ownerDocument.getSelection().getRangeAt( 0 );

			sinon.assert.calledWithExactly( attachToSpy, sinon.match( {
				target: selectedRange,
				limiter: editorElement
			} ) );
		} );

		it( 'should select panel input value when panel is opened', () => {
			const selectUrlInputSpy = testUtils.sinon.spy( linkFeature.formView.urlInputView, 'select' );

			editor.editing.view.isFocused = true;

			linkButton.fire( 'execute' );

			expect( selectUrlInputSpy.calledOnce ).to.true;
		} );
	} );

	describe( 'unlink toolbar button', () => {
		it( 'should register unlink button', () => {
			expect( unlinkButton ).to.instanceOf( ButtonView );
		} );

		it( 'should bind unlinkButtonView to unlink command', () => {
			const command = editor.commands.get( 'unlink' );

			command.isEnabled = true;
			expect( unlinkButton.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( unlinkButton.isEnabled ).to.be.false;
		} );

		it( 'should execute unlink command on unlinkButtonView execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			unlinkButton.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.true;
			expect( executeSpy.calledWithExactly( 'unlink' ) ).to.true;
		} );
	} );

	describe( 'link balloon panel', () => {
		let hidePanelSpy, focusEditableSpy;

		beforeEach( () => {
			hidePanelSpy = testUtils.sinon.spy( balloonPanelView, 'hide' );
			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should be created', () => {
			expect( balloonPanelView ).to.instanceOf( BalloonPanelView );
		} );

		it( 'should be appended to the document body', () => {
			expect( document.body.contains( balloonPanelView.element ) );
		} );

		it( 'should open with selected url input on `CTRL+K` keystroke', () => {
			const selectUrlInputSpy = testUtils.sinon.spy( linkFeature.formView.urlInputView, 'select' );

			editor.keystrokes.press( { keyCode: keyCodes.k, ctrlKey: true } );

			expect( balloonPanelView.isVisible ).to.true;
			expect( selectUrlInputSpy.calledOnce ).to.true;
		} );

		it( 'should add balloon panel element to focus tracker', () => {
			editor.ui.focusTracker.isFocused = false;

			balloonPanelView.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.true;
		} );

		describe( 'close listeners', () => {
			describe( 'keyboard', () => {
				it( 'should close after `ESC` press', () => {
					balloonPanelView.isVisible = true;

					dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

					expect( hidePanelSpy.calledOnce ).to.true;
					expect( focusEditableSpy.calledOnce ).to.true;
				} );
			} );

			describe( 'mouse', () => {
				it( 'should close and not focus editable on click outside the panel', () => {
					balloonPanelView.isVisible = true;
					document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

					expect( hidePanelSpy.calledOnce ).to.true;
					expect( focusEditableSpy.notCalled ).to.true;
				} );

				it( 'should not close on click inside the panel', () => {
					balloonPanelView.isVisible = true;
					balloonPanelView.element.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

					expect( hidePanelSpy.notCalled ).to.true;
				} );
			} );
		} );

		describe( 'click on editable', () => {
			it( 'should open with not selected url input when collapsed selection is inside link element', () => {
				const selectUrlInputSpy = testUtils.sinon.spy( linkFeature.formView.urlInputView, 'select' );
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">fo[]o</$text>' );

				observer.fire( 'click', { target: document.body } );

				expect( balloonPanelView.isVisible ).to.true;
				expect( selectUrlInputSpy.notCalled ).to.true;
			} );

			it( 'should keep open and update position until collapsed selection stay inside the same link element', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				expect( balloonPanelView.isVisible ).to.true;

				const attachToSpy = testUtils.sinon.spy( balloonPanelView, 'attachTo' );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				editor.editing.view.render();

				expect( balloonPanelView.isVisible ).to.true;
				expect( attachToSpy.calledOnce ).to.true;
			} );

			it( 'should close when selection goes outside the link element', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, 'foo <$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				expect( balloonPanelView.isVisible ).to.true;

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 3, text, 3 ) ], true );
				editor.editing.view.render();

				expect( balloonPanelView.isVisible ).to.false;
			} );

			it( 'should close when selection goes to the other link element with the same href', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[]oo</$text> bar <$text linkHref="url">biz</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 2 ).getChild( 0 );

				observer.fire( 'click', { target: document.body } );

				expect( balloonPanelView.isVisible ).to.true;

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 1 ) ], true );
				editor.editing.view.render();

				expect( balloonPanelView.isVisible ).to.false;
			} );

			it( 'should close when selection becomes non-collapsed', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[]oo</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: {} } );

				expect( balloonPanelView.isVisible ).to.true;

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 1, text, 2 ) ] );
				editor.editing.view.render();

				expect( balloonPanelView.isVisible ).to.false;
			} );

			it( 'should stop updating position after close', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">b[]ar</$text>' );

				const root = editor.editing.view.getRoot();
				const text = root.getChild( 0 ).getChild( 0 );

				observer.fire( 'click', { target: {} } );

				expect( balloonPanelView.isVisible ).to.true;

				balloonPanelView.isVisible = false;

				const attachToSpy = testUtils.sinon.spy( balloonPanelView, 'attachTo' );

				editor.editing.view.selection.setRanges( [ Range.createFromParentsAndOffsets( text, 2, text, 2 ) ], true );
				editor.editing.view.render();

				expect( attachToSpy.notCalled ).to.true;
			} );

			it( 'should not open when selection is not inside link element', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				setModelData( editor.document, '[]' );

				observer.fire( 'click', { target: {} } );

				expect( balloonPanelView.isVisible ).to.false;
			} );

			it( 'should not open when selection is non-collapsed', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">f[o]o</$text>' );

				observer.fire( 'click', { target: document.body } );

				expect( balloonPanelView.isVisible ).to.false;
			} );
		} );
	} );

	describe( 'link form', () => {
		let hidePanelSpy, focusEditableSpy;

		beforeEach( () => {
			hidePanelSpy = testUtils.sinon.spy( balloonPanelView, 'hide' );
			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		describe( 'binding', () => {
			it( 'should bind formView.urlInputView#value to link command value', () => {
				const command = editor.commands.get( 'link' );

				expect( formView.urlInputView.value ).to.undefined;

				command.value = 'http://cksource.com';
				expect( formView.urlInputView.value ).to.equal( 'http://cksource.com' );
			} );

			it( 'should execute link command on formView#submit event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				formView.urlInputView.value = 'http://ckeditor.com';
				expect( formView.urlInputView.inputView.element.value ).to.equal( 'http://ckeditor.com' );

				formView.urlInputView.inputView.element.value = 'http://cksource.com';
				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.true;
				expect( executeSpy.calledWithExactly( 'link', 'http://cksource.com' ) ).to.true;
			} );

			it( 'should hide and focus editable on formView#submit event', () => {
				formView.fire( 'submit' );

				expect( hidePanelSpy.calledOnce ).to.true;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );

			it( 'should execute unlink command on formView#unlink event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				formView.fire( 'unlink' );

				expect( executeSpy.calledOnce ).to.true;
				expect( executeSpy.calledWithExactly( 'unlink' ) ).to.true;
			} );

			it( 'should hide and focus editable on formView#unlink event', () => {
				formView.fire( 'unlink' );

				expect( hidePanelSpy.calledOnce ).to.true;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );

			it( 'should hide and focus editable on formView#cancel event', () => {
				formView.fire( 'cancel' );

				expect( hidePanelSpy.calledOnce ).to.true;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );
		} );
	} );
} );

// Creates and dispatches keyboard event with specified keyCode.
//
// @private
// @param {EventTarget} eventTarget
// @param {String} eventName
// @param {Number} keyCode
function dispatchKeyboardEvent( element, eventName, keyCode ) {
	const event = document.createEvent( 'Events' );

	event.initEvent( eventName, true, true );
	event.which = keyCode;
	event.keyCode = keyCode;

	element.dispatchEvent( event );
}
