/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '../tests/_utils/virtualtesteditor';
import EditingKeystrokeHandler from '../src/editingkeystrokehandler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'EditingKeystrokeHandler', () => {
	let editor, keystrokes;

	beforeEach( () => {
		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				keystrokes = new EditingKeystrokeHandler( editor );
			} );
	} );

	describe( 'listenTo()', () => {
		it( 'prevents default when keystroke was handled', () => {
			const keyEvtData = { keyCode: 1, preventDefault: sinon.spy() };

			sinon.stub( keystrokes, 'press' ).returns( true );

			keystrokes.listenTo( editor.editing.view );
			editor.editing.view.fire( 'keydown', keyEvtData );

			sinon.assert.calledOnce( keyEvtData.preventDefault );
		} );

		it( 'does not prevent default when keystroke was not handled', () => {
			const keyEvtData = { keyCode: 1, preventDefault: sinon.spy() };

			sinon.stub( keystrokes, 'press' ).returns( false );

			keystrokes.listenTo( editor.editing.view );
			editor.editing.view.fire( 'keydown', keyEvtData );

			sinon.assert.notCalled( keyEvtData.preventDefault );
		} );
	} );

	describe( 'press()', () => {
		it( 'executes a command', () => {
			const spy = sinon.stub( editor, 'execute' );

			keystrokes.set( 'ctrl + A', 'foo' );

			const wasHandled = keystrokes.press( getCtrlA() );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'foo' );
			expect( wasHandled ).to.be.true;
		} );

		it( 'executes a callback', () => {
			const executeSpy = sinon.stub( editor, 'execute' );
			const callback = sinon.spy();

			keystrokes.set( 'ctrl + A', callback );

			const wasHandled = keystrokes.press( getCtrlA() );

			expect( executeSpy.called ).to.be.false;
			expect( callback.calledOnce ).to.be.true;
			expect( wasHandled ).to.be.true;
		} );
	} );
} );

function getCtrlA() {
	return { keyCode: keyCodes.a, ctrlKey: true };
}
