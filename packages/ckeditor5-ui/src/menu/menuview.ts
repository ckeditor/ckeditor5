/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menu/menuview
 */

import View from '../view.js';
import type { FocusableView } from '../focuscycler.js';
import type ViewCollection from '../viewcollection.js';
import { type Locale } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/menu/menu.css';

export default class MenuView extends View implements FocusableView {
	declare public position: string | null;
	declare public isVisible: boolean;
	public readonly children: ViewCollection<FocusableView>;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', false );
		this.set( 'position', null );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-menu',
					bind.to( 'position', value => value ? `ck-menu_position_${ value }` : null ),
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

	public focus( direction: 1 | -1 = 1 ): void {
		if ( this.children.length ) {
			this.children[ direction ? 'first' : 'last' ]!.focus();
		}
	}
}
