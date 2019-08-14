/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/watchdog
 */

/* globals console, window */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import { throttle, cloneDeepWith, isElement } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import areConnectedThroughProperties from '@ckeditor/ckeditor5-utils/src/areconnectedthroughproperties';

/**
 * A watchdog for CKEditor 5 editors.
 *
 * See the {@glink features/watchdog Watchdog} feature guide to learn the rationale behind it and
 * how to use it.
 */
export default class Watchdog {
	/**
	 * @param {module:watchdog/watchdog~WatchdogConfig} [config] The watchdog plugin configuration.
	 */
	constructor( config = {} ) {
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
		 * Specifies the state of the editor handled by the watchdog. The state can be one of the following values:
		 *
		 * * `initializing` - before the first initialization, and after crashes, before the editor is ready,
		 * * `ready` - a state when a user can interact with the editor,
		 * * `crashed` - a state when an error occurs - it quickly changes to `initializing` or `crashedPermanently`
		 * depending on how many and how frequency errors have been caught recently,
		 * * `crashedPermanently` - a state when the watchdog stops reacting to errors and keeps the editor crashed,
		 * * `destroyed` - a state when the editor is manually destroyed by the user after calling `watchdog.destroy()`
		 *
		 * @public
		 * @observable
		 * @member {'initializing'|'ready'|'crashed'|'crashedPermanently'|'destroyed'} #state
		 */
		this.set( 'state', 'initializing' );

		/**
		 * @private
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
		 * @private
		 * @type {Number}
		 * @see module:watchdog/watchdog~WatchdogConfig
		 */
		this._minimumNonErrorTimePeriod = typeof config.minimumNonErrorTimePeriod === 'number' ? config.minimumNonErrorTimePeriod : 5000;

		/**
		 * Checks if the event error comes from the editor that is handled by the watchdog (by checking the error context)
		 * and restarts the editor.
		 *
		 * @private
		 * @type {Function}
		 */
		this._boundErrorHandler = evt => {
			// `evt.error` is exposed by EventError while `evt.reason` is available in PromiseRejectionEvent.

			if ( evt.reason ) {
				// Note that evt.reason might be everything that is in the promise rejection.
				if ( evt.reason instanceof Error ) {
					this._handleError( evt.reason, evt );
				}
			} else {
				this._handleError( evt.error, evt );
			}
		};

		/**
		 * Throttled save method. The `save()` method is called the specified `saveInterval` after `throttledSave()` is called,
		 * unless a new action happens in the meantime.
		 *
		 * @private
		 * @type {Function}
		 */
		this._throttledSave = throttle(
			this._save.bind( this ),
			typeof config.saveInterval === 'number' ? config.saveInterval : 5000
		);

		/**
		 * The current editor instance.
		 *
		 * @private
		 * @type {module:core/editor/editor~Editor}
		 */
		this._editor = null;

		/**
		 * The editor creation method.
		 *
		 * @private
		 * @member {Function} #_creator
		 * @see #setCreator
		 */

		/**
		 * The editor destruction method.
		 *
		 * @private
		 * @member {Function} #_destructor
		 * @see #setDestructor
		 */

		/**
		 * The latest saved editor data represented as a root name -> root data object.
		 *
		 * @private
		 * @member {Object.<String,String>} #_data
		 */

		/**
		 * The last document version.
		 *
		 * @private
		 * @member {Number} #_lastDocumentVersion
		 */

		/**
		 * The editor source element or data.
		 *
		 * @private
		 * @member {HTMLElement|String} #_elementOrData
		 */

		/**
		 * The editor configuration.
		 *
		 * @private
		 * @member {Object|undefined} #_config
		 */
	}

	/**
	 * The current editor instance.
	 *
	 * @readonly
	 * @type {module:core/editor/editor~Editor}
	 */
	get editor() {
		return this._editor;
	}

