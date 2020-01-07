/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import UnderlineEditing from '../../src/underline/underlineediting';
import UnderlineUI from '../../src/underline/underlineui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'Underline', () => {
	let editor, underlineView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, UnderlineEditing, UnderlineUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				underlineView = editor.ui.componentFactory.create( 'underline' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should register underline feature component', () => {
		expect( underlineView ).to.be.instanceOf( ButtonView );
		expect( underlineView.isOn ).to.be.false;
		expect( underlineView.label ).to.equal( 'Underline' );
		expect( underlineView.icon ).to.match( /<svg / );
		expect( underlineView.keystroke ).to.equal( 'CTRL+U' );
		expect( underlineView.isToggleable ).to.be.true;
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
		expect( underlineView.isEnabled ).to.be.true;

		command.value = true;
		expect( underlineView.isOn ).to.be.true;

		command.isEnabled = false;
		expect( underlineView.isEnabled ).to.be.false;
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
