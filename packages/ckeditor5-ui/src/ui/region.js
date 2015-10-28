/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Basic Region class.
 *
 * @class Region
 * @extends Model
 */

CKEDITOR.define( [ 'collection', 'model' ], ( Collection, Model ) => {
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
			this.views.on( 'remove', ( evt, view ) => view.el.remove() );
		}

		/**
		 * Destroys the Region instance.
		 */
		destroy() {
			// Drop the reference to HTMLElement but don't remove it from DOM.
			// Element comes as a parameter and it could be a part of the View.
			// Then it's up to the View what to do with it when the View is destroyed.
			this.el = null;

			// Remove and destroy views.
			for ( let view of this.views ) {
				this.views.remove( view ).destroy();
			}
		}

		append( view ) {
			this.views.add( view );
		}
	}

	return Region;
} );
