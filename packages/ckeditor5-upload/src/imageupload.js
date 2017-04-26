/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/imageupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUploadButton from './imageuploadbutton';
import ImageUploadProgress from './imageuploadprogress';

/**
 * Image upload plugin.
 * This plugin do not do anything directly, but loads set of specific plugins to enable image uploading:
 * * {@link module:upload/imageuploadbutton~ImageUploadButton},
 * * {@link module:upload/imageuploadprogress~ImageUploadProgress}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUpload extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUploadButton, ImageUploadProgress ];
	}
}
