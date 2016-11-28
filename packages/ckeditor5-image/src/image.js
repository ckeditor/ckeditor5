/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from '../core/plugin.js';
import ImageEngine from './imageengine.js';
import Widget from './widget/widget.js';

/**
 * The image plugin.
 *
 * Uses {@link image.ImageEngine}.
 *
 * @memberOf image
 * @extends core.Plugin
 */
export default class Image extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine, Widget ];
	}
}
