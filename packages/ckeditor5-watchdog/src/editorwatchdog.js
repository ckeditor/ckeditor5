/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/editorwatchdog
 */

/* globals console */

import { throttle, cloneDeepWith, isElement } from 'lodash-es';
import areConnectedThroughProperties from '@ckeditor/ckeditor5-utils/src/areconnectedthroughproperties';
import Watchdog from './watchdog';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * A watchdog for CKEditor 5 editors.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export default class EditorWatchdog extends Watchdog {
	/**
	 * @param {module:watchdog/watchdog~WatchdogConfig} [config] The watchdog plugin configuration.
	 */
	constructor( config = {} ) {
		super( config );

		/**
		 * The current editor instance.
		 *
		 * @private
		 * @type {module:core/editor/editor~Editor}
		 */
		this._editor = null;

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
		 * @member {HTMLElement|String|Object.<String|String>} #_elementOrData
		 */

		/**
		 * The editor configuration.
		 *
		 * @private
		 * @member {Object|undefined} #_config
		 */

		this._destructor = editor => editor.destroy();
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
	 * Sets the function that is responsible for the editor creation.
	 * It expects a function that should return a promise.
	 *
	 *		watchdog.setCreator( ( element, config ) => ClassicEditor.create( element, config ) );
	 *
	 * @abstract
	 * @method setCreator
	 * @param {Function} creator
	 */

	/**
	 * Sets the function that is responsible for the editor destruction.
	 * Overrides the default destruction function, which destroys only the editor instance.
	 * It expects a function that should return a promise or `undefined`.
	 *
	 *		watchdog.setDestructor( editor => {
	 *			// Do something before the editor is destroyed.
	 *
	 *			return editor
	 *				.destroy()
	 *				.then( () => {
	 *					// Do something after the editor is destroyed.
	 *				} );
	 *		} );
	 *
	 * @abstract
	 * @method setDestructor
	 * @param {Function} destructor
	 */

	/** @param {Context} */
	updateContext( context ) {
		this._config.context = context;
	}

	/**
	 * Restarts the editor instance. This method is called whenever an editor error occurs. It fires the `restart` event and changes
	 * the state to `initializing`.
	 *
	 * @public
	 * @fires restart
	 * @returns {Promise}
	 */
	async _restart() {
		this.state = 'initializing';

		try {
			await this._destroy();
		} catch ( err ) {
			console.error( 'An error happened during the editor destructing.', err );
		}

		if ( typeof this._elementOrData === 'string' ) {
			await this.create( this._data, this._config );
		} else {
			const updatedConfig = Object.assign( {}, this._config, {
				initialData: this._data
			} );

			await this.create( this._elementOrData, updatedConfig );
		}

		this.fire( 'restart' );
	}

	/**
	 * Creates a watched editor instance using the creator passed to the {@link #setCreator `setCreator()`} method or
	 * the {@link module:watchdog/watchdog~Watchdog.for `Watchdog.for()`} helper.
	 *
	 * @param {HTMLElement|String|Object.<String|String>} elementOrData
	 * @param {module:core/editor/editorconfig~EditorConfig} [config]
	 *
	 * @returns {Promise}
	 */
	async create( elementOrData = this._elementOrData, config = this._config ) {
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

		super._startErrorHandling();

		this._elementOrData = elementOrData;

		// Clone configuration because it might be shared within multiple watchdog instances. Otherwise,
		// when an error occurs in one of these editors, the watchdog will restart all of them.
		this._config = this._cloneConfig( config );

		// console.log( this._config.context.toString() );

		const editor = await this._creator( elementOrData, this._config );

		this._editor = editor;

		this.listenTo( editor.model.document, 'change:data', this._throttledSave );

		this._lastDocumentVersion = editor.model.document.version;
		this._data = this._getData();

		this.state = 'ready';
	}

	/**
	 * Destroys the current editor instance by using the destructor passed to the {@link #setDestructor `setDestructor()`} method
	 * and sets state to `destroyed`.
	 *
	 * @returns {Promise}
	 */
	async destroy() {
		this.state = 'destroyed';

		return this._destroy();
	}

	async _destroy() {
		this._stopErrorHandling();

		// Save data if there is a remaining editor data change.
		this._throttledSave.flush();

		const editor = this._editor;

		this._editor = null;

		await this._destructor( editor );
	}

	/**
	 * Saves the editor data, so it can be restored after the crash even if the data cannot be fetched at
	 * the moment of the crash.
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
	 * Traverses both structures to find out whether the error context is connected
	 * with the current editor.
	 *
	 * @private
	 * @param {module:utils/ckeditorerror~CKEditorError} error
	 */
	_isErrorComingFromThisInstance( error ) {
		// TODO - remove context from the path.

		return areConnectedThroughProperties( this._editor, error.context );
	}

	_cloneConfig( config ) {
		return cloneDeepWith( config, ( value, key ) => {
			// Leave DOM references.
			if ( isElement( value ) ) {
				return value;
			}

			if ( key === 'context' ) {
				return context;
			}
		} );
	}

	/**
	 * A shorthand method for creating an instance of the watchdog. For the full usage, see the
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
		const watchdog = new this( watchdogConfig );

		watchdog.setCreator( ( elementOrData, config ) => Editor.create( elementOrData, config ) );

		return watchdog;
	}

	/**
	 * Fired after the watchdog restarts the error in case of a crash.
	 *
	 * @event restart
	 */
}

/**
 * The watchdog plugin configuration.
 *
 * @typedef {Object} WatchdogConfig
 *
 * @property {Number} [crashNumberLimit=3] A threshold specifying the number of editor crashes
 * when the watchdog stops restarting the editor in case of errors.
 * After this limit is reached and the time between last errors is shorter than `minimumNonErrorTimePeriod`
 * the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
 * @property {Number} [minimumNonErrorTimePeriod=5000] An average amount of milliseconds between last editor errors
 * (defaults to 5000). When the period of time between errors is lower than that and the `crashNumberLimit` is also reached
 * the watchdog changes its state to `crashedPermanently` and it stops restarting the editor. This prevents an infinite restart loop.
 * @property {Number} [saveInterval=5000] A minimum number of milliseconds between saving editor data internally, (defaults to 5000).
 * Note that for large documents this might have an impact on the editor performance.
 */
