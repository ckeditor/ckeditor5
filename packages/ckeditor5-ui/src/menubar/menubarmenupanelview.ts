/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { type Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../focuscycler.js';
import type ViewCollection from '../viewcollection.js';
import View from '../view.js';

export default class MenuBarMenuPanelView extends View implements FocusableView {
	public readonly children: ViewCollection<FocusableView>;
	declare public isVisible: boolean;
	declare public position: MenuBarMenuPanelPosition;

	/**
	 * @inheritDoc
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
					bind.to( 'position', value => `ck-menu-bar__menu__panel_${ value }` ),
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

export type MenuBarMenuPanelPosition = 'se' | 'sw' | 'ne' | 'nw' | 'w' | 'e';
