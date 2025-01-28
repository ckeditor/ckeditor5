/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imagecaption
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ImageCaptionEditing from './imagecaption/imagecaptionediting.js';
import ImageCaptionUI from './imagecaption/imagecaptionui.js';

import '../theme/imagecaption.css';

/**
 * The image caption plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-captions image caption} documentation.
 */
export default class ImageCaption extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageCaptionEditing, ImageCaptionUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageCaption' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
