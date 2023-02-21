/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/button/dropdownbuttonview
 */

import ButtonView from '../../button/buttonview';
import type DropdownButton from './dropdownbutton';
import IconView from '../../icon/iconview';

import type { Locale } from '@ckeditor/ckeditor5-utils';

import dropdownArrowIcon from '../../../theme/icons/dropdown-arrow.svg';

/**
 * The default dropdown button view class.
 *
 * ```ts
 * const view = new DropdownButtonView();
 *
 * view.set( {
 * 	label: 'A button',
 * 	keystroke: 'Ctrl+B',
 * 	tooltip: true
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 *
 * Also see the {@link module:ui/dropdown/utils~createDropdown `createDropdown()` util}.
 */
export default class DropdownButtonView extends ButtonView implements DropdownButton {
	/**
	 * An icon that displays arrow to indicate a dropdown button.
	 */
	public readonly arrowView: IconView;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.arrowView = this._createArrowView();

		this.extendTemplate( {
			attributes: {
				'aria-haspopup': true,
				'aria-expanded': this.bindTemplate.to( 'isOn', value => String( value ) )
			}
		} );

		// The DropdownButton interface expects the open event upon which will open the dropdown.
		this.delegate( 'execute' ).to( this, 'open' );
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
				class: 'ck-dropdown__arrow'
			}
		} );

		return arrowView;
	}
}
