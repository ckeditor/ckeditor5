/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'collection',
	'model',
	'ckeditorerror',
], function( Collection, Model, CKEditorError ) {
	class Controller extends Model {
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
			 * Collections of child controllers.
			 *
			 * @private
			 * @property {Collection}
			 */
			this._collections = new Collection( {
				idProperty: 'name'
			} );
		}

		/**
		 * Initializes the controller instance. The process includes:
		 *  1. Initialization of the child {@link #view}.
		 *  2. Initialization of child controllers in {@link #_collections}.
		 *  3. Setting {@link #ready} flag `true`.
		 *
		 * @returns {Promise} A Promise resolved when the initialization process is finished.
		 */
		init() {
			if ( this.ready ) {
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
		 * Initializes the {@link #_collections} of this controller instance.
		 *
		 * @protected
		 * @returns {Promise} A Promise resolved when initialization process is finished.
		 */
		_initCollections() {
			const promises = [];
			let collection, childController;

			for ( collection of this._collections ) {
				for ( childController of collection ) {
					if ( this.view, childController.view ) {
						this.view.addChild( collection.name, childController.view );
					}

					promises.push( childController.init() );
				}
			}

			return Promise.all( promises );
		}

		/**
		 * Adds a child controller to one of the {@link #_collections} (see {@link #register}).
		 * If this controller instance is ready, the child view will be initialized when added.
		 * If this controller and child controller have views, the child view will be added
		 * to corresponding region in this controller's view.
		 *
		 * @param {String} collectionName One of {@link #_collections} the child should be added to.
		 * @param {Controller} childController A child controller.
		 * @param {Number} [index] Index at which the child will be added to the collection.
		 * @returns {Promise} A Promise resolved when the child is added.
		 */
		addChild( collectionName, childController, index ) {
			if ( !collectionName ) {
				throw new CKEditorError( 'ui-controller-addchild-badcname' );
			}

			const collection = this._collections.get( collectionName );

			if ( !collection ) {
				throw new CKEditorError( 'ui-controller-addchild-nocol' );
			}

			if ( !childController || !( childController instanceof Controller ) ) {
				throw new CKEditorError( 'ui-controller-addchild-badtype' );
			}

			// ChildController.init() returns Promise.
			let promise = Promise.resolve();

			collection.add( childController, index );

			if ( this.ready ) {
				if ( childController.view ) {
					this.view.addChild( collectionName, childController.view, index );
				}

				if ( !childController.ready ) {
					promise = promise.then( () => {
						return childController.init();
					} );
				}
			}

			return promise;
		}

		/**
		 * Removes a child controller from one of the {@link #_collections} (see {@link #register}).
		 * If this controller and child controller have views, the child view will be removed
		 * from corresponding region in this controller's view.
		 *
		 * @param {String} collectionName One of {@link #_collections} the child should be removed from.
		 * @param {Controller} childController A child controller.
		 * @returns {Controller} A child controller instance after removal.
		 */
		removeChild( collectionName, childController ) {
			if ( !collectionName ) {
				throw new CKEditorError( 'ui-controller-removechild-badcname' );
			}

			const collection = this._collections.get( collectionName );

			if ( !collection ) {
				throw new CKEditorError( 'ui-controller-removechild-nocol' );
			}

			if ( !childController || !( childController instanceof Controller ) ) {
				throw new CKEditorError( 'ui-controller-removechild-badtype' );
			}

			collection.remove( childController );

			if ( this.ready && childController.view ) {
				this.view.removeChild( collectionName, childController.view );
			}

			return childController;
		}

		/**
		 * Returns a child controller from one of the {@link #_collections}
		 * (see {@link #register}) at given `index`.
		 *
		 * @param {String} collectionName One of {@link #_collections} the child should be retrieved from.
		 * @param {Number} [index] An index of desired controller.
		 * @returns {Controller} A child controller instance.
		 */
		getChild( collectionName, index ) {
			const collection = this._collections.get( collectionName );

			if ( !collection ) {
				throw new CKEditorError( 'ui-controller-getchild-nocol' );
			}

			return collection.get( index );
		}

		/**
		 * Registers a collection in {@link #_collections}.
		 *
		 * @param {String} collectionName The name of the collection to be registered.
		 * @param {Collection} collection Collection to be registered.
		 * @param {Boolean} [override] When set `true` it will allow overriding of registered collections.
		 */
		register( collectionName, collection, override ) {
			const registered = this._collections.get( collectionName );
			const that = this;

			if ( !( collection instanceof Collection ) ) {
				throw new CKEditorError( 'ui-controller-register-badtype' );
			}

			if ( !registered ) {
				add( collection );
			} else {
				if ( registered !== collection ) {
					if ( !override ) {
						throw new CKEditorError( 'ui-controller-register-noverride' );
					}

					that._collections.remove( registered );
					add( collection );
				}
			}

			function add() {
				collection.name = collectionName;
				that._collections.add( collection );
			}
		}

		/**
		 * Destroys the controller instance. The process includes:
		 *  1. Destruction of the child {@link #view}.
		 *  2. Destruction of child controllers in {@link #_collections}.
		 *
		 * @returns {Promise} A Promise resolved when the destruction process is finished.
		 */
		destroy() {
			let promises = [];
			let collection, childController;

			for ( collection of this._collections ) {
				for ( childController of collection ) {
					if ( this.view && childController.view ) {
						this.view.removeChild( collection.name, childController.view );
					}

					promises.push( childController.destroy() );

					collection.remove( childController );
				}

				this._collections.remove( collection );
			}

			if ( this.view ) {
				promises.push( Promise.resolve().then( () => {
					return this.view.destroy();
				} ) );
			}

			promises.push( Promise.resolve().then( () => {
				this.model = this.ready = this.view = this._collections = null;
			} ) );

			return Promise.all( promises );
		}
	}

	return Controller;
} );
