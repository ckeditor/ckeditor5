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

	it( 'should register keystrokes on init ', () => {
		const spy = sinon.spy( editor.keystrokes, 'set' );
		editor.plugins.get( 'FullscreenEditing' ).init();

		expect( spy ).to.have.been.calledOnce;
	} );

	it( 'should toggle fullscreen mode on keystroke combination', () => {
		const spy = sinon.spy( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes.f,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			shiftKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		editor.keystrokes.press( keyEventData );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithExactly( 'toggleFullscreen' ) ).to.be.true;

		editor.keystrokes.press( keyEventData );

		expect( spy.calledTwice ).to.be.true;
	} );
} );
