/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/watchdog
 */

/* globals console, window */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import { throttle } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import areConnectedThroughProperties from '@ckeditor/ckeditor5-utils/src/areconnectedthroughproperties';

/**
 * A watchdog for CKEditor 5 editors.
 *
 * It keeps an {@link module:core/editor/editor~Editor editor} instance running.
 * If a {@link module:utils/ckeditorerror~CKEditorError `CKEditorError` error}
 * is thrown by the editor, it tries to restart the editor to the state before the crash. All other errors
 * are transparent to the watchdog.
 *
 * Note that the watchdog does not handle errors during editor initialization (`Editor.create()`)
 * and editor destruction (`editor.destroy()`). Errors at these stages mean that there is a serious
 * problem in the code integrating the editor and such problem cannot be easily fixed restarting the editor.
 *
 * Basic usage:
 *
 * 		const watchdog = Watchdog.for( ClassicEditor );
 *
 * 		watchdog.create( elementOrData, editorConfig ).then( editor => {} );
 *
 * Full usage:
 *
 *		const watchdog = new Watchdog();
 *
 *		watchdog.setCreator( ( elementOrData, editorConfig ) => ClassicEditor.create( elementOrData, editorConfig ) );
 *		watchdog.setDestructor( editor => editor.destroy() );
 *
 *		watchdog.create( elementOrData, editorConfig ).then( editor => {} );
 *
 * Other important APIs:
 *
 *		watchdog.on( 'crash', () => { console.log( 'Editor crashed.' ) } );
 *		watchdog.on( 'restart', () => { console.log( 'Editor was restarted.' ) } );
 *
 *		watchdog.restart(); // Restarts the editor.
 *		watchdog.destroy(); // Destroys the editor and global error event listeners.
 *
 * 		watchdog.editor; // Current editor instance.
 *
 * 		watchdog.crashes.forEach( crashInfo => console.log( crashInfo ) );
 */
