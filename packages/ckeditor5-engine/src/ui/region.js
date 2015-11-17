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
	'model',
	'ckeditorerror',
], ( Collection, Model, CKEditorError ) => {
	class Region extends Model {
		/**
		 * Creates an instance of the {@link Region} class.
		 *
		 * @param {String} name The name of the Region.
		 * @param {HTMLElement} [el] The element used for this region.
		 * @constructor
		 */
		constructor( name, elDef ) {
			super();

			/**
			 * The name of the region.
			 */
			this.name = name;

			/**
			 * @property {HTMLElement} _elDef
			 */
			this._elDef = elDef;

			/**
			 * Views which belong to the region.
			 */
			this.views = new Collection();

			/**
			 * @property {View} parent
			 */
		}

		/**
		 * @param
		 * @returns
		 */
		init( parent ) {
			this.parent = parent;

			if ( this.el ) {
				this._initChildViews();
			}
		}

		/**
		 * Element of this Region. The element is rendered on first reference.
		 *
		 * @property el
		 */
		get el() {
			return this._el || this._getElement();
		}

		set el( el ) {
			this._el = el;
		}

		/**
		 * @param
		 * @returns
		 */
		_getElement() {
			const elDef = this._elDef;
			let el;

			if ( typeof elDef == 'string' ) {
				el = this.parent.el.querySelector( elDef );
			} else if ( typeof elDef == 'function' ) {
				el = elDef( this.parent.el );
			} else if ( elDef === true ) {
				el = null;
			} else {
				/**
				 * Region definition must be either `Function`, `String` or `Boolean` (`true`).
				 *
				 * @error ui-region-element
				 * @param {Region} region
				 */
				throw new CKEditorError(
					'ui-region-element: Region definition must be either `Function`, `String` or `Boolean` (`true`).',
					{ region: this }
				);
			}

			return ( this._el = el );
		}

		/**
		 * @param
		 * @returns
		 */
		_initChildViews() {
			let view;

			// Add registered views to DOM.
			for ( view of this.views ) {
				this.el.appendChild( view.el );
			}

			// Attach listeners for future manipulation.
			this.views.on( 'add', ( evt, view ) => {
				if ( this.el ) {
					this.el.appendChild( view.el );
				}
			} );

			this.views.on( 'remove', ( evt, view ) => {
				view.el.remove();
			} );
		}

		/**
		 * @param
		 * @returns
		 */
		addChild( view, index ) {
			this.views.add( view, index );
		}

		/**
		 * @param
		 * @returns
		 */
		removeChild( view ) {
			this.views.remove( view );
		}

		/**
		 * Destroys the Region instance.
		 */
		destroy() {
			// Drop the reference to HTMLElement but don't remove it from DOM.
			// Element comes as a parameter and it could be a part of the View.
			// Then it's up to the View what to do with it when the View is destroyed.
			this.el = null;
		}
	}

	return Region;
} );
