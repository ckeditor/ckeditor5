/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/imageupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUploadUI from './imageuploadui';
import ImageUploadProgress from './imageuploadprogress';
import ImageUploadEditing from './imageuploadediting';

/**
 * Image upload plugin.
 *
 * This plugin do not do anything directly, but loads set of specific plugins to enable image uploading:
 * * {@link module:upload/imageuploadediting~ImageUploadEditing},
 * * {@link module:upload/imageuploadui~ImageUploadUI},
 * * {@link module:upload/imageuploadprogress~ImageUploadProgress}.
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
