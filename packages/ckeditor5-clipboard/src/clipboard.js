/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';

/**
 * The clipboard feature. Currently, it's only responsible for intercepting the paste event and
 * passing the pasted content through a paste pipeline.
 *
 * @memberOf clipboard
 * @extends core.Feature
 */
export default class Clipboard extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
	}
}
