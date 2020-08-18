/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUploadUI from './imageupload/imageuploadui';
import ImageUploadProgress from './imageupload/imageuploadprogress';
import ImageUploadEditing from './imageupload/imageuploadediting';

/**
 * The image upload plugin.
 *
 * For a detailed overview, check the {@glink features/image-upload/image-upload image upload feature} documentation.
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
 * Image upload configuration.
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
 * of the image MIME type. E.g. for the `image/jpeg` MIME type, add `'jpeg'` to your image upload configuration.
 *
 * **Note:** This setting only restricts some image types to be selected and uploaded through the CKEditor UI and commands. Image type
 * recognition and filtering should also be implemented on the server which accepts image uploads.
 *
 * @member {Array.<String>} module:image/imageupload~ImageUploadConfig#types
 * @default [ 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff' ]
 */

/**
 * Image upload panel view configuration.
 *
 * @member {module:image/imageupload~ImageUploadPanelConfig} module:image/imageupload~ImageUploadConfig#panel
 */

/**
 * The configuration of the image upload dropdown panel view. Used by the image upload feature in the `@ckeditor/ckeditor5-image` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				image: {
 * 					upload: {
 * 						panel: ... // panel settings goes here
 * 					}
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:image/imageupload~ImageUploadPanelConfig
 */

/**
 * The list of {@link module:image/imageupload~ImageUpload} integrations.
 *
 * The option accepts string tokens.
 * * for predefined integrations, we have two special strings: `insertImageViaUrl` and `openCKFinder`.
 * The former adds **Insert image via URL** feature, while the latter adds built-in **CKFinder** integration.
 * * for custom integrations, each string should be a name of the already registered component.
 * If you have a plugin `PluginX` that registers `pluginXButton` component, then the integration token
 * in that case should be `pluginXButton`.
 *
 *		// Add `insertImageViaUrl`, `openCKFinder` and custom `pluginXButton` integrations.
 *		const imageUploadConfig = {
 *			upload: {
 *				panel: {
 *					items: [
 *						'insertImageViaUrl',
 *						'openCKFinder',
 *						'pluginXButton'
 *					]
 *				}
 *			}
 *		};
 *
 * @member {Array.<String>} module:image/imageupload~ImageUploadPanelConfig#items
 * @default [ 'insertImageViaUrl' ]
 */
