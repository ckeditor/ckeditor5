/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'Collection', 'Model' ], function( Collection, Model ) {
	class Region extends Model {
		/**
		 * Creates an instance of the {@link Region} class.
		 *
		 * @param {String} name The name of the Region.
		 * @param {HTMLElement} [el] The element used for this region.
		 * @constructor
		 */
		constructor( name, el ) {
			super();

			/**
			 * The name of the region.
			 */
			this.name = name;

			/**
			 * The element of the region.
			 */
			this.el = el;

			/**
			 * Views which belong to the region.
			 */
			this.views = new Collection();

			this.views.on( 'add', ( evt, view ) => this.el && this.el.appendChild( view.el ) );
		};

		destroy() {};
	}

	return Region;
} );
