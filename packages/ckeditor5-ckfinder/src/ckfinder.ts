/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckfinder/ckfinder
 */

import { Plugin } from 'ckeditor5/src/core';

import CKFinderUI from './ckfinderui';
import CKFinderEditing from './ckfinderediting';

/**
 * The CKFinder feature, a bridge between the CKEditor 5 WYSIWYG editor and the
 * [CKFinder](https://ckeditor.com/ckfinder) file manager and uploader.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:ckfinder/ckfinderediting~CKFinderEditing},
 * * {@link module:ckfinder/ckfinderui~CKFinderUI},
 * * {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter}.
 *
 * See the {@glink features/images/image-upload/ckfinder "CKFinder integration" guide} to learn how to configure
 * and use this feature.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload" guide} to learn about
 * other ways to upload images into CKEditor 5.
 */
export default class CKFinder extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CKFinder' {
		return 'CKFinder';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'Link', 'CKFinderUploadAdapter', CKFinderEditing, CKFinderUI ] as const;
	}
}
