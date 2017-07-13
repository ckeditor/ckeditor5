/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import View from '../../src/view';
import ToolbarView from '../../src/toolbar/toolbarview';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import enableToolbarKeyboardFocus from '../../src/toolbar/enabletoolbarkeyboardfocus';

describe( 'enableToolbarKeyboardFocus()', () => {
	let origin, originFocusTracker, originKeystrokeHandler, toolbar;

	beforeEach( () => {
		origin = viewCreator();
		originFocusTracker = new FocusTracker();
		originKeystrokeHandler = new KeystrokeHandler();
		toolbar = new ToolbarView();

		enableToolbarKeyboardFocus( {
			origin,
			originFocusTracker,
			originKeystrokeHandler,
			toolbar
		} );

		toolbar.init();
	} );

	it( 'focuses the toolbar on Alt+F10', () => {
		const spy = sinon.spy( toolbar, 'focus' );
		const toolbarFocusTracker = toolbar.focusTracker;
		const keyEvtData = {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		toolbarFocusTracker.isFocused = false;
		originFocusTracker.isFocused = false;

		originKeystrokeHandler.press( keyEvtData );
		sinon.assert.notCalled( spy );

		toolbarFocusTracker.isFocused = true;
		originFocusTracker.isFocused = true;

		originKeystrokeHandler.press( keyEvtData );
		sinon.assert.notCalled( spy );

		toolbarFocusTracker.isFocused = false;
		originFocusTracker.isFocused = true;

		originKeystrokeHandler.press( keyEvtData );
		sinon.assert.calledOnce( spy );

		sinon.assert.calledOnce( keyEvtData.preventDefault );
		sinon.assert.calledOnce( keyEvtData.stopPropagation );
	} );

	it( 're–foucuses origin on Esc', () => {
		const spy = origin.focus = sinon.spy();
		const toolbarFocusTracker = toolbar.focusTracker;
		const keyEvtData = {
			keyCode: keyCodes.esc,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		toolbarFocusTracker.isFocused = false;

		toolbar.keystrokes.press( keyEvtData );
		sinon.assert.notCalled( spy );

		toolbarFocusTracker.isFocused = true;

		toolbar.keystrokes.press( keyEvtData );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledOnce( keyEvtData.preventDefault );
		sinon.assert.calledOnce( keyEvtData.stopPropagation );
	} );

	it( 'supports beforeFocus and afterBlur callbacks', () => {
		const beforeFocus = sinon.spy();
		const afterBlur = sinon.spy();

		origin = viewCreator();
		originFocusTracker = new FocusTracker();
		originKeystrokeHandler = new KeystrokeHandler();
		toolbar = new ToolbarView();

		const toolbarFocusSpy = sinon.spy( toolbar, 'focus' );
		const originFocusSpy = origin.focus = sinon.spy();
		const toolbarFocusTracker = toolbar.focusTracker;

		enableToolbarKeyboardFocus( {
			origin,
			originFocusTracker,
			originKeystrokeHandler,
			toolbar,
			beforeFocus,
			afterBlur
		} );

		toolbar.init();

		let keyEvtData = {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		toolbarFocusTracker.isFocused = false;
		originFocusTracker.isFocused = true;

		originKeystrokeHandler.press( keyEvtData );
		sinon.assert.callOrder( beforeFocus, toolbarFocusSpy );

		keyEvtData = {
			keyCode: keyCodes.esc,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		toolbarFocusTracker.isFocused = true;

		toolbar.keystrokes.press( keyEvtData );
		sinon.assert.callOrder( originFocusSpy, afterBlur );
	} );
} );

function viewCreator( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}
