/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Collection from '../utils/collection.js';
import CKEditorError from '../utils/ckeditorerror.js';

/**
 * Manages UI Controllers.
 *
 * @memberOf ui
 * @extends utils.Collection
 */
export default class ControllerCollection extends Collection {
	/**
	 * Creates an instance of the controller collection, initializing it with a name:
	 *
	 *		const collection = new ControllerCollection( 'foo' );
	 *		collection.add( someController );
	 *
	 * **Note**: If needed, controller collection can stay in sync with a collection of models to
	 * manage list–like components. See {@link ui.ControllerCollection._sync} to learn more.
	 *
	 * @param {String} name Name of the collection.
	 * @param {utils.Collection.<ui.Model>} [models] Models to be synchronized with this controller collection.
	 * @param {Function} [ControllerClass] Specifies the constructor of the controller to be used for each model.
	 * @param {Function} [ViewClass] Specifies constructor of the view.
	 */
	constructor( name, models, ControllerClass, ViewClass ) {
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
		 * @member {String} ui.ControllerCollection#name
		 */
		this.name = name;

		/**
		 * Parent controller of this collection.
		 *
		 * @member {ui.Controller} ui.ControllerCollection#parent
		 */
		this.parent = null;

		if ( models ) {
			this._sync( models, ControllerClass, ViewClass );
		}
	}

	/**
	 * Adds a child controller to the collection. If {@link ui.ControllerCollection#parent} {@link ui.Controller}
	 * instance is ready, the child view is initialized when added.
	 *
	 * @param {ui.Controller} controller A child controller.
	 * @param {Number} [index] Index at which the child will be added to the collection.
	 * @returns {Promise} A Promise resolved when the child {@link ui.Controller#init} is done.
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

	/**
	 * Synchronizes controller collection with a {@link utils.Collection} of {@link ui.Model} instances.
	 * The entire collection of controllers reflects changes to the collection of the models.
	 *
	 * This method helps bringing complex list–like UI components to life out of the data (model).
	 *
	 *		const models = new Collection();
	 *		const controllers = new ControllerCollection( 'foo', models, FooController, FooView );
	 *
	 *		// Each model becomes an instance of FooController and FooView in the controller collection.
	 *		models.add( new Model( { ... } ) );
	 *		models.add( new Model( { ... } ) );
	 *		console.log( controllers.length == 2 );
	 *
	 *		// Controller collection is updated as the model is removed.
	 *		models.remove( ... );
	 *		console.log( controllers.length == 1 );
	 *
	 * @param {utils.Collection.<ui.Model>} models Models to be synchronized with this controller collection.
	 * @param {Function} ControllerClass Specifies the constructor of the controller to be used.
	 * @param {Function} ViewClass Specifies constructor of the view.
	 */
	_sync( models, ControllerClass, ViewClass ) {
		const idProperty = models._idProperty;

		for ( let model of models ) {
			// TODO: View locale.
			this.add( getController( model, ControllerClass, ViewClass, idProperty ) );
		}

		// Updated controller collection when a new model is added.
		models.on( 'add', ( evt, model, index ) => {
			this.add( getController( model, ControllerClass, ViewClass, idProperty ), index );
		} );

		// Update controller collection when a model is removed.
		models.on( 'remove', ( evt, model ) => {
			this.remove( model[ idProperty ] );
		} );
	}
}

// Returns a controller instance (with a view) for given model and class names.
//
// @param {ui.Model} model A model of the controller.
// @param {Function} ControllerClass Specifies the constructor of the controller to be used.
// @param {Function} ViewClass Specifies constructor of the view.
// @param {String} idProperty A property used to associate the controller with its model {@link utils.Collection._idProperty}.
// @returns {ui.Controller}
function getController( model, ControllerClass, ViewClass, idProperty ) {
	let controller = new ControllerClass( model, new ViewClass() );

	// Give the new controller an id corresponding with _idProperty of the model.
	// It allows retrieving this controller instance by the model in the future
	// and avoids a brute–force search in the entire controller collection.
	controller.id = model[ idProperty ];

	return controller;
}
