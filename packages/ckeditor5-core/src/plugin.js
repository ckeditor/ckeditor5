/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ObservableMixin from '../utils/observablemixin.js';
import mix from '../utils/mix.js';

/**
 * The base class for CKEditor plugin classes.
 *
 * @memberOf core
 * @mixes utils.ObservaleMixin
 */
export default class Plugin {
	/**
	 * Creates a new Plugin instance.
	 *
	 * @param {core.editor.Editor} editor
	 */
	constructor( editor ) {
		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {core.editor.Editor} core.Plugin#editor
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
	 *		export default class ImageCaption extends Plugin {
     *			static get requires() {
     *				return [ Image ];
     *			}
	 *		}
	 *
	 * @static
	 * @member {Function[]|undefined} core.Plugin.requires
	 */

	/**
	 * Optional name of the plugin. If set, the plugin will be available in {@link PluginCollection#get} by its
	 * name and its constructor. If not, then only by its constructor.
	 *
	 * The name should reflect the package name + path to that module. E.g. `ckeditor5-image/src/image.js` plugin
	 * should be named `ckeditor5-image/image`.
	 *
	 * To keep a plugin class definition tight it's recommended to define this property as a static getter:
	 *
	 *		import Image from './image.js';
	 *
	 *		export default class ImageCaption extends Plugin {
     *			static get pluginName() {
     *				return 'ckeditor5-image/image';
     *			}
	 *		}
	 *
	 * @static
	 * @member {String|undefined} core.Plugin.pluginName
	 */

	/**
	 * Initializes the plugin.
	 *
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
