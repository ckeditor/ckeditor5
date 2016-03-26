/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Collection from '../utils/collection.js';
import Region from './region.js';
import Template from './template.js';
import CKEditorError from '../utils/ckeditorerror.js';
import DOMEmitterMixin from './domemittermixin.js';
import utils from '../utils/utils.js';
import isPlainObject from '../utils/lib/lodash/isPlainObject.js';

const bindToSymbol = Symbol( 'bindTo' );
const bindIfSymbol = Symbol( 'bindIf' );

/**
 * Basic View class.
 *
 * @memberOf ui
 * @mixes DOMEmitterMixin
 */
export default class View {
	/**
	 * Creates an instance of the {@link ui.View} class.
	 *
	 * @param {ui.Model} model (View)Model of this View.
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 */
	constructor( model, locale ) {
		/**
		 * Model of this view.
		 *
		 * @member {ui.Model} ui.View#model
		 */
		this.model = model;

		/**
		 * @readonly
		 * @member {utils.Locale} ui.View#locale
		 */
		this.locale = locale;

		/**
		 * Shorthand for {@link utils.Locale#t}.
		 *
		 * Note: If locale instance hasn't been passed to the view this method may not be available.
		 *
		 * @see utils.Locale#t
		 * @method ui.View#t
		 */
		this.t = locale && locale.t;

		/**
		 * Regions of this view. See {@link ui.View#register}.
		 *
		 * @member {utils.Collection} ui.View#regions
		 */
		this.regions = new Collection( {
			idProperty: 'name'
		} );

		/**
		 * Template of this view.
		 *
		 * @member {Object} ui.View#template
		 */

		/**
		 * Region selectors of this view. See {@link ui.View#register}.
		 *
		 * @private
		 * @member {Object} ui.View#_regionSelectors
		 */
		this._regionSelectors = {};

		/**
		 * Element of this view.
		 *
		 * @private
		 * @member {HTMLElement} ui.View.#_element
		 */

		/**
		 * An instance of Template to generate {@link ui.View#_el}.
		 *
		 * @private
		 * @member {ui.Template} ui.View#_template
		 */
	}

	/**
	 * Element of this view. The element is rendered on first reference
	 * using {@link ui.View#template} definition.
	 *
	 * @type {HTMLElement}
	 */
	get element() {
		if ( this._element ) {
			return this._element;
		}

		// No template means no element (a virtual view).
		if ( !this.template ) {
			return null;
		}

		// Prepare pre–defined listeners.
		this._extendTemplateWithListenerAttachers( this.template );

		// Prepare pre–defined attribute bindings.
		this._extendTemplateWithModelBinders( this.template );

		this._template = new Template( this.template );

		return ( this._element = this._template.render() );
	}

	set element( el ) {
		this._element = el;
	}

