/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mention
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mention Mention feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Mention extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Mention';
	}
}
