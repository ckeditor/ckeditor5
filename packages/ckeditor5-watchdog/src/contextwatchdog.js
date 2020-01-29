/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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

/**
 * The Context Watchdog class.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export default class ContextWatchdog extends Watchdog {
	/**
	 * @param {Object} [contextConfig] {@link module:core/context~Context} configuration.
	 * @param {module:watchdog/watchdog~WatchdogConfig} [watchdogConfig] The watchdog plugin configuration.
	 */
	constructor( contextConfig = {}, watchdogConfig = {} ) {
		super( watchdogConfig );

		/**
		 * @protected
		 * @type {Map.<string,module:watchdog/watchdog~EditorWatchdog>}
		 */
		this._watchdogs = new Map();

		/**
		 * The current context instance.
		 *
		 * @private
		 * @type {module:core/context~Context|null}
		 */
		this._context = null;

		/**
		 * Context props (nodes/references) that are gathered during the initial context creation
		 * and are used to distinguish error origin.
		 *
		 * @private
		 * @type {Set.<*>}
		 */
		this._contextProps = new Set();

		/**
		 * An action queue, which is used to handle async functions queuing.
		 *
		 * @private
		 * @type {ActionQueue}
		 */
		this._actionQueue = new ActionQueue();

		/**
		 * Config for the {@link module:core/context~Context}.
		 *
		 * @private
		 * @type {Object}
		 */
		this._contextConfig = contextConfig;

		/**
		 * The context configuration.
		 *
		 * @private
		 * @member {Object|undefined} #_config
		 */

		// Default destructor.
		this._destructor = context => context.destroy();

		this._actionQueue.onEmpty( () => {
			if ( this.state !== 'destroyed' ) {
				this.state = 'ready';
			}
		} );
	}

	/**
	 * The context instance. Keep in mind that this property might be changed when the ContextWatchdog restarts,
	 * so do not keep this instance internally. Always operate on the `contextWatchdog.context` property.
	 *
	 * @type {module:core/context~Context|null}
	 */
	get context() {
		return this._context;
	}

	/**
	 * Returns the watchdog for the added item by its name. Depending on the item type
	 * the instance can be retrieved from the watchdog.
	 *
	 * 	const editorWatchdog = contextWatchdog.getWatchdog( 'editor1' );
	 * 	const editor1 = editorWatchdog.editor;
	 *
	 * @param {String} name The item name (the key under which the item config was passed to the add() method).
	 */
	getWatchdog( name ) {
		return this._watchdogs.get( name );
	}

	/**
	 * Adds items to the watchdog. Internally watchdogs will be created for these items and they will be available later using
	 * the {@link #getWatchdog} method.
	 *
	 * @param {Array.<Object.<String,module:watchdog/contextwatchdog~WatchdogItemConfiguration>>} itemConfigurations
	 * @returns {Promise}
	 */
	add( itemConfigurations ) {
		return this._actionQueue.enqueue( () => {
			if ( this.state === 'destroyed' ) {
				throw new Error( 'Cannot add items to destroyed watchdog.' );
			}

			if ( !this._context ) {
				throw new Error( 'Context was not created yet. You should call the `ContextWatchdog#create()` method first.' );
			}

			// Create new watchdogs.
			return Promise.all( Object.entries( itemConfigurations ).map( ( [ itemName, item ] ) => {
				let watchdog;

				if ( this._watchdogs.has( itemName ) ) {
					throw new Error( `Watchdog with the given name is already added: '${ itemName }'.` );
				}

				if ( item.type === 'editor' ) {
					// TODO - await EditorWatchdog.createFrom( item, context ) ?
					watchdog = new EditorWatchdog();
					watchdog.setCreator( item.creator );
					watchdog._setExcludedProperties( this._contextProps );

					if ( item.destructor ) {
						watchdog.setDestructor( item.destructor );
					}

					this._watchdogs.set( itemName, watchdog );

					return watchdog.create( item.sourceElementOrData, item.config, this._context );
				} else {
					throw new Error( `Not supported item type: '${ item.type }'.` );
				}
			} ) );
		} );
	}

	/**
	 * Removes item by its name from the created items. It destroys the internal watchdog for this item and remove
	 * the item from the item list.
	 *
	 * @param {Array.<String>} itemNames
	 * @returns {Promise}
	 */
	remove( itemNames ) {
		return this._actionQueue.enqueue( () => {
			return Promise.all( itemNames.map( itemName => {
				const watchdog = this._watchdogs.get( itemName );

				this._watchdogs.delete( itemName );

				if ( !watchdog ) {
					throw new Error( `There is no watchdog named: '${ itemName }'.` );
				}

				return watchdog.destroy();
			} ) );
		} );
	}

	/**
	 * Waits for all previous actions.
	 *
	 * @returns {Promise}
	 */
	waitForReady() {
		return this._actionQueue.enqueue( () => { } );
	}

	/**
	 * Creates the Context watchdog.
	 *
	 * @returns {Promise}
	 */
	create() {
		return this._actionQueue.enqueue( () => {
			return this._create( true );
		} );
	}

	/**
	 * Destroys the `ContextWatchdog` and all added items. This method can't be undone.
	 * Once the `ContextWatchdog` is destroyed new items can not be added.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		return this._actionQueue.enqueue( () => {
			this.state = 'destroyed';

			return this._destroy( true );
		} );
	}

	/**
	 * Restarts the `ContextWatchdog`.
	 *
	 * @returns {Promise}
	 * @protected
	 */
	_restart() {
		return this._actionQueue.enqueue( () => {
			this.state = 'initializing';

			return this._destroy( true )
				.catch( err => {
					console.error( 'An error happened during destructing.', err );
				} )
				.then( () => this._create( true ) )
				.then( () => this.fire( 'restart' ) );
		} );
	}

	/**
	 * @protected
	 * @param {Boolean} isInternal If the action is internal and should be invoked immediately.
	 * @returns {Promise}
	 */
	_create( isInternal = false ) {
		return this._actionQueue.enqueue( () => {
			this._startErrorHandling();

			return this._creator( this._contextConfig )
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
		}, isInternal );
	}

	/**
	 * Destroys the Context and all added items.
	 *
	 * @param {Boolean} isInternal If the action is internal and should be invoked immediately.
	 * @returns {Promise}
	 */
	_destroy( isInternal = false ) {
		return this._actionQueue.enqueue( () => {
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
		}, isInternal );
	}

	/**
	 * Checks whether the error comes from the Context and not from Editor or ContextItem instances.
	 *
	 * @param {Error} error
	 * @returns {Boolean}
	 */
	_isErrorComingFromThisInstance( error ) {
		for ( const watchdog of this._watchdogs.values() ) {
			if ( watchdog._isErrorComingFromThisInstance( error ) ) {
				return false;
			}
		}

		// Return true only if the error comes directly from the context.
		// Ignore cases when the error comes from editors.
		return areConnectedThroughProperties( this._contextProps, error.context );
	}

	/**
	 * @param {module:core/context~Context} Context
	 * @param {Object} [contextConfig]
	 * @param {module:watchdog/watchdog~WatchdogConfig} [watchdogConfig]
	 * @returns {module:watchdog/contextwatchdog~ContextWatchdog}
	 */
	static for( Context, contextConfig, watchdogConfig ) {
		const watchdog = new this( contextConfig, watchdogConfig );

		watchdog.setCreator( config => Context.create( config ) );

		watchdog.create();

		return watchdog;
	}
}

