/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Plugin from '../plugin.js';

/**
 * Base creator class.
 *
 * @memberOf ckeditor5.creator
 * @extends ckeditor5.Plugin
 */
export default class BaseCreator extends Plugin {
	/**
	 * The creator's trigger. This method is called by the editor to finalize
	 * the editor creation.
	 *
	 * @returns {Promise}
	 */
	create() {
		return Promise.resolve();
	}
}
