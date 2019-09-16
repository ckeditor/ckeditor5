/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event, console, setTimeout */

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

		it( 'should create view#items collection', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should not create view#groupedItems collection', () => {
			expect( view.groupedItems ).to.be.null;
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

		it( 'should not create view#groupedItemsDropdown', () => {
			expect( view.groupedItemsDropdown ).to.be.null;
		} );

		it( 'should set view#shouldGroupWhenFull', () => {
			expect( view.shouldGroupWhenFull ).to.be.false;
		} );

		it( 'should create view#_components collection', () => {
			expect( view._components ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates #_itemsFocusCycler instance', () => {
			expect( view._itemsFocusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'creates #_componentsFocusCycler instance', () => {
			expect( view._componentsFocusCycler ).to.be.instanceOf( FocusCycler );
		} );

		describe( '#shouldGroupWhenFull', () => {
			it( 'updates the state of grouped items immediatelly when set true', () => {
				sinon.spy( view, 'updateGroupedItems' );

				view.shouldGroupWhenFull = true;

				sinon.assert.calledOnce( view.updateGroupedItems );
			} );

			// Possibly in the future a possibility to turn the automatic grouping off could be required.
			// As for now, there is no such need, so there is no such functionality.
			it( 'does nothing if toggled false', () => {
				view.shouldGroupWhenFull = true;

				expect( () => {
					view.shouldGroupWhenFull = false;
				} ).to.not.throw();
			} );

			it( 'starts observing toolbar resize immediatelly when set true', () => {
				function FakeResizeObserver( callback ) {
					this.callback = callback;
				}

				FakeResizeObserver.prototype.observe = sinon.spy();
				FakeResizeObserver.prototype.disconnect = sinon.spy();

				testUtils.sinon.stub( global.window, 'ResizeObserver' ).value( FakeResizeObserver );

				expect( view._groupWhenFullResizeObserver ).to.be.null;

				view.shouldGroupWhenFull = true;

				sinon.assert.calledOnce( view._groupWhenFullResizeObserver.observe );
				sinon.assert.calledWithExactly( view._groupWhenFullResizeObserver.observe, view.element );
			} );

			it( 'updates the state of grouped items upon resize', () => {
				sinon.spy( view, 'updateGroupedItems' );

				function FakeResizeObserver( callback ) {
					this.callback = callback;
				}

				FakeResizeObserver.prototype.observe = sinon.spy();
				FakeResizeObserver.prototype.disconnect = sinon.spy();

				testUtils.sinon.stub( global.window, 'ResizeObserver' ).value( FakeResizeObserver );

				expect( view._groupWhenFullResizeObserver ).to.be.null;

				view.shouldGroupWhenFull = true;
				view._groupWhenFullResizeObserver.callback( [
					{ contentRect: { width: 42 } }
				] );

				sinon.assert.calledTwice( view.updateGroupedItems );
			} );
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

			it( 'reacts on view#shouldGroupWhenFull', () => {
				view.shouldGroupWhenFull = false;
				expect( view.element.classList.contains( 'ck-toolbar_grouping' ) ).to.be.false;

				view.shouldGroupWhenFull = true;
				expect( view.element.classList.contains( 'ck-toolbar_grouping' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers #_components in #focusTracker', () => {
			const view = new ToolbarView( locale );
			const spyAdd = sinon.spy( view.focusTracker, 'add' );
			const spyRemove = sinon.spy( view.focusTracker, 'remove' );

			view._components.add( focusable() );
			view._components.add( focusable() );
			sinon.assert.notCalled( spyAdd );

			view.render();

			// First call is for the #itemsView.
			sinon.assert.calledThrice( spyAdd );

			view._components.remove( 1 );
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
				view.itemsView.focusTracker.isFocused = true;
				view.itemsView.focusTracker.focusedElement = view.items.get( 4 ).element;

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
				view.itemsView.focusTracker.isFocused = true;
				view.itemsView.focusTracker.focusedElement = view.items.get( 2 ).element;

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
				view.itemsView.focusTracker.isFocused = true;
				view.itemsView.focusTracker.focusedElement = view.items.get( 4 ).element;

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
				view.itemsView.focusTracker.isFocused = true;
				view.itemsView.focusTracker.focusedElement = view.items.get( 0 ).element;

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( view.items.get( 2 ).focus );
			} );

			describe( 'when #shouldGroupWhenFull is true', () => {
				beforeEach( () => {
					document.body.appendChild( view.element );
					view.element.style.width = '200px';
					view.shouldGroupWhenFull = true;
				} );

				afterEach( () => {
					view.element.remove();
				} );

				it( 'navigates from #items to the #groupedItemsDropdown (forwards)', () => {
					const keyEvtData = getArrowKeyData( 'arrowright' );

					view.items.add( focusable() );
					view.items.add( nonFocusable() );
					view.items.add( focusable() );

					view.updateGroupedItems();
					sinon.spy( view.groupedItemsDropdown, 'focus' );

					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.itemsView.element;
					view.itemsView.focusTracker.isFocused = true;
					view.itemsView.focusTracker.focusedElement = view.items.get( 0 ).element;

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( view.groupedItemsDropdown.focus );
				} );

				it( 'navigates from the #groupedItemsDropdown to #items (forwards)', () => {
					const keyEvtData = getArrowKeyData( 'arrowright' );

					view.items.add( focusable() );
					view.items.add( nonFocusable() );
					view.items.add( focusable() );

					view.updateGroupedItems();

					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.groupedItemsDropdown.element;
					view.itemsView.focusTracker.isFocused = false;
					view.itemsView.focusTracker.focusedElement = null;

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( view.items.get( 0 ).focus );
				} );

				it( 'navigates from #items to the #groupedItemsDropdown (backwards)', () => {
					const keyEvtData = getArrowKeyData( 'arrowleft' );

					view.items.add( focusable() );
					view.items.add( nonFocusable() );
					view.items.add( focusable() );

					view.updateGroupedItems();
					sinon.spy( view.groupedItemsDropdown, 'focus' );

					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.itemsView.element;
					view.itemsView.focusTracker.isFocused = true;
					view.itemsView.focusTracker.focusedElement = view.items.get( 0 ).element;

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( view.groupedItemsDropdown.focus );
				} );

				it( 'navigates from the #groupedItemsDropdown to #items (backwards)', () => {
					const keyEvtData = getArrowKeyData( 'arrowleft' );

					view.items.add( focusable() );
					view.items.add( nonFocusable() );
					view.items.add( focusable() );

					view.updateGroupedItems();

					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.groupedItemsDropdown.element;
					view.itemsView.focusTracker.isFocused = false;
					view.itemsView.focusTracker.focusedElement = null;

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( view.items.get( 0 ).focus );
				} );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys the #groupedItemsDropdown', () => {
			document.body.appendChild( view.element );
			view.element.style.width = '200px';

			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();
			const itemD = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );
			view.items.add( itemD );

			// The dropdown shows up.
			view.shouldGroupWhenFull = true;
			sinon.spy( view.groupedItemsDropdown, 'destroy' );

			view.element.style.width = '500px';

			// The dropdown hides; it does not belong to any collection but it still exist.
			view.updateGroupedItems();

			view.destroy();
			sinon.assert.calledOnce( view.groupedItemsDropdown.destroy );

			view.element.remove();
		} );

		it( 'disconnects the #_groupWhenFullResizeObserver', () => {
			document.body.appendChild( view.element );
			view.element.style.width = '200px';

			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();
			const itemD = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );
			view.items.add( itemD );

			view.shouldGroupWhenFull = true;
			sinon.spy( view._groupWhenFullResizeObserver, 'disconnect' );

			view.destroy();
			sinon.assert.calledOnce( view._groupWhenFullResizeObserver.disconnect );
			view.element.remove();
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

		it( 'if no items  the first focusable of #items in DOM', () => {
			document.body.appendChild( view.element );
			view.element.style.width = '10px';

			view.items.add( focusable() );
			view.items.add( focusable() );

			view.shouldGroupWhenFull = true;
			sinon.spy( view.groupedItemsDropdown, 'focus' );

			view.focus();
			sinon.assert.calledOnce( view.groupedItemsDropdown.focus );
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

		it( 'focuses the #groupedItemsDropdown when view#shouldGroupWhenFull is true', () => {
			document.body.appendChild( view.element );
			view.element.style.width = '200px';
			view.shouldGroupWhenFull = true;

			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );

			sinon.spy( view.groupedItemsDropdown, 'focus' );

			view.focusLast();

			sinon.assert.calledOnce( view.groupedItemsDropdown.focus );

			view.element.remove();
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

	describe( 'updateGroupedItems()', () => {
		beforeEach( () => {
			document.body.appendChild( view.element );
			view.element.style.width = '200px';
		} );

		afterEach( () => {
			view.element.remove();
		} );

		it( 'only works when #shouldGroupWhenFull', () => {
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );

			view.updateGroupedItems();

			expect( view.items ).to.have.length( 4 );
			expect( view.groupedItems ).to.be.null;
		} );

		it( 'does not throw when the view element has no geometry', () => {
			view.element.remove();

			expect( () => {
				view.updateGroupedItems();
			} ).to.not.throw();
		} );

		it( 'does not group when items fit', () => {
			const itemA = focusable();
			const itemB = focusable();

			view.items.add( itemA );
			view.items.add( itemB );

			view.shouldGroupWhenFull = true;

			expect( view.groupedItems ).to.be.null;
			expect( view.groupedItemsDropdown ).to.be.null;
		} );

		it( 'groups items that overflow into #groupedItemsDropdown', () => {
			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();
			const itemD = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );
			view.items.add( itemD );

			view.shouldGroupWhenFull = true;

			expect( view.items.map( i => i ) ).to.have.members( [ itemA ] );
			expect( view.groupedItems.map( i => i ) ).to.have.members( [ itemB, itemC, itemD ] );
			expect( view._components ).to.have.length( 3 );
			expect( view._components.get( 0 ) ).to.equal( view.itemsView );
			expect( view._components.get( 1 ) ).to.be.instanceOf( ToolbarSeparatorView );
			expect( view._components.get( 2 ) ).to.equal( view.groupedItemsDropdown );
		} );

		it( 'ungroups items from #groupedItemsDropdown if there is enough space to display them (all)', () => {
			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();
			const itemD = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );
			view.items.add( itemD );

			view.shouldGroupWhenFull = true;

			expect( view.items.map( i => i ) ).to.have.members( [ itemA ] );
			expect( view.groupedItems.map( i => i ) ).to.have.members( [ itemB, itemC, itemD ] );

			view.element.style.width = '350px';

			// Some grouped items cannot be ungrouped because there is not enough space and they will
			// land back in #groupedItems after an attempt was made.
			view.updateGroupedItems();
			expect( view.items.map( i => i ) ).to.have.members( [ itemA, itemB, itemC ] );
			expect( view.groupedItems.map( i => i ) ).to.have.members( [ itemD ] );
		} );

		it( 'ungroups items from #groupedItemsDropdown if there is enough space to display them (some)', () => {
			const itemA = focusable();
			const itemB = focusable();
			const itemC = focusable();

			view.items.add( itemA );
			view.items.add( itemB );
			view.items.add( itemC );

			view.shouldGroupWhenFull = true;

			expect( view.items.map( i => i ) ).to.have.members( [ itemA ] );
			expect( view.groupedItems.map( i => i ) ).to.have.members( [ itemB, itemC ] );

			view.element.style.width = '350px';

			// All grouped items will be ungrouped because they fit just alright in the main space.
			view.updateGroupedItems();
			expect( view.items.map( i => i ) ).to.have.members( [ itemA, itemB, itemC ] );
			expect( view.groupedItems ).to.have.length( 0 );
			expect( view._components ).to.have.length( 1 );
			expect( view._components.get( 0 ) ).to.equal( view.itemsView );
		} );

		describe( '#groupedItemsDropdown', () => {
			it( 'has proper DOM structure', () => {
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				view.shouldGroupWhenFull = true;

				const dropdown = view.groupedItemsDropdown;

				expect( view._components.has( view.groupedItemsDropdown ) ).to.be.true;
				expect( dropdown.element.classList.contains( 'ck-toolbar__grouped-dropdown' ) );
				expect( dropdown.buttonView.label ).to.equal( 'Show more items' );
			} );

			it( 'shares its toolbarView#items with ToolbarView#groupedItems', () => {
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );
				view.items.add( focusable() );

				view.shouldGroupWhenFull = true;

				expect( view.groupedItemsDropdown.toolbarView.items ).to.equal( view.groupedItems );
			} );
		} );

		describe( '#items overflow checking logic', () => {
			it( 'considers the right padding of the toolbar (LTR UI)', () => {
				view.class = 'ck-reset_all';
				view.element.style.width = '210px';
				view.element.style.paddingLeft = '0px';
				view.element.style.paddingRight = '20px';

				view.items.add( focusable() );
				view.items.add( focusable() );

				view.shouldGroupWhenFull = true;

				expect( view.groupedItems ).to.have.length( 1 );
			} );

			it( 'considers the left padding of the toolbar (RTL UI)', () => {
				const locale = new Locale( { uiLanguage: 'ar' } );
				const view = new ToolbarView( locale );

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

				view.shouldGroupWhenFull = true;

				expect( view.groupedItems ).to.have.length( 1 );

				view.destroy();
				view.element.remove();
			} );
		} );
	} );

	describe( 'automatic toolbar grouping (#shouldGroupWhenFull = true)', () => {
		beforeEach( () => {
			document.body.appendChild( view.element );
			view.element.style.width = '200px';
		} );

		afterEach( () => {
			view.element.remove();
		} );

		it( 'updates the UI as new #items are added', () => {
			sinon.spy( view, 'updateGroupedItems' );
			sinon.assert.notCalled( view.updateGroupedItems );

			view.items.add( focusable() );
			view.items.add( focusable() );
			sinon.assert.calledTwice( view.updateGroupedItems );
		} );

		it( 'updates the UI as #items are removed', () => {
			sinon.spy( view, 'updateGroupedItems' );
			sinon.assert.notCalled( view.updateGroupedItems );

			view.items.add( focusable() );
			sinon.assert.calledOnce( view.updateGroupedItems );

			view.items.remove( 0 );
			sinon.assert.calledTwice( view.updateGroupedItems );
		} );

		it( 'updates the UI when the toolbar is being resized (expanding)', done => {
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );

			view.element.style.width = '200px';
			view.shouldGroupWhenFull = true;

			expect( view.items ).to.have.length( 1 );
			expect( view.groupedItems ).to.have.length( 4 );

			view.element.style.width = '500px';

			setTimeout( () => {
				expect( view.items ).to.have.length( 5 );
				expect( view.groupedItems ).to.have.length( 0 );

				done();
			}, 100 );
		} );

		it( 'updates the UI when the toolbar is being resized (narrowing)', done => {
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );

			view.element.style.width = '500px';
			view.shouldGroupWhenFull = true;

			expect( view.items ).to.have.length( 5 );
			expect( view.groupedItems ).to.be.null;

			view.element.style.width = '200px';

			setTimeout( () => {
				expect( view.items ).to.have.length( 1 );
				expect( view.groupedItems ).to.have.length( 4 );

				done();
			}, 100 );
		} );

		it( 'does not react to changes in height', done => {
			view.element.style.width = '500px';
			view.element.style.height = '200px';

			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );

			view.shouldGroupWhenFull = true;
			sinon.spy( view, 'updateGroupedItems' );

			expect( view.items ).to.have.length( 5 );
			expect( view.groupedItems ).to.be.null;

			setTimeout( () => {
				view.element.style.height = '500px';

				setTimeout( () => {
					sinon.assert.calledOnce( view.updateGroupedItems );
					done();
				}, 100 );
			}, 100 );
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
