/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ItalicEditing from '../../src/italic/italicediting';
import ItalicUI from '../../src/italic/italicui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'ItalicUI', () => {
	let editor, italicView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, ItalicEditing, ItalicUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				italicView = editor.ui.componentFactory.create( 'italic' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should register italic feature component', () => {
		expect( italicView ).to.be.instanceOf( ButtonView );
		expect( italicView.isOn ).to.be.false;
		expect( italicView.label ).to.equal( 'Italic' );
		expect( italicView.icon ).to.match( /<svg / );
		expect( italicView.keystroke ).to.equal( 'CTRL+I' );
		expect( italicView.isToggleable ).to.be.true;
	} );

	it( 'should execute italic command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		italicView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'italic' );
	} );

	it( 'should bind model to italic command', () => {
		const command = editor.commands.get( 'italic' );

		expect( italicView.isOn ).to.be.false;
		expect( italicView.isEnabled ).to.be.true;

		command.value = true;
		expect( italicView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( italicView.isEnabled ).to.be.false;
	} );

	it( 'should set keystroke in the model', () => {
		expect( italicView.keystroke ).to.equal( 'CTRL+I' );
	} );

	it( 'should set editor keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.i,
			ctrlKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
	} );
} );
