/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'collection',
	'model'
], function( Collection, Model ) {
	class Controller extends Model {
		/**
		 * @constructor
		 */
		constructor( model, view ) {
			super();

			/**
			 * Model of this controller.
			 */
			this.model = model;

			/**
			 * View of this controller.
			 */
			this.view = view;

			/**
			 * Collections of child controller regions.
			 */
			this.regions = new Collection( {
				idProperty: 'name'
			} );
		}

		/**
		 * @param
		 * @returns
		 */
		init() {
			// Note: Because this.view.init() can by sync as well as async,
			// this method is not returning this.view.init() directly.
			return Promise.resolve()
				.then( () => {
					return this.view.init();
				} )
				.then( () => {
					let promises = [];

					for ( let region of this.regions ) {
						promises.concat( region.map( c => c.init() ) );
					}

					return Promise.all( promises );
				} );
		}

		/**
		 * @param
		 * @returns
		 */
		add( controller, regionName ) {
			let region = this.regions.get( regionName );

			if ( !region ) {
				region = this._createRegion( regionName );
			}

			region.add( controller );

			return Promise.resolve( controller );
		}

		/**
		 * @param
		 * @returns
		 */
		destroy() {
			// Note: Because this.view.destroy() can by sync as well as async,
			// it is wrapped in promise.
			return Promise.resolve()
				.then( () => {
					return this.view.destroy();
				} )
				.then( () => {
					let promises = [];

					this.regions.forEach( region => {
						region.forEach( controller => promises.push( controller.destroy() ) );
					} );

					return Promise.all( promises );
				} );
		}

		_createRegion( regionName ) {
			let controllers = new Collection();
			controllers.name = regionName;

			controllers.on( 'add', ( evt, controller, index ) => {
				this.view.add( controller.view, regionName, index );
			} );

			controllers.on( 'remove', ( evt, controller ) => {
				this.view.remove( controller.view, regionName );
			} );

			this.regions.add( controllers );

			return controllers;
		}
	}

	return Controller;
} );
