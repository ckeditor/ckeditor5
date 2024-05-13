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

/**
 * Uploadcare plugin that allows you to use the Uploadcare features.
 */
export default class Uploadcare extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ UploadcareUI ] as const;
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

		// TODO: Config operations.
		console.log( 'Uploadcare' );
	}
}
