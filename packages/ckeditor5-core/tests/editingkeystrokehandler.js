/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '../tests/_utils/virtualtesteditor';
import EditingKeystrokeHandler from '../src/editingkeystrokehandler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'EditingKeystrokeHandler', () => {
	let editor, keystrokes, executeSpy;

	beforeEach( () => {
		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				keystrokes = new EditingKeystrokeHandler( editor );
				executeSpy = sinon.stub( editor, 'execute' );
			} );
	} );

	describe( 'set()', () => {
		describe( 'with a command', () => {
			it( 'prevents default when the keystroke was handled', () => {
				const keyEvtData = getCtrlA();

				keystrokes.set( 'Ctrl+A', 'foo' );
				keystrokes.press( keyEvtData );

				sinon.assert.calledWithExactly( executeSpy, 'foo' );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
			} );

			it( 'does not prevent default when the keystroke was not handled', () => {
				const keyEvtData = getCtrlA();

				keystrokes.press( keyEvtData );

				sinon.assert.notCalled( executeSpy );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
			} );
		} );

		describe( 'with a callback', () => {
			it( 'never prevents default', () => {
				const callback = sinon.spy();
				const keyEvtData = getCtrlA();

				keystrokes.set( 'Ctrl+A', callback );
				keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( callback );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
			} );
		} );
	} );

	describe( 'press()', () => {
		it( 'executes a command', () => {
			keystrokes.set( 'Ctrl+A', 'foo' );

			const wasHandled = keystrokes.press( getCtrlA() );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'foo' );
			expect( wasHandled ).to.be.true;
		} );

		it( 'executes a callback', () => {
			const callback = sinon.spy();

			keystrokes.set( 'Ctrl+A', callback );

			const wasHandled = keystrokes.press( getCtrlA() );

			expect( executeSpy.called ).to.be.false;
			expect( callback.calledOnce ).to.be.true;
			expect( wasHandled ).to.be.true;
		} );
	} );
} );

function getCtrlA() {
	return {
		keyCode: keyCodes.a,
		ctrlKey: true,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};
}
