/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenupanelportalview
 */

import { toUnit, type Locale } from '@ckeditor/ckeditor5-utils';
import View from '../../view.js';
import type ViewCollection from '../../viewcollection.js';

import '../../../theme/components/dropdown/menu/dropdownmenuportal.css';

const toPx = /* #__PURE__ */ toUnit( 'px' );

export default class DropdownMenuPortalView extends View {
	/**
	 * The absolute top position of the portal in pixels.
	 *
	 * @observable
	 * @default 0
	 */
	declare public top: number;

	/**
	 * The absolute left position of the portal in pixels.
	 *
	 * @observable
	 * @default 0
	 */
	declare public left: number;

	/**
	 * The name of the position of the panel, relative to the parent.
	 *
	 * This property is reflected in the CSS class suffix set to {@link #element} that controls
	 * the position of the panel.
	 *
	 * @observable
	 * @default 'se'
	 */
	declare public position: DropdownMenuPortalPosition;

	/**
	 * Indicates whether the dropdown menu portal view is currently visible.
	 *
	 * @observable
	 * @default false
	 */
	declare public isVisible: boolean;

	/**
	 * A collection of child views in the form.
	 */
	public readonly children: ViewCollection;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.children = this.createCollection();
		this.set( {
			top: 0,
			left: 0,
			position: 'es',
			isVisible: false
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu__menu__portal',
					bind.to( 'position', value => `ck-dropdown-menu__menu__portal_position_${ value }` ),
					bind.if( 'isVisible', 'ck-hidden', value => !value ),
					'ck-ai-assistant-ui_theme' // fixme
				],
				style: {
					top: bind.to( 'top', toPx ),
					left: bind.to( 'left', toPx )
				},
				tabindex: '-1'
			},
			children: this.children
		} );
	}
}

/**
 * They are reflected as CSS class suffixes on the panel view element.
 */
export type DropdownMenuPortalPosition = 'se' | 'sw' | 'ne' | 'nw' | 'w' | 'e';
