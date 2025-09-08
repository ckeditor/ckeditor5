/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/actionsrecorder
 */

/* istanbul ignore file -- @preserve */

import type {
	Command,
	Editor
} from '@ckeditor/ckeditor5-core';

import type {
	ViewTypeCheckable,
	ModelTypeCheckable
} from '@ckeditor/ckeditor5-engine';

import type {
	ActionsRecorderEntry,
	ActionsRecorderEntryEditorSnapshot,
	ActionsRecorderFilterCallback,
	ActionsRecorderErrorCallback,
	ActionsRecorderMaxEntriesCallback
} from './actionsrecorderconfig.js';

import { isPlainObject } from 'es-toolkit/compat';

/**
 * A plugin that records user actions and editor state changes for debugging purposes. It tracks commands execution, model operations,
 * UI interactions, and document events. It just collects data locally, and does not send it anywhere, integrator is responsible
 * for gathering data from this plugin for further processing.
 *
 * **Important! `ActionsRecorder` is an experimental feature, and may become deprecated.**
 *
 * By default, plugin stores latest 1000 action entries. Integrator can register an `onError` callback to collect those entries
 * in case of exception. Integrator should augment this data with application specific data such as page-id or session-id,
 * depending on the application. Augmented data should be processed by the integrator, for example integrator should send it
 * to some data collecting endpoint for later analysis.
 *
 * Example:
 *
 * ```ts
 * 	ClassicEditor
 * 		.create( editorElement, {
 * 			plugins: [ ActionsRecorder, ... ],
 * 			actionsRecorder: {
 * 				maxEntries: 1000, // This is the default value and could be adjusted.
 *
 * 				onError( error, entries ) {
 * 					console.error( 'ActionsRecorder - Error detected:', error );
 * 					console.warn( 'Actions recorded before error:', entries );
 *
 * 					this.flushEntries();
 *
 * 					// Integrator should send and store the entries. The error is already in the last entry in serializable form.
 * 				}
 * 			}
 * 		} )
 * 		.then( ... )
 * 		.catch( ... );
 * ```
 *
 * Alternatively integrator could continuously collect actions in batches and send them to theirs endpoint for later analysis:
 *
 * ```ts
 * 	ClassicEditor
 * 		.create( editorElement, {
 * 			plugins: [ ActionsRecorder, ... ],
 * 			actionsRecorder: {
 * 				maxEntries: 50, // This is the batch size.
 *
 * 				onMaxEntries() {
 * 					const entries = this.getEntries();
 *
 * 					this.flushEntries();
 *
 * 					console.log( 'ActionsRecorder - Batch of entries:', entries );
 *
 * 					// Integrator should send and store the entries.
 * 				},
 *
 * 				onError( error, entries ) {
 * 					console.error( 'ActionsRecorder - Error detected:', error );
 * 					console.warn( 'Actions recorded before error:', entries );
 *
 * 					this.flushEntries();
 *
 * 					// Integrator should send and store the entries. The error is already in the last entry in serializable form.
 * 				}
 * 			}
 * 		} )
 * 		.then( ... )
 * 		.catch( ... );
 * ```
 *
 * See {@link module:watchdog/actionsrecorderconfig~ActionsRecorderConfig plugin configuration} for more details.
 *
 */
export class ActionsRecorder {
	/**
	 * The editor instance.
	 */
	public readonly editor: Editor;

	/**
	 * Array storing all recorded action entries with their context and state snapshots.
	 */
	private _entries: Array<ActionsRecorderEntry> = [];

	/**
	 * Stack tracking nested action frames to maintain call hierarchy.
	 */
	private _frameStack: Array<ActionsRecorderEntry> = [];

	/**
	 * Set of already reported errors used to notify only once for each error (not on every try-catch nested block).
	 */
	private _errors = new Set<Error>();

	/**
	 * Maximum number of action entries to keep in memory.
	 */
	private _maxEntries: number;

	/**
	 * Error callback.
	 */
	private _errorCallback?: ActionsRecorderErrorCallback;

	/**
	 * Filter function to determine which entries should be stored.
	 */
	private _filterCallback?: ActionsRecorderFilterCallback;

