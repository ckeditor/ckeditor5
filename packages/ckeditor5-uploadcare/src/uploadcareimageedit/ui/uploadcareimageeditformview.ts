/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareimageedit/ui/uploadcareimageeditformview
 */

import { type Locale } from 'ckeditor5/src/utils.js';
import { View } from 'ckeditor5/src/ui.js';

import '../../../theme/uploadcare-form.css';

/**
 * A class representing the form view of the Uploadcare image edit feature.
 */
export default class UploadcareImageEditFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, cdnUrl: string ) {
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
					tag: 'uc-cloud-image-editor',
					attributes: {
						class: [ 'uc-light', 'ck-uploadcare-theme' ],
						'ctx-name': 'image-edit',
						'cdn-url': cdnUrl
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
