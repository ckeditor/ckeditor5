/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menu/menubuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ButtonView from '../button/buttonview.js';
import IconView from '../icon/iconview.js';
import dropdownArrowIcon from '../../theme/icons/dropdown-arrow.svg';

import '../../theme/components/menu/menuwithbuttonbutton.css';

export default class MenuWithButtonButtonView extends ButtonView {
	/**
	 * An icon that displays arrow to indicate a dropdown button.
	 */
	public readonly arrowView: IconView;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.arrowView = this._createArrowView();

		this.extendTemplate( {
			attributes: {
				'aria-haspopup': true,
				'aria-expanded': bind.to( 'isOn' ),
				class: [
					'ck-menu-with-button__button'
				],
				'data-cke-tooltip-disabled': bind.to( 'isOn' )
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
	 * Creates a {@link module:ui/icon/iconview~IconView} instance as {@link #arrowView}.
	 */
	private _createArrowView() {
		const arrowView = new IconView();

		arrowView.content = dropdownArrowIcon;

		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-menu-with-button__button__arrow'
			}
		} );

		return arrowView;
	}
}
