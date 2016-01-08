/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Model from './model.js';

/**
 * The base class for CKEditor plugin classes.
 *
 * @class core.Plugin
 * @extends core.Model
 */

export default class Plugin extends Model {
	/**
	 * Creates a new Plugin instance.
	 *
	 * @param {core.Editor} editor
	 */
	constructor( editor ) {
		super();

		/**
		 * @readonly
		 * @property {core.Editor}
		 */
		this.editor = editor;
	}

	/**
	 * @returns {null/Promise}
	 */
	init() {}
}
