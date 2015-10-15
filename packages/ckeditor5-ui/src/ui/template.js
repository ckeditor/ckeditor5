/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

'use strict';

/**
 * Basic Template class.
 *
 * @class Template
 */

CKEDITOR.define( function() {
	class Template {
		/**
		 * Creates an instance of the {@link Template} class.
		 *
		 * @param {Model} mode (View)Model of this Template.
		 * @constructor
		 */
		constructor( def ) {
			/**
			 * Definition of this Template.
			 */
			this.def = def;
		}

		/**
		 * Renders HTMLElement using {@link def}.
		 *
		 * @param {Object} [def] Template definition to be rendered.
		 * @returns {HTMLElement}
		 */
		render( def ) {
			// TODO: Use ES6 default arguments syntax.
			def = def || this.def;

			if ( !def ) {
				return null;
			}

			var el = document.createElement( def.tag );

			// Set the text first.
			if ( def.text ) {
				if ( typeof def.text == 'function' ) {
					def.text( el, textUpdater() );
				} else {
					el.innerHTML = def.text;
				}
			}

			// Set attributes.
			for ( let attr in def.attributes ) {
				let value = def.attributes[ attr ];

				// Attribute bound directly to the model.
				if ( typeof value == 'function' ) {
					value( el, attributeUpdater( attr ) );
				}

				// Explicit attribute definition (string).
				else {
					// Attribute can be an array, i.e. classes.
					if ( Array.isArray( value ) ) {
						value = value.join( ' ' );
					}

					attributeUpdater( attr )( el, value );
				}
			}

			// Invoke children recursively.
			if ( def.children ) {
				for ( let child of def.children ) {
					el.appendChild( this.render( child ) );
				}
			}

			return el;
		}
	}

	var textUpdater = () => ( el, value ) => el.innerHTML = value;
	var attributeUpdater = ( attr ) => ( el, value ) => el.setAttribute( attr, value );

	return Template;
} );
