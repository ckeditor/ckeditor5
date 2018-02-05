/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/utils
 */

import DropdownPanelView from './dropdownpanelview';
import DropdownView from './dropdownview';
import DropdownButtonView from '../button/dropdownbuttonview';
import SplitButtonView from '../button/splitbuttonview';
import ToolbarView from '../toolbar/toolbarview';
import ListView from '../list/listview';
import ListItemView from '../list/listitemview';

import clickOutsideHandler from '../bindings/clickoutsidehandler';

import '../../theme/components/dropdown/toolbardropdown.css';

/**
 * A helper which creates an instance of {@link module:ui/dropdown/dropdownview~DropdownView} class with an instance of
 * {@link module:ui/button/buttonview~ButtonView} in toolbar.
 *
 *		const dropdown = createDropdown( model );
 *
 *		// Configure dropdown properties:
 *		dropdown.set( {
 *			label: 'A dropdown',
 *			isEnabled: true,
 *			isOn: false,
 *			withText: true
 *		} );
 *
 *		dropdown.render();
 *
 *		// Will render a dropdown labeled "A dropdown" with an empty panel.
 *		document.body.appendChild( dropdown.element );
 *
 * Also see {@link module:ui/dropdown/utils~createSplitButtonDropdown}, {@link module:ui/dropdown/utils~addListToDropdown}
 * and {@link module:ui/dropdown/utils~addToolbarToDropdown}.
 *
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView} The dropdown view instance.
 */
export function createDropdown( locale ) {
	const buttonView = new DropdownButtonView( locale );

	const dropdownView = prepareDropdown( locale, buttonView );
	addDefaultBehavior( dropdownView );

	return dropdownView;
}

/**
 * A helper which creates an instance of {@link module:ui/dropdown/dropdownview~DropdownView} class with an instance of
 * {@link module:ui/button/splitbuttonview~SplitButtonView} in toolbar.
 *
 *		const dropdown = createSplitButtonDropdown( model );
 *
 *		// Configure dropdown properties:
 *		dropdown.set( {
 *			label: 'A dropdown',
 *			isEnabled: true,
 *			isOn: false
 *		} );
 *
 *		dropdown.render();
 *
 *		// Will render a dropdown labeled "A dropdown" with an empty panel.
 *		document.body.appendChild( dropdown.element );
 *
 * Also see {@link module:ui/dropdown/utils~createDropdown}, {@link module:ui/dropdown/utils~addListToDropdown}
 * and {@link module:ui/dropdown/utils~addToolbarToDropdown}.
 *
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView} The dropdown view instance.
 */
export function createSplitButtonDropdown( locale ) {
	const buttonView = new SplitButtonView( locale );

	const dropdownView = prepareDropdown( locale, buttonView );
	addDefaultBehavior( dropdownView );

	buttonView.delegate( 'execute' ).to( dropdownView );

	return dropdownView;
}

/**
 * Adds an instance of {@link module:ui/toolbar/toolbarview~ToolbarView} to a dropdown.
 *
 *		const buttons = [];
 *
 * 		// Either create a new ButtonView instance or create existing.
 *		buttons.push( new ButtonView() );
 *		buttons.push( editor.ui.componentFactory.get( 'someButton' ) );
 *
 *		const dropdown = createDropdown( locale );
 *
 *		addToolbarToDropdown( dropdown, buttons );
 *
 *		dropdown.isVertical = true;
 *
 *		// Will render a vertical button dropdown labeled "A button dropdown"
 *		// with a button group in the panel containing two buttons.
 *		dropdown.render()
 *		document.body.appendChild( dropdown.element );
 *
 * See {@link module:ui/dropdown/utils~createDropdown}, {@link module:ui/dropdown/utils~createSplitButtonDropdown}
 * and {@link module:ui/toolbar/toolbarview~ToolbarView}.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView A dropdown instance to which `ToolbarView` will be added.
 * @param {Iterable.<module:ui/button/buttonview~ButtonView>} buttons
 */