	/**
	 * Callback triggered every time count of recorded entries reaches maxEntries.
	 */
	private _maxEntriesCallback: ActionsRecorderMaxEntriesCallback;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ActionsRecorder' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public constructor( editor: Editor ) {
		this.editor = editor;

		editor.config.define( 'actionsRecorder.maxEntries', 1000 );

		const config = editor.config.get( 'actionsRecorder' )!;

		this._maxEntries = config.maxEntries!;
		this._filterCallback = config.onFilter;
		this._errorCallback = config.onError;
		this._maxEntriesCallback = config.onMaxEntries || this._maxEntriesDefaultHandler;

		this._tapCommands();
		this._tapOperationApply();
		this._tapModelMethods();
		this._tapModelSelection();
		this._tapComponentFactory();
		this._tapViewDocumentEvents();
	}

	/**
	 * Returns all recorded action entries.
	 */
	public getEntries(): Array<ActionsRecorderEntry> {
		// Return a shallow copy instead of reference as this array could be modified.
		return this._entries.slice();
	}

	/**
	 * Flushes all recorded entries.
	 */
	public flushEntries(): void {
		this._entries = [];
	}

	/**
	 * Creates a new action frame and adds it to the recording stack.
	 *
	 * @param action The name/type of the action being recorded.
	 * @param params Optional parameters associated with the event.
	 * @returns The created call frame object.
	 */
	private _enterFrame( action: string, params?: Array<unknown> ): ActionsRecorderEntry {
		const callFrame: ActionsRecorderEntry = {
			timeStamp: new Date().toISOString(),
			...this._frameStack.length && { parentEntry: this._frameStack.at( -1 ) },
			action,
			params: params?.map( param => serializeValue( param ) ),
			before: this._buildStateSnapshot()
		};

		// Apply filter if configured, only add to entries if filter passes.
		if ( !this._filterCallback || this._filterCallback( callFrame, this._entries ) ) {
			// Add the call frame to the entries.
			this._entries.push( callFrame );
		}

		this._frameStack.push( callFrame );

		return callFrame;
	}

	/**
	 * Closes an action frame and records its final state and results.
	 *
	 * @param callFrame The call frame to close.
	 * @param result Optional result value from the action.
	 * @param error Optional error that occurred during the action.
	 */
	private _leaveFrame( callFrame: ActionsRecorderEntry, result?: any, error?: any ): void {
		const topFrame = this._frameStack.pop();

		// Handle scenario when the stack has been cleared in the meantime
		// or the callFrame is not the top frame.
		if ( !topFrame || topFrame !== callFrame ) {
			return;
		}

		if ( result !== undefined ) {
			topFrame.result = serializeValue( result );
		}

		if ( error ) {
			topFrame.error = serializeValue( error );
		}

		topFrame.after = this._buildStateSnapshot();

		if ( error ) {
			this._callErrorCallback( error );
		}

		if ( this._frameStack.length == 0 ) {
			this._errors.clear();
		}

		// Enforce max entries limit after leaving the frame so that complete entry is provided.
		if ( this._entries.length >= this._maxEntries ) {
			this._maxEntriesCallback();
		}
	}

	/**
	 * Builds a snapshot of the current editor state including document version,
	 * read-only status, focus state, and model selection.
	 *
	 * @returns An object containing the current editor state snapshot.
	 */
	private _buildStateSnapshot(): ActionsRecorderEntryEditorSnapshot {
		const { model, isReadOnly, editing } = this.editor;

		return {
			documentVersion: model.document.version,
			editorReadOnly: isReadOnly,
			editorFocused: editing.view.document.isFocused,
			modelSelection: serializeValue( model.document.selection )
		};
	}

	/**
	 * Sets up recording for all editor commands, both existing and future ones.
	 * Taps into the command execution to track when commands are run.
	 */
	private _tapCommands() {
		// Tap already registered commands.
		for ( const [ commandName, command ] of this.editor.commands ) {
			this._tapCommand( commandName, command );
		}

		// Tap commands registered after the constructor was called.
		tapObjectMethod( this.editor.commands, 'add', {
			before: ( callContext, [ commandName, command ] ) => {
				this._tapCommand( commandName, command );

				return false;
			}
		} );
	}

	/**
	 * Sets up recording for model operation applications.
	 * Tracks when operations are applied to the model document.
	 */
	private _tapOperationApply() {
		tapObjectMethod( this.editor.model, 'applyOperation', {
			before: ( callContext, [ operation ] ) => {
				// Ignore operations applied to document fragments.
				if ( operation.baseVersion === null ) {
					return false;
				}

				callContext.callFrame = this._enterFrame( 'model.applyOperation', [ operation ] );

				return true;
			},
			after: callContext => {
				this._leaveFrame( callContext.callFrame );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		} );
	}

	/**
	 * Sets up recording for key model methods like insertContent, insertObject, and deleteContent.
	 * These methods represent high-level model manipulation operations.
	 */
	private _tapModelMethods() {
		for ( const methodName of [ 'insertContent', 'insertObject', 'deleteContent' ] ) {
			tapObjectMethod( this.editor.model, methodName, {
				before: ( callContext, ...params ) => {
					callContext.callFrame = this._enterFrame( `model.${ methodName }`, params );

					return true;
				},
				after: ( callContext, result ) => {
					this._leaveFrame( callContext.callFrame, result );
				},
				error: ( callContext, error ) => {
					this._leaveFrame( callContext.callFrame, undefined, error );
				}
			} );
		}
	}

	/**
	 * Sets up recording for model selection changes.
	 * Tracks when the selection range, attributes, or markers change.
	 */
	private _tapModelSelection() {
		const events = [ 'change:range', 'change:attribute', 'change:marker' ];

		this._tapFireMethod( this.editor.model.document.selection, events, {
			eventSource: 'model-selection'
		} );
	}

	/**
	 * Sets up recording for a specific command execution.
	 *
	 * @param commandName The name of the command to record.
	 * @param command The command instance to tap into.
	 */
	private _tapCommand( commandName: string, command: Command ) {
		tapObjectMethod( command, 'execute', {
			before: ( callContext, params ) => {
				callContext.callFrame = this._enterFrame( `commands.${ commandName }:execute`, params );

				return true;
			},
			after: ( callContext, result ) => {
				this._leaveFrame( callContext.callFrame, result );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		} );
	}

	/**
	 * Sets up recording for UI component factory creation and component interactions.
	 * Tracks when components are created and their execute events.
	 */
	private _tapComponentFactory() {
		tapObjectMethod( this.editor.ui.componentFactory, 'create', {
			before: ( callContext, [ componentName ] ) => {
				callContext.componentName = componentName;
				callContext.callFrame = this._enterFrame( `component-factory.create:${ componentName }` );

				return true;
			},
			after: ( callContext, componentInstance ) => {
				const executeContext = {
					...callContext,
					eventSource: `component.${ callContext.componentName }`
				};

				if ( typeof componentInstance.fire == 'function' ) {
					this._tapFireMethod( componentInstance, [ 'execute' ], executeContext );
				}

				if ( typeof componentInstance.panelView?.fire == 'function' ) {
					this._tapFireMethod( componentInstance.panelView, [ 'execute' ], executeContext );
				}

				if ( typeof componentInstance.buttonView?.actionView?.fire == 'function' ) {
					this._tapFireMethod( componentInstance.buttonView.actionView, [ 'execute' ], executeContext );
				}

				this._leaveFrame( callContext.callFrame );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		} );
	}

	/**
	 * Sets up recording for view document events like clicks, keyboard input,
	 * selection changes, and other user interactions.
	 */
	private _tapViewDocumentEvents() {
		const events = [
			'click',
			'mousedown',
			'mouseup',
			'pointerdown',
			'pointerup',
			'focus',
			'blur',

			'keydown',
			'keyup',
			'selectionChange',
			'compositionstart',
			'compositionend',
			'beforeinput',
			'mutations',
			'enter',
			'delete',
			'insertText',

			'paste',
			'copy',
			'cut',
			'dragstart',
			'drop'
		];

		this._tapFireMethod( this.editor.editing.view.document, events, { eventSource: 'observers' } );
	}

	/**
	 * Sets up recording for specific events fired by an emitter object.
	 *
	 * @param emitter The object that fires events to be recorded.
	 * @param eventNames Array of event names to record.
	 * @param context Additional context to include with recorded events.
	 */
	private _tapFireMethod( emitter: any, eventNames: Array<string>, context: Record<string, any> = {} ) {
		tapObjectMethod( emitter, 'fire', {
			before: ( callContext, [ eventInfoOrName, ...params ] ) => {
				const eventName = typeof eventInfoOrName == 'string' ? eventInfoOrName : eventInfoOrName.name;

				if ( !eventNames.includes( eventName ) ) {
					return false;
				}

				callContext.callFrame = this._enterFrame( `${ callContext.eventSource }:${ eventName }`, params );

				return true;
			},
			after: ( callContext, result ) => {
				this._leaveFrame( callContext.callFrame, result );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		}, context );
	}

	/**
	 * Triggers error callback.
	 */
	private _callErrorCallback( error?: any ): void {
		if ( !this._errorCallback || this._errors.has( error ) ) {
			return;
		}

		this._errors.add( error );

		try {
			// Provide a shallow copy of entries as it might be modified before error handler serializes it.
			this._errorCallback( error, this.getEntries() );
		} catch ( observerError ) {
			// Silently catch observer errors to prevent them from affecting the recording.
			console.error( 'ActionsRecorder onError callback error:', observerError );
		}
	}

	/**
	 * The default handler for maxEntries callback.
	 */
	private _maxEntriesDefaultHandler() {
		this._entries.shift();
	}
}

/**
 * Creates a wrapper around a method to record its calls, results, and errors.
 *
 * @internal
 *
 * @param object The object containing the method to tap.
 * @param methodName The name of the method to tap.
 * @param tap The tap configuration with before/after/error hooks.
 * @param context Additional context to include with the method calls.
 */
export function tapObjectMethod(
	object: any,
	methodName: string,
	tap: MethodTap,
	context: Record<string, any> = {}
): void {
	const originalMethod = object[ methodName ];

	if ( originalMethod[ Symbol.for( 'Tapped method' ) ] ) {
		return;
	}

	object[ methodName ] = ( ...args: Array<any> ) => {
		const callContext = Object.assign( {}, context );
		let shouldHandle;

		try {
			shouldHandle = tap.before?.( callContext, args );

			const result = originalMethod.apply( object, args );

			if ( shouldHandle ) {
				tap.after?.( callContext, result );
			}

			return result;
		} catch ( error ) {
			if ( shouldHandle ) {
				tap.error?.( callContext, error );
			}

			throw error;
		}
	};

	object[ methodName ][ Symbol.for( 'Tapped method' ) ] = originalMethod;
}

/**
 * Represents a method tap with optional hooks for before, after, and error handling.
 */
interface MethodTap extends Record<string, any> {

	/**
	 * Hook called before the original method execution.
	 *
	 * @param context The call context object for storing state between hooks.
	 * @param args The arguments passed to the original method.
	 * @returns True if the method call should be recorded, false to ignore it.
	 */
	before?: ( context: Record<string, any>, args: Array<any> ) => boolean;

	/**
	 * Hook called after successful method execution.
	 *
	 * @param context The call context object with state from the before hook.
	 * @param result The result returned by the original method.
	 */
	after?: ( context: Record<string, any>, result: any ) => void;

	/**
	 * Hook called when the method execution throws an error.
	 *
	 * @param context The call context object with state from the before hook.
	 * @param error The error thrown by the original method.
	 */
	error?: ( context: Record<string, any>, error: any ) => void;
}

/**
 * Serializes a value into a JSON-serializable format.
 *
 * @internal
 *
 * @param value The value to serialize.
 * @param visited Set of already serialized objects to avoid circular references.
 * @returns A JSON-serializable representation of the value.
 */
export function serializeValue( value: any, visited = new WeakSet() ): any {
	if ( !value || [ 'boolean', 'number', 'string' ].includes( typeof value ) ) {
		return value;
	}

	if ( typeof value.toJSON == 'function' ) {
		const jsonData = value.toJSON();

		// Make sure that toJSON returns plain object, otherwise it could be just a clone with circular references.
		if ( isPlainObject( jsonData ) || Array.isArray( jsonData ) || [ 'string', 'number', 'boolean' ].includes( typeof jsonData ) ) {
			return serializeValue( jsonData, visited );
		}
	}

	if ( value instanceof Error ) {
		return {
			name: value.name,
			message: value.message,
			stack: value.stack
		};
	}

	// Most TypeCheckable should implement toJSON method so this is a fallback for other TypeCheckable objects.
	if ( isTypeCheckable( value ) || typeof value != 'object' ) {
		return {
			type: typeof value,
			constructor: value.constructor?.name || 'unknown',
			string: String( value )
		};
	}

	if ( value instanceof File || value instanceof Blob || value instanceof FormData || value instanceof DataTransfer ) {
		return String( value );
	}

	if ( visited.has( value ) ) {
		return;
	}

	visited.add( value );

	// Arrays.
	if ( Array.isArray( value ) ) {
		return value.length ? value.map( item => serializeValue( item, visited ) ) : undefined;
	}

	// Other objects (plain, instances of classes, or events).
	const result: Record<string, any> = {};
	const ignoreFields: Array<string> = [];

	// DOM event additional fields.
	if ( value.domEvent ) {
		ignoreFields.push( 'domEvent', 'domTarget', 'view', 'document' );

		result.domEvent = serializeDomEvent( value.domEvent );
		result.target = serializeValue( value.target );

		if ( value.dataTransfer ) {
			result.dataTransfer = {
				types: value.dataTransfer.types,
				htmlData: value.dataTransfer.getData( 'text/html' ),
				files: serializeValue( value.dataTransfer.files )
			};
		}
	}

	// Other object types.
	for ( const [ key, val ] of Object.entries( value ) ) {
		// Ignore private fields, DOM events serialized above, and decorated methods.
		if ( key.startsWith( '_' ) || ignoreFields.includes( key ) || typeof val == 'function' ) {
			continue;
		}

		const serializedValue = serializeValue( val, visited );

		if ( serializedValue !== undefined ) {
			result[ key ] = serializedValue;
		}
	}

	if ( Symbol.iterator in value ) {
		const items = Array.from( value[ Symbol.iterator ]() ).map( item => serializeValue( item, visited ) );

		if ( items.length ) {
			result._items = items;
		}
	}

	return Object.keys( result ).length ? result : undefined;
}

/**
 * Serializes a DOM event into a plain object representation.
 *
 * Extracts common properties from DOM events such as type, target information,
 * coordinates, key codes, and other relevant event data for debugging purposes.
 *
 * @param event The DOM event to serialize.
 * @returns A serialized object containing the event's key properties.
 */
function serializeDomEvent( event: Event ): any {
	let serialized: Record<string, any> = {
		type: event.type,
		target: serializeDOMTarget( event.target )
	};

	// Add mouse event properties.
	if ( event instanceof MouseEvent ) {
		serialized = {
			...serialized,
			button: event.button,
			buttons: event.buttons,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey
		};
	}

	// Add keyboard event properties.
	if ( event instanceof KeyboardEvent ) {
		serialized = {
			...serialized,
			key: event.key,
			code: event.code,
			keyCode: event.keyCode,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			repeat: event.repeat
		};
	}

	// Add input event properties.
	if ( event instanceof InputEvent ) {
		serialized = {
			...serialized,
			data: event.data,
			inputType: event.inputType,
			isComposing: event.isComposing
		};
	}

	// Add pointer event properties.
	if ( event instanceof PointerEvent ) {
		serialized = {
			...serialized,
			isPrimary: event.isPrimary
		};
	}

	/**
	 * Serializes a DOM event target into a plain object representation.
	 *
	 * @param target The DOM event target to serialize.
	 * @returns A serialized object containing the target's information.
	 */
	function serializeDOMTarget( target: EventTarget | null ) {
		if ( !target ) {
			return null;
		}

		if ( target instanceof Element ) {
			return {
				tagName: target.tagName,
				className: target.className,
				id: target.id
			};
		}

		if ( target instanceof Window || target instanceof Document ) {
			return {
				type: target.constructor.name
			};
		}

		return {};
	}

	return serialized;
}

/**
 * Checks if a value is type-checkable, meaning it has an `is` method.
 */
function isTypeCheckable( value: any ): value is ViewTypeCheckable & ModelTypeCheckable {
	return value && typeof value.is === 'function';
}
