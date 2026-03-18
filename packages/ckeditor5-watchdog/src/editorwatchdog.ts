/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/editorwatchdog
 */

import { areConnectedThroughProperties } from './utils/areconnectedthroughproperties.js';
import { normalizeRootsConfig } from './utils/normalizerootsconfig.js';
import { Watchdog, type WatchdogConfig } from './watchdog.js';

import type {
	CKEditorError
} from '@ckeditor/ckeditor5-utils';

import type {
	ModelNode,
	ModelText,
	ModelElement,
	ModelWriter
} from '@ckeditor/ckeditor5-engine';

import type {
	Editor,
	EditorConfig,
	Context,
	EditorReadyEvent,
	RootConfig
} from '@ckeditor/ckeditor5-core';

import {
	throttle,
	cloneDeepWith,
	isElement as _isElement,
	type DebouncedFunc
} from 'es-toolkit/compat';

/**
 * A watchdog for CKEditor 5 editors.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export class EditorWatchdog<TEditor extends Editor = Editor> extends Watchdog {
	/**
	 * The current editor instance.
	 */
	private _editor: TEditor | null = null;

	/**
	 * A promise associated with the life cycle of the editor (creation or destruction processes).
	 *
	 * It is used to prevent the initialization of the editor if the previous instance has not been destroyed yet,
	 * and conversely, to prevent the destruction of the editor if it has not been initialized.
	 */
	private _lifecyclePromise: Promise<unknown> | null = null;

	/**
	 * Throttled save method. The `save()` method is called the specified `saveInterval` after `throttledSave()` is called,
	 * unless a new action happens in the meantime.
	 */
	private _throttledSave: DebouncedFunc<() => void>;

	/**
	 * The latest saved editor data represented as a root name -> root data object.
	 */
	private _data?: EditorData;

	/**
	 * The last document version.
	 */
	private _lastDocumentVersion?: number;

	/**
	 * The editor source element or data.
	 */
	private _elementOrData?: HTMLElement | string | Record<string, string> | Record<string, HTMLElement>;

	/**
	 * Stores the original DOM element for single-root editors.
	 */
	private _editorAttachTo: HTMLElement | null = null;

	/**
	 * Specifies whether the editor is a single-root editor (e.g. ClassicEditor) or a multi-root editor (e.g. MultiRootEditor).
	 */
	private _isSingleRootEditor: boolean = true;

	/**
	 * Specifies whether the editor was created using config-based creator mode (without a source element or data as the first argument).
	 */
	private _isUsingConfigBasedCreator: boolean = false;

	/**
	 * The latest record of the editor editable elements. Used to restart the editor.
	 */
	private _editables: Record<string, HTMLElement> = {};

	/**
	 * The editor configuration.
	 */
	private _config?: EditorConfig;

	/**
	 * The creation method.
	 *
	 * @see #setCreator
	 */
	declare protected _creator: EditorWatchdogCreatorFunction<TEditor>;

	/**
	 * The destruction method.
	 *
	 * @see #setDestructor
	 */
	declare protected _destructor: ( editor: Editor ) => Promise<unknown>;

	private _excludedProps?: Set<unknown>;

	/**
	 * @param Editor The editor class.
	 * @param watchdogConfig The watchdog plugin configuration.
	 */
	constructor( Editor: { create( ...args: any ): Promise<TEditor> } | null, watchdogConfig: WatchdogConfig = {} ) {
		super( watchdogConfig );

		// this._editorClass = Editor;

		this._throttledSave = throttle(
			this._save.bind( this ),
			typeof watchdogConfig.saveInterval === 'number' ? watchdogConfig.saveInterval : 5000
		);

		// Set default creator and destructor functions:
		if ( Editor ) {
			this._creator = ( ( elementOrData, config ) => {
				if ( elementOrData === undefined ) {
					return Editor.create( config );
				}

				return Editor.create( elementOrData, config );
			} );
		}

		this._destructor = editor => editor.destroy();
	}

	/**
	 * The current editor instance.
	 */
	public get editor(): TEditor | null {
		return this._editor;
	}

	/**
	 * @internal
	 */
	public get _item(): TEditor | null {
		return this._editor;
	}

	/**
	 * Sets the function that is responsible for the editor creation.
	 * It expects a function that should return a promise.
	 *
	 * ```ts
	 * watchdog.setCreator( ( element, config ) => ClassicEditor.create( element, config ) );
	 * ```
	 *
	 * When the watchdog is used in config-based creator mode (see {@link #create}), `elementOrData` will be `undefined`:
	 *
	 * ```ts
	 * watchdog.setCreator( ( elementOrData, config ) => {
	 * 	if ( !elementOrData ) {
	 * 		return ClassicEditor.create( config );
	 * 	}
	 *
	 * 	return ClassicEditor.create( elementOrData, config );
	 * } );
	 * ```
	 */
	public setCreator( creator: EditorWatchdogCreatorFunction<TEditor> ): void {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for the editor destruction.
	 * Overrides the default destruction function, which destroys only the editor instance.
	 * It expects a function that should return a promise or `undefined`.
	 *
	 * ```ts
	 * watchdog.setDestructor( editor => {
	 * 	// Do something before the editor is destroyed.
	 *
	 * 	return editor
	 * 		.destroy()
	 * 		.then( () => {
	 * 			// Do something after the editor is destroyed.
	 * 		} );
	 * } );
	 * ```
	 */
	public setDestructor( destructor: ( editor: Editor ) => Promise<unknown> ): void {
		this._destructor = destructor;
	}

	/**
	 * Restarts the editor instance. This method is called whenever an editor error occurs. It fires the `restart` event and changes
	 * the state to `initializing`.
	 *
	 * @fires restart
	 */
	protected override _restart(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this.state = 'initializing';
				this._fire( 'stateChange' );

				return this._destroy();
			} )
			.catch( err => {
				console.error( 'An error happened during the editor destroying.', err );
			} )
			.then( () => {
				// Pre-process some data from the original editor config.
				// Our goal here is to make sure that the restarted editor will be reinitialized with correct set of roots.
				// We are not interested in any data set in config or in `.create()` first parameter. It will be replaced anyway.
				// But we need to set them correctly to make sure that proper roots are created.
				//
				// Since a different set of roots will be created, lazy-roots and roots-attributes must be managed too.

				if ( this._isUsingConfigBasedCreator ) {
					// In config-based creator mode, normalize using an empty source to ensure `config.root` is moved
					// to `config.roots.main` and other legacy config properties are handled.
					normalizeRootsConfig(
						this._isSingleRootEditor ? '' : {},
						this._config!,
						this._isSingleRootEditor ? 'main' : false
					);
				} else {
					// Normalize the roots configuration based on the editor source element or data and the editor configuration.
					normalizeRootsConfig(
						this._isSingleRootEditor ? this._editorAttachTo || '' : this._editables,
						this._config!,
						this._isSingleRootEditor ? 'main' : false
					);
				}

				const updatedConfig: EditorConfig = {
					...this._config,
					extraPlugins: this._config!.extraPlugins || [],
					_watchdogInitialData: this._data
				};

				// Add content loading plugin to the editor configuration.
				// This plugin will be responsible for loading the editor data into the editor after it is restarted.
				updatedConfig.extraPlugins!.push( EditorWatchdogInitPlugin );

				// Collect existing roots configuration and update it. This will ensure that the same set of roots
				// will be created after the restart, and they will have correct lazy loading and attributes configuration.
				const updatedRootsConfig: Record<string, RootConfig> = {};

				for ( const [ rootName, rootData ] of Object.entries( this._data!.roots ) ) {
					const rootConfig = updatedConfig.roots![ rootName ] || Object.create( null );

					// Delete `initialData` as it is not needed. Data will be set by the watchdog based on `_watchdogInitialData`.
					rootConfig.initialData = '';

					if ( rootData.isLoaded ) {
						rootConfig.lazyLoad = false;
					} else {
						delete rootConfig.modelAttributes;
					}

					updatedRootsConfig[ rootName ] = rootConfig;
				}

				updatedConfig.roots = updatedRootsConfig;

				// Delete `initialData` as it is not needed. Data will be set by the watchdog based on `_watchdogInitialData`.
				// First parameter of the editor `.create()` will be used to set up initial roots.
				delete updatedConfig.initialData;

				// Also alias for main root should not provide initial data.
				// In fact, it should not provide any data as it is only an alias for the root defined in `config.roots`
				// and it is the `config.roots` that should be used to set up the initial data for the main root.
				// This would cause a crash while normalizing conflict when left as is.
				delete updatedConfig.root;

				if ( this._isUsingConfigBasedCreator ) {
					return this.create( updatedConfig, updatedConfig.context );
				}

				const elementOrData = this._isSingleRootEditor ?
					this._editorAttachTo || '' :
					this._editables;

				return this.create( elementOrData, updatedConfig, updatedConfig.context );
			} )
			.then( () => {
				this._fire( 'restart' );
			} );
	}

	/**
	 * Creates the editor instance and keeps it running, using the defined creator and destructor.
	 *
	 * @param config The editor configuration.
	 * @param context A context for the editor.
	 */
	public create( config: EditorConfig, context?: Context ): Promise<unknown>;

	/**
	 * Creates the editor instance and keeps it running, using the defined creator and destructor.
	 *
	 * **Note**: This method signature is deprecated and will be removed in the future release.
	 *
	 * @deprecated
	 * @param elementOrData The editor source element or the editor data.
	 * @param config The editor configuration.
	 * @param context A context for the editor.
	 */
	public create(
		elementOrData: HTMLElement | string | Record<string, string> | Record<string, HTMLElement>,
		config: EditorConfig,
		context?: Context
	): Promise<unknown>;

	public create(
		elementOrDataOrConfig: HTMLElement | string | Record<string, string> | Record<string, HTMLElement> |
			EditorConfig | undefined = this._isUsingConfigBasedCreator ? this._config! : this._elementOrData!,
		configOrContext: EditorConfig | Context | undefined = this._isUsingConfigBasedCreator ? undefined : this._config!,
		context?: Context
	): Promise<unknown> {
		// Detect config-based creator mode: first argument is a config object (not an element, string, or record of strings/elements).
		// The detection is skipped during restart (when `_elementOrData` or `_config` is already set).
		const isUsingConfigBasedCreator = this._detectConfigBasedCreator( elementOrDataOrConfig, configOrContext );
		const elementOrData = isUsingConfigBasedCreator ?
			undefined :
			elementOrDataOrConfig as typeof this._elementOrData;
		const config = isUsingConfigBasedCreator ?
			elementOrDataOrConfig as EditorConfig :
			configOrContext as EditorConfig | undefined;
		const resolvedContext = isUsingConfigBasedCreator ?
			configOrContext as Context | undefined :
			context;

		this._lifecyclePromise = Promise.resolve( this._lifecyclePromise )
			.then( () => {
				super._startErrorHandling();

				this._isUsingConfigBasedCreator = isUsingConfigBasedCreator;
				this._elementOrData = elementOrData;

				// Clone configuration because it might be shared within multiple watchdog instances. Otherwise,
				// when an error occurs in one of these editors, the watchdog will restart all of them.
				this._config = this._cloneEditorConfiguration( config || {} );

				this._config!.context = resolvedContext;

				// Store the original DOM element for single-root editors. We can't use editable elements as ClassicEditor
				// expects the attachment element.
				if ( isUsingConfigBasedCreator ) {
					// In config-based creator mode, element references are already in the config
					// (`config.attachTo` or `config.roots.*.element`), so there's no need to store them separately.
					this._editorAttachTo = null;

					// Detect single-root vs multi-root from config. The config might use `config.root` (alias),
					// `config.roots`, `config.attachTo`, or legacy `config.initialData`.
					const rootsCount = this._config!.roots ? Object.keys( this._config!.roots ).length : 0;
					const legacyInitialData = this._config!.initialData;
					const isMultiRootFromLegacy = legacyInitialData && typeof legacyInitialData === 'object';

					this._isSingleRootEditor = !isMultiRootFromLegacy && rootsCount <= 1;
				} else {
					this._editorAttachTo = isElement( elementOrData ) ? elementOrData : null;
					this._isSingleRootEditor = isElement( elementOrData ) || typeof elementOrData == 'string';
				}

				return this._creator( elementOrData, this._config! );
			} )
			.then( editor => {
				this._editor = editor;

				editor.model.document.on( 'change:data', this._throttledSave );

				this._lastDocumentVersion = editor.model.document.version;
				this._data = this._getData();

				if ( !this._editorAttachTo ) {
					this._editables = this._getEditables();
				}

				this.state = 'ready';
				this._fire( 'stateChange' );
			} ).finally( () => {
				this._lifecyclePromise = null;
			} );

		return this._lifecyclePromise;
	}

	/**
	 * Destroys the watchdog and the current editor instance. It fires the callback
	 * registered in {@link #setDestructor `setDestructor()`} and uses it to destroy the editor instance.
	 * It also sets the state to `destroyed`.
	 */
	public override destroy(): Promise<unknown> {
		this._lifecyclePromise = Promise.resolve( this._lifecyclePromise )
			.then( () => {
				this.state = 'destroyed';
				this._fire( 'stateChange' );

				super.destroy();

				return this._destroy();
			} ).finally( () => {
				this._lifecyclePromise = null;
			} );

		return this._lifecyclePromise;
	}

	private _destroy(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this._stopErrorHandling();

				this._throttledSave.cancel();

				const editor = this._editor;

				this._editor = null;

				// Remove the `change:data` listener before destroying the editor.
				// Incorrectly written plugins may trigger firing `change:data` events during the editor destruction phase
				// causing the watchdog to call `editor.getData()` when some parts of editor are already destroyed.
				editor!.model.document.off( 'change:data', this._throttledSave );

				return this._destructor( editor! );
			} );
	}

	/**
	 * Saves the editor data, so it can be restored after the crash even if the data cannot be fetched at
	 * the moment of the crash.
	 */
	private _save(): void {
		const version = this._editor!.model.document.version;

		try {
			this._data = this._getData();

			if ( !this._editorAttachTo ) {
				this._editables = this._getEditables();
			}

			this._lastDocumentVersion = version;
		} catch ( err ) {
			console.error(
				err,
				'An error happened during restoring editor data. ' +
				'Editor will be restored from the previously saved data.'
			);
		}
	}

	/**
	 * @internal
	 */
	public _setExcludedProperties( props: Set<unknown> ): void {
		this._excludedProps = props;
	}

	/**
	 * Gets all data that is required to reinitialize editor instance.
	 */
	private _getData(): EditorData {
		const editor = this._editor!;
		const roots = editor.model.document.roots.filter( root => root.isAttached() && root.rootName != '$graveyard' );

		const { plugins } = editor;
		// `as any` to avoid linking from external private repo.
		const commentsRepository = plugins.has( 'CommentsRepository' ) && plugins.get( 'CommentsRepository' ) as any;
		const trackChanges = plugins.has( 'TrackChanges' ) && plugins.get( 'TrackChanges' ) as any;

		const data: EditorData = {
			roots: {},
			markers: {},
			commentThreads: JSON.stringify( [] ),
			suggestions: JSON.stringify( [] )
		};

		roots.forEach( root => {
			data.roots[ root.rootName ] = {
				content: JSON.stringify( Array.from( root.getChildren() ) ),
				attributes: JSON.stringify( Array.from( root.getAttributes() ) ),
				isLoaded: root._isLoaded
			};
		} );

		for ( const marker of editor.model.markers ) {
			if ( !marker._affectsData ) {
				continue;
			}

			data.markers[ marker.name ] = {
				rangeJSON: marker.getRange().toJSON() as any,
				usingOperation: marker._managedUsingOperations,
				affectsData: marker._affectsData
			};
		}

		if ( commentsRepository ) {
			data.commentThreads = JSON.stringify( commentsRepository.getCommentThreads( { toJSON: true, skipNotAttached: true } ) );
		}

		if ( trackChanges ) {
			data.suggestions = JSON.stringify( trackChanges.getSuggestions( { toJSON: true, skipNotAttached: true } ) );
		}

		return data;
	}

	/**
	 * For each attached model root, returns its HTML editable element (if available).
	 */
	private _getEditables(): Record<string, HTMLElement> {
		const editables: Record<string, HTMLElement> = {};

		for ( const rootName of this.editor!.model.document.getRootNames() ) {
			const editable = this.editor!.ui.getEditableElement( rootName );

			if ( editable ) {
				editables[ rootName ] = editable;
			}
		}

		return editables;
	}

	/**
	 * Traverses the error context and the current editor to find out whether these structures are connected
	 * to each other via properties.
	 *
	 * @internal
	 */
	public _isErrorComingFromThisItem( error: CKEditorError ): boolean {
		return areConnectedThroughProperties( this._editor, error.context, this._excludedProps );
	}

	/**
	 * Detects whether the `create()` call was made in config-based creator mode
	 * (i.e., the first argument is a config object rather than a source element or data).
	 */
	private _detectConfigBasedCreator(
		elementOrDataOrConfig: HTMLElement | string | Record<string, string> | Record<string, HTMLElement> | EditorConfig | undefined,
		configOrContext: EditorConfig | Context | undefined
	): boolean {
		// A string or DOM element is clearly the legacy signature.
		if ( typeof elementOrDataOrConfig === 'string' || isElement( elementOrDataOrConfig ) ) {
			return false;
		}

		// If the second argument is a plain object with keys, it's a config → legacy signature.
		if (
			configOrContext &&
			typeof configOrContext === 'object' &&
			!( 'destroy' in configOrContext ) &&
			Object.keys( configOrContext ).length > 0
		) {
			return false;
		}

		// If the first argument is an object where all values are strings or elements, it's multi-root legacy.
		if ( elementOrDataOrConfig && typeof elementOrDataOrConfig === 'object' ) {
			const values = Object.values( elementOrDataOrConfig );

			if ( values.length > 0 && values.every( v => typeof v === 'string' || isElement( v ) ) ) {
				return false;
			}
		}

		// Otherwise, it's config-based.
		return true;
	}

	/**
	 * Clones the editor configuration.
	 */
	private _cloneEditorConfiguration( config: EditorConfig ): EditorConfig {
		return cloneDeepWith( config, ( value, key ) => {
			// Leave DOM references.
			if ( isElement( value ) ) {
				return value;
			}

			if ( key === 'context' ) {
				return value;
			}
		} );
	}
}