	/**
	 * And entry point to the interface which allows binding attributes of {@link View#model}
	 * to the DOM items like HTMLElement attributes or Text Node `textContent`, so their state
	 * is synchronized with {@link View#model}.
	 *
	 * @readonly
	 * @type ui.ViewModelBinding
	 */
	get attributeBinder() {
		if ( this._attributeBinder ) {
			return this._attributeBinder;
		}

		const model = this.model;
		const binder = {
			/**
			 * Binds {@link View#model} to HTMLElement attribute or Text Node `textContent`
			 * so remains in sync with the Model when it changes.
			 *
			 *		this.template = {
			 *			tag: 'p',
			 *			attributes: {
			 *				// class="..." attribute gets bound to this.model.a
			 *				'class': bind.to( 'a' )
			 *			},
			 *			children: [
			 *				// <p>...</p> gets bound to this.model.b; always `toUpperCase()`.
			 *				{ text: bind.to( 'b', ( value, node ) => value.toUpperCase() ) }
			 *			]
			 *		}
			 *
			 * @property {attributeBinder.to}
			 * @param {String} attribute Name of {@link View#model} used in the binding.
			 * @param {Function} [callback] Allows processing of the value. Accepts `Node` and `value` as arguments.
			 * @return {ui.ViewModelBinding}
			 */
			to( attribute, callback ) {
				return {
					type: bindToSymbol,
					model: model,
					attribute,
					callback
				};
			},

			/**
			 * Binds {@link View#model} to HTMLElement attribute or Text Node `textContent`
			 * so remains in sync with the Model when it changes. Unlike {@link View#attributeBinder.to},
			 * it controls the presence of the attribute/`textContent` depending on the "falseness" of
			 * {@link View#model} attribute.
			 *
			 *		this.template = {
			 *			tag: 'input',
			 *			attributes: {
			 *				// <input checked> this.model.a is not undefined/null/false/''
			 *				// <input> this.model.a is undefined/null/false
			 *				checked: bind.if( 'a' )
			 *			},
			 *			children: [
			 *				{
			 *					// <input>"b-is-not-set"</input> when this.model.b is undefined/null/false/''
			 *					// <input></input> when this.model.b is not "falsy"
			 *					text: bind.if( 'b', 'b-is-not-set', ( value, node ) => !value )
			 *				}
			 *			]
			 *		}
			 *
			 * @property {attributeBinder.if}
			 * @param {String} attribute Name of {@link View#model} used in the binding.
			 * @param {String} [valueIfTrue] Value set when {@link View#model} attribute is not undefined/null/false/''.
			 * @param {Function} [callback] Allows processing of the value. Accepts `Node` and `value` as arguments.
			 * @return {ui.ViewModelBinding}
			 */
			if( attribute, valueIfTrue, callback ) {
				return {
					type: bindIfSymbol,
					model: model,
					attribute,
					valueIfTrue,
					callback
				};
			}
		};

		return ( this._attributeBinder = binder );
	}

	/**
	 * Initializes the view.
	 *
	 * Note: {@link ui.Controller} supports if a promise is returned by this method,
	 * what means that view initialization may be asynchronous.
	 */
	init() {
		this._initRegions();
	}

	/**
	 * Registers a region in {@link ui.View#regions}.
	 *
	 *		let view = new View();
	 *
	 *		// region.name == "foo", region.element == view.element.firstChild
	 *		view.register( 'foo', el => el.firstChild );
	 *
	 *		// region.name == "bar", region.element == view.element.querySelector( 'span' )
	 *		view.register( new Region( 'bar' ), 'span' );
	 *
	 *		// region.name == "bar", region.element == view.element.querySelector( '#div#id' )
	 *		view.register( 'bar', 'div#id', true );
	 *
	 *		// region.name == "baz", region.element == null
	 *		view.register( 'baz', true );
	 *
	 * @param {String|Region} stringOrRegion The name or an instance of the Region
	 * to be registered. If `String`, the region will be created on the fly.
	 * @param {String|Function|true} regionSelector The selector to retrieve region's element
	 * in DOM when the region instance is initialized (see {@link Region#init}, {@link ui.View#init}).
	 * @param {Boolean} [override] When set `true` it will allow overriding of registered regions.
	 */
	register( ...args ) {
		let region, regionName;

		if ( typeof args[ 0 ] === 'string' ) {
			regionName = args[ 0 ];
			region = this.regions.get( regionName ) || new Region( regionName );
		} else if ( args[ 0 ] instanceof Region ) {
			regionName = args[ 0 ].name;
			region = args[ 0 ];
		} else {
			/**
			 * A name of the region or an instance of Region is required.
			 *
			 * @error ui-view-register-wrongtype
			 */
			throw new CKEditorError( 'ui-view-register-wrongtype' );
		}

		const regionSelector = args[ 1 ];

		if ( !regionSelector || !isValidRegionSelector( regionSelector ) ) {
			/**
			 * The selector must be String, Function or `true`.
			 *
			 * @error ui-view-register-badselector
			 */
			throw new CKEditorError( 'ui-view-register-badselector' );
		}

		const registered = this.regions.get( regionName );

		if ( !registered ) {
			this.regions.add( region );
		} else {
			if ( registered !== region ) {
				if ( !args[ 2 ] ) {
					/**
					 * Overriding is possible only when `override` flag is set.
					 *
					 * @error ui-view-register-override
					 */
					throw new CKEditorError( 'ui-view-register-override' );
				}

				this.regions.remove( registered );
				this.regions.add( region );
			}
		}

		this._regionSelectors[ regionName ] = regionSelector;
	}

