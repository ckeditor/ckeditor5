/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/button/dropdownbuttonview
 */

import ButtonView from '../../button/buttonview';

import dropdownArrowIcon from '../../../theme/icons/dropdown-arrow.svg';
import IconView from '../../icon/iconview';

/**
 * The default dropdown button view class.
 *
 *		const view = new SplitButtonView();
 *
 *		view.set( {
 *			label: 'A button',
 *			keystroke: 'Ctrl+B',
 *			tooltip: true
 *		} );
 *
 *		view.render();
 *
 *		document.body.append( view.element );
 *
 * @extends module:ui/view~View
 */
export default class DropdownButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * A secondary button of split button that opens dropdown.
		 *
		 * @readonly
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.arrowView = this._createArrowView();

		// Dropdown expects "select" event on button view upon which the dropdown will open.
		this.delegate( 'execute' ).to( this, 'select' );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.children.add( this.arrowView );
	}

	/**
	 * Creates a {@link module:ui/button/buttonview~ButtonView} instance as {@link #arrowView} and binds it with main split button
	 * attributes.
	 *
	 * @private
	 * @returns {module:ui/button/buttonview~ButtonView}
	 */
	_createArrowView() {
		const arrowView = new IconView();

		arrowView.content = dropdownArrowIcon;

		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-dropdown__arrow'
			}
		} );

		return arrowView;
	}
}