/**
 * Internal plugin that is used to stop the default editor initialization and restoring the editor state
 * based on the `editor.config._watchdogInitialData` data.
 */
class EditorWatchdogInitPlugin {
	public editor: Editor;

	private _data: EditorData;

	constructor( editor: Editor ) {
		this.editor = editor;

		this._data = editor.config.get( '_watchdogInitialData' )!;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		// Stops the default editor initialization and use the saved data to restore the editor state.
		// Some of data could not be initialize as a config properties. It is important to keep the data
		// in the same form as it was before the restarting.
		this.editor.data.on( 'init', evt => {
			evt.stop();

			this.editor.model.enqueueChange( { isUndoable: false }, writer => {
				this._restoreCollaborationData();
				this._restoreEditorData( writer );
			} );

			this.editor.data.fire<EditorReadyEvent>( 'ready' );

			// Keep priority `'high' - 1` to be sure that RTC initialization will be first.
		}, { priority: 1000 - 1 } );
	}

	/**
	 * Creates a model node (element or text) based on provided JSON.
	 */
	private _createNode( writer: ModelWriter, jsonNode: any ): ModelText | ModelElement {
		if ( 'name' in jsonNode ) {
			// If child has name property, it is an Element.
			const element = writer.createElement( jsonNode.name, jsonNode.attributes );

			if ( jsonNode.children ) {
				for ( const child of jsonNode.children ) {
					element._appendChild( this._createNode( writer, child ) );
				}
			}

			return element;
		} else {
			// Otherwise, it is a Text node.
			return writer.createText( jsonNode.data, jsonNode.attributes );
		}
	}

