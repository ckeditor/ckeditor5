/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageTextAlternativeEditing from './imagetextalternative/imagetextalternativeediting';
import ImageTextAlternativeUI from './imagetextalternative/imagetextalternativeui';

/**
 * The image text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/image#image-styles image styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:image/imagetextalternative/imagetextalternativeediting~ImageTextAlternativeEditing}
 * and {@link module:image/imagetextalternative/imagetextalternativeui~ImageTextAlternativeUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageTextAlternative extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageTextAlternativeEditing, ImageTextAlternativeUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageTextAlternative';
	}
}
