/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module easy-image/easyimage
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CloudServicesUploadAdapter from './cloudservicesuploadadapter';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

/**
 * The Easy Image feature, which makes the image upload in CKEditor 5 possible with virtually zero
 * server setup. A part of the [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/)
 * family.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:image/image~Image},
 * * {@link module:image/imageupload~ImageUpload},
 * * {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter}.
 *
 * See the {@glink features/image-upload/easy-image "Easy Image integration" guide} to learn how to configure
 * and use this feature.
 *
 * Check out the {@glink features/image-upload/image-upload comprehensive "Image upload" guide} to learn about
 * other ways to upload images into CKEditor 5.
 *
 * **Note**: After enabling the Easy Image plugin you need to configure the
 * [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/)
 * integration through {@link module:cloud-services/cloudservices~CloudServicesConfig `config.cloudServices`}.
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
