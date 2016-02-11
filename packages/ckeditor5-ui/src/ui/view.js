/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Collection from '../collection.js';
import Region from './region.js';
import Template from './template.js';
import CKEditorError from '../ckeditorerror.js';
import DOMEmitterMixin from './domemittermixin.js';
import utils from '../utils.js';

/**
 * Basic View class.
 *
 * @class View
 * @mixins DOMEmitterMixin
 */

export default class View {
	/**
	 * Creates an instance of the {@link View} class.
	 *
	 * @param {Model} model (View)Model of this View.
	 * @constructor
	 */
	constructor( model ) {
		/**
		 * Model of this view.
		 *
		 * @property {Model}
		 */
		this.model = model || null;

		/**
		 * Regions of this view. See {@link #register}.
		 *
		 * @property {Collection}
		 */
		this.regions = new Collection( {
			idProperty: 'name'
		} );

		/**
		 * Template of this view.
		 *
		 * @property {Object}
		 */
		this.template = null;

		/**
		 * Region selectors of this view. See {@link #register}.
		 *
		 * @private
		 * @property {Object}
		 */
		this._regionsSelectors = {};

		/**
		 * Element of this view.
		 *
		 * @private
		 * @property {HTMLElement}
		 */
		this._element = null;

		/**
		 * An instance of Template to generate {@link #_el}.
		 *
		 * @private
		 * @property {Template}
		 */
		this._template = null;
	}

	/**
	 * Element of this view. The element is rendered on first reference
	 * using {@link #template} definition and {@link #_template} object.
	 *
	 * @property element
	 */
	get element() {
		if ( this._element ) {
			return this._element;
		}

		if ( !this.template ) {
			/**
			 * Attempting to access an element of a view, which has no `template`
			 * property.
			 *
			 * @error ui-view-notemplate
			 */
			throw new CKEditorError( 'ui-view-notemplate' );
		}

		// Prepare pre–defined listeners.
		this._createTemplateListenerAttachers( this.template );

		this._template = new Template( this.template );

		return ( this._element = this._template.render() );
	}

	set element( el ) {
		this._element = el;
	}

	/**
	 * Initializes the view.
	 */
	init() {
		this._initRegions();
	}

	/**
	 * Registers a region in {@link #regions}.
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
	 * in DOM when the region instance is initialized (see {@link Region#init}, {@link #init}).
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

		this._regionsSelectors[ regionName ] = regionSelector;
	}

	/**
	 * Binds an `attribute` of View's model so the DOM of the View is updated when the `attribute`
	 * changes. It returns a function which, once called in the context of a DOM element,
	 * attaches a listener to the model which, in turn, brings changes to DOM.
	 *
	 * @param {String} attribute Attribute name in the model to be observed.
	 * @param {Function} [callback] Callback function executed on attribute change in model.
	 * If not specified, a default DOM `domUpdater` supplied by the template is used.
	 */
	bindToAttribute( attribute, callback ) {
		/**
		 * Attaches a listener to View's model, which updates DOM when the model's attribute
		 * changes. DOM is either updated by the `domUpdater` function supplied by the template
		 * (like attribute changer or `innerHTML` setter) or custom `callback` passed to {@link #bind}.
		 *
		 * This function is called by {@link Template#render}.
		 *
		 * @param {HTMLElement} el DOM element to be updated when `attribute` in model changes.
		 * @param {Function} domUpdater A function provided by the template which updates corresponding
		 * DOM.
		 */
		return ( el, domUpdater ) => {
			let onModelChange;

			if ( callback ) {
				onModelChange = ( evt, value ) => {
					let processedValue = callback( el, value );

					if ( typeof processedValue != 'undefined' ) {
						domUpdater( el, processedValue );
					}
				};
			} else {
				onModelChange = ( evt, value ) => domUpdater( el, value );
			}

			// Execute callback when the attribute changes.
			this.listenTo( this.model, 'change:' + attribute, onModelChange );

			// Set the initial state of the view.
			onModelChange( null, this.model[ attribute ] );
		};
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
	 * See: {@link Template#apply}.
	 *
	 * @param {DOMElement} element DOM Element to initialize.
	 * @param {TemplateDefinition} def Template definition to be applied.
	 */
	applyTemplateToElement( element, def ) {
		this._createTemplateListenerAttachers( def );

		new Template( def ).apply( element );
	}

	/**
	 * Destroys the view instance. The process includes:
	 *  1. Removal of child views from {@link #regions}.
	 *  2. Destruction of the {@link #regions}.
	 *  3. Removal of {#link #_el} from DOM.
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

		this.model = this.regions = this.template = this._regionsSelectors = this._element = this._template = null;
	}

	/**
	 * Initializes {@link #regions} of this view by passing a DOM element
	 * generated from {@link #_regionsSelectors} into {@link Region#init}.
	 *
	 * @protected
	 */
	_initRegions() {
		let region, regionEl, regionSelector;

		for ( region of this.regions ) {
			regionSelector = this._regionsSelectors[ region.name ];

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
		 *     children: [
		 *         { tag: 'span', on: { click: 'foo' } }
		 *         { tag: 'span', on: { click: 'foo' } }
		 *     ]
		 *
		 * a single, more efficient listener can be attached that uses **event delegation**:
		 *
		 *     children: [
		 *         { tag: 'span' }
		 *         { tag: 'span' }
		 *     ],
		 *     on: {
		 *         'click@span': 'foo',
		 *     }
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
	 * Iterates over "on" property in {@link TemplateDefinition} to recursively
	 * replace each listener declaration with a function which, once executed in a context
	 * of an element, attaches native DOM listener to that element.
	 *
	 * @protected
	 * @param {TemplateDefinition} def Template definition.
	 */
	_createTemplateListenerAttachers( def ) {
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
			def.children.forEach( this._createTemplateListenerAttachers, this );
		}
	}
}

utils.mix( View, DOMEmitterMixin );

const validSelectorTypes = new Set( [ 'string', 'boolean', 'function' ] );

/**
 * Check whether region selector is valid.
 *
 * @private
 * @param {*} selector Selector to be checked.
 * @returns {Boolean}
 */
function isValidRegionSelector( selector ) {
	return validSelectorTypes.has( typeof selector ) && selector !== false;
}
