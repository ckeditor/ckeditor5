/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/plugin
 */

/* eslint-disable @typescript-eslint/no-invalid-void-type */

import { ObservableMixin, type ObservableSetEvent, type EventInfo } from '@ckeditor/ckeditor5-utils';

import type Editor from './editor/editor';

/**
 * The base class for CKEditor plugin classes.
 */
export default class Plugin extends ObservableMixin() implements PluginInterface {
	/**
	 * The editor instance.
	 *
	 * Note that most editors implement the {@link module:core/editor/editor~Editor#ui} property.
	 * However, editors with an external UI (i.e. Bootstrap-based) or a headless editor may not have this property or
	 * throw an error when accessing it.
	 *
	 * Because of above, to make plugins more universal, it is recommended to split features into:
	 *  - The "editing" part that uses the {@link module:core/editor/editor~Editor} class without `ui` property.
	 *  - The "UI" part that uses the {@link module:core/editor/editor~Editor} class and accesses `ui` property.
	 */
	public readonly editor: Editor;

	/**
	 * Flag indicating whether a plugin is enabled or disabled.
	 * A disabled plugin will not transform text.
	 *
	 * Plugin can be simply disabled like that:
	 *
	 * ```ts
	 * // Disable the plugin so that no toolbars are visible.
	 * editor.plugins.get( 'TextTransformation' ).isEnabled = false;
	 * ```
	 *
	 * You can also use {@link #forceDisabled} method.
	 *
	 * @observable
	 * @readonly
	 */
	public declare isEnabled: boolean;

	/**
	 * Holds identifiers for {@link #forceDisabled} mechanism.
	 */
	private _disableStack = new Set<string>();

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super();

		this.editor = editor;

		this.set( 'isEnabled', true );
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
	 * ```ts
	 * plugin.isEnabled; // -> true
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> false
	 * plugin.clearForceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> true
	 * ```
	 *
	 * Plugin disabled by multiple features:
	 *
	 * ```ts
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.forceDisabled( 'OtherFeature' );
	 * plugin.clearForceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> false
	 * plugin.clearForceDisabled( 'OtherFeature' );
	 * plugin.isEnabled; // -> true
	 * ```
	 *
	 * Multiple disabling with the same identifier is redundant:
	 *
	 * ```ts
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.forceDisabled( 'MyFeature' );
	 * plugin.clearForceDisabled( 'MyFeature' );
	 * plugin.isEnabled; // -> true
	 * ```
	 *
	 * **Note:** some plugins or algorithms may have more complex logic when it comes to enabling or disabling certain plugins,
	 * so the plugin might be still disabled after {@link #clearForceDisabled} was used.
	 *
	 * @param id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the plugin.
	 */
	public forceDisabled( id: string ): void {
		this._disableStack.add( id );

		if ( this._disableStack.size == 1 ) {
			this.on<ObservableSetEvent<boolean>>( 'set:isEnabled', forceDisable, { priority: 'highest' } );
			this.isEnabled = false;
		}
	}

	/**
	 * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
	 *
	 * @param id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
	 */
	public clearForceDisabled( id: string ): void {
		this._disableStack.delete( id );

		if ( this._disableStack.size == 0 ) {
			this.off( 'set:isEnabled', forceDisable );
			this.isEnabled = true;
		}
	}

	/**
	 * @inheritDoc
	 */
	public destroy(): void {
		this.stopListening();
	}

	/**
	 * @inheritDoc
	 */
	public static get isContextPlugin(): false {
		return false;
	}
}

/**
 * The base interface for CKEditor plugins.
 *
 * In its minimal form a plugin can be a simple function that accepts {@link module:core/editor/editor~Editor the editor}
 * as a parameter:
 *
 * ```ts
 * // A simple plugin that enables a data processor.
 * function MyPlugin( editor ) {
 * 	editor.data.processor = new MyDataProcessor();
 * }
 * ```
 *
 * In most cases however, you will want to inherit from the {@link ~Plugin} class which implements the
 * {@link module:utils/observablemixin~Observable} and is, therefore, more convenient:
 *
 * ```ts
 * class MyPlugin extends Plugin {
 * 	init() {
 * 		// `listenTo()` and `editor` are available thanks to `Plugin`.
 * 		// By using `listenTo()` you will ensure that the listener is removed when
 * 		// the plugin is destroyed.
 * 		this.listenTo( this.editor.data, 'ready', () => {
 * 			// Do something when the data is ready.
 * 		} );
 * 	}
 * }
 * ```
 *
 * The plugin class can have `pluginName` and `requires` static members. See {@link ~PluginStaticMembers} for more details.
 *
 * The plugin can also implement methods (e.g. {@link ~PluginInterface#init `init()`} or
 * {@link ~PluginInterface#destroy `destroy()`}) which, when present, will be used to properly
 * initialize and destroy the plugin.
 *
 * **Note:** When defined as a plain function, the plugin acts as a constructor and will be
 * called in parallel with other plugins' {@link ~PluginConstructor constructors}.
 * This means the code of that plugin will be executed **before** {@link ~PluginInterface#init `init()`} and
 * {@link ~PluginInterface#afterInit `afterInit()`} methods of other plugins and, for instance,
 * you cannot use it to extend other plugins' {@glink framework/architecture/editing-engine#schema schema}
 * rules as they are defined later on during the `init()` stage.
 */
export interface PluginInterface {