export function addToolbarToDropdown( dropdownView, buttons ) {
	const toolbarView = dropdownView.toolbarView = new ToolbarView();

	toolbarView.bind( 'isVertical' ).to( dropdownView, 'isVertical' );

	dropdownView.extendTemplate( {
		attributes: {
			class: [ 'ck-toolbar-dropdown' ]
		}
	} );

	buttons.map( view => toolbarView.items.add( view ) );

	dropdownView.panelView.children.add( toolbarView );
	toolbarView.items.delegate( 'execute' ).to( dropdownView );
}

/**
 * Adds an instance of {@link module:ui/list/listview~ListView} to a dropdown.
 *
 *		const items = new Collection();
 *
 *		items.add( new Model( { label: 'First item', style: 'color: red' } ) );
 *		items.add( new Model( { label: 'Second item', style: 'color: green', class: 'foo' } ) );
 *
 *		const dropdown = createDropdown( locale );
 *
 *		addListToDropdown( dropdown, items );
 *
 *		// Will render a dropdown with a list in the panel containing two items.
 *		dropdown.render()
 *		document.body.appendChild( dropdown.element );
 *
 * The `items` collection passed to this methods controls the presence and attributes of respective
 * {@link module:ui/list/listitemview~ListItemView list items}.
 *
 *
 * See {@link module:ui/dropdown/utils~createDropdown}, {@link module:ui/dropdown/utils~createSplitButtonDropdown}
 * and {@link module:list/list~List}.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView A dropdown instance to which `ListVIew` will be added.
 * @param {module:utils/collection~Collection} items
 * that the inner dropdown {@link module:ui/list/listview~ListView} children are created from.
 *
 * Usually, it is a collection of {@link module:ui/model~Model models}.
 */
export function addListToDropdown( dropdownView, items ) {
	const locale = dropdownView.locale;
	const listView = dropdownView.listView = new ListView( locale );

	listView.items.bindTo( items ).using( itemModel => {
		const item = new ListItemView( locale );

		// Bind all attributes of the model to the item view.
		item.bind( ...Object.keys( itemModel ) ).to( itemModel );

		return item;
	} );

	dropdownView.panelView.children.add( listView );

	listView.items.delegate( 'execute' ).to( dropdownView );
}

// Creates a dropdown view instance and binds dropdown view with a button view.
//
// @param {module:utils/locale~Locale} locale The locale instance.
// @param {module:ui/button/buttonview~ButtonView|module:ui/button/splitbuttonview~SplitButtonView} locale The button view instance.
// @returns {module:ui/dropdown/dropdownview~DropdownView}
function prepareDropdown( locale, buttonView ) {
	const panelView = new DropdownPanelView( locale );
	const dropdownView = new DropdownView( locale, buttonView, panelView );

	buttonView.bind( 'label', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( dropdownView );

	buttonView.bind( 'isOn' ).to( dropdownView, 'isOn', dropdownView, 'isOpen', ( isOn, isOpen ) => {
		return isOn || isOpen;
	} );

	return dropdownView;
}

// Add a set of default behaviors to dropdown view.
//
// @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
function addDefaultBehavior( dropdownView ) {
	closeDropdownOnBlur( dropdownView );
	closeDropdownOnExecute( dropdownView );
	focusDropdownContentsOnArrows( dropdownView );
}

// Adds a behavior to a dropdownView that closes opened dropdown when user clicks outside the dropdown.
//
// @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
function closeDropdownOnBlur( dropdownView ) {
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

// Adds a behavior to a dropdownView that closes the dropdown view on "execute" event.
//
// @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
function closeDropdownOnExecute( dropdownView ) {
	// Close the dropdown when one of the list items has been executed.
	dropdownView.on( 'execute', () => {
		dropdownView.isOpen = false;
	} );
}

// Adds a behavior to a dropdownView that focuses the dropdown's panel view contents on keystrokes.
//
// @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
function focusDropdownContentsOnArrows( dropdownView ) {
	// If the dropdown panel is already open, the arrow down key should focus the first child of the #panelView.
	dropdownView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focus();
			cancel();
		}
	} );

	// If the dropdown panel is already open, the arrow up key should focus the last child of the #panelView.
	dropdownView.keystrokes.set( 'arrowup', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focusLast();
			cancel();
		}
	} );
}
