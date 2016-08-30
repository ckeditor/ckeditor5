/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '/tests/core/_utils/classictesteditor.js';
import Italic from '/ckeditor5/basic-styles/italic.js';
import ItalicEngine from '/ckeditor5/basic-styles/italicengine.js';
import ButtonController from '/ckeditor5/ui/button/button.js';
import testUtils from '/tests/core/_utils/utils.js';
import { keyCodes } from '/ckeditor5/utils/keyboard.js';

testUtils.createSinonSandbox();

describe( 'Italic', () => {
	let editor, italicController;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
				features: [ Italic ]
			} )
			.then( newEditor => {
				editor = newEditor;

				italicController = editor.ui.featureComponents.create( 'italic' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Italic ) ).to.be.instanceOf( Italic );
	} );

	it( 'should load ItalicEngine', () => {
		expect( editor.plugins.get( ItalicEngine ) ).to.be.instanceOf( ItalicEngine );
	} );

	it( 'should register italic feature component', () => {
		expect( italicController ).to.be.instanceOf( ButtonController );
	} );

	it( 'should execute italic command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const model = italicController.model;

		model.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'italic' );
	} );

	it( 'should bind model to italic command', () => {
		const model = italicController.model;
		const command = editor.commands.get( 'italic' );

		expect( model.isOn ).to.be.false;

		expect( model.isEnabled ).to.be.true;

		command.value = true;
		expect( model.isOn ).to.be.true;

		command.isEnabled = false;
		expect( model.isEnabled ).to.be.false;
	} );

	it( 'should set keystroke in the model', () => {
		expect( italicController.model.keystroke ).to.equal( 'CTRL+I' );
	} );

	it( 'should set editor keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( { keyCode: keyCodes.i, ctrlKey: true } );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
	} );
} );
