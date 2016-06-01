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
const bindDOMEvtSymbol = Symbol( 'bindDomEvt' );

/**
 * Basic Template class.
 *
 * See {@link ui.TemplateDefinition}.
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
		return this._renderNode( this.definition, undefined, true );
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
		normalize( def );

		// When applying, a definition cannot have "tag" and "text" at the same time.
		// When rendering, a definition must have either "tag" or "text": XOR( def.tag, def.text ).
		const isInvalid = applyNode ?
			( def.tag && def.text ) : ( def.tag ? def.text : !def.text );

		if ( isInvalid ) {
			/**
			 * Node definition cannot have "tag" and "text" properties at the same time.
			 * Node definition must have either "tag" or "text" when rendering new Node.
			 *
			 * @error ui-template-wrong-syntax
			 */
			throw new CKEditorError( 'ui-template-wrong-syntax' );
		}

		return def.text ?
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
		const el = applyElement ||
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

		// Setup DOM bindings event listeners.
		this._setupListeners( def, el );

		return el;
	}

	/**
	 * Renders a Text from TemplateDefinition or String.
	 *
	 * @protected
	 * @param {TemplateDefinition|String} def Definition of Text or its value.
	 * @param {HTMLElement} textNode If specified, template `def` will be applied to existing Text Node.
	 * @returns {Text} A rendered Text.
	 */
	_renderText( valueSchemaOrText, textNode = document.createTextNode( '' ) ) {
		// Check if this Text Node is bound to Observable. Cases:
		//		{ text: [ Template.bind.to( ... ) ] }
		//		{ text: [ 'foo', Template.bind.to( ... ), ... ] }
		if ( isBound( valueSchemaOrText.text ) ) {
			this._bindToObservable( valueSchemaOrText.text, textNode, getTextUpdater( textNode ) );
		}

		// Simply set text. Cases:
		// 		{ text: [ 'all', 'are', 'static' ] }
		// 		{ text: [ 'foo' ] }
		else {
			textNode.textContent = valueSchemaOrText.text;
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
	_renderElementAttributes( { attributes }, el ) {
		let attrName, attrValue, attrNs;

		if ( !attributes ) {
			return;
		}

		for ( attrName in attributes ) {
			attrValue = attributes[ attrName ];
			attrNs = attrValue[ 0 ].ns || null;

			// Activate binding if one is found. Cases:
			// 		{ class: [ Template.bind.to( ... ) ] }
			// 		{ class: [ 'bar', Template.bind.to( ... ), 'baz' ] }
			// 		{ class: { ns: 'abc', value: Template.bind.to( ... ) } }
			if ( isBound( attrValue ) ) {
				// Normalize attributes with additional data like namespace:
				//		{ class: { ns: 'abc', value: [ ... ] } }
				this._bindToObservable(
					attrValue[ 0 ].value || attrValue,
					el,
					getAttributeUpdater( el, attrName, attrNs )
				);
			}

			// Otherwise simply set the attribute.
			// 		{ class: [ 'foo' ] }
			// 		{ class: [ 'all', 'are', 'static' ] }
			// 		{ class: [ { ns: 'abc', value: [ 'foo' ] } ] }
			else {
				attrValue = attrValue
					// Retrieve "values" from { class: [ { ns: 'abc', value: [ ... ] } ] }
					.map( v => v ? ( v.value || v ) : v )
					// Flatten the array.
					.reduce( ( p, n ) => p.concat( n ), [] )
					// Convert into string.
					.reduce( arrayValueReducer );

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
	 * @param {HTMLElement} el Element which is being rendered.
	 */
	_setupListeners( def, el ) {
		if ( !def.on ) {
			return;
		}

		for ( let key in def.on ) {
			const [ domEvtName, domSelector ] = key.split( '@' );

			def.on[ key ].forEach( schemaItem => {
				schemaItem.emitter.listenTo( el, domEvtName, ( evt, domEvt ) => {
					if ( !domSelector || domEvt.target.matches( domSelector ) ) {
						if ( typeof schemaItem.eventNameOrFuncion == 'function' ) {
							schemaItem.eventNameOrFuncion( domEvt );
						} else {
							schemaItem.observable.fire( schemaItem.eventNameOrFuncion, domEvt );
						}
					}
				} );
			} );
		}
	}

	/**
	 * For given {@link ui.TemplateValueSchema} containing {@link ui.TemplateBinding} it activates the
	 * binding and sets its initial value.
	 *
	 * Note: {@link ui.TemplateValueSchema} can be for HTMLElement attributes or Text Node `textContent`.
	 *
	 * @protected
	 * @param {ui.TemplateValueSchema} valueSchema
	 * @param {Node} node DOM Node to be updated when {@link utils.ObservableMixin} changes.
	 * @param {Function} domUpdater A function which updates DOM (like attribute or text).
	 */
	_bindToObservable( valueSchema ) {
		valueSchema
			// Filter inactive bindings from schema, like static strings, etc.
			.filter( item => item.observable )
			// Let the emitter listen to observable change:attribute event.
			// TODO: Reduce the number of listeners attached as many bindings may listen
			// to the same observable attribute.
			.forEach( ( { emitter, observable, attribute } ) => {
				emitter.listenTo( observable, 'change:' + attribute, () => {
					syncDom( ...arguments );
				} );
			} );

		// Set initial values.
		syncDom( ...arguments );
	}
}

mix( Template, EmitterMixin );

/**
 * An entry point to the interface which allows binding DOM nodes to {@link utils.ObservableMixin}.
 * There are two types of bindings:
 *
 * * `HTMLElement` attributes or Text Node `textContent` can be synchronized with {@link utils.ObservableMixin}
 * instance attributes. See {@link ui.Template.bind.binder#to} and {@link ui.Template.bind.binder#if}.
 *
 * * DOM events fired on `HTMLElement` can be propagated through {@link utils.ObservableMixin}.
 * See See {@link ui.Template.bind#binder}.
 *
 * @param {utils.ObservableMixin} observable An instance of ObservableMixin class.
 * @param {utils.EmitterMixin} emitter An instance of `EmitterMixin` class. It listens
 * to `observable` attribute changes and DOM Events, depending on the binding. Usually {@link ui.View} instance.
 * @returns {ui.Template.bind#binder}
 */
Template.bind = ( observable, emitter ) => {
	/**
	 * Binds {@link utils.ObservableMixin} instance to HTMLElement DOM event, so the DOM events
	 * are propagated through Observable.
	 *
	 *		const bind = Template.bind( observableInstance, emitterInstance );
	 *
	 *		new Template( {
	 *			tag: 'p',
	 *			on: {
	 *				click: [
	 *					// "clicked" event will be fired on `observableInstance` when "click" fires in DOM.
	 *					bind( 'clicked' ),
	 *
	 *					// A custom callback function will be executed when "click" fires in DOM.
	 *					bind( () => {
	 *						...
	 *					} )
	 *				]
	 *			}
	 *		} ).render();
	 *
	 * It also provides {@link ui.Template.bind.binder#to} and {@link ui.Template.bind.binder#if} interface.
	 *
	 * @static
	 * @property {ui.Template.bind#binder}
	 * @param {String} eventNameOrFuncion Name of the DOM event to be fired along with DOM event or custom function.
	 * @return {ui.TemplateBinding}
	 */
	const binder = ( eventNameOrFuncion ) => {
		return {
			type: bindDOMEvtSymbol,
			observable, emitter,
			eventNameOrFuncion
		};
	};

	/**
	 * Binds {@link utils.ObservableMixin} to HTMLElement attribute or Text Node `textContent`
	 * so remains in sync with the Observable when it changes.
	 *
	 *		const bind = Template.bind( observableInstance, emitterInstance );
	 *
	 *		new Template( {
	 *			tag: 'p',
	 *			attributes: {
	 *				// class="..." attribute gets bound to `observableInstance#a`
	 *				'class': bind.to( 'a' )
	 *			},
	 *			children: [
	 *				// <p>...</p> gets bound to `observableInstance#b`; always `toUpperCase()`.
	 *				{ text: bind.to( 'b', ( value, node ) => value.toUpperCase() ) }
	 *			]
	 *		} ).render();
	 *
	 * @static
	 * @property {ui.Template.bind.binder#to}
	 * @param {String} attribute Name of {@link utils.ObservableMixin} used in the binding.
	 * @param {Function} [callback] Allows processing of the value. Accepts `Node` and `value` as arguments.
	 * @return {ui.TemplateBinding}
	 */
	binder.to = ( attribute, callback ) => {
		return {
			type: bindToSymbol,
			observable, emitter,
			attribute, callback
		};
	};

	/**
	 * Binds {@link utils.ObservableMixin} to HTMLElement attribute or Text Node `textContent`
	 * so remains in sync with the Model when it changes. Unlike {@link ui.Template.bind.binder#to},
	 * it controls the presence of the attribute/`textContent` depending on the "falseness" of
	 * {@link utils.ObservableMixin} attribute.
	 *
	 *		const bind = Template.bind( observableInstance, emitterInstance );
	 *
	 *		new Template( {
	 *			tag: 'input',
	 *			attributes: {
	 *				// <input checked> when `observableInstance#a` is not undefined/null/false/''
	 *				// <input> when `observableInstance#a` is undefined/null/false
	 *				checked: bind.if( 'a' )
	 *			},
	 *			children: [
	 *				{
	 *					// <input>"b-is-not-set"</input> when `observableInstance#b` is undefined/null/false/''
	 *					// <input></input> when `observableInstance#b` is not "falsy"
	 *					text: bind.if( 'b', 'b-is-not-set', ( value, node ) => !value )
	 *				}
	 *			]
	 *		} ).render();
	 *
	 * @static
	 * @property {ui.Template.bind.binder#if}
	 * @param {String} attribute An attribute name of {@link utils.ObservableMixin} used in the binding.
	 * @param {String} [valueIfTrue] Value set when {@link utils.ObservableMixin} attribute is not undefined/null/false/''.
	 * @param {Function} [callback] Allows processing of the value. Accepts `Node` and `value` as arguments.
	 * @return {ui.TemplateBinding}
	 */
	binder.if = ( attribute, valueIfTrue, callback ) => {
		return {
			type: bindIfSymbol,
			observable, emitter,
			attribute, valueIfTrue, callback
		};
	};

	return binder;
};

/**
 * Assembles the value using {@link ui.TemplateValueSchema} and stores it in a form of
 * an Array. Each entry of an Array corresponds to one of {@link ui.TemplateValueSchema}
 * items.
 *
 * @ignore
 * @private
 * @param {ui.TemplateValueSchema} valueSchema
 * @param {Node} node DOM Node updated when {@link utils.ObservableMixin} changes.
 * @return {Array}
 */
function getBoundValue( valueSchema, domNode ) {
	return valueSchema.map( schemaItem => {
		let { observable, callback, type } = schemaItem;

		if ( observable ) {
			let modelValue = observable[ schemaItem.attribute ];

			// Process the value with the callback.
			if ( callback ) {
				modelValue = callback( modelValue, domNode );
			}

			if ( type === bindIfSymbol ) {
				return !!modelValue ? schemaItem.valueIfTrue || true : '';
			} else {
				return modelValue;
			}
		} else {
			return schemaItem;
		}
	} );
}

/**
 * A function executed each time bound Observable attribute changes, which updates DOM with a value
 * constructed from {@link ui.TemplateValueSchema}.
 *
 * @ignore
 * @private
 * @param {ui.TemplateValueSchema} valueSchema
 * @param {Node} node DOM Node updated when {@link utils.ObservableMixin} changes.
 * @param {Function} domUpdater A function which updates DOM (like attribute or text).
 */
function syncDom( valueSchema, domNode, domUpdater ) {
	let value = getBoundValue( valueSchema, domNode );
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
		value = value.reduce( arrayValueReducer, '' );
		shouldSet = value;
	}

	if ( shouldSet ) {
		domUpdater.set( value );
	} else {
		domUpdater.remove();
	}
}

/*
 * Returns an object consisting of `set` and `remove` functions, which
 * can be used in the context of DOM Node to set or reset `textContent`.
 * @see ui.View#_bindToObservable
 *
 * @ignore
 * @private
 * @param {Node} node DOM Node to be modified.
 * @returns {Object}
 */
function getTextUpdater( node ) {
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
 * @see ui.View#_bindToObservable
 *
 * @ignore
 * @private
 * @param {Node} node DOM Node to be modified.
 * @param {String} attrName Name of the attribute to be modified.
 * @param {String} [ns=null] Namespace to use.
 * @returns {Object}
 */
function getAttributeUpdater( el, attrName, ns = null ) {
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
 * Normalizes given {@link ui.TemplateDefinition}.
 *
 * See:
 *  * {@link normalizeAttributes}
 *  * {@link normalizeListeners}
 *  * {@link normalizeTextChildren}
 *
 * @ignore
 * @private
 * @param {ui.TemplateValueSchema} valueSchema
 * @returns {Array}
 */
function normalize( def ) {
	if ( def.attributes ) {
		normalizeAttributes( def.attributes );
	}

	if ( def.on ) {
		normalizeListeners( def.on );
	}

	if ( def.children ) {
		normalizeTextChildren( def );
	}
}

/**
 * Normalizes "attributes" section of {@link ui.TemplateDefinition}.
 *
 *		attributes: {
 *			a: 'bar',
 *			b: {@link ui.TemplateBinding},
 *			c: {
 *				value: 'bar'
 *			}
 *		}
 *
 * becomes
 *
 *		attributes: {
 *			a: [ 'bar' ],
 *			b: [ {@link ui.TemplateBinding} ],
 *			c: {
 *				value: [ 'bar' ]
 *			}
 *		}
 *
 * @ignore
 * @private
 * @param {Object} attrs
 */
function normalizeAttributes( attrs ) {
	for ( let a in attrs ) {
		if ( attrs[ a ].value ) {
			attrs[ a ].value = [].concat( attrs[ a ].value );
		}

		arrayify( attrs, a );
	}
}

/**
 * Normalizes "on" section of {@link ui.TemplateDefinition}.
 *
 *		on: {
 *			a: 'bar',
 *			b: {@link ui.TemplateBinding},
 *			c: [ {@link ui.TemplateBinding}, () => { ... } ]
 *		}
 *
 * becomes
 *
 *		on: {
 *			a: [ 'bar' ],
 *			b: [ {@link ui.TemplateBinding} ],
 *			c: [ {@link ui.TemplateBinding}, () => { ... } ]
 *		}
 *
 * @ignore
 * @private
 * @param {Object} listeners
 */
function normalizeListeners( listeners ) {
	for ( let l in listeners ) {
		arrayify( listeners, l );
	}
}

/**
 * Normalizes text in "children" section of {@link ui.TemplateDefinition}.
 *
 *		children: [
 *			'abc',
 *			{ text: 'def' },
 *			{ text: {@link ui.TemplateBinding} }
 *		]
 *
 * becomes
 *
 *		children: [
 *			{ text: [ 'abc' ] },
 *			{ text: [ 'def' ] },
 *			{ text: [ {@link ui.TemplateBinding} ] }
 *		]
 *
 * @ignore
 * @private
 * @param {ui.TemplateDefinition} def
 */
function normalizeTextChildren( def ) {
	def.children = def.children.map( c => {
		if ( typeof c == 'string' ) {
			return {
				text: [ c ]
			};
		} else {
			if ( c.text && !Array.isArray( c.text ) ) {
				c.text = [ c.text ];
			}
		}

		return c;
	} );
}

/**
 * Wraps an entry in Object in an Array, if not already one.
 *
 *		{
 *			x: 'y',
 *			a: [ 'b' ]
 *		}
 *
 * becomes
 *
 *		{
 *			x: [ 'y' ],
 *			a: [ 'b' ]
 *		}
 *
 * @ignore
 * @private
 * @param {Object} obj
 * @param {String} key
 */
function arrayify( obj, key ) {
	if ( !Array.isArray( obj[ key ] ) ) {
		obj[ key ] = [ obj[ key ] ];
	}
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
function arrayValueReducer( prev, cur ) {
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
function isBound( valueSchema ) {
	if ( !valueSchema ) {
		return false;
	}

	// Normalize attributes with additional data like namespace:
	// 		class: { ns: 'abc', value: [ ... ] }
	if ( valueSchema.value ) {
		valueSchema = valueSchema.value;
	}

	if ( Array.isArray( valueSchema ) ) {
		return valueSchema.some( isBound );
	} else if ( valueSchema.observable ) {
		return true;
	}

	return false;
}

/**
 * A definition of {@link ui.Template}.
 * See: {@link ui.TemplateValueSchema}.
 *
 *		new Template( {
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
 *				class: {@link ui.TemplateValueSchema},
 *				id: {@link ui.TemplateValueSchema},
 *				...
 *			},
 *			on: {
 *				'click': {@link ui.TemplateListenerSchema}
 *				'keyup@.some-class': {@link ui.TemplateListenerSchema},
 *				...
 *			}
 *		} );
 *
 * @typedef ui.TemplateDefinition
 * @type Object
 * @property {String} tag
 * @property {Array} [children]
 * @property {Object} [attributes]
 * @property {String} [text]
 * @property {Object} [on]
 */

/**
 * Describes a value of HTMLElement attribute or `textContent`.
 * See: {@link ui.TemplateDefinition}.
 *
 *		new Template( {
 *			tag: 'p',
 *			attributes: {
 *				// Plain String schema.
 *				class: 'static-text'
 *
 *				// Object schema, an `ObservableMixin` binding.
 *				class: {@link ui.TemplateBinding}
 *
 *				// Array schema, combines the above.
 *				class: [
 *					'static-text',
 *					{@link ui.TemplateBinding}
 *				],
 *
 *				// Array schema, with custom namespace.
 *				class: {
 *					ns: 'http://ns.url',
 *					value: [
 *						{@link ui.TemplateBinding},
 *						'static-text'
 *					]
 *				}
 *			}
 *		} );
 *
 * @typedef ui.TemplateValueSchema
 * @type {Object|String|Array}
 */

/**
 * Describes a listener attached to HTMLElement. See: {@link ui.TemplateDefinition}.
 *
 *		new Template( {
 *			tag: 'p',
 *			on: {
 *				// Plain String schema.
 *				click: 'clicked'
 *
 *				// Object schema, an `ObservableMixin` binding.
 *				click: {@link ui.TemplateBinding}
 *
 *				// Array schema, combines the above.
 *				click: [
 *					'clicked',
 *					{@link ui.TemplateBinding}
 *				],
 *
 *				// Array schema, with custom callback.
 *				// Note: It will work for "click" event on class=".foo" children only.
 *				'click@.foo': {
 *					'clicked',
 *					{@link ui.TemplateBinding},
 *					() => { ... }
 *				}
 *			}
 *		} );
 *
 * @typedef ui.TemplateListenerSchema
 * @type {Object|String|Array}
 */

/**
 * Describes Model binding created by {@link ui.Template#bind}.
 *
 * @typedef ui.TemplateBinding
 * @type Object
 * @property {utils.ObservableMixin} observable
 * @property {utils.EmitterMixin} emitter
 * @property {Symbol} type
 * @property {String} attribute
 * @property {String} [valueIfTrue]
 * @property {Function} [callback]
 */
