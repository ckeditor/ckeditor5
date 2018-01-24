/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/helpers
 */

import clickOutsideHandler from '../../bindings/clickoutsidehandler';

/**
 * Adds a behavior to a dropdownView that closes opened dropdown on user click outside the dropdown.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export default function closeDropdownOnBlur( dropdownView ) {
	dropdownView.on( 'render', () => {
		clickOutsideHandler( {
			emitter: dropdownView,
			activator: () => dropdownView.isOpen,
			callback: () => {
				dropdownView.isOpen = false;
			},
			contextElements: [ dropdownView.element ]
		} );
	} );
}
