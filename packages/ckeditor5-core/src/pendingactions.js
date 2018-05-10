/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/pendingactions
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
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
	}

	/**
	 * Adds action to the list of pending actions.
	 *
	 * @param {String} message
	 */
	add( message ) {
		if ( typeof message !== 'string' ) {
			throw new CKEditorError( 'pendingactions-add-invalid-message: Message has to be a string.' );
		}

		const observable = Object.create( ObservableMixin );

		observable.set( 'message', message );
		this._actions.add( observable );
		this.isPending = true;

		return observable;
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
}
