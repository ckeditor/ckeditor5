/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageTextAlternativeEditing from './imagetextalternative/imagetextalternativeediting';
import ImageTextAlternativeUI from './imagetextalternative/imagetextalternativeui';

/**
 * The image text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-styles image styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:image/imagetextalternative/imagetextalternativeediting~ImageTextAlternativeEditing}
 * and {@link module:image/imagetextalternative/imagetextalternativeui~ImageTextAlternativeUI} plugins.
 */
export default class ImageTextAlternative extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageTextAlternativeEditing, ImageTextAlternativeUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageTextAlternative' {
		return 'ImageTextAlternative';
	}
}
