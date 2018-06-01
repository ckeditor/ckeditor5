/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

/* globals window */

/**
 * Autosave plugin provides an easy-to-use API to save the editor's content.
 * It watches `Document:change`, and `Window:beforeunload` events and calls the provider's save method.
 *
 * 		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				plugins: [ ArticlePluginSet, Autosave ],
 *				toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
 *				image: {
 *					toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
 *				}
 *			} )
 *			.then( editor => {
 *				const autosave = editor.plugins.get( Autosave );
 *				autosave.provider = {
 *					save() {
 *						const data = editor.getData();
 *
 *						// Note: saveEditorsContentToDatabase function should return a promise
 *						// to pending action or be sync.
 *						return saveEditorsContentToDatabase( data );
 *					}
 *				};
 *			} );
 */
export default class Autosave extends Plugin {
	static get pluginName() {
		return 'Autosave';
	}

	static get requires() {
		return [ PendingActions ];
	}

	constructor( editor ) {
		super( editor );

		/**
		 * @member {module:autosave/autosave~SaveProvider}
		 */
		this.provider = undefined;

		/**
		 * @protected
		 * @type {Function}
		 */
		this._throttledSave = throttle( this._save.bind( this ), 500 );

		/**
		 * @protected
		 * @type {Number}
		 */
		this._lastDocumentVersion = editor.model.document.version;

		/**
		 * @private
		 * @type {DomEmitterMixin}
		 */
		this._domEmitter = Object.create( DomEmitterMixin );

		/**
		 * @private
		 * @type {Number}
		 */
		this._saveActionCounter = 0;

		/**
		 * @private
		 * @type {Object|null}
		 */
		this._action = null;
	}

	init() {
		const editor = this.editor;
		const doc = editor.model.document;
		const pendingActions = editor.plugins.get( PendingActions );

		this.listenTo( doc, 'change:data', () => {
			this._addAction();

			const isCancelled = this._throttledSave();

			if ( isCancelled ) {
				this._removeAction();
			}
		} );

		// Flush on the editor's destroy listener with the highest priority to ensure that
		// `editor.getData()` will be called before plugins are destroyed.
		this.listenTo( editor, 'destroy', () => this._flush(), { priority: 'highest' } );

		// It's not possible to easy test it because karma uses `beforeunload` event
		// to warn before full page reload and this event cannot be dispatched manually.
		/* istanbul ignore next */
		this._domEmitter.listenTo( window, 'beforeunload', ( evtInfo, domEvt ) => {
			if ( pendingActions.isPending ) {
				domEvt.returnValue = pendingActions.first.message;
			}
		} );
	}

	destroy() {
		const isCanceled = this._throttledSave.cancel();
		if ( isCanceled ) {
			this._removeAction();
		}

		this._domEmitter.stopListening();
		super.destroy();
	}

	/**
	 * @protected
	 */
	_flush() {
		this._throttledSave.flush();
	}

	/**
	 * If the provider is set and new document version exists,
	 * `_save()` method creates a pending action and calls `provider.save()` method.
	 * It waits for the result and then removes the created pending action.
	 *
	 * @private
	 */
	_save() {
		const version = this.editor.model.document.version;

		if ( !this.provider || version <= this._lastDocumentVersion ) {
			this._removeAction();

			return;
		}

		this._lastDocumentVersion = version;

		Promise.resolve( this.provider.save() )
			.then( () => {
				this._removeAction();
			} );
	}

	/**
	 * @private
	 */
	_addAction() {
		this._saveActionCounter++;

		if ( !this.action ) {
			const pendingActions = this.editor.plugins.get( PendingActions );
			this.action = pendingActions.add( 'Saving in progress.' );
		}
	}

	/**
	 * @private
	 */
	_removeAction() {
		this._saveActionCounter--;

		if ( this._saveActionCounter === 0 ) {
			const pendingActions = this.editor.plugins.get( PendingActions );
			pendingActions.remove( this.action );
			this.action = null;
		}
	}
}

/**
 * @interface module:autosave/autosave~SaveProvider
 */

/**
 * Method that will be called when the data model changes.
 *
 * @method #save
 * @returns {Promise.<*>|undefined}
 */

/**
 * @param {Number} time
 */
function throttle( fn, time ) {
	let lastCall = 0;
	let scheduledCall = false;
	let callId = 0;

	// @returns {Boolean} `true` if the call is canceled.
	function throttledFn() {
		const now = Date.now();

		// Call instantly, as the fn wasn't called within the `time` period.
		if ( now > lastCall + time ) {
			call( callId );
			return false;
		}

		// Cancel call, as the next call is scheduled.
		if ( scheduledCall ) {
			return true;
		}

		// Set timeout, so the fn will be called `time` ms after the last call.
		scheduledCall = true;
		window.setTimeout( call, lastCall + time - now, callId );

		return false;
	}

	throttledFn.cancel = cancel;
	throttledFn.flush = flush;

	// @returns {Boolean} `true` if the call is canceled.
	function cancel() {
		const wasScheduledCall = scheduledCall;
		scheduledCall = false;
		lastCall = 0;
		callId++;

		return wasScheduledCall;
	}

	function flush() {
		if ( scheduledCall ) {
			call( callId );
		}

		scheduledCall = false;
		lastCall = 0;
		callId++;
	}

	function call( id ) {
		if ( id !== callId ) {
			return;
		}

		lastCall = Date.now();
		scheduledCall = false;

		fn();
	}

	return throttledFn;
}
