/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageresize
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ImageResizeButtons from './imageresize/imageresizebuttons.js';
import ImageResizeEditing from './imageresize/imageresizeediting.js';
import ImageResizeHandles from './imageresize/imageresizehandles.js';
import ImageCustomResizeUI from './imageresize/imagecustomresizeui.js';

import '../theme/imageresize.css';

/**
 * The image resize plugin.
 *
 * It adds a possibility to resize each image using handles.
 */
export default class ImageResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageResizeEditing, ImageResizeHandles, ImageCustomResizeUI, ImageResizeButtons ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageResize' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
