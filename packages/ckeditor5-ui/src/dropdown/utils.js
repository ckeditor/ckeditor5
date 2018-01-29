/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/utils
 */

import DropdownPanelView from './dropdownpanelview';
import DropdownView from './dropdownview';
import SplitButtonView from '../button/splitbuttonview';
import ButtonView from '../button/buttonview';
import ToolbarView from '../toolbar/toolbarview';

import clickOutsideHandler from '../bindings/clickoutsidehandler';

import '../../theme/components/dropdown/toolbardropdown.css';

/**
 * A helper which creates an instance of {@link module:ui/dropdown/dropdownview~DropdownView} class using
 * a provided {@link module:ui/dropdown/dropdownmodel~DropdownModel}.
 *
 *		const model = new Model( {
 *			label: 'A dropdown',
 *			isEnabled: true,
 *			isOn: false,
 *			withText: true
 *		} );
 *
 *		const dropdown = createDropdown( model );
 *
 *		dropdown.render();
 *
 *		// Will render a dropdown labeled "A dropdown" with an empty panel.
 *		document.body.appendChild( dropdown.element );
 *
 * The model instance remains in control of the dropdown after it has been created. E.g. changes to the
 * {@link module:ui/dropdown/dropdownmodel~DropdownModel#label `model.label`} will be reflected in the
 * dropdown button's {@link module:ui/button/buttonview~ButtonView#label} attribute and in DOM.
 *
 * Also see {@link module:ui/dropdown/list/createlistdropdown~createListDropdown}.
 *
 * @param {module:ui/dropdown/dropdownmodel~DropdownModel} model Model of this dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView} The dropdown view instance.
 */
export function createDropdown( model, locale ) {
	const buttonView = createButtonForDropdown( model, locale );

	const dropdownView = prepareDropdown( locale, buttonView, model );

	addDefaultBehavior( dropdownView );

	return dropdownView;
}

/**
 * A helper which creates an instance of {@link module:ui/dropdown/dropdownview~DropdownView} class using
 * a provided {@link module:ui/dropdown/dropdownmodel~DropdownModel}.
 *
 *		const model = new Model( {
 *			label: 'A dropdown',
 *			isEnabled: true,
 *			isOn: false,
 *			withText: true
 *		} );
 *
 *		const dropdown = createDropdown( model );
 *
 *		dropdown.render();
 *
 *		// Will render a dropdown labeled "A dropdown" with an empty panel.
 *		document.body.appendChild( dropdown.element );
 *
 * The model instance remains in control of the dropdown after it has been created. E.g. changes to the
 * {@link module:ui/dropdown/dropdownmodel~DropdownModel#label `model.label`} will be reflected in the
 * dropdown button's {@link module:ui/button/buttonview~ButtonView#label} attribute and in DOM.
 *
 * Also see {@link module:ui/dropdown/list/createlistdropdown~createListDropdown}.
 *
 * @param {module:ui/dropdown/dropdownmodel~DropdownModel} model Model of this dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView} The dropdown view instance.
 */
export function createSplitButtonDropdown( model, locale ) {
	const buttonView = createSplitButtonForDropdown( model, locale );

	const dropdownView = prepareDropdown( locale, buttonView, model );

	addDefaultBehavior( dropdownView );

	buttonView.delegate( 'execute' ).to( dropdownView );

	return dropdownView;
}

/**
 * Creates an instance of {@link module:ui/dropdown/button/buttondropdownview~ButtonDropdownView} class using
 * a provided {@link module:ui/dropdown/button/buttondropdownmodel~ButtonDropdownModel}.
 *
 *		const buttons = [];
 *
 *		buttons.push( new ButtonView() );
 *		buttons.push( editor.ui.componentFactory.get( 'someButton' ) );
 *
 *		const model = new Model( {
 *			label: 'A button dropdown',
 *			isVertical: true,
 *			buttons
 *		} );
 *
 *		const dropdown = createButtonDropdown( model, locale );
 *
 *		// Will render a vertical button dropdown labeled "A button dropdown"
 *		// with a button group in the panel containing two buttons.
 *		dropdown.render()
 *		document.body.appendChild( dropdown.element );
 *
 * The model instance remains in control of the dropdown after it has been created. E.g. changes to the
 * {@link module:ui/dropdown/dropdownmodel~DropdownModel#label `model.label`} will be reflected in the
 * dropdown button's {@link module:ui/button/buttonview~ButtonView#label} attribute and in DOM.
 *
 * See {@link module:ui/dropdown/createdropdown~createDropdown}.
 *
 * @param {module:ui/dropdown/button/buttondropdownmodel~ButtonDropdownModel} model Model of the list dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView}
 */
export function addToolbarToDropdown( dropdownView, buttons, model ) {
	const toolbarView = dropdownView.toolbarView = new ToolbarView();

	toolbarView.bind( 'isVertical' ).to( model, 'isVertical' );

	dropdownView.extendTemplate( {
		attributes: {
			class: [ 'ck-toolbar-dropdown' ]
		}
	} );

	// TODO: bind buttons to items in toolbar
	buttons.map( view => toolbarView.items.add( view ) );

	dropdownView.panelView.children.add( toolbarView );
	toolbarView.items.delegate( 'execute' ).to( dropdownView );

	return toolbarView;
}

// @private
function prepareDropdown( locale, buttonView, model ) {
	const panelView = new DropdownPanelView( locale );
	const dropdownView = new DropdownView( locale, buttonView, panelView );

	dropdownView.bind( 'isEnabled' ).to( model );

	buttonView.bind( 'label', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( model );
	buttonView.bind( 'isOn' ).to( model, 'isOn', dropdownView, 'isOpen', ( isOn, isOpen ) => {
		return isOn || isOpen;
	} );

	return dropdownView;
}

// @private
function createSplitButtonForDropdown( model, locale ) {
	const splitButtonView = new SplitButtonView( locale );

	// TODO: Check if those binding are in good place (maybe move them to SplitButton) or add tests.
	splitButtonView.actionView.bind( 'isOn' ).to( splitButtonView );
	splitButtonView.actionView.bind( 'tooltip' ).to( splitButtonView );

	return splitButtonView;
}

// @private
function createButtonForDropdown( model, locale ) {
	const buttonView = new ButtonView( locale );

	// Dropdown expects "select" event to show contents.
	buttonView.delegate( 'execute' ).to( buttonView, 'select' );

	return buttonView;
}

// @private
function addDefaultBehavior( dropdown ) {
	closeDropdownOnBlur( dropdown );
	closeDropdownOnExecute( dropdown );
	focusDropdownContentsOnArrows( dropdown );
}

// Adds a behavior to a dropdownView that closes opened dropdown on user click outside the dropdown.
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

// Adds a behavior to a dropdownView that closes dropdown view on any view collection item's "execute" event.
//
// @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
function closeDropdownOnExecute( dropdownView ) {
	// Close the dropdown when one of the list items has been executed.
	dropdownView.on( 'execute', () => {
		dropdownView.isOpen = false;
	} );
}

// Adds a behavior to a dropdownView that focuses dropdown panel view contents on keystrokes.
//
// @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
function focusDropdownContentsOnArrows( dropdownView ) {
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
