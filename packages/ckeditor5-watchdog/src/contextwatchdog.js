/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/contextwatchdog
 */

/* globals console */

import Watchdog from './watchdog';
import EditorWatchdog from './editorwatchdog';
import areConnectedThroughProperties from './utils/areconnectedthroughproperties';
import getSubNodes from './utils/getsubnodes';

const mainQueueId = Symbol( 'MainQueueId' );

/**
 * A watchdog for the {@link module:core/context~Context} class.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 *
 * @extends {module:watchdog/watchdog~Watchdog}
 */
export default class ContextWatchdog extends Watchdog {
	/**
	 * The context watchdog class constructor.
	 *
	 * 	const watchdog = new ContextWatchdog( Context );
	 *
	 * 	await watchdog.create( contextConfiguration );
	 *
	 * 	await watchdog.add( item );
	 *
	 * See the {@glink features/watchdog Watchdog feature guide} to learn more how to use this feature.
	 *
	 * @param {Function} Context The {@link module:core/context~Context} class.
	 * @param {module:watchdog/watchdog~WatchdogConfig} [watchdogConfig] The watchdog configuration.
	 */
	constructor( Context, watchdogConfig = {} ) {
		super( watchdogConfig );

		/**
		 * A map of internal watchdogs for added items.
		 *
		 * @protected
		 * @type {Map.<string,module:watchdog/watchdog~EditorWatchdog>}
		 */
		this._watchdogs = new Map();

		/**
		 * The watchdog configuration.
		 *
		 * @private
		 * @type {module:watchdog/watchdog~WatchdogConfig}
		 */
		this._watchdogConfig = watchdogConfig;

		/**
		 * The current context instance.
		 *
		 * @private
		 * @type {module:core/context~Context|null}
		 */
		this._context = null;

		/**
		 * Context properties (nodes/references) that are gathered during the initial context creation
		 * and are used to distinguish the origin of an error.
		 *
		 * @private
		 * @type {Set.<*>}
		 */
		this._contextProps = new Set();

		/**
		 * An action queue, which is used to handle async functions queuing.
		 *
		 * @private
		 * @type {ActionQueues}
		 */
		this._actionQueues = new ActionQueues();

		/**
		 * The configuration for the {@link module:core/context~Context}.
		 *
		 * @private
		 * @member {Object} #_contextConfig
		 */

		/**
		 * The context configuration.
		 *
		 * @private
		 * @member {Object|undefined} #_config
		 */

		// Default creator and destructor.
		this._creator = contextConfig => Context.create( contextConfig );
		this._destructor = context => context.destroy();

		this._actionQueues.onEmpty( () => {
			if ( this.state === 'initializing' ) {
				this.state = 'ready';
				this._fire( 'stateChange' );
			}
		} );

		/**
		 * Sets the function that is responsible for the context creation.
		 * It expects a function that should return a promise (or `undefined`).
		 *
		 *		watchdog.setCreator( config => Context.create( config ) );
		 *
		 * @method #setCreator
		 * @param {Function} creator
		 */

		/**
		 * Sets the function that is responsible for the context destruction.
		 * Overrides the default destruction function, which destroys only the context instance.
		 * It expects a function that should return a promise (or `undefined`).
		 *
		 *		watchdog.setDestructor( context => {
		 *			// Do something before the context is destroyed.
		 *
		 *			return context
		 *				.destroy()
		 *				.then( () => {
		 *					// Do something after the context is destroyed.
		 *				} );
		 *		} );
		 *
		 * @method #setDestructor
		 * @param {Function} destructor
		 */
	}

	/**
	 * The context instance. Keep in mind that this property might be changed when the context watchdog restarts,
	 * so do not keep this instance internally. Always operate on the `ContextWatchdog#context` property.
	 *
	 * @type {module:core/context~Context|null}
	 */
	get context() {
		return this._context;
	}

	/**
	 * Initializes the context watchdog. Once it is created, the watchdog takes care about
	 * recreating the context and the provided items, and starts the error handling mechanism.
	 *
	 * 	await watchdog.create( {
	 * 		plugins: []
	 * 	} );
	 *
	 * @param {Object} [contextConfig] The context configuration. See {@link module:core/context~Context}.
	 * @returns {Promise}
	 */
	create( contextConfig = {} ) {
		return this._actionQueues.enqueue( mainQueueId, () => {
			this._contextConfig = contextConfig;

			return this._create();
		} );
	}

