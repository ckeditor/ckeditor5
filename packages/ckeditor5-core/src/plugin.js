/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/plugin
 */

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * The base class for CKEditor plugin classes.
 *
 * @implements module:core/plugin~PluginInterface
 * @mixes module:utils/observablemixin~ObservaleMixin
 */
export default class Plugin {
	/**
	 * Creates a new Plugin instance. This is the
	 * {@link module:core/plugin~PluginInterface#constructor first step} of a plugin initialization. See also
	 * {@link module:core/plugin~PluginInterface#init} and {@link module:core/plugin~PluginInterface#afterInit}.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( editor ) {
		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor} module:core/plugin~Plugin#editor
		 */
		this.editor = editor;
	}

	/**
	 * @returns {null|Promise}
	 */
	init() {}

	/**
	 * @returns {null|Promise}
	 */
	afterInit() {}

	/**
	 * @returns {null|Promise}
	 */
	destroy() {}
}

mix( Plugin, ObservableMixin );

/**
 * The base interface for CKEditor plugins.
 *
 * @interface Plugin
 */

/**
 * An array of plugins required by this plugin.
 *
 * To keep a plugin class definition tight it's recommended to define this property as a static getter:
 *
 *		import Image from './image.js';
 *
 *		export default class ImageCaption {
 *			static get requires() {
 *				return [ Image ];
 *			}
 *      }
 *
 * @static
 * @readonly
 * @member {Array.<Function>|undefined} module:core/plugin~PluginInterface.requires
 */

/**
 * Optional name of the plugin. If set, the plugin will be available in
 * {@link module:core/plugincollectioncollection~PluginCollection#get} by its
 * name and its constructor. If not, then only by its constructor.
 *
 * The name should reflect the package name + the plugin module name. E.g. `ckeditor5-image/src/image.js` plugin
 * should be named `image/image`. If plugin is kept deeper in the directory structure, it's recommended to only use the module file name,
 * not the whole path. So, e.g. a plugin defined in `ckeditor5-ui/src/notification/notification.js` file may be named `ui/notification`.
 *
 * To keep a plugin class definition tight it's recommended to define this property as a static getter:
 *
 *		export default class ImageCaption {
 *			static get pluginName() {
 *				return 'image/imagecaption';
 *			}
 *		}
 *
 * @static
 * @readonly
 * @member {String|undefined} module:core/plugin~PluginInterface.pluginName
 */

/**
 * The editor instance.
 *
 * @readonly
 * @member {module:core/editor/editor~Editor} module:core/plugin~PluginInterface#editor
 */

/**
 * Creates a plugin instance. This is the first step of a plugin initialization.
 * See also {@link #init} and {@link #afterInit}.
 *
 * A plugin is always instantiated after its {@link module:core/plugin~PluginInterface.requires dependencies} and the
 * {@link #init} and {@link #afterInit} methods are called in the same order.
 *
 * Usually, you'll want to put your plugin's initialization code in the {@link #init} method.
 * The constructor can be understood as "before init" and used in special cases, just like
 * {@link #afterInit} servers for the special "after init" scenarios (e.g. code which depends on other
 * plugins, but which doesn't {@link module:core/plugin~PluginInterface.requires explicitly require} them).
 *
 * @method constructor
 * @param {module:core/editor/editor~Editor} editor
 */

/**
 * The second stage (after plugin {@link #constructor}) of plugin initialization.
 * Unlike the plugin constructor this method can perform asynchronous.
 *
 * A plugin's `init()` method is called after its {@link module:core/plugin~PluginInterface.requires dependencies} are initialized,
 * so in the same order as constructors of these plugins.
 *
 * @method init
 * @returns {null|Promise}
 */

/**
 * The third (and last) stage of plugin initialization. See also {@link #constructor} and {@link #init}.
 *
 * @method afterInit
 * @returns {null|Promise}
 */

/**
 * Destroys the plugin.
 *
 * @method destroy
 * @returns {null|Promise}
 */
