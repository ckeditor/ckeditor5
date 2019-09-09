/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/switchbuttonview
 */

import View from '../view';
import ButtonView from './buttonview';

import '../../theme/components/button/switchbutton.css';

/**
 * The switch button view class.
 *
 *		const view = new SwitchButtonView();
 *
 *		view.set( {
 *			withText: true,
 *			label: 'Switch me!'
 *		} );
 *
 *		view.render();
 *
 *		document.body.append( view.element );
 *
 * @extends module:ui/button/buttonview~ButtonView
 */
export default class SwitchButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		this.isToggleable = true;

		/**
		 * The toggle switch of the button.
		 *
		 * @readonly
		 * @member {module:ui/view~View} #toggleSwitchView
		 */
		this.toggleSwitchView = this._createToggleView();

		this.extendTemplate( {
			attributes: {
				class: 'ck-switchbutton'
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.children.add( this.toggleSwitchView );
	}

	/**
	 * Creates a toggle child view.
	 *
	 * @private
	 * @returns {module:ui/view~View}
	 */
	_createToggleView() {
		const toggleSwitchView = new View();

		toggleSwitchView.setTemplate( {
			tag: 'span',

			attributes: {
				class: [
					'ck',
					'ck-button__toggle'
				],
			},

			children: [
				{
					tag: 'span',

					attributes: {
						class: [
							'ck',
							'ck-button__toggle__inner'
						],
					}
				}
			]
		} );

		return toggleSwitchView;
	}
}
