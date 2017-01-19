/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../../src/image';
import ImageToolbar from '../../src/imagetoolbar';
import ImageAlternateText from '../../src/imagealternatetext/imagealternatetext';
import ImageAlternateTextEngine from '../../src/imagealternatetext/imagealternatetextengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'ImageAlternateText', () => {
	let editor, plugin, command, balloonPanel, form;

	beforeEach( () => {
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ ImageAlternateText, Image ]
		} )
		.then( newEditor => {
			editor = newEditor;
			newEditor.editing.view.attachDomRoot( editorElement );
			plugin = editor.plugins.get( ImageAlternateText );
			command = editor.commands.get( 'imageAlternateText' );
			balloonPanel = plugin.balloonPanel;
			form = plugin.form;
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( plugin ).to.be.instanceOf( ImageAlternateText );
	} );

	it( 'should load ImageAlternateTextEngine plugin', () => {
		expect( editor.plugins.get( ImageAlternateTextEngine ) ).to.be.instanceOf( ImageAlternateTextEngine );
	} );

	describe( 'toolbar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'imageAlternateText' );
		} );

		it( 'should be registered in component factory', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have isEnabled property bind to command\'s isEnabled property', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should show balloon panel on execute', () => {
			const spy = sinon.spy( balloonPanel, 'attach' );
			setData( editor.document, '[<image src="" alt="foo bar"></image>]' );
			button.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should hide ImageToolbar on execute', () => {
			const editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			return ClassicTestEditor.create( editorElement, {
				plugins: [ ImageAlternateText, Image, ImageToolbar ],
				image: {
					toolbar: [ 'imageAlternateText' ]
				}
			} )
			.then( newEditor => {
				newEditor.editing.view.attachDomRoot( editorElement );
				const button = newEditor.ui.componentFactory.create( 'imageAlternateText' );
				const toolbarPlugin = newEditor.plugins.get( ImageToolbar );

				const spy = sinon.spy( toolbarPlugin, 'hide' );
				setData( newEditor.document, '[<image src="" alt="foo bar"></image>]' );
				button.fire( 'execute' );

				sinon.assert.calledOnce( spy );

				newEditor.destroy();
			} );
		} );

		it( 'should set alt attribute value to textarea and select it', () => {
			const spy = sinon.spy( form.labeledTextarea, 'select' );
			setData( editor.document, '[<image src="" alt="foo bar"></image>]' );
			button.fire( 'execute' );

			sinon.assert.calledOnce( spy );
			expect( plugin.form.labeledTextarea.value ).equals( 'foo bar' );
		} );

		it( 'should set empty text to textarea and select it when there is no alt attribute', () => {
			const spy = sinon.spy( form.labeledTextarea, 'select' );
			setData( editor.document, '[<image src=""></image>]' );
			button.fire( 'execute' );

			sinon.assert.calledOnce( spy );
			expect( plugin.form.labeledTextarea.value ).equals( '' );
		} );
	} );

	describe( 'balloon panel form', () => {
		it( 'should execute command on submit', () => {
			const spy = sinon.spy( editor, 'execute' );
			form.fire( 'submit' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'imageAlternateText', { newValue: form.labeledTextarea.inputView.element.value } );
		} );

		it( 'should detach panel on cancel', () => {
			const spy = sinon.spy( balloonPanel, 'detach' );
			form.fire( 'cancel' );

			sinon.assert.called( spy );
		} );

		it( 'should show ImageToolbar on cancel if present', () => {
			const editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			return ClassicTestEditor.create( editorElement, {
				plugins: [ ImageAlternateText, Image, ImageToolbar ],
				image: {
					toolbar: [ 'imageAlternateText' ]
				}
			} )
			.then( newEditor => {
				newEditor.editing.view.attachDomRoot( editorElement );
				const plugin = newEditor.plugins.get( ImageAlternateText );
				const toolbarPlugin = newEditor.plugins.get( ImageToolbar );
				const form = plugin.form;

				const spy = sinon.spy( toolbarPlugin, 'show' );
				form.fire( 'cancel' );

				sinon.assert.called( spy );
			} );
		} );

		describe( 'close listeners', () => {
			let hidePanelSpy;

			beforeEach( () => {
				hidePanelSpy = sinon.spy( balloonPanel, 'detach' );
			} );

			describe( 'keyboard', () => {
				it( 'should close after `ESC` press', () => {
					balloonPanel.isVisible = true;
					const keyCode = keyCodes.esc;
					const event = global.document.createEvent( 'Events' );
					event.initEvent( 'keydown', true, true );
					event.which = keyCode;
					event.keyCode = keyCode;
					global.document.dispatchEvent( event );

					sinon.assert.called( hidePanelSpy );
				} );
			} );
		} );
	} );
} );
