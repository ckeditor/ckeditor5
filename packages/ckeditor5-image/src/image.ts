/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
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
	public static get requires(): PluginDependencies {
		return [ ImageBlock, ImageInline ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Image' {
		return 'Image';
	}
}

/**
 * The configuration of the image features. Used by the image features in the `@ckeditor/ckeditor5-image` package.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 			image: ... // Image feature options.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface ImageConfig {
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Image.pluginName ]: Image;
	}

	interface EditorConfig {

		/**
		 * The configuration of the image features. Used by the image features in the `@ckeditor/ckeditor5-image` package.
		 *
		 * Read more in {@link module:image/image~ImageConfig}.
		 */
		image?: ImageConfig;
	}

}

