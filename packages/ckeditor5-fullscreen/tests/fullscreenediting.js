/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import env from '@ckeditor/ckeditor5-utils/src/env.js';

import FullscreenEditing from '../src/fullscreenediting.js';
import FullscreenCommand from '../src/fullscreencommand.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'FullscreenEditing', () => {
	let domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				FullscreenEditing
			]
		} );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( FullscreenEditing.pluginName ).to.equal( 'FullscreenEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FullscreenEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should register the `fullscreen` command', () => {
		expect( editor.commands.get( 'toggleFullscreen' ) ).to.be.instanceOf( FullscreenCommand );
	} );

	it( 'should define the `fullscreen.menuBar.isVisible` config option to `true`', () => {
		expect( editor.config.get( 'fullscreen.menuBar.isVisible' ) ).to.be.true;
	} );

	it( 'should set the `fullscreen.toolbar.shouldNotGroupWhenFull` config to value of `toolbar.shouldNotGroupWhenFull`', async () => {
		expect( editor.config.get( 'fullscreen.toolbar.shouldNotGroupWhenFull' ) ).to.be.false;

		const tempDomElement = global.document.createElement( 'div' );
		global.document.body.appendChild( tempDomElement );

		const tempEditor = await ClassicEditor.create( tempDomElement, {
			plugins: [
				Paragraph,
				Essentials,
				FullscreenEditing
			],
			toolbar: {
				shouldNotGroupWhenFull: true
			}
		} );

		expect( tempEditor.config.get( 'fullscreen.toolbar.shouldNotGroupWhenFull' ) ).to.be.true;

		tempDomElement.remove();
		return tempEditor.destroy();
	} );

	it( 'should register keystrokes on init', () => {
		const spy = sinon.spy( editor.keystrokes, 'set' );
		editor.plugins.get( 'FullscreenEditing' ).init();

		expect( spy ).to.have.been.calledOnce;
	} );

	describe( 'on Ctrl+Shift+F keystroke combination', () => {
		const keyEventData = {
			keyCode: keyCodes.f,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			shiftKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		it( 'should toggle fullscreen mode', () => {
			const spy = sinon.spy( editor, 'execute' );

			editor.keystrokes.press( keyEventData );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWithExactly( 'toggleFullscreen' ) ).to.be.true;

			editor.keystrokes.press( keyEventData );

			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'should force editable and toolbar blur on non-Chromium browsers', () => {
			sinon.stub( env, 'isBlink' ).value( false );

			// Add button to the toolbar.
			const buttonView = new ButtonView();
			buttonView.render();
			editor.ui.view.toolbar.items.add( buttonView );

			// Focus the toolbar button when entering fullscreen mode.
			editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;

			editor.keystrokes.press( keyEventData );

			expect( global.document.activeElement ).to.equal( editor.ui.getEditableElement() );
			expect( editor.ui.view.toolbar.focusTracker.focusedElement ).to.be.null;

			// Focus the toolbar button when leaving fullscreen mode.
			editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;
			editor.keystrokes.press( keyEventData );

			expect( global.document.activeElement ).to.equal( editor.ui.getEditableElement() );
			expect( editor.ui.view.toolbar.focusTracker.focusedElement ).to.be.null;
		} );

		it( 'should focus the editable element', () => {
			const spy = sinon.spy( editor.editing.view, 'focus' );

			editor.keystrokes.press( keyEventData );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should scroll to the selection', () => {
			const spy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			editor.keystrokes.press( keyEventData );

			expect( spy.calledOnce ).to.be.true;
		} );
	} );
} );
