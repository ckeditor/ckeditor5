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

//  This plugin is not able to interrupt actions or manage that in any other way.

/**
 * List of editor pending actions.
 *
 * This plugin should be used to synchronise plugins that execute long-lasting actions
 * (i.e. file upload) with the editor integration. It gives a developer, who integrates the editor,
 * an easy way to check if there are any pending action whenever such information is needed.
 * All plugins, which register pending action provides also a message what action is ongoing
 * which can be displayed to a user and let him decide if he wants to interrupt the action or wait.
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
				domEvt.returnValue = this.first.message;
			}
		} );
	}

	/**
	 * Adds action to the list of pending actions.
	 *
	 * This method returns an action object with observable message property.
	 * The action object can be later used in the remove method. It also allows you to change the message.
	 *
	 *		const pendingActions = editor.plugins.get( 'PendingActions' );
	 * 		const action = pendingActions.add( 'Upload in progress 0%' );
	 *
	 * 		action.message = 'Upload in progress 10%';
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
	 * Returns first action from the list.
	 *
	 * 		const pendingActions = editor.plugins.get( 'PendingActions' );
	 *
	 * 		pendingActions.add( 'Action 1' );
	 * 		pendingActions.add( 'Action 2' );
	 *
	 *		pendingActions.first // Returns 'Action 1'
	 *		Array.from( pendingActions ) // Returns [ 'Action 1', 'Action 2' ]
	 *
	 * returns {Object} Pending action object.
	 */
	get first() {
		return this._actions.get( 0 );
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
