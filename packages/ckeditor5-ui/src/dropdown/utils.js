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
import ToolbarView from '../toolbar/toolbarview';
import ListView from '../list/listview';
import ListItemView from '../list/listitemview';

/**
 * Adds a behavior to a dropdownView that focuses dropdown panel view contents on keystrokes.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export function focusDropdownContentsOnArrows( dropdownView ) {
	// If the dropdown panel is already open, the arrow down key should
	// focus the first element in list.
	dropdownView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focus();
			cancel();
		}
	} );

	// If the dropdown panel is already open, the arrow up key should
	// focus the last element in the list.
	dropdownView.keystrokes.set( 'arrowup', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focusLast();
			cancel();
		}
	} );
}

/**
 * Adds a behavior to a dropdownView that closes dropdown view on any view collection item's "execute" event.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export function closeDropdownOnExecute( dropdownView ) {
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

	// Dropdown expects "select" event to show contents.
	buttonView.delegate( 'execute' ).to( buttonView, 'select' );

	return buttonView;
}

export function createSplitButtonForDropdown( model, locale ) {
	const buttonView = new SplitButtonView( locale );

	// TODO: check 'isOn' binding.
	buttonView.bind( 'label', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( model );

	// TODO: something wierd with binding
	buttonView.buttonView.bind( 'isOn' ).to( model );
	buttonView.buttonView.bind( 'tooltip' ).to( model );

	return buttonView;
}

export function createDropdownView( model, buttonView, locale ) {
	const panelView = new DropdownPanelView( locale );
	const dropdownView = new DropdownView( locale, buttonView, panelView );

	dropdownView.bind( 'isEnabled' ).to( model );

	// TODO: check 'isOn' binding.
	buttonView.bind( 'isOn' ).to( model, 'isOn', dropdownView, 'isOpen', ( isOn, isOpen ) => {
		return isOn || isOpen;
	} );

	return dropdownView;
}

export function createSplitButtonDropdown( model, locale ) {
	const splitButtonView = createSplitButtonForDropdown( model, locale );
	const dropdownView = createDropdownView( model, splitButtonView, locale );

	// Extend template to hide arrow from dropdown.
	// TODO: enable this on normal button instead of hiding it
	dropdownView.extendTemplate( {
		attributes: {
			class: 'ck-splitbutton-dropdown'
		}
	} );

	return dropdownView;
}

export function createSingleButtonDropdown( model, locale ) {
	const buttonView = createButtonForDropdown( model, locale );

	return createDropdownView( model, buttonView, locale );
}

export function enableModelIfOneIsEnabled( model, observables ) {
	model.bind( 'isEnabled' ).to(
		// Bind to #isEnabled of each observable...
		...getBindingTargets( observables, 'isEnabled' ),
		// ...and set it true if any observable #isEnabled is true.
		( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
	);
}

export function addListViewToDropdown( dropdownView, model, locale ) {
	const listView = dropdownView.listView = new ListView( locale );

	listView.items.bindTo( model.items ).using( itemModel => {
		const item = new ListItemView( locale );

		// Bind all attributes of the model to the item view.
		item.bind( ...Object.keys( itemModel ) ).to( itemModel );

		return item;
	} );

	dropdownView.panelView.children.add( listView );

	listView.items.delegate( 'execute' ).to( dropdownView );

	return listView;
}

export function addToolbarToDropdown( dropdownView, model ) {
	const toolbarView = dropdownView.toolbarView = new ToolbarView();

	// TODO verify className binding
	toolbarView.bind( 'isVertical', 'className' ).to( model, 'isVertical', 'toolbarClassName' );

	// TODO: verify class names
	dropdownView.extendTemplate( {
		attributes: {
			class: [ 'ck-buttondropdown' ]
		}
	} );

	dropdownView.panelView.children.add( toolbarView );

	// TODO: make it as 'items', 'views' ???
	model.buttons.map( view => toolbarView.items.add( view ) );

	return toolbarView;
}

export function addDefaultBehavior( dropdownView ) {
	closeDropdownOnBlur( dropdownView );
	closeDropdownOnExecute( dropdownView );
	focusDropdownContentsOnArrows( dropdownView );
}

// Returns an array of binding components for
// {@link module:utils/observablemixin~Observable#bind} from a set of iterable
// buttons.
//
// @private
// @param {Iterable.<module:ui/button/buttonview~ButtonView>} buttons
// @param {String} attribute
// @returns {Array.<String>}
function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
