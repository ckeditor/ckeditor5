/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ImageBlock from './imageblock.js';
import ImageInline from './imageinline.js';

import '../theme/image.css';

/**
 * The image plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-overview image feature} documentation.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/imageblock~ImageBlock},
 * * {@link module:image/imageinline~ImageInline},
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 */
export default class Image extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageBlock, ImageInline ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Image' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
