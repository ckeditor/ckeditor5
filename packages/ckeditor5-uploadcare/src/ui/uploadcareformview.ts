/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/ui/uploadcareformview
 */

import { global, type Locale } from 'ckeditor5/src/utils.js';
import { View } from 'ckeditor5/src/ui.js';

import * as LR from '@uploadcare/blocks';

/**
 * A class representing the form view of the Uploadcare feature.
 */
export default class UploadcareFormView extends View {
	private _config!: HTMLElement;
	private _ctx!: LR.UploaderBlock;
	private _type: string;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, type: string ) {
		super( locale );

		LR.registerBlocks( LR );

		this._type = type;

		this._config = global.document.createElement( 'lr-config' );
		this._config.setAttribute( 'pubkey', '532fdaa30fa803cef431' );
		this._config.setAttribute( 'ctx-name', 'uploader' );
		this._config.setAttribute( 'source-list', this._type );

		this._ctx = global.document.createElement( 'lr-upload-ctx-provider' ) as LR.UploaderBlock;
		this._ctx.setAttribute( 'ctx-name', 'uploader' );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-reset_all-excluded',
					'ck-uploadcare-form'
				]
			},
			children: [
				this._config,
				{
					tag: 'lr-file-uploader-inline',
					attributes: {
						'ctx-name': 'uploader'
					}
				},
				this._ctx
			]
		} );
	}

	public init(): void {
		this._ctx.initFlow();
	}

	public done(): void {
		this._ctx.doneFlow();
	}
}
