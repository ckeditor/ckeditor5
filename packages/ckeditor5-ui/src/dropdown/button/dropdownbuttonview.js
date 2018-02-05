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
 *		const view = new DropdownButtonView();
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
 * @implements module:ui/dropdown/dropdownbuttoninterface~DropdownButtonInterface
 */
export default class DropdownButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * An icon that displays arrow to indicate a dropdown button.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/button/dropdownbuttonview~DropdownButtonView}
		 */
		this.arrowView = this._createArrowView();

		// Dropdown expects "select" event on button view upon which the dropdown will open.
		this.delegate( 'execute' ).to( this, 'select' );

		/**
		 * Fired when the view is clicked. It won't be fired when the button {@link #isEnabled} is `false`.
		 *
		 * @event select
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.children.add( this.arrowView );
	}

	/**
	 * Creates a {@link module:ui/icon/iconview~IconView} instance as {@link #arrowView}.
	 *
	 * @private
	 * @returns {module:ui/icon/iconview~IconView}
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
