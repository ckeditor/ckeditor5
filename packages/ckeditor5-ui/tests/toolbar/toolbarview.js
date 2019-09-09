/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event, console */

import ToolbarView from '../../src/toolbar/toolbarview';
import ToolbarSeparatorView from '../../src/toolbar/toolbarseparatorview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import ComponentFactory from '../../src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '../../src/focuscycler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import ViewCollection from '../../src/viewcollection';
import View from '../../src/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'ToolbarView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'pl', {
			'Editor toolbar': 'Pasek narzędzi edytora'
		} );
		addTranslations( 'en', {
			'Editor toolbar': 'Editor toolbar'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		locale = new Locale();
		view = new ToolbarView( locale );
		view.render();
	} );

	afterEach( () => {
		sinon.restore();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should set view#isVertical', () => {
			expect( view.isVertical ).to.be.false;
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
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-toolbar' ) ).to.true;
		} );

		describe( 'attributes', () => {
			it( 'should be defined', () => {
				expect( view.element.getAttribute( 'role' ) ).to.equal( 'toolbar' );
				expect( view.element.getAttribute( 'aria-label' ) ).to.equal( 'Editor toolbar' );
			} );

			it( 'should allow a custom aria-label', () => {
				const view = new ToolbarView( locale );

				view.ariaLabel = 'Custom label';

				view.render();

				expect( view.element.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );
			} );

			it( 'should allow the aria-label to be translated', () => {
				const view = new ToolbarView( new Locale( { uiLanguage: 'pl' } ) );

				view.render();

				expect( view.element.getAttribute( 'aria-label' ) ).to.equal( 'Pasek narzędzi edytora' );
			} );
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

	describe( 'element bindings', () => {
		describe( 'class', () => {
			it( 'reacts on view#isVertical', () => {
				view.isVertical = false;
				expect( view.element.classList.contains( 'ck-toolbar_vertical' ) ).to.be.false;

				view.isVertical = true;
				expect( view.element.classList.contains( 'ck-toolbar_vertical' ) ).to.be.true;
			} );

			it( 'reacts on view#class', () => {
				view.class = 'foo';
				expect( view.element.classList.contains( 'foo' ) ).to.be.true;

				view.class = 'bar';
				expect( view.element.classList.contains( 'bar' ) ).to.be.true;

				view.class = false;
				expect( view.element.classList.contains( 'foo' ) ).to.be.false;
				expect( view.element.classList.contains( 'bar' ) ).to.be.false;
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers #items in #focusTracker', () => {
			const view = new ToolbarView( locale );
			const spyAdd = sinon.spy( view.focusTracker, 'add' );
			const spyRemove = sinon.spy( view.focusTracker, 'remove' );

			view.items.add( focusable() );
			view.items.add( focusable() );
			sinon.assert.notCalled( spyAdd );

			view.render();
			sinon.assert.calledTwice( spyAdd );

			view.items.remove( 1 );
			sinon.assert.calledOnce( spyRemove );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new ToolbarView( new Locale() );
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
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

	describe( 'focusLast()', () => {
		it( 'focuses the last focusable item in DOM', () => {
			// No children to focus.
			view.focusLast();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = sinon.spy( view.items.get( 3 ), 'focus' );
			view.focusLast();

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

		it( 'expands the config into collection', () => {
			view.fillFromConfig( [ 'foo', 'bar', '|', 'foo' ], factory );

			const items = view.items;

			expect( items ).to.have.length( 4 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ).name ).to.equal( 'bar' );
			expect( items.get( 2 ) ).to.be.instanceOf( ToolbarSeparatorView );
			expect( items.get( 3 ).name ).to.equal( 'foo' );
		} );

		it( 'warns if there is no such component in the factory', () => {
			const items = view.items;
			const consoleWarnStub = sinon.stub( console, 'warn' );

			view.fillFromConfig( [ 'foo', 'bar', 'baz' ], factory );

			expect( items ).to.have.length( 2 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ).name ).to.equal( 'bar' );

			sinon.assert.calledOnce( consoleWarnStub );
			sinon.assert.calledWithExactly( consoleWarnStub,
				sinon.match( /^toolbarview-item-unavailable/ ),
				{ name: 'baz' }
			);
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
