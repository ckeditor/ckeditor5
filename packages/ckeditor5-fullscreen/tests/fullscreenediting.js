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

	it( 'should register keystrokes on init ', () => {
		const spy = sinon.spy( editor.keystrokes, 'set' );
		editor.plugins.get( 'FullscreenEditing' ).init();

		expect( spy ).to.have.been.calledOnce;
	} );

	describe( 'on keystroke combination', () => {
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

		it( 'should force editable blur on non-Chromium browsers', () => {
			sinon.stub( env, 'isBlink' ).value( false );

			editor.keystrokes.press( keyEventData );

			expect( global.document.activeElement ).to.equal( editor.ui.getEditableElement() );

			editor.keystrokes.press( keyEventData );

			expect( global.document.activeElement ).to.equal( editor.ui.getEditableElement() );
		} );

		describe( 'should scroll', () => {
			it( 'to the selection', () => {
				const spy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );

				editor.keystrokes.press( keyEventData );

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'and set viewportOffset to 0 if not configured', () => {
				const spy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );

				editor.keystrokes.press( keyEventData );

				expect( spy.calledOnce ).to.be.true;

				sinon.assert.calledOnceWithExactly( spy, {
					alignToTop: true,
					forceScroll: true,
					ancestorOffset: 50,
					viewportOffset: 0
				} );
			} );

			it( 'and use `config.ui.viewportOffset` if configured', () => {
				const spy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );
				editor.config.set( 'ui.viewportOffset', {
					top: 100,
					bottom: 200,
					left: 300,
					right: 400
				} );

				editor.keystrokes.press( keyEventData );

				expect( spy.calledOnce ).to.be.true;

				sinon.assert.calledOnceWithExactly( spy, {
					alignToTop: true,
					forceScroll: true,
					ancestorOffset: 50,
					viewportOffset: { top: 100, bottom: 200, left: 300, right: 400 }
				} );
			} );

			it( 'and substitute missing values in `config.ui.viewportOffset`', () => {
				const spy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );
				editor.config.set( 'ui.viewportOffset', {} );

				editor.keystrokes.press( keyEventData );

				expect( spy.calledOnce ).to.be.true;

				sinon.assert.calledOnceWithExactly( spy, {
					alignToTop: true,
					forceScroll: true,
					ancestorOffset: 50,
					viewportOffset: { top: 0, bottom: 0, left: 0, right: 0 }
				} );
			} );
		} );
	} );
} );