	/**
	 * Applies template to existing DOM element in the context of a View.
	 *
	 *		const element = document.createElement( 'div' );
	 *		const view = new View( new Model( { divClass: 'my-div' } ) );
	 *
	 *		view.applyTemplateToElement( element, {
	 *			attrs: {
	 *				id: 'first-div',
	 *				class: view.bindToAttribute( 'divClass' )
	 *			},
	 *			on: {
	 *				click: 'elementClicked' // Will be fired by the View instance.
	 *			}
	 *			children: [
	 *				'Div text.'
	 *			]
	 *		} );
	 *
	 *		element.outerHTML == "<div id="first-div" class="my-div">Div text.</div>"
	 *
	 * See: {@link ui.Template#apply}.
	 *
	 * @param {DOMElement} element DOM Element to initialize.
	 * @param {ui.TemplateDefinition} def Template definition to be applied.
	 */
	applyTemplateToElement( element, def ) {
		// Prepare pre–defined listeners.
		this._extendTemplateWithListenerAttachers( def );

		// Prepare pre–defined attribute bindings.
		this._extendTemplateWithModelBinders( def );

		new Template( def ).apply( element );
	}

	/**
	 * Destroys the view instance. The process includes:
	 *
	 * 1. Removal of child views from {@link ui.View#regions}.
	 * 2. Destruction of the {@link ui.View#regions}.
	 * 3. Removal of {@link #_el} from DOM.
	 */
	destroy() {
		let childView;

		this.stopListening();

		for ( let region of this.regions ) {
			while ( ( childView = region.views.get( 0 ) ) ) {
				region.views.remove( childView );
			}

			this.regions.remove( region ).destroy();
		}

		if ( this.template ) {
			this.element.remove();
		}

		this.model = this.regions = this.template = this.locale = this.t = null;
		this._regionSelectors = this._element = this._template = null;
	}

	/**
	 * Initializes {@link ui.View#regions} of this view by passing a DOM element
	 * generated from {@link ui.View#_regionSelectors} into {@link Region#init}.
	 *
	 * @protected
	 */
	_initRegions() {
		let region, regionEl, regionSelector;

		for ( region of this.regions ) {
			regionSelector = this._regionSelectors[ region.name ];

			if ( typeof regionSelector == 'string' ) {
				regionEl = this.element.querySelector( regionSelector );
			} else if ( typeof regionSelector == 'function' ) {
				regionEl = regionSelector( this.element );
			} else {
				regionEl = null;
			}

			region.init( regionEl );
		}
	}

	/**
	 * For a given event name or callback, returns a function which,
	 * once executed in a context of an element, attaches native DOM listener
	 * to the element. The listener executes given callback or fires View's event
	 * of given name.
	 *
	 * @protected
	 * @param {String|Function} evtNameOrCallback Event name to be fired on View or callback to execute.
	 * @returns {Function} A listener attacher function to be executed in the context of an element.
	 */
	_getDOMListenerAttacher( evtNameOrCallback ) {
		/**
		 * Attaches a native DOM listener to given element. The listener executes the
		 * callback or fires View's event.
		 *
		 * Note: If the selector is supplied, it narrows the scope to relevant targets only.
		 * So instead of
		 *
		 *		children: [
		 *			{ tag: 'span', on: { click: 'foo' } }
		 *			{ tag: 'span', on: { click: 'foo' } }
		 *		]
		 *
		 * a single, more efficient listener can be attached that uses **event delegation**:
		 *
		 *		children: [
		 *			{ tag: 'span' }
		 *			{ tag: 'span' }
		 *		],
		 *		on: {
		 *			'click@span': 'foo',
		 *		}
		 *
		 * @param {HTMLElement} el Element, to which the native DOM Event listener is attached.
		 * @param {String} domEventName The name of native DOM Event.
		 * @param {String} [selector] If provided, the selector narrows the scope to relevant targets only.
		 */
		return ( el, domEvtName, selector ) => {
			// Use View's listenTo, so the listener is detached, when the View dies.
			this.listenTo( el, domEvtName, ( evt, domEvt ) => {
				if ( !selector || domEvt.target.matches( selector ) ) {
					if ( typeof evtNameOrCallback == 'function' ) {
						evtNameOrCallback( domEvt );
					} else {
						this.fire( evtNameOrCallback, domEvt );
					}
				}
			} );
		};
	}

