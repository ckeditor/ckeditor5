/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/editor
 */

import { set, get } from 'es-toolkit/compat';

import {
	Config,
	CKEditorError,
	ObservableMixin,
	logError,
	parseBase64EncodedObject,
	releaseDate,
	toArray,
	uid,
	crc32,
	type Locale,
	type LocaleTranslate,
	type ObservableChangeEvent,
	type CRCData
} from '@ckeditor/ckeditor5-utils';

import {
	Conversion,
	DataController,
	EditingController,
	Model,
	StylesProcessor
} from '@ckeditor/ckeditor5-engine';

import type { EditorUI } from '@ckeditor/ckeditor5-ui';
import { ContextWatchdog, EditorWatchdog } from '@ckeditor/ckeditor5-watchdog';

import Context from '../context.js';
import PluginCollection from '../plugincollection.js';
import CommandCollection, { type CommandsMap } from '../commandcollection.js';
import EditingKeystrokeHandler from '../editingkeystrokehandler.js';
import Accessibility from '../accessibility.js';
import { getEditorUsageData, type EditorUsageData } from './utils/editorusagedata.js';

import type { LoadedPlugins, PluginConstructor } from '../plugin.js';
import type { EditorConfig } from './editorconfig.js';

declare global {
	// eslint-disable-next-line no-var
	var CKEDITOR_GLOBAL_LICENSE_KEY: string | undefined;

	// eslint-disable-next-line no-var
	var CKEDITOR_WARNING_SUPPRESSIONS: Record<string, boolean>;
}

/**
 * The class representing a basic, generic editor.
 *
 * Check out the list of its subclasses to learn about specific editor implementations.
 *
 * All editor implementations (like {@link module:editor-classic/classiceditor~ClassicEditor} or
 * {@link module:editor-inline/inlineeditor~InlineEditor}) should extend this class. They can add their
 * own methods and properties.
 *
 * When you are implementing a plugin, this editor represents the API
 * which your plugin can expect to get when using its {@link module:core/plugin~Plugin#editor} property.
 *
 * This API should be sufficient in order to implement the "editing" part of your feature
 * (schema definition, conversion, commands, keystrokes, etc.).
 * It does not define the editor UI, which is available only if
 * the specific editor implements also the {@link ~Editor#ui} property
 * (as most editor implementations do).
 */
