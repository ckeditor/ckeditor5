/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imageupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUploadUI from './imageupload/imageuploadui';
import ImageUploadProgress from './imageupload/imageuploadprogress';
import ImageUploadEditing from './imageupload/imageuploadediting';

/**
 * Image upload plugin.
 *
 * This plugin do not do anything directly, but loads set of specific plugins to enable image uploading:
 * * {@link module:image/imageupload/imageuploadediting~ImageUploadEditing},
 * * {@link module:image/imageupload/imageuploadui~ImageUploadUI},
 * * {@link module:image/imageupload/imageuploadprogress~ImageUploadProgress}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUpload extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageUpload';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUploadEditing, ImageUploadUI, ImageUploadProgress ];
	}
}
