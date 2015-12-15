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

CKEDITOR.define( () => {
	class Template {
		/**
		 * Creates an instance of the {@link Template} class.
		 *
		 * @param {TemplateDefinition} def The definition of the template.
		 * @constructor
		 */
		constructor( def ) {
			/**
			 * Definition of this template.
			 *
			 * @property {TemplateDefinition}
			 */
			this.def = def;
		}

		/**
		 * Renders HTMLElement using {@link #def}.
		 *
		 * @returns {HTMLElement}
		 */
		render() {
			return this._renderElement( this.def, true );
		}

		/**
		 * Renders an element from definition.
		 *
		 * @protected
		 * @param {TemplateDefinition} def Definition of an element.
		 * @param {Boolean} intoFragment If set, children are rendered into DocumentFragment.
		 * @returns {HTMLElement} A rendered element.
		 */
		_renderElement( def, intoFragment ) {
			if ( !def ) {
				return null;
			}

			const el = document.createElement( def.tag );

			// Set the text first.
			this._renderElementText( def, el );

			// Set attributes.
			this._renderElementAttributes( def, el );

			// Invoke children recursively.
			if ( intoFragment ) {
				const docFragment = document.createDocumentFragment();

				this._renderElementChildren( def, docFragment );

				el.appendChild( docFragment );
			} else {
				this._renderElementChildren( def, el );
			}

			// Activate DOM binding for event listeners.
			this._activateElementListeners( def, el );

			return el;
		}

		/**
		 * Renders element text content from definition.
		 *
		 * @protected
		 * @param {TemplateDefinition} def Definition of an element.
		 * @param {HTMLElement} el Element which is rendered.
		 */
		_renderElementText( def, el ) {
			if ( def.text ) {
				if ( typeof def.text == 'function' ) {
					def.text( el, getTextUpdater() );
				} else {
					el.textContent = def.text;
				}
			}
		}

		/**
		 * Renders element attributes from definition.
		 *
		 * @protected
		 * @param {TemplateDefinition} def Definition of an element.
		 * @param {HTMLElement} el Element which is rendered.
		 */
		_renderElementAttributes( def, el ) {
			let attr, value;

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

		/**
		 * Recursively renders element children from definition by
		 * calling {@link #_renderElement}.
		 *
		 * @protected
		 * @param {TemplateDefinition} def Definition of an element.
		 * @param {HTMLElement} el Element which is rendered.
		 */
		_renderElementChildren( def, el ) {
			let child;

			if ( def.children ) {
				for ( child of def.children ) {
					el.appendChild( this._renderElement( child ) );
				}
			}
		}

		/**
		 * Activates element `on` listeners passed in element definition.
		 *
		 * @protected
		 * @param {TemplateDefinition} def Definition of an element.
		 * @param {HTMLElement} el Element which is rendered.
		 */
		_activateElementListeners( def, el ) {
			if ( def.on ) {
				let l, domEvtDef, name, selector;

				for ( l in def.on ) {
					domEvtDef = l.split( '@' );

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
	}

	/**
	 * Returns a function which, when called in the context of HTMLElement,
	 * it replaces element children with a text node of given value.
	 *
	 * @protected
	 * @param {Function}
	 */
	function getTextUpdater() {
		return ( el, value ) => el.textContent = value;
	}

	/**
	 * Returns a function which, when called in the context of HTMLElement,
	 * it updates element's attribute with given value.
	 *
	 * @protected
	 * @param {String} attr A name of the attribute to be updated.
	 * @param {Function}
	 */
	function getAttributeUpdater( attr ) {
		return ( el, value ) => el.setAttribute( attr, value );
	}

	return Template;
} );

/**
 * Definition of {@link Template}.
 *
 *		{
 *			tag: 'p',
 *			children: [
 *				{
 *					tag: 'span',
 *					attrs: { ... },
 *					on: { ... }
 *				},
 *				{
 *					...
 *				},
 *				...
 *			],
 *			attrs: {
 *				'class': [ 'a', 'b' ],
 *				id: 'c',
 *				style: callback,
 *				...
 *			},
 *			on: {
 *				event1: 'a'
 *				event2: [ 'b', 'c', callback ],
 *				'event3@selector': 'd',
 *				'event4@selector': [ 'e', 'f', callback ],
 *				...
 *			},
 *			text: 'abc'
 *		}
 *
 * @typedef TemplateDefinition
 * @type Object
 * @property {String} tag
 * @property {Array} [children]
 * @property {Object} [attrs]
 * @property {String} [text]
 * @property {Object} [on]
 */
