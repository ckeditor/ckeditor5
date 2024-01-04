/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/inputurl/inputurlview
 */

import InputView from '../input/inputview.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The URL input view class.
 */
export default class InputUrlView extends InputView {
	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.extendTemplate( {
			attributes: {
				type: 'url',
				class: [
					'ck-input-url'
				]
			}
		} );
	}
}
