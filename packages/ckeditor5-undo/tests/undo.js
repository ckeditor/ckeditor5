/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Undo from '../src/undo';
import UndoEngine from '../src/undoengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'Undo', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Undo ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Undo ) ).to.be.instanceOf( Undo );
	} );

	it( 'should load UndoEngine', () => {
		expect( editor.plugins.get( UndoEngine ) ).to.be.instanceOf( UndoEngine );
	} );

	testButton( 'undo', 'Undo', 'CTRL+Z' );
	testButton( 'redo', 'Redo', 'CTRL+Y' );

	it( 'should set CTRL+Z keystroke', () => {
		const spy = sinon.stub( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.z,
			ctrlKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy.calledWithExactly( 'undo' ) ).to.be.true;
	} );

	it( 'should set CTRL+Y keystroke', () => {
		const spy = sinon.stub( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.y,
			ctrlKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy.calledWithExactly( 'redo' ) ).to.be.true;
	} );

	it( 'should set CTRL+SHIFT+Z keystroke', () => {
		const spy = sinon.stub( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes.z,
			ctrlKey: true,
			shiftKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		const wasHandled = editor.keystrokes.press( keyEventData );

		expect( wasHandled ).to.be.true;
		expect( spy.calledWithExactly( 'redo' ) ).to.be.true;
		expect( keyEventData.preventDefault.calledOnce ).to.be.true;
	} );

	function testButton( featureName, label, featureKeystroke ) {
		describe( `${ featureName } button`, () => {
			let button;

			beforeEach( () => {
				button = editor.ui.componentFactory.create( featureName );
			} );

			it( 'should register feature component', () => {
				expect( button ).to.be.instanceOf( ButtonView );
			} );

			it( 'should create UI component with correct attribute values', () => {
				expect( button.isOn ).to.be.false;
				expect( button.label ).to.equal( label );
				expect( button.icon ).to.match( /<svg / );
				expect( button.keystroke ).to.equal( featureKeystroke );
			} );

			it( `should execute ${ featureName } command on model execute event`, () => {
				const executeSpy = testUtils.sinon.stub( editor, 'execute' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy, featureName );
			} );

			it( `should bind model to ${ featureName } command`, () => {
				const command = editor.commands.get( featureName );

				expect( button.isOn ).to.be.false;

				const initState = command.isEnabled;
				expect( button.isEnabled ).to.equal( initState );

				command.isEnabled = !initState;
				expect( button.isEnabled ).to.equal( !initState );
			} );

			it( 'should set keystroke in the model', () => {
				expect( button.keystroke ).to.equal( featureKeystroke );
			} );
		} );
	}
} );
