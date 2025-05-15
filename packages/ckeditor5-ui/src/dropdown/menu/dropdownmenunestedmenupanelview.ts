/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/menu/dropdownmenunestedmenupanelview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../../focuscycler.js';

import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';

import '../../../theme/components/dropdown/menu/dropdownmenupanel.css';

/**
 * Represents the view for the dropdown menu panel.
 */
export default class DropdownMenuNestedMenuPanelView extends BalloonPanelView implements FocusableView {
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
					'ck-reset',
					'ck-dropdown-menu__nested-menu__panel'
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
 * The names of the positions of the {@link module:ui/dropdown/menu/dropdownmenunestedmenupanelview~DropdownMenuNestedMenuPanelView}.
 *
 * They are reflected as CSS class suffixes on the panel view element.
 */
export type DropdownMenuNestedMenuPanelPosition = 'es' | 'ws' | 'en' | 'wn' | 'w' | 'e';
