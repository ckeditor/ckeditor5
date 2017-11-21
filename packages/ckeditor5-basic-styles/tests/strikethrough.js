/**
 * @license Copyright (c) 2003-2017, CKSource - Rémy Hubscher. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Strikethrough from '../src/strikethrough';
import StrikethroughEngine from '../src/strikethroughengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'Strikethrough', () => {
	let editor, strikeView;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Strikethrough ]
			} )
			.then( newEditor => {
				editor = newEditor;

				strikeView = editor.ui.componentFactory.create( 'strike' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Strikethrough ) ).to.be.instanceOf( Strikethrough );
	} );

	it( 'should load StrikethroughEngine', () => {
		expect( editor.plugins.get( StrikethroughEngine ) ).to.be.instanceOf( StrikethroughEngine );
	} );

	it( 'should register strike feature component', () => {
		expect( strikeView ).to.be.instanceOf( ButtonView );
		expect( strikeView.isOn ).to.be.false;
		expect( strikeView.label ).to.equal( 'Strikethrough' );
		expect( strikeView.icon ).to.match( /<svg / );
		expect( strikeView.keystroke ).to.equal( 'CTRL+SHIFT+X' );
	} );

	it( 'should execute strike command on model execute event', () => {
		const executeSpy = testUtils.sinon.spy( editor, 'execute' );

		strikeView.fire( 'execute' );

		sinon.assert.calledOnce( executeSpy );
		sinon.assert.calledWithExactly( executeSpy, 'strike' );
	} );

	it( 'should bind model to strike command', () => {
		const command = editor.commands.get( 'strike' );

		expect( strikeView.isOn ).to.be.false;

		expect( strikeView.isEnabled ).to.be.false;

		command.value = true;
		expect( strikeView.isOn ).to.be.true;

		command.isEnabled = true;
		expect( strikeView.isEnabled ).to.be.true;
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