export default abstract class Editor extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * A required name of the editor class. The name should reflect the constructor name.
	 */
	public static get editorName(): `${ string }Editor` {
		return 'Editor';
	}

	/**
	 * A namespace for the accessibility features of the editor.
	 */
	public readonly accessibility: Accessibility;

	/**
	 * Commands registered to the editor.
	 *
	 * Use the shorthand {@link #execute `editor.execute()`} method to execute commands:
	 *
	 * ```ts
	 * // Execute the bold command:
	 * editor.execute( 'bold' );
	 *
	 * // Check the state of the bold command:
	 * editor.commands.get( 'bold' ).value;
	 * ```
	 */
	public readonly commands: CommandCollection;

	/**
	 * Stores all configurations specific to this editor instance.
	 *
	 * ```ts
	 * editor.config.get( 'image.toolbar' );
	 * // -> [ 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
	 * ```
	 */
	public readonly config: Config<EditorConfig>;

	/**
	 * Conversion manager through which you can register model-to-view and view-to-model converters.
	 *
	 * See the {@link module:engine/conversion/conversion~Conversion} documentation to learn how to add converters.
	 */
	public readonly conversion: Conversion;

	/**
	 * The {@link module:engine/controller/datacontroller~DataController data controller}.
	 * Used e.g. for setting and retrieving the editor data.
	 */
	public readonly data: DataController;

	/**
	 * The {@link module:engine/controller/editingcontroller~EditingController editing controller}.
	 * Controls user input and rendering the content for editing.
	 */
	public readonly editing: EditingController;

	/**
	 * The locale instance.
	 */
	public readonly locale: Locale;

	/**
	 * The editor's model.
	 *
	 * The central point of the editor's abstract data model.
	 */
	public readonly model: Model;

	/**
	 * The plugins loaded and in use by this editor instance.
	 *
	 * ```ts
	 * editor.plugins.get( 'ClipboardPipeline' ); // -> An instance of the clipboard pipeline plugin.
	 * ```
	 */
	public readonly plugins: PluginCollection<Editor>;

	/**
	 * An instance of the {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler}.
	 *
	 * It allows setting simple keystrokes:
	 *
	 * ```ts
	 * // Execute the bold command on Ctrl+E:
	 * editor.keystrokes.set( 'Ctrl+E', 'bold' );
	 *
	 * // Execute your own callback:
	 * editor.keystrokes.set( 'Ctrl+E', ( data, cancel ) => {
	 * 	console.log( data.keyCode );
	 *
	 * 	// Prevent the default (native) action and stop the underlying keydown event
	 * 	// so no other editor feature will interfere.
	 * 	cancel();
	 * } );
	 * ```
	 *
	 * Note: Certain typing-oriented keystrokes (like <kbd>Backspace</kbd> or <kbd>Enter</kbd>) are handled
	 * by a low-level mechanism and trying to listen to them via the keystroke handler will not work reliably.
	 * To handle these specific keystrokes, see the events fired by the
	 * {@link module:engine/view/document~Document editing view document} (`editor.editing.view.document`).
	 */
	public readonly keystrokes: EditingKeystrokeHandler;

	/**
	 * Shorthand for {@link module:utils/locale~Locale#t}.
	 *
	 * @see module:utils/locale~Locale#t
	 */
	public readonly t: LocaleTranslate;

	public declare readonly id: string;

	/**
	 * Indicates the editor life-cycle state.
	 *
	 * The editor is in one of the following states:
	 *
	 * * `initializing` &ndash; During the editor initialization (before
	 * {@link module:core/editor/editor~Editor.create `Editor.create()`}) finished its job.
	 * * `ready` &ndash; After the promise returned by the {@link module:core/editor/editor~Editor.create `Editor.create()`}
	 * method is resolved.
	 * * `destroyed` &ndash; Once the {@link #destroy `editor.destroy()`} method was called.
	 *
	 * @observable
	 */
	public declare state: 'initializing' | 'ready' | 'destroyed';

	/**
	 * The default configuration which is built into the editor class.
	 *
	 * It was used in the now deprecated CKEditor 5 builds to provide the default configuration options
	 * which are later used during the editor initialization.
	 *
	 * ```ts
	 * ClassicEditor.defaultConfig = {
	 * 	foo: 1,
	 * 	bar: 2
	 * };
	 *
	 * ClassicEditor
	 * 	.create( sourceElement )
	 * 	.then( editor => {
	 * 		editor.config.get( 'foo' ); // -> 1
	 * 		editor.config.get( 'bar' ); // -> 2
	 * 	} );
	 *
	 * // The default options can be overridden by the configuration passed to create().
	 * ClassicEditor
	 * 	.create( sourceElement, { bar: 3 } )
	 * 	.then( editor => {
	 * 		editor.config.get( 'foo' ); // -> 1
	 * 		editor.config.get( 'bar' ); // -> 3
	 * 	} );
	 * ```
	 *
	 * See also {@link module:core/editor/editor~Editor.builtinPlugins}.
	 */
	public static defaultConfig?: EditorConfig;

	/**
	 * An array of plugins built into this editor class.
	 *
	 * It is used in the now deprecated CKEditor 5 builds to provide a list of plugins which are later automatically initialized
	 * during the editor initialization.
	 *
	 * They will be automatically initialized by the editor, unless listed in `config.removePlugins` and
	 * unless `config.plugins` is passed.
	 *
	 * ```ts
	 * // Build some plugins into the editor class first.
	 * ClassicEditor.builtinPlugins = [ FooPlugin, BarPlugin ];
	 *
	 * // Normally, you need to define config.plugins, but since ClassicEditor.builtinPlugins was
	 * // defined, now you can call create() without any configuration.
	 * ClassicEditor
	 * 	.create( sourceElement )
	 * 	.then( editor => {
	 * 		editor.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
	 * 		editor.plugins.get( BarPlugin ); // -> An instance of the Bar plugin.
	 * 	} );
	 *
	 * ClassicEditor
	 * 	.create( sourceElement, {
	 * 		// Do not initialize these plugins (note: it is defined by a string):
	 * 		removePlugins: [ 'Foo' ]
	 * 	} )
	 * 	.then( editor => {
	 * 		editor.plugins.get( FooPlugin ); // -> Undefined.
	 * 		editor.config.get( BarPlugin ); // -> An instance of the Bar plugin.
	 * 	} );
	 *
	 * ClassicEditor
	 * 	.create( sourceElement, {
	 * 		// Load only this plugin. It can also be defined by a string if
	 * 		// this plugin was built into the editor class.
	 * 		plugins: [ FooPlugin ]
	 * 	} )
	 * 	.then( editor => {
	 * 		editor.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
	 * 		editor.config.get( BarPlugin ); // -> Undefined.
	 * 	} );
	 * ```
	 *
	 * See also {@link module:core/editor/editor~Editor.defaultConfig}.
	 */
	public static builtinPlugins?: Array<PluginConstructor<Editor>>;

	/**
	 * The editor UI instance.
	 */
	public abstract get ui(): EditorUI;

	/**
	 * The editor context.
	 * When it is not provided through the configuration, the editor creates it.
	 */
	protected readonly _context: Context;

	/**
	 * A set of lock IDs for the {@link #isReadOnly} getter.
	 */
	protected readonly _readOnlyLocks: Set<symbol | string>;

	/**
	 * Creates a new instance of the editor class.
	 *
	 * Usually, not to be used directly. See the static {@link module:core/editor/editor~Editor.create `create()`} method.
	 *
	 * @param config The editor configuration.
	 */
	constructor( config: EditorConfig = {} ) {
		super();

		if ( 'sanitizeHtml' in config ) {
			/**
			 * Configuration property `config.sanitizeHtml` was removed in CKEditor version 43.1.0 and is no longer supported.
			 *
			 * Please use `config.htmlEmbed.sanitizeHtml` and/or `config.mergeFields.sanitizeHtml` instead.
			 *
			 * @error editor-config-sanitizehtml-not-supported
			 */
			throw new CKEditorError( 'editor-config-sanitizehtml-not-supported' );
		}

		const constructor = this.constructor as typeof Editor;

		// We don't pass translations to the config, because its behavior of splitting keys
		// with dots (e.g. `resize.width` => `resize: { width }`) breaks the translations.
		const { translations: defaultTranslations, ...defaultConfig } = constructor.defaultConfig || {};
		const { translations = defaultTranslations, ...rest } = config;

		// Prefer the language passed as the argument to the constructor instead of the constructor's `defaultConfig`, if both are set.
		const language = config.language || defaultConfig.language;

		this._context = config.context || new Context( { language, translations } );
		this._context._addEditor( this, !config.context );

		// Clone the plugins to make sure that the plugin array will not be shared
		// between editors and make the watchdog feature work correctly.
		const availablePlugins = Array.from( constructor.builtinPlugins || [] );

		this.config = new Config<EditorConfig>( rest, defaultConfig );
		this.config.define( 'plugins', availablePlugins );
		this.config.define( this._context._getEditorConfig() );

		checkLicenseKeyIsDefined( this.config );

		this.plugins = new PluginCollection<Editor>( this, availablePlugins, this._context.plugins );

		this.locale = this._context.locale;
		this.t = this.locale.t;

		this._readOnlyLocks = new Set();

		this.commands = new CommandCollection();

		this.set( 'state', 'initializing' );
		this.once<EditorReadyEvent>( 'ready', () => ( this.state = 'ready' ), { priority: 'high' } );
		this.once<EditorDestroyEvent>( 'destroy', () => ( this.state = 'destroyed' ), { priority: 'high' } );

		this.model = new Model();

		this.on( 'change:isReadOnly', () => {
			this.model.document.isReadOnly = this.isReadOnly;
		} );

		const stylesProcessor = new StylesProcessor();

		this.data = new DataController( this.model, stylesProcessor );

		this.editing = new EditingController( this.model, stylesProcessor );
		this.editing.view.document.bind( 'isReadOnly' ).to( this );

		this.conversion = new Conversion( [ this.editing.downcastDispatcher, this.data.downcastDispatcher ], this.data.upcastDispatcher );
		this.conversion.addAlias( 'dataDowncast', this.data.downcastDispatcher );
		this.conversion.addAlias( 'editingDowncast', this.editing.downcastDispatcher );

		this.keystrokes = new EditingKeystrokeHandler( this );
		this.keystrokes.listenTo( this.editing.view.document );

		this.accessibility = new Accessibility( this );

		verifyLicenseKey( this );

		// Checks if the license key is defined and throws an error if it is not.
		function checkLicenseKeyIsDefined( config: Config<EditorConfig> ) {
			let licenseKey = config.get( 'licenseKey' );

			if ( !licenseKey && window.CKEDITOR_GLOBAL_LICENSE_KEY ) {
				licenseKey = window.CKEDITOR_GLOBAL_LICENSE_KEY;
				config.set( 'licenseKey', licenseKey );
			}

			if ( !licenseKey ) {
				/**
				 * The `licenseKey` property is missing in the editor configuration.
				 *
				 * * If you are using the editor in a commercial setup, please provide your license key.
				 * * If you still need to acquire a key, please [contact us](https://ckeditor.com/contact/) or
				 *   [create a free account with a 14 day premium features trial](https://portal.ckeditor.com/checkout?plan=free).
				 * * If you are using the editor under a GPL license or another license from our Open Source Initiative,
				 *   use the 'GPL' license key instead.
				 *
				 * ```js
				 * ClassicEditor.create( document.querySelector( '#editor' ), {
				 * 	licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
				 * 	// ... Other configuration options ...
				 * } ) ;
				 *
				 * @error license-key-missing
				 */
				throw new CKEditorError( 'license-key-missing' );
			}
		}

		function verifyLicenseKey( editor: Editor ) {
			const licenseKey = editor.config.get( 'licenseKey' )!;
			const distributionChannel = ( window as any )[ Symbol.for( 'cke distribution' ) ] || 'sh';

			function blockEditor( reason: LicenseErrorReason ) {
				editor.enableReadOnlyMode( Symbol( 'invalidLicense' ) );
				editor._showLicenseError( reason );
			}

			function getPayload( licenseKey: string ): string | null {
				const parts = licenseKey.split( '.' );

				if ( parts.length != 3 ) {
					return null;
				}

				return parts[ 1 ];
			}

			function hasAllRequiredFields( licensePayload: Record<string, unknown> ) {
				const requiredFields = [ 'exp', 'jti', 'vc' ];

				return requiredFields.every( field => field in licensePayload );
			}

			function getCrcInputData( licensePayload: Record<string, unknown> ): CRCData {
				const keysToCheck = Object.getOwnPropertyNames( licensePayload ).sort();

				const filteredValues = keysToCheck
					.filter( key => key != 'vc' && licensePayload[ key ] != null )
					.map( key => licensePayload[ key ] );

				return filteredValues as CRCData;
			}

			function checkLicensedHosts( licensedHosts: Array<string> ): boolean {
				const { hostname } = new URL( window.location.href );

				if ( licensedHosts.includes( hostname ) ) {
					return true;
				}

				const segments = hostname.split( '.' );

				return licensedHosts
					// Filter out hosts without wildcards.
					.filter( host => host.includes( '*' ) )
					// Split the hosts into segments.
					.map( host => host.split( '.' ) )
					// Filter out hosts that have more segments than the current hostname.
					.filter( host => host.length <= segments.length )
					// Pad the beginning of the licensed host if it's shorter than the current hostname.
					.map( host => Array( segments.length - host.length ).fill( host[ 0 ] === '*' ? '*' : '' ).concat( host ) )
					// Check if some license host matches the hostname.
					.some( octets => segments.every( ( segment, index ) => octets[ index ] === segment || octets[ index ] === '*' ) );
			}

			function warnAboutNonProductionLicenseKey( licenseType: string ) {
				const capitalizedLicenseType = licenseType[ 0 ].toUpperCase() + licenseType.slice( 1 );
				const article = licenseType === 'evaluation' ? 'an' : 'a';

				console.info(
					`%cCKEditor 5 ${ capitalizedLicenseType } License`,
					'color: #ffffff; background: #743CCD; font-size: 14px; padding: 4px 8px; border-radius: 4px;'
				);

				console.warn(
					`⚠️ You are using ${ article } ${ licenseType } license of CKEditor 5` +
					`${ licenseType === 'trial' ? ' which is for evaluation purposes only' : '' }. ` +
					'For production usage, please obtain a production license at https://portal.ckeditor.com/'
				);
			}

			if ( licenseKey == 'GPL' ) {
				if ( distributionChannel == 'cloud' ) {
					blockEditor( 'distributionChannel' );
				}

				return;
			}

			const encodedPayload = getPayload( licenseKey );

			if ( !encodedPayload ) {
				blockEditor( 'invalid' );

				return;
			}

			const licensePayload = parseBase64EncodedObject( encodedPayload );

			if ( !licensePayload ) {
				blockEditor( 'invalid' );

				return;
			}

			if ( !hasAllRequiredFields( licensePayload ) ) {
				blockEditor( 'invalid' );

				return;
			}

			if ( licensePayload.distributionChannel && !toArray( licensePayload.distributionChannel ).includes( distributionChannel ) ) {
				blockEditor( 'distributionChannel' );

				return;
			}

			if ( crc32( getCrcInputData( licensePayload ) ) != licensePayload.vc.toLowerCase() ) {
				blockEditor( 'invalid' );

				return;
			}

			const expirationDate = new Date( licensePayload.exp * 1000 );

			if ( expirationDate < releaseDate ) {
				blockEditor( 'expired' );

				return;
			}

			const licensedHosts: Array<string> | undefined = licensePayload.licensedHosts;

			if ( licensedHosts && licensedHosts.length > 0 && !checkLicensedHosts( licensedHosts ) ) {
				blockEditor( 'domainLimit' );

				return;
			}

			if ( [ 'evaluation', 'trial' ].includes( licensePayload.licenseType ) && licensePayload.exp * 1000 < Date.now() ) {
				blockEditor( 'expired' );

				return;
			}

			if ( [ 'development', 'evaluation', 'trial' ].includes( licensePayload.licenseType ) ) {
				const { licenseType } = licensePayload;

				window.CKEDITOR_WARNING_SUPPRESSIONS = window.CKEDITOR_WARNING_SUPPRESSIONS || {};

				if ( !window.CKEDITOR_WARNING_SUPPRESSIONS[ licenseType ] ) {
					warnAboutNonProductionLicenseKey( licenseType );

					window.CKEDITOR_WARNING_SUPPRESSIONS[ licenseType ] = true;
				}
			}

			if ( [ 'evaluation', 'trial' ].includes( licensePayload.licenseType ) ) {
				const licenseType: 'evaluation' | 'trial' = licensePayload.licenseType;
				const timerId = setTimeout( () => {
					blockEditor( `${ licenseType }Limit` );
				}, 600000 );

				editor.on( 'destroy', () => {
					clearTimeout( timerId );
				} );
			}

			if ( licensePayload.usageEndpoint ) {
				editor.once<EditorReadyEvent>( 'ready', () => {
					const request = {
						requestId: uid(),
						requestTime: Math.round( Date.now() / 1000 ),
						license: licenseKey,
						editor: collectUsageData( editor )
					};

					/**
					 * This part of the code is not executed in open-source implementations using a GPL key.
					 * It only runs when a specific license key is provided. If you are uncertain whether
					 * this applies to your installation, please contact our support team.
					 */
					editor._sendUsageRequest( licensePayload.usageEndpoint, request ).then( response => {
						const { status, message } = response;

						if ( message ) {
							console.warn( message );
						}

						if ( status != 'ok' ) {
							blockEditor( 'usageLimit' );
						}
					}, () => {
						/**
						 * Your license key cannot be validated due to a network issue.
						 * Please ensure that your setup does not block requests to the validation endpoint.
						 *
						 * @error license-key-validation-endpoint-not-reachable
						 * @param {string} url The URL that was attempted to be reached for validation.
						 */
						logError( 'license-key-validation-endpoint-not-reachable', { url: licensePayload.usageEndpoint } );
					} );
				}, { priority: 'high' } );
			}
		}
	}

	/**
	 * Defines whether the editor is in the read-only mode.
	 *
	 * In read-only mode the editor {@link #commands commands} are disabled so it is not possible
	 * to modify the document by using them. Also, the editable element(s) become non-editable.
	 *
	 * In order to make the editor read-only, you need to call the {@link #enableReadOnlyMode} method:
	 *
	 * ```ts
	 * editor.enableReadOnlyMode( 'feature-id' );
	 * ```
	 *
     * Later, to turn off the read-only mode, call {@link #disableReadOnlyMode}:
	 *
	 * ```ts
	 * editor.disableReadOnlyMode( 'feature-id' );
	 * ```
	 *
	 * @readonly
	 * @observable
	 */
	public get isReadOnly(): boolean {
		return this._readOnlyLocks.size > 0;
	}

	public set isReadOnly( value: boolean ) {
		/**
		 * The {@link module:core/editor/editor~Editor#isReadOnly Editor#isReadOnly} property is read-only since version `34.0.0`
		 * and can be set only using {@link module:core/editor/editor~Editor#enableReadOnlyMode `Editor#enableReadOnlyMode( lockId )`} and
		 * {@link module:core/editor/editor~Editor#disableReadOnlyMode `Editor#disableReadOnlyMode( lockId )`}.
		 *
		 * Usage before version `34.0.0`:
		 *
		 * ```ts
		 * editor.isReadOnly = true;
		 * editor.isReadOnly = false;
		 * ```
		 *
		 * Usage since version `34.0.0`:
		 *
		 * ```ts
		 * editor.enableReadOnlyMode( 'my-feature-id' );
		 * editor.disableReadOnlyMode( 'my-feature-id' );
		 * ```
		 *
		 * @error editor-isreadonly-has-no-setter
		 */
		throw new CKEditorError( 'editor-isreadonly-has-no-setter' );
	}

	/**
	 * Turns on the read-only mode in the editor.
	 *
	 * Editor can be switched to or out of the read-only mode by many features, under various circumstances. The editor supports locking
	 * mechanism for the read-only mode. It enables easy control over the read-only mode when many features wants to turn it on or off at
	 * the same time, without conflicting with each other. It guarantees that you will not make the editor editable accidentally (which
	 * could lead to errors).
	 *
	 * Each read-only mode request is identified by a unique id (also called "lock"). If multiple plugins requested to turn on the
	 * read-only mode, then, the editor will become editable only after all these plugins turn the read-only mode off (using the same ids).
	 *
	 * Note, that you cannot force the editor to disable the read-only mode if other plugins set it.
	 *
	 * After the first `enableReadOnlyMode()` call, the {@link #isReadOnly `isReadOnly` property} will be set to `true`:
	 *
	 * ```ts
	 * editor.isReadOnly; // `false`.
	 * editor.enableReadOnlyMode( 'my-feature-id' );
	 * editor.isReadOnly; // `true`.
	 * ```
	 *
	 * You can turn off the read-only mode ("clear the lock") using the {@link #disableReadOnlyMode `disableReadOnlyMode()`} method:
	 *
	 * ```ts
	 * editor.enableReadOnlyMode( 'my-feature-id' );
	 * // ...
	 * editor.disableReadOnlyMode( 'my-feature-id' );
	 * editor.isReadOnly; // `false`.
	 * ```
	 *
	 * All "locks" need to be removed to enable editing:
	 *
	 * ```ts
	 * editor.enableReadOnlyMode( 'my-feature-id' );
	 * editor.enableReadOnlyMode( 'my-other-feature-id' );
	 * // ...
	 * editor.disableReadOnlyMode( 'my-feature-id' );
	 * editor.isReadOnly; // `true`.
	 * editor.disableReadOnlyMode( 'my-other-feature-id' );
	 * editor.isReadOnly; // `false`.
	 * ```
	 *
	 * @param lockId A unique ID for setting the editor to the read-only state.
	 */
	public enableReadOnlyMode( lockId: string | symbol ): void {
		if ( typeof lockId !== 'string' && typeof lockId !== 'symbol' ) {
			/**
			 * The lock ID is missing or it is not a string or symbol.
			 *
			 * @error editor-read-only-lock-id-invalid
			 * @param {never} lockId Lock ID.
			 */
			throw new CKEditorError( 'editor-read-only-lock-id-invalid', null, { lockId } );
		}

		if ( this._readOnlyLocks.has( lockId ) ) {
			return;
		}

		this._readOnlyLocks.add( lockId );

		if ( this._readOnlyLocks.size === 1 ) {
			// Manually fire the `change:isReadOnly` event as only getter is provided.
			this.fire<ObservableChangeEvent<boolean>>( 'change:isReadOnly', 'isReadOnly', true, false );
		}
	}

	/**
	 * Removes the read-only lock from the editor with given lock ID.
	 *
	 * When no lock is present on the editor anymore, then the {@link #isReadOnly `isReadOnly` property} will be set to `false`.
	 *
	 * @param lockId The lock ID for setting the editor to the read-only state.
	 */
	public disableReadOnlyMode( lockId: string | symbol ): void {
		if ( typeof lockId !== 'string' && typeof lockId !== 'symbol' ) {
			throw new CKEditorError( 'editor-read-only-lock-id-invalid', null, { lockId } );
		}

		if ( !this._readOnlyLocks.has( lockId ) ) {
			return;
		}

		this._readOnlyLocks.delete( lockId );

		if ( this._readOnlyLocks.size === 0 ) {
			// Manually fire the `change:isReadOnly` event as only getter is provided.
			this.fire<ObservableChangeEvent<boolean>>( 'change:isReadOnly', 'isReadOnly', false, true );
		}
	}

	/**
	 * Sets the data in the editor.
	 *
	 * ```ts
	 * editor.setData( '<p>This is editor!</p>' );
	 * ```
	 *
	 * If your editor implementation uses multiple roots, you should pass an object with keys corresponding
	 * to the editor root names and values equal to the data that should be set in each root:
	 *
	 * ```ts
	 * editor.setData( {
	 *     header: '<p>Content for header part.</p>',
	 *     content: '<p>Content for main part.</p>',
	 *     footer: '<p>Content for footer part.</p>'
	 * } );
	 * ```
	 *
	 * By default the editor accepts HTML. This can be controlled by injecting a different data processor.
	 * See the {@glink features/markdown Markdown output} guide for more details.
	 *
	 * @param data Input data.
	 */
	public setData( data: string | Record<string, string> ): void {
		this.data.set( data );
	}

	/**
	 * Gets the data from the editor.
	 *
	 * ```ts
	 * editor.getData(); // -> '<p>This is editor!</p>'
	 * ```
	 *
	 * If your editor implementation uses multiple roots, you should pass root name as one of the options:
	 *
	 * ```ts
	 * editor.getData( { rootName: 'header' } ); // -> '<p>Content for header part.</p>'
	 * ```
	 *
	 * By default, the editor outputs HTML. This can be controlled by injecting a different data processor.
	 * See the {@glink features/markdown Markdown output} guide for more details.
	 *
	 * A warning is logged when you try to retrieve data for a detached root, as most probably this is a mistake. A detached root should
	 * be treated like it is removed, and you should not save its data. Note, that the detached root data is always an empty string.
	 *
	 * @param options Additional configuration for the retrieved data.
	 * Editor features may introduce more configuration options that can be set through this parameter.
	 * @param options.rootName Root name. Defaults to `'main'`.
	 * @param options.trim Whether returned data should be trimmed. This option is set to `'empty'` by default,
	 * which means that whenever editor content is considered empty, an empty string is returned. To turn off trimming
	 * use `'none'`. In such cases exact content will be returned (for example `'<p>&nbsp;</p>'` for an empty editor).
	 * @returns Output data.
	 */
	public getData( options?: {
		rootName?: string;
		trim?: 'empty' | 'none';
		[ key: string ]: unknown;
	} ): string {
		return this.data.get( options );
	}

	/**
	 * Loads and initializes plugins specified in the configuration.
	 *
	 * @returns A promise which resolves once the initialization is completed, providing an array of loaded plugins.
	 */
	public initPlugins(): Promise<LoadedPlugins> {
		const config = this.config;
		const plugins = config.get( 'plugins' )!;
		const removePlugins = config.get( 'removePlugins' ) || [];
		const extraPlugins = config.get( 'extraPlugins' ) || [];
		const substitutePlugins = config.get( 'substitutePlugins' ) || [];

		return this.plugins.init( plugins.concat( extraPlugins ), removePlugins, substitutePlugins );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * **Note** The editor cannot be destroyed during the initialization phase so if it is called
	 * while the editor {@link #state is being initialized}, it will wait for the editor initialization before destroying it.
	 *
	 * @fires destroy
	 * @returns A promise that resolves once the editor instance is fully destroyed.
	 */
	public destroy(): Promise<unknown> {
		let readyPromise: Promise<unknown> = Promise.resolve();

		if ( this.state == 'initializing' ) {
			readyPromise = new Promise( resolve => this.once<EditorReadyEvent>( 'ready', resolve ) );
		}

		return readyPromise
			.then( () => {
				this.fire<EditorDestroyEvent>( 'destroy' );
				this.stopListening();
				this.commands.destroy();
			} )
			.then( () => this.plugins.destroy() )
			.then( () => {
				this.model.destroy();
				this.data.destroy();
				this.editing.destroy();
				this.keystrokes.destroy();
			} )
			// Remove the editor from the context.
			// When the context was created by this editor, the context will be destroyed.
			.then( () => this._context._removeEditor( this ) );
	}

	/**
	 * Executes the specified command with given parameters.
	 *
	 * Shorthand for:
	 *
	 * ```ts
	 * editor.commands.get( commandName ).execute( ... );
	 * ```
	 *
	 * @param commandName The name of the command to execute.
	 * @param commandParams Command parameters.
	 * @returns The value returned by the {@link module:core/commandcollection~CommandCollection#execute `commands.execute()`}.
	 */
	public execute<TName extends string>(
		commandName: TName,
		...commandParams: Parameters<CommandsMap[ TName ][ 'execute' ]>
	): ReturnType<CommandsMap[ TName ][ 'execute' ]> {
		try {
			return this.commands.execute( commandName, ...commandParams );
		} catch ( err: any ) {
			// @if CK_DEBUG // throw err;
			/* istanbul ignore next -- @preserve */
			CKEditorError.rethrowUnexpectedError( err, this );
		}
	}

	/**
	 * Focuses the editor.
	 *
	 * **Note** To explicitly focus the editing area of the editor, use the
	 * {@link module:engine/view/view~View#focus `editor.editing.view.focus()`} method of the editing view.
	 *
	 * Check out the {@glink framework/deep-dive/ui/focus-tracking#focus-in-the-editor-ui Focus in the editor UI} section
	 * of the {@glink framework/deep-dive/ui/focus-tracking Deep dive into focus tracking} guide to learn more.
	 */
	public focus(): void {
		this.editing.view.focus();
	}

	/* istanbul ignore next -- @preserve */
	/**
	 * Creates and initializes a new editor instance.
	 *
	 * This is an abstract method. Every editor type needs to implement its own initialization logic.
	 *
	 * See the `create()` methods of the existing editor types to learn how to use them:
	 *
	 * * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}
	 * * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`}
	 * * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
	 * * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`}
	 */
	public static create( ...args: Array<unknown> ): void { // eslint-disable-line @typescript-eslint/no-unused-vars
		throw new Error( 'This is an abstract method.' );
	}

	/**
	 * The {@link module:core/context~Context} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */
	public static Context = Context;

	/**
	 * The {@link module:watchdog/editorwatchdog~EditorWatchdog} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */
	public static EditorWatchdog = EditorWatchdog;

	/**
	 * The {@link module:watchdog/contextwatchdog~ContextWatchdog} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */
	public static ContextWatchdog = ContextWatchdog;

	private _showLicenseError( reason: LicenseErrorReason, pluginName?: string ) {
		setTimeout( () => {
			if ( reason == 'invalid' ) {
				/**
				 * The license key provided is invalid. Please ensure that it is copied correctly
				 * from the [Customer Portal](http://portal.ckeditor.com). If the issue persists,
				 * please [contact our customer support](https://ckeditor.com/contact/).
				 *
				 * @error invalid-license-key
				 */
				throw new CKEditorError( 'invalid-license-key' );
			}

			if ( reason == 'expired' ) {
				/**
				 * Your license key has expired.
				 *
				 * If you used our free trial, you either need to switch to
				 * [open-source license](https://ckeditor.com/docs/ckeditor5/latest/getting-started/licensing/license-and-legal.html), or
				 * in case of a commercial plan, change the trial key to production key or development key.
				 * Switching from trial, you also need to align the editor configuration to the features available in your plan.
				 *
				 * If you already had one of our Cloud or Custom plans, please renew your license in the
				 * [Customer Portal](https://portal.ckeditor.com).
				 *
				 * @error license-key-expired
				 */
				throw new CKEditorError( 'license-key-expired' );
			}

			if ( reason == 'domainLimit' ) {
				/**
				 * The provided license does not allow the editor to run on this domain.
				 * Some license keys are restricted to local test environments only.
				 * For more details, please refer to the
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types license key type documentation}.
				 *
				 * @error license-key-domain-limit
				 */
				throw new CKEditorError( 'license-key-domain-limit' );
			}

			if ( reason == 'featureNotAllowed' ) {
				/**
				 * The plugin you are trying to use is not permitted under your current license.
				 * Please check the available features on the
				 * [Customer Portal](https://portal.ckeditor.com) or
				 * [contact support](https://ckeditor.com/contact/) for more information.
				 *
				 * @error license-key-plugin-not-allowed
				 * @param {String} pluginName The plugin you tried to load.
				 */
				throw new CKEditorError( 'license-key-plugin-not-allowed', null, { pluginName } );
			}

			if ( reason == 'evaluationLimit' ) {
				/**
				 * You have exceeded the editor operation limit available for your evaluation license key.
				 * Please restart the editor to continue using it.
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types Read more about license key types}.
				 *
				 * @error license-key-evaluation-limit
				 */
				throw new CKEditorError( 'license-key-evaluation-limit' );
			}

			if ( reason == 'trialLimit' ) {
				/**
				 * You have exceeded the editor operation limit for your trial license key.
				 * Please restart the editor to continue using it.
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types Read more about license key types}.
				 *
				 * @error license-key-trial-limit
				 */
				throw new CKEditorError( 'license-key-trial-limit' );
			}

			if ( reason == 'developmentLimit' ) {
				/**
				 * You have exceeded the operation limit for your development license key within the editor.
				 * Please restart the editor to continue using it.
				 * {@glink getting-started/licensing/license-key-and-activation#license-key-types Read more about license key types}.
				 *
				 * @error license-key-development-limit
				 */
				throw new CKEditorError( 'license-key-development-limit' );
			}

			if ( reason == 'usageLimit' ) {
				/**
				 * You have reached the usage limit of your license key. This can occur in the following situations:
				 *
				 * * You are on a free subscription without a connected payment method and have exceeded the allowed usage threshold.
				 * * Your account has overdue invoices and the grace period has ended.
				 *
				 * To extend the limit and restore access, please update the required details in the
				 * [Customer Portal](https://portal.ckeditor.com) or
				 * [contact our customer support](https://ckeditor.com/contact).
				 *
				 * @error license-key-usage-limit
				 */
				throw new CKEditorError( 'license-key-usage-limit' );
			}

			if ( reason == 'distributionChannel' ) {
				/**
				 * Your license does not allow the current distribution channel.
				 *
				 * These are the available distribution channels:
				 * * Self-hosted - the editor is installed via npm or from a ZIP package
				 * * Cloud - the editor is run from CDN
				 *
				 * The licenses available include:
				 * * GPL license for open-source users.
				 * * Commercial plans (Cloud or sales-assisted).
				 *
				 * The relation between distribution channels and licenses works as follows:
				 * * With the 'GPL' license key, you may use the editor installed via npm or a ZIP package (self-hosted).
				 * * With the CKEditor Cloud plans, you may use the editor via our CDN.
				 * * With the CKEditor Custom plans, depending on your plan details, you can use the editor via npm
				 *   or a ZIP package (self-hosted) or Cloud (CDN).
				 *
				 * {@glink getting-started/licensing/usage-based-billing#key-terms Read more about distributions in the documentation}.
				 * Please verify your installation or [contact support](https://ckeditor.com/contact/) for assistance.
				 * Should you need to migrate your installation from npm to CDN, please refer to our
				 * [dedicated migration guides](https://ckeditor.com/docs/ckeditor5/latest/updating/migrations/vanilla-js.html).
				 *
				 * @error license-key-invalid-distribution-channel
				 */
				throw new CKEditorError( 'license-key-invalid-distribution-channel' );
			}

			/* istanbul ignore next -- @preserve */
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const unreachable: never = reason;
		}, 0 );

		this._showLicenseError = () => {};
	}

	/**
	 * This part of the code is _not_ executed in installations under the GPL license (with `config.licenseKey = 'GPL'`).
     *
	 * It is only executed when a specific license key is provided. If you are uncertain whether
	 * this applies to your installation, please contact our support team.
	 */
	private async _sendUsageRequest( endpoint: string, request: unknown ) {
		const headers = new Headers( { 'Content-Type': 'application/json' } );
		const response = await fetch( new URL( endpoint ), {
			method: 'POST',
			headers,
			body: JSON.stringify( request )
		} );

		if ( !response.ok ) {
			// TODO: refine message.
			throw new Error( `HTTP Response: ${ response.status }` );
		}

		return response.json();
	}
}

function collectUsageData( editor: Editor ): EditorUsageData {
	const collectedData = getEditorUsageData( editor );

	function setUsageData( path: string, value: unknown ) {
		if ( get( collectedData, path ) !== undefined ) {
			/**
			 * The error thrown when trying to set the usage data path that was already set.
			 * Make sure that you are not setting the same path multiple times.
			 *
			 * @error editor-usage-data-path-already-set
			 * @param {string} path The path that was already set.
			 */
			throw new CKEditorError( 'editor-usage-data-path-already-set', { path } );
		}

		set( collectedData, path, value );
	}

	editor.fire<EditorCollectUsageDataEvent>( 'collectUsageData', {
		setUsageData
	} );

	return collectedData;
}

type LicenseErrorReason =
	'invalid' |
	'expired' |
	'domainLimit' |
	'featureNotAllowed' |
	'evaluationLimit' |
	'trialLimit' |
	'developmentLimit' |
	'usageLimit' |
	'distributionChannel';

/**
 * Fired when the {@link module:engine/controller/datacontroller~DataController#event:ready data} and all additional
 * editor components are ready.
 *
 * Note: This event is most useful for plugin developers. When integrating the editor with your website or
 * application, you do not have to listen to `editor#ready` because when the promise returned by the static
 * {@link module:core/editor/editor~Editor.create `Editor.create()`} event is resolved, the editor is already ready.
 * In fact, since the first moment when the editor instance is available to you is inside `then()`'s callback,
 * you cannot even add a listener to the `editor#ready` event.
 *
 * See also the {@link module:core/editor/editor~Editor#state `editor.state`} property.
 *
 * @eventName ~Editor#ready
 */
export type EditorReadyEvent = {
	name: 'ready';
	args: [];
};

/**
 * Fired when the editor is about to collect usage data.
 *
 * This event is fired when the editor is about to collect usage data. It allows plugins to provide additional data for
 * the usage statistics. The usage data is collected by the editor and sent to the usage tracking server. All plugins are
 * expected to be ready at this point.
 *
 * @eventName ~Editor#collectUsageData
 */
export type EditorCollectUsageDataEvent = {
	name: 'collectUsageData';
	args: [
		{
			setUsageData( path: string, value: unknown ): void;
		}
	];
};

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * See also the {@link module:core/editor/editor~Editor#state `editor.state`} property.
 *
 * @eventName ~Editor#destroy
 */
export type EditorDestroyEvent = {
	name: 'destroy';
	args: [];
};

/**
 * This error is thrown when trying to pass a `<textarea>` element to a `create()` function of an editor class.
 *
 * The only editor type which can be initialized on `<textarea>` elements is
 * the {@glink getting-started/setup/editor-types#classic-editor classic editor}.
 * This editor hides the passed element and inserts its own UI next to it. Other types of editors reuse the passed element as their root
 * editable element and therefore `<textarea>` is not appropriate for them. Use a `<div>` or another text container instead:
 *
 * ```html
 * <div id="editor">
 * 	<p>Initial content.</p>
 * </div>
 * ```
 *
 * @error editor-wrong-element
 */
