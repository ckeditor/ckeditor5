/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from 'tests/core/_utils/classictesteditor.js';
import Italic from 'ckeditor5/basic-styles/italic.js';
import ItalicEngine from 'ckeditor5/basic-styles/italicengine.js';
import ButtonView from 'ckeditor5/ui/button/buttonview.js';
import testUtils from 'tests/core/_utils/utils.js';
import { keyCodes } from 'ckeditor5/utils/keyboard.js';

testUtils.createSinonSandbox();

describe( 'Italic', () => {
	let editor, italicView;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
				features: [ Italic ]
			} )
			.then( newEditor => {
				editor = newEditor;

				italicView = editor.ui.featureComponents.create( 'italic' );
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
		expect( italicView ).to.be.instanceOf( ButtonView );
		expect( italicView.isOn ).to.be.false;
		expect( italicView.label ).to.equal( 'Italic' );
		expect( italicView.icon ).to.equal( 'italic' );
		expect( italicView.keystroke ).to.equal( 'CTRL+I' );
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

		const wasHandled = editor.keystrokes.press( { keyCode: keyCodes.i, ctrlKey: true } );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
	} );
} );
