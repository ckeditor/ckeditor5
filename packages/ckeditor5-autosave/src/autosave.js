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
import throttle from './throttle';

/* globals window */

/**
 * Autosave plugin provides an easy-to-use API to save the editor's content.
 * It watches {@link module:engine/model/document~Document#event:change:data change:data}
 * and `window#beforeunload` events and calls the {@link module:autosave/autosave~Adapter#save} method.
 *
 * 		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				plugins: [ ArticlePluginSet, Autosave ],
 *				toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
 *				image: {
 *					toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
 *				},
 *				autosave: {
 *					save() {
 *						// Note: saveEditorsContentToDatabase function should return a promise
 *						// which should be resolved when the saving action is complete.
 *						return saveEditorsContentToDatabase( data );
 *					}
 *				}
 *			} );
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
		 * The adapter is an object with the `save()` method. That method will be called whenever
		 * the model's data changes. It might be called some time after the change,
		 * since the event is throttled for performance reasons.
		 *
		 * @type {module:autosave/autosave~Adapter}
		 */
		this.adapter = undefined;

		/**
		 * Throttled save method.
		 *
		 * @protected
		 * @type {Function}
		 */
		this._throttledSave = throttle( this._save.bind( this ), 500 );

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
		 * Save action counter monitors number of actions.
		 *
		 * @private
		 * @type {Number}
		 */
		this._saveActionCounter = 0;

		/**
		 * An action that will be added to pending action manager for actions happening in that plugin.
		 *
		 * @private
		 * @type {Object|null}
		 */
		this._action = null;

		/**
		 * Plugins' config.
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

		this.listenTo( doc, 'change:data', () => {
			this._incrementCounter();

			const willOriginalFunctionBeCalled = this._throttledSave();

			if ( !willOriginalFunctionBeCalled ) {
				this._decrementCounter();
			}
		} );

		// Flush on the editor's destroy listener with the highest priority to ensure that
		// `editor.getData()` will be called before plugins are destroyed.
		this.listenTo( editor, 'destroy', () => this._flush(), { priority: 'highest' } );

		// It's not possible to easy test it because karma uses `beforeunload` event
		// to warn before full page reload and this event cannot be dispatched manually.
		/* istanbul ignore next */
		this._domEmitter.listenTo( window, 'beforeunload', ( evtInfo, domEvt ) => {
			if ( this._pendingActions.isPending ) {
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
		this._throttledSave.flush();
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

		const saveCallbacks = [];

		if ( this.adapter && this.adapter.save ) {
			saveCallbacks.push( this.adapter.save );
		}

		if ( this._config.save ) {
			saveCallbacks.push( this._config.save );
		}

		// Change may not produce an operation, so the document's version
		// can be the same after that change.
		if (
			version < this._lastDocumentVersion ||
			!saveCallbacks.length ||
			this.editor.state === 'initializing'
		) {
			this._throttledSave.flush();
			this._decrementCounter();

			return;
		}

		this._lastDocumentVersion = version;

		// Wait one promise cycle to be sure that:
		// 1. The save method is always asynchronous.
		// 2. Save callbacks are not called inside conversions or while editor's state changes.
		Promise.resolve()
			.then( () => Promise.all(
				saveCallbacks.map( cb => cb() )
			) )
			.then( () => {
				this._decrementCounter();
			} );
	}

	/**
	 * Increments counter and adds pending action if it not exists.
	 *
	 * @private
	 */
	_incrementCounter() {
		this._saveActionCounter++;

		if ( !this._action ) {
			this._action = this._pendingActions.add( 'Saving in progress.' );
		}
	}

	/**
	 * Decrements counter and removes pending action if counter is empty,
	 * which means, that no new save action occurred.
	 *
	 * @private
	 */
	_decrementCounter() {
		this._saveActionCounter--;

		if ( this._saveActionCounter === 0 ) {
			this._pendingActions.remove( this._action );
			this._action = null;
		}
	}
}

/**
 * An interface that requires the `save()` method.
 *
 * Used by {module:autosave/autosave~Autosave#adapter}
 *
 * @interface module:autosave/autosave~Adapter
 */

/**
 * Method that will be called when the data model changes. It should return a promise (e.g. in case of saving content to the database),
 * so the `Autosave` plugin will wait for that action before removing it from pending actions.
 *
 * @method #save
 * @returns {Promise.<*>}
 */
