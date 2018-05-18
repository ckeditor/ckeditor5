/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/pendingactions
 */

import Plugin from './plugin';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * List of editor pending actions.
 *
 * This plugin should be used to synchronise plugins that execute long-lasting actions
 * (i.e. file upload) with the editor integration. It gives a developer, who integrates the editor,
 * an easy way to check if there are any pending action whenever such information is needed.
 * All plugins, which register pending action provides also a message what action is ongoing
 * which can be displayed to a user and let him decide if he wants to interrupt the action or wait.
 *
 * Adding and updating pending action:
 *
 * 		const pendingActions = editor.plugins.get( 'PendingActions' );
 * 		const action = pendingActions.add( 'Upload in progress 0%' );
 *
 * 		action.message = 'Upload in progress 10%';
 *
 * Removing pending action:
 *
 * 		const pendingActions = editor.plugins.get( 'PendingActions' );
 * 		const action = pendingActions.add( 'Unsaved changes.' );
 *
 * 		pendingActions.remove( action );
 *
 * Getting pending actions:
 *
 * 		const pendingActions = editor.plugins.get( 'PendingActions' );
 *
 * 		const action1 = pendingActions.add( 'Action 1' );
 * 		const action2 = pendingActions.add( 'Action 2' );
 *
 * 		pendingActions.first // Returns action1
 * 		Array.from( pendingActions ) // Returns [ action1, action2 ]
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
	init() {
		/**
		 * Defines whether there is any registered pending action or not.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isPending
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
	}

	/**
	 * Adds action to the list of pending actions.
	 *
	 * This method returns an action object with observable message property.
	 * The action object can be later used in the remove method. It also allows you to change the message.
	 *
	 * @param {String} message Action message.
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
