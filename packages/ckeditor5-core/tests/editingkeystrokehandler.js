/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from 'ckeditor5-core/tests/_utils/virtualtesteditor';
import EditingKeystrokeHandler from 'ckeditor5-core/src/editingkeystrokehandler';
import testUtils from 'ckeditor5-core/tests/_utils/utils';
import { keyCodes } from 'ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'EditingKeystrokeHandler', () => {
	let editor;

	beforeEach( () => {
		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				editor.keystrokes = new EditingKeystrokeHandler( editor );
			} );
	} );

	describe( 'listenTo()', () => {
		it( 'prevents default when keystroke was handled', () => {
			const keyEvtData = { keyCode: 1, preventDefault: testUtils.sinon.spy() };

			testUtils.sinon.stub( EditingKeystrokeHandler.prototype, 'press' ).returns( true );

			editor.editing.view.fire( 'keydown', keyEvtData );

			sinon.assert.calledOnce( keyEvtData.preventDefault );
		} );
	} );

	describe( 'press()', () => {
		it( 'executes a command', () => {
			const spy = testUtils.sinon.stub( editor, 'execute' );

			editor.keystrokes.set( 'ctrl + A', 'foo' );

			const wasHandled = editor.keystrokes.press( getCtrlA() );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'foo' );
			expect( wasHandled ).to.be.true;
		} );
	} );
} );

function getCtrlA() {
	return { keyCode: keyCodes.a, ctrlKey: true };
}
