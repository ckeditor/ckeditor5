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
		render() {
			return renderElement( this.def );
		}
	}

	var textUpdater = () => ( el, value ) => el.innerHTML = value;
	var attributeUpdater = ( attr ) => ( el, value ) => el.setAttribute( attr, value );

	function renderElement( def ) {
		if ( !def ) {
			return null;
		}

		var el = document.createElement( def.tag );

		// Set the text first.
		renderElementText( def, el );

		// Set attributes.
		renderElementAttributes( def, el );

		// Invoke children recursively.
		renderElementChildren( def, el );

		return el;
	}

	function renderElementText( def, el ) {
		if ( def.text ) {
			if ( typeof def.text == 'function' ) {
				def.text( el, textUpdater() );
			} else {
				el.innerHTML = def.text;
			}
		}
	}

	function renderElementAttributes( def, el ) {
		var value;
		var attr;

		for ( attr in def.attributes ) {
			value = def.attributes[ attr ];

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
	}

	function renderElementChildren( def, el ) {
		var child;

		if ( def.children ) {
			for ( child of def.children ) {
				el.appendChild( renderElement( child ) );
			}
		}
	}

	return Template;
} );
