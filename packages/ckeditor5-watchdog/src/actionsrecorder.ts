/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import {
	Plugin,
	type Command,
	type Editor
} from '@ckeditor/ckeditor5-core';

import type {
	ModelDocumentSelection,
	ModelSelection,
	Marker,
	ViewTypeCheckable,
	ModelTypeCheckable
} from '@ckeditor/ckeditor5-engine';

import type {
	ActionEntry, ActionEntryEditorSnapshot,
	RecordActionCallback, RecordFilterCallback
} from './actionsrecorderconfig.js';

/**
 * A plugin that records user actions and editor state changes for debugging purposes.
 * It tracks commands execution, model operations, UI interactions, and document events.
 */
export class ActionsRecorder extends Plugin {
	/**
	 * Array storing all recorded action entries with their context and state snapshots.
	 */
	private _entries: Array<ActionEntry> = [];

	/**
	 * Stack tracking nested action frames to maintain call hierarchy.
	 */
	private _frameStack: Array<ActionEntry> = [];

	/**
	 * Maximum number of action entries to keep in memory.
	 */
	private _maxEntries: number;

	/**
	 * Set of observer callbacks that get notified when new records are added.
	 */
	private _observers: Set<RecordActionCallback> = new Set();

	/**
	 * Filter function to determine which records should be stored.
	 */
	private _filter?: RecordFilterCallback;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ActionsRecorder' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'actionsRecorder.isEnabled', true );
		editor.config.define( 'actionsRecorder.maxEntries', 1000 );

		const config = editor.config.get( 'actionsRecorder' )!;

		this._maxEntries = config.maxEntries!;
		this._filter = config.onFilter;

		// Register initial callback from config if provided
		if ( config.onRecord ) {
			this._observers.add( config.onRecord );
		}

		if ( !config.isEnabled ) {
			return;
		}

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
	public getRecords(): Array<ActionEntry> {
		return this._entries;
	}

	/**
	 * Flushes all recorded entries and clears the frame stack.
	 */
	public flushRecords(): void {
		this._entries = [];
		this._frameStack = [];
	}

	/**
	 * Registers an observer callback that will be called whenever a new action record is created.
	 *
	 * @param callback - The callback function to register.
	 * @returns A function that can be called to unregister the observer.
	 */
	public observeRecords( callback: ( record: ActionEntry ) => void ): () => void {
		this._observers.add( callback );

		return this.unobserveRecords.bind( this, callback );
	}

	/**
	 * Unregisters an observer callback.
	 *
	 * @param callback - The callback function to unregister.
	 */
	public unobserveRecords( callback: ( record: ActionEntry ) => void ): void {
		this._observers.delete( callback );
	}

	/**
	 * Creates a new action frame and adds it to the recording stack.
	 *
	 * @param event - The name/type of the event being recorded.
	 * @param params - Optional parameters associated with the event.
	 * @returns The created call frame object.
	 */
	private _enterFrame( event: string, params?: Array<unknown> ): ActionEntry {
		const callFrame: ActionEntry = {
			timeStamp: new Date().toISOString(),
			...this._frameStack.length && { parentFrame: this._frameStack.at( -1 ) },
			event,
			params: params?.map( param => serializeValue( param ) ),
			before: this._buildStateSnapshot()
		};

		// Notify observers about the new record
		this._notifyObservers( callFrame );

		// Apply filter if configured, only add to entries if filter passes
		if ( !this._filter || this._filter( callFrame ) ) {
			this._entries.push( callFrame );

			// Enforce max entries limit.
			if ( this._entries.length > this._maxEntries ) {
				this._entries.shift();
			}
		}

		this._frameStack.push( callFrame );

		return callFrame;
	}

	/**
	 * Closes an action frame and records its final state and results.
	 *
	 * @param callFrame - The call frame to close.
	 * @param result - Optional result value from the action.
	 * @param error - Optional error that occurred during the action.
	 */
	private _leaveFrame( callFrame: ActionEntry, result?: any, error?: any ): void {
		const topFrame = this._frameStack.pop();

		// Handle scenario when the stack has been cleared in the meantime.
		if ( !topFrame ) {
			return;
		}

		if ( topFrame !== callFrame ) {
			console.error( 'This should never happen' );
		}

		if ( result !== undefined ) {
			topFrame.result = serializeValue( result );
		}

		if ( error ) {
			topFrame.error = error;
		}

		topFrame.after = this._buildStateSnapshot();
	}

	/**
	 * Builds a snapshot of the current editor state including document version,
	 * read-only status, focus state, and model selection.
	 *
	 * @returns An object containing the current editor state snapshot.
	 */
	private _buildStateSnapshot(): ActionEntryEditorSnapshot {
		const { model, isReadOnly, editing } = this.editor;

		return {
			documentVersion: model.document.version,
			editorReadOnly: isReadOnly,
			editorFocused: editing.view.document.isFocused,
			modelSelection: serializeModelSelection( model.document.selection )
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
			}, { source: 'model' } );
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
	 * @param commandName - The name of the command to record.
	 * @param command - The command instance to tap into.
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
			'drop',
			'imageLoaded',
			'todoCheckboxChange'
		];

		this._tapFireMethod( this.editor.editing.view.document, events, { eventSource: 'observers' } );
	}

	/**
	 * Sets up recording for specific events fired by an emitter object.
	 *
	 * @param emitter - The object that fires events to be recorded.
	 * @param eventNames - Array of event names to record.
	 * @param context - Additional context to include with recorded events.
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
	 * Notifies all registered observers about a new action record.
	 *
	 * @param record - The action record to notify observers about.
	 */
	private _notifyObservers( record: ActionEntry ): void {
		for ( const observer of this._observers ) {
			try {
				observer( record, this._entries );
			} catch ( error ) {
				// Silently catch observer errors to prevent them from affecting the recording
				console.error( 'ActionsRecorder observer error:', error );
			}
		}
	}
}

