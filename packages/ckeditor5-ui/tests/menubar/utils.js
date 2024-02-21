/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

describe( 'MenuBarView utils', () => {
	describe( 'MenuBarBehaviors', () => {
		it( 'should bring closeOnClickOutside() that makes the menus open and close while hovering using mouse by the user if ' +
			'the bar is already open', () => {

		} );

		it( 'should bring toggleMenusAndFocusItemsOnHover() that closes all menus (and sub-menus) when the bar closes', () => {

		} );

		it( 'should bring focusCycleMenusOnArrows() that closes a sub-menu when another one opens on the same level', () => {

		} );

		it( 'should bring closeMenusWhenTheBarCloses() that allows for moving horizontally across menus using arrow keys', () => {

		} );

		it( 'should bring closeMenuWhenAnotherOnTheSameLevelOpens() that closes the bar when the user clicked ' +
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
} );
