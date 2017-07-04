/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaption
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageCaptionEngine from './imagecaption/imagecaptionengine';
import '../theme/imagecaption/theme.scss';

/**
 * The image caption plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaption extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageCaptionEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageCaption';
	}
}
