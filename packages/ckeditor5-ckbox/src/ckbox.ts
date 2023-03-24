/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckbox
 */

import { Plugin } from 'ckeditor5/src/core';

import CKBoxUI from './ckboxui';
import CKBoxEditing from './ckboxediting';

/**
 * The CKBox feature, a bridge between the CKEditor 5 WYSIWYG editor and the CKBox file manager and uploader.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:ckbox/ckboxediting~CKBoxEditing},
 * * {@link module:ckbox/ckboxui~CKBoxUI},
 *
 * See the {@glink features/images/image-upload/ckbox CKBox integration} guide to learn how to configure and use this feature.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload} guide to learn about other ways to upload
 * images into CKEditor 5.
 */
export default class CKBox extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CKBox' {
		return 'CKBox';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ CKBoxEditing, CKBoxUI ] as const;
	}
}
