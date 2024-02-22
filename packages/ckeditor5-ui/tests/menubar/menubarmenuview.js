/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

describe( 'MenuBarMenuView', () => {
	describe( 'constructor()', () => {
		it( 'should have a button view', () => {

		} );

		it( 'should have a panel view', () => {

		} );

		it( 'should have a focus tracker instance', () => {

		} );

		it( 'should have a keystrokes handler instance', () => {

		} );

		it( 'should have #isOpen property set false by default', () => {

		} );

		it( 'should have #isEnabled property set true by default', () => {

		} );

		// it( 'should have #class property', () => {

		// } );

		it( 'should have #panelPosition property', () => {

		} );

		it( 'should have #class property', () => {

		} );

		it( 'should have #parentMenuView reference', () => {

		} );

		it( 'should have #menuBarView reference', () => {

		} );

		it( 'should have #ariaDescribedById property', () => {

		} );

		describe( '#buttonView', () => {
			it( 'should be an instance of MenuBarMenuButtonView', () => {

			} );

			it( 'should delegate mouseenter to the menu', () => {

			} );

			it( 'should have #isOn state bound to the menu\'s #isOpen', () => {

			} );
		} );

		describe( '#panelView', () => {
			it( 'should be an instance of MenuBarMenuPanelView', () => {

			} );

			it( 'should bind its #isVisible to menu\'s #isOpen', () => {

			} );
		} );

		describe( 'template and DOM element', () => {
			it( 'should have CSS classes', () => {

			} );

			it( 'should have CSS classes bound to #class', () => {

			} );

			it( 'should bind #isEnabled to a CSS class', () => {

			} );

			it( 'should bind #parentMenuView to a CSS class', () => {

			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add button and panel to the focus tracker', () => {

		} );

		it( 'should start listening to keystrokes', () => {

		} );

		describe( 'top-level menu', () => {
			it( 'should fire arrowright and arrowleft events upon arrow key press', () => {

			} );

			it( 'should enable a behavior that opens and focuses the panel on arrow down key', () => {

			} );

			it( 'should enable a behavior that toggles visibility of the menu upon clicking', () => {

			} );

			it( 'should delegate specific events to the menu bar with a prefix', () => {

			} );
		} );

		describe( 'sub-menu', () => {
			it( 'should enable a behavior that opens the menu upon clicking (but does not close it)', () => {

			} );

			it( 'should enable a behavior that opens the menu upon arrow right key press', () => {

			} );

			it( 'should enable a behavior that closes the menu upon arrow left key press', () => {

			} );

			it( 'should enable a behavior that closes the menu when its parent closes', () => {

			} );

			it( 'should delegate specific events to the parent menu', () => {

			} );
		} );

		it( 'should enable a behavior that closes the menu upon the Esc key press', () => {

		} );

		describe( 'panel repositioning upon open', () => {
			it( 'should update the position whenever the menu gets open (but not when it closes)', () => {

			} );

			describe( 'top-level menu', () => {
				describe( 'when the UI language is LTR', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );
			} );

			describe( 'sub-menu', () => {
				describe( 'when the UI language is LTR', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );
			} );
		} );
	} );
} );
