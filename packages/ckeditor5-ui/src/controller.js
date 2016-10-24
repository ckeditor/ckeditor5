/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Collection from '../utils/collection.js';
import ControllerCollection from './controllercollection.js';
import CKEditorError from '../utils/ckeditorerror.js';
import EmitterMixin from '../utils/emittermixin.js';
import mix from '../utils/mix.js';

const anon = '$anonymous';

/**
 * Basic Controller class.
 *
 * @memberOf ui
 * @mixes utils.EmitterMixin
 */
export default class Controller {
	/**
	 * Creates an instance of the {@link ui.Controller} class.
	 *
	 * @param {ui.Model} [model] Model of this Controller.
	 * @param {ui.View} [view] View instance of this Controller.
	 */
	constructor( model, view ) {
		/**
		 * Model of this controller.
		 *
		 * @member {ui.Model} ui.Controller#model
		 */
		this.model = model || null;

		/**
		 * Set `true` after {@link #init}.
		 *
		 * @member {Boolean} ui.Controller#ready
		 */
		this.ready = false;

		/**
		 * View of this controller.
		 *
		 * @member {ui.View} ui.Controller#view
		 */
		this.view = view || null;

		/**
		 * A collection of {@link ControllerCollection} instances containing
		 * child controllers.
		 *
		 * @member {utils.Collection} ui.Controller#collections
		 */
		this.collections = new Collection( {
			idProperty: 'name'
		} );

		/**
		 * Anonymous collection of this controller instance. It groups child controllers
		 * which are not to be handled by `Controller#collections`–to–`View#region`
		 * automation. It also means their views must be handled individually
		 * by the view, i.e. passed as members of {@link ui.TemplateDefinition#children}.
		 *
		 * @protected
		 * @member {ui.ControllerCollection} ui.Controller#_anonymousCollection
		 */
		this.collections.add( this._anonymousCollection = new ControllerCollection( anon ) );

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
				this.fire( 'ready' );
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
			}

			collection.clear();
		}

		this.collections.clear();

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
	 * Adds a new collection to {@link ui.Controller#collections}.
	 *
	 * @param {String} collectionName Name of the controller collection.
	 * @returns {ui.ControllerCollection} The new collection instance.
	 */
	addCollection( collectionName ) {
		const collection = new ControllerCollection( collectionName, this.view && this.view.locale );

		this.collections.add( collection );

		return collection;
	}

	/**
	 * Adds a child {@link Controller} instance to {@link #collections} at given index.
	 *
	 *		// Adds child to the specified collection. The collection name
	 *		// must correspond with the region name in parent.view#regions.
	 *		parent.add( 'collection-name', child );
	 *
	 *		// Adds child to the specified collection at specific index.
	 *		// The collection name must correspond with the region name in parent.view#regions.
	 *		parent.add( 'collection-name', child, 3 );
	 *
	 *		// Adds child to the {@link ui.Controller#_anonymousCollection} in the parent. In such case,
	 *		// parent#view must put the child#view in the correct place in parent.view#template
	 *		// because there's no association between the {@link ui.Controller#_anonymousCollection}
	 *		// and any of the regions.
	 *		parent.add( child );
	 *
	 * @param {String|ui.Controller} collectionNameOrController Name of the collection or the controller instance.
	 * @param {ui.Controller} [controller] A controller instance to be added.
	 * @param {Number} [index] An index in the collection.
	 * @returns {Promise} A Promise resolved when the child {@link ui.Controller#init} is done.
	 */
	add( ...args ) {
		if ( args[ 0 ] instanceof Controller ) {
			return this._anonymousCollection.add( ...args );
		} else {
			return this.collections.get( args[ 0 ] ).add( args[ 1 ], args[ 2 ] );
		}
	}

	/**
	 * Removes a child {@link ui.Controller} instance from one of {@link ui.Controller#collections}.
	 *
	 * **Note**: To remove children from {@link ui.Controller#_anonymousCollection}, use the following syntax
	 *
	 *		parent.remove( child );
	 *
	 * @param {String|ui.Controller} collectionNameOrController Name of the collection or the controller instance.
	 * @param {ui.Controller|Number} [toRemove] A Controller instance or index to be removed.
	 * @returns {Object} The removed item.
	 */
	remove( collectionNameOrController, toRemove ) {
		if ( collectionNameOrController instanceof Controller ) {
			return this._anonymousCollection.remove( collectionNameOrController );
		} else {
			return this.collections.get( collectionNameOrController ).remove( toRemove );
		}
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
				// Anonymous collection {@link ui.Controller#_anonymousCollection} does not allow
				// automated controller-to-view binding, because there's no such thing as
				// anonymous Region in the View instance.
				if ( !isAnonymous( collection ) && this.view && childController.view ) {
					this.view.regions.get( collection.name ).views.add( childController.view );
				}

				promises.push( childController.init() );
			}
		}

		return Promise.all( promises );
	}
}

mix( Controller, EmitterMixin );

// Checks whether the collection is anonymous.
//
// @private
// @param {ui.ControllerCollection} collection
// @returns {Boolean}
function isAnonymous( collection ) {
	return collection.name == anon;
}

/**
 * Fired when the controller is fully initialized.
 *
 * @event ui.Controller#ready
 */
