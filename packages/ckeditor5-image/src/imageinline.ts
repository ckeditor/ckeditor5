/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinline
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import ImageTextAlternative from './imagetextalternative';
import ImageInlineEditing from './image/imageinlineediting';

import '../theme/image.css';

/**
 * The image inline plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/image/imageinlineediting~ImageInlineEditing},
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 */
export default class ImageInline extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageInlineEditing, Widget, ImageTextAlternative ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageInline' {
		return 'ImageInline';
	}
}
