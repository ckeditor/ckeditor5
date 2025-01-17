/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dialog/dialogcontentview
 */

import View from '../view.js';
import type ViewCollection from '../viewcollection.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * A dialog content view class.
 */
export default class DialogContentView extends View {
	/**
	 * A collection of content items.
	 */
	public readonly children: ViewCollection;

	/**
	 * @inheritDoc
	 */
	constructor(
		locale: Locale | undefined
	) {
		super( locale );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-dialog__content' ]
			},
			children: this.children
		} );
	}

	/**
	 * Removes all the child views.
	 */
	public reset(): void {
		while ( this.children.length ) {
			this.children.remove( 0 );
		}
	}
}
