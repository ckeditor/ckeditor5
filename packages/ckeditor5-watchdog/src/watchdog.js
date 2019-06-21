/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/watchdog
 */

/* globals console, window, EventTarget */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import { throttle } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * A Watchdog for CKEditor 5 editors.
 *
 * It keeps the {@link module:core/editor/editor~Editor editor} instance running. If some error occurs in the editor it tries to
 * restart it to the previous state.
 *
 * It does not handle errors during editor initialization and editor destruction.
 */
export default class Watchdog {
	/**
	 * @param {Object} config
	 * @param {Number} config.crashNumberLimit
	 * @param {Number} config.waitingTime
	 */
	constructor( { crashNumberLimit, waitingTime } = {} ) {
		/**
		 * @public
		 * @readonly
		 * @type {Array.<Object>}
		 */
		this.crashes = [];

		/**
		 * @private
		 * @type {Number}
		 */
		this._crashNumberLimit = crashNumberLimit || 3;

		/**
		 * @private
		 * @type {Function}
		 */
		this._boundErrorWatcher = this._watchForEditorErrors.bind( this );

		/**
		 * Throttled save method. The `save()` method is called the specified `waitingTime` after `throttledSave()` is called,
		 * unless a new action happens in the meantime.
		 *
		 * @private
		 * @type {Function}
		 */
		this._throttledSave = throttle( this._save.bind( this ), waitingTime || 5000 );

		/**
		 * @private
		 * @type {Editor}
		 */
		this._editor = null;

		/**
		 * @private
		 * @member {Function} _creator
		 */

		/**
		 * @private
		 * @member {Function} _destructor
		 */

		/**
		 * @private
		 * @member {String} _data
		 */

		/**
		 * The last document version.
		 *
		 * @private
		 * @member {Number} _lastDocumentVersion
		 */

		/**
		* The editor source element.
		*
		* @private
		* @member {HTMLElement} _element
		*/

		/**
		* The editor configuration.
		*
		* @private
		* @member {Object|undefined} _config
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
	 * @param {Function} creator
	 */
	setCreator( creator ) {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for editor destruction.
	 * It accepts functions that returns promises or undefined.
	 *
	 * @param {Function} destructor
	 */
	setDestructor( destructor ) {
		this._destructor = destructor;
	}

	/**
	 * Restarts the editor instance.
	 *
	 * @returns {Promise.<module:core/editor/editor~Editor>}
	 */
	restart() {
		this._throttledSave.flush();

		return Promise.resolve()
			.then( () => this.destroy() )
			.then( () => {
				const updatedConfig = Object.assign( {}, this._config, {
					initialData: this._data
				} );

				return this.create( this._element, updatedConfig );
			} )
			.then( () => {
				this.fire( 'restart' );
			} );
	}

	/**
	 * @param {HTMLElement|module:core/editor/editorconfig~EditorConfig} element
	 * @param {module:core/editor/editorconfig~EditorConfig} [config]
	 *
	 * @returns {Promise.<Watchdog>}
	 */
	create( element, config ) {
		if ( !this._creator ) {
			/**
			 * @error watchdog-creator-not-defined
			 *
			 * The watchdog creator is not defined, define it using `watchdog.setCreator()`.
			 */
			throw new CKEditorError(
				'watchdog-creator-not-defined: The watchdog creator is not defined, define it using `watchdog.setCreator()`.',
				undefined,
				{}
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
				undefined,
				{}
			);
		}

		this._element = element;
		this._config = config;

		return Promise.resolve()
			.then( () => this._creator( element, config ) )
			.then( editor => {
				this._editor = editor;

				window.addEventListener( 'error', this._boundErrorWatcher );
				this.listenTo( editor.model.document, 'change:data', this._throttledSave );

				this._lastDocumentVersion = editor.model.document.version;
				this._data = editor.getData();

				return this;
			} );
	}

	/**
	 * Destroys the current editor.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		window.removeEventListener( 'error', this._boundErrorWatcher );
		this.stopListening( this._editor.model.document, 'change:data', this._throttledSave );

		return Promise.resolve()
			.then( () => this._destructor( this._editor ) )
			.then( () => {
				this._editor = null;
			} );
	}

	/**
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
	 * @private
	 * @param {ErrorEvent} event
	 */
	_watchForEditorErrors( event ) {
		if ( !event.error.is || !event.error.is( 'CKEditorError' ) ) {
			return;
		}

		if ( !event.error.ctx ) {
			console.error( 'The error is missing its context and Watchdog cannot restart the proper editor.' );

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
	 * @private
	 * @param {module:utils/ckeditorerror~CKEditorError} error
	 */
	_isErrorComingFromThisEditor( error ) {
		return (
			areElementsConnected( this._editor, error.ctx ) ||
			areElementsConnected( error.ctx, this._editor )
		);
	}
}

mix( Watchdog, EmitterMixin );

// Returns `true` when the second parameter can be found from the first by walking through
// the first argument.
function areElementsConnected( from, searchedElement ) {
	const nodes = [ from ];

	// Elements are stored to prevent infinite looping.
	const storedElements = new WeakSet();

	while ( nodes.length > 0 ) {
		// BFS should be faster.
		const node = nodes.shift();

		if ( node === searchedElement ) {
			return true;
		}

		if ( storedElements.has( node ) || shouldNodeBeSkipped( node ) ) {
			continue;
		}

		storedElements.add( node );

		if ( Array.isArray( node ) ) {
			nodes.push( ...node );
		} else {
			nodes.push( ...Object.values( node ) );
		}
	}

	return false;
}

function shouldNodeBeSkipped( obj ) {
	const type = Object.prototype.toString.call( obj );

	return (
		type === '[object Number]' ||
		type === '[object Boolean]' ||
		type === '[object String]' ||
		type === '[object Function]' ||
		type === '[object Date]' ||

		obj === undefined ||
		obj === null ||

		// Skip native DOM objects, e.g. Window, nodes, events, etc.s
		obj instanceof EventTarget
	);
}
