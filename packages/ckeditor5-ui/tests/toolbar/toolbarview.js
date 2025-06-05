/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ToolbarView from '../../src/toolbar/toolbarview.js';
import ToolbarSeparatorView from '../../src/toolbar/toolbarseparatorview.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import ComponentFactory from '../../src/componentfactory.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '../../src/focuscycler.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import ViewCollection from '../../src/viewcollection.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import View from '../../src/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver.js';
import ToolbarLineBreakView from '../../src/toolbar/toolbarlinebreakview.js';
import DropdownView from '../../src/dropdown/dropdownview.js';
import {
	IconAlignLeft,
	IconBold,
	IconImportExport,
	IconParagraph,
	IconPlus,
	IconText,
	IconThreeVerticalDots
} from '@ckeditor/ckeditor5-icons';

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

		// Clean up after the ResizeObserver stub in beforeEach(). Even though the global.window.ResizeObserver
		// stub is restored, the ResizeObserver class (CKE5 module) keeps the reference to the single native
		// observer. Resetting it will allow fresh start for any other test using ResizeObserver.
		ResizeObserver._observerInstance = null;
	} );

	beforeEach( () => {
		locale = new Locale();
		view = new ToolbarView( locale );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.destroy();
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should set view#isCompact', () => {
			expect( view.isCompact ).to.be.false;
		} );

		describe( '#options', () => {
			it( 'should be an empty object if none were passed', () => {
				expect( view.options ).to.deep.equal( {} );
			} );

			it( 'should be an empty object if other options were passed', () => {
				const options = {
					foo: 'bar'
				};

				const toolbar = new ToolbarView( locale, options );

				expect( toolbar.options ).to.equal( options );

				toolbar.destroy();
			} );
		} );

		it( 'should create view#items collection', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create view#itemsView', () => {
			expect( view.itemsView ).to.be.instanceOf( View );
		} );

		it( 'should create view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'creates #_behavior', () => {
			expect( view._behavior ).to.be.an( 'object' );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-toolbar' ) ).to.true;
		} );

		it( 'should create #itemsView from template', () => {
			expect( view.element.firstChild ).to.equal( view.itemsView.element );
			expect( view.itemsView.element.classList.contains( 'ck' ) ).to.true;
			expect( view.itemsView.element.classList.contains( 'ck-toolbar__items' ) ).to.true;
		} );

		it( 'should include the ck-toolbar_floating class if "shouldGroupWhenFull" and "isFloating" options are on,' +
			'but not if any of them is off', () => {
			let viewWithOptions = new ToolbarView( locale, {
				shouldGroupWhenFull: true,
				isFloating: true
			} );
			viewWithOptions.render();

			expect( viewWithOptions.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.true;

			viewWithOptions = new ToolbarView( locale, {
				shouldGroupWhenFull: false,
				isFloating: true
			} );
			viewWithOptions.render();

			expect( viewWithOptions.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.false;

			viewWithOptions = new ToolbarView( locale, {
				shouldGroupWhenFull: true,
				isFloating: false
			} );
			viewWithOptions.render();

			expect( viewWithOptions.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.false;

			viewWithOptions = new ToolbarView( locale, {
				shouldGroupWhenFull: false,
				isFloating: false
			} );
			viewWithOptions.render();

			expect( viewWithOptions.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.false;

			viewWithOptions.destroy();
		} );

		describe( 'attributes', () => {
			it( 'should be defined', () => {
				expect( view.element.getAttribute( 'role' ) ).to.equal( 'toolbar' );
				expect( view.element.getAttribute( 'aria-label' ) ).to.equal( 'Editor toolbar' );
				expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
			} );

			it( 'should allow a custom aria-label', () => {
				const view = new ToolbarView( locale );

				view.ariaLabel = 'Custom label';

				view.render();

				expect( view.element.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );

				view.destroy();
			} );

			it( 'should allow the aria-label to be translated', () => {
				const view = new ToolbarView( new Locale( { uiLanguage: 'pl' } ) );

				view.render();

				expect( view.element.getAttribute( 'aria-label' ) ).to.equal( 'Pasek narzędzi edytora' );

				view.destroy();
			} );

			it( 'should have proper ARIA properties', () => {
				expect( view.element.getAttribute( 'role' ) ).to.equal( 'toolbar' );
			} );

			it( 'should allow customizing toolbar role', () => {
				const view = new ToolbarView( locale );
				view.role = 'radiogroup';

				view.render();

				expect( view.element.getAttribute( 'role' ) ).to.equal( 'radiogroup' );

				view.destroy();
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
			it( 'reacts on view#class', () => {
				view.class = 'foo';
				expect( view.element.classList.contains( 'foo' ) ).to.be.true;

				view.class = 'bar';
				expect( view.element.classList.contains( 'bar' ) ).to.be.true;

				view.class = false;
				expect( view.element.classList.contains( 'foo' ) ).to.be.false;
				expect( view.element.classList.contains( 'bar' ) ).to.be.false;
			} );

			it( 'reacts on view#isCompact', () => {
				view.isCompact = false;
				expect( view.element.classList.contains( 'ck-toolbar_compact' ) ).to.be.false;

				view.isCompact = true;
				expect( view.element.classList.contains( 'ck-toolbar_compact' ) ).to.be.true;
			} );
		} );

		describe( 'style', () => {
			it( 'reacts on view#maxWidth', () => {
				view.maxWidth = '100px';
				expect( view.element.style.maxWidth ).to.equal( '100px' );

				view.maxWidth = undefined;
				expect( view.element.style.maxWidth ).to.equal( '' );

				view.maxWidth = null;
				expect( view.element.style.maxWidth ).to.equal( '' );

				view.maxWidth = '200px';
				expect( view.element.style.maxWidth ).to.equal( '200px' );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers itself in #focusTracker', () => {
			const view = new ToolbarView( locale );
			const spyAdd = sinon.spy( view.focusTracker, 'add' );
			const spyRemove = sinon.spy( view.focusTracker, 'remove' );

			sinon.assert.notCalled( spyAdd );

			view.render();

			sinon.assert.calledOnceWithExactly( spyAdd, view.element );
			sinon.assert.notCalled( spyRemove );

			view.destroy();
		} );

		// https://github.com/cksource/ckeditor5-commercial/issues/6633
		it( 'registers #items in #focusTracker as View instances (not just DOM elements) to alow for complex Views scattered across ' +
			'multiple DOM sub-trees',
		() => {
			const view = new ToolbarView( locale );
			const spyAdd = sinon.spy( view.focusTracker, 'add' );
			const spyRemove = sinon.spy( view.focusTracker, 'remove' );

			const focusableViewA = focusable();
			const focusableViewB = focusable();

			view.items.add( focusableViewA );
			view.items.add( focusableViewB );
			sinon.assert.notCalled( spyAdd );

			view.render();

			// 2 for items and 1 for toolbar itself.
			sinon.assert.calledThrice( spyAdd );
			sinon.assert.calledWithExactly( spyAdd.secondCall, focusableViewA );
			sinon.assert.calledWithExactly( spyAdd.thirdCall, focusableViewB );

			view.items.remove( 1 );
			sinon.assert.calledOnceWithExactly( spyRemove, focusableViewB );

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
				const keyEvtData = getArrowKeyData( 'arrowup' );

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

				view.keystrokes.press( keyEvtData );

				sinon.assert.calledThrice( keyEvtData.preventDefault );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( view.items.get( 2 ).focus );
			} );

			it( 'so "arrowleft" focuses previous focusable item', () => {
				const keyEvtData = getArrowKeyData( 'arrowleft' );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 2 ).element;

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( view.items.get( 0 ).focus );
			} );

			it( 'so "arrowdown" focuses next focusable item', () => {
				const keyEvtData = getArrowKeyData( 'arrowdown' );

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

				view.keystrokes.press( keyEvtData );

				sinon.assert.calledThrice( keyEvtData.preventDefault );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( view.items.get( 2 ).focus );
			} );

			it( 'so "arrowright" focuses next focusable item', () => {
				const keyEvtData = getArrowKeyData( 'arrowright' );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 0 ).element;

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( view.items.get( 2 ).focus );
			} );
		} );

		describe( 'activates keyboard navigation for the RTL toolbar', () => {
			beforeEach( () => {
				view.destroy();
				view.element.remove();

				locale = new Locale( { uiLanguage: 'ar' } );

				view = new ToolbarView( locale );
				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.element.remove();
			} );

			it( 'so "arrowleft" focuses next focusable item', () => {
				const keyEvtData = getArrowKeyData( 'arrowleft' );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				// Mock the first item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 0 ).element;

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( view.items.get( 2 ).focus );
			} );

			it( 'so "arrowright" focuses previous focusable item', () => {
				const keyEvtData = getArrowKeyData( 'arrowright' );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 0 ).element;

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( view.items.get( 3 ).focus );
			} );
		} );

		it( 'calls _behavior#render()', () => {
			const view = new ToolbarView( locale );
			sinon.spy( view._behavior, 'render' );

			view.render();
			sinon.assert.calledOnce( view._behavior.render );
			sinon.assert.calledWithExactly( view._behavior.render, view );

			view.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys the feature', () => {
			sinon.spy( view._behavior, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( view._behavior.destroy );
		} );

		it( 'calls _behavior#destroy()', () => {
			sinon.spy( view._behavior, 'destroy' );

			view.destroy();
			sinon.assert.calledOnce( view._behavior.destroy );
		} );

		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first focusable of #items in DOM', () => {
			// No children to focus.
			view.focus();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			view.focus();

			sinon.assert.calledOnce( view.items.get( 1 ).focus );
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'focuses the last focusable of #items in DOM', () => {
			// No children to focus.
			view.focusLast();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			view.focusLast();

			sinon.assert.calledOnce( view.items.get( 3 ).focus );
		} );
	} );

	describe( 'fillFromConfig()', () => {
		let factory;

		beforeEach( () => {
			factory = new ComponentFactory( {} );

			factory.add( 'foo', namedFactory( 'foo' ) );
			factory.add( 'bar', namedFactory( 'bar' ) );
			factory.add( 'baz', namedFactory( 'baz' ) );
		} );

		it( 'expands the config into collection', () => {
			view.fillFromConfig( [ 'foo', '-', 'bar', '|', 'foo' ], factory );

			const items = view.items;
			expect( items ).to.have.length( 5 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ) ).to.be.instanceOf( ToolbarLineBreakView );
			expect( items.get( 2 ).name ).to.equal( 'bar' );
			expect( items.get( 3 ) ).to.be.instanceOf( ToolbarSeparatorView );
			expect( items.get( 4 ).name ).to.equal( 'foo' );
		} );

		it( 'accepts configuration object', () => {
			view.fillFromConfig( { items: [ 'foo', 'bar', 'foo' ] }, factory );

			const items = view.items;
			expect( items ).to.have.length( 3 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ).name ).to.equal( 'bar' );
			expect( items.get( 2 ).name ).to.equal( 'foo' );
		} );

		it( 'removes items listed in `removeItems`', () => {
			view.fillFromConfig(
				{
					items: [ 'foo', 'bar', 'foo' ],
					removeItems: [ 'foo' ]
				},
				factory
			);

			const items = view.items;
			expect( items ).to.have.length( 1 );
			expect( items.get( 0 ).name ).to.equal( 'bar' );
		} );

		it( 'deduplicates consecutive separators after removing items listed in `removeItems` - the vertical separator case (`|`)', () => {
			view.fillFromConfig(
				{
					items: [ '|', '|', 'foo', '|', 'bar', '|', 'foo' ],
					removeItems: [ 'bar' ]
				},
				factory
			);

			const items = view.items;

			expect( items ).to.have.length( 3 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ) ).to.be.instanceOf( ToolbarSeparatorView );
			expect( items.get( 2 ).name ).to.equal( 'foo' );
		} );

		it( 'deduplicates consecutive separators after removing items listed in `removeItems` - the line break case (`-`)', () => {
			view.fillFromConfig(
				{
					items: [ '-', '-', 'foo', '-', 'bar', '-', 'foo' ],
					removeItems: [ 'bar' ]
				},
				factory
			);

			const items = view.items;

			expect( items ).to.have.length( 3 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ) ).to.be.instanceOf( ToolbarLineBreakView );
			expect( items.get( 2 ).name ).to.equal( 'foo' );
		} );

		it( 'removes trailing and leading separators from the item list - the vertical separator case (`|`)', () => {
			view.fillFromConfig(
				{
					items: [ '|', '|', 'foo', '|', 'bar', '|' ]
				},
				factory
			);

			const items = view.items;

			expect( items ).to.have.length( 3 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ) ).to.be.instanceOf( ToolbarSeparatorView );
			expect( items.get( 2 ).name ).to.equal( 'bar' );
		} );

		it( 'removes trailing and leading separators from the item list - the line break case (`-`)', () => {
			view.fillFromConfig(
				{
					items: [ '-', '-', 'foo', '-', 'bar', '-' ]
				},
				factory
			);

			const items = view.items;

			expect( items ).to.have.length( 3 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ) ).to.be.instanceOf( ToolbarLineBreakView );
			expect( items.get( 2 ).name ).to.equal( 'bar' );
		} );

		it( 'warns if there is no such component in the factory', () => {
			const items = view.items;
			const consoleWarnStub = sinon.stub( console, 'warn' );

			view.fillFromConfig( [ 'foo', 'bar', 'non-existing' ], factory );

			expect( items ).to.have.length( 2 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ).name ).to.equal( 'bar' );

			sinon.assert.calledOnce( consoleWarnStub );
			sinon.assert.calledWithExactly( consoleWarnStub,
				sinon.match( /^toolbarview-item-unavailable/ ),
				sinon.match( { item: 'non-existing' } ),
				sinon.match.string // Link to the documentation.
			);
		} );

		it( 'warns if the line separator is used when the button grouping option is enabled', () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );
			view.options.shouldGroupWhenFull = true;

			view.fillFromConfig( [ 'foo', '-', 'bar' ], factory );

			sinon.assert.calledOnce( consoleWarnStub );
			sinon.assert.calledWithExactly( consoleWarnStub,
				sinon.match( /^toolbarview-line-break-ignored-when-grouping-items/ ),
				sinon.match.array,
				sinon.match.string // Link to the documentation.
			);
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8582
		it( 'does not render line separator when the button grouping option is enabled', () => {
			// Catch warn to stop tests from failing in production mode.
			sinon.stub( console, 'warn' );

			view.options.shouldGroupWhenFull = true;

			view.fillFromConfig( [ 'foo', '-', 'bar' ], factory );

			const items = view.items;

			expect( items ).to.have.length( 2 );
			expect( items.get( 0 ).name ).to.equal( 'foo' );
			expect( items.get( 1 ).name ).to.equal( 'bar' );
		} );

		describe( 'nested drop-downs with toolbar', () => {
			let dropdownView, toolbarView;

			it( 'should create a drop-down with the default look and configured items', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						items: [ 'bar', '|', 'foo' ]
					}
				], factory );

				dropdownView = view.items.get( 1 );

				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdownView.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdownView.isOpen = true;

				toolbarView = dropdownView.toolbarView;

				const items = view.items;

				expect( items ).to.have.length( 2 );
				expect( items.get( 0 ).name ).to.equal( 'foo' );
				expect( items.get( 1 ) ).to.be.instanceOf( DropdownView );

				expect( dropdownView.buttonView.label, 'label' ).to.equal( 'Some label' );
				expect( dropdownView.buttonView.withText, 'withText' ).to.be.false;
				expect( dropdownView.buttonView.icon, 'icon' ).to.equal( IconThreeVerticalDots );
				expect( dropdownView.buttonView.tooltip, 'tooltip' ).to.be.true;

				const nestedToolbarItems = toolbarView.items;

				expect( nestedToolbarItems.get( 0 ).name ).to.equal( 'bar' );
				expect( nestedToolbarItems.get( 1 ) ).to.be.instanceOf( ToolbarSeparatorView );
				expect( nestedToolbarItems.get( 2 ).name ).to.equal( 'foo' );
			} );

			it( 'should set proper CSS class on the drop-down', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						items: [ 'bar', '|', 'foo' ],
						icon: 'plus'
					}
				], factory );

				dropdownView = view.items.get( 1 );

				expect( dropdownView.class ).to.equal( 'ck-toolbar__nested-toolbar-dropdown' );
			} );

			it( 'should allow configuring the drop-down\'s label', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						items: [ 'bar', '|', 'foo' ],
						icon: 'plus'
					}
				], factory );

				dropdownView = view.items.get( 1 );

				expect( dropdownView.buttonView.label ).to.equal( 'Some label' );
			} );

			it( 'should allow configuring the drop-down\'s label visibility', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						items: [ 'bar', '|', 'foo' ],
						icon: 'plus',
						withText: true
					}
				], factory );

				dropdownView = view.items.get( 1 );

				expect( dropdownView.buttonView.withText ).to.be.true;
			} );

			it( 'should allow configuring the drop-down\'s icon by SVG string', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						items: [ 'bar', '|', 'foo' ],
						icon: '<svg viewBox="0 0 68 64" xmlns="http://www.w3.org/2000/svg"></svg>'
					}
				], factory );

				dropdownView = view.items.get( 1 );

				expect( dropdownView.buttonView.icon ).to.equal( '<svg viewBox="0 0 68 64" xmlns="http://www.w3.org/2000/svg"></svg>' );
			} );

			it( 'should allow disabling the drop-down\'s icon by passing false (text label shows up instead)', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						icon: false,
						items: [ 'bar', '|', 'foo' ]
					}
				], factory );

				dropdownView = view.items.get( 1 );

				expect( dropdownView.buttonView.icon ).to.be.undefined;
				expect( dropdownView.buttonView.withText ).to.be.true;
			} );

			describe( 'pre-configured icons', () => {
				const iconNames = {
					alignLeft: IconAlignLeft,
					bold: IconBold,
					importExport: IconImportExport,
					paragraph: IconParagraph,
					plus: IconPlus,
					text: IconText,
					threeVerticalDots: IconThreeVerticalDots
				};

				for ( const [ name, icon ] of Object.entries( iconNames ) ) {
					it( `should provide the "${ name }" icon`, () => {
						view.fillFromConfig( [
							{
								label: 'Some label',
								items: [ 'bar', '|', 'foo' ],
								icon: name
							}
						], factory );

						dropdownView = view.items.get( 0 );

						expect( dropdownView.buttonView.icon ).to.equal( icon );
					} );
				}
			} );

			it( 'should fall back to a default icon when none was provided', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						items: [ 'bar', '|', 'foo' ]
					}
				], factory );

				dropdownView = view.items.get( 1 );

				expect( dropdownView.buttonView.icon ).to.equal( IconThreeVerticalDots );
				expect( dropdownView.buttonView.withText ).to.be.false;
			} );

			it( 'should allow configuring the drop-down\'s tooltip', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Some label',
						items: [ 'bar', '|', 'foo' ],
						icon: 'plus',
						tooltip: 'Foo bar'
					}
				], factory );

				dropdownView = view.items.get( 1 );

				expect( dropdownView.buttonView.tooltip ).to.equal( 'Foo bar' );
			} );

			it( 'should allow deep nested structures', () => {
				view.fillFromConfig( [
					'foo',
					{
						label: 'Level 0',
						items: [
							'bar',
							'|',
							{
								label: 'Level 1',
								icon: 'bold',
								items: [ 'bar' ]
							}
						],
						icon: 'plus',
						tooltip: 'Foo bar'
					}
				], factory );

				const level0DropdownView = view.items.get( 1 );

				// Make sure that toolbar view is not created before first dropdown open.
				expect( level0DropdownView.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				level0DropdownView.isOpen = true;

				const level1DropdownView = level0DropdownView.toolbarView.items.get( 2 );

				// Make sure that toolbar view is not created before first dropdown open.
				expect( level1DropdownView.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				level1DropdownView.isOpen = true;

				expect( level1DropdownView.toolbarView.items.length ).to.equal( 1 );
				expect( level1DropdownView.toolbarView.items.get( 0 ).name ).to.equal( 'bar' );
			} );

			it( 'should warn when the drop-down has no label', () => {
				const warnStub = testUtils.sinon.stub( console, 'warn' );
				const brokenDefinition = {
					items: [ 'bar', '|', 'foo' ],
					icon: 'plus',
					tooltip: 'Foo bar'
				};

				view.fillFromConfig( [ 'foo', brokenDefinition ], factory );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^toolbarview-nested-toolbar-dropdown-missing-label/ ),
					brokenDefinition,
					sinon.match.string // Link to the documentation
				);
			} );

			describe( 'toolbar.removeItems support', () => {
				it( 'should allow removing items from the nested toolbar', () => {
					view.fillFromConfig( {
						items: [
							'foo',
							{
								label: 'Some label',
								items: [ 'bar', '|', 'foo' ]
							}
						],
						removeItems: [ 'bar' ]
					}, factory );

					dropdownView = view.items.get( 1 );

					// Make sure that toolbar view is not created before first dropdown open.
					expect( dropdownView.toolbarView ).to.be.undefined;

					// Trigger toolbar view creation (lazy init).
					dropdownView.isOpen = true;
					toolbarView = dropdownView.toolbarView;

					const nestedToolbarItems = toolbarView.items;

					expect( nestedToolbarItems.length ).to.equal( 1 );
					expect( nestedToolbarItems.get( 0 ).name ).to.equal( 'foo' );
				} );

				it( 'should allow removing items from the nested toolbar deep in the structure', () => {
					view.fillFromConfig( {
						items: [
							'foo',
							{
								label: 'Level 0',
								items: [
									'bar',
									{
										label: 'Level 1',
										items: [
											'foo', 'bar'
										]
									}
								]
							}
						],
						removeItems: [ 'bar' ]
					}, factory );

					const level0DropdownView = view.items.get( 1 );

					// Make sure that toolbar view is not created before first dropdown open.
					expect( level0DropdownView.toolbarView ).to.be.undefined;

					// Trigger toolbar view creation (lazy init).
					level0DropdownView.isOpen = true;

					const level1DropdownView = level0DropdownView.toolbarView.items.get( 0 );

					// Make sure that toolbar view is not created before first dropdown open.
					expect( level1DropdownView.toolbarView ).to.be.undefined;

					// Trigger toolbar view creation (lazy init).
					level1DropdownView.isOpen = true;

					const level0NestedToolbarItems = level0DropdownView.toolbarView.items;
					const level1NestedToolbarItems = level1DropdownView.toolbarView.items;

					expect( level0NestedToolbarItems.length ).to.equal( 1 );
					expect( level0NestedToolbarItems.get( 0 ) ).to.be.instanceOf( DropdownView );
					expect( level0NestedToolbarItems.get( 0 ).buttonView.label ).to.equal( 'Level 1' );

					expect( level1NestedToolbarItems.length ).to.equal( 1 );
					expect( level1NestedToolbarItems.get( 0 ).name ).to.equal( 'foo' );
				} );

				it( 'should remove the nested drop-down if all its toolbar items have also been removed', () => {
					view.fillFromConfig( {
						items: [
							'foo',
							{
								label: 'Some label',
								items: [ 'bar', 'baz' ]
							}
						],
						removeItems: [ 'bar', 'baz' ]
					}, factory );

					const items = view.items;

					expect( items.length ).to.equal( 1 );
					expect( items.get( 0 ).name ).to.equal( 'foo' );
				} );

				it( 'should remove the nested drop-down if all its toolbar items (but separators) have also been removed', () => {
					view.fillFromConfig( {
						items: [
							'foo',
							{
								label: 'Some label',
								items: [ 'bar', '|', 'baz' ]
							}
						],
						removeItems: [ 'bar', 'baz' ]
					}, factory );

					const items = view.items;

					expect( items.length ).to.equal( 1 );
					expect( items.get( 0 ).name ).to.equal( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'toolbar with static items', () => {
		describe( 'constructor()', () => {
			it( 'should set view#isVertical', () => {
				expect( view.isVertical ).to.be.false;
			} );

			it( 'binds itemsView#children to #items', () => {
				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();

				view.items.add( itemA );
				view.items.add( itemB );
				view.items.add( itemC );

				expect( view.itemsView.children.map( i => i ) ).to.have.ordered.members( [ itemA, itemB, itemC ] );
			} );

			it( 'binds #focusables to #items', () => {
				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();

				view.items.add( itemA );
				view.items.add( itemB );
				view.items.add( itemC );

				expect( view.focusables.map( i => i ) ).to.have.ordered.members( [ itemA, itemB, itemC ] );
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
			} );
		} );

		describe( '#switchBehavior()', () => {
			it( 'should do nothing if changed to `static`', () => {
				const spy = sinon.spy( view._behavior, 'render' );

				view.switchBehavior( 'static' );

				expect( view.isGrouping ).to.be.false;
				sinon.assert.notCalled( spy );
			} );

			it( 'should replace #_behavior with dynamic layout', () => {
				const spy = sinon.spy( view._behavior, 'destroy' );

				view.switchBehavior( 'dynamic' );

				expect( view.isGrouping ).to.be.true;
				sinon.assert.calledOnce( spy );
			} );

			it( 'should update the bindings in the new behavior', () => {
				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();

				view.items.add( itemA );
				view.items.add( itemB );
				view.items.add( itemC );

				view.switchBehavior( 'dynamic' );

				expect( view._behavior.ungroupedItems.length === 3 );
				expect( view.focusables.length === 3 );
			} );
		} );
	} );

	describe( 'toolbar with a dynamic item grouping', () => {
		let locale, view, groupedItems, ungroupedItems, groupedItemsDropdown;
		let resizeCallback, observeSpy, unobserveSpy;

		beforeEach( () => {
			observeSpy = sinon.spy();
			unobserveSpy = sinon.spy();

			// Make sure other tests of the editor do not affect tests that follow.
			// Without it, if an instance of ResizeObserver already exists somewhere undestroyed
			// in DOM, the following DOM mock will have no effect.
			ResizeObserver._observerInstance = null;

			testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( callback => {
				resizeCallback = callback;

				return {
					observe: observeSpy,
					unobserve: unobserveSpy
				};
			} );

			locale = new Locale();
			view = new ToolbarView( locale, {
				shouldGroupWhenFull: true
			} );

			view.render();
			view.element.style.width = '200px';
			document.body.appendChild( view.element );

			groupedItems = view._behavior.groupedItems;
			ungroupedItems = view._behavior.ungroupedItems;
			groupedItemsDropdown = view._behavior.groupedItemsDropdown;
		} );

		afterEach( () => {
			testUtils.sinon.restore();
			view.element.remove();
			view.destroy();
		} );

		describe( 'constructor()', () => {
			it( 'extends the template with the CSS class', () => {
				expect( view.element.classList.contains( 'ck-toolbar_grouping' ) ).to.be.true;
			} );

			it( 'updates the UI as new #items are added', () => {
				sinon.spy( view._behavior, '_updateGrouping' );

				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();
				const itemD = focusable();

				view.element.style.width = '200px';

				view.items.add( itemA );
				view.items.add( itemB );

				sinon.assert.calledTwice( view._behavior._updateGrouping );

				expect( ungroupedItems ).to.have.length( 2 );
				expect( groupedItems ).to.have.length( 0 );

				view.items.add( itemC );

				// The dropdown took some extra space.
				expect( ungroupedItems ).to.have.length( 1 );
				expect( groupedItems ).to.have.length( 2 );

				view.items.add( itemD, 2 );

				expect( ungroupedItems ).to.have.length( 1 );
				expect( groupedItems ).to.have.length( 3 );

				expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemA ] );
				expect( groupedItems.map( i => i ) ).to.have.ordered.members( [ itemB, itemD, itemC ] );
			} );

			it( 'updates the UI as #items are removed', () => {
				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();
				const itemD = focusable();

				view.element.style.width = '200px';

				view.items.add( itemA );
				view.items.add( itemB );
				view.items.add( itemC );
				view.items.add( itemD );

				sinon.spy( view._behavior, '_updateGrouping' );
				view.items.remove( 2 );

				expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemA ] );
				expect( groupedItems.map( i => i ) ).to.have.ordered.members( [ itemB, itemD ] );

				sinon.assert.calledOnce( view._behavior._updateGrouping );

				view.items.remove( 0 );
				sinon.assert.calledTwice( view._behavior._updateGrouping );

				expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemB, itemD ] );
			} );

			it( 'doesn\'t throw when removing the first of grouped items', () => { // (#7655)
				const items = [ focusable(), focusable(), focusable(), focusable() ];
				view.element.style.width = '200px';
				view.items.addMany( items );

				view.items.remove( 1 );

				expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ items[ 0 ] ] );
				expect( groupedItems.map( i => i ) ).to.have.ordered.members( [ items[ 2 ], items[ 3 ] ] );
			} );
		} );

		it( 'groups items that overflow into the dropdown', () => {
			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();
			const itemD = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );
			view.items.add( itemD );

			expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemA ] );
			expect( groupedItems.map( i => i ) ).to.have.ordered.members( [ itemB, itemC, itemD ] );
			expect( view.children ).to.have.length( 3 );
			expect( view.children.get( 0 ) ).to.equal( view.itemsView );
			expect( view.children.get( 1 ) ).to.be.instanceOf( ToolbarSeparatorView );
			expect( view.children.get( 2 ) ).to.equal( groupedItemsDropdown );
		} );

		it( 'ungroups items if there is enough space to display them (all)', () => {
			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();
			const itemD = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );
			view.items.add( itemD );

			expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemA ] );
			expect( groupedItems.map( i => i ) ).to.have.ordered.members( [ itemB, itemC, itemD ] );

			view.element.style.width = '350px';

			// Some grouped items cannot be ungrouped because there is not enough space and they will
			// land back in #_behavior.groupedItems after an attempt was made.
			view._behavior._updateGrouping();
			expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemA, itemB, itemC ] );
			expect( groupedItems.map( i => i ) ).to.have.ordered.members( [ itemD ] );
		} );

		it( 'ungroups items if there is enough space to display them (some)', () => {
			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );

			expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemA ] );
			expect( groupedItems.map( i => i ) ).to.have.ordered.members( [ itemB, itemC ] );

			view.element.style.width = '350px';

			// All grouped items will be ungrouped because they fit just alright in the main space.
			view._behavior._updateGrouping();
			expect( ungroupedItems.map( i => i ) ).to.have.ordered.members( [ itemA, itemB, itemC ] );
			expect( groupedItems ).to.have.length( 0 );
			expect( view.children ).to.have.length( 1 );
			expect( view.children.get( 0 ) ).to.equal( view.itemsView );
		} );

		describe( 'render()', () => {
			let view, groupedItems, ungroupedItems;

			beforeEach( () => {
				view = new ToolbarView( locale, {
					shouldGroupWhenFull: true
				} );

				observeSpy.resetHistory();
				unobserveSpy.resetHistory();

				view.render();

				groupedItems = view._behavior.groupedItems;
				ungroupedItems = view._behavior.ungroupedItems;

				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( 'starts observing toolbar resize immediatelly after render', () => {
				sinon.assert.calledOnce( observeSpy );
				sinon.assert.calledWithExactly( observeSpy, view.element );
			} );

			it( 'updates the UI when the toolbar is being resized (expanding)', () => {
				view.element.style.width = '200px';

				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );
				expect( ungroupedItems ).to.have.length( 1 );
				expect( groupedItems ).to.have.length( 4 );

				view.element.style.width = '500px';
				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				expect( ungroupedItems ).to.have.length( 5 );
				expect( groupedItems ).to.have.length( 0 );
			} );

			it( 'updates the UI when the toolbar is being resized (narrowing)', () => {
				view.element.style.width = '500px';

				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );
				expect( ungroupedItems ).to.have.length( 5 );
				expect( groupedItems ).to.have.length( 0 );

				view.element.style.width = '200px';
				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				expect( ungroupedItems ).to.have.length( 1 );
				expect( groupedItems ).to.have.length( 4 );
			} );

			it( 'does not react to changes in height', () => {
				view.element.style.width = '500px';
				view.element.style.height = '200px';

				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				sinon.spy( view._behavior, '_updateGrouping' );
				view.element.style.width = '500px';
				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				sinon.assert.calledOnce( view._behavior._updateGrouping );
				view.element.style.height = '500px';
				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				sinon.assert.calledOnce( view._behavior._updateGrouping );
			} );

			it( 'updates the state of grouped items upon resize', () => {
				testUtils.sinon.spy( view._behavior, '_updateGrouping' );
				sinon.assert.notCalled( view._behavior._updateGrouping );

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				sinon.assert.calledOnce( view._behavior._updateGrouping );
			} );

			it( 'does not update the state of grouped items if invisible', () => {
				view.element.style.width = '500px';
				view.element.style.height = '200px';

				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				expect( ungroupedItems ).to.have.length( 5 );
				expect( groupedItems ).to.have.length( 0 );

				view.element.style.display = 'none';
				view.maxWidth = '100px';

				expect( ungroupedItems ).to.have.length( 5 );
				expect( groupedItems ).to.have.length( 0 );
			} );

			it( 'should queue the update of the grouped items state when invisible (and execute it when visible again)', () => {
				view.maxWidth = '200px';

				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				expect( ungroupedItems ).to.have.length( 1 );
				expect( groupedItems ).to.have.length( 4 );

				view.element.style.display = 'none';

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				// Response to this change will be queued.
				view.maxWidth = '500px';

				expect( ungroupedItems ).to.have.length( 1 );
				expect( groupedItems ).to.have.length( 4 );

				// The queued items state should happen after that.
				view.element.style.display = 'flex';

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				expect( ungroupedItems ).to.have.length( 5 );
				expect( groupedItems ).to.have.length( 0 );
			} );

			it( 'should fire the "groupedItemsUpdate" event on the toolbar when some item is grouped or ungrouped', () => {
				const updateSpy = sinon.spy();

				view.on( 'groupedItemsUpdate', updateSpy );

				view.element.style.width = '200px';

				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				sinon.assert.calledOnce( updateSpy );

				// This 10px is not enough to ungroup an item.
				view.element.style.width = '210px';

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				sinon.assert.calledOnce( updateSpy );

				// But this is not enough to ungroup some items.
				view.element.style.width = '300px';

				resizeCallback( [ {
					target: view.element,
					contentRect: new Rect( view.element )
				} ] );

				sinon.assert.calledTwice( updateSpy );
			} );
		} );

		describe( 'destroy()', () => {
			it( 'destroys the #groupedItemsDropdown', () => {
				view.element.style.width = '200px';

				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();
				const itemD = focusable();

				view.items.add( itemA );
				view.items.add( itemB );
				view.items.add( itemC );
				view.items.add( itemD );

				sinon.spy( groupedItemsDropdown, 'destroy' );

				view.element.style.width = '500px';

				// The dropdown hides; it does not belong to any collection but it still exist.
				view._behavior._updateGrouping();

				view.destroy();
				sinon.assert.calledOnce( groupedItemsDropdown.destroy );
			} );

			it( 'should destroy the #resizeObserver', () => {
				view.element.style.width = '200px';

				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();
				const itemD = focusable();

				view.items.add( itemA );
				view.items.add( itemB );
				view.items.add( itemC );
				view.items.add( itemD );

				sinon.spy( view._behavior.resizeObserver, 'destroy' );

				view.destroy();
				sinon.assert.calledOnce( view._behavior.resizeObserver.destroy );
			} );
		} );

		describe( 'dropdown with grouped items', () => {
			it( 'has proper DOM structure', () => {
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				expect( view.children.has( groupedItemsDropdown ) ).to.be.true;
				expect( groupedItemsDropdown.element.classList.contains( 'ck-toolbar__grouped-dropdown' ) );
				expect( groupedItemsDropdown.buttonView.label ).to.equal( 'Show more items' );
			} );

			it( 'tooltip has the proper position depending on the UI language direction (LTR UI)', () => {
				const locale = new Locale( { uiLanguage: 'en' } );
				const view = new ToolbarView( locale, { shouldGroupWhenFull: true } );
				view.render();

				expect( view._behavior.groupedItemsDropdown.buttonView.tooltipPosition ).to.equal( 'sw' );

				view.destroy();
			} );

			it( 'tooltip has the proper position depending on the UI language direction (RTL UI)', () => {
				const locale = new Locale( { uiLanguage: 'ar' } );
				const view = new ToolbarView( locale, { shouldGroupWhenFull: true } );
				view.render();

				expect( view._behavior.groupedItemsDropdown.buttonView.tooltipPosition ).to.equal( 'se' );

				view.destroy();
			} );

			it( 'shares its toolbarView#items with grouped items', () => {
				groupedItemsDropdown.isOpen = true;

				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				expect( groupedItemsDropdown.toolbarView.items.map( i => i ) )
					.to.have.ordered.members( groupedItems.map( i => i ) );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/5608
			it( 'has the proper position depending on the UI language direction (LTR UI)', () => {
				const locale = new Locale( { uiLanguage: 'en' } );
				const view = new ToolbarView( locale, { shouldGroupWhenFull: true } );
				view.render();

				expect( view._behavior.groupedItemsDropdown.panelPosition ).to.equal( 'sw' );

				view.destroy();
			} );

			// https://github.com/ckeditor/ckeditor5/issues/5608
			it( 'has the proper position depending on the UI language direction (RTL UI)', () => {
				const locale = new Locale( { uiLanguage: 'ar' } );
				const view = new ToolbarView( locale, { shouldGroupWhenFull: true } );
				view.render();

				expect( view._behavior.groupedItemsDropdown.panelPosition ).to.equal( 'se' );

				view.destroy();
			} );
		} );

		describe( 'item overflow checking logic', () => {
			it( 'considers the right padding of the toolbar (LTR UI)', () => {
				view.class = 'ck-reset_all';
				view.element.style.width = '210px';
				view.element.style.paddingLeft = '0px';
				view.element.style.paddingRight = '20px';

				view.items.add( focusable() );
				view.items.add( focusable() );

				expect( view._behavior.groupedItems ).to.have.length( 1 );
			} );

			it( 'considers the left padding of the toolbar (RTL UI)', () => {
				const locale = new Locale( { uiLanguage: 'ar' } );
				const view = new ToolbarView( locale, {
					shouldGroupWhenFull: true
				} );

				view.extendTemplate( {
					attributes: {
						dir: locale.uiLanguageDirection
					}
				} );

				view.render();
				document.body.appendChild( view.element );

				view.class = 'ck-reset_all';
				view.element.style.width = '210px';
				view.element.style.paddingLeft = '20px';
				view.element.style.paddingRight = '0px';

				view.items.add( focusable() );
				view.items.add( focusable() );

				expect( view._behavior.groupedItems ).to.have.length( 1 );

				view.destroy();
				view.element.remove();
			} );
		} );

		describe( 'focus management', () => {
			it( '#focus() focuses the dropdown when it is the only focusable', () => {
				sinon.spy( groupedItemsDropdown, 'focus' );
				view.element.style.width = '10px';

				const itemA = focusable();
				const itemB = focusable();

				view.items.add( itemA );
				view.items.add( itemB );

				expect( view.focusables.map( i => i ) ).to.have.ordered.members( [ groupedItemsDropdown ] );

				view.focus();
				sinon.assert.calledOnce( groupedItemsDropdown.focus );
			} );

			it( '#focusLast() focuses the dropdown when present', () => {
				sinon.spy( groupedItemsDropdown, 'focus' );
				view.element.style.width = '200px';

				const itemA = focusable();
				const itemB = focusable();
				const itemC = focusable();

				view.items.add( itemA );
				view.items.add( itemB );
				view.items.add( itemC );

				expect( view.focusables.map( i => i ) ).to.have.ordered.members( [ itemA, groupedItemsDropdown ] );

				view.focusLast();

				sinon.assert.calledOnce( groupedItemsDropdown.focus );

				view.element.remove();
			} );
		} );

		describe( '#switchBehavior()', () => {
			it( 'should do nothing if changed to `dynamic`', () => {
				const spy = sinon.spy( view._behavior, 'render' );

				view.switchBehavior( 'dynamic' );

				expect( view.isGrouping ).to.be.true;
				sinon.assert.notCalled( spy );
			} );

			it( 'should replace #_behavior with static layout', () => {
				const spy = sinon.spy( view._behavior, 'destroy' );

				view.switchBehavior( 'static' );

				expect( view.isGrouping ).to.be.false;
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );

function focusable() {
	const view = nonFocusable();

	view.label = 'focusable';
	view.focus = sinon.stub().callsFake( () => {
		view.element.focus();
	} );

	view.extendTemplate( {
		attributes: {
			tabindex: -1
		}
	} );

	return view;
}

function nonFocusable() {
	const view = new View();

	view.set( 'label', 'non-focusable' );

	const bind = view.bindTemplate;

	view.setTemplate( {
		tag: 'div',
		attributes: {
			style: {
				padding: '0',
				margin: '0',
				width: '100px',
				height: '100px',
				background: 'rgba(255,0,0,.3)'
			}
		},
		children: [
			{
				text: bind.to( 'label' )
			}
		]
	} );

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

function getArrowKeyData( arrow ) {
	return {
		keyCode: keyCodes[ arrow ],
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};
}