	/**
	 * Restores the editor by setting the document data, roots attributes and markers.
	 */
	private _restoreEditorData( writer: ModelWriter ): void {
		const editor = this.editor!;

		Object.entries( this._data!.roots ).forEach( ( [ rootName, { content, attributes } ] ) => {
			const parsedNodes: Array<ModelNode | ModelElement> = JSON.parse( content );
			const parsedAttributes: Array<[ string, unknown ]> = JSON.parse( attributes );

			const rootElement = editor.model.document.getRoot( rootName )!;

			for ( const [ key, value ] of parsedAttributes ) {
				writer.setAttribute( key, value, rootElement );
			}

			for ( const child of parsedNodes ) {
				const node = this._createNode( writer, child );

				writer.insert( node, rootElement, 'end' );
			}
		} );

		Object.entries( this._data!.markers ).forEach( ( [ markerName, markerOptions ] ) => {
			const { document } = editor.model;
			const {
				rangeJSON: { start, end },
				...options
			} = markerOptions;

			const root = document.getRoot( start.root )!;
			const startPosition = writer.createPositionFromPath( root, start.path, start.stickiness );
			const endPosition = writer.createPositionFromPath( root, end.path, end.stickiness );

			const range = writer.createRange( startPosition, endPosition );

			writer.addMarker( markerName, {
				range,
				...options
			} );
		} );
	}

