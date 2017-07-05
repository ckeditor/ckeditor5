/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, Event */

import ToolbarView from '../../src/toolbar/toolbarview';
import ToolbarSeparatorView from '../../src/toolbar/toolbarseparatorview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import ComponentFactory from '../../src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '../../src/focuscycler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import ViewCollection from '../../src/viewcollection';
import View from '../../src/view';

describe( 'ToolbarView', () => {
	let locale, view;

	beforeEach( () => {
		locale = {};
		view = new ToolbarView( locale );
		view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should create view#children collection', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'registers #items in #focusTracker', () => {
			const spyAdd = sinon.spy( view.focusTracker, 'add' );
			const spyRemove = sinon.spy( view.focusTracker, 'remove' );

			view.items.add( focusable() );
			view.items.add( focusable() );

			sinon.assert.calledTwice( spyAdd );

			view.items.remove( 1 );
			sinon.assert.calledOnce( spyRemove );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck-toolbar' ) ).to.true;
		} );

		describe( 'event listeners', () => {
			it( 'prevent default on #mousedown', () => {
				const evt = new Event( 'mousedown', { bubbles: true } );
				const spy = sinon.spy( evt, 'preventDefault' );

				view.element.dispatchEvent( evt );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new ToolbarView();

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.init();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "arrowup" focuses previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowup,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// No children to focus.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				view.items.add( nonFocusable() );
				view.items.add( nonFocusable() );

				// No focusable children.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledTwice( keyEvtData.preventDefault );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 4 ).element;

				const spy = sinon.spy( view.items.get( 2 ), 'focus' );
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledThrice( keyEvtData.preventDefault );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "arrowleft" focuses previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 2 ).element;

				const spy = sinon.spy( view.items.get( 0 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "arrowdown" focuses next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// No children to focus.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				view.items.add( nonFocusable() );
				view.items.add( nonFocusable() );

				// No focusable children.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledTwice( keyEvtData.preventDefault );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 4 ).element;

				const spy = sinon.spy( view.items.get( 2 ), 'focus' );
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledThrice( keyEvtData.preventDefault );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "arrowright" focuses next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 0 ).element;

				const spy = sinon.spy( view.items.get( 2 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first focusable item in DOM', () => {
			// No children to focus.
			view.focus();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = sinon.spy( view.items.get( 1 ), 'focus' );
			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'fillFromConfig()', () => {
		let factory;

		beforeEach( () => {
			factory = new ComponentFactory( {} );

			factory.add( 'foo', namedFactory( 'foo' ) );
			factory.add( 'bar', namedFactory( 'bar' ) );
		} );

		it( 'does not throw when no config is provided', () => {
			expect( () => {
				view.fillFromConfig();
			} ).to.not.throw();
		} );

		it( 'expands the config into collection', () => {
			view.fillFromConfig( [ 'foo', 'bar', '|', 'foo' ], factory );

			const items = view.items;

			expect( items ).to.have.length( 4 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ).name ).to.equal( 'bar' );
			expect( items.get( 2 ) ).to.be.instanceOf( ToolbarSeparatorView );
			expect( items.get( 3 ).name ).to.equal( 'foo' );
		} );
	} );
} );

function focusable() {
	const view = nonFocusable();

	view.focus = () => {};

	return view;
}

function nonFocusable() {
	const view = new View();
	view.element = document.createElement( 'li' );

	return view;
}

function namedFactory( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}
