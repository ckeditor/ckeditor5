/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Bold from '../src/bold';
import BoldEngine from '../src/boldengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'Bold', () => {
	let editor, boldView;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
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

		expect( boldView.isEnabled ).to.be.false;

		command.value = true;
		expect( boldView.isOn ).to.be.true;

		command.isEnabled = true;
		expect( boldView.isEnabled ).to.be.true;
	} );

	it( 'should set keystroke in the model', () => {
		expect( boldView.keystroke ).to.equal( 'CTRL+B' );
	} );

	it( 'should set editor keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes.b,
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
