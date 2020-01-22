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

export default class ContextWatchdog extends Watchdog {
	/**
	 * @param {module:watchdog/watchdog~WatchdogConfig} [config] The watchdog plugin configuration.
	 */
	constructor( config = {}, contextConfig = {} ) {
		super( config );

		/**
		 * @protected
		 * @type {Map.<string,EditorWatchdog>}
		 */
		this._watchdogs = new Map();

		/**
		 * @private
		 * @type {Context|null}
		 */
		this._context = null;

		/**
		 * @private
		 * @type {Set.<*>|undefined}
		 */
		this._contextProps;

		/**
		 * @private
		 * @type {ActionQueue}
		 */
		this._actionQueue = new ActionQueue();

		/**
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
	}

	/**
	 * @type {Context|null}
	 */
	get context() {
		return this._context;
	}

	async add( items ) {
		await this._actionQueue.enqueue( async () => {
			if ( this.state === 'destroyed' ) {
				throw new Error( 'Cannot add items do destroyed watchdog.' );
			}

			await Promise.all( Object.entries( items ).map( async ( [ itemName, itemConfig ] ) => {
				let watchdog;

				if ( this._watchdogs.has( itemName ) ) {
					throw new Error( `Watchdog with the given name is already added: '${ itemName }'.` );
				}

				if ( itemConfig.type === 'editor' ) {
					watchdog = new EditorWatchdog();
					watchdog.setCreator( itemConfig.creator );

					if ( itemConfig.destructor ) {
						watchdog.setDestructor( itemConfig.destructor );
					}

					this._watchdogs.set( itemName, watchdog );

					const editorConfig = watchdog._cloneConfig( itemConfig.config );

					editorConfig.context = this._context;

					await watchdog.create( itemConfig.sourceElementOrData, editorConfig );
				} else {
					throw new Error( `Not supported item type: '${ itemConfig.type }'.` );
				}
			} ) );

			this.state = 'ready';
		} );
	}

	/**
	 * TODO
	 *
	 * @param {Array.<String>} itemNames
	 */
	async remove( itemNames ) {
		await this._actionQueue.enqueue( async () => {
			await Promise.all( itemNames.map( async itemName => {
				const watchdog = this._watchdogs.get( itemName );

				this._watchdogs.delete( itemName );

				if ( !watchdog ) {
					throw new Error( `There is no watchdog named: '${ itemName }'.` );
				}

				await watchdog.destroy();
			} ) );
		} );
	}

	/**
	 * TODO
	 */
	async waitForReady() {
		await this._actionQueue.enqueue( () => { } );
	}

	async destroy() {
		await this._actionQueue.enqueue( async () => {
			this.state = 'destroyed';

			await this._destroy( true );
		} );
	}

	/**
	 * @protected
	 */
	async _restart() {
		await this._actionQueue.enqueue( async () => {
			this.state = 'initializing';

			try {
				await this._destroy( true );
			} catch ( err ) {
				console.error( 'An error happened during the editor destructing.', err );
			}

			await this._create( true );

			this.fire( 'restart' );
		} );
	}

	/**
	 * @protected
	 */
	async _create( isInternal = false ) {
		await this._actionQueue.enqueue( async () => {
			this._startErrorHandling();

			this._context = await this._creator( this._contextConfig );
			this._contextProps = getSubNodes( this._context );

			await Promise.all(
				Array.from( this._watchdogs.values() )
					.map( async watchdog => {
						watchdog.updateContext( this._context );
						await watchdog.create();
					} )
			);

			this.state = 'ready';
		}, isInternal );
	}

	async _destroy( isInternal = false ) {
		await this._actionQueue.enqueue( async () => {
			this._stopErrorHandling();

			const context = this._context;

			this._context = null;
			this._contextProps = new Set();

			await Promise.all(
				Array.from( this._watchdogs.values() )
					.map( async watchdog => watchdog.destroy() )
			);

			// Context destructor destroys each editor.
			await this._destructor( context );
		}, isInternal );
	}

	_isErrorComingFromThisInstance( error ) {
		// Return true only if the error comes directly from the context.
		// Ignore cases when the error comes from editors.
		return areConnectedThroughProperties( this._contextProps, error.context );
	}

	static for( Context, watchdogConfig ) {
		const watchdog = new this( watchdogConfig );

		watchdog.setCreator( config => Context.create( config ) );
		watchdog.setDestructor( context => context.destroy() );

		watchdog._create();

		return watchdog;
	}
}

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
	}

	/**
	 * @param {Function} action
	 * @param {Boolean} isInternal
	 */
	async enqueue( action, isInternal = false ) {
		// Run all internal callbacks immediately.
		if ( isInternal ) {
			return action();
		}

		this._queuedActions.push( action );

		if ( this._queuedActions.length > 1 ) {
			await new Promise( res => {
				this._resolveCallbacks.set( action, res );
			} );

			return;
		}

		while ( this._queuedActions.length ) {
			const action = this._queuedActions[ 0 ];
			const resolve = this._resolveCallbacks.get( action );

			await action();

			this._queuedActions.shift();

			if ( resolve ) {
				resolve();
			}
		}
	}

	clear() {
		this._queuedActions = [];
	}
}
