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
	 *			if ( !item.foo ) {
	 *				return null;
	 *			} else if ( item.foo == 'bar' ) {
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
	 *		// Also there will be no controller for data without property `foo`.
	 *		data.add( {} );
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
	 * @returns {Function} return.ControllerClassOrFunction Specifies the constructor of the controller to be used or
	 * a custom callback function which produces controllers.
	 * @returns {Function} [return.ViewClass] Specifies constructor of the view to be used. If not specified,
	 * `ControllerClassOrFunction` works as as custom callback function.
	 */
	bind( collection ) {
		const controllerMap = new Map();
		const that = this;

		return {
			as: ( ControllerClassOrFunction, ViewClass ) => {
				const handler = ViewClass ?
						defaultControllerHandler( ControllerClassOrFunction, ViewClass )
					:
						genericControllerHandler( ControllerClassOrFunction );

				for ( let item of collection ) {
					handler.add( item );
				}

				// Updated controller collection when a new item is added.
				collection.on( 'add', ( evt, item, index ) => {
					handler.add( item, index );
				} );

				// Update controller collection when a item is removed.
				collection.on( 'remove', ( evt, item ) => {
					handler.remove( item );
				} );
			}
		};

		function genericControllerHandler( createController ) {
			return {
				add( data, index ) {
					const controller = createController( data, that.locale );

					controllerMap.set( data, controller );

					if ( controller ) {
						that.add( controller, index ? recalculateIndex( index ) : undefined );
					}
				},

				remove( data ) {
					const controller = controllerMap.get( data );

					controllerMap.delete( controller );

					if ( controller ) {
						that.remove( controller );
					}
				}
			};
		}

		// Decrement index for each item which has no corresponding controller.
		function recalculateIndex( index ) {
			let outputIndex = index;

			for ( let i = 0; i < index; i++ ) {
				// index -> data -> controller
				if ( !controllerMap.get( collection.get( i ) ) ) {
					outputIndex--;
				}
			}

			return outputIndex;
		}

		function defaultControllerHandler( ControllerClass, ViewClass ) {
			return genericControllerHandler( ( model ) => {
				return new ControllerClass( model, new ViewClass( that.locale ) );
			}, controllerMap );
		}
	}

	/**
	 * Delegates selected events coming from within controller models in the collection to desired
	 * {@link utils.EmitterMixin}. For instance:
	 *
	 *		const modelA = new Model();
	 *		const modelB = new Model();
	 *		const modelC = new Model();
	 *
	 *		const controllers = new ControllerCollection( 'name' );
	 *
	 *		controllers.delegate( 'eventX' ).to( modelB );
	 *		controllers.delegate( 'eventX', 'eventY' ).to( modelC );
	 *
	 *		controllers.add( new Controller( modelA, ... ) );
	 *
	 * then `eventX` is delegated (fired by) `modelB` and `modelC` along with `customData`:
	 *
	 *		modelA.fire( 'eventX', customData );
	 *
	 * and `eventY` is delegated (fired by) `modelC` along with `customData`:
	 *
	 *		modelA.fire( 'eventY', customData );
	 *
	 * See {@link utils.EmitterMixin#delegate}.
	 *
	 * @param {...String} events {@link ui.Controller#model} event names to be delegated to another {@link utils.EmitterMixin}.
	 * @returns {ui.ControllerCollection#delegate#to}
	 */
	delegate( ...events ) {
		if ( !events.length || !isStringArray( events ) ) {
			/**
			 * All event names must be strings.
			 *
			 * @error ui-controllercollection-delegate-wrong-events
			 */
			throw new CKEditorError( 'ui-controllercollection-delegate-wrong-events: All event names must be strings.' );
		}

		return {
			/**
			 * Selects destination for {@link utils.EmitterMixin#delegate} events.
			 *
			 * @method ui.ControllerCollection.delegate#to
			 * @param {utils.EmitterMixin} dest An `EmitterMixin` instance which is the destination for delegated events.
			 */
			to: ( dest ) => {
				// Activate delegating on existing controllers in this collection.
				for ( let controller of this ) {
					for ( let evtName of events ) {
						controller.model.delegate( evtName ).to( dest );
					}
				}

				// Activate delegating on future controllers in this collection.
				this.on( 'add', ( evt, controller ) => {
					for ( let evtName of events ) {
						controller.model.delegate( evtName ).to( dest );
					}
				} );

				// Deactivate delegating when controller is removed from this collection.
				this.on( 'remove', ( evt, controller ) => {
					for ( let evtName of events ) {
						controller.model.stopDelegating( evtName, dest );
					}
				} );
			}
		};
	}
}

// Check if all entries of the array are of `String` type.
//
// @private
// @param {Array} arr An array to be checked.
// @returns {Boolean}
function isStringArray( arr ) {
	return arr.every( a => typeof a == 'string' );
}
