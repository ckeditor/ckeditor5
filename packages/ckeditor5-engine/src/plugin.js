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
 * @memberOf core
 * @mixes core.ObservableMixin
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
		 * @member {core.Editor} core.Plugin#editor
		 */
		this.editor = editor;
	}

	/**
	 * An array of plugins required by this plugin.
	 *
	 * To keep a plugin class definition tight it's recommended to define this property as a static getter:
	 *
	 *		import Image from './image.js';
	 *
	 *		export default class ImageCaption extends Feature {
     *			static get requires() {
     *				return [ Image ];
     *			}
	 *		}
	 *
	 * @static
	 * @member {Function[]} core.Plugin.requires
	 */

	/**
	 * @returns {null|Promise}
	 */
	init() {}

	/**
	 * Destroys the plugin.
	 *
	 * TODO waits to be implemented (#186).
	 */
	destroy() {}
}

utils.mix( Plugin, ObservableMixin );
