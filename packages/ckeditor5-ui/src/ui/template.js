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
	 * See: {@link #apply}.
	 *
	 * @returns {HTMLElement}
	 */
	render() {
		return this._renderNode( this.definition, null, true );
	}

	/**
	 * Applies template {@link #def} to existing DOM tree.
	 *
	 * **Note:** No new DOM nodes (elements, text nodes) will be created.
	 *
	 * See: {@link #render}, {@link View#applyTemplateToElement}.
	 *
	 * @param {Node} element Root element for template to apply.
	 */
	apply( node ) {
		if ( !node ) {
			/**
			 * No DOM Node specified.
			 *
			 * @error ui-template-wrong-syntax
			 */
			throw new CKEditorError( 'ui-template-wrong-node' );
		}

		return this._renderNode( this.definition, node );
	}

	/**
	 * Renders a DOM Node from definition.
	 *
	 * @protected
	 * @param {TemplateDefinition} def Definition of a Node.
	 * @param {Node} applyNode If specified, template `def` will be applied to existing DOM Node.
	 * @param {Boolean} intoFragment If set, children are rendered into DocumentFragment.
	 * @returns {HTMLElement} A rendered Node.
	 */
	_renderNode( def, applyNode, intoFragment ) {
		const isText = def.text || typeof def == 'string';
		let isInvalid;

		if ( applyNode ) {
			// When applying, a definition cannot have "tag" and "text" at the same time.
			isInvalid = def.tag && isText;
		} else {
			// When rendering, a definition must have either "tag" or "text": XOR( def.tag, isText ).
			isInvalid = def.tag ? isText : !isText;
		}

		if ( isInvalid ) {
			/**
			 * Node definition cannot have "tag" and "text" properties at the same time.
			 * Node definition must have either "tag" or "text" when rendering new Node.
			 *
			 * @error ui-template-wrong-syntax
			 */
			throw new CKEditorError( 'ui-template-wrong-syntax' );
		}

		return isText ?
			this._renderText( def, applyNode ) : this._renderElement( def, applyNode, intoFragment );
	}

	/**
	 * Renders an HTMLElement from TemplateDefinition.
	 *
	 * @protected
	 * @param {TemplateDefinition} def Definition of an element.
	 * @param {HTMLElement} applyElement If specified, template `def` will be applied to existing HTMLElement.
	 * @param {Boolean} intoFragment If set, children are rendered into DocumentFragment.
	 * @returns {HTMLElement} A rendered element.
	 */
	_renderElement( def, applyElement, intoFragment ) {
		const el = applyElement || document.createElement( def.tag );

		this._renderElementAttributes( def, el );

		// Invoke children recursively.
		if ( intoFragment ) {
			const docFragment = document.createDocumentFragment();

			this._renderElementChildren( def, docFragment );

			el.appendChild( docFragment );
		} else {
			this._renderElementChildren( def, el, !!applyElement );
		}

		// Activate DOM bindings for event listeners.
		this._activateElementListenerAttachers( def, el );

		return el;
	}

	/**
	 * Renders a Text from TemplateDefinition or String.
	 *
	 * @protected
	 * @param {TemplateDefinition|String} def Definition of Text or its value.
	 * @param {HTMLElement} applyText If specified, template `def` will be applied to existing Text Node.
	 * @returns {Text} A rendered Text.
	 */
	_renderText( defOrText, applyText ) {
		const text = applyText || document.createTextNode( '' );

		// Case: { text: func }, like binding
		if ( typeof defOrText.text == 'function' ) {
			defOrText.text( text, getTextUpdater() );
		}
		// Case: { text: 'foo' }
		// Case: 'foo'
		else {
			text.textContent = defOrText.text || defOrText;
		}

		return text;
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
	 * @param {Boolean} isApply Traverse existing DOM structure only, don't modify DOM.
	 */
	_renderElementChildren( def, el, isApply ) {
		if ( def.children ) {
			def.children.forEach( ( childDef, index ) => {
				if ( isApply ) {
					this._renderNode( childDef, el.childNodes[ index ] );
				} else {
					el.appendChild( this._renderNode( childDef ) );
				}
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
	_activateElementListenerAttachers( def, el ) {
		if ( !def.on ) {
			return;
		}

		const attachers = def.on._listenerAttachers;

		Object.keys( attachers )
			.map( name => [ name, ...name.split( '@' ) ] )
			.forEach( split => {
				// TODO: ES6 destructuring.
				const key = split[ 0 ];
				const evtName = split[ 1 ];
				const evtSelector = split[ 2 ] || null;

				if ( Array.isArray( attachers[ key ] ) ) {
					attachers[ key ].forEach( i => i( el, evtName, evtSelector ) );
				} else {
					attachers[ key ]( el, evtName, evtSelector );
				}
			} );
	}
}

/**
 * Returns a function which, when called in the context of HTMLElement,
 * it replaces element children with a text node of given value.
 *
 * @private
 * @param {Function}
 */
function getTextUpdater() {
	return ( el, value ) => el.textContent = value;
}

/**
 * Returns a function which, when called in the context of HTMLElement,
 * it updates element's attribute with given value.
 *
 * @private
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
