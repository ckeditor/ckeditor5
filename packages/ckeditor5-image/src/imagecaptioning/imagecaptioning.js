/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaptioning/imagecaptioning
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageCaptioningEngine from './imagecaptioningengine';
import '../../theme/imagecaptioning/theme.scss';

export default class ImageCaptioning extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageCaptioningEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {

	}
}
