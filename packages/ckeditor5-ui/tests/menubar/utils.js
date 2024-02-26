/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { ComponentFactory, MenuBarMenuListItemButtonView, MenuBarMenuView, MenuBarView } from '../../src/index.js';
import { barDump, getItemByLabel, getMenuByLabel } from './_utils/utils.js';

describe( 'MenuBarView utils', () => {
	testUtils.createSinonSandbox();

	const locale = new Locale();

	describe( 'MenuBarBehaviors', () => {
		let menuBarView, factory;

		beforeEach( () => {
			menuBarView = new MenuBarView( locale );
			factory = new ComponentFactory( {} );
			menuBarView.render();

			document.body.appendChild( menuBarView.element );

			factory.add( 'menu-A-item1', getButtonCreator( 'menu-A-item1' ) );
			factory.add( 'menu-AA-item1', getButtonCreator( 'menu-AA-item1' ) );
			factory.add( 'menu-AB-item1', getButtonCreator( 'menu-AB-item1' ) );
			factory.add( 'AAA (from-factory)', () => {
				const menuView = new MenuBarMenuView( locale );
				menuView.buttonView.label = 'AAA (from-factory)';
				return menuView;
			} );
			factory.add( 'menu-B-item1', getButtonCreator( 'menu-B-item1' ) );

			menuBarView.fillFromConfig( [
				{
					id: 'A',
					label: 'A',
					items: [
						'menu-A-item1',
						{
							id: 'AA',
							label: 'AA',
							items: [
								'menu-AA-item1',
								'AAA (from-factory)'
							]
						},
						{
							id: 'AB',
							label: 'AB',
							items: [
								'menu-AB-item1'
							]
						}
					]
				},
				{
					id: 'B',
					label: 'B',
					items: [
						'menu-B-item1'
					]
				}
			], factory );
		} );

		afterEach( () => {
			menuBarView.element.remove();
		} );

		describe( 'toggleMenusAndFocusItemsOnHover()', () => {
			it( 'should not engage if the bar is closed', () => {

			} );

			describe( 'if the bar is already open', () => {
				it( 'should toggle menus while hovering using a mouse (top-level menu -> top-level menu)', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const menuB = getMenuByLabel( menuBarView, 'B' );

					menuA.isOpen = true;
					menuB.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							}
						]
					);

					menuA.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							}
						]
					);
				} );

				it( 'should toggle menus while hovering using a mouse (sub-menu -> sub-menu)', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );
					const menuAB = getMenuByLabel( menuBarView, 'AB' );

					menuAA.isOpen = true;
					menuAB.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: true, isFocused: true, items: [
										{ label: 'menu-AB-item1', isFocused: false }
									] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							}
						]
					);

					menuAA.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: true, isFocused: true, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [
										{ label: 'menu-AB-item1', isFocused: false }
									] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							}
						]
					);
				} );

				it( 'should toggle menus while hovering using a mouse (sub-menu -> item)', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );
					const menuAItem1 = getItemByLabel( menuBarView, 'menu-A-item1' );

					menuAA.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: true, isFocused: true, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							}
						]
					);

					menuAItem1.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: true },
									{ label: 'AA', isOpen: false, isFocused: false, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							}
						]
					);
				} );
			} );
		} );

		it( 'should bring closeMenusWhenTheBarCloses() that closes all menus (and sub-menus) when the bar closes', () => {

		} );

		it( 'should bring closeMenuWhenAnotherOnTheSameLevelOpens() that closes a sub-menu when another one opens ' +
			'on the same level', () => {

		} );

		it( 'should bring focusCycleMenusOnArrows() that allows for moving horizontally across menus using arrow keys', () => {

		} );

		it( 'should bring closeOnClickOutside() that closes the bar when the user clicked ' +
			' somewhere outside of it', () => {

		} );
	} );

	describe( 'MenuBarMenuBehaviors', () => {
		describe( 'for top-level menus', () => {
			it( 'should bring openAndFocusPanelOnArrowDownKey() that opens and focuses the panel on arrow down key', () => {

			} );

			it( 'should bring toggleOnButtonClick() that toggles the visibility of the menu upon clicking', () => {

			} );
		} );

		describe( 'for sub-menu', () => {
			it( 'should bring openOnButtonClick() that opens the menu upon clicking (but does not close it)', () => {

			} );

			it( 'should bring openOnArrowRightKey() that opens the menu upon arrow right key press', () => {

			} );

			it( 'should bring closeOnArrowLeftKey() that closes the menu upon arrow left key press', () => {

			} );

			it( 'should bring closeOnParentClose() that closes the menu when its parent closes', () => {

			} );
		} );

		it( 'should bring closeOnEscKey() that closes the menu on Esc key press', () => {

		} );
	} );

	describe( 'MenuBarMenuViewPanelPositioningFunctions', () => {
		it( 'should bring the "southEast" positioning fuction', () => {

		} );

		it( 'should bring the "southWest" positioning fuction', () => {

		} );

		it( 'should bring the "northEast" positioning fuction', () => {

		} );

		it( 'should bring the "northWest" positioning fuction', () => {

		} );

		it( 'should bring the "eastSouth" positioning fuction', () => {

		} );

		it( 'should bring the "eastNorth" positioning fuction', () => {

		} );

		it( 'should bring the "westSouth" positioning fuction', () => {

		} );

		it( 'should bring the "westNorth" positioning fuction', () => {

		} );
	} );

	function getButtonCreator( label ) {
		return () => {
			const buttonView = new MenuBarMenuListItemButtonView( locale );
			buttonView.label = label;
			return buttonView;
		};
	}
} );
