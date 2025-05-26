/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import DropdownMenuRootListView from '../../../src/dropdown/menu/dropdownmenurootlistview.js';
import { DropdownRootMenuBehaviors } from '../../../src/dropdown/menu/dropdownmenubehaviors.js';
import {
	DropdownMenuListItemButtonView,
	DropdownMenuListItemView,
	DropdownMenuNestedMenuView
} from '../../../src/index.js';

describe( 'DropdownMenuRootListView', () => {
	let rootListView, element, editor, locale, body;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element );
		locale = editor.locale;
		body = editor.ui.view.body;

		rootListView = new DropdownMenuRootListView( locale, body, [
			{
				id: 'menu_1',
				menu: 'Menu 1',
				children: [
					{
						id: 'menu_1_a',
						label: 'Item A'
					},
					{
						id: 'menu_1_b',
						label: 'Item B'
					}
				]
			},
			{
				id: 'menu_2',
				menu: 'Menu 2',
				children: [
					{
						id: 'menu_2_1',
						menu: 'Menu 2 1',
						children: [
							{
								id: 'menu_2_1_a',
								label: 'Item A'
							}
						]
					}
				]
			},
			{
				id: 'top_a',
				label: 'Item Top A'
			},
			{
				id: 'top_b',
				label: 'Item Top B'
			}
		] );
	} );

	afterEach( async () => {
		await editor.destroy();

		rootListView.destroy();
		element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from DropdownMenuListView', () => {
			expect( rootListView ).to.be.instanceOf( DropdownMenuRootListView );
		} );

		it( 'should not create any views before rendering', () => {
			expect( rootListView.items.length ).to.equal( 0 );
		} );
	} );

	describe( 'render()', () => {
		it( 'should create a view structure according to the definition', () => {
			// See menu structure in main `beforeEach()`.
			rootListView.render();

			expect( rootListView.items.length ).to.equal( 4 );

			// I am doing this manually intentionally. I don't want to create a util that would
			// basically end up as a bit different implementation of the tested `_createStructure()` method.
			const itemMenu1View = rootListView.items.get( 0 );

			expect( itemMenu1View ).to.be.instanceOf( DropdownMenuListItemView );

			const menu1View = itemMenu1View.childView;

			expect( menu1View ).to.be.instanceof( DropdownMenuNestedMenuView );
			expect( menu1View.id ).to.equal( 'menu_1' );
			expect( menu1View.buttonView.label ).to.equal( 'Menu 1' );
			expect( menu1View.listView.items.length ).to.equal( 2 );

			const itemMenu1AView = menu1View.listView.items.get( 0 );

			expect( itemMenu1AView ).to.be.instanceOf( DropdownMenuListItemView );

			const btnMenu1AView = itemMenu1AView.childView;

			expect( btnMenu1AView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenu1AView.id ).to.equal( 'menu_1_a' );
			expect( btnMenu1AView.label ).to.equal( 'Item A' );

			const itemMenu1BView = menu1View.listView.items.get( 1 );

			expect( itemMenu1BView ).to.be.instanceOf( DropdownMenuListItemView );

			const btnMenu1BView = itemMenu1BView.childView;

			expect( btnMenu1BView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenu1BView.id ).to.equal( 'menu_1_b' );
			expect( btnMenu1BView.label ).to.equal( 'Item B' );

			const itemMenu2View = rootListView.items.get( 1 );

			expect( itemMenu2View ).to.be.instanceOf( DropdownMenuListItemView );

			const menu2View = itemMenu2View.childView;

			expect( menu2View ).to.be.instanceof( DropdownMenuNestedMenuView );
			expect( menu2View.id ).to.equal( 'menu_2' );
			expect( menu2View.buttonView.label ).to.equal( 'Menu 2' );
			expect( menu2View.listView.items.length ).to.equal( 1 );

			const itemMenu21View = menu2View.listView.items.get( 0 );

			expect( itemMenu21View ).to.be.instanceOf( DropdownMenuListItemView );

			const menu21View = itemMenu21View.childView;

			expect( menu21View ).to.be.instanceof( DropdownMenuNestedMenuView );
			expect( menu21View.id ).to.equal( 'menu_2_1' );
			expect( menu21View.buttonView.label ).to.equal( 'Menu 2 1' );
			expect( menu21View.listView.items.length ).to.equal( 1 );

			const itemMenu21AView = menu21View.listView.items.get( 0 );

			expect( itemMenu21AView ).to.be.instanceOf( DropdownMenuListItemView );

			const btnMenu21AView = itemMenu21AView.childView;

			expect( btnMenu21AView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenu21AView.id ).to.equal( 'menu_2_1_a' );
			expect( btnMenu21AView.label ).to.equal( 'Item A' );

			const itemMenuTopAView = rootListView.items.get( 2 );

			expect( itemMenuTopAView ).to.be.instanceOf( DropdownMenuListItemView );

			const btnMenuTopAView = itemMenuTopAView.childView;

			expect( btnMenuTopAView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenuTopAView.id ).to.equal( 'top_a' );
			expect( btnMenuTopAView.label ).to.equal( 'Item Top A' );

			const itemMenuTopBView = rootListView.items.get( 3 );

			expect( itemMenuTopBView ).to.be.instanceOf( DropdownMenuListItemView );

			const btnMenuTopBView = itemMenuTopBView.childView;

			expect( btnMenuTopBView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenuTopBView.id ).to.equal( 'top_b' );
			expect( btnMenuTopBView.label ).to.equal( 'Item Top B' );
		} );

		it( 'should add toggleMenusAndFocusItemsOnHover behavior', () => {
			// The behavior itself is tested separately in its own suite.
			const spy = sinon.spy( DropdownRootMenuBehaviors, 'toggleMenusAndFocusItemsOnHover' );

			rootListView.render();

			sinon.assert.calledOnceWithExactly( spy, rootListView );
		} );

		it( 'should add closeMenuWhenAnotherOnTheSameLevelOpens behavior', () => {
			// The behavior itself is tested separately in its own suite.
			const spy = sinon.spy( DropdownRootMenuBehaviors, 'closeMenuWhenAnotherOnTheSameLevelOpens' );

			rootListView.render();

			sinon.assert.calledOnceWithExactly( spy, rootListView );
		} );
	} );

	describe( 'menus', () => {
		it( 'is empty before render', () => {
			expect( rootListView.menus ).to.deep.equal( [] );
		} );

		it( 'should return all menus (including nested menus)', () => {
			rootListView.render();

			const menus = rootListView.menus;

			expect( menus.length ).to.equal( 3 );

			const menu1View = menus[ 0 ];

			expect( menu1View ).to.be.instanceof( DropdownMenuNestedMenuView );
			expect( menu1View.id ).to.equal( 'menu_1' );
			expect( menu1View.buttonView.label ).to.equal( 'Menu 1' );

			const menu2View = menus[ 1 ];

			expect( menu2View ).to.be.instanceof( DropdownMenuNestedMenuView );
			expect( menu2View.id ).to.equal( 'menu_2' );
			expect( menu2View.buttonView.label ).to.equal( 'Menu 2' );

			const menu21View = menus[ 2 ];

			expect( menu21View ).to.be.instanceof( DropdownMenuNestedMenuView );
			expect( menu21View.id ).to.equal( 'menu_2_1' );
			expect( menu21View.buttonView.label ).to.equal( 'Menu 2 1' );
		} );
	} );

	describe( 'buttons', () => {
		it( 'is empty before render', () => {
			expect( rootListView.buttons ).to.deep.equal( [] );
		} );

		it( 'should return all "leaf" buttons (including inside nested menus)', () => {
			rootListView.render();

			const buttons = rootListView.buttons;

			expect( buttons.length ).to.equal( 5 );

			const btnMenu1AView = buttons[ 0 ];

			expect( btnMenu1AView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenu1AView.id ).to.equal( 'menu_1_a' );
			expect( btnMenu1AView.label ).to.equal( 'Item A' );

			const btnMenu1BView = buttons[ 1 ];

			expect( btnMenu1BView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenu1BView.id ).to.equal( 'menu_1_b' );
			expect( btnMenu1BView.label ).to.equal( 'Item B' );

			const btnMenu21AView = buttons[ 2 ];

			expect( btnMenu21AView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenu21AView.id ).to.equal( 'menu_2_1_a' );
			expect( btnMenu21AView.label ).to.equal( 'Item A' );

			const btnMenuTopAView = buttons[ 3 ];

			expect( btnMenuTopAView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenuTopAView.id ).to.equal( 'top_a' );
			expect( btnMenuTopAView.label ).to.equal( 'Item Top A' );

			const btnMenuTopBView = buttons[ 4 ];

			expect( btnMenuTopBView ).to.be.instanceOf( DropdownMenuListItemButtonView );
			expect( btnMenuTopBView.id ).to.equal( 'top_b' );
			expect( btnMenuTopBView.label ).to.equal( 'Item Top B' );
		} );
	} );

	describe( 'menuPanelClass', () => {
		it( 'is undefined by default', () => {
			expect( rootListView.menuPanelClass ).to.be.undefined;
		} );

		it( 'should set nested menus panel views CSS class', () => {
			rootListView.render();

			for ( const menu of rootListView.menus ) {
				expect( menu.panelView.class ).to.be.undefined;
			}

			rootListView.menuPanelClass = 'foo';

			for ( const menu of rootListView.menus ) {
				expect( menu.panelView.class ).to.equal( 'foo' );
			}
		} );
	} );

	describe( 'closeMenus()', () => {
		it( 'closes all nested menus', () => {
			rootListView.render();

			const spy1 = sinon.spy();
			rootListView.menus[ 0 ].on( 'set:isOpen', ( evt, propName, newValue ) => spy1( newValue ) );

			const spy2 = sinon.spy();
			rootListView.menus[ 1 ].on( 'set:isOpen', ( evt, propName, newValue ) => spy2( newValue ) );

			const spy21 = sinon.spy();
			rootListView.menus[ 2 ].on( 'set:isOpen', ( evt, propName, newValue ) => spy21( newValue ) );

			rootListView.closeMenus();

			expect( spy1.calledWithExactly( false ) ).to.be.true;
			expect( spy2.calledWithExactly( false ) ).to.be.true;
			expect( spy21.calledWithExactly( false ) ).to.be.true;
		} );
	} );

	describe( 'events', () => {
		beforeEach( () => {
			rootListView.render();
		} );

		it( 'should fire execute event with the button id when a "leaf" button is executed', () => {
			const spy = sinon.spy();
			rootListView.on( 'menu:execute', evt => spy( evt.source.id ) );

			for ( const button of rootListView.buttons ) {
				button.fire( 'execute' );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.calledWithExactly( button.id ) ).to.be.true;

				spy.resetHistory();
			}
		} );

		const delegatedEvents = [ 'mouseenter', 'execute', 'change:isOpen' ];

		for ( const eventName of delegatedEvents ) {
			it( 'should fire "menu:' + eventName + '" event delegated from nested menus', () => {
				const spy = sinon.spy();
				rootListView.on( 'menu:' + eventName, spy );

				for ( const menu of rootListView.menus ) {
					menu.fire( eventName );

					expect( spy.calledOnce ).to.be.true;

					spy.resetHistory();
				}
			} );
		}
	} );
} );