export default class Watchdog {
	/**
	 * @param {Object} config
	 * @param {Number} config.crashNumberLimit
	 * @param {Number} config.waitingTime
	 */
	constructor( { crashNumberLimit, waitingTime } = {} ) {
		/**
		 * An array of crashes saved as an object with the following props:
		 * * message: String,
		 * * source: String,
		 * * lineno: String,
		 * * colno: String
		 *
		 * @public
		 * @readonly
		 * @type {Array.<Object>}
		 */
		this.crashes = [];

		/**
		 * Crash number limit (default to 3). After the limit is reached the editor is not restarted by the watchdog.
		 *
		 * @private
		 * @type {Number}
		 */
		this._crashNumberLimit = crashNumberLimit || 3;

		/**
		 * Checks if the event error comes from the editor that is handled by the watchdog (by checking the error context)
		 * and restarts the editor.
		 *
		 * @private
		 * @type {Function}
		 */
		this._boundErrorHandler = this._handleGlobalErrorEvent.bind( this );

		/**
		 * Throttled save method. The `save()` method is called the specified `waitingTime` after `throttledSave()` is called,
		 * unless a new action happens in the meantime.
		 *
		 * @private
		 * @type {Function}
		 */
		this._throttledSave = throttle( this._save.bind( this ), waitingTime || 5000 );

		/**
		 * The current editor
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
		 * The editor destruction method
		 *
		 * @private
		 * @member {Function} #_destructor
		 * @see #setDestructor
		 */

		/**
		 * The latest saved editor data.
		 *
		 * @private
		 * @member {String} #_data
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
	 * @type {module:core/editor/editor~Editor}
	 */
	get editor() {
		return this._editor;
	}

	/**
	 * Sets the function that is responsible for editor creation.
	 * It accepts functions that returns promises.
	 *
	 * 		watchdog.setCreator( ( el, config ) => ClassicEditor.create( el, config ) );
	 *
	 * @param {Function} creator
	 */
	setCreator( creator ) {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for editor destruction.
	 * It accepts function that returns a promise or undefined.
	 *
	 *		watchdog.setDestructor( editor => editor.destroy() );
	 *
	 * @param {Function} destructor
	 */
	setDestructor( destructor ) {
		this._destructor = destructor;
	}

	/**
	 * Restarts the editor instance. This method is also called whenever an editor error occurs.
	 * It fires the `restart` event.
	 *
	 * @fires restart
	 * @returns {Promise.<module:core/editor/editor~Editor>}
	 */
	restart() {
		this._throttledSave.flush();

		return Promise.resolve()
			.then( () => this.destroy() )
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
	 * Creates a watched editor instance using the creator passed to {@link #setCreator} method.
	 *
	 * @param {HTMLElement|String} elementOrData
	 * @param {module:core/editor/editorconfig~EditorConfig} [config]
	 *
	 * @returns {Promise.<module:watchdog/watchdog~Watchdog>}
	 */
	create( elementOrData, config ) {
		if ( !this._creator ) {
			/**
			 * @error watchdog-creator-not-defined
			 *
			 * The watchdog creator is not defined, define it using `watchdog.setCreator()`.
			 */
			throw new CKEditorError(
				'watchdog-creator-not-defined: The watchdog creator is not defined, define it using `watchdog.setCreator()`.',
				null
			);
		}

		if ( !this._destructor ) {
			/**
			 * @error watchdog-destructor-not-defined
			 *
			 * The watchdog destructor is not defined, define it using `watchdog.setDestructor()`.
			 */
			throw new CKEditorError(
				'watchdog-destructor-not-defined: The watchdog destructor is not defined, define it using `watchdog.setDestructor()`',
				null
			);
		}

		this._elementOrData = elementOrData;
		this._config = config;

		return Promise.resolve()
			.then( () => this._creator( elementOrData, config ) )
			.then( editor => {
				this._editor = editor;

				window.addEventListener( 'error', this._boundErrorHandler );
				this.listenTo( editor.model.document, 'change:data', this._throttledSave );

				this._lastDocumentVersion = editor.model.document.version;
				this._data = editor.getData();

				return this;
			} );
	}

	/**
	 * Destroys the current editor using the destructor passed to {@link #setDestructor} method.
	 *
	 * @returns {Promise.<module:watchdog/watchdog~Watchdog>}
	 */
	destroy() {
		window.removeEventListener( 'error', this._boundErrorHandler );
		this.stopListening( this._editor.model.document, 'change:data', this._throttledSave );

		return Promise.resolve()
			.then( () => this._destructor( this._editor ) )
			.then( () => {
				this._editor = null;

				return this;
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
		if ( version < this._lastDocumentVersion ) {
			this._throttledSave.cancel();

			return;
		}

		try {
			this._data = this._editor.getData();
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
	 * Checks if the event error comes from the editor that is handled by the watchdog (by checking the error context) and
	 * restarts the editor. It handles {@link module:utils/ckeditorerror~CKEditorError CKEditorError errors} only.
	 *
	 * @private
	 * @fires error
	 * @param {Event} event Error event.
	 */
	_handleGlobalErrorEvent( event ) {
		if ( !event.error.is || !event.error.is( 'CKEditorError' ) ) {
			return;
		}

		if ( event.error.context === undefined ) {
			console.error( 'The error is missing its context and Watchdog cannot restart the proper editor.' );

			return;
		}

		// In some cases the editor should not be restarted - e.g. in case of the editor initialization.
		if ( event.error.context === null ) {
			return;
		}

		if ( this._isErrorComingFromThisEditor( event.error ) ) {
			this.crashes.push( {
				message: event.error.message,
				source: event.source,
				lineno: event.lineno,
				colno: event.colno
			} );

			this.fire( 'error' );

			if ( this.crashes.length <= this._crashNumberLimit ) {
				this.restart();
			}
		}
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
	 * A shortcut method for creating the Watchdog. For the full usage see the
	 * {@link ~Watchdog Watchdog class description}.
	 *
	 * Usage:
	 *
	 * 		const watchdog = Watchdog.for( ClassicEditor );
	 *
	 * 		watchdog.create( elementOrData, config ).then( editor => {} );
	 *
	 * @param {*} Editor The editor class.
	 */
	static for( Editor ) {
		const watchdog = new Watchdog();

		watchdog.setCreator( ( elementOrData, config ) => Editor.create( elementOrData, config ) );
		watchdog.setDestructor( editor => editor.destroy() );

		return watchdog;
	}

	/**
	 * Fired when an error occurs and the watchdog will be restarting the editor.
	 *
	 * @event error
	 */

	/**
	 * Fired after the watchdog restarts the error in case of a crash or when the `restart()` method was called explicitly.
	 *
	 * @event restart
	 */
}

mix( Watchdog, EmitterMixin );
