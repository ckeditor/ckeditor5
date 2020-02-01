/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/watchdog
 */

/* globals window */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

/**
 * An abstract watchdog class that handles most of the error handling process and the state of the underlying component.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and how to use it.
 *
 * @private
 * @abstract
 */
export default class Watchdog {
	/**
	 * @param {module:watchdog/watchdog~WatchdogConfig} config The watchdog plugin configuration.
	 */
	constructor( config ) {
		/**
		 * An array of crashes saved as an object with the following properties:
		 *
		 * * `message`: `String`,
		 * * `stack`: `String`,
		 * * `date`: `Number`,
		 * * `filename`: `String | undefined`,
		 * * `lineno`: `Number | undefined`,
		 * * `colno`: `Number | undefined`,
		 *
		 * @public
		 * @readonly
		 * @type {Array.<Object>}
		 */
		this.crashes = [];

		/**
		 * Specifies the state of the instance handled by the watchdog. The state can be one of the following values:
		 *
		 * * `initializing` - before the first initialization, and after crashes, before the instance is ready,
		 * * `ready` - a state when a user can interact with the instance,
		 * * `crashed` - a state when an error occurs - it quickly changes to `initializing` or `crashedPermanently`
		 * depending on how many and how frequency errors have been caught recently,
		 * * `crashedPermanently` - a state when the watchdog stops reacting to errors and keeps the instance crashed,
		 * * `destroyed` - a state when the instance is manually destroyed by the user after calling `watchdog.destroy()`
		 *
		 * @public
		 * @observable
		 * @member {'initializing'|'ready'|'crashed'|'crashedPermanently'|'destroyed'} #state
		 */
		this.set( 'state', 'initializing' );

		/**
		 * @protected
		 * @type {Number}
		 * @see module:watchdog/watchdog~WatchdogConfig
		 */
		this._crashNumberLimit = typeof config.crashNumberLimit === 'number' ? config.crashNumberLimit : 3;

		/**
		 * Returns the result of `Date.now()` call. It can be overridden in tests to mock time as the popular
		 * approaches like `sinon.useFakeTimers()` does not work well with error handling.
		 *
		 * @protected
		 */
		this._now = Date.now;

		/**
		 * @protected
		 * @type {Number}
		 * @see module:watchdog/watchdog~WatchdogConfig
		 */
		this._minimumNonErrorTimePeriod = typeof config.minimumNonErrorTimePeriod === 'number' ? config.minimumNonErrorTimePeriod : 5000;

		/**
		 * Checks if the event error comes from the underlying instance and restarts the instance.
		 *
		 * @private
		 * @type {Function}
		 */
		this._boundErrorHandler = evt => {
			// `evt.error` is exposed by EventError while `evt.reason` is available in PromiseRejectionEvent.
			const error = evt.error || evt.reason;

			// Note that `evt.reason` might be everything that is in the promise rejection.
			// Similarly everything that is thrown lands in `evt.error`.
			if ( error instanceof Error ) {
				this._handleError( error, evt );
			}
		};

		if ( !this._restart ) {
			throw new Error(
				'The Watchdog class was split into the abstract `Watchdog` class and the `EditorWatchdog` class. ' +
				'Please, use `EditorWatchdog` if you have used the `Watchdog` class previously.'
			);
		}

		/**
		 * The creation method.
		 *
		 * @protected
		 * @member {Function} #_creator
		 * @see #setCreator
		 */

		/**
		 * The destruction method.
		 *
		 * @protected
		 * @member {Function} #_destructor
		 * @see #setDestructor
		 */

		/**
		 * The handled instances.
		 *
		 * @abstract
		 * @protected
		 * @member {Object} #_instance
		 */

		/**
		 * The method responsible for the instance restarting.
		 *
		 * @abstract
		 * @protected
		 * @method #_restart
		 */

		/**
		 * Traverses the error context and the handled instance to find out whether the error should
		 * be handled by the given instance.
		 *
		 * @abstract
		 * @protected
		 * @method #_isErrorComingFromThisInstance
		 * @param {module:utils/ckeditorerror~CKEditorError} error
		 */
	}

