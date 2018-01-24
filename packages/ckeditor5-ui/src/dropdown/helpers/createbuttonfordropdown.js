/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ButtonView from '../../button/buttonview';

/**
 * @module ui/dropdown/helpers/createbuttonfordropdown
 */

export default function createButtonForDropdown( model, locale ) {
	const buttonView = new ButtonView( locale );

	// Dropdown expects "select" event to show contents.
	buttonView.delegate( 'execute' ).to( buttonView, 'select' );

	return buttonView;
}
