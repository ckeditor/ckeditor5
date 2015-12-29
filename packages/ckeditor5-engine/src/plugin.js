/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * The base class for CKEditor plugin classes.
 *
 * @class core/Plugin
 * @extends Model
 */

import Model from './model.js';

export default class Plugin extends Model {
	/**
	 * Creates a new Plugin instance.
	 *
	 * @param {core/Editor} editor
	 */
	constructor( editor ) {
		super();

		/**
		 * @readonly
		 * @property {core/Editor}
		 */
		this.editor = editor;
	}

	/**
	 * @returns {null/Promise}
	 */
	init() {}
}
