/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckbox/ckbox
 */

import { Plugin } from 'ckeditor5/src/core.js';

import CKBoxUI from './ckboxui.js';
import CKBoxEditing from './ckboxediting.js';

/**
 * The CKBox feature, a bridge between the CKEditor 5 WYSIWYG editor and the CKBox file manager and uploader.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:ckbox/ckboxediting~CKBoxEditing},
 * * {@link module:ckbox/ckboxui~CKBoxUI},
 *
 * See the {@glink features/file-management/ckbox CKBox integration} guide to learn how to configure and use this feature.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload} guide to learn about other ways to upload
 * images into CKEditor 5.
 */
export default class CKBox extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBox' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ CKBoxEditing, CKBoxUI ] as const;
	}
}
