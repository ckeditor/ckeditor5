/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'collection', 'model' ], function( Collection, Model ) {
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
			 * A collection of child controllers.
			 */
			this.controllers = new Collection();
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

					this.controllers.forEach( item => promises.push( item.init() ) );

					return Promise.all( promises );
				} );
		}

		/**
		 * @param
		 * @returns
		 */
		append( controller, regionName ) {
			this.controllers.add( controller );

			// Note: Because controller.init() can by sync as well as async,
			// it is wrapped in promise.
			return Promise.resolve()
				.then( this.view.append.bind( this.view, controller.view, regionName ) )
				.then( () => controller );
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
				.then(
					Promise.all( this.controllers.filter( c => {
						return c.destroy();
					} ) )
				);
		}
	}

	return Controller;
} );
