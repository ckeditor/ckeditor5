/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '/tests/core/_utils/classictesteditor.js';
import testUtils from '/tests/core/_utils/utils.js';
import { keyCodes } from '/ckeditor5/utils/keyboard.js';
import { setData as setModelData } from '/tests/engine/_utils/model.js';

import Link from '/ckeditor5/link/link.js';
import LinkEngine from '/ckeditor5/link/linkengine.js';
import Button from '/ckeditor5/ui/button/button.js';
import LinkBalloonPanel from '/ckeditor5/link/ui/linkballoonpanel.js';

import ClickObserver from '/ckeditor5/engine/view/observer/clickobserver.js';

testUtils.createSinonSandbox();

describe( 'Link', () => {
	let editor, linkFeature, linkButton, unlinkButton, balloonPanel, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			features: [ Link ]
		} )
		.then( newEditor => {
			newEditor.editing.view.attachDomRoot( editorElement );

			editor = newEditor;

			linkFeature = editor.plugins.get( Link );
			linkButton = editor.ui.featureComponents.create( 'link' );
			unlinkButton = editor.ui.featureComponents.create( 'unlink' );
			balloonPanel = linkFeature.balloonPanel;
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
		it( 'should register link feature component', () => {
			expect( linkButton ).to.instanceOf( Button );
		} );

		it( 'should bind linkButton#model to link command', () => {
			const model = linkButton.model;
			const command = editor.commands.get( 'link' );

			expect( model.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( model.isEnabled ).to.be.false;
		} );

		it( 'should open panel on linkButton#model execute event, when editor is focused', () => {
			editor.editing.view.isFocused = true;

			linkButton.model.fire( 'execute' );

			expect( linkFeature.balloonPanel.view.isVisible ).to.true;
		} );

		it( 'should not open panel on linkButton#model execute event, when editor is not focused', () => {
			editor.editing.view.isFocused = false;

			linkButton.model.fire( 'execute' );

			expect( linkFeature.balloonPanel.view.isVisible ).to.false;
		} );

		it( 'should open panel attached to the link element, when collapsed selection is inside link element', () => {
			const attachToSpy = testUtils.sinon.spy( balloonPanel.view, 'attachTo' );

			editor.document.schema.allow( { name: '$text', inside: '$root' } );
			setModelData( editor.document, '<$text linkHref="url">some[] url</$text>' );
			editor.editing.view.isFocused = true;

			linkButton.model.fire( 'execute' );

			const linkElement = editorElement.querySelector( 'a' );

			expect( attachToSpy.calledWithExactly( linkElement, editorElement ) ).to.true;
		} );

		it( 'should open panel attached to the selection, when there is non-collapsed selection', () => {
			const attachToSpy = testUtils.sinon.spy( balloonPanel.view, 'attachTo' );

			editor.document.schema.allow( { name: '$text', inside: '$root' } );
			setModelData( editor.document, 'so[me ur]l' );
			editor.editing.view.isFocused = true;

			linkButton.model.fire( 'execute' );

			const selectedRange = editorElement.ownerDocument.getSelection().getRangeAt( 0 );

			expect( attachToSpy.calledWithExactly( selectedRange, editorElement ) ).to.true;
		} );

		it( 'should select panel input value when panel is opened', () => {
			const selectUrlInputSpy = testUtils.sinon.spy( balloonPanel.urlInput.view, 'select' );

			editor.editing.view.isFocused = true;

			linkButton.model.fire( 'execute' );

			expect( selectUrlInputSpy.calledOnce ).to.true;
		} );
	} );

	describe( 'unlink toolbar button', () => {
		it( 'should register unlink feature component', () => {
			expect( unlinkButton ).to.instanceOf( Button );
		} );

		it( 'should bind unlinkButton#model to unlink command', () => {
			const model = unlinkButton.model;
			const command = editor.commands.get( 'unlink' );

			expect( model.isEnabled ).to.false;

			command.hasValue = true;
			expect( model.isEnabled ).to.true;
		} );

		it( 'should execute unlink command on unlinkButton#model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			unlinkButton.model.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.true;
			expect( executeSpy.calledWithExactly( 'unlink' ) ).to.true;
		} );
	} );

	describe( 'link balloon panel', () => {
		let hidePanelSpy, focusEditableSpy;

		beforeEach( () => {
			hidePanelSpy = testUtils.sinon.spy( balloonPanel.view, 'hide' );
			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should be created', () => {
			expect( balloonPanel ).to.instanceOf( LinkBalloonPanel );
		} );

		it( 'should be appended to the document body', () => {
			expect( document.body.contains( balloonPanel.view.element ) );
		} );

		it( 'should open with selected url input on `CTRL+L` keystroke', () => {
			const selectUrlInputSpy = testUtils.sinon.spy( balloonPanel.urlInput.view, 'select' );

			editor.keystrokes.press( { keyCode: keyCodes.l, ctrlKey: true } );

			expect( balloonPanel.view.model.isVisible ).to.true;
			expect( selectUrlInputSpy.calledOnce ).to.true;
		} );

		describe( 'binding', () => {
			it( 'should bind balloonPanel#model to link command', () => {
				const model = balloonPanel.model;
				const command = editor.commands.get( 'link' );

				expect( model.url ).to.undefined;

				command.value = 'http://cksource.com';

				expect( model.url ).to.equal( 'http://cksource.com' );
			} );

			it( 'should execute link command on balloonPanel#model executeLink event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				balloonPanel.model.url = 'http://cksource.com';
				balloonPanel.model.fire( 'executeLink' );

				expect( executeSpy.calledOnce ).to.true;
				expect( executeSpy.calledWithExactly( 'link', 'http://cksource.com' ) ).to.true;
			} );

			it( 'should hide and focus editable on balloonPanel#model executeLink event', () => {
				balloonPanel.model.fire( 'executeLink' );

				expect( hidePanelSpy.calledOnce ).to.true;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );

			it( 'should execute unlink command on balloonPanel#model executeUnlink event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				balloonPanel.model.fire( 'executeUnlink' );

				expect( executeSpy.calledOnce ).to.true;
				expect( executeSpy.calledWithExactly( 'unlink' ) ).to.true;
			} );

			it( 'should hide and focus editable on balloonPanel#model executeUnlink event', () => {
				balloonPanel.model.fire( 'executeUnlink' );

				expect( hidePanelSpy.calledOnce ).to.true;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );

			it( 'should hide and focus editable on balloonPanel#model executeCancel event', () => {
				balloonPanel.model.fire( 'executeCancel' );

				expect( hidePanelSpy.calledOnce ).to.true;
				expect( focusEditableSpy.calledOnce ).to.true;
			} );
		} );

		describe( 'click on editable', () => {
			it( 'should open with not selected url input when selection is inside link element', () => {
				const selectUrlInputSpy = testUtils.sinon.spy( balloonPanel.urlInput.view, 'select' );
				const observer = editor.editing.view.getObserver( ClickObserver );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
				setModelData( editor.document, '<$text linkHref="url">some[] url</$text>' );

				observer.fire( 'click', { target: document.body } );

				expect( balloonPanel.view.model.isVisible ).to.true;
				expect( selectUrlInputSpy.notCalled ).to.true;
			} );

			it( 'should not open panel when selection is not inside link element', () => {
				const observer = editor.editing.view.getObserver( ClickObserver );

				setModelData( editor.document, '[]' );

				observer.fire( 'click', { target: document.body } );

				expect( balloonPanel.view.model.isVisible ).to.false;
			} );
		} );
	} );
} );
