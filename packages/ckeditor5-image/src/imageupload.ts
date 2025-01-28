/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageupload
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ImageUploadUI from './imageupload/imageuploadui.js';
import ImageUploadProgress from './imageupload/imageuploadprogress.js';
import ImageUploadEditing from './imageupload/imageuploadediting.js';

/**
 * The image upload plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload image upload feature} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins to enable image uploading:
 *
 * * {@link module:image/imageupload/imageuploadediting~ImageUploadEditing},
 * * {@link module:image/imageupload/imageuploadui~ImageUploadUI},
 * * {@link module:image/imageupload/imageuploadprogress~ImageUploadProgress}.
 */
export default class ImageUpload extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageUpload' as const;
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
		return [ ImageUploadEditing, ImageUploadUI, ImageUploadProgress ] as const;
	}
}