/**
 * An action queue is used to queue async functions.
 *
 * @private
 */
class ActionQueue {
	constructor() {
		/**
		 * @type {Array.<Function>}
		 */
		this._queuedActions = [];

		/**
		 * @type {WeakMap.<Function, Function>}
		 */
		this._resolveCallbacks = new WeakMap();

		/**
		 * @type {Array.<Function>}
		 */
		this._onEmptyCallbacks = [];
	}

	/**
	 * A method used to register callbacks that will be run when the queue becomes empty.
	 *
	 * @param {Function} onEmptyCallback A callback that will be run whenever the queue becomes empty.
	 */
	onEmpty( onEmptyCallback ) {
		this._onEmptyCallbacks.push( onEmptyCallback );
	}

	/**
	 * It adds asynchronous actions (functions) to the queue and runs them one by one.
	 * If the `isInternal` option is passed then it runs the provided function immediately.
	 *
	 * @param {Function} action A function that should be enqueued.
	 * @param {Boolean} isInternal If the action is internal and should be invoked immediately.
	 * @returns {Promise}
	 */
	enqueue( action, isInternal = false ) {
		// Run all internal callbacks immediately.
		if ( isInternal ) {
			return action();
		}

		this._queuedActions.push( action );

		if ( this._queuedActions.length > 1 ) {
			return new Promise( res => {
				this._resolveCallbacks.set( action, res );
			} );
		}

		return new Promise( ( res, rej ) => {
			this._handleActions( res, rej );
		} );
	}

	/**
	 * It handles actions one by one.
	 *
	 * @param {Function} res
	 * @param {Function} rej
	 */
	_handleActions( res, rej ) {
		const action = this._queuedActions[ 0 ];

		if ( !action ) {
			this._onEmptyCallbacks.forEach( cb => cb() );

			return res();
		}

		const resolve = this._resolveCallbacks.get( action );

		Promise.resolve()
			.then( () => action() )
			.then( () => {
				if ( resolve ) {
					resolve();
				}

				this._queuedActions.shift();

				return this._handleActions( res, rej );
			} )
			.catch( err => rej( err ) );
	}

	/**
	 * @protected
	 *
	 * Clears all queued actions (e.g. in case of an error).
	 */
	clear() {
		this._queuedActions = [];
	}
}

/**
 * The WatchdogItemConfiguration interface
 *
 * @typedef {module:watchdog/contextwatchdog~EditorWatchdogConfiguration} module:watchdog/contextwatchdog~WatchdogItemConfiguration
 */

/**
 * The EditorWatchdogConfiguration interface specifies how editors should be created and destroyed.
 *
 * @typedef {Object} module:watchdog/contextwatchdog~EditorWatchdogConfiguration
 *
 * @property {Function} creator A function that needs to be called to initialize the editor.
 *
 * @property {Function} [destructor] A function that is responsible for destructing the editor.
 *
 * @property {String|HTMLElement} sourceElementOrData The source element or data which will be passed
 * as the first argument to the `Editor.create()` method.
 *
 * @property {any} config An editor configuration.
 */