	/**
	 * Returns an item instance with the given `itemId`.
	 *
	 * 	const editor1 = watchdog.getItem( 'editor1' );
	 *
	 * @param {String} itemId The item ID.
	 * @returns {*} The item instance or `undefined` if an item with a given ID has not been found.
	 */
	getItem( itemId ) {
		const watchdog = this._getWatchdog( itemId );

		return watchdog._item;
	}

	/**
	 * Gets the state of the given item. See {@link #state} for a list of available states.
	 *
	 * 	const editor1State = watchdog.getItemState( 'editor1' );
	 *
	 * @param {String} itemId Item ID.
	 * @returns {'initializing'|'ready'|'crashed'|'crashedPermanently'|'destroyed'} The state of the item.
	 */
	getItemState( itemId ) {
		const watchdog = this._getWatchdog( itemId );

		return watchdog.state;
	}

	/**
	 * Adds items to the watchdog. Once created, instances of these items will be available using the {@link #getItem} method.
	 *
	 * Items can be passed together as an array of objects:
	 *
	 * 	await watchdog.add( [ {
	 *		id: 'editor1',
	 *		type: 'editor',
	 *		sourceElementOrData: document.querySelector( '#editor' ),
	 *		config: {
	 *			plugins: [ Essentials, Paragraph, Bold, Italic ],
	 *			toolbar: [ 'bold', 'italic', 'alignment' ]
	 *		},
	 *		creator: ( element, config ) => ClassicEditor.create( element, config )
	 *	} ] );
	 *
	 * Or one by one as objects:
	 *
	 * 	await watchdog.add( {
	 *		id: 'editor1',
	 *		type: 'editor',
	 *		sourceElementOrData: document.querySelector( '#editor' ),
	 *		config: {
	 *			plugins: [ Essentials, Paragraph, Bold, Italic ],
	 *			toolbar: [ 'bold', 'italic', 'alignment' ]
	 *		},
	 *		creator: ( element, config ) => ClassicEditor.create( element, config )
	 *	] );
	 *
	 * Then an instance can be retrieved using the {@link #getItem} method:
	 *
	 * 	const editor1 = watchdog.getItem( 'editor1' );
	 *
	 * Note that this method can be called multiple times, but for performance reasons it is better
	 * to pass all items together.
	 *
	 * @param {module:watchdog/contextwatchdog~WatchdogItemConfiguration|Array.<module:watchdog/contextwatchdog~WatchdogItemConfiguration>}
	 * itemConfigurationOrItemConfigurations An item configuration object or an array of item configurations.
	 * @returns {Promise}
	 */
	add( itemConfigurationOrItemConfigurations ) {
		const itemConfigurations = toArray( itemConfigurationOrItemConfigurations );

		return Promise.all( itemConfigurations.map( item => {
			return this._actionQueues.enqueue( item.id, () => {
				if ( this.state === 'destroyed' ) {
					throw new Error( 'Cannot add items to destroyed watchdog.' );
				}

				if ( !this._context ) {
					throw new Error( 'Context was not created yet. You should call the `ContextWatchdog#create()` method first.' );
				}

				let watchdog;

				if ( this._watchdogs.has( item.id ) ) {
					throw new Error( `Item with the given id is already added: '${ item.id }'.` );
				}

				if ( item.type === 'editor' ) {
					watchdog = new EditorWatchdog( this._watchdogConfig );
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

						this._actionQueues.enqueue( item.id, () => new Promise( res => {
							watchdog.on( 'restart', rethrowRestartEventOnce.bind( this ) );

							function rethrowRestartEventOnce() {
								watchdog.off( 'restart', rethrowRestartEventOnce );

								this._fire( 'itemRestart', { itemId: item.id } );

								res();
							}
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
	 * 	await watchdog.remove( 'editor1' );
	 *
	 * Or
	 *
	 * 	await watchdog.remove( [ 'editor1', 'editor2' ] );
	 *
	 * @param {Array.<String>|String} itemIdOrItemIds Item ID or an array of item IDs.
	 * @returns {Promise}
	 */
	remove( itemIdOrItemIds ) {
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
	 * 	await watchdog.destroy();
	 *
	 * @returns {Promise}
	 */
	destroy() {
		return this._actionQueues.enqueue( mainQueueId, () => {
			this.state = 'destroyed';
			this._fire( 'stateChange' );

			super.destroy();

			return this._destroy();
		} );
	}

	/**
	 * Restarts the context watchdog.
	 *
	 * @protected
	 * @returns {Promise}
	 */
	_restart() {
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
	 * @private
	 * @returns {Promise}
	 */
	_create() {
		return Promise.resolve()
			.then( () => {
				this._startErrorHandling();

				return this._creator( this._contextConfig );
			} )
			.then( context => {
				this._context = context;
				this._contextProps = getSubNodes( this._context );

				return Promise.all(
					Array.from( this._watchdogs.values() )
						.map( watchdog => {
							watchdog._setExcludedProperties( this._contextProps );

							return watchdog.create( undefined, undefined, this._context );
						} )
				);
			} );
	}

	/**
	 * Destroys the context instance and all added items.
	 *
	 * @private
	 * @returns {Promise}
	 */
	_destroy() {
		return Promise.resolve()
			.then( () => {
				this._stopErrorHandling();

				const context = this._context;

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
	 * @protected
	 * @param {String} itemId Item ID.
	 * @returns {module:watchdog/watchdog~Watchdog} Watchdog
	 */
	_getWatchdog( itemId ) {
		const watchdog = this._watchdogs.get( itemId );

		if ( !watchdog ) {
			throw new Error( `Item with the given id was not registered: ${ itemId }.` );
		}

		return watchdog;
	}

	/**
	 * Checks whether an error comes from the context instance and not from the item instances.
	 *
	 * @protected
	 * @param {Error} error
	 * @returns {Boolean}
	 */
	_isErrorComingFromThisItem( error ) {
		for ( const watchdog of this._watchdogs.values() ) {
			if ( watchdog._isErrorComingFromThisItem( error ) ) {
				return false;
			}
		}

		return areConnectedThroughProperties( this._context, error.context );
	}

	/**
	 * Fired after the watchdog restarts the context and the added items because of a crash.
	 *
	 * 	watchdog.on( 'restart', () => {
	 * 		console.log( 'The context has been restarted.' );
	 * 	} );
	 *
	 * @event restart
	 */

	/**
	 * Fired when a new error occurred in one of the added items.
	 *
	 * 	watchdog.on( 'itemError', ( evt, { error, itemId, causesRestart } ) => {
	 *		console.log( `An error occurred in an item with the '${ itemId }' ID.` );
	 * 	} );
	 *
	 * @event itemError
	 */

	/**
	 * Fired after an item has been restarted.
	 *
	 * 	watchdog.on( 'itemRestart', ( evt, { itemId } ) => {
	 *		console.log( 'An item with with the '${ itemId }' ID has been restarted.' );
	 * 	} );
	 *
	 * @event itemRestart
	 */
}

// Manager of action queues that allows queuing async functions.
class ActionQueues {
	constructor() {
		// @type {Array.<Function>}
		this._onEmptyCallbacks = [];

		// @type {Map.<Promise>}
		this._queues = new Map();

		this._actions = new WeakMap();

		this._lastActionId = 0;

		this._activeActions = 0;
	}

	// Used to register callbacks that will be run when the queue becomes empty.
	//
	// @param {Function} onEmptyCallback A callback that will be run whenever the queue becomes empty.
	onEmpty( onEmptyCallback ) {
		this._onEmptyCallbacks.push( onEmptyCallback );
	}

	// It adds asynchronous actions (functions) to the proper queue and runs them one by one.
	//
	// @param {Symbol|String|Number} queueId The action queue ID.
	// @param {Function} action A function that should be enqueued.
	// @returns {Promise}
	enqueue( queueId, action ) {
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

// Transforms any value to an array. If the provided value is already an array, it is returned unchanged.
//
// @param {*} elementOrArray The value to transform to an array.
// @returns {Array} An array created from data.
function toArray( elementOrArray ) {
	return Array.isArray( elementOrArray ) ? elementOrArray : [ elementOrArray ];
}

/**
 * The watchdog item configuration interface.
 *
 * @typedef {Object} module:watchdog/contextwatchdog~WatchdogItemConfiguration
 *
 * @property {String} id A unique item identificator.
 *
 * @property {'editor'} type The type of the item to create. At the moment, only `'editor'` is supported.
 *
 * @property {Function} creator A function that initializes the item (the editor). The function takes editor initialization arguments
 * and should return a promise. For example: `( el, config ) => ClassicEditor.create( el, config )`.
 *
 * @property {Function} [destructor] A function that destroys the item instance (the editor). The function
 * takes an item and should return a promise. For example: `editor => editor.destroy()`
 *
 * @property {String|HTMLElement} sourceElementOrData The source element or data that will be passed
 * as the first argument to the `Editor.create()` method.
 *
 * @property {Object} config An editor configuration.
 */
