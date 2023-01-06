/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsertviaurl
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import ImageInsertUI from './imageinsert/imageinsertui';

/**
 * The image insert via URL plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/images-inserting#inserting-images-via-source-url
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
	public static get pluginName(): 'ImageInsertViaUrl' {
		return 'ImageInsertViaUrl';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ImageInsertUI ];
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ImageInsertViaUrl.pluginName ]: ImageInsertViaUrl;
	}
}
