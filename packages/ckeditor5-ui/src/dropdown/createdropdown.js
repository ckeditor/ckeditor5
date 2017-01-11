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
 * Creates an instance of {@link module:ui/dropdown/dropdownview~DropdownView} class using
 * defined model.
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
