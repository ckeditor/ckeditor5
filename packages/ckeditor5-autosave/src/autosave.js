/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module autosave/autosave
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { debounce } from 'lodash-es';

/* globals window */

/**
 * The {@link module:autosave/autosave~Autosave} plugin allows you to automatically save the data (e.g. send it to the server)
 * when needed (when the user changed the content).
 *
 * It listens to the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`}
 * and `window#beforeunload` events and calls the
 * {@link module:autosave/autosave~AutosaveAdapter#save `config.autosave.save()`} function.
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				plugins: [ ArticlePluginSet, Autosave ],
 *				toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
 *				image: {
 *					toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
 *				},
 *				autosave: {
 *					save( editor ) {
 *						// The saveData() function must return a promise
 *						// which should be resolved when the data is successfully saved.
 *						return saveData( editor.getData() );
 *					}
 *				}
 *			} );
 *
 * Read more about this feature in the {@glink builds/guides/integration/saving-data#autosave-feature Autosave feature}
 * section of the {@glink builds/guides/integration/saving-data Saving and getting data}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Autosave extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Autosave';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ PendingActions ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		const config = editor.config.get( 'autosave' ) || {};

		// A minimum amount of time that needs to pass after the last action.
		// After that time the provided save callbacks are being called.
		const waitingTime = config.waitingTime || 1000;

		/**
		 * The adapter is an object with a `save()` method. That method will be called whenever
		 * the data changes. It might be called some time after the change,
		 * since the event is throttled for performance reasons.
		 *
		 * @member {module:autosave/autosave~AutosaveAdapter} #adapter
		 */

		/**
		 * The state of this plugin.
		 *
		 * The plugin can be in the following states:
		 *
		 * * synchronized &ndash; When all changes are saved.
		 * * waiting &ndash; When the plugin is waiting for other changes before calling `adapter#save()` and `config.autosave.save()`.
		 * * saving &ndash; When the provided save method is called and the plugin waits for the response.
		 * * error &ndash When the provided save method will throw an error. This state immediately changes to the `saving` state and
		 * the save method will be called again in the short period of time.
		 *
		 * @member {'synchronized'|'waiting'|'saving'} #state
		 */
		this.set( 'state', 'synchronized' );

		/**
		 * Debounced save method. The `save()` method is called the specified `waitingTime` after `debouncedSave()` is called,
		 * unless a new action happens in the meantime.
		 *
		 * @private
		 * @type {Function}
		 */
		this._debouncedSave = debounce( this._save.bind( this ), waitingTime );

		/**
		 * The last document version.
		 *
		 * @private
		 * @type {Number}
		 */
		this._lastDocumentVersion = editor.model.document.version;

		/**
		 * DOM emitter.
		 *
		 * @private
		 * @type {DomEmitterMixin}
		 */
		this._domEmitter = Object.create( DomEmitterMixin );

		/**
		 * The configuration of this plugins.
		 *
		 * @private
		 * @type {Object}
		 */
		this._config = config;

		/**
		 * An action that will be added to pending action manager for actions happening in that plugin.
		 *
		 * @private
		 * @member {Object} #_action
		 */

		/**
		 * Editor's pending actions manager.
		 *
		 * @private
		 * @member {module:core/pendingactions~PendingActions} #_pendingActions
		 */
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.model.document;
		const t = editor.t;

		this._pendingActions = editor.plugins.get( PendingActions );

		this.listenTo( doc, 'change:data', () => {
			if ( !this._saveCallbacks.length ) {
				return;
			}

			if ( this.state == 'synchronized' ) {
				this._action = this._pendingActions.add( t( 'Saving changes' ) );
				this.state = 'waiting';

				this._debouncedSave();
			}

			else if ( this.state == 'waiting' ) {
				this._debouncedSave();
			}

			// If the plugin is in `saving` state, it will change its state later basing on the `document.version`.
			// If the `document.version` will be higher than stored `#_lastDocumentVersion`, then it means, that some `change:data`
			// event has fired in the meantime.
		} );

		// Flush on the editor's destroy listener with the highest priority to ensure that
		// `editor.getData()` will be called before plugins are destroyed.
		this.listenTo( editor, 'destroy', () => this._flush(), { priority: 'highest' } );

		// It's not possible to easy test it because karma uses `beforeunload` event
		// to warn before full page reload and this event cannot be dispatched manually.
		/* istanbul ignore next */
		this._domEmitter.listenTo( window, 'beforeunload', ( evtInfo, domEvt ) => {
			if ( this._pendingActions.hasAny ) {
				domEvt.returnValue = this._pendingActions.first.message;
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		// There's no need for canceling or flushing the throttled save, as
		// it's done on the editor's destroy event with the highest priority.

		this._domEmitter.stopListening();
		super.destroy();
	}

	/**
	 * Invokes the remaining `_save()` method call.
	 *
	 * @protected
	 */
	_flush() {
		this._debouncedSave.flush();
	}

	/**
	 * If the adapter is set and a new document version exists,
	 * the `_save()` method creates a pending action and calls the `adapter.save()` method.
	 * It waits for the result and then removes the created pending action.
	 *
	 * @private
	 */
	_save() {
		const version = this.editor.model.document.version;

		// Change may not produce an operation, so the document's version
		// can be the same after that change.
		if (
			version < this._lastDocumentVersion ||
			this.editor.state === 'initializing'
		) {
			this._debouncedSave.cancel();

			return;
		}

		this._lastDocumentVersion = version;

		this.state = 'saving';

		// Wait one promise cycle to be sure that save callbacks are not called
		// inside a conversion or when the editor's state changes.
		Promise.resolve()
			.then( () => Promise.all(
				this._saveCallbacks.map( cb => cb( this.editor ) )
			) )
			// In case of an error re-try the save later and throw the original error.
			// Being in the `saving` state ensures that the debounced save action
			// won't be delayed further by the `change:data` event listener.
			.catch( err => {
				this.state = 'error';
				// Change immediately to the `saving` state so the `change:state` event will be fired.
				this.state = 'saving';

				this._debouncedSave();

				throw err;
			} )
			.then( () => {
				if ( this.editor.model.document.version > this._lastDocumentVersion ) {
					this.state = 'waiting';
					this._debouncedSave();
				} else {
					this.state = 'synchronized';
					this._pendingActions.remove( this._action );
					this._action = null;
				}
			} );
	}

	/**
	 * Saves callbacks.
	 *
	 * @private
	 * @type {Array.<Function>}
	 */
	get _saveCallbacks() {
		const saveCallbacks = [];

		if ( this.adapter && this.adapter.save ) {
			saveCallbacks.push( this.adapter.save );
		}

		if ( this._config.save ) {
			saveCallbacks.push( this._config.save );
		}

		return saveCallbacks;
	}
}

mix( Autosave, ObservableMixin );

/**
 * An interface that requires the `save()` method.
 *
 * Used by {@link module:autosave/autosave~Autosave#adapter}.
 *
 * @interface module:autosave/autosave~AutosaveAdapter
 */

/**
 * The method that will be called when the data changes. It should return a promise (e.g. in case of saving content to the database),
 * so the autosave plugin will wait for that action before removing it from pending actions.
 *
 * @method #save
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {Promise.<*>}
 */

/**
 * The configuration of the {@link module:autosave/autosave~Autosave autosave feature}.
 *
 * Read more in {@link module:autosave/autosave~AutosaveConfig}.
 *
 * @member {module:autosave/autosave~AutosaveConfig} module:core/editor/editorconfig~EditorConfig#autosave
 */

/**
 * The configuration of the {@link module:autosave/autosave~Autosave autosave feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				autosave: {
 *					save( editor ) {
 *						// The saveData() function must return a promise
 *						// which should be resolved when the data is successfully saved.
 *						return saveData( editor.getData() );
 *					}
 *				}
 *			} );
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * See also the demo of the {@glink builds/guides/integration/saving-data#autosave-feature autosave feature}.
 *
 * @interface AutosaveConfig
 */

/**
 * The callback to be executed when the data needs to be saved.
 *
 * This function must return a promise which should be resolved when the data is successfully saved.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				autosave: {
 *					save( editor ) {
 *						return saveData( editor.getData() );
 *					}
 *				}
 *			} );
 *			.then( ... )
 *			.catch( ... );
 *
 * @method module:autosave/autosave~AutosaveConfig#save
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {Promise.<*>}
 */

/**
 * The minimum amount of time that needs to pass after the last action to call the provided callback.
 * By default it is 1000 ms.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				autosave: {
 *					save( editor ) {
 *						return saveData( editor.getData() );
 *					},
 *					waitingTime: 2000
 *				}
 *			} );
 *			.then( ... )
 *			.catch( ... );
 *
 * @member {Number} module:autosave/autosave~AutosaveConfig#waitingTime
 */
