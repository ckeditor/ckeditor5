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
		const textNode = applyText || document.createTextNode( '' );

		// Check if there's a binder available for this Text Node.
		const binder = defOrText._modelBinders && defOrText._modelBinders.text;

		// Activate binder if one. Cases:
		//		{ text: bind.to( ... ) }
		//		{ text: [ 'foo', bind.to( ... ), ... ] }
		if ( binder ) {
			binder( textNode, getTextNodeUpdater( textNode ) );
		}

		// Simply set text. Cases:
		// 		{ text: [ 'all', 'are', 'static' ] }
		// 		{ text: 'foo' }
		// 		'foo'
		else {
			textNode.textContent = defOrText.text || defOrText;
		}

		return textNode;
	}

	/**
	 * Renders element attributes from definition.
	 *
	 * @protected
	 * @param {TemplateDefinition} def Definition of an element.
	 * @param {HTMLElement} el Element which is rendered.
	 */
	_renderElementAttributes( def, el ) {
		const attributes = def.attributes;
		const binders = def._modelBinders && def._modelBinders.attributes;
		let binder, attrName, attrValue;

		if ( !attributes ) {
			return;
		}

		for ( attrName in attributes ) {
			// Check if there's a binder available for this attribute.
			binder = binders && binders[ attrName ];

			// Activate binder if one. Cases:
			// 		{ class: [ 'bar', bind.to( ... ), 'baz' ] }
			// 		{ class: bind.to( ... ) }
			if ( binder ) {
				binder( el, getElementAttributeUpdater( el, attrName ) );
			}

			// Otherwise simply set the attribute.
			// 		{ class: [ 'all', 'are', 'static' ] }
			// 		{ class: 'foo' }
			else {
				attrValue = attributes[ attrName ];

				// Attribute can be an array. Merge array elements:
				if ( Array.isArray( attrValue ) ) {
					attrValue = attrValue.reduce( function binderValueReducer( prev, cur ) {
						return prev === '' ? `${cur}` : `${prev} ${cur}`;
					} );
				}

				el.setAttribute( attrName, attrValue );
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
function getTextNodeUpdater( node ) {
	return {
		set( value ) {
			node.textContent = value;
		},

		remove() {
			node.textContent = '';
		}
	};
}

/**
 * Returns a function which, when called in the context of HTMLElement,
 * it updates element's attribute with given value.
 *
 * @private
 * @param {String} attr A name of the attribute to be updated.
 * @param {Function}
 */
function getElementAttributeUpdater( el, attrName ) {
	return {
		set( value ) {
			el.setAttribute( attrName, value );
		},

		remove() {
			el.removeAttribute( attrName );
		}
	};
}

/**
 * Definition of {@link Template}.
 * See: {@link TemplateValueSchema}.
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
 *					text: 'static–text'
 *				},
 *				'also-static–text',
 *				...
 *			],
 *			attributes: {
 *				'class': [ 'class-a', 'class-b' ],
 *				id: 'element-id',
 *				style: callback,
 *				...
 *			},
 *			on: {
 *				'click': 'clicked'
 *				'mouseup': [ 'view-event-a', 'view-event-b', callback ],
 *				'keyup@selector': 'view-event',
 *				'focus@selector': [ 'view-event-a', 'view-event-b', callback ],
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
 * @property {Object} _modelBinders
 */

/**
 * Describes a value of HTMLElement attribute or `textContent`.
 * See: {@link TemplateDefinition}.
 *
 *		{
 *			tag: 'p',
 *			attributes: {
 *				// Plain String schema.
 *				class: 'class-foo'
 *
 *				// Object schema, a Model binding.
 *				class: { model: m, attribute: 'foo', callback... }
 *
 *				// Array schema, combines the above.
 *				class: [ 'foo', { model: m, attribute: 'bar' }, 'baz' ]
 *			}
 *		}
 *
 * @typedef TemplateValueSchema
 * @type {Object|String|Array}
 */
