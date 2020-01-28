/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import View from '../../src/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
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

		describe( '#options', () => {
			it( 'should be an empty object if none were passed', () => {
				expect( view.options ).to.deep.equal( {} );
			} );

			it( 'should be an empty object if none were passed', () => {
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

				view.destroy();
			} );

			it( 'should allow the aria-label to be translated', () => {
				const view = new ToolbarView( new Locale( { uiLanguage: 'pl' } ) );

				view.render();

				expect( view.element.getAttribute( 'aria-label' ) ).to.equal( 'Pasek narzędzi edytora' );

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
	} );

	describe( 'toolbar with a dynamic item grouping', () => {
		let locale, view, groupedItems, ungroupedItems, groupedItemsDropdown;
		let resizeCallback, observeSpy, unobserveSpy;

		beforeEach( () => {
			observeSpy = sinon.spy();
			unobserveSpy = sinon.spy();

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
			sinon.restore();
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

			it( 'shares its toolbarView#items with grouped items', () => {
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
