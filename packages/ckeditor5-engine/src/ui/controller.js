/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Collection from '../collection.js';
import Model from '../model.js';
import CKEditorError from '../ckeditorerror.js';

export default class Controller extends Model {
	/**
	 * Creates an instance of the {@link Controller} class.
	 *
	 * @param {Model} [model] Model of this Controller.
	 * @param {View} [view] View instance of this Controller.
	 * @constructor
	 */
	constructor( model, view ) {
		super();

		/**
		 * Model of this controller.
		 *
		 * @property {Model}
		 */
		this.model = model || null;

		/**
		 * Set `true` after {@link #init}.
		 *
		 * @property {Boolean}
		 */
		this.ready = false;

		/**
		 * View of this controller.
		 *
		 * @property {View}
		 */
		this.view = view || null;

		/**
		 * A collection of {@link ControllerCollection} instances containing
		 * child controllers.
		 *
		 * @property {Collection}
		 */
		this.collections = new Collection( {
			idProperty: 'name'
		} );

		// Listen to {@link ControllerCollection#add} and {@link ControllerCollection#remove}
		// of newly added Collection to synchronize this controller's view and children
		// controllers' views in the future.
		this.collections.on( 'add', ( evt, collection ) => {
			// Set the {@link ControllerCollection#parent} to this controller.
			// It allows the collection to determine the {@link #ready} state of this controller
			// and accordingly initialize a child controller when added.
			collection.parent = this;

			this.listenTo( collection, 'add', ( evt, childController, index ) => {
				// Child view is added to corresponding region in this controller's view
				// when a new Controller joins the collection.
				if ( this.ready && childController.view ) {
					this.view.regions.get( collection.name ).views.add( childController.view, index );
				}
			} );

			this.listenTo( collection, 'remove', ( evt, childController ) => {
				// Child view is removed from corresponding region in this controller's view
				// when a new Controller is removed from the the collection.
				if ( this.ready && childController.view ) {
					this.view.regions.get( collection.name ).views.remove( childController.view );
				}
			} );
		} );

		this.collections.on( 'remove', ( evt, collection ) => {
			// Release the collection. Once removed from {@link #collections}, it can be
			// moved to another controller.
			collection.parent = null;

			this.stopListening( collection );
		} );
	}

	/**
	 * Initializes the controller instance. The process includes:
	 *
	 * 1. Initialization of the child {@link #view}.
	 * 2. Initialization of child controllers in {@link #collections}.
	 * 3. Setting {@link #ready} flag `true`.
	 *
	 * @returns {Promise} A Promise resolved when the initialization process is finished.
	 */
	init() {
		if ( this.ready ) {
			/**
			 * This Controller already been initialized.
			 *
			 * @error ui-controller-init-reinit
			 */
			throw new CKEditorError( 'ui-controller-init-reinit: This Controller already been initialized.' );
		}

		return Promise.resolve()
			.then( this._initView.bind( this ) )
			.then( this._initCollections.bind( this ) )
			.then( () => {
				this.ready = true;
			} );
	}

	/**
	 * Destroys the controller instance. The process includes:
	 *
	 * 1. Destruction of the child {@link #view}.
	 * 2. Destruction of child controllers in {@link #collections}.
	 *
	 * @returns {Promise} A Promise resolved when the destruction process is finished.
	 */
	destroy() {
		let promises = [];
		let collection, childController;

		for ( collection of this.collections ) {
			for ( childController of collection ) {
				promises.push( childController.destroy() );
				collection.remove( childController );
			}

			this.collections.remove( collection );
		}

		if ( this.view ) {
			promises.push( Promise.resolve().then( () => {
				return this.view.destroy();
			} ) );
		}

		promises.push( Promise.resolve().then( () => {
			this.model = this.ready = this.view = this.collections = null;
		} ) );

		return Promise.all( promises );
	}

	/**
	 * Initializes the {@link #view} of this controller instance.
	 *
	 * @protected
	 * @returns {Promise} A Promise resolved when initialization process is finished.
	 */
	_initView() {
		let promise = Promise.resolve();

		if ( this.view ) {
			promise = promise.then( this.view.init.bind( this.view ) );
		}

		return promise;
	}

	/**
	 * Initializes the {@link #collections} of this controller instance.
	 *
	 * @protected
	 * @returns {Promise} A Promise resolved when initialization process is finished.
	 */
	_initCollections() {
		const promises = [];
		let collection, childController;

		for ( collection of this.collections ) {
			for ( childController of collection ) {
				if ( this.view && childController.view ) {
					this.view.regions.get( collection.name ).views.add( childController.view );
				}

				promises.push( childController.init() );
			}
		}

		return Promise.all( promises );
	}
}
