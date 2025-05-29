/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/contextwatchdog
 */

import Watchdog, { type WatchdogConfig, type WatchdogState } from './watchdog.js';
import EditorWatchdog, { type EditorCreatorFunction } from './editorwatchdog.js';
import areConnectedThroughProperties from './utils/areconnectedthroughproperties.js';
import getSubNodes from './utils/getsubnodes.js';
import type { ArrayOrItem, CKEditorError } from '@ckeditor/ckeditor5-utils';
import type { Context, Editor, EditorConfig, ContextConfig } from '@ckeditor/ckeditor5-core';

const mainQueueId = Symbol( 'MainQueueId' );

/**
 * A watchdog for the {@link module:core/context~Context} class.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export default class ContextWatchdog<TContext extends Context = Context> extends Watchdog {
	/**
	 * A map of internal watchdogs for added items.
	 */
	protected _watchdogs = new Map<string, EditorWatchdog>();

	/**
	 * The watchdog configuration.
	 */
	private readonly _watchdogConfig: WatchdogConfig;

	/**
	 * The current context instance.
	 */
	private _context: TContext | null = null;

	/**
	 * Context properties (nodes/references) that are gathered during the initial context creation
	 * and are used to distinguish the origin of an error.
	 */
	private _contextProps = new Set<unknown>();

	/**
	 * An action queue, which is used to handle async functions queuing.
	 */
	private _actionQueues = new ActionQueues();

	/**
	 * The configuration for the {@link module:core/context~Context}.
	 */
	private _contextConfig?: ContextConfig;

	/**
	 * The creation method.
	 *
	 * @see #setCreator
	 */
	declare protected _creator: ( config: ContextConfig ) => Promise<TContext>;

	/**
	 * The destruction method.
	 *
	 * @see #setDestructor
	 */
	declare protected _destructor: ( context: Context ) => Promise<unknown>;

	/**
	 * The watched item.
	 */
	public _item: unknown;

	/**
	 * The context watchdog class constructor.
	 *
	 * ```ts
	 * const watchdog = new ContextWatchdog( Context );
	 *
	 * await watchdog.create( contextConfiguration );
	 *
	 * await watchdog.add( item );
	 * ```
	 *
	 * See the {@glink features/watchdog Watchdog feature guide} to learn more how to use this feature.
	 *
	 * @param Context The {@link module:core/context~Context} class.
	 * @param watchdogConfig The watchdog configuration.
	 */
	constructor(
		Context: { create( ...args: any ): Promise<TContext> },
		watchdogConfig: WatchdogConfig = {}
	) {
		super( watchdogConfig );

		this._watchdogConfig = watchdogConfig;

		// Default creator and destructor.
		this._creator = contextConfig => Context.create( contextConfig );
		this._destructor = context => context.destroy();

		this._actionQueues.onEmpty( () => {
			if ( this.state === 'initializing' ) {
				this.state = 'ready';
				this._fire( 'stateChange' );
			}
		} );
	}

	/**
	 * Sets the function that is responsible for the context creation.
	 * It expects a function that should return a promise (or `undefined`).
	 *
	 * ```ts
	 * watchdog.setCreator( config => Context.create( config ) );
	 * ```
	 */
	public setCreator( creator: ( config: ContextConfig ) => Promise<TContext> ): void {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for the context destruction.
	 * Overrides the default destruction function, which destroys only the context instance.
	 * It expects a function that should return a promise (or `undefined`).
	 *
	 * ```ts
	 * watchdog.setDestructor( context => {
	 * 	// Do something before the context is destroyed.
	 *
	 * 	return context
	 * 		.destroy()
	 * 		.then( () => {
	 * 			// Do something after the context is destroyed.
	 * 		} );
	 * } );
	 * ```
	 */
	public setDestructor( destructor: ( context: Context ) => Promise<unknown> ): void {
		this._destructor = destructor;
	}

	/**
	 * The context instance. Keep in mind that this property might be changed when the context watchdog restarts,
	 * so do not keep this instance internally. Always operate on the `ContextWatchdog#context` property.
	 */
	public get context(): Context | null {
		return this._context;
	}

	/**
	 * Initializes the context watchdog. Once it is created, the watchdog takes care about
	 * recreating the context and the provided items, and starts the error handling mechanism.
	 *
	 * ```ts
	 * await watchdog.create( {
	 * 	plugins: []
	 * } );
	 * ```
	 *
	 * @param contextConfig The context configuration. See {@link module:core/context~Context}.
	 */
	public create( contextConfig: ContextConfig = {} ): Promise<unknown> {
		return this._actionQueues.enqueue( mainQueueId, () => {
			this._contextConfig = contextConfig;

			return this._create();
		} );
	}

	/**
	 * Returns an item instance with the given `itemId`.
	 *
	 * ```ts
	 * const editor1 = watchdog.getItem( 'editor1' );
	 * ```
	 *
	 * @param itemId The item ID.
	 * @returns The item instance or `undefined` if an item with a given ID has not been found.
	 */
	public getItem( itemId: string ): unknown {
		const watchdog = this._getWatchdog( itemId );

		return watchdog._item;
	}

	/**
	 * Gets the state of the given item. See {@link #state} for a list of available states.
	 *
	 * ```ts
	 * const editor1State = watchdog.getItemState( 'editor1' );
	 * ```
	 *
	 * @param itemId Item ID.
	 * @returns The state of the item.
	 */
	public getItemState( itemId: string ): WatchdogState {
		const watchdog = this._getWatchdog( itemId );

		return watchdog.state;
	}

	/**
	 * Adds items to the watchdog. Once created, instances of these items will be available using the {@link #getItem} method.
	 *
	 * Items can be passed together as an array of objects:
	 *
	 * ```ts
	 * await watchdog.add( [ {
	 * 	id: 'editor1',
	 * 	type: 'editor',
	 * 	sourceElementOrData: document.querySelector( '#editor' ),
	 * 	config: {
	 * 		plugins: [ Essentials, Paragraph, Bold, Italic ],
	 * 		toolbar: [ 'bold', 'italic', 'alignment' ]
	 * 	},
	 * 	creator: ( element, config ) => ClassicEditor.create( element, config )
	 * } ] );
	 * ```
	 *
	 * Or one by one as objects:
	 *
	 * ```ts
	 * await watchdog.add( {
	 * 	id: 'editor1',
	 * 	type: 'editor',
	 * 	sourceElementOrData: document.querySelector( '#editor' ),
	 * 	config: {
	 * 		plugins: [ Essentials, Paragraph, Bold, Italic ],
	 * 		toolbar: [ 'bold', 'italic', 'alignment' ]
	 * 	},
	 * 	creator: ( element, config ) => ClassicEditor.create( element, config )
	 * ] );
	 * ```
	 *
	 * Then an instance can be retrieved using the {@link #getItem} method:
	 *
	 * ```ts
	 * const editor1 = watchdog.getItem( 'editor1' );
	 * ```
	 *
	 * Note that this method can be called multiple times, but for performance reasons it is better
	 * to pass all items together.
	 *
	 * @param itemConfigurationOrItemConfigurations An item configuration object or an array of item configurations.
	 */
	public add( itemConfigurationOrItemConfigurations: ArrayOrItem<WatchdogItemConfiguration> ): Promise<unknown> {
		const itemConfigurations = toArray( itemConfigurationOrItemConfigurations );

		return Promise.all( itemConfigurations.map( item => {
			return this._actionQueues.enqueue( item.id, () => {
				if ( this.state === 'destroyed' ) {
					throw new Error( 'Cannot add items to destroyed watchdog.' );
				}

				if ( !this._context ) {
					throw new Error( 'Context was not created yet. You should call the `ContextWatchdog#create()` method first.' );
				}

				let watchdog: EditorWatchdog;

				if ( this._watchdogs.has( item.id ) ) {
					throw new Error( `Item with the given id is already added: '${ item.id }'.` );
				}

				if ( item.type === 'editor' ) {
					watchdog = new EditorWatchdog( null, this._watchdogConfig );
					watchdog.setCreator( item.creator );
					watchdog._setExcludedProperties( this._contextProps );

					if ( item.destructor ) {
						watchdog.setDestructor( item.destructor );
					}

					this._watchdogs.set( item.id, watchdog );

					// Enqueue the internal watchdog errors within the main queue.
					// And propagate the internal `error` events as `itemError` event.
					watchdog.on( 'error', ( evt, { error, causesRestart } ) => {
						this._fire( 'itemError', { itemId: item.id, error } );

						// Do not enqueue the item restart action if the item will not restart.
						if ( !causesRestart ) {
							return;
						}

						this._actionQueues.enqueue( item.id, () => new Promise<void>( res => {
							const rethrowRestartEventOnce = () => {
								watchdog.off( 'restart', rethrowRestartEventOnce );

								this._fire( 'itemRestart', { itemId: item.id } );

								res();
							};

							watchdog.on( 'restart', rethrowRestartEventOnce );
						} ) );
					} );

					return watchdog.create( item.sourceElementOrData, item.config, this._context );
				} else {
					throw new Error( `Not supported item type: '${ item.type }'.` );
				}
			} );
		} ) );
	}

	/**
	 * Removes and destroys item(s) with given ID(s).
	 *
	 * ```ts
	 * await watchdog.remove( 'editor1' );
	 * ```
	 *
	 * Or
	 *
	 * ```ts
	 * await watchdog.remove( [ 'editor1', 'editor2' ] );
	 * ```
	 *
	 * @param itemIdOrItemIds Item ID or an array of item IDs.
	 */
	public remove( itemIdOrItemIds: ArrayOrItem<string> ): Promise<unknown> {
		const itemIds = toArray( itemIdOrItemIds );

		return Promise.all( itemIds.map( itemId => {
			return this._actionQueues.enqueue( itemId, () => {
				const watchdog = this._getWatchdog( itemId );

				this._watchdogs.delete( itemId );

				return watchdog.destroy();
			} );
		} ) );
	}

	/**
	 * Destroys the context watchdog and all added items.
	 * Once the context watchdog is destroyed, new items cannot be added.
	 *
	 * ```ts
	 * await watchdog.destroy();
	 * ```
	 */
	public override destroy(): Promise<unknown> {
		return this._actionQueues.enqueue( mainQueueId, () => {
			this.state = 'destroyed';
			this._fire( 'stateChange' );

			super.destroy();

			return this._destroy();
		} );
	}

	/**
	 * Restarts the context watchdog.
	 */
	protected _restart(): Promise<unknown> {
		return this._actionQueues.enqueue( mainQueueId, () => {
			this.state = 'initializing';
			this._fire( 'stateChange' );

			return this._destroy()
				.catch( err => {
					console.error( 'An error happened during destroying the context or items.', err );
				} )
				.then( () => this._create() )
				.then( () => this._fire( 'restart' ) );
		} );
	}

	/**
	 * Initializes the context watchdog.
	 */
	private _create(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this._startErrorHandling();

				return this._creator( this._contextConfig! );
			} )
			.then( context => {
				this._context = context;
				this._contextProps = getSubNodes( this._context );

				return Promise.all(
					Array.from( this._watchdogs.values() )
						.map( watchdog => {
							watchdog._setExcludedProperties( this._contextProps );

							return watchdog.create( undefined, undefined, this._context! );
						} )
				);
			} );
	}

	/**
	 * Destroys the context instance and all added items.
	 */
	private _destroy(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this._stopErrorHandling();

				const context = this._context!;

				this._context = null;
				this._contextProps = new Set();

				return Promise.all(
					Array.from( this._watchdogs.values() )
						.map( watchdog => watchdog.destroy() )
				)
					// Context destructor destroys each editor.
					.then( () => this._destructor( context ) );
			} );
	}

	/**
	 * Returns the watchdog for a given item ID.
	 *
	 * @param itemId Item ID.
	 */
	protected _getWatchdog( itemId: string ): Watchdog {
		const watchdog = this._watchdogs.get( itemId );

		if ( !watchdog ) {
			throw new Error( `Item with the given id was not registered: ${ itemId }.` );
		}

		return watchdog;
	}

	/**
	 * Checks whether an error comes from the context instance and not from the item instances.
	 *
	 * @internal
	 */
	public _isErrorComingFromThisItem( error: CKEditorError ): boolean {
		for ( const watchdog of this._watchdogs.values() ) {
			if ( watchdog._isErrorComingFromThisItem( error ) ) {
				return false;
			}
		}

		return areConnectedThroughProperties( this._context, error.context );
	}
}

