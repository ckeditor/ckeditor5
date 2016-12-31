/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from 'ckeditor5-core/tests/_utils/classictesteditor';
import Bold from 'ckeditor5-basic-styles/src/bold';
import BoldEngine from 'ckeditor5-basic-styles/src/boldengine';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import testUtils from 'ckeditor5-core/tests/_utils/utils';
import { keyCodes } from 'ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'Bold', () => {
	let editor, boldView;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
				plugins: [ Bold ]
			} )
			.then( newEditor => {
				editor = newEditor;

				boldView = editor.ui.componentFactory.create( 'bold' );
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
		expect( boldView ).to.be.instanceOf( ButtonView );
		expect( boldView.isOn ).to.be.false;
		expect( boldView.label ).to.equal( 'Bold' );
		expect( boldView.icon ).to.match( /<svg / );
		expect( boldView.keystroke ).to.equal( 'CTRL+B' );
	} );

	it( 'should execute bold command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		boldView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'bold' );
	} );

	it( 'should bind model to bold command', () => {
		const command = editor.commands.get( 'bold' );

		expect( boldView.isOn ).to.be.false;

		expect( boldView.isEnabled ).to.be.true;

		command.value = true;
		expect( boldView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( boldView.isEnabled ).to.be.false;
	} );

	it( 'should set keystroke in the model', () => {
		expect( boldView.keystroke ).to.equal( 'CTRL+B' );
	} );

	it( 'should set editor keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( { keyCode: keyCodes.b, ctrlKey: true } );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
	} );
} );
