/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageUpload from './imageupload';
import ImageInsertViaUrl from './imageinsertviaurl';
import ImageInsertUI from './imageinsert/imageinsertui';

/**
 * The image insert plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/image-upload/images-inserting#inserting-images-via-source-url Insert images via source URL} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins
 * to enable image uploading or inserting via implemented integrations:
 *
 * * {@link module:image/imageupload~ImageUpload}
 * * {@link module:image/imageinsert/imageinsertui~ImageInsertUI}
 */
export default class ImageInsert extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageInsert' {
		return 'ImageInsert';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUpload, ImageInsertViaUrl, ImageInsertUI ] as const;
	}
}
