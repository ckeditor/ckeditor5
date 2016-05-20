/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Collection from '../utils/collection.js';

/**
 * Basic Region class.
 *
 * @memberOf ui
 */
export default class Region {
	/**
	 * Creates an instance of the {@link ui.Region} class.
	 *
	 * @param {String} name The name of the Region.
	 */
	constructor( name ) {
		/**
		 * The name of the region.
		 *
		 * @member {String} ui.Region#name
		 */
		this.name = name;

		/**
		 * Views which belong to the region.
		 *
		 * @member {utils.Collection} ui.Region#views
		 */
		this.views = new Collection();

		/**
		 * Element of this region (see {@link #init}).
		 *
		 * @member {HTMLElement} ui.Region#element
		 */
		this.element = null;
	}

	/**
	 * Initializes region instance with an element. Usually it comes from {@link View#init}.
	 *
	 * @param {HTMLElement} regionElement Element of this region.
	 */
	init( regionElement ) {
		this.element = regionElement;

		if ( regionElement ) {
			this.views.on( 'add', ( evt, childView, index ) => {
				regionElement.insertBefore( childView.element, regionElement.childNodes[ index ] );
			} );

			this.views.on( 'remove', ( evt, childView ) => {
				childView.element.remove();
			} );
		}
	}

	/**
	 * Destroys region instance.
	 */
	destroy() {
		if ( this.element ) {
			for ( let view of this.views ) {
				view.element.remove();
				this.views.remove( view );
			}
		}

		// Drop the reference to HTMLElement but don't remove it from DOM.
		// Element comes as a parameter and it could be a part of the View.
		// Then it's up to the View what to do with it when the View is destroyed.
		this.element = this.views = null;
	}
}