	/**
	 * Sets the function that is responsible for editor creation.
	 * It expects a function that should return a promise.
	 *
	 *		watchdog.setCreator( ( element, config ) => ClassicEditor.create( element, config ) );
	 *
	 * @param {Function} creator
	 */
	setCreator( creator ) {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for editor destruction.
	 * It expects a function that should return a promise or `undefined`.
	 *
	 *		watchdog.setDestructor( editor => editor.destroy() );
	 *
	 * @param {Function} destructor
	 */
	setDestructor( destructor ) {
		this._destructor = destructor;
	}

	/**
	 * Creates a watched editor instance using the creator passed to the {@link #setCreator `setCreator()`} method or
	 * {@link module:watchdog/watchdog~Watchdog.for `Watchdog.for()`} helper.
	 *
	 * @param {HTMLElement|String} elementOrData
	 * @param {module:core/editor/editorconfig~EditorConfig} [config]
	 *
	 * @returns {Promise}
	 */
	create( elementOrData, config ) {
		if ( !this._creator ) {
			/**
			 * The watchdog's editor creator is not defined. Define it by using
			 * {@link module:watchdog/watchdog~Watchdog#setCreator `Watchdog#setCreator()`} or
			 * the {@link module:watchdog/watchdog~Watchdog.for `Watchdog.for()`} helper.
			 *
			 * @error watchdog-creator-not-defined
			 */
			throw new CKEditorError(
				'watchdog-creator-not-defined: The watchdog\'s editor creator is not defined.',
				null
			);
		}

		if ( !this._destructor ) {
			/**
			 * The watchdog's editor destructor is not defined. Define it by using
			 * {@link module:watchdog/watchdog~Watchdog#setDestructor `Watchdog#setDestructor()`} or
			 * the {@link module:watchdog/watchdog~Watchdog.for `Watchdog.for()`} helper.
			 *
			 * @error watchdog-destructor-not-defined
			 */
			throw new CKEditorError(
				'watchdog-destructor-not-defined: The watchdog\'s editor destructor is not defined.',
				null
			);
		}

		this._elementOrData = elementOrData;

		// Clone config because it might be shared within multiple watchdog instances. Otherwise
		// when an error occurs in one of these editors the watchdog will restart all of them.
		this._config = cloneDeepWith( config, value => {
			// Leave DOM references.
			return isElement( value ) ? value : undefined;
		} );

		return Promise.resolve()
			.then( () => this._creator( elementOrData, this._config ) )
			.then( editor => {
				this._editor = editor;

				window.addEventListener( 'error', this._boundErrorHandler );
				window.addEventListener( 'unhandledrejection', this._boundErrorHandler );

				this.listenTo( editor.model.document, 'change:data', this._throttledSave );

				this._lastDocumentVersion = editor.model.document.version;

				this._data = this._getData();
				this.state = 'ready';
			} );
	}

	/**
	 * Destroys the current editor instance by using the destructor passed to the {@link #setDestructor `setDestructor()`} method
	 * and sets state to `destroyed`.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		this.state = 'destroyed';

		return this._destroy();
	}

	/**
	 * Destroys the current editor instance by using the destructor passed to the {@link #setDestructor `setDestructor()`} method.
	 *
	 * @private
	 */
	_destroy() {
		window.removeEventListener( 'error', this._boundErrorHandler );
		window.removeEventListener( 'unhandledrejection', this._boundErrorHandler );

		this.stopListening( this._editor.model.document, 'change:data', this._throttledSave );

		// Save data if there is a remaining editor data change.
		this._throttledSave.flush();

		return Promise.resolve()
			.then( () => this._destructor( this._editor ) )
			.then( () => {
				this._editor = null;
			} );
	}

	/**
	 * Saves the editor data, so it can be restored after the crash even if the data cannot be fetched at
	 * the moment of a crash.
	 *
	 * @private
	 */
	_save() {
		const version = this._editor.model.document.version;

		// Change may not produce an operation, so the document's version
		// can be the same after that change.
		if ( version === this._lastDocumentVersion ) {
			return;
		}

		try {
			this._data = this._getData();
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
	 * Returns the editor data.
	 *
	 * @private
	 * @returns {Object<String,String>}
	 */
	_getData() {
		const data = {};

		for ( const rootName of this._editor.model.document.getRootNames() ) {
			data[ rootName ] = this._editor.data.get( { rootName } );
		}

		return data;
	}

	/**
	 * Checks if the error comes from the editor that is handled by the watchdog (by checking the error context) and
	 * restarts the editor. It reacts to {@link module:utils/ckeditorerror~CKEditorError `CKEditorError` errors} only.
	 *
	 * @private
	 * @fires error
	 * @param {Error} error Error.
	 * @param {ErrorEvent|PromiseRejectionEvent} evt Error event.
	 */
	_handleError( error, evt ) {
		if ( error.is && error.is( 'CKEditorError' ) && error.context === undefined ) {
			console.error( 'The error is missing its context and Watchdog cannot restart the proper editor.' );
		}

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

			if ( this._shouldRestartEditor() ) {
				this._restart();
			} else {
				this.state = 'crashedPermanently';
			}
		}
	}

	/**
	 * Checks whether the error should be handled.
	 *
	 * @private
	 * @param {Error} error Error
	 */
	_shouldReactToError( error ) {
		return (
			error.is &&
			error.is( 'CKEditorError' ) &&
			error.context !== undefined &&

			// In some cases the editor should not be restarted - e.g. in case of the editor initialization.
			// That's why the `null` was introduced as a correct error context which does cause restarting.
			error.context !== null &&

			// Do not react to errors if the watchdog is in states other than `ready`.
			this.state === 'ready' &&

			this._isErrorComingFromThisEditor( error )
		);
	}

	/**
	 * Checks if the editor should be restared or if it should be marked as crashed.
	 */
	_shouldRestartEditor() {
		if ( this.crashes.length <= this._crashNumberLimit ) {
			return true;
		}

		const lastErrorTime = this.crashes[ this.crashes.length - 1 ].date;
		const firstMeaningfulErrorTime = this.crashes[ this.crashes.length - 1 - this._crashNumberLimit ].date;

		const averageNonErrorTimePeriod = ( lastErrorTime - firstMeaningfulErrorTime ) / this._crashNumberLimit;

		return averageNonErrorTimePeriod > this._minimumNonErrorTimePeriod;
	}

	/**
	 * Restarts the editor instance. This method is called whenever an editor error occurs. It fires the `restart` event and changes
	 * the state to `initializing`.
	 *
	 * @private
	 * @fires restart
	 * @returns {Promise}
	 */
	_restart() {
		this.state = 'initializing';

		return Promise.resolve()
			.then( () => this._destroy() )
			.catch( err => console.error( 'An error happened during the editor destructing.', err ) )
			.then( () => {
				if ( typeof this._elementOrData === 'string' ) {
					return this.create( this._data, this._config );
				}

				const updatedConfig = Object.assign( {}, this._config, {
					initialData: this._data
				} );

				return this.create( this._elementOrData, updatedConfig );
			} )
			.then( () => {
				this.fire( 'restart' );
			} );
	}

	/**
	 * Traverses both structures to find out whether the error context is connected
	 * with the current editor.
	 *
	 * @private
	 * @param {module:utils/ckeditorerror~CKEditorError} error
	 */
	_isErrorComingFromThisEditor( error ) {
		return areConnectedThroughProperties( this._editor, error.context );
	}

	/**
	 * A shorthand method for creating an instance of the watchdog. For the full usage see the
	 * {@link ~Watchdog `Watchdog` class description}.
	 *
	 * Usage:
	 *
	 *		const watchdog = Watchdog.for( ClassicEditor );
	 *
	 *		watchdog.create( elementOrData, config );
	 *
	 * @param {*} Editor The editor class.
	 * @param {module:watchdog/watchdog~WatchdogConfig} [watchdogConfig] The watchdog plugin configuration.
	 */
	static for( Editor, watchdogConfig ) {
		const watchdog = new Watchdog( watchdogConfig );

		watchdog.setCreator( ( elementOrData, config ) => Editor.create( elementOrData, config ) );
		watchdog.setDestructor( editor => editor.destroy() );

		return watchdog;
	}

	/**
	 * Fired when a new {@link module:utils/ckeditorerror~CKEditorError `CKEditorError`} error connected to the watchdog editor occurs
	 * and the watchdog will react to it.
	 *
	 * @event error
	 */

	/**
	 * Fired after the watchdog restarts the error in case of a crash.
	 *
	 * @event restart
	 */
}

mix( Watchdog, ObservableMixin );

/**
 * The watchdog plugin configuration.
 *
 * @typedef {Object} WatchdogConfig
 *
 * @property {Number} [crashNumberLimit=3] A threshold specifying the number of editor errors (defaults to `3`).
 * After this limit is reached and the time between last errors is shorter than `minimumNonErrorTimePeriod`
 * the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
 * @property {Number} [minimumNonErrorTimePeriod=5000] An average amount of milliseconds between last editor errors
 * (defaults to 5000). When the period of time between errors is lower than that and the `crashNumberLimit` is also reached
 * the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
 * @property {Number} [saveInterval=5000] A minimum number of milliseconds between saving editor data internally, (defaults to 5000).
 * Note that for large documents this might have an impact on the editor performance.
 */
