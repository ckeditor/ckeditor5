/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Italic from '../src/italic';
import ItalicEngine from '../src/italicengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'Italic', () => {
	let editor, italicView;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Italic ]
			} )
			.then( newEditor => {
				editor = newEditor;

				italicView = editor.ui.componentFactory.create( 'italic' );
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
		expect( italicView.icon ).to.match( /<svg / );
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

		expect( italicView.isEnabled ).to.be.false;

		command.value = true;
		expect( italicView.isOn ).to.be.true;

		command.isEnabled = true;
		expect( italicView.isEnabled ).to.be.true;
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
