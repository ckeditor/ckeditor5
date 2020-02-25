/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		/**
		 * The editor instance.
		 *
		 * Note that most editors implement the {@link module:core/editor/editorwithui~EditorWithUI} interface in addition
		 * to the base {@link module:core/editor/editor~Editor} interface. However, editors with an external UI
		 * (i.e. Bootstrap-based) or a headless editor may not implement the {@link module:core/editor/editorwithui~EditorWithUI}
		 * interface.
		 *
		 * Because of above, to make plugins more universal, it is recommended to split features into:
		 *  - The "editing" part that only uses the {@link module:core/editor/editor~Editor} interface.
		 *  - The "UI" part that uses both the {@link module:core/editor/editor~Editor} interface and
		 *  the {@link module:core/editor/editorwithui~EditorWithUI} interface.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor} #editor
		 */
		this.editor = editor;

		/**
		 * Flag indicating whether a plugin is enabled or disabled.
		 * A disabled plugin will not transform text.
		 *
		 * Plugin can be simply disabled like that:
		 *
		 *		// Disable the plugin so that no toolbars are visible.
		 *		editor.plugins.get( 'TextTransformation' ).isEnabled = false;
		 *
		 * You can also use {@link #forceDisabled} method.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * Holds identifiers for {@link #forceDisabled} mechanism.
		 *
		 * @type {Set.<String>}
		 * @private
		 */
		this._disableStack = new Set();
	}

	/**
	 * Disables the plugin.
	 *
	 * Plugin may be disabled by multiple features or algorithms (at once). When disabling a plugin, unique id should be passed
	 * (e.g. feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the plugin.
	 * The plugin becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
	 *
	 * Disabling and enabling a plugin:
	 *
	 *		plugin.isEnabled; // -> true
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> false
	 *		plugin.clearForceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> true
	 *
	 * Plugin disabled by multiple features:
	 *
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.forceDisabled( 'OtherFeature' );
	 *		plugin.clearForceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> false
	 *		plugin.clearForceDisabled( 'OtherFeature' );
	 *		plugin.isEnabled; // -> true
	 *
	 * Multiple disabling with the same identifier is redundant:
	 *
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.clearForceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> true
	 *
	 * **Note:** some plugins or algorithms may have more complex logic when it comes to enabling or disabling certain plugins,
	 * so the plugin might be still disabled after {@link #clearForceDisabled} was used.
	 *
	 * @param {String} id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the plugin.
	 */
	forceDisabled( id ) {
		this._disableStack.add( id );

		if ( this._disableStack.size == 1 ) {
			this.on( 'set:isEnabled', forceDisable, { priority: 'highest' } );
			this.isEnabled = false;
		}
	}

	/**
	 * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
	 *
	 * @param {String} id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
	 */
	clearForceDisabled( id ) {
		this._disableStack.delete( id );

		if ( this._disableStack.size == 0 ) {
			this.off( 'set:isEnabled', forceDisable );
			this.isEnabled = true;
		}
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this.stopListening();
	}

	/**
	 * @inheritDoc
	 */
	static get isContextPlugin() {
		return false;
	}
}

mix( Plugin, ObservableMixin );

/**
 * The base interface for CKEditor plugins.
 *
 * In its minimal form a plugin can be a simple function that accepts {@link module:core/editor/editor~Editor the editor}
 * as a parameter:
 *
 *		// A simple plugin that enables a data processor.
 *		function MyPlugin( editor ) {
 *			editor.data.processor = new MyDataProcessor();
 *		}
 *
 * In most cases however, you will want to inherit from the {@link module:core/plugin~Plugin} class which implements the
 * {@link module:utils/observablemixin~ObservableMixin} and is, therefore, more convenient:
 *
 *		class MyPlugin extends Plugin {
 *			init() {
 *				// `listenTo()` and `editor` are available thanks to `Plugin`.
 *				// By using `listenTo()` you will ensure that the listener is removed when
 *				// the plugin is destroyed.
 *				this.listenTo( this.editor.data, 'ready', () => {
 *					// Do something when the data is ready.
 *				} );
 *			}
 *		}
 *
 * The plugin can also implement methods (e.g. {@link module:core/plugin~PluginInterface#init `init()`} or
 * {@link module:core/plugin~PluginInterface#destroy `destroy()`}) which, when present, will be used to properly
 * initialize and destroy the plugin.
 *
 * **Note:** When defined as a plain function, the plugin acts as a constructor and will be
 * called in parallel with other plugins' {@link module:core/plugin~PluginInterface#constructor constructors}.
 * This means the code of that plugin will be executed **before** {@link module:core/plugin~PluginInterface#init `init()`} and
 * {@link module:core/plugin~PluginInterface#afterInit `afterInit()`} methods of other plugins and, for instance,
 * you cannot use it to extend other plugins' {@glink framework/guides/architecture/editing-engine#schema schema}
 * rules as they are defined later on during the `init()` stage.
 *
 * @interface PluginInterface
 */

