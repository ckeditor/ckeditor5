/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUpload from './imageupload';
import ImageInsertUI from './imageinsert/imageinsertui';

/**
 * The image insert plugin.
 *
 * For a detailed overview, check the {@glink features/image-upload/image-upload Image upload feature}
 * and {@glink features/image#inserting-images-via-source-url Insert images via source URL} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins
 * to enable image uploading or inserting via implemented integrations:
 *
 * * {@link module:image/imageupload~ImageUpload}
 * * {@link module:image/imageinsert/imageinsertui~ImageInsertUI},
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInsert extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageInsert';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUpload, ImageInsertUI ];
	}
}

/**
 * Image insert panel view configuration.
 * **NOTE:** Currently the panel settings are configurable through the `image.upload` property.
 *
 * @protected
 * @member {module:image/imageupload~ImageUploadPanelConfig} module:image/imageupload~ImageUploadConfig#panel
 */

/**
 * The configuration of the image insert dropdown panel view. Used by the image insert feature in the `@ckeditor/ckeditor5-image` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				image: {
 * 					upload: {
 * 						panel: ... // panel settings for "imageInsert" view goes here
 * 					}
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @protected
 * @interface module:image/imageupload~ImageUploadPanelConfig
 */

/**
 * The list of {@link module:image/imageinsert~ImageInsert} integrations.
 *
 * The option accepts string tokens.
 * * for predefined integrations, we have two special strings: `insertImageViaUrl` and `openCKFinder`.
 * The former adds the **Insert image via URL** feature, while the latter adds the built-in **CKFinder** integration.
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
