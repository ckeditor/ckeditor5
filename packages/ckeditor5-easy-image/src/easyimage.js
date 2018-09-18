/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module easy-image/easyimage
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CloudServicesUploadAdapter from './cloudservicesuploadadapter';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

/**
 * The Easy Image feature.
 *
 * For a detailed overview, check the {@glink features/image-upload Image upload feature documentation}
 * and the {@glink api/easy-image package page}.
 *
 * After enabling the Easy Image plugin you need to configure the [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/)
 * integration through {@link module:cloud-services/cloudservices~CloudServicesConfig `config.cloudServices`}.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:image/image~Image},
 * * {@link module:image/imageupload~ImageUpload},
 * * {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter}.
 *
 * @extends module:core/plugin~Plugin
 */
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
