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

	buttonView.delegate( 'execute' ).to( dropdownView );

	return dropdownView;
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
