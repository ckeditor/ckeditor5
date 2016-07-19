/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ObservableMixin from './utils/observablemixin.js';
import mix from './utils/mix.js';

/**
 * The base class for CKEditor plugin classes.
 *
 * @memberOf ckeditor5
 * @mixes utils.ObservaleMixin
 */
export default class Plugin {
	/**
	 * Creates a new Plugin instance.
	 *
	 * @param {ckeditor5.Editor} editor
	 */
	constructor( editor ) {
		/**
		 * @readonly
		 * @member {ckeditor5.Editor} ckeditor5.Plugin#editor
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
	 * @member {Function[]} ckeditor5.Plugin.requires
	 */

	/**
	 * @returns {null|Promise}
	 */
	init() {}

	/**
	 * Destroys the plugin.
	 *
	 * @returns {null|Promise}
	 */
	destroy() {}
}

mix( Plugin, ObservableMixin );
