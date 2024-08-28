/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module uploadcare/uploadcareimageedit
 */

import { Plugin } from 'ckeditor5/src/core.js';

import UploadcareImageEditEditing from './uploadcareimageedit/uploadcareimageeditediting.js';
import UploadcareImageEditUI from './uploadcareimageedit/uploadcareimageeditui.js';

/**
 * The Uploadcare image edit feature.
 */
export default class UploadcareImageEdit extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UploadcareImageEdit' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ UploadcareImageEditEditing, UploadcareImageEditUI ] as const;
	}
}
