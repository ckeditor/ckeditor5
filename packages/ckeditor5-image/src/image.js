/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ImageEngine from './imageengine.js';
import Widget from './widget/widget.js';

/**
 * The image feature.
 *
 * Uses {@link image.ImageEngine}.
 *
 * @memberOf image
 * @extends core.Feature
 */
export default class Image extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine, Widget ];
	}
}
