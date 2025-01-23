/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/menubar/menubarmenubuttonview
 */

import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import { registerIcon, type Locale } from '@ckeditor/ckeditor5-utils';
import CssIconView from '../icon/cssiconview.js';
import ListItemButtonView from '../button/listitembuttonview.js';

import '../../theme/components/menubar/menubarmenubutton.css';

const dropdownArrowIcon = /* #__PURE__ */ registerIcon( '--ck-icon-dropdown-arrow', IconDropdownArrow );

/**
 * A menu {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#buttonView} class. Buttons like this one
 * open both top-level bar menus as well as sub-menus.
 */
export default class MenuBarMenuButtonView extends ListItemButtonView {
	/**
	 * An icon that displays an arrow to indicate a direction of the menu.
	 */
	public readonly arrowView: CssIconView;

	/**
	 * Creates an instance of the menu bar button view.
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
	 * Creates the {@link #arrowView} instance.
	 */
	private _createArrowView() {
		const arrowView = new CssIconView();

		arrowView.set( {
			variable: dropdownArrowIcon,
			width: 10,
			height: 10
		} );

		arrowView.extendTemplate( {
			attributes: {
				class: 'ck-menu-bar__menu__button__arrow'
			}
		} );

		return arrowView;
	}
}
