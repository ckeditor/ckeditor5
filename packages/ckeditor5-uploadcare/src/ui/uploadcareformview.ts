/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/ui/uploadcareformview
 */

import { type Locale, FocusTracker } from 'ckeditor5/src/utils.js';
import { View } from 'ckeditor5/src/ui.js';

/**
 * A class representing the form view of the Uploadcare feature.
 */
export default class UploadcareFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-reset_all-excluded',
					'ck-uploadcare-form'
				],

				tabindex: '-1'
			},
			children: [
				{
					tag: 'uc-file-uploader-inline',
					attributes: {
						class: [ 'uc-light', 'ck-uploadcare-theme' ],
						'ctx-name': 'uploader'
					}
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.element!.focus();
	}
}
