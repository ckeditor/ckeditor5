/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Underline from '../src/underline';
import UnderlineEngine from '../src/underlineengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'Underline', () => {
	let editor, underlineView;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Underline ]
			} )
			.then( newEditor => {
				editor = newEditor;

				underlineView = editor.ui.componentFactory.create( 'underline' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Underline ) ).to.be.instanceOf( Underline );
	} );

	it( 'should load UnderlineEngine', () => {
		expect( editor.plugins.get( UnderlineEngine ) ).to.be.instanceOf( UnderlineEngine );
	} );

	it( 'should register underline feature component', () => {
		expect( underlineView ).to.be.instanceOf( ButtonView );
		expect( underlineView.isOn ).to.be.false;
		expect( underlineView.label ).to.equal( 'Underline' );
		expect( underlineView.icon ).to.match( /<svg / );
		expect( underlineView.keystroke ).to.equal( 'CTRL+U' );
	} );

	it( 'should execute underline command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		underlineView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'underline' );
	} );

	it( 'should bind model to underline command', () => {
		const command = editor.commands.get( 'underline' );

		expect( underlineView.isOn ).to.be.false;

		expect( underlineView.isEnabled ).to.be.false;

		command.value = true;
		expect( underlineView.isOn ).to.be.true;

		command.isEnabled = true;
		expect( underlineView.isEnabled ).to.be.true;
	} );

	it( 'should set keystroke in the model', () => {
		expect( underlineView.keystroke ).to.equal( 'CTRL+U' );
	} );

	it( 'should set editor keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.u,
			ctrlKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
	} );
} );
