/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/helpers/closedropdownonexecute
 */

/**
 * Adds a behavior to a dropdownView that closes dropdown view on any view collection item's "execute" event.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export default function closeDropdownOnExecute( dropdownView ) {
	// Close the dropdown when one of the list items has been executed.
	dropdownView.on( 'execute', () => {
		dropdownView.isOpen = false;
	} );
}
