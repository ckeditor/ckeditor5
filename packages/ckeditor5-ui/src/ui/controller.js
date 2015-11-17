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
			 * @property {Boolean} ready
			 */

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
			if ( this.ready ) {
				/**
				 * This Controller has already been initialized.
				 *
				 * @error ui-controller-init
				 * @param {Controller} controller
				 */
				throw new CKEditorError(
					'ui-controller-init: This Controller has already been initialized.',
					{ view: this }
				);
			}

			return Promise.resolve()
				// Note: Because this.view.init() can be sync as well as async,
				// this method is not returning this.view.init() directly.
				.then( () => {
					return this.view.init();
				} )
				.then( () => {
					let promises = [];
					let region, controller;

					for ( region of this.regions ) {
						for ( controller of region ) {
							promises.push( controller.init() );
						}
					}

					return Promise.all( promises );
				} )
				.then( () => {
					this.ready = true;
				} );
		}

		/**
		 * @param
		 * @returns
		 */
		addChild( controller, regionName ) {
			let region = this.regions.get( regionName );

			if ( !region ) {
				region = this._createRegion( regionName );
			}

			region.add( controller );

			// If this Controller has already been inited, then every single new
			// child controller must be inited separately when added.
			if ( this.ready ) {
				return controller.init();
			}
			// If this Controller.init() hasn't been called yet, then the child
			// controller will be initialized by init().
			else {
				return Promise.resolve();
			}
		}

		_createRegion( regionName ) {
			const region = new Collection();
			region.name = regionName;

			region.on( 'add', ( evt, controller, index ) => {
				this.view.addChild( controller.view, regionName, index );
			} );

			region.on( 'remove', ( evt, controller ) => {
				this.view.removeChild( controller.view, regionName );
			} );

			this.regions.add( region );

			return region;
		}

		/**
		 * @param
		 * @returns
		 */
		destroy() {
			return Promise.resolve()
				.then( () => {
					let promises = [];
					let region, controller;

					for ( region of this.regions ) {
						for ( controller of this.regions.remove( region ) ) {
							promises.push( region.remove( controller ).destroy() );
						}
					}

					return Promise.all( promises );
				} )
				// Note: Because this.view.destroy() can be sync as well as async,
				// it is wrapped in promise.
				.then( () => {
					return this.view.destroy();
				} );
		}
	}

	return Controller;
} );
