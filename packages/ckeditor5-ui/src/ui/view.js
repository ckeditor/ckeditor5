/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Basic View class.
 *
 * @class View
 * @extends Model
 * @mixins DOMEmitterMixin
 */

CKEDITOR.define( [
	'collection',
	'model',
	'ui/region',
	'ui/template',
	'ckeditorerror',
	'ui/domemittermixin',
	'utils'
], ( Collection, Model, Region, Template, CKEditorError, DOMEmitterMixin, utils ) => {
	class View extends Model {
		/**
		 * Creates an instance of the {@link View} class.
		 *
		 * @param {Model} model (View)Model of this View.
		 * @constructor
		 */
		constructor( model ) {
			super();

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
			this._el = null;

			/**
			 * An instance of Template to generate {@link #_el}.
			 *
			 * @private
			 * @property {Template}
			 */
			this._template = null;
		}

		/**
		 * Initializes the view.
		 */
		init() {
			this._initRegions();
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
					regionEl = this.el.querySelector( regionSelector );
				} else if ( typeof regionSelector == 'function' ) {
					regionEl = regionSelector( this.el );
				} else {
					regionEl = null;
				}

				region.init( regionEl );
			}
		}

		/**
		 * Adds a child view to one of the {@link #regions} (see {@link #register}) in DOM
		 * at given, optional index position.
		 *
		 * @param {String} regionName One of {@link #regions} the child should be added to.
		 * @param {View} childView A child view.
		 * @param {Number} [index] Index at which the child will be added to the region.
		 */
		addChild( regionName, childView, index ) {
			if ( !regionName ) {
				throw new CKEditorError( 'ui-view-addchild-badrname' );
			}

			const region = this.regions.get( regionName );

			if ( !region ) {
				throw new CKEditorError( 'ui-view-addchild-noreg' );
			}

			if ( !childView || !( childView instanceof View ) ) {
				throw new CKEditorError( 'ui-view-addchild-badtype' );
			}

			region.views.add( childView, index );
		}

		/**
		 * Removes a child view from one of the {@link #regions} (see {@link #register}) in DOM.
		 *
		 * @param {String} regionName One of {@link #regions} the view should be removed from.
		 * @param {View} childVIew A child view.
		 * @returns {View} A child view instance after removal.
		 */
		removeChild( regionName, childView ) {
			if ( !childView || !( childView instanceof View ) ) {
				throw new CKEditorError( 'ui-view-removechild-badtype' );
			}

			const region = this.regions.get( regionName );

			if ( !region ) {
				throw new CKEditorError( 'ui-view-removechild-noreg' );
			}

			region.views.remove( childView );

			return childView;
		}

		/**
		 * Returns a child view from one of the {@link #regions}
		 * (see {@link #register}) at given `index`.
		 *
		 * @param {String} regionName One of {@link #regions} the child should be retrieved from.
		 * @param {Number} [index] An index of desired view.
		 * @returns {View} A view instance.
		 */
		getChild( regionName, index ) {
			const region = this.regions.get( regionName );

			if ( !region ) {
				throw new CKEditorError( 'ui-view-getchild-noreg' );
			}

			return region.views.get( index );
		}

		/**
		 * Registers a region in {@link #regions}.
		 *
		 *		let view = new View();
		 *
		 *		// region.name == "foo", region.el == view.el.firstChild
		 *		view.register( 'foo', el => el.firstChild );
		 *
		 *		// region.name == "bar", region.el == view.el.querySelector( 'span' )
		 *		view.register( new Region( 'bar' ), 'span' );
		 *
		 *		// region.name == "bar", region.el == view.el.querySelector( '#div#id' )
		 *		view.register( 'bar', 'div#id', true );
		 *
		 *		// region.name == "baz", region.el == null
		 *		view.register( 'baz', true );
		 *
		 * @param {String|Region} stringOrRegion The name or an instance of the Region
		 * to be registered. If `String`, the region will be created on the fly.
		 * @param {String|Function|true} regionSelector The selector to retrieve region's element
		 * in DOM when the region instance is initialized (see {@link Region#init}, {@link #init}).
		 * @param {Boolean} [override] When set `true` it will allow overriding of registered regions.
		 */
		register() {
			let args = [].slice.call( arguments );
			let region, regionName;

			if ( typeof args[ 0 ] === 'string' ) {
				regionName = args[ 0 ];
				region = this.regions.get( regionName ) || new Region( regionName );
			} else if ( args[ 0 ] instanceof Region ) {
				regionName = args[ 0 ].name;
				region = args[ 0 ];
			} else {
				throw new CKEditorError( 'ui-view-register-wrongtype' );
			}

			const regionSelector = args[ 1 ];

			if ( !regionSelector || !isValidRegionSelector( regionSelector ) ) {
				throw new CKEditorError( 'ui-view-register-badselector' );
			}

			const registered = this.regions.get( regionName );

			if ( !registered ) {
				this.regions.add( region );
			} else {
				if ( registered !== region ) {
					if ( !args[ 2 ] ) {
						throw new CKEditorError( 'ui-view-register-override' );
					}

					this.regions.remove( registered );
					this.regions.add( region );
				}
			}

			this._regionsSelectors[ regionName ] = regionSelector;
		}

		/**
		 * Element of this view. The element is rendered on first reference
		 * using {@link #template} definition and {@link #_template} object.
		 *
		 * @property el
		 */
		get el() {
			if ( this._el ) {
				return this._el;
			}

			if ( !this.template ) {
				throw new CKEditorError( 'ui-view-notemplate' );
			}

			// Prepare pre–defined listeners.
			this._prepareElementListeners( this.template );

			this._template = new Template( this.template );

			return ( this._el = this._template.render() );
		}

		set el( el ) {
			this._el = el;
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
				// TODO: Use ES6 default arguments syntax.
				callback = callback || domUpdater;

				// Execute callback when the attribute changes.
				this.listenTo( this.model, 'change:' + attribute, onModelChange );

				// Set the initial state of the view.
				onModelChange( null, this.model[ attribute ] );

				function onModelChange( evt, value ) {
					let processedValue = callback( el, value );

					if ( typeof processedValue != 'undefined' ) {
						domUpdater( el, processedValue );
					}
				}
			};
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
				while ( ( childView = this.getChild( region.name, 0 ) ) ) {
					this.removeChild( region.name, childView );
				}

				this.regions.remove( region ).destroy();
			}

			if ( this.template ) {
				this.el.remove();
			}

			this.model = this.regions = this.template = this._regionsSelectors = this._el = this._template = null;
		}

		/**
		 * For a given event name or callback, returns a function which,
		 * once executed in a context of an element, attaches native DOM listener
		 * to the element. The listener executes given callback or fires View's event
		 * of given name.
		 *
		 * @protected
		 * @param {String|Function} evtNameOrCallback Event name to be fired on View or callback to execute.
		 * @returns {Function} A function to be executed in the context of an element.
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
			 *     	   { tag: 'span' }
			 *     	   { tag: 'span' }
			 *     ],
			 *     on: {
			 *     	   'click@span': 'foo',
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
		 * Iterates over "on" property in {@link template} definition to recursively
		 * replace each listener declaration with a function which, once executed in a context
		 * of an element, attaches native DOM listener to the element.
		 *
		 * @protected
		 * @param {TemplateDefinition} def Template definition.
		 */
		_prepareElementListeners( def ) {
			let on = def.on;

			if ( on ) {
				let domEvtName, evtNameOrCallback;

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
						on[ domEvtName ] = on[ domEvtName ].map( this._getDOMListenerAttacher, this );
					}
					// Listeners allow definition with a string containing event name:
					//
					//    on: {
					//       'DOMEventName@selector': 'event1',
					//       'DOMEventName': 'event2'
					//       ...
					//    }
					else {
						on[ domEvtName ] = this._getDOMListenerAttacher( evtNameOrCallback );
					}
				}
			}

			// Repeat recursively for the children.
			if ( def.children ) {
				def.children.map( this._prepareElementListeners, this );
			}
		}
	}

	utils.extend( View.prototype, DOMEmitterMixin );

	const validSelectorTypes = new Set( [ 'string', 'boolean', 'function' ] );

	function isValidRegionSelector( selector ) {
		return validSelectorTypes.has( typeof selector ) && selector !== false;
	}

	return View;
} );
