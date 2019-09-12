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

		it( 'focuses the #groupedItemsDropdown when view#shouldGroupWhenFull is true', () => {
			document.body.appendChild( view.element );
			view.element.style.width = '200px';
			view.shouldGroupWhenFull = true;

			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );

			view.updateGroupedItems();

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
				outline: '1px solid green'
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
