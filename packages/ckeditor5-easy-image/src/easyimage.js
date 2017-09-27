/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module easy-image/easyimage
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CloudServicesUploadAdapter from './cloudservicesuploadadapter';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-upload/src/imageupload';

export default class EasyImage extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [
			CloudServicesUploadAdapter,
			Image,
			ImageUpload
		];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'EasyImage';
	}
}
