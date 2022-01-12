/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageUploadUI from './imageupload/imageuploadui';
import ImageUploadProgress from './imageupload/imageuploadprogress';
import ImageUploadEditing from './imageupload/imageuploadediting';

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

/**
 * The image upload configuration.
 *
 * @member {module:image/imageupload~ImageUploadConfig} module:image/image~ImageConfig#upload
 */

/**
 * The configuration of the image upload feature. Used by the image upload feature in the `@ckeditor/ckeditor5-image` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				image: {
 * 					upload:  ... // Image upload feature options.
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:image/imageupload~ImageUploadConfig
 */

/**
 * The list of accepted image types.
 *
 * The accepted types of images can be customized to allow only certain types of images:
 *
 *		// Allow only JPEG and PNG images:
 *		const imageUploadConfig = {
 *			types: [ 'png', 'jpeg' ]
 *		};
 *
 * The type string should match [one of the sub-types](https://www.iana.org/assignments/media-types/media-types.xhtml#image)
 * of the image MIME type. For example, for the `image/jpeg` MIME type, add `'jpeg'` to your image upload configuration.
 *
 * **Note:** This setting only restricts some image types to be selected and uploaded through the CKEditor UI and commands. Image type
 * recognition and filtering should also be implemented on the server which accepts image uploads.
 *
 * @member {Array.<String>} module:image/imageupload~ImageUploadConfig#types
 * @default [ 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff' ]
 */
