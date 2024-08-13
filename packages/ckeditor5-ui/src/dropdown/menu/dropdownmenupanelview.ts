/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenupanelview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../../focuscycler.js';

import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';

import '../../../theme/components/dropdown/menu/dropdownmenupanel.css';

/**
 * Represents the view for the dropdown menu panel.
 */
export default class DropdownMenuPanelView extends BalloonPanelView implements FocusableView {
	/**
	 * Creates an instance of the menu panel view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( {
			isVisible: false,
			position: 'se',
			class: null,
			top: 0,
			left: 0
		} );

		this.extendTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-dropdown-menu__menu__panel',
					bind.to( 'class' ),
					bind.to( 'position', value => `ck-dropdown-menu__menu__panel_position_${ value }` ),
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				],
				tabindex: '-1'
			},

			on: {
				// Drag and drop in the panel should not break the selection in the editor.
				// https://github.com/ckeditor/ckeditor5-ui/issues/228
				selectstart: bind.to( evt => {
					if ( ( evt.target as HTMLElement ).tagName.toLocaleLowerCase() === 'input' ) {
						return;
					}

					evt.preventDefault();
				} )
			}
		} );
	}

	/**
	 * Focuses the first child of the panel (default) or the last one if the `direction` is `-1`.
	 *
	 * @param direction The direction to focus. Default is `1`.
	 */
	public focus( direction: -1 | 1 = 1 ): void {
		const { content } = this;

		if ( content.length ) {
			if ( direction === 1 ) {
				( content.first as FocusableView ).focus();
			} else {
				( content.last as FocusableView ).focus();
			}
		}
	}
}

/**
 * The names of the positions of the {@link module:ui/dropdown/menu/dropdownmenupanelview~DropdownMenuPanelView}.
 *
 * They are reflected as CSS class suffixes on the panel view element.
 */
export type DropdownMenuPanelPosition = 'es' | 'ws' | 'en' | 'wn' | 'w' | 'e';
