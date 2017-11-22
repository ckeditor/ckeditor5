/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/createsplitbuttondropdown
 */

import SplitButtonView from '../button/splitbuttonview';
import DropdownView from './dropdownview';
import DropdownPanelView from './dropdownpanelview';

/**
 * Create a dropdown that have a split button as button.
 *
 * TODO: docs
 */
export default function createSplitButtonDropdown( model, locale, startButton ) {
	const splitButtonView = new SplitButtonView( locale, startButton );

	// TODO: keystroke?
	splitButtonView.bind( 'label', 'isOn', 'isEnabled', 'withText', 'keystroke', 'tooltip' ).to( model );

	const panelView = new DropdownPanelView( locale );

	return new DropdownView( locale, splitButtonView, panelView );
}
