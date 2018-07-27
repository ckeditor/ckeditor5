/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module autosave/autosave
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import debounce from '@ckeditor/ckeditor5-utils/src/lib/lodash/debounce';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/* globals window */

/**
 * The {@link module:autosave/autosave~Autosave} allows you to automatically save the data (e.g. send it to the server)
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
 * Read more about this feature in the {@glink builds/guides/integration/saving-data#the-autosave-feature Autosave feature}
 * section of the {@glink builds/guides/integration/saving-data Saving and getting data}.
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

		/**
		 * The adapter is an object with a `save()` method. That method will be called whenever
		 * the data changes. It might be called some time after the change,
		 * since the event is throttled for performance reasons.
		 *
		 * @member {module:autosave/autosave~AutosaveAdapter} #adapter
		 */

		/**
		 * Throttled save method.
		 *
		 * @protected
		 * @type {Function}
		 */
		this._debouncedSave = debounce( this._save.bind( this ), 2000 );

		/**
		 * Last document version.
		 *
		 * @protected
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
		 * The state of this plugin.
		 *
		 * @private
		 * @type {'initial'|'debounced-saving'|'external-saving'}
		 */
		this.set( '_state', 'initial' );

		/**
		 * An action that will be added to pending action manager for actions happening in that plugin.
		 *
		 * @private
		 * @member {Object} #_action
		 */

		/**
		 * The config of this plugins.
		 *
		 * @private
		 * @type {Object}
		 */
		this._config = editor.config.get( 'autosave' ) || {};

		/**
		 * Editor's pending actions manager.
		 *
		 * @private
		 * @member {@module:core/pendingactions~PendingActions} #_pendingActions
		 */
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.model.document;

		this._pendingActions = editor.plugins.get( PendingActions );

		// this._state = 'initial';

		this.listenTo( doc, 'change:data', () => {
			if ( !this._saveCallbacks.length ) {
				return;
			}

			if ( this._state == 'initial' ) {
				this._action = this._pendingActions.add( this.editor.t( 'Saving changes' ) );
				this._state = 'debounced-saving';

				this._debouncedSave();
			}

			else if ( this._state == 'debounced-saving' ) {
				this._debouncedSave();
			}

			// Do nothing if the plugin is in `external-saving` state.
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
	 * Invokes remaining `_save` method call.
	 *
	 * @protected
	 */
	_flush() {
		this._debouncedSave.flush();
	}

	/**
	 * If the adapter is set and new document version exists,
	 * `_save()` method creates a pending action and calls `adapter.save()` method.
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

		this._state = 'external-saving';

		// Wait one promise cycle to be sure that save callbacks are not called
		// inside a conversion or when the editor's state changes.
		Promise.resolve()
			.then( () => Promise.all(
				this._saveCallbacks.map( cb => cb( this.editor ) )
			) )
			.then( () => {
				if ( this.editor.model.document.version > this._lastDocumentVersion ) {
					this._state = 'debounced-saving';
					this._debouncedSave();
				} else {
					this._state = 'initial';
					this._pendingActions.remove( this._action );
					this._action = null;
				}
			} );
	}

	/**
	 * Save callbacks.
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
 * Used by {module:autosave/autosave~Autosave#adapter}
 *
 * @interface module:autosave/autosave~AutosaveAdapter
 */

/**
 * Method that will be called when the data changes. It should return a promise (e.g. in case of saving content to the database),
 * so the `Autosave` plugin will wait for that action before removing it from pending actions.
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
 * This function must return a promise which should be which should be resolved when the data is successfully saved.
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