	/**
	 * For given {@link ui.TemplateValueSchema} found by (@link _extendTemplateWithModelBinders} containing
	 * {@link ui.ViewModelBinding} it returns a function, which when called by {@link Template#render}
	 * or {@link Template#apply} activates the binding and sets its initial value.
	 *
	 * Note: {@link ui.TemplateValueSchema} can be for HTMLElement attributes or Text Node `textContent`.
	 *
	 * @protected
	 * @param {ui.TemplateValueSchema}
	 * @return {Function}
	 */
	_getModelBinder( valueSchema ) {
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
				model = schemaItem.model;

				if ( model ) {
					modelValue = model[ schemaItem.attribute ];

					if ( schemaItem.callback ) {
						modelValue = schemaItem.callback( modelValue, node );
					}

					return modelValue;
				} else {
					return schemaItem;
				}
			} );
		};

		/**
		 * Attaches a listener to {@link View#model}, which updates DOM with a value constructed from
		 * {@link ui.TemplateValueSchema} when {@link View#model} attribute value changes.
		 *
		 * This function is called by {@link Template#render} or {@link Template#apply}.
		 *
		 * @param {Node} node DOM Node to be updated when {@link View#model} changes.
		 * @param {Function} domUpdater A function provided by {@link Template} which updates corresponding
		 * DOM attribute or `textContent`.
		 */
		return ( node, domUpdater ) => {
			// Check if valueSchema is a single bind.if, like:
			//		{ class: bind.if( 'foo' ) }
			const isPlainBindIf = valueSchema.length == 1 && valueSchema[ 0 ].type == bindIfSymbol;

			// A function executed each time bound model attribute changes.
			const onModelChange = () => {
				let value = getBoundValue( node );

				if ( isPlainBindIf ) {
					value = value[ 0 ];
				} else {
					value = value.reduce( binderValueReducer, '' );
				}

				const isSet = isPlainBindIf ? !!value : value;

				const valueToSet = isPlainBindIf ?
					( valueSchema[ 0 ].valueIfTrue || '' ) : value;

				if ( isSet ) {
					domUpdater.set( valueToSet );
				} else {
					domUpdater.remove();
				}
			};

			valueSchema
				.filter( schemaItem => schemaItem.model )
				.forEach( schemaItem => {
					this.listenTo( schemaItem.model, 'change:' + schemaItem.attribute, onModelChange );
				} );

			// Set initial values.
			onModelChange();
		};
	}

	/**
	 * Iterates over "attributes" and "text" properties in {@link TemplateDefinition} and
	 * locates existing {@link ui.ViewModelBinding} created by {@link ui.View#attributeBinder}.
	 * Then, for each such a binding, it creates corresponding entry in {@link Template#_modelBinders},
	 * which can be then activated by {@link Template#render} or {@link Template#apply}.
	 *
	 * @protected
	 * @param {ui.TemplateDefinition} def
	 */
	_extendTemplateWithModelBinders( def ) {
		const attributes = def.attributes;
		const text = def.text;
		let binders = def._modelBinders;
		let attrName, attrValue;

		if ( !binders && isPlainObject( def ) ) {
			Object.defineProperty( def, '_modelBinders', {
				enumerable: false,
				writable: true,
				value: {
					attributes: {}
				}
			} );

			binders = def._modelBinders;
		}

		if ( attributes ) {
			for ( attrName in attributes ) {
				attrValue = attributes[ attrName ];

				if ( hasModelBinding( attrValue ) ) {
					binders.attributes[ attrName ] = this._getModelBinder( attrValue );
				}
			}
		}

		if ( text && hasModelBinding( text ) ) {
			binders.text = this._getModelBinder( text );
		}

		// Repeat recursively for the children.
		if ( def.children ) {
			def.children.forEach( this._extendTemplateWithModelBinders, this );
		}
	}

	/**
	 * Iterates over "on" property in {@link TemplateDefinition} to recursively
	 * replace each listener declaration with a function which, once executed in a context
	 * of an element, attaches native DOM listener to that element.
	 *
	 * @protected
	 * @param {ui.TemplateDefinition} def Template definition.
	 */
	_extendTemplateWithListenerAttachers( def ) {
		const on = def.on;

		// Don't create attachers if they're already here or in the context of the same (this) View instance.
		if ( on && ( !on._listenerAttachers || on._listenerView != this ) ) {
			let domEvtName, evtNameOrCallback;

			Object.defineProperty( on, '_listenerAttachers', {
				enumerable: false,
				writable: true,
				value: {}
			} );

			for ( domEvtName in on ) {
				evtNameOrCallback = on[ domEvtName ];

				// Listeners allow definition with an array:
				//
				//    on: {
				//        'DOMEventName@selector': [ 'event1', callback ],
				//        'DOMEventName': [ callback, 'event2', 'event3' ]
				//        ...
				//    }
				if ( Array.isArray( evtNameOrCallback ) ) {
					on._listenerAttachers[ domEvtName ] = on[ domEvtName ].map( this._getDOMListenerAttacher, this );
				}
				// Listeners allow definition with a string containing event name:
				//
				//    on: {
				//       'DOMEventName@selector': 'event1',
				//       'DOMEventName': 'event2'
				//       ...
				//    }
				else {
					on._listenerAttachers[ domEvtName ] = this._getDOMListenerAttacher( evtNameOrCallback );
				}
			}

			// Set this property to be known that these attachers has already been created
			// in the context of this particular View instance.
			Object.defineProperty( on, '_listenerView', {
				enumerable: false,
				writable: true,
				value: this
			} );
		}

		// Repeat recursively for the children.
		if ( def.children ) {
			def.children.forEach( this._extendTemplateWithListenerAttachers, this );
		}
	}
}

