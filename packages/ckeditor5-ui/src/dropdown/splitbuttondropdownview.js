/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/splitbuttondropdownview
 */

import DropdownView from './dropdownview';

/**
 * The split button dropdown view class.
 *
 * @extends module:ui/view~View
 */
export default class SplitButtonDropdownView extends DropdownView {
	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Disable default panel open on "execute"
		this.stopListening( this.buttonView, 'execute' );

		this.listenTo( this.buttonView, 'select', () => {
			this.isOpen = !this.isOpen;
		} );
	}
}
