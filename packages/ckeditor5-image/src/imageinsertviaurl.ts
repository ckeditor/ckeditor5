/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageinsertviaurl
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ImageInsertUI from './imageinsert/imageinsertui.js';
import ImageInsertViaUrlUI from './imageinsert/imageinsertviaurlui.js';

/**
 * The image insert via URL plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-inserting
 * Insert images via source URL} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins
 * to enable image inserting via implemented integrations:
 *
 * * {@link module:image/imageinsert/imageinsertui~ImageInsertUI},
 */
export default class ImageInsertViaUrl extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageInsertViaUrl' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageInsertViaUrlUI, ImageInsertUI ] as const;
	}
}
