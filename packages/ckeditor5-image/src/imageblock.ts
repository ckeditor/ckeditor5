/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageblock
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Widget } from 'ckeditor5/src/widget.js';

import ImageTextAlternative from './imagetextalternative.js';
import ImageBlockEditing from './image/imageblockediting.js';
import ImageInsertUI from './imageinsert/imageinsertui.js';

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
 */
export default class ImageBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageBlockEditing, Widget, ImageTextAlternative, ImageInsertUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageBlock' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
