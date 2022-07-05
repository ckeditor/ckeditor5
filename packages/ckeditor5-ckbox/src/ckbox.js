/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKBox extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKBox';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CKBoxEditing, CKBoxUI ];
	}
}

/**
 * The configuration of the {@link module:ckbox/ckbox~CKBox CKBox feature}.
 *
 * Read more in {@link module:ckbox/ckbox~CKBoxConfig}.
 *
 * @member {module:ckbox/ckbox~CKBoxConfig} module:core/editor/editorconfig~EditorConfig#ckbox
 */

/**
 * The configuration of the {@link module:ckbox/ckbox~CKBox CKBox feature}.
 *
 * The minimal configuration for the CKBox feature requires providing the
 * {@link module:ckbox/ckbox~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`}:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				ckbox: {
 *					tokenUrl: 'https://example.com/cs-token-endpoint'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * Hovewer, you can also adjust the feature to fit your needs:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				ckbox: {
 *					defaultUploadCategories: {
 *						Bitmaps: [ 'bmp' ],
 *						Pictures: [ 'jpg', 'jpeg' ],
 *						Scans: [ 'png', 'tiff' ]
 *					},
 *					ignoreDataId: true,
 *					serviceOrigin: 'https://example.com/',
 *					assetsOrigin: 'https://example.cloud/',
 *					tokenUrl: 'https://example.com/cs-token-endpoint'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface CKBoxConfig
 */

/**
 * The authentication token URL for CKBox feature.
 *
 * Defaults to {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`}
 *
 * @member {String} module:ckbox/ckbox~CKBoxConfig#tokenUrl
 */

/**
 * Defines the categories to which the uploaded images will be assigned. If configured, it overrides the category mappings defined on the
 * cloud service. The value of this option should be an object, where the keys define categories and their values are the types of images
 * that will be uploaded to these categories. The categories might be referenced by their name or ID.
 *
 * Example:
 *
 *		const ckboxConfig = {
 *			defaultUploadCategories: {
 *				Bitmaps: [ 'bmp' ],
 *				Pictures: [ 'jpg', 'jpeg' ],
 *				Scans: [ 'png', 'tiff' ],
 *				// The category below is referenced by its ID.
 *				'fdf2a647-b67f-4a6c-b692-5ba1dc1ed87b': [ 'gif' ]
 *			}
 *		};
 *
 * @default null
 * @member {Object} [module:ckbox/ckbox~CKBoxConfig#defaultUploadCategories]
 */

/**
 * Inserts the unique asset ID as the `data-ckbox-resource-id` attribute. To disable this behavior, set it to `true`.
 *
 * @default false
 * @member {Boolean} [module:ckbox/ckbox~CKBoxConfig#ignoreDataId]
 */

/**
 * Configures the base URL of the API service. Required only in on-premises installations.
 *
 * @default 'https://api.ckbox.io'
 * @member {String} [module:ckbox/ckbox~CKBoxConfig#serviceOrigin]
 */

/**
 * Configures the base URL for assets inserted into the editor. Required only in on-premises installations.
 *
 * @default 'https://ckbox.cloud'
 * @member {String} [module:ckbox/ckbox~CKBoxConfig#assetsOrigin]
 */

/**
 * Configures the language for the CKBox dialog.
 *
 * Defaults to {@link module:utils/locale~Locale#uiLanguage `Locale#uiLanguage`}
 *
 * @member {String} [module:ckbox/ckbox~CKBoxConfig#language]
 */

/**
 * Asset definition.
 *
 * The definition contains the unique `id`, asset `type` and an `attributes` definition.
 *
 * @typedef {Object} module:ckbox/ckbox~CKBoxAssetDefinition
 *
 * @property {String} id An unique asset id.
 * @property {'image'|'link'} type Asset type.
 * @property {module:ckbox/ckbox~CKBoxAssetImageAttributesDefinition|
 * module:ckbox/ckbox~CKBoxAssetLinkAttributesDefinition} attributes Asset attributes.
 */

/**
 * Asset attributes definition for an image.
 *
 * The definition contains the `imageFallbackUrl`, an `imageSources` array with one image source definition object and the
 * `imageTextAlternative`.
 *
 *		{
 *			imageFallbackUrl: 'https://example.com/assets/asset-id/images/1000.png',
 *			imageSources: [
 *				{
 *					sizes: '1000px',
 *					srcset:
 *						'https://example.com/assets/asset-id/images/100.webp 100w,' +
 *						'https://example.com/assets/asset-id/images/200.webp 200w,' +
 *						'https://example.com/assets/asset-id/images/300.webp 300w,' +
 *						'https://example.com/assets/asset-id/images/400.webp 400w,' +
 *						'https://example.com/assets/asset-id/images/500.webp 500w,' +
 *						'https://example.com/assets/asset-id/images/600.webp 600w,' +
 *						'https://example.com/assets/asset-id/images/700.webp 700w,' +
 *						'https://example.com/assets/asset-id/images/800.webp 800w,' +
 *						'https://example.com/assets/asset-id/images/900.webp 900w,' +
 *						'https://example.com/assets/asset-id/images/1000.webp 1000w',
 *					type: 'image/webp'
 *				}
 *			],
 *			imageTextAlternative: 'An alternative text for the image'
 *		}
 *
 * @typedef {Object} module:ckbox/ckbox~CKBoxAssetImageAttributesDefinition
 *
 * @property {String} imageFallbackUrl A fallback URL for browsers that do not support the "webp" format.
 * @property {Array.<Object>} imageSources An array containing one image source definition object.
 * @property {String} imageTextAlternative An alternative text for an image.
 */

/**
 * Asset attributes definition for a link.
 *
 * The definition contains the `linkName` and `linkHref` strings.
 *
 *		{
 *			linkName: 'File name',
 *			linkHref: 'https://example.com/assets/asset-id/file.pdf'
 *		}
 *
 * @typedef {Object} module:ckbox/ckbox~CKBoxAssetLinkAttributesDefinition
 *
 * @property {String} linkName A link name.
 * @property {String} linkHref An URL for the asset.
 */

/**
 * Raw asset definition that is received from the CKBox feature.
 *
 * @typedef {Object} module:ckbox/ckbox~CKBoxRawAssetDefinition
 *
 * @property {module:ckbox/ckbox~CKBoxRawAssetDataDefinition} data A raw asset data definition.
 * @property {String} origin An asset origin URL.
 */

/**
 * Part of raw asset data that is received from the CKBox feature.
 *
 * @typedef {Object} module:ckbox/ckbox~CKBoxRawAssetDataDefinition
 *
 * @property {String} id An unique asset id.
 * @property {String} extension An asset extension.
 * @property {String} name An asset name.
 * @property {module:ckbox/ckbox~CKBoxRawAssetMetadataDefinition} metadata A raw asset metadata definition.
 */

/**
 * Part of raw asset data that is received from the CKBox feature. Properties are set only if the chosen asset is an image.
 *
 * @typedef {Object} module:ckbox/ckbox~CKBoxRawAssetMetadataDefinition
 *
 * @property {String} [description] Image description.
 * @property {Number} [width] Image width.
 * @property {Number} [height] Image height.
 */
