/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/utils
 */

/* global document */

/**
 * Adds a behavior to a dropdownView that focuses dropdown panel view contents on keystrokes.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 * @param {module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable} panelViewContents
 */
export function focusDropdownContentsOnArrows( dropdownView, panelViewContents ) {
	// If the dropdown panel is already open, the arrow down key should
	// focus the first element in list.
	dropdownView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			panelViewContents.focus();
			cancel();
		}
	} );

	// If the dropdown panel is already open, the arrow up key should
	// focus the last element in the list.
	dropdownView.keystrokes.set( 'arrowup', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			panelViewContents.focusLast();
			cancel();
		}
	} );
}

/**
 * Adds a behavior to a dropdownView that closes dropdown view on any view collection item's "execute" event.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 * @param {module:ui/viewcollection~ViewCollection} viewCollection
 */
export function closeDropdownOnExecute( dropdownView, viewCollection ) {
	// TODO: Delegate all events instead of just execute.
	viewCollection.delegate( 'execute' ).to( dropdownView );

	// Close the dropdown when one of the list items has been executed.
	dropdownView.on( 'execute', () => {
		dropdownView.isOpen = false;
	} );
}

/**
 * Adds a behavior to a dropdownView that closes opened dropdown on user click outside the dropdown.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export function closeDropdownOnBlur( dropdownView ) {
	dropdownView.on( 'change:isOpen', ( evt, name, value ) => {
		if ( value ) {
			attachDocumentClickListener( document, dropdownView );
		} else {
			dropdownView.stopListening( document );
		}
	} );
}

// Attaches a "click" listener in DOM to check if any element outside
// the dropdown has been clicked.
//
// @private
// @param {module:ui/dropdown/listdropdownview~ListDropdownView} dropdownView
function attachDocumentClickListener( document, dropdownView ) {
	// TODO: It will probably be focus/blur-based rather than click. It should be bound
	// to focusmanager of some sort.
	dropdownView.listenTo( document, 'click', ( evtInfo, { target: domEvtTarget } ) => {
		// Collapse the dropdown when the webpage outside of the component is clicked.
		if ( dropdownView.element != domEvtTarget && !dropdownView.element.contains( domEvtTarget ) ) {
			dropdownView.isOpen = false;
		}
	} );
}
