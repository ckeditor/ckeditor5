/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import View from '../../src/view';
import ComponentFactory from '../../src/componentfactory';
import ToolbarView from '../../src/toolbar/toolbarview';
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import {
	expandToolbarConfig,
	enableToolbarKeyboardFocus
} from '../../src/toolbar/utils';

describe( 'utils', () => {
	describe( 'expandToolbarConfig()', () => {
		let factory;

		beforeEach( () => {
			factory = new ComponentFactory( new Editor() );

			factory.add( 'foo', viewCreator( 'foo' ) );
			factory.add( 'bar', viewCreator( 'bar' ) );
		} );

		it( 'returns a promise', () => {
			expect( expandToolbarConfig() ).to.be.instanceOf( Promise );
		} );

		it( 'expands the config into collection', () => {
			const collection = new Collection();

			return expandToolbarConfig( [ 'foo', 'bar', 'foo' ], collection, factory )
				.then( () => {
					expect( collection ).to.have.length( 3 );
					expect( collection.get( 0 ).name ).to.equal( 'foo' );
					expect( collection.get( 1 ).name ).to.equal( 'bar' );
					expect( collection.get( 2 ).name ).to.equal( 'foo' );
				} );
		} );
	} );

	describe( 'enableToolbarKeyboardFocus()', () => {
		let origin, originFocusTracker, originKeystrokeHandler, toolbar;

		beforeEach( () => {
			origin = viewCreator();
			originFocusTracker = new FocusTracker();
			originKeystrokeHandler = new KeystrokeHandler();
			toolbar = new ToolbarView();

			enableToolbarKeyboardFocus( {
				origin: origin,
				originFocusTracker: originFocusTracker,
				originKeystrokeHandler: originKeystrokeHandler,
				toolbar: toolbar
			} );

			return toolbar.init();
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
			const keyEvtData = { keyCode: keyCodes.esc,
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
	} );
} );

function viewCreator( name ) {
	return ( locale ) => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}
