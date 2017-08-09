/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event, document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../src/image';
import ImageTextAlternative from '../src/imagetextalternative';
import ImageTextAlternativeEngine from '../src/imagetextalternative/imagetextalternativeengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'ImageTextAlternative', () => {
	let editor, editingView, doc, plugin, command, form, balloon, editorElement, button;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageTextAlternative, Image ]
			} )
			.then( newEditor => {
				editor = newEditor;
				editingView = editor.editing.view;
				doc = editor.document;
				newEditor.editing.view.attachDomRoot( editorElement );
				plugin = editor.plugins.get( ImageTextAlternative );
				command = editor.commands.get( 'imageTextAlternative' );
				form = plugin._form;
				balloon = editor.plugins.get( 'ContextualBalloon' );
				button = editor.ui.componentFactory.create( 'imageTextAlternative' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( plugin ).to.be.instanceOf( ImageTextAlternative );
	} );

	it( 'should load ImageTextAlternativeEngine plugin', () => {
		expect( editor.plugins.get( ImageTextAlternativeEngine ) ).to.be.instanceOf( ImageTextAlternativeEngine );
	} );

	describe( 'toolbar button', () => {
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
			expect( balloon.visibleView ).to.be.null;

			setData( doc, '[<image src="" alt="foo bar"></image>]' );

			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );

			// Make sure successive execute does not throw, e.g. attempting
			// to display the form twice.
			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );
		} );

		it( 'should set alt attribute value to textarea and select it', () => {
			const spy = sinon.spy( form.labeledInput, 'select' );

			setData( doc, '[<image src="" alt="foo bar"></image>]' );

			button.fire( 'execute' );
			sinon.assert.calledOnce( spy );
			expect( form.labeledInput.value ).equals( 'foo bar' );
		} );

		it( 'should set empty text to textarea and select it when there is no alt attribute', () => {
			const spy = sinon.spy( form.labeledInput, 'select' );

			setData( doc, '[<image src=""></image>]' );

			button.fire( 'execute' );
			sinon.assert.calledOnce( spy );
			expect( form.labeledInput.value ).equals( '' );
		} );
	} );

	describe( 'balloon panel form', () => {
		// https://github.com/ckeditor/ckeditor5-image/issues/114
		it( 'should make sure the input always stays in sync with the value of the command', () => {
			const button = editor.ui.componentFactory.create( 'imageTextAlternative' );

			// Mock the value of the input after some past editing.
			form.labeledInput.value = 'foo';

			// Mock the user using the form, changing the value but clicking "Cancel".
			// so the command's value is not updated.
			form.labeledInput.inputView.element.value = 'This value was canceled.';

			// Mock the user editing the same image once again.
			setData( doc, '[<image src="" alt="foo"></image>]' );

			button.fire( 'execute' );
			expect( form.labeledInput.inputView.element.value ).to.equal( 'foo' );
		} );

		it( 'should execute command on submit', () => {
			const spy = sinon.spy( editor, 'execute' );
			form.fire( 'submit' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'imageTextAlternative', {
				newValue: form.labeledInput.inputView.element.value
			} );
		} );

		it( 'should hide the panel on cancel and focus the editing view', () => {
			const spy = sinon.spy( editor.editing.view, 'focus' );

			setData( doc, '[<image src="" alt="foo bar"></image>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );

			form.fire( 'cancel' );
			expect( balloon.visibleView ).to.be.null;
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not engage when the form is in the balloon yet invisible', () => {
			setData( doc, '[<image src=""></image>]' );
			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( form );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( { view: lastView } );
			expect( balloon.visibleView ).to.equal( lastView );

			button.fire( 'execute' );
			expect( balloon.visibleView ).to.equal( lastView );
		} );

		describe( 'integration with the editor selection (#render event)', () => {
			it( 'should re-position the form', () => {
				setData( doc, '[<image src=""></image>]' );
				button.fire( 'execute' );

				const spy = sinon.spy( balloon, 'updatePosition' );

				editingView.fire( 'render' );
				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'integration with the editor focus', () => {
			it( 'should hide the toolbar when the editor loses focus and the image is selected', () => {
				editor.ui.focusTracker.isFocused = true;

				setData( doc, '[<image src=""></image>]' );
				button.fire( 'execute' );

				const spy = sinon.spy( balloon, 'remove' );

				editor.ui.focusTracker.isFocused = false;
				sinon.assert.calledWithExactly( spy, form );
			} );
		} );

		describe( 'close listeners', () => {
			describe( 'keyboard', () => {
				it( 'should close upon Esc key press and focus the editing view', () => {
					const hideSpy = sinon.spy( plugin, '_hideForm' );
					const focusSpy = sinon.spy( editor.editing.view, 'focus' );

					setData( doc, '[<image src=""></image>]' );
					button.fire( 'execute' );

					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					form.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( hideSpy );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( focusSpy );
				} );
			} );

			describe( 'mouse', () => {
				it( 'should close and not focus editable on click outside the panel', () => {
					const hideSpy = sinon.spy( plugin, '_hideForm' );
					const focusSpy = sinon.spy( editor.editing.view, 'focus' );

					setData( doc, '[<image src=""></image>]' );
					button.fire( 'execute' );

					global.document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
					sinon.assert.called( hideSpy );
					sinon.assert.notCalled( focusSpy );
				} );

				it( 'should not close on click inside the panel', () => {
					const spy = sinon.spy( plugin, '_hideForm' );

					setData( doc, '[<image src=""></image>]' );
					button.fire( 'execute' );

					form.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
					sinon.assert.notCalled( spy );
				} );
			} );
		} );
	} );
} );
