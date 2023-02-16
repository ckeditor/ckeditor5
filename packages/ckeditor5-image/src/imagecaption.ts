/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import ImageCaptionEditing from './imagecaption/imagecaptionediting';
import ImageCaptionUI from './imagecaption/imagecaptionui';

import '../theme/imagecaption.css';

/**
 * The image caption plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-captions image caption} documentation.
 */
export default class ImageCaption extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ImageCaptionEditing, ImageCaptionUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageCaption' {
		return 'ImageCaption';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ImageCaption.pluginName ]: ImageCaption;
	}
}
