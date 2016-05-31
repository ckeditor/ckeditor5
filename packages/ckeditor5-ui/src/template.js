/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

'use strict';

import CKEditorError from '../utils/ckeditorerror.js';
import mix from '../utils/mix.js';
import EmitterMixin from '/ckeditor5/utils/emittermixin.js';

const bindToSymbol = Symbol( 'bindTo' );
const bindIfSymbol = Symbol( 'bindIf' );
const bindDOMEvtSymbol = Symbol( 'bindDOMEvt' );

/**
 * Basic Template class.
 *
 * @memberOf ui
 */
export default class Template {
	/**
	 * Creates an instance of the {@link ui.Template} class.
	 *
	 * @param {ui.TemplateDefinition} def The definition of the template.
	 */
	constructor( def ) {
		/**
		 * Definition of this template.
		 *
		 * @readonly
		 * @member {ui.TemplateDefinition} ui.Template#definition
		 */
		this.definition = def;
	}

	/**
	 * Renders DOM Node using {@link ui.Template#definition}.
	 *
	 * @see ui.Template#apply
	 *
	 * @returns {HTMLElement}
	 */
	render() {
		return this._renderNode( this.definition, null, true );
	}

	/**
	 * Applies template {@link ui.Template#def} to existing DOM tree.
	 *
	 * **Note:** No new DOM nodes (elements, text nodes) will be created.
	 *
	 * @see ui.Template#render
	 * @see ui.View#applyTemplateToElement.
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

	destroy() {
		this.stopListening();
	}

	/**
	 * Renders a DOM Node from definition.
	 *
	 * @protected
	 * @param {ui.TemplateDefinition} def Definition of a Node.
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
	 * @param {ui.TemplateDefinition} def Definition of an element.
	 * @param {HTMLElement} applyElement If specified, template `def` will be applied to existing HTMLElement.
	 * @param {Boolean} intoFragment If set, children are rendered into DocumentFragment.
	 * @returns {HTMLElement} A rendered element.
	 */
	_renderElement( def, applyElement, intoFragment ) {
		let el = applyElement ||
			document.createElementNS( def.ns || 'http://www.w3.org/1999/xhtml', def.tag );

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
	_renderText( valueSchemaOrText, applyText ) {
		const textNode = applyText || document.createTextNode( '' );

		// Check if there's a binder available for this Text Node.
		if ( hasModelBinding( valueSchemaOrText.text ) ) {
			// Activate binder if one. Cases:
			//		{ text: Template.bind.to( ... ) }
			//		{ text: [ 'foo', Template.bind.to( ... ), ... ] }
			this._setupBinding( valueSchemaOrText.text, textNode, getTextNodeUpdater( textNode ) );
		}
		// Simply set text. Cases:
		// 		{ text: [ 'all', 'are', 'static' ] }
		// 		{ text: 'foo' }
		// 		'foo'
		else {
			textNode.textContent = valueSchemaOrText.text || valueSchemaOrText;
		}

		return textNode;
	}

	/**
	 * Renders element attributes from definition.
	 *
	 * @protected
	 * @param {ui.TemplateDefinition} def Definition of an element.
	 * @param {HTMLElement} el Element which is rendered.
	 */
	_renderElementAttributes( def, el ) {
		const attributes = def.attributes;
		const binders = def._modelBinders && def._modelBinders.attributes;
		let binder, attrName, attrValue, attrNs;

		if ( !attributes ) {
			return;
		}

		for ( attrName in attributes ) {
			// Check if there's a binder available for this attribute.
			binder = binders && binders[ attrName ];
			attrValue = attributes[ attrName ];
			attrNs = attrValue.ns || null;

			// Activate binder if one. Cases:
			// 		{ class: [ 'bar', Template.bind.to( ... ), 'baz' ] }
			// 		{ class: Template.bind.to( ... ) }
			// 		{ class: { ns: 'abc', value: Template.bind.to( ... ) } }
			if ( hasModelBinding( attrValue ) ) {
				this._setupBinding( attrValue, el, getElementAttributeUpdater( el, attrName, attrNs ) );
			}

			// Otherwise simply set the attribute.
			// 		{ class: [ 'all', 'are', 'static' ] }
			// 		{ class: 'foo' }
			// 		{ class: { ns: 'abc', value: 'foo' } }
			else {
				attrValue = attrValue.value || attrValue;

				// Attribute can be an array. Merge array elements:
				if ( Array.isArray( attrValue ) ) {
					attrValue = attrValue.reduce( ( prev, cur ) => {
						return prev === '' ? `${cur}` : `${prev} ${cur}`;
					} );
				}

				el.setAttributeNS( attrNs, attrName, attrValue );
			}
		}
	}

	/**
	 * Recursively renders element children from definition by
	 * calling {@link ui.Template#_renderElement}.
	 *
	 * @protected
	 * @param {ui.TemplateDefinition} def Definition of an element.
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
	 * @param {ui.TemplateDefinition} def Definition of an element.
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

	/**
	 * For given {@link ui.TemplateValueSchema} containing {@link ui.TemplateBinding} it activates the
	 * binding and sets its initial value.
	 *
	 * Note: {@link ui.TemplateValueSchema} can be for HTMLElement attributes or Text Node `textContent`.
	 *
	 * @protected
	 * @param {ui.TemplateValueSchema}
	 * @param {Node} node DOM Node to be updated when {@link View#model} changes.
	 * @param {Function} domUpdater A function provided by {@link Template} which updates corresponding
	 * DOM attribute or `textContent`.
	 */
	_setupBinding( valueSchema, node, domUpdater ) {
		// Normalize attributes with additional data like namespace:
		// class: { ns: 'abc', value: [ ... ] }
		if ( valueSchema.value ) {
			valueSchema = valueSchema.value;
		}

		valueSchema = normalizeBinderValueSchema( valueSchema );

		// Assembles the value using {@link ui.TemplateValueSchema} and stores it in a form of
		// an Array. Each entry of an Array corresponds to one of {@link ui.TemplateValueSchema}
		// items.
		//
		// @private
		// @param {Node} node
		// @return {Array}
		const getBoundValue = ( node ) => {
			let model, modelValue;

			return valueSchema.map( schemaItem => {
				model = schemaItem.observable;

				if ( model ) {
					modelValue = model[ schemaItem.attribute ];

					if ( schemaItem.callback ) {
						modelValue = schemaItem.callback( modelValue, node );
					}

					if ( schemaItem.type === bindIfSymbol ) {
						return !!modelValue ? schemaItem.valueIfTrue || true : '';
					} else {
						return modelValue;
					}
				} else {
					return schemaItem;
				}
			} );
		};

		// A function executed each time bound Observable attribute changes, which updates DOM with a value
		// constructed from {@link ui.TemplateValueSchema}.
		const onObservableChange = () => {
			let value = getBoundValue( node );
			let shouldSet;

			// Check if valueSchema is a single Template.bind.if, like:
			//		{ class: Template.bind.if( 'foo' ) }
			if ( valueSchema.length == 1 && valueSchema[ 0 ].type == bindIfSymbol ) {
				value = value[ 0 ];
				shouldSet = value !== '';

				if ( shouldSet ) {
					value = value === true ? '' : value;
				}
			} else {
				value = value.reduce( binderValueReducer, '' );
				shouldSet = value;
			}

			if ( shouldSet ) {
				domUpdater.set( value );
			} else {
				domUpdater.remove();
			}
		};

		valueSchema
			.filter( schemaItem => schemaItem.observable )
			.forEach( schemaItem => {
				schemaItem.emitter.listenTo( schemaItem.observable, 'change:' + schemaItem.attribute, onObservableChange );
			} );

		// Set initial values.
		onObservableChange();
	}
}

mix( Template, EmitterMixin );

/**
 * And entry point to the interface which allows binding attributes of {@link View#model}
 * to the DOM items like HTMLElement attributes or Text Node `textContent`, so their state
 * is synchronized with {@link View#model}.
 *
 * @readonly
 * @type ui.TemplateBinding
 */
Template.bind = ( observable, emitter ) => {
	const binderFunction = ( eventName ) => {
		return {
			type: bindDOMEvtSymbol,
			observable, emitter,
			eventName
		};
	};

	/**
	 * Binds {@link utils.ObservableMixin} to HTMLElement attribute or Text Node `textContent`
	 * so remains in sync with the Model when it changes.
	 *
	 *		this.template = {
	 *			tag: 'p',
	 *			attributes: {
	 *				// class="..." attribute gets bound to this.observable.a
	 *				'class': Template.bind.to( 'a' )
	 *			},
	 *			children: [
	 *				// <p>...</p> gets bound to this.observable.b; always `toUpperCase()`.
	 *				{ text: Template.bind.to( 'b', ( value, node ) => value.toUpperCase() ) }
	 *			]
	 *		}
	 *
	 * @static
	 * @property {attributeBinder.to}
	 * @param {String} attribute Name of {@link utils.ObservableMixin} used in the binding.
	 * @param {Function} [callback] Allows processing of the value. Accepts `Node` and `value` as arguments.
	 * @return {ui.TemplateBinding}
	 */
	binderFunction.to = ( attribute, callback ) => {
		return {
			type: bindToSymbol,
			observable, emitter,
			attribute, callback
		};
	};

	/**
	 * Binds {@link utils.ObservableMixin} to HTMLElement attribute or Text Node `textContent`
	 * so remains in sync with the Model when it changes. Unlike {@link View#attributeBinder.to},
	 * it controls the presence of the attribute/`textContent` depending on the "falseness" of
	 * {@link utils.ObservableMixin} attribute.
	 *
	 *		this.template = {
	 *			tag: 'input',
	 *			attributes: {
	 *				// <input checked> this.observable.a is not undefined/null/false/''
	 *				// <input> this.observable.a is undefined/null/false
	 *				checked: Template.bind.if( 'a' )
	 *			},
	 *			children: [
	 *				{
	 *					// <input>"b-is-not-set"</input> when this.observable.b is undefined/null/false/''
	 *					// <input></input> when this.observable.b is not "falsy"
	 *					text: Template.bind.if( 'b', 'b-is-not-set', ( value, node ) => !value )
	 *				}
	 *			]
	 *		}
	 *
	 * @static
	 * @property {attributeBinder.if}
	 * @param {String} attribute Name of {@link utils.ObservableMixin} used in the binding.
	 * @param {String} [valueIfTrue] Value set when {@link utils.ObservableMixin} attribute is not undefined/null/false/''.
	 * @param {Function} [callback] Allows processing of the value. Accepts `Node` and `value` as arguments.
	 * @return {ui.TemplateBinding}
	 */
	binderFunction.if = ( attribute, valueIfTrue, callback ) => {
		return {
			type: bindIfSymbol,
			observable, emitter,
			attribute, valueIfTrue, callback
		};
	};

	return binderFunction;
};

/**
 * Describes Model binding created by {@link View#attributeBinder}.
 *
 * @typedef ui.TemplateBinding
 * @type Object
 * @property {Symbol} type
 * @property {ui.Model} model
 * @property {String} attribute
 * @property {String} [valueIfTrue]
 * @property {Function} [callback]
 */

/*
 * Returns an object consisting of `set` and `remove` functions, which
 * can be used in the context of DOM Node to set or reset `textContent`.
 * @see ui.View#_setupBinding
 *
 * @private
 * @param {Node} node DOM Node to be modified.
 * @returns {Object}
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

/*
 * Returns an object consisting of `set` and `remove` functions, which
 * can be used in the context of DOM Node to set or reset an attribute.
 * @see ui.View#_setupBinding
 *
 * @private
 * @param {Node} node DOM Node to be modified.
 * @param {String} attrName Name of the attribute to be modified.
 * @param {String} [ns] Namespace to use.
 * @returns {Object}
 */
function getElementAttributeUpdater( el, attrName, ns = null ) {
	return {
		set( value ) {
			el.setAttributeNS( ns, attrName, value );
		},

		remove() {
			el.removeAttributeNS( ns, attrName );
		}
	};
}

/**
 * Normalizes given {@link ui.TemplateValueSchema} it's always in an Array–like format:
 *
 * 		{ attributeName/text: 'bar' } ->
 * 			{ attributeName/text: [ 'bar' ] }
 *
 * 		{ attributeName/text: { model: ..., modelAttributeName: ..., callback: ... } } ->
 * 			{ attributeName/text: [ { model: ..., modelAttributeName: ..., callback: ... } ] }
 *
 * 		{ attributeName/text: [ 'bar', { model: ..., modelAttributeName: ... }, 'baz' ] }
 *
 * @ignore
 * @private
 * @param {ui.TemplateValueSchema} valueSchema
 * @returns {Array}
 */
function normalizeBinderValueSchema( valueSchema ) {
	return Array.isArray( valueSchema ) ? valueSchema : [ valueSchema ];
}

/**
 * A helper which concatenates the value avoiding unwanted
 * leading white spaces.
 *
 * @ignore
 * @private
 * @param {String} prev
 * @param {String} cur
 * @returns {String}
 */
function binderValueReducer( prev, cur ) {
	return prev === '' ?
			`${cur}`
		:
			cur === '' ? `${prev}` : `${prev} ${cur}`;
}

/**
 * Checks whether given {@link ui.TemplateValueSchema} contains a
 * {@link ui.TemplateBinding}.
 *
 * @ignore
 * @private
 * @param {ui.TemplateValueSchema} valueSchema
 * @returns {Boolean}
 */
function hasModelBinding( valueSchema ) {
	if ( !valueSchema ) {
		return false;
	}

	// Normalize attributes with additional data like namespace:
	// class: { ns: 'abc', value: [ ... ] }
	if ( valueSchema.value ) {
		valueSchema = valueSchema.value;
	}

	if ( Array.isArray( valueSchema ) ) {
		return valueSchema.some( hasModelBinding );
	} else if ( valueSchema.observable ) {
		return true;
	}

	return false;
}

/**
 * Definition of {@link Template}.
 * See: {@link ui.TemplateValueSchema}.
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
 * @typedef ui.TemplateDefinition
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
 * See: {@link ui.TemplateDefinition}.
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
 *				class: [ 'foo', { model: m, attribute: 'bar' }, 'baz' ],
 *
 *				// Array schema, with custom namespace.
 *				class: {
 *					ns: 'http://ns.url',
 *					value: [ 'foo', { model: m, attribute: 'bar' }, 'baz' ]
 *				}
 *			}
 *		}
 *
 * @typedef ui.TemplateValueSchema
 * @type {Object|String|Array}
 */