/**
 * Creates a wrapper around a method to record its calls, results, and errors.
 *
 * @param object - The object containing the method to tap.
 * @param methodName - The name of the method to tap.
 * @param tap - The tap configuration with before/after/error hooks.
 * @param context - Additional context to include with the method calls.
 */
function tapObjectMethod(
	object: any,
	methodName: string,
	tap: MethodTap,
	context: Record<string, any> = {}
) {
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
	 * @param context - The call context object for storing state between hooks.
	 * @param args - The arguments passed to the original method.
	 * @returns True if the method call should be recorded, false to ignore it.
	 */
	before?: ( context: Record<string, any>, args: Array<any> ) => boolean;

	/**
	 * Hook called after successful method execution.
	 *
	 * @param context - The call context object with state from the before hook.
	 * @param result - The result returned by the original method.
	 */
	after?: ( context: Record<string, any>, result: any ) => void;

	/**
	 * Hook called when the method execution throws an error.
	 *
	 * @param context - The call context object with state from the before hook.
	 * @param error - The error thrown by the original method.
	 */
	error?: ( context: Record<string, any>, error: any ) => void;
}

/**
 * Serializes a value into a JSON-serializable format.
 *
 * @param value The value to serialize.
 * @returns A JSON-serializable representation of the value.
 */
function serializeValue( value: any ): any {
	if ( !value || [ 'boolean', 'number', 'string' ].includes( typeof value ) ) {
		return value;
	}

	if ( typeof value.toJSON == 'function' ) {
		return value.toJSON();
	}

	if ( isTypeCheckable( value ) ) {
		switch ( true ) {
			case value.is( 'model:documentSelection' ):
			case value.is( 'model:selection' ):
				return serializeModelSelection( value );

			default:
				return {
					name: ( value as any ).name || value.constructor?.name || 'unknown'
				};
		}
	}

	if ( typeof value == 'object' ) {
		if ( Array.isArray( value ) ) {
			return value.map( serializeValue );
		}

		if ( value.domEvent ) {
			return serializeDomEvent( value.domEvent );
		}

		const entries = Object.entries( value ).map( ( [ key, value ] ) => [ key, serializeValue( value ) ] );

		return Object.fromEntries( entries );
	}

	// Handle other unknown types by returning their type and string representation
	return {
		type: typeof value,
		constructor: value.constructor?.name || 'unknown',
		string: String( value )
	};
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
		timeStamp: event.timeStamp,
		bubbles: event.bubbles,
		cancelable: event.cancelable,
		defaultPrevented: event.defaultPrevented,
		target: serializeDOMTarget( event.target ),
		currentTarget: serializeDOMTarget( event.currentTarget )
	};

	// Add mouse event properties
	if ( event instanceof MouseEvent ) {
		serialized = {
			...serialized,
			button: event.button,
			buttons: event.buttons,
			clientX: event.clientX,
			clientY: event.clientY,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey
		};
	}

	// Add keyboard event properties
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

	// Add input event properties
	if ( event instanceof InputEvent ) {
		serialized = {
			...serialized,
			data: event.data,
			inputType: event.inputType,
			isComposing: event.isComposing
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
 * Serializes a model selection into a plain object representation.
 *
 * Converts the selection's ranges, attributes, and markers (if present) into a JSON-serializable format.
 * For document selections, also includes any associated markers.
 *
 * @param selection The model selection to serialize, either a document selection or regular model selection.
 * @returns A serialized object containing ranges, attributes (if any), and markers (if any for document selections).
 */
function serializeModelSelection( selection: ModelDocumentSelection | ModelSelection ) {
	const serializedRanges = Array.from( selection.getRanges() ).map( range => range.toJSON() );
	const serializedAttributes = Object.fromEntries( selection.getAttributes() );
	const serializedMarkers = selection.is( 'documentSelection' ) && (
		Array.from( selection.markers || [] ).map( marker => serializeModelMarker( marker ) )
	);

	return {
		ranges: serializedRanges,

		...( Object.keys( serializedAttributes ).length && {
			attributes: serializedAttributes
		} ),

		...( serializedMarkers && serializedMarkers.length && {
			markers: serializedMarkers
		} )
	};
}

/**
 * Serializes a model marker into a plain object representation.
 *
 * @param marker The model marker to serialize.
 * @returns A serialized object containing the marker's name and range.
 */
function serializeModelMarker( marker: Marker ) {
	return {
		name: marker.name,
		range: marker.getRange().toJSON()
	};
}

/**
 * Checks if a value is type-checkable, meaning it has an `is` method.
 */
function isTypeCheckable( value: any ): value is ViewTypeCheckable & ModelTypeCheckable {
	return value && typeof value.is === 'function';
}
