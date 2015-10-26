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
			 *
			 *     {
			 *         tag: 'p',
			 *         children: [
			 *             {
			 *                 tag: 'span',
			 *                 attrs: { ... },
			 *                 on: { ... }
			 *             },
			 *             {
			 *                 ...
			 *             },
			 *             ...
			 *         ],
			 *         attrs: {
			 *             'class': [ 'a', 'b' ],
			 *             id: 'c',
			 *             style: callback,
			 *             ...
			 *         },
			 *         on: {
			 *             w: 'a'
			 *             x: [ 'b', 'c', callback ],
			 *             'y@selector': 'd',
			 *             'z@selector': [ 'e', 'f', callback ],
			 *             ...
			 *         },
			 *         text: 'abc'
			 *     }
			 *
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

	var getTextUpdater = () =>
		( el, value ) => el.innerHTML = value;

	var getAttributeUpdater = ( attr ) =>
		( el, value ) => el.setAttribute( attr, value );

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

		// Activate DOM binding for event listeners.
		activateElementListeners( def, el );

		return el;
	}

	function renderElementText( def, el ) {
		if ( def.text ) {
			if ( typeof def.text == 'function' ) {
				def.text( el, getTextUpdater() );
			} else {
				el.innerHTML = def.text;
			}
		}
	}

	function renderElementAttributes( def, el ) {
		var value;
		var attr;

		for ( attr in def.attrs ) {
			value = def.attrs[ attr ];

			// Attribute bound directly to the model.
			if ( typeof value == 'function' ) {
				value( el, getAttributeUpdater( attr ) );
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
	}

	function renderElementChildren( def, el ) {
		var child;

		if ( def.children ) {
			for ( child of def.children ) {
				el.appendChild( renderElement( child ) );
			}
		}
	}

	function activateElementListeners( def, el ) {
		if ( def.on ) {
			for ( var l in def.on ) {
				var domEvtDef = l.split( '@' );
				var name, selector;

				if ( domEvtDef.length == 2 ) {
					name = domEvtDef[ 0 ];
					selector = domEvtDef[ 1 ];
				} else {
					name = l;
					selector = null;
				}

				if ( Array.isArray( def.on[ l ] ) ) {
					def.on[ l ].map( i => i( el, name, selector ) );
				} else {
					def.on[ l ]( el, name, selector );
				}
			}
		}
	}

	return Template;
} );
