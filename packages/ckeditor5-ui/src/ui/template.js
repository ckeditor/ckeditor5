/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

'use strict';

import CKEditorError from '../ckeditorerror.js';

/**
 * Basic Template class.
 *
 * @class Template
 */

export default class Template {
	/**
	 * Creates an instance of the {@link Template} class.
	 *
	 * @param {TemplateDefinition} definition The definition of the template.
	 * @constructor
	 */
	constructor( def ) {
		/**
		 * Definition of this template.
		 *
		 * @property {TemplateDefinition}
		 */
		this.definition = def;
	}

	/**
	 * Renders DOM Node using {@link #definition}.
	 *
	 * @returns {HTMLElement}
	 */
	render() {
		return this._renderNode( this.definition, true );
	}

	/**
	 * Renders a DOM Node from definition.
	 *
	 * @protected
	 * @param {TemplateDefinition} def Definition of a Node.
	 * @param {Boolean} intoFragment If set, children are rendered into DocumentFragment.
	 * @returns {HTMLElement} A rendered Node.
	 */
	_renderNode( def, intoFragment ) {
		if ( !def ) {
			/**
			 * Node definition must have either "tag" or "text" property.
			 *
			 * @error ui-template-wrong-syntax
			 */
			throw new CKEditorError( 'ui-template-wrong-syntax' );
		}

		const isText = def.text || typeof def == 'string';

		// !XOR( def.tag, isText )
		if ( ( def.tag ? isText : !isText ) ) {
			throw new CKEditorError( 'ui-template-wrong-syntax' );
		}

		return isText ?
			this._renderText( def ) : this._renderElement( def, intoFragment );
	}

	/**
	 * Renders a HTMLElement from TemplateDefinition.
	 *
	 * @protected
	 * @param {TemplateDefinition} def Definition of an element.
	 * @param {Boolean} intoFragment If set, children are rendered into DocumentFragment.
	 * @returns {HTMLElement} A rendered element.
	 */
	_renderElement( def, intoFragment ) {
		const el = document.createElement( def.tag );

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

		// Activate DOM bindings for event listeners.
		this._activateElementListeners( def, el );

		return el;
	}

	/**
	 * Renders a Text from TemplateDefinition or String.
	 *
	 * @protected
	 * @param {TemplateDefinition|String} def Definition of Text or its value.
	 * @returns {Text} A rendered Text.
	 */
	_renderText( defOrText ) {
		const el = document.createTextNode( '' );

		// Case: { text: ... }
		if ( defOrText.text ) {
			// Case: { text: func }, like binding
			if ( typeof defOrText.text == 'function' ) {
				defOrText.text( el, getTextUpdater() );
			}
			// Case: { text: 'foo' }
			else {
				el.textContent = defOrText.text;
			}
		}
		// Case: 'foo'
		else {
			el.textContent = defOrText;
		}

		return el;
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

		for ( attr in def.attributes ) {
			value = def.attributes[ attr ];

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
		if ( def.children ) {
			def.children.map( childDef => {
				el.appendChild( this._renderNode( childDef ) );
			} );
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

/**
 * Definition of {@link Template}.
 *
 *		{
 *			tag: 'p',
 *			children: [
 *				{
 *					tag: 'span',
 *					attributes: { ... },
 *					children: [ ... ],
 *					...
 *				},
 *				{
 *					text: 'abc'
 *				},
 *				'def',
 *				...
 *			],
 *			attributes: {
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
 *			}
 *		}
 *
 * @typedef TemplateDefinition
 * @type Object
 * @property {String} tag
 * @property {Array} [children]
 * @property {Object} [attributes]
 * @property {String} [text]
 * @property {Object} [on]
 */
