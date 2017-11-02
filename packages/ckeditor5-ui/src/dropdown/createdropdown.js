/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/createdropdown
 */

import ButtonView from '../button/buttonview';
import DropdownView from './dropdownview';
import DropdownPanelView from './dropdownpanelview';

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
export default function createDropdown( model, locale ) {
	const buttonView = new ButtonView( locale );
	buttonView.bind( 'label', 'isOn', 'isEnabled', 'withText', 'keystroke', 'tooltip' ).to( model );

	const panelView = new DropdownPanelView( locale );

	return new DropdownView( locale, buttonView, panelView );
}