/**
 * Fired after the watchdog restarts the context and the added items because of a crash.
 *
 * ```ts
 * watchdog.on( 'restart', () => {
 * 	console.log( 'The context has been restarted.' );
 * } );
 * ```
 *
 * @eventName ~ContextWatchdog#restart
 */
export type ContextWatchdogRestartEvent = {
	name: 'restart';
	args: [];
	return: undefined;
};

/**
 * Fired when a new error occurred in one of the added items.
 *
 * ```ts
 * watchdog.on( 'itemError', ( evt, { error, itemId } ) => {
 * 	console.log( `An error occurred in an item with the '${ itemId }' ID.` );
 * } );
 * ```
 *
 * @eventName ~ContextWatchdog#itemError
 */
export type ContextWatchdogItemErrorEvent = {
	name: 'itemError';
	args: [ ContextWatchdogItemErrorEventData ];
	return: undefined;
};

/**
 * The `itemError` event data.
 */
export type ContextWatchdogItemErrorEventData = {
	itemId: string;
	error: Error;
};

/**
 * Fired after an item has been restarted.
 *
 * ```ts
 * 	watchdog.on( 'itemRestart', ( evt, { itemId } ) => {
 *		console.log( 'An item with with the '${ itemId }' ID has been restarted.' );
 * 	} );
 * ```
 *
 * @eventName ~ContextWatchdog#itemRestart
 */
