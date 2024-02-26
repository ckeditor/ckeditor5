/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import {
	View,
	ButtonView,
	ViewCollection,
	ComponentFactory,

	MenuBarMenuListItemButtonView,
	MenuBarMenuListItemView,
	MenuBarMenuListView,
	MenuBarMenuView,
	MenuBarView
} from '../../src/index.js';
import { MenuBarBehaviors } from '../../src/menubar/utils.js';
import { Locale, wait } from '@ckeditor/ckeditor5-utils';
import {
	add as addTranslations,
	_clear as clearTranslations
} from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import ListSeparatorView from '../../src/list/listseparatorview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'MenuBarView', () => {
	let menuBarView, locale, factory;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Edit': 'Edit',
			'Format': 'Format'
		} );

		addTranslations( 'pl', {
			'Edit': 'Edycja',
			'Format': 'Formatowanie'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		locale = new Locale();
		menuBarView = new MenuBarView( locale );
		factory = new ComponentFactory( {} );
	} );

	afterEach( () => {
		menuBarView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have collection of #children connected to the main element', () => {
			expect( menuBarView.children ).to.be.instanceOf( ViewCollection );

			const view = new View();

			view.setTemplate( { tag: 'div' } );
			view.render();

			menuBarView.render();
			menuBarView.children.add( view );

			expect( menuBarView.element.firstChild ).to.equal( view.element );
		} );

		it( 'should an array of #menus', () => {
			expect( menuBarView.menus ).to.be.instanceOf( Array );
			expect( menuBarView.menus ).to.be.empty;
		} );

		describe( 'template and DOM element', () => {
			it( 'should have CSS classes', () => {
				expect( menuBarView.template.attributes.class ).to.include.members( [ 'ck', 'ck-menu-bar' ] );
			} );

			it( 'should have an ARIA role attribute', () => {
				expect( menuBarView.template.attributes.role ).to.include.members( [ 'menubar' ] );
			} );

			it( 'should have an aria-label attribute', () => {
				expect( menuBarView.template.attributes[ 'aria-label' ] ).to.include.members( [ 'Editor menu bar' ] );
			} );
		} );

		describe( '#isOpen', () => {
			it( 'should be false by default', () => {
				expect( menuBarView.isOpen ).to.be.false;
			} );

			it( 'should be a sum of #isOpen of top-level sub-menus and never go false when going ' +
				'from one sub-menu to another', async () => {
				menuBarView.fillFromConfig( [
					{
						id: 'top2',
						label: 'Top 2',
						items: []
					},
					{
						id: 'top2',
						label: 'Top 2',
						items: []
					}
				] );

				const changeSpy = sinon.spy();

				menuBarView.on( 'change:isOpen', changeSpy );

				expect( menuBarView.isOpen ).to.be.false;

				// Change #1 ---------------------------------------
				menuBarView.menus[ 0 ].isOpen = true;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #2 ---------------------------------------
				menuBarView.menus[ 1 ].isOpen = true;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #3 ---------------------------------------
				menuBarView.menus[ 0 ].isOpen = false;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #4 ---------------------------------------
				// This one is the most important: the state should not change even though one of the menus is closed **first**
				// before the other opened. Failing here would mean the menu bar closed, the focus moved somewhere else and
				// the user's flow was disrupted.
				menuBarView.menus[ 1 ].isOpen = false;
				menuBarView.menus[ 0 ].isOpen = true;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #5 ---------------------------------------
				menuBarView.menus[ 1 ].isOpen = false;
				menuBarView.menus[ 0 ].isOpen = false;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.false;
				sinon.assert.callCount( changeSpy, 2 );
			} );
		} );
	} );

	describe( 'fillFromConfig()', () => {
		it( 'should localize top-level category labels from the config', () => {
			const locale = new Locale( { uiLanguage: 'pl' } );
			const menuBarView = new MenuBarView( locale );

			menuBarView.fillFromConfig( [
				{
					id: 'edit',
					label: 'Edit',
					items: []
				},
				{
					id: 'format',
					label: 'Format',
					items: []
				}
			] );

			expect( menuBarView.menus[ 0 ].buttonView.label ).to.equal( 'Edycja' );
			expect( menuBarView.menus[ 1 ].buttonView.label ).to.equal( 'Formatowanie' );

			menuBarView.destroy();
		} );

		it( 'should normalize the config to avoid empty menus and subsequent separators', () => {
			console.warn( 'TODO' );
		} );

		// TODO: We need to figure out how to implement this first.
		it( 'should not warn if using a default config (automatic template) but warn if using integrator\'s config', () => {
			console.warn( 'TODO' );
		} );

		describe( 'menu creation', () => {
			beforeEach( () => {
				testUtils.sinon.stub( console, 'warn' );

				factory.add( 'menu-A-item1', getButtonCreator( 'menu-A-item1' ) );
				factory.add( 'menu-A-item2', getButtonCreator( 'menu-A-item2' ) );
				factory.add( 'menu-AA-item1', getButtonCreator( 'menu-AA-item1' ) );
				factory.add( 'AAA (from-factory)', () => {
					const menuView = new MenuBarMenuView( locale );
					menuView.buttonView.label = 'AAA (from-factory)';
					return menuView;
				} );
				factory.add( 'menu-B-item1', getButtonCreator( 'menu-B-item1' ) );
				factory.add( 'menu-B-item2', getButtonCreator( 'menu-B-item2' ) );
				factory.add( 'menu-B-item3-incorrect', () => {
					const buttonView = new ButtonView( locale );
					buttonView.label = 'incorrect';
					return buttonView;
				} );

				menuBarView.fillFromConfig( [
					{
						id: 'A',
						label: 'A',
						items: [
							'menu-A-item1',
							'menu-A-item2',
							'-',
							{
								id: 'AA',
								label: 'AA',
								items: [
									'menu-AA-item1',
									'AAA (from-factory)'
								]
							}
						]
					},
					{
						id: 'B',
						label: 'B',
						items: [
							'menu-B-item1',
							'menu-B-item2',
							'menu-B-item3-incorrect'
						]
					}
				], factory );

				function getButtonCreator( label ) {
					return () => {
						const buttonView = new MenuBarMenuListItemButtonView( locale );
						buttonView.label = label;
						return buttonView;
					};
				}

				menuBarView.render();

				document.body.appendChild( menuBarView.element );
			} );

			afterEach( () => {
				menuBarView.element.remove();
			} );

			it( 'should deliver MenuBarMenuView instances', () => {
				expect( Array.from( menuBarView.children ).every( childMenuView => childMenuView instanceof MenuBarMenuView ) ).to.be.true;
			} );

			it( 'should set the menu button\'s label', () => {
				expect( menuBarView.children.map( childMenuView => childMenuView.buttonView.label ) ).to.deep.equal( [ 'A', 'B' ] );
			} );

			it( 'should defer menu view\'s initialization until first open (performance)', () => {
				expect( Array.from( menuBarView.children ).every(
					childMenuView => childMenuView.panelView.children.length === 0 )
				).to.be.true;

				menuBarView.children.first.isOpen = true;

				expect( menuBarView.children.first.panelView.children.length ).to.equal( 1 );
				expect( menuBarView.children.last.panelView.children.length ).to.equal( 0 );
			} );

			it( 'should use MenuBarMenuListView instances in MenuBarMenuView panels', () => {
				menuBarView.children.forEach( childMenuView => {
					childMenuView.isOpen = true;
				} );

				expect( Array.from( menuBarView.children ).every(
					childMenuView => childMenuView.panelView.children.first instanceof MenuBarMenuListView
				) ).to.be.true;
			} );

			it( 'should populate recursively in the correct structure and order', () => {
				expect( menuBarView.children.map( menuDump ) ).to.deep.equal( [
					{
						label: 'A', isOpen: true, isFocused: false,
						items: [
							{ label: 'menu-A-item1', isFocused: false },
							{ label: 'menu-A-item2', isFocused: false },
							'-',
							{
								label: 'AA', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-AA-item1', isFocused: false },
									{
										label: 'AAA (from-factory)', isOpen: true, isFocused: false,
										items: []
									}
								]
							}
						]
					},
					{
						label: 'B', isOpen: true, isFocused: false, items: [
							{ label: 'menu-B-item1', isFocused: false },
							{ label: 'menu-B-item2', isFocused: false }
						]
					}
				] );

				expect( menuBarView.menus.map( menuView => menuView.buttonView.label ) ).to.have.members( [
					'A', 'B', 'AA', 'AAA (from-factory)'
				] );
			} );

			describe( 'menu item creation', () => {
				beforeEach( () => {
					menuBarView.children.first.isOpen = true;
				} );

				it( 'should create separators in place of "-"', () => {
					expect(
						menuBarView.children.first.panelView.children.first.items.get( 2 )
					).to.be.instanceOf( ListSeparatorView );
				} );

				it( 'should use MenuBarMenuListItemView for list items', () => {
					expect(
						menuBarView.children.first.panelView.children.first.items.get( 0 )
					).to.be.instanceOf( MenuBarMenuListItemView );
				} );

				it( 'should create sub-menus with MenuBarMenuView recursively and put them in MenuBarMenuListItemView', () => {
					expect(
						menuBarView.children.first.panelView.children.first.items.get( 3 ).children.first
					).to.be.instanceOf( MenuBarMenuView );
				} );

				describe( 'feature component creation using component factory', () => {
					it( 'should produce a component and put in MenuBarMenuListItemView', () => {
						expect(
							menuBarView.children.first.panelView.children.first.items.get( 0 ).children.first
						).to.be.instanceOf( MenuBarMenuListItemButtonView );
					} );

					it( 'should warn if the compoent is not MenuBarMenuView or MenuBarMenuListItemButtonView', () => {
						menuBarView.children.last.isOpen = true;

						sinon.assert.calledOnceWithExactly( console.warn, 'menu-bar-component-unsupported', {
							view: sinon.match.object
						}, sinon.match.string );
					} );

					it( 'should register nested MenuBarMenuView produced by the factory', () => {
						const menuViewAA = menuBarView.children.first.panelView.children.first.items.get( 3 ).children.first;

						menuViewAA.isOpen = true;

						const menuViewAAAFromFactory = menuViewAA.panelView.children.first.items.get( 1 ).children.first;

						expect( menuViewAAAFromFactory ).to.be.instanceOf( MenuBarMenuView );
						expect( menuBarView.menus ).to.include( menuViewAAAFromFactory );
					} );

					it( 'should delegate events from feature components to the parent menu', () => {
						const buttonView = menuBarView.children.first.panelView.children.first.items.get( 0 ).children.first;

						[ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ].forEach( eventName => {
							const spy = sinon.spy();

							menuBarView.children.first.on( eventName, spy );
							buttonView.fire( eventName );
							sinon.assert.calledOnce( spy );
						} );
					} );

					it( 'should close parent menu when feature component fires #execute', () => {
						const buttonView = menuBarView.children.first.panelView.children.first.items.get( 0 ).children.first;

						expect( menuBarView.children.first.isOpen ).to.be.true;

						buttonView.fire( 'execute' );

						expect( menuBarView.children.first.isOpen ).to.be.false;
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add a behavior that makes the menus open and close while hovering using mouse by the user if ' +
			'the bar is already open', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'toggleMenusAndFocusItemsOnHover' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that closes all menus (and sub-menus) when the bar closes', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'closeMenusWhenTheBarCloses' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that closes a sub-menu when another one opens on the same level', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'closeMenuWhenAnotherOnTheSameLevelOpens' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that allows for moving horizontally across menus using arrow keys', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'focusCycleMenusOnArrows' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that closes the bar when the user clicked somewhere outside of it', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'closeOnClickOutside' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first top-level sub-menu', () => {
			menuBarView.fillFromConfig( [
				{
					id: 'edit',
					label: 'Edit',
					items: []
				},
				{
					id: 'format',
					label: 'Format',
					items: []
				}
			] );

			const spy = sinon.spy( menuBarView.children.first, 'focus' );

			menuBarView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'close()', () => {
		it( 'should close all top-level sub-menus', () => {
			menuBarView.fillFromConfig( [
				{
					id: 'edit',
					label: 'Edit',
					items: []
				},
				{
					id: 'format',
					label: 'Format',
					items: []
				}
			] );

			menuBarView.render();

			menuBarView.children.first.isOpen = true;

			menuBarView.close();

			expect( menuBarView.children.first.isOpen ).to.be.false;
			expect( menuBarView.children.last.isOpen ).to.be.false;
		} );
	} );

	describe( 'registerMenu()', () => {
		it( 'should set all properties and add the menu to the list of known menus', () => {
			const menuViewA = new MenuBarMenuView( locale );
			const menuViewAA = new MenuBarMenuView( locale );

			expect( menuViewA.parentMenuView ).to.be.null;
			expect( menuViewA.menuBarView ).to.be.null;
			expect( menuBarView.menus ).to.be.empty;

			menuBarView.registerMenu( menuViewA );

			expect( menuViewA.parentMenuView ).to.be.null;
			expect( menuViewA.menuBarView ).to.equal( menuBarView );
			expect( menuBarView.menus[ 0 ] ).to.equal( menuViewA );

			menuBarView.registerMenu( menuViewAA, menuViewA );

			expect( menuViewAA.parentMenuView ).to.equal( menuViewA );
			expect( menuViewA.menuBarView ).to.equal( menuBarView );
			expect( menuBarView.menus[ 1 ] ).to.equal( menuViewAA );
		} );
	} );

	function menuDump( menuView ) {
		menuView.isOpen = true;

		let menuItems = [];

		if ( menuView.panelView.children.first ) {
			menuItems = menuView.panelView.children.first.items.map( listItemOrSeparatorView => {
				if ( listItemOrSeparatorView instanceof ListSeparatorView ) {
					return '-';
				}

				const view = listItemOrSeparatorView.children.first;

				if ( view instanceof MenuBarMenuView ) {
					return menuDump( view );
				} else {
					return {
						label: view.label,
						isFocused: document.activeElement === view.element
					};
				}
			} );
		}

		return {
			label: menuView.buttonView.label,
			isOpen: menuView.isOpen,
			isFocused: document.activeElement === menuView.buttonView.element,
			items: menuItems
		};
	}
} );
