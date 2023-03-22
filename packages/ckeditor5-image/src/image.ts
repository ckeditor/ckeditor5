/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageBlock from './imageblock';
import ImageInline from './imageinline';

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
	public static get pluginName(): 'Image' {
		return 'Image';
	}
}