export type ContextWatchdogItemRestartEvent = {
	name: 'itemRestart';
	args: [ ContextWatchdogItemRestartEventData ];
	return: undefined;
};

/**
 * The `itemRestart` event data.
 */
export type ContextWatchdogItemRestartEventData = {
	itemId: string;
};

/**
 * Manager of action queues that allows queuing async functions.
 */
class ActionQueues {
	public _onEmptyCallbacks: Array<() => void> = [];
	public _queues = new Map<symbol | string | number, Promise<unknown>>();
	public _activeActions = 0;

	/**
	 * Used to register callbacks that will be run when the queue becomes empty.
	 *
	 * @param onEmptyCallback A callback that will be run whenever the queue becomes empty.
	 */
	public onEmpty( onEmptyCallback: () => void ): void {
		this._onEmptyCallbacks.push( onEmptyCallback );
	}

	/**
	 * It adds asynchronous actions (functions) to the proper queue and runs them one by one.
	 *
	 * @param queueId The action queue ID.
	 * @param action A function that should be enqueued.
	 */
	public enqueue( queueId: symbol | string | number, action: () => unknown ): Promise<unknown> {
		const isMainAction = queueId === mainQueueId;

		this._activeActions++;

		if ( !this._queues.get( queueId ) ) {
			this._queues.set( queueId, Promise.resolve() );
		}

		// List all sources of actions that the current action needs to await for.
		// For the main action wait for all other actions.
		// For the item action wait only for the item queue and the main queue.
		const awaitedActions = isMainAction ?
			Promise.all( this._queues.values() ) :
			Promise.all( [ this._queues.get( mainQueueId ), this._queues.get( queueId ) ] );

		const queueWithAction = awaitedActions.then( action );

		// Catch all errors in the main queue to stack promises even if an error occurred in the past.
		const nonErrorQueue = queueWithAction.catch( () => {} );

		this._queues.set( queueId, nonErrorQueue );

		return queueWithAction.finally( () => {
			this._activeActions--;

			if ( this._queues.get( queueId ) === nonErrorQueue && this._activeActions === 0 ) {
				this._onEmptyCallbacks.forEach( cb => cb() );
			}
		} );
	}
}