	/**
	 * Sets the function that is responsible for the instance creation.
	 *
	 * @param {Function} creator A callback returning promise that is responsible for instance creation.
	 */
	setCreator( creator ) {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for the instance destruction.
	 *
	 * @param {Function} destructor A callback that takes the instance and returns the promise
	 * to the destructing process.
	 */
	setDestructor( destructor ) {
		this._destructor = destructor;
	}

	destroy() {
		this._stopErrorHandling();
		this.stopListening();
	}

	/**
	 * Starts error handling by attaching global error handlers.
	 *
	 * @protected
	 */
	_startErrorHandling() {
		window.addEventListener( 'error', this._boundErrorHandler );
		window.addEventListener( 'unhandledrejection', this._boundErrorHandler );
	}

	/**
	 * Stops error handling by detaching global error handlers.
	 *
	 * @protected
	 */
	_stopErrorHandling() {
		window.removeEventListener( 'error', this._boundErrorHandler );
		window.removeEventListener( 'unhandledrejection', this._boundErrorHandler );
	}

	/**
	 * Checks if the error comes from the instance that is handled by the watchdog  and
	 * restarts it. It reacts to {@link module:utils/ckeditorerror~CKEditorError `CKEditorError` errors} only.
	 *
	 * @private
	 * @fires error
	 * @param {Error} error Error.
	 * @param {ErrorEvent|PromiseRejectionEvent} evt Error event.
	 */
	_handleError( error, evt ) {
		// @if CK_DEBUG // if ( error.is && error.is( 'CKEditorError' ) && error.context === undefined ) {
		// @if CK_DEBUG // console.warn( 'The error is missing its context and Watchdog cannot restart the proper instance.' );
		// @if CK_DEBUG // }

		if ( this._shouldReactToError( error ) ) {
			this.crashes.push( {
				message: error.message,
				stack: error.stack,

				// `evt.filename`, `evt.lineno` and `evt.colno` are available only in ErrorEvent events
				filename: evt.filename,
				lineno: evt.lineno,
				colno: evt.colno,
				date: this._now()
			} );

			this.fire( 'error', { error } );
			this.state = 'crashed';

			if ( this._shouldRestart() ) {
				this._restart();
			} else {
				this.state = 'crashedPermanently';
			}
		}
	}

	/**
	 * Checks whether the error should be handled by the watchdog.
	 *
	 * @private
	 * @param {Error} error An error that was caught by the error handling process.
	 */
	_shouldReactToError( error ) {
		return (
			error.is &&
			error.is( 'CKEditorError' ) &&
			error.context !== undefined &&

			// In some cases the instance should not be restarted - e.g. during the instance initialization.
			// That's why the `null` was introduced as a correct error context which does cause restarting.
			error.context !== null &&

			// Do not react to errors if the watchdog is in states other than `ready`.
			this.state === 'ready' &&

			this._isErrorComingFromThisInstance( error )
		);
	}

	/**
	 * Checks if the watchdog should restart the underlying instance.
	 */
	_shouldRestart() {
		if ( this.crashes.length <= this._crashNumberLimit ) {
			return true;
		}

		const lastErrorTime = this.crashes[ this.crashes.length - 1 ].date;
		const firstMeaningfulErrorTime = this.crashes[ this.crashes.length - 1 - this._crashNumberLimit ].date;

		const averageNonErrorTimePeriod = ( lastErrorTime - firstMeaningfulErrorTime ) / this._crashNumberLimit;

		return averageNonErrorTimePeriod > this._minimumNonErrorTimePeriod;
	}

	/**
	 * Fired when a new {@link module:utils/ckeditorerror~CKEditorError `CKEditorError`} error connected to the watchdog instance occurs
	 * and the watchdog will react to it.
	 *
	 * @event error
	 */
}

mix( Watchdog, ObservableMixin );

/**
 * The watchdog plugin configuration.
 *
 * @typedef {Object} WatchdogConfig
 *
 * @property {Number} [crashNumberLimit=3] A threshold specifying the number of instance crashes
 * when the watchdog stops restarting the instance in case of errors.
 * After this limit is reached and the time between last errors is shorter than `minimumNonErrorTimePeriod`
 * the watchdog changes its state to `crashedPermanently` and it stops restarting the instance. This prevents an infinite restart loop.
 * @property {Number} [minimumNonErrorTimePeriod=5000] An average amount of milliseconds between last instance errors
 * (defaults to 5000). When the period of time between errors is lower than that and the `crashNumberLimit` is also reached
 * the watchdog changes its state to `crashedPermanently` and it stops restarting the instance. This prevents an infinite restart loop.
 */