	/**
	 * The second stage (after plugin constructor) of the plugin initialization.
	 * Unlike the plugin constructor this method can be asynchronous.
	 *
	 * A plugin's `init()` method is called after its {@link ~PluginStaticMembers#requires dependencies} are initialized,
	 * so in the same order as the constructors of these plugins.
	 *
	 * **Note:** This method is optional. A plugin instance does not need to have it defined.
	 */
	init?(): Promise<unknown> | null | undefined | void;

	/**
	 * The third (and last) stage of the plugin initialization. See also {@link ~PluginConstructor} and {@link ~PluginInterface#init}.
	 *
	 * **Note:** This method is optional. A plugin instance does not need to have it defined.
	 */
	afterInit?(): Promise<unknown> | null | undefined | void;

	/**
	 * Destroys the plugin.
	 *
	 * **Note:** This method is optional. A plugin instance does not need to have it defined.
	 */
	destroy(): Promise<unknown> | null | undefined | void;
}

/**
 * Creates a new plugin instance. This is the first step of the plugin initialization.
 * See also {@link ~PluginInterface#init} and {@link ~PluginInterface#afterInit}.
 *
 * The plugin static properties should conform to {@link ~PluginStaticMembers `PluginStaticMembers` interface}.
 *
 * A plugin is always instantiated after its {@link ~PluginStaticMembers#requires dependencies} and the
 * {@link ~PluginInterface#init} and {@link ~PluginInterface#afterInit} methods are called in the same order.
 *
 * Usually, you will want to put your plugin's initialization code in the {@link ~PluginInterface#init} method.
 * The constructor can be understood as "before init" and used in special cases, just like
 * {@link ~PluginInterface#afterInit} serves the special "after init" scenarios (e.g.the code which depends on other
 * plugins, but which does not {@link ~PluginStaticMembers#requires explicitly require} them).
 */
export type PluginConstructor<TContext = Editor> =
	( PluginClassConstructor<TContext> | PluginFunctionConstructor<TContext> ) & PluginStaticMembers<TContext>;

/**
 * In most cases, you will want to inherit from the {@link ~Plugin} class which implements the
 * {@link module:utils/observablemixin~Observable} and is, therefore, more convenient:
 *
 * ```ts
 * class MyPlugin extends Plugin {
 * 	init() {
 * 		// `listenTo()` and `editor` are available thanks to `Plugin`.
 * 		// By using `listenTo()` you will ensure that the listener is removed when
 * 		// the plugin is destroyed.
 * 		this.listenTo( this.editor.data, 'ready', () => {
 * 			// Do something when the data is ready.
 * 		} );
 * 	}
 * }
 * ```
 */
export type PluginClassConstructor<TContext = Editor> = new ( editor: TContext ) => PluginInterface;

/**
 * In its minimal form a plugin can be a simple function that accepts {@link module:core/editor/editor~Editor the editor}
 * as a parameter:
 *
 * ```ts
 * // A simple plugin that enables a data processor.
 * function MyPlugin( editor ) {
 * 	editor.data.processor = new MyDataProcessor();
 * }
 * ```
 */
export type PluginFunctionConstructor<TContext = Editor> = ( editor: TContext ) => void;

/**
 * Static properties of a plugin.
 */
export interface PluginStaticMembers<TContext = Editor> {

	/**
	 * An array of plugins required by this plugin.
	 *
	 * To keep the plugin class definition tight it is recommended to define this property as a static getter:
	 *
	 * ```ts
	 * import Image from './image.js';
	 *
	 * export default class ImageCaption {
	 * 	static get requires() {
	 * 		return [ Image ];
	 * 	}
	 * }
	 * ```
	 */
	readonly requires?: PluginDependencies<TContext>;

	/**
	 * An optional name of the plugin. If set, the plugin will be available in
	 * {@link module:core/plugincollection~PluginCollection#get} by its
	 * name and its constructor. If not, then only by its constructor.
	 *
	 * The name should reflect the constructor name.
	 *
	 * To keep the plugin class definition tight, it is recommended to define this property as a static getter:
	 *
	 * ```ts
	 * export default class ImageCaption {
	 * 	static get pluginName() {
	 * 		return 'ImageCaption';
	 * 	}
	 * }
	 * ```
	 *
	 * Note: The native `Function.name` property could not be used to keep the plugin name because
	 * it will be mangled during code minification.
	 *
	 * Naming a plugin is necessary to enable removing it through the
	 * {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`} option.
	 */
	readonly pluginName?: string;

	/**
	 * A flag which defines if a plugin is allowed or not allowed to be used directly by a {@link module:core/context~Context}.
	 */
	readonly isContextPlugin?: boolean;
}

export type PluginDependencies<TContext = Editor> = ReadonlyArray<PluginConstructor<TContext> | string>;

/**
 * An array of loaded plugins.
 */
export type LoadedPlugins = Array<PluginInterface>;

/**
 * Helper function that forces plugin to be disabled.
 */
function forceDisable( evt: EventInfo<string, boolean> ) {
	evt.return = false;
	evt.stop();
}
