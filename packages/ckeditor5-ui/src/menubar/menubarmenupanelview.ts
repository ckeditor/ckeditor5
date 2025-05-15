/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/menubar/menubarmenupanelview
 */

import { type Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../focuscycler.js';
import type ViewCollection from '../viewcollection.js';
import View from '../view.js';

import '../../theme/components/menubar/menubarmenupanel.css';

/**
 * A view representing a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView} of a menu.
 */
export default class MenuBarMenuPanelView extends View implements FocusableView {
	/**
	 * Collection of the child views in this panel.
	 */
	public readonly children: ViewCollection<FocusableView>;

	/**
	 * Controls whether the panel is visible.
	 *
	 * @observable
	 */
	declare public isVisible: boolean;

	/**
	 * The name of the position of the panel, relative to the parent.
	 *
	 * This property is reflected in the CSS class suffix set to {@link #element} that controls
	 * the position of the panel.
	 *
	 * @observable
	 * @default 'se'
	 */
	declare public position: MenuBarMenuPanelPosition;

	/**
	 * Creates an instance of the menu panel view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', false );
		this.set( 'position', 'se' );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-menu-bar__menu__panel',
					bind.to( 'position', value => `ck-menu-bar__menu__panel_position_${ value }` ),
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				],
				tabindex: '-1'
			},

			children: this.children,

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
	 */
	public focus( direction: -1 | 1 = 1 ): void {
		if ( this.children.length ) {
			if ( direction === 1 ) {
				this.children.first!.focus();
			} else {
				this.children.last!.focus();
			}
		}
	}
}

/**
 * The names of the positions of the {@link module:ui/menubar/menubarmenupanelview~MenuBarMenuPanelView}.
 *
 * They are reflected as CSS class suffixes on the panel view element.
 */
export type MenuBarMenuPanelPosition = 'se' | 'sw' | 'ne' | 'nw' | 'w' | 'ws' | 'e' | 'es';