/**
 * Creates a new plugin instance. This is the first step of the plugin initialization.
 * See also {@link #init} and {@link #afterInit}.
 *
 * A plugin is always instantiated after its {@link module:core/plugin~PluginInterface.requires dependencies} and the
 * {@link #init} and {@link #afterInit} methods are called in the same order.
 *
 * Usually, you will want to put your plugin's initialization code in the {@link #init} method.
 * The constructor can be understood as "before init" and used in special cases, just like
 * {@link #afterInit} serves the special "after init" scenarios (e.g.the code which depends on other
 * plugins, but which does not {@link module:core/plugin~PluginInterface.requires explicitly require} them).
 *
 * @method #constructor
 * @param {module:core/editor/editor~Editor} editor
 */

/**
 * An array of plugins required by this plugin.
 *
 * To keep the plugin class definition tight it is recommended to define this property as a static getter:
 *
 *		import Image from './image.js';
 *
 *		export default class ImageCaption {
 *			static get requires() {
 *				return [ Image ];
 *			}
 *		}
 *
 * @static
 * @readonly
 * @member {Array.<Function>|undefined} module:core/plugin~PluginInterface.requires
 */

/**
 * An optional name of the plugin. If set, the plugin will be available in
 * {@link module:core/plugincollection~PluginCollection#get} by its
 * name and its constructor. If not, then only by its constructor.
 *
 * The name should reflect the constructor name.
 *
 * To keep the plugin class definition tight, it is recommended to define this property as a static getter:
 *
 *		export default class ImageCaption {
 *			static get pluginName() {
 *				return 'ImageCaption';
 *			}
 *		}
 *
 * Note: The native `Function.name` property could not be used to keep the plugin name because
 * it will be mangled during code minification.
 *
 * Naming a plugin is necessary to enable removing it through the
 * {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`} option.
 *
 * @static
 * @readonly
 * @member {String|undefined} module:core/plugin~PluginInterface.pluginName
 */

/**
 * The second stage (after plugin {@link #constructor}) of the plugin initialization.
 * Unlike the plugin constructor this method can be asynchronous.
 *
 * A plugin's `init()` method is called after its {@link module:core/plugin~PluginInterface.requires dependencies} are initialized,
 * so in the same order as the constructors of these plugins.
 *
 * **Note:** This method is optional. A plugin instance does not need to have it defined.
 *
 * @method #init
 * @returns {null|Promise}
 */

/**
 * The third (and last) stage of the plugin initialization. See also {@link #constructor} and {@link #init}.
 *
 * **Note:** This method is optional. A plugin instance does not need to have it defined.
 *
 * @method #afterInit
 * @returns {null|Promise}
 */

/**
 * Destroys the plugin.
 *
 * **Note:** This method is optional. A plugin instance does not need to have it defined.
 *
 * @method #destroy
 * @returns {null|Promise}
 */

/**
 * A flag which defines if a plugin is allowed or not allowed to be used directly by a {@link module:core/context~Context}.
 *
 * @static
 * @readonly
 * @member {Boolean} module:core/plugin~PluginInterface.isContextPlugin
 */

/**
 * An array of loaded plugins.
 *
 * @typedef {Array.<module:core/plugin~PluginInterface>} module:core/plugin~LoadedPlugins
 */

// Helper function that forces plugin to be disabled.
function forceDisable( evt ) {
	evt.return = false;
	evt.stop();
}
