/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import UnderlineEditing from '../../src/underline/underlineediting.js';
import UnderlineUI from '../../src/underline/underlineui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

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
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( UnderlineUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( UnderlineUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			underlineView = editor.ui.componentFactory.create( 'underline' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			underlineView = editor.ui.componentFactory.create( 'menuBar:underline' );
		} );

		testButton();
	} );

	function testButton() {
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

			expect( underlineView.isEnabled ).to.be.true;

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
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( wasHandled ).to.be.true;
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'underline' );

			command.value = true;

			expect( underlineView.isOn ).to.be.true;

			command.value = false;

			expect( underlineView.isOn ).to.be.false;
		} );
	}
} );
