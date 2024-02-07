/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import type ViewCollection from '../viewcollection.js';
import View from '../view.js';

export default class ButtonGroupView extends View {
	public readonly children: ViewCollection;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.children = this.createCollection();
		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-button-group'
				]
			},

			children: this.children
		} );
	}
}
