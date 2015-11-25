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

CKEDITOR.define( [
	'collection',
	'model'
], ( Collection, Model ) => {
	class Region extends Model {
		/**
		 * Creates an instance of the {@link Region} class.
		 *
		 * @param {String} name The name of the Region.
		 * @param {HTMLElement} [el] The element used for this region.
		 * @constructor
		 */
		constructor( name ) {
			super();

			/**
			 * The name of the region.
			 *
			 * @property {String}
			 */
			this.name = name;

			/**
			 * Views which belong to the region.
			 *
			 * @property {Collection}
			 */
			this.views = new Collection();

			/**
			 * Element of this region (see {@link #init}).
			 *
			 * @property {HTMLElement}
			 */
			this.el = null;
		}

		/**
		 * Initializes region instance with an element. Usually it comes from {@link View#init}.
		 *
		 * @param {HTMLElement} regiobEl Element of this region.
		 */
		init( regionEl ) {
			this.el = regionEl;

			if ( regionEl ) {
				this.views.on( 'add', ( evt, childView, index ) => {
					regionEl.insertBefore( childView.el, regionEl.childNodes[ index + 1 ] );
				} );

				this.views.on( 'remove', ( evt, childView ) => {
					childView.el.remove();
				} );
			}
		}

		/**
		 * Destroys region instance.
		 */
		destroy() {
			if ( this.el ) {
				for ( let view of this.views ) {
					view.el.remove();
					this.views.remove( view );
				}
			}

			// Drop the reference to HTMLElement but don't remove it from DOM.
			// Element comes as a parameter and it could be a part of the View.
			// Then it's up to the View what to do with it when the View is destroyed.
			this.el = this.views = null;
		}
	}

	return Region;
} );
