/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

describe( 'MenuBarView', () => {
	describe( 'constructor()', () => {
		it( 'should have collection of #children connected to the main element', () => {

		} );

		describe( 'template and DOM element', () => {
			it( 'should have CSS classes', () => {

			} );

			it( 'should have an ARIA role attribute', () => {

			} );
		} );

		describe( '#isOpen', () => {
			it( 'should be false by default', () => {

			} );

			it( 'should be a sum of #isOpen of top-level sub-menus and never go false when going from one sub-menu to another', () => {

			} );
		} );
	} );

	describe( 'fillFromConfig()', () => {
		it( 'should localize top-level category labels from the config', () => {

		} );

		it( 'should explode the configuration and create top-level menus and sub-menus', () => {
			// Some generic test because this is tested below in details.
		} );

		// TODO: We don't have it yet.
		it( 'should normalize the config to avoid empty menus and subsequent separators', () => {

		} );

		// TODO: We need to figure out how to implement this first.
		it( 'should not warn if using a default config (automatic template) but warn if using integrator\'s config', () => {

		} );

		describe( 'menu creation', () => {
			it( 'should deliver MenuBarMenuView instances', () => {

			} );

			it( 'should set the menu button\'s label', () => {

			} );

			it( 'should defer menu view\'s initialization until first open (performance)', () => {

			} );

			it( 'should use MenuBarMenuListView instances in MenuBarMenuView panels', () => {

			} );

			it( 'should populate MenuBarMenuListView instances recursively with buttons and sub-menus', () => {

			} );

			describe( 'menu item creation', () => {
				it( 'should create separators in place of "-"', () => {

				} );

				it( 'should use MenuBarMenuListItemView for list items', () => {

				} );

				it( 'should create sub-menus with MenuBarMenuView recursively and put them in MenuBarMenuListItemView', () => {

				} );

				describe( 'feature component creation using component factory', () => {
					it( 'should produce a component an put in MenuBarMenuListItemView', () => {

					} );

					it( 'should warn if the compoent is not MenuBarMenuView or MenuBarMenuListItemButtonView', () => {

					} );

					it( 'should register nested MenuBarMenuView produced by the factory', () => {

					} );

					it( 'should delegate events from feature components to the parent menu', () => {

					} );

					it( 'should close parent menu when feature component fires #execute', () => {

					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add a behavior that makes the menus open and close while hovering using mouse by the user if ' +
			'the bar is already open', () => {

		} );

		it( 'should add a behavior that closes all menus (and sub-menus) when the bar closes', () => {

		} );

		it( 'should add a behavior that closes a sub-menu when another one opens on the same level', () => {

		} );

		it( 'should add a behavior that allows for moving horizontally across menus using arrow keys', () => {

		} );

		it( 'should add a behavior that closes the bar when the user clicked somewhere outside of it', () => {

		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first top-level sub-menu', () => {

		} );
	} );

	describe( 'close()', () => {
		it( 'should close all top-level sub-menus', () => {

		} );
	} );

	describe( 'registerMenu()', () => {
		it( 'should set all properties and add the menu to the list of known menus', () => {

		} );
	} );
} );
