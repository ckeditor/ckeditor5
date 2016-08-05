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
	 * manage list–like components. See {@link ui.ControllerCollection#bind} to learn more.
	 *
	 * @param {String} name Name of the collection.
	 * @param {utils.Locale} [locale] The {@link core.editor.Editor#locale editor's locale} instance.
	 */
	constructor( name, locale ) {
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
		 * See {@link ui.View#locale}
		 *
		 * @readonly
		 * @member {utils.Locale} ui.ControllerCollection#locale
		 */
		this.locale = locale;

		/**
		 * Parent controller of this collection.
		 *
		 * @member {ui.Controller} ui.ControllerCollection#parent
		 */
		this.parent = null;
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
	 * The entire collection of controllers reflects changes to the collection of the models, working as a factory.
	 *
	 * This method helps bringing complex list–like UI components to life out of the data (like models). The process
	 * can be automatic:
	 *
	 *		// This collection stores models.
	 *		const models = new Collection( { idProperty: 'label' } );
	 *
	 *		// This controller collection will become a factory for the collection of models.
	 *		const controllers = new ControllerCollection( 'foo', locale );
	 *
	 *		// Activate the binding – since now, this controller collection works like a **factory**.
	 *		controllers.bind( models ).as( FooController, FooView );
	 *
	 *		// As new models arrive to the collection, each becomes an instance of FooController (FooView)
	 *		// in the controller collection.
	 *		models.add( new Model( { label: 'foo' } ) );
	 *		models.add( new Model( { label: 'bar' } ) );
	 *
	 *		console.log( controllers.length == 2 );
	 *
	 *		// Controller collection is updated as the model is removed.
	 *		models.remove( 0 );
	 *		console.log( controllers.length == 1 );
	 *
	 * or the factory can be driven by a custom callback:
	 *
	 *		// This collection stores any kind of data.
	 *		const data = new Collection();
	 *
	 *		// This controller collection will become a custom factory for the data.
	 *		const controllers = new ControllerCollection( 'foo', locale );
	 *
	 *		// Activate the binding – the **factory** is driven by a custom callback.
	 *		controllers.bind( data ).as( ( item, locale ) => {
	 *			if ( item.foo == 'bar' ) {
	 *				return new BarController( ..., BarView( locale ) );
	 *			} else {
	 *				return new DifferentController( ..., DifferentView( locale ) );
	 *			}
	 *		} );
	 *
	 *		// As new data arrive to the collection, each is handled individually by the callback.
	 *		// This will produce BarController.
	 *		data.add( { foo: 'bar' } );
	 *
	 *		// And this one will become DifferentController.
	 *		data.add( { foo: 'baz' } );
	 *
	 *		console.log( controllers.length == 2 );
	 *
	 *		// Controller collection is updated as the data is removed.
	 *		data.remove( 0 );
	 *		console.log( controllers.length == 1 );
	 *
	 * @param {utils.Collection.<ui.Model>} collection Models to be synchronized with this controller collection.
	 * @returns {Function} The `as` function in the `bind( collection ).as( ... )` chain.
	 * It activates factory using controller and view classes or uses a custom callback to produce
	 * controller (view) instances.
	 * @param {Function} return.ControllerClassOrFunction Specifies the constructor of the controller to be used or
	 * a custom callback function which produces controllers.
	 * @param {Function} [return.ViewClass] Specifies constructor of the view to be used. If not specified,
	 * `ControllerClassOrFunction` works as as custom callback function.
	 */
	bind( collection ) {
		const controllerMap = new Map();

		return {
			as: ( ControllerClassOrFunction, ViewClass ) => {
				const factory = ViewClass ?
						defaultControllerFactory( ControllerClassOrFunction, ViewClass, controllerMap )
					:
						genericControllerFactory( ControllerClassOrFunction, controllerMap );

				for ( let item of collection ) {
					this.add( factory.create( item, this.locale ) );
				}

				// Updated controller collection when a new item is added.
				collection.on( 'add', ( evt, item, index ) => {
					this.add( factory.create( item, this.locale ), index );
				} );

				// Update controller collection when a item is removed.
				collection.on( 'remove', ( evt, item ) => {
					this.remove( factory.delete( item ) );
				} );
			}
		};
	}
}

// Initializes a generic controller factory.
//
// @param {Function} createController A function which returns controller instance if provided with data and locale.
// @param {Map} controllerMap A Map used to associate data in the collection with corresponding controller instance.
// @returns {Object}
function genericControllerFactory( createController, controllerMap ) {
	return {
		// Returns a controller instance (and its view) for given data (i.e. Model) and locale.
		//
		// @param {Object} data A data to creates the controller, usually {@link ui.Model}.
		// @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
		// @returns {ui.Controller}
		create( data, locale ) {
			const controller = createController( data, locale );

			controllerMap.set( data, controller );

			return controller;
		},

		// Deletes controller instance in the factory by associated data and returns
		// the controller instance.
		//
		// @param {Object} data A data associated with the controller, usually {@link ui.Model}.
		// @returns {ui.Controller}
		delete( data ) {
			const controller = controllerMap.get( data );

			controllerMap.delete( controller );

			return controller;
		}
	};
}

// Initializes controller factory with controller and view classes.
//
// @param {Function} ControllerClass Specifies the constructor of the controller to be used.
// @param {Function} ViewClass Specifies constructor of the view.
// @param {Map} controllerMap A Map used to associate data in the collection with corresponding controller instance.
// @returns {Object}
function defaultControllerFactory( ControllerClass, ViewClass, controllerMap ) {
	return genericControllerFactory( ( model, locale ) => {
		return new ControllerClass( model, new ViewClass( locale ) );
	}, controllerMap );
}