utils.mix( View, DOMEmitterMixin );

const validSelectorTypes = new Set( [ 'string', 'boolean', 'function' ] );

/**
 * Check whether region selector is valid.
 *
 * @ignore
 * @private
 * @param {*} selector Selector to be checked.
 * @returns {Boolean}
 */
function isValidRegionSelector( selector ) {
	return validSelectorTypes.has( typeof selector ) && selector !== false;
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
 * Checks whether given {@link ui.TemplateValueSchema} contains a
 * {@link ui.ViewModelBinding}.
 *
 * @ignore
 * @private
 * @param {ui.TemplateValueSchema} valueSchema
 * @returns {Boolean}
 */
function hasModelBinding( valueSchema ) {
	if ( Array.isArray( valueSchema ) ) {
		return valueSchema.some( hasModelBinding );
	} else if ( valueSchema.model ) {
		return true;
	}

	return false;
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
	return prev === '' ? `${cur}` : `${prev} ${cur}`;
}

/**
 * Describes Model binding created by {@link View#attributeBinder}.
 *
 * @typedef ui.ViewModelBinding
 * @type Object
 * @property {Symbol} type
 * @property {ui.Model} model
 * @property {String} attribute
 * @property {String} [valueIfTrue]
 * @property {Function} [callback]
 */
