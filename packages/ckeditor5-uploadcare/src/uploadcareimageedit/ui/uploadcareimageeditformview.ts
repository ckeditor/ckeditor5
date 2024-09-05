/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareimageedit/ui/uploadcareimageeditformview
 */

import { type Locale } from 'ckeditor5/src/utils.js';
import { Template, View } from 'ckeditor5/src/ui.js';

import '../../../theme/uploadcare-form.css';
import type UploadcareImageEditCommand from '../uploadcareimageeditcommand.js';

/**
 * A class representing the form view of the Uploadcare image edit feature.
 */
export default class UploadcareImageEditFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, parentCommand: UploadcareImageEditCommand ) {
		super( locale );

		const bind = Template.bind( parentCommand, parentCommand );

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
					text: bind.to( 'imageStatus', status => status )
				},
				{
					text: bind.to( 'imageUploadProgress', progress => ` ${ progress }%` )
				},
				{
					tag: 'uc-cloud-image-editor',
					attributes: {
						class: [ 'uc-light', 'ck-uploadcare-theme' ],
						'ctx-name': 'image-edit',
						'cdn-url': bind.to( 'imageSrc', src => src )
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
