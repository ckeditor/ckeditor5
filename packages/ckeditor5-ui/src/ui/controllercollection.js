/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Collection from '../collection.js';
import CKEditorError from '../ckeditorerror.js';

/**
 * Manages UI Controllers.
 *
 * @class ControllerCollection
 * @extends Collection
 */
export default class ControllerCollection extends Collection {
	/**
	 * Creates an instance of the ControllerCollection class, initializing it with a name.
	 *
	 * @constructor
	 */
	constructor( name ) {
		super();

		if ( !name ) {
			/**
			 * ControllerCollection must be initialized with a name.
			 *
			 * @error ui-controllercollection-no-name
			 */
			throw new CKEditorError( 'ui-controllercollection-no-name: ControllerCollection must be initialized with a name.' );
		}

		/**
		 * Name of this collection.
		 *
		 * @property {String}
		 */
		this.name = name;

		/**
		 * Parent controller of this collection.
		 *
		 * @property {Controller}
		 */
		this.parent = null;
	}

	/**
	 * Adds a child controller to the collection. If {@link #parent} {@link Controller}
	 * instance is ready, the child view is initialized when added.
	 *
	 * @param {Controller} controller A child controller.
	 * @param {Number} [index] Index at which the child will be added to the collection.
	 * @returns {Promise} A Promise resolved when the child {@link Controller#init} is done.
	 */
	add( controller, index ) {
		super.add( controller, index );

		// ChildController.init() returns Promise.
		let promise = Promise.resolve();

		if ( this.parent && this.parent.ready && !controller.ready ) {
			promise = promise.then( () => {
				return controller.init();
			} );
		}

		return promise;
	}
}
