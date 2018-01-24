/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/helpers/createsplitbuttonfordropdown
 */

import SplitButtonView from '../../button/splitbuttonview';

export default function createSplitButtonForDropdown( model, locale ) {
	const splitButtonView = new SplitButtonView( locale );

	// TODO: Check if those binding are in good place (maybe move them to SplitButton) or add tests.
	splitButtonView.actionView.bind( 'isOn' ).to( splitButtonView );
	splitButtonView.actionView.bind( 'tooltip' ).to( splitButtonView );

	return splitButtonView;
}