	/**
	 * Restores the editor collaboration data - comment threads and suggestions.
	 */
	private _restoreCollaborationData() {
		// `as any` to avoid linking from external private repo.
		const parsedCommentThreads: Array<any> = JSON.parse( this._data.commentThreads );
		const parsedSuggestions: Array<any> = JSON.parse( this._data.suggestions );

		if ( this.editor!.plugins.has( 'CommentsRepository' ) ) {
			const commentsRepository = this.editor!.plugins.get( 'CommentsRepository' ) as any;

			// First, remove the existing comments that were created by integration plugins during initialization.
			// These comments may be outdated, and new instances will be created in the next step based on the saved data.
			for ( const commentThread of commentsRepository.getCommentThreads() ) {
				// Use the internal API since it removes the comment thread directly and does not trigger events
				// that could cause side effects, such as removing markers.
				commentsRepository._removeCommentThread( { threadId: commentThread.id } );
			}

			parsedCommentThreads.forEach( commentThreadData => {
				const channelId = this.editor.config.get( 'collaboration.channelId' )!;
				const commentsRepository = this.editor!.plugins.get( 'CommentsRepository' ) as any;

				commentsRepository.addCommentThread( { channelId, ...commentThreadData } );
			} );
		}

		if ( this.editor!.plugins.has( 'TrackChangesEditing' ) ) {
			const trackChangesEditing = this.editor!.plugins.get( 'TrackChangesEditing' ) as any;

			// First, remove the existing suggestions that were created by integration plugins during initialization.
			// These suggestions may be outdated, and new instances will be created in the next step based on the saved data.
			for ( const suggestion of trackChangesEditing.getSuggestions() ) {
				trackChangesEditing._removeSuggestion( suggestion );
			}

			parsedSuggestions.forEach( suggestionData => {
				trackChangesEditing.addSuggestionData( suggestionData );
			} );
		}
	}
}

/**
 * @internal
 */
export type EditorData = {
	roots: Record<string, {
		content: string;
		attributes: string;
		isLoaded: boolean;
	}>;
	markers: Record<string, {
		rangeJSON: { start: any; end: any };
		usingOperation: boolean;
		affectsData: boolean;
	}>;
	commentThreads: string;
	suggestions: string;
};

/**
 * Fired after the watchdog restarts the error in case of a crash.
 *
 * @eventName ~EditorWatchdog#restart
 */
export type EditorWatchdogRestartEvent = {
	name: 'restart';
	args: [];
	return: undefined;
};

export type EditorWatchdogCreatorFunction<TEditor = Editor> = (
	elementOrData: HTMLElement | string | Record<string, string> | Record<string, HTMLElement> | undefined,
	config: EditorConfig
) => Promise<TEditor>;

/**
 * An alias for `isElement` from `es-toolkit/compat` with additional type guard.
 */
function isElement( value: any ): value is Element {
	return _isElement( value );
}
