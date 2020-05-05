/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import StrikethroughEditing from '../../src/strikethrough/strikethroughediting';
import StrikethroughUI from '../../src/strikethrough/strikethroughui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'StrikethroughUI', () => {
	let editor, strikeView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, StrikethroughEditing, StrikethroughUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				strikeView = editor.ui.componentFactory.create( 'strikethrough' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should register strikethrough feature component', () => {
		expect( strikeView ).to.be.instanceOf( ButtonView );
		expect( strikeView.isOn ).to.be.false;
		expect( strikeView.label ).to.equal( 'Strikethrough' );
		expect( strikeView.icon ).to.match( /<svg / );
		expect( strikeView.keystroke ).to.equal( 'CTRL+SHIFT+X' );
		expect( strikeView.isToggleable ).to.be.true;
	} );

	it( 'should execute strikethrough command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		strikeView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'strikethrough' );
	} );

	it( 'should bind model to strikethrough command', () => {
		const command = editor.commands.get( 'strikethrough' );

		expect( strikeView.isOn ).to.be.false;
		expect( strikeView.isEnabled ).to.be.true;

		command.value = true;
		expect( strikeView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( strikeView.isEnabled ).to.be.false;
	} );

	it( 'should set keystroke in the model', () => {
		expect( strikeView.keystroke ).to.equal( 'CTRL+SHIFT+X' );
	} );

	it( 'should set editor keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes.x,
			shiftKey: true,
			ctrlKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		const wasHandled = editor.keystrokes.press( keyEventData );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
		expect( keyEventData.preventDefault.calledOnce ).to.be.true;
	} );
} );
