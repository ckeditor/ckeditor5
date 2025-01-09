/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckfinder/ckfinder
 */

import { Plugin } from 'ckeditor5/src/core.js';

import CKFinderUI from './ckfinderui.js';
import CKFinderEditing from './ckfinderediting.js';

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
 * See the {@glink features/file-management/ckfinder "CKFinder integration" guide} to learn how to configure
 * and use this feature.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload" guide} to learn about
 * other ways to upload images into CKEditor 5.
 */
export default class CKFinder extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKFinder' as const;
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
		return [ 'Link', 'CKFinderUploadAdapter', CKFinderEditing, CKFinderUI ] as const;
	}
}
