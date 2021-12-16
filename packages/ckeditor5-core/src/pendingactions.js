/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/pendingactions
 */

import ContextPlugin from './contextplugin';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * The list of pending editor actions.
 *
 * This plugin should be used to synchronise plugins that execute long-lasting actions
 * (e.g. file upload) with the editor integration. It gives the developer who integrates the editor
 * an easy way to check if there are any actions pending whenever such information is needed.
 * All plugins that register a pending action also provide a message about the action that is ongoing
 * which can be displayed to the user. This lets them decide if they want to interrupt the action or wait.
 *
 * Adding and updating a pending action:
 *
 * 		const pendingActions = editor.plugins.get( 'PendingActions' );
 * 		const action = pendingActions.add( 'Upload in progress: 0%.' );
 *
 *		// You can update the message:
 * 		action.message = 'Upload in progress: 10%.';
 *
 * Removing a pending action:
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
 * 		pendingActions.first; // Returns action1
 * 		Array.from( pendingActions ); // Returns [ action1, action2 ]
 *
 * This plugin is used by features like {@link module:upload/filerepository~FileRepository} to register their ongoing actions
 * and by features like {@link module:autosave/autosave~Autosave} to detect whether there are any ongoing actions.
 * Read more about saving the data in the {@glink builds/guides/integration/saving-data Saving and getting data} guide.
 *
 * @extends module:core/contextplugin~ContextPlugin
 */
export default class PendingActions extends ContextPlugin {
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
		 * Defines whether there is any registered pending action.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #hasAny
		 */
		this.set( 'hasAny', false );

		/**
		 * A list of pending actions.
		 *
		 * @private
		 * @type {module:utils/collection~Collection}
		 */
		this._actions = new Collection( { idProperty: '_id' } );
		this._actions.delegate( 'add', 'remove' ).to( this );
	}

	/**
	 * Adds an action to the list of pending actions.
	 *
	 * This method returns an action object with an observable message property.
	 * The action object can be later used in the {@link #remove} method. It also allows you to change the message.
	 *
	 * @param {String} message The action message.
	 * @returns {Object} An observable object that represents a pending action.
	 */
	add( message ) {
		if ( typeof message !== 'string' ) {
			/**
			 * The message must be a string.
			 *
			 * @error pendingactions-add-invalid-message
			 */
			throw new CKEditorError( 'pendingactions-add-invalid-message', this );
		}

		const action = Object.create( ObservableMixin );

		action.set( 'message', message );
		this._actions.add( action );
		this.hasAny = true;

		return action;
	}

	/**
	 * Removes an action from the list of pending actions.
	 *
	 * @param {Object} action An action object.
	 */
	remove( action ) {
		this._actions.remove( action );
		this.hasAny = !!this._actions.length;
	}

	/**
	 * Returns the first action from the list or null when list is empty
	 *
	 * returns {Object|null} The pending action object.
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
