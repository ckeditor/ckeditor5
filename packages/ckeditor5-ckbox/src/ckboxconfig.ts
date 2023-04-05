/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboxconfig
 */

import type { TokenUrl } from '@ckeditor/ckeditor5-cloud-services';

/**
 * The configuration of the {@link module:ckbox/ckbox~CKBox CKBox feature}.
 *
 * The minimal configuration for the CKBox feature requires providing the
 * {@link module:ckbox/ckboxconfig~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`}:
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		ckbox: {
 * 			tokenUrl: 'https://example.com/cs-token-endpoint'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * Hovewer, you can also adjust the feature to fit your needs:
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		ckbox: {
 * 			defaultUploadCategories: {
 * 				Bitmaps: [ 'bmp' ],
 * 				Pictures: [ 'jpg', 'jpeg' ],
 * 				Scans: [ 'png', 'tiff' ]
 * 			},
 * 			ignoreDataId: true,
 * 			serviceOrigin: 'https://example.com/',
 * 			assetsOrigin: 'https://example.cloud/',
 * 			tokenUrl: 'https://example.com/cs-token-endpoint'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface CKBoxConfig {

	/**
	 * The authentication token URL for CKBox feature.
	 *
	 * Defaults to {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`}
	 */
	tokenUrl?: TokenUrl;

	/**
	 * The theme for CKBox dialog.
	 */
	theme?: string;

	/**
	 * Defines the categories to which the uploaded images will be assigned.
	 * If configured, it overrides the category mappings defined on the cloud service.
	 * The value of this option should be an object, where the keys define categories and their values are the types of images
	 * that will be uploaded to these categories. The categories might be referenced by their name or ID.
	 *
	 * Example:
	 *
	 * ```ts
	 * const ckboxConfig = {
	 * 	defaultUploadCategories: {
	 * 		Bitmaps: [ 'bmp' ],
	 * 		Pictures: [ 'jpg', 'jpeg' ],
	 * 		Scans: [ 'png', 'tiff' ],
	 * 		// The category below is referenced by its ID.
	 * 		'fdf2a647-b67f-4a6c-b692-5ba1dc1ed87b': [ 'gif' ]
	 * 	}
	 * };
	 * ```
	 *
	 * @default null
	 */
	defaultUploadCategories?: Record<string, Array<string>> | null;

	/**
	 * Inserts the unique asset ID as the `data-ckbox-resource-id` attribute. To disable this behavior, set it to `true`.
	 *
	 * @default false
	 */
	ignoreDataId?: boolean;

	/**
	 * Configures the base URL of the API service. Required only in on-premises installations.
	 *
	 * @default 'https://api.ckbox.io'
	 */
	serviceOrigin?: string;

	/**
	 * Configures the base URL for assets inserted into the editor. Required only in on-premises installations.
	 *
	 * @default 'https://ckbox.cloud'
	 */
	assetsOrigin?: string;

	/**
	 * Configures the language for the CKBox dialog.
	 *
	 * Defaults to {@link module:utils/locale~Locale#uiLanguage `Locale#uiLanguage`}
	 */
	language?: string;
}

/**
 * Asset definition.
 *
 * The definition contains the unique `id`, asset `type` and an `attributes` definition.
 */
export type CKBoxAssetDefinition = CKBoxAssetImageDefinition | CKBoxAssetLinkDefinition;

/**
 * Image asset definition.
 *
 * The definition contains the unique `id`, asset `type` and an `attributes` definition.
 */
export interface CKBoxAssetImageDefinition {

	/**
	 * An unique asset id.
	 */
	id: string;

	/**
	 * Asset type.
	 */
	type: 'image';

	/**
	 * Asset attributes.
	 */
	attributes: CKBoxAssetImageAttributesDefinition;
}

/**
 * Link asset definition.
 *
 * The definition contains the unique `id`, asset `type` and an `attributes` definition.
 */
export interface CKBoxAssetLinkDefinition {

	/**
	 * An unique asset id.
	 */
	id: string;

	/**
	 * Asset type.
	 */
	type: 'link';

	/**
	 * Asset attributes.
	 */
	attributes: CKBoxAssetLinkAttributesDefinition;
}

/**
 * Asset attributes definition for an image.
 *
 * The definition contains the `imageFallbackUrl`, an `imageSources` array with one image source definition object and the
 * `imageTextAlternative`.
 *
 * ```ts
 * {
 * 	imageFallbackUrl: 'https://example.com/assets/asset-id/images/1000.png',
 * 	imageSources: [
 * 		{
 * 			sizes: '1000px',
 * 			srcset:
 * 				'https://example.com/assets/asset-id/images/100.webp 100w,' +
 * 				'https://example.com/assets/asset-id/images/200.webp 200w,' +
 * 				'https://example.com/assets/asset-id/images/300.webp 300w,' +
 * 				'https://example.com/assets/asset-id/images/400.webp 400w,' +
 * 				'https://example.com/assets/asset-id/images/500.webp 500w,' +
 * 				'https://example.com/assets/asset-id/images/600.webp 600w,' +
 * 				'https://example.com/assets/asset-id/images/700.webp 700w,' +
 * 				'https://example.com/assets/asset-id/images/800.webp 800w,' +
 * 				'https://example.com/assets/asset-id/images/900.webp 900w,' +
 * 				'https://example.com/assets/asset-id/images/1000.webp 1000w',
 * 			type: 'image/webp'
 * 		}
 * 	],
 * 	imageTextAlternative: 'An alternative text for the image'
 * }
 * ```
 */
export interface CKBoxAssetImageAttributesDefinition {

	/**
	 * A fallback URL for browsers that do not support the "webp" format.
	 */
	imageFallbackUrl: string;

	/**
	 * An array containing one image source definition object.
	 */
	imageSources: Array<{
		srcset: string;
		sizes: string;
		type: string;
	}>;

	/**
	 * An alternative text for an image.
	 */
	imageTextAlternative: string;
}

/**
 * Asset attributes definition for a link.
 *
 * The definition contains the `linkName` and `linkHref` strings.
 *
 * ```ts
 * {
 * 	linkName: 'File name',
 * 	linkHref: 'https://example.com/assets/asset-id/file.pdf'
 * }
 * ```
 */
export interface CKBoxAssetLinkAttributesDefinition {

	/**
	 * A link name.
	 */
	linkName: string;

	/**
	 * An URL for the asset.
	 */
	linkHref: string;
}

/**
 * Raw asset definition that is received from the CKBox feature.
 */
export interface CKBoxRawAssetDefinition {

	/**
	 * A raw asset data definition.
	 */
	data: CKBoxRawAssetDataDefinition;

	/**
	 * An asset origin URL.
	 */
	origin: string;
}

/**
 * Part of raw asset data that is received from the CKBox feature.
 */
export interface CKBoxRawAssetDataDefinition {

	/**
	 *  An unique asset id.
	 */
	id: string;

	/**
	 *  An asset extension.
	 */
	extension: string;

	/**
	 * An asset name.
	 */
	name: string;

	/**
	 *  A raw asset metadata definition.
	 */
	metadata?: CKBoxRawAssetMetadataDefinition;
}

/**
 * Part of raw asset data that is received from the CKBox feature. Properties are set only if the chosen asset is an image.
 */
export interface CKBoxRawAssetMetadataDefinition {

	/**
	 * Image description.
	 */
	description?: string;

	/**
	 * Image width.
	 */
	width?: number;

	/**
	 * Image height.
	 */
	height?: number;
}
