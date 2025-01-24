/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/menu/dropdownmenubuttonview
 */

import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import IconView from '../../icon/iconview.js';
import ListItemButtonView from '../../button/listitembuttonview.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';

import '../../../theme/components/dropdown/menu/dropdownmenubutton.css';

/**
 * Represents a view for a dropdown menu button.
 */
export default class DropdownMenuButtonView extends ListItemButtonView {
	/**
	 * An icon that displays an arrow to indicate a direction of the menu.
	 */
	public readonly arrowView: IconView;

	/**
	 * Creates an instance of the dropdown menu button view.
	 *
	 * @param locale The localization services instance.
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
					'ck-dropdown-menu-list__nested-menu__button'
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
	 * Creates the arrow view instance.
	 *
	 * @private
	 */
	private _createArrowView() {
		const arrowView = new IconView();

		arrowView.content = IconDropdownArrow;
		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-dropdown-menu-list__nested-menu__button__arrow'
			}
		} );

		return arrowView;
	}
}
