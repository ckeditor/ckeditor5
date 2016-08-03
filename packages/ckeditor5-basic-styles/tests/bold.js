/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '/tests/core/_utils/classictesteditor.js';
import Bold from '/ckeditor5/basic-styles/bold.js';
import BoldEngine from '/ckeditor5/basic-styles/boldengine.js';
import ButtonController from '/ckeditor5/ui/button/button.js';
import testUtils from '/tests/core/_utils/utils.js';
import { keyCodes } from '/ckeditor5/utils/keyboard.js';

testUtils.createSinonSandbox();

describe( 'Bold', () => {
	let editor, boldController;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
				features: [ Bold ]
			} )
			.then( newEditor => {
				editor = newEditor;

				boldController = editor.ui.featureComponents.create( 'bold' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Bold ) ).to.be.instanceOf( Bold );
	} );

	it( 'should load BoldEngine', () => {
		expect( editor.plugins.get( BoldEngine ) ).to.be.instanceOf( BoldEngine );
	} );

	it( 'should register bold feature component', () => {
		expect( boldController ).to.be.instanceOf( ButtonController );
	} );

	it( 'should execute bold command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );
		const model = boldController.model;

		model.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'bold' );
	} );

	it( 'should bind model to bold command', () => {
		const model = boldController.model;
		const command = editor.commands.get( 'bold' );

		expect( model.isOn ).to.be.false;

		expect( model.isEnabled ).to.be.true;

		command.value = true;
		expect( model.isOn ).to.be.true;

		command.isEnabled = false;
		expect( model.isEnabled ).to.be.false;
	} );

	it( 'should set CTRL+B keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( { keyCode: keyCodes.b, ctrlKey: true } );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
	} );
} );
