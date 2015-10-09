/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'Collection', 'Model' ], function( Collection, Model ) {
	class View extends Model {
		/**
		 * Creates an instance of the {@link View} class.
		 *
		 * @param {Model} mode (View)Model of this View.
		 * @constructor
		 */
		constructor( model ) {
			super();

			/**
			 * Model of this view.
			 */
			this.model = new Model( model );

			/**
			 * Regions which belong to this view.
			 */
			this.regions = new Collection();

			this.regions.on( 'add', ( evt, region ) => this.el.appendChild( region.el ) );
		};

		/**
		 * Element of this view.
		 *
		 * @property el
		 */
		get el() {
			if ( this._el ) {
				return this._el;
			}

			return this._el = this.render();
		};

		/**
		 * Binds a property of the model to a specific listener that
		 * updates the view when the property changes.
		 *
		 * @param {Model} model Model to which the property is bound to.
		 * @param {String} property Property name in the model.
		 * @param {Function} [callback] Callback function executed on property change in model.
		 * @constructor
		 */
		bind( model, property, callback ) {
			return function( el, attr ) {
				// TODO: Use ES6 default arguments syntax.
				var changeCallback = callback || setAttribute;

				function setAttribute( el, value ) {
					el.setAttribute( attr, value );
				}

				function executeCallback( el, value ) {
					var result = changeCallback( el, value );

					if ( typeof result != 'undefined' ) {
						setAttribute( el, result );
					}
				}

				// Execute callback when the property changes.
				model.on( 'change:' + property, ( evt, value ) => executeCallback( el, value ) );

				// Set the initial state of the view.
				executeCallback( el, model[ property ] );
			};
		};

		/**
		 * Renders {@link el} using {@link template}.
		 *
		 * @param {Object} [def] Template definition to be rendered.
		 * @returns HTMLElement {@link el} ready to be injected into DOM.
		 */
		render( template ) {
			// TODO: Use ES6 default arguments syntax.
			template = template || this.template;

			if ( !template ) {
				return null;
			}

			var el = document.createElement( template.tag ),
				attr, value;

			// Set the text first.
			if ( template.text ) {
				el.innerHTML = template.text;
			}

			// Set attributes.
			for ( attr in template.attributes ) {
				value = template.attributes[ attr ];

				// Attribute bound directly to the model.
				if ( typeof value == 'function' ) {
					value( el, attr );
				}

				// Explicit attribute definition (string).
				else {
					// Attribute can be an array, i.e. classes.
					if ( Array.isArray( value ) ) {
						value = value.join( ' ' );
					}

					el.setAttribute( attr, value );
				}
			}

			// Invoke children recursively.
			if ( template.children ) {
				for ( let child of template.children ) {
					el.appendChild( this.render( child ) );
				}
			}

			return el;
		}

		destroy() {};
	}

	return View;
} );
