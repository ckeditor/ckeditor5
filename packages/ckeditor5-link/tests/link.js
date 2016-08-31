/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: link, browser-only */

import ClassicTestEditor from '/tests/core/_utils/classictesteditor.js';
import testUtils from '/tests/core/_utils/utils.js';
import { keyCodes } from '/ckeditor5/utils/keyboard.js';

import Link from '/ckeditor5/link/link.js';
import LinkEngine from '/ckeditor5/link/linkengine.js';
import Button from '/ckeditor5/ui/button/button.js';
import LinkBalloonPanel from '/ckeditor5/link/ui/linkballoonpanel.js';

import Range from '/ckeditor5/engine/model/range.js';

import ClickObserver from '/ckeditor5/engine/view/observer/clickobserver.js';

testUtils.createSinonSandbox();

describe( 'Link', () => {
	let editor, linkFeature, linkButton, unlinkButton, balloonPanel;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			features: [ Link ]
		} )
			.then( newEditor => {
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
			editor.editing.view.focus();

			linkButton.model.fire( 'execute' );

			expect( linkFeature.balloonPanel.view.isVisible ).to.true;
		} );

		it( 'should not open panel on linkButton#model execute event, when editor is not focused', () => {
			linkButton.model.fire( 'execute' );

			expect( linkFeature.balloonPanel.view.isVisible ).to.false;
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

		it( 'should hide panel on unlinkButton#model execute event', () => {
			balloonPanel.view.model.isVisible = true;

			unlinkButton.model.fire( 'execute' );

			expect( balloonPanel.view.model.isVisible ).to.false;
		} );
	} );

	describe( 'link panel', () => {
		it( 'should create LinkBalloonPanel component', () => {
			expect( balloonPanel ).to.instanceOf( LinkBalloonPanel );
		} );

		it( 'should bind balloonPanel#model to link command', () => {
			const model = balloonPanel.model;
			const command = editor.commands.get( 'link' );

			expect( model.url ).to.undefined;

			command.value = 'http://cksource.com';

			expect( model.url ).to.equal( 'http://cksource.com' );
		} );

		it( 'should execute link command on balloonPanel#model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			balloonPanel.model.url = 'http://cksource.com';
			balloonPanel.model.fire( 'execute' );

			expect( executeSpy.calledOnce ).to.true;
			expect( executeSpy.calledWithExactly( 'link', 'http://cksource.com' ) ).to.true;
		} );

		it( 'should append panel element to the body', () => {
			expect( document.body.contains( balloonPanel.view.element ) );
		} );

		it( 'should open panel on `CTRL+L` keystroke', () => {
			editor.keystrokes.press( { keyCode: keyCodes.l, ctrlKey: true } );

			expect( balloonPanel.view.model.isVisible ).to.true;
		} );

		it( 'should focus editor on balloonPanel#model hide event', () => {
			balloonPanel.model.fire( 'hide' );

			expect( editor.editing.view.isFocused ).to.true;
		} );

		it( 'should hide panel on editor focus event', () => {
			balloonPanel.view.model.isVisible = true;

			editor.editing.view.focus();

			expect( balloonPanel.view.model.isVisible ).to.false;
		} );

		it( 'should show panel on editor click, when selection is inside link element', () => {
			const modelRoot = editor.document.getRoot();
			const observer = editor.editing.view.getObserver( ClickObserver );
			const linkCommand = editor.commands.get( 'link' );

			// Insert link element to document and put selection inside this element `<a href="url">so{}me url</a>`.
			editor.document.schema.allow( { name: '$text', inside: '$root' } );
			editor.setData( '<a href="url">some url</a>' );
			editor.document.selection.setRanges( [ Range.createFromParentsAndOffsets( modelRoot, 2, modelRoot, 2 ) ] );
			linkCommand.value = 'url';

			observer.fire( 'click', { target: document.body } );

			expect( balloonPanel.view.model.isVisible ).to.true;
		} );

		it( 'should not show panel on editor click, when selection is not inside link element', () => {
			const modelRoot = editor.document.getRoot();
			const observer = editor.editing.view.getObserver( ClickObserver );

			editor.document.selection.setRanges( [ Range.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 0 ) ] );

			observer.fire( 'click', { target: document.body } );

			expect( balloonPanel.view.model.isVisible ).to.false;
		} );
	} );
} );
