/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

/**
 * @module autosave/autosave
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

/* globals window */

/**
 * Autosave plugin provides an easy-to-use API to save the editor's content.
 * It watches {module:engine/model/document~Document#event:change:data change:data}
 * and `Window:beforeunload` events and calls the provider's save method.
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
 *						// Note: saveEditorsContentToDatabase function might be async and return a promise to the saving action.
 *						return saveEditorsContentToDatabase( data );
 *					}
 *				};
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
		 * @type {module:autosave/autosave~SaveProvider}
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

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.model.document;
		const pendingActions = editor.plugins.get( PendingActions );

		this.listenTo( doc, 'change:data', () => {
			this._addAction();

			const willOriginalFunctionBeCalled = this._throttledSave();

			if ( !willOriginalFunctionBeCalled ) {
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

	/**
	 * @inheritDoc
	 */
	destroy() {
		const wasPendingCallCanceled = this._throttledSave.cancel();
		if ( wasPendingCallCanceled ) {
			this._removeAction();
		}

		this._domEmitter.stopListening();
		super.destroy();
	}

	/**
	 * Invokes remaining call (if exists) in the throttled save function.
	 *
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

		// Marker's change may not produce an operation, so the document's version
		// can be the same after that change.
		if ( !this.provider || version < this._lastDocumentVersion ) {
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
 * Throttle function - a helper that provides ability to specify minimum time gap between calling an original function.
 * Comparing to the lodash implementation, this provides an information if calling the throttled function will result in
 * calling the original function and whether canceling throttling will actually cancel some pending call.
 *
 * @private
 * @param {Function} fn Original function that will be called.
 * @param {Number} time Amount of time between calling the original function.
 */
function throttle( fn, time ) {
	let lastCallTime = 0;
	let scheduledCall = false;
	let callId = 0;

	// @returns {Boolean} `true` if the original function was or will be called.
	function throttledFn() {
		const now = Date.now();

		// Call instantly, as the fn wasn't called within the `time` period.
		if ( now > lastCallTime + time ) {
			call();
			return true;
		}

		// Cancel call, as the next call is scheduled.
		if ( scheduledCall ) {
			return false;
		}

		// Set timeout, so the fn will be called `time` ms after the last call.
		scheduledCall = true;
		window.setTimeout( call, lastCallTime + time - now, callId );

		return true;
	}

	throttledFn.cancel = cancel;
	throttledFn.flush = flush;

	// @returns {Boolean} `true` if some pending call was canceled.
	function cancel() {
		const wasScheduledCall = scheduledCall;
		scheduledCall = false;
		lastCallTime = 0;
		callId++;

		return wasScheduledCall;
	}

	function flush() {
		if ( scheduledCall ) {
			call();
		}

		scheduledCall = false;
		lastCallTime = 0;
		callId++;
	}

	// Call the function if the callId variables wasn't increased in meantime.
	// Increasing the `callId` means canceling the original call.
	// @param {Number} [id]
	function call( id = callId ) {
		if ( id !== callId ) {
			return;
		}

		lastCallTime = Date.now();
		scheduledCall = false;

		fn();
	}

	return throttledFn;
}
