/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/createsplitbuttondropdown
 */

import SplitButtonView from '../button/splitbuttonview';
import SplitButtonDropdownView from './splitbuttondropdownview';
import DropdownPanelView from './dropdownpanelview';

/**
 * Create a dropdown that have a split button as button.
 *
 * TODO: docs
 */
export default function createSplitButtonDropdown( model, locale ) {
	const splitButtonView = new SplitButtonView( locale );

	splitButtonView.bind( 'label', 'isOn', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( model );
	splitButtonView.buttonView.bind( 'isOn' ).to( model );
	splitButtonView.buttonView.bind( 'tooltip' ).to( model );

	const panelView = new DropdownPanelView( locale );
	const dropdownView = new SplitButtonDropdownView( locale, splitButtonView, panelView );

	// Extend template to hide arrow from dropdown.
	// TODO: enable this on normal button instead of hiding it
	dropdownView.extendTemplate( {
		attributes: {
			class: 'ck-splitbutton-dropdown'
		}
	} );

	return dropdownView;
}
