/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageEngine from './imageengine';
import Widget from './widget/widget';
import ImageAlternateText from './imagealternatetext/imagealternatetext';

import '../theme/theme.scss';

/**
 * The image plugin.
 *
 * Uses {@link module:image/imageengine~ImageEngine}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Image extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine, Widget, ImageAlternateText ];
	}
}
