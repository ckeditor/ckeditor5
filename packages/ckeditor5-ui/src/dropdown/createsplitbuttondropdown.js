/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/createsplitbuttondropdown
 */

import { createDropdownView, createSplitButtonForDropdown } from './utils';

/**
 * Create a dropdown that have a split button as button.
 *
 * TODO: docs
 */
export default function createSplitButtonDropdown( model, locale ) {
	const splitButtonView = createSplitButtonForDropdown( model, locale );

	splitButtonView.buttonView.bind( 'isOn' ).to( model );
	splitButtonView.buttonView.bind( 'tooltip' ).to( model );

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
