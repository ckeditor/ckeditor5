/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcare
 * @publicApi
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import UploadcareUI from './uploadcareui.js';
import UploadcareEditing from './uploadcareediting.js';

import * as UC from '@uploadcare/file-uploader';

/**
 * The Uploadcare feature, a bridge between the CKEditor 5 WYSIWYG editor and the Uploadcare file uploader.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload} guide to learn about other ways to upload
 * images into CKEditor 5.
 */
export default class Uploadcare extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ UploadcareEditing, UploadcareUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Uploadcare' as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'uploadcare.sourceList', [ 'local', 'url' ] );

		UC.defineComponents( UC );
	}
}
