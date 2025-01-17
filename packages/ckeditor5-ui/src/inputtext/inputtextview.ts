/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/inputtext/inputtextview
 */

import InputView from '../input/inputview.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The text input view class.
 */
export default class InputTextView extends InputView {
	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.extendTemplate( {
			attributes: {
				type: 'text',
				class: [
					'ck-input-text'
				]
			}
		} );
	}
}