/**
 * Transforms any value to an array. If the provided value is already an array, it is returned unchanged.
 *
 * @param elementOrArray The value to transform to an array.
 * @returns An array created from data.
 */
function toArray<T>( elementOrArray: ArrayOrItem<T> ): Array<T> {
	return Array.isArray( elementOrArray ) ? elementOrArray : [ elementOrArray ];
}

/**
 * The watchdog item configuration interface.
 */
export interface WatchdogItemConfiguration {

	/**
	 * id A unique item identificator.
	 */
	id: string;

	/**
	 * The type of the item to create. At the moment, only `'editor'` is supported.
	 */
	type: 'editor';

	/**
	 * A function that initializes the item (the editor). The function takes editor initialization arguments
	 * and should return a promise. For example: `( el, config ) => ClassicEditor.create( el, config )`.
	 */
	creator: EditorCreatorFunction;

	/**
	 * A function that destroys the item instance (the editor). The function
	 * takes an item and should return a promise. For example: `editor => editor.destroy()`
	 */
	destructor?: ( editor: Editor ) => Promise<unknown>;

	/**
	 * The source element or data that will be passed
	 * as the first argument to the `Editor.create()` method.
	 */
	sourceElementOrData: string | HTMLElement;

	/**
	 * An editor configuration.
 	 */
	config: EditorConfig;
}
