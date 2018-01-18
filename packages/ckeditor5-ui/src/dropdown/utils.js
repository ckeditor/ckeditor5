/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/utils
 */

import clickOutsideHandler from '../bindings/clickoutsidehandler';
import SplitButtonView from '../button/splitbuttonview';
import ButtonView from '../button/buttonview';
import DropdownPanelView from './dropdownpanelview';
import DropdownView from './dropdownview';

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

/** TODO: new methods below - refactor to own files later */

export function createButtonForDropdown( model, locale ) {
	const buttonView = new ButtonView( locale );

	buttonView.bind( 'label', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( model );

	return buttonView;
}

export function createSplitButtonForDropdown( model, locale ) {
	const buttonView = new SplitButtonView( locale );

	// TODO: check 'isOn' binding.
	buttonView.bind( 'label', 'isOn', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( model );

	return buttonView;
}

export function createDropdownView( model, buttonView, locale ) {
	const panelView = new DropdownPanelView( locale );
	const dropdownView = new DropdownView( locale, buttonView, panelView );

	dropdownView.bind( 'isEnabled' ).to( model );

	// TODO: check 'isOn' binding.
	// buttonView.bind( 'isOn' ).to( model, 'isOn', dropdownView, 'isOpen', ( isOn, isOpen ) => {
	// 	return isOn || isOpen;
	// } );

	return dropdownView;
}
