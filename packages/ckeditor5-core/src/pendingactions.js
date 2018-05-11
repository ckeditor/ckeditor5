/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/pendingactions
 */

/* global window */

import Plugin from './plugin';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import DOMEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * List of editor pending actions.
 *
 * Any asynchronous action that should be finished before the editor destroy (like file upload) should be registered
 * in this plugin and removed after finish.
 *
 * This plugin listens to `window#beforeunload` event and displays browser prompt when a pending action is in progress.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PendingActions extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PendingActions';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * DOM Emitter.
		 *
		 * @private
		 * @type {module:utils/dom/emittermixin~EmitterMixin}
		 */
		this._domEmitter = Object.create( DOMEmitterMixin );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		/**
		 * Defines whether there is any registered pending action or not.
		 *
		 * @readonly
		 * @observable
		 * @type {Boolean} #isPending
		 */
		this.set( 'isPending', false );

		/**
		 * List of pending actions.
		 *
		 * @private
		 * @type {module:utils/collection~Collection}
		 */
		this._actions = new Collection( { idProperty: '_id' } );
		this._actions.delegate( 'add', 'remove' ).to( this );

		// It's not possible to easy test it because karma uses `beforeunload` event
		// to warn before full page reload and this event cannot be dispatched manually.
		/* istanbul ignore next */
		this._domEmitter.listenTo( window, 'beforeunload', ( evtInfo, domEvt ) => {
			if ( this.isPending ) {
				domEvt.returnValue = this._actions.get( 0 ).message;
			}
		} );
	}

	/**
	 * Adds action to the list of pending actions.
	 *
	 * Methods returns an object with observable message property. Message can be changed.
	 *
	 * @param {String} message
	 * @returns {Object} Observable object that represents a pending action.
	 */
	add( message ) {
		if ( typeof message !== 'string' ) {
			/**
			 * Message has to be a string.
			 *
			 * @error pendingactions-add-invalid-message
			 */
			throw new CKEditorError( 'pendingactions-add-invalid-message: Message has to be a string.' );
		}

		const action = Object.create( ObservableMixin );

		action.set( 'message', message );
		this._actions.add( action );
		this.isPending = true;

		return action;
	}

	/**
	 * Removes action from the list of pending actions.
	 *
	 * @param {Object} action Action object.
	 */
	remove( action ) {
		this._actions.remove( action );
		this.isPending = !!this._actions.length;
	}

	/**
	 * Iterable interface.
	 *
	 * @returns {Iterable.<*>}
	 */
	[ Symbol.iterator ]() {
		return this._actions[ Symbol.iterator ]();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();
		this._domEmitter.stopListening();
	}

	/**
	 * Fired when an action is added to the list.
	 *
	 * @event add
	 * @param {Object} action The added action.
	 */

	/**
	 * Fired when an action is removed from the list.
	 *
	 * @event remove
	 * @param {Object} action The removed action.
	 */
}
