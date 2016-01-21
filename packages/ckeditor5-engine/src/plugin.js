/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ObservableMixin from './observablemixin.js';
import utils from './utils.js';

/**
 * The base class for CKEditor plugin classes.
 *
 * @class core.Plugin
 * @mixins core.ObservableMixin
 */

export default class Plugin {
	/**
	 * Creates a new Plugin instance.
	 *
	 * @param {core.Editor} editor
	 */
	constructor( editor ) {
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

utils.mix( Plugin, ObservableMixin );
