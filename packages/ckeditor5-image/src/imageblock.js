/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageblock
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import ImageTextAlternative from './imagetextalternative';
import ImageBlockEditing from './image/imageblockediting';

import '../theme/image.css';

/**
 * The image block plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/image/imageblockediting~ImageBlockEditing},
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageBlockEditing, Widget, ImageTextAlternative ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageBlock';
	}
}

