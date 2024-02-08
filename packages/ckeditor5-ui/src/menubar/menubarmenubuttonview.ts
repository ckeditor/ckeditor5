/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenubuttonview
 */

import IconView from '../icon/iconview.js';
import ButtonView from '../button/buttonview.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';

import dropdownArrowIcon from '../../theme/icons/dropdown-arrow.svg';

/**
 * TODO
 */
export default class MenuBarMenuButtonView extends ButtonView {
	/**
	 * TODO
	 */
	public readonly arrowView: IconView;

	/**
	 * TODO
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( {
			withText: true,
			role: 'menuitem'
		} );

		this.arrowView = this._createArrowView();

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-menu-bar__menu__button'
				],
				'aria-haspopup': true,
				'aria-expanded': this.bindTemplate.to( 'isOn', value => String( value ) ),
				'data-cke-tooltip-disabled': bind.to( 'isOn' )
			},
			on: {
				'mouseenter': bind.to( 'mouseenter' )
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.children.add( this.arrowView );
	}

	/**
	 * TODO
	 */
	private _createArrowView() {
		const arrowView = new IconView();

		arrowView.content = dropdownArrowIcon;
		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-menu-bar__menu__button__arrow'
			}
		} );

		return arrowView;
	}
}
