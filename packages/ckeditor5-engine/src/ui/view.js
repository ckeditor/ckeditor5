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
 */

CKEDITOR.define( [
	'collection',
	'model',
	'ui/template',
	'ckeditorerror',
	'ui/domemittermixin',
	'utils'
], function( Collection, Model, Template, CKEditorError, DOMEmitterMixin, utils ) {
	class View extends Model {
		/**
		 * Creates an instance of the {@link View} class.
		 *
		 * @param {Model} mode (View)Model of this View.
		 * @constructor
		 */
		constructor( model ) {
			super();

			/**
			 * Model of this view.
			 */
			this.model = new Model( model );

			/**
			 * Regions which belong to this view.
			 */
			this.regions = new Collection();

			/**
			 * The list of listeners attached in this view.
			 *
			 * @property {Array}
			 */
			this.listeners = [];
		}

		/**
		 * Element of this view. The element is rendered on first reference.
		 *
		 * @property el
		 */
		get el() {
			if ( this._el ) {
				return this._el;
			}

			// Render the element using the template.
			this._el = this.render();

			return this._el;
		}

		/**
		 * Binds a property of the model to a specific listener that
		 * updates the view when the property changes.
		 *
		 * @param {Model} model Model to which the property is bound to.
		 * @param {String} property Property name in the model.
		 * @param {Function} [callback] Callback function executed on property change in model.
		 * @constructor
		 */
		bind( property, callback ) {
			var model = this.model;

			return function attachModelListener( el, domUpdater ) {
				// TODO: Use ES6 default arguments syntax.
				callback = callback || domUpdater;

				var listenerCallback = ( evt, value ) => {
					var processedValue = callback( el, value );

					if ( typeof processedValue != 'undefined' ) {
						domUpdater( el, processedValue );
					}
				};

				// Execute callback when the property changes.
				this.listenTo( model, 'change:' + property, listenerCallback );

				// Set the initial state of the view.
				listenerCallback( null, model[ property ] );
			}.bind( this );
		}

		/**
		 * Renders View's {@link el} using {@link Template} instance.
		 *
		 * @returns {HTMLElement}
		 */
		render() {
			if ( !this.template ) {
				throw new CKEditorError(
					'ui-view-notemplate: This View implements no template to render.',
					{ view: this }
				);
			}

			// Prepare pre–defined listeners.
			this._prepareTemplateListeners();

			this._template = new Template( this.template );

			return this._template.render();
		}

		/**
		 * Destroys the View.
		 */
		destroy() {
			// Drop the reference to the model.
			this.model = null;

			// Remove View's element from DOM.
			if ( this.template ) {
				this.el.remove();
			}

			// Remove and destroy regions.
			for ( let i = this.regions.length; i--; ) {
				this.regions.remove( i ).destroy();
			}

			// Remove all listeners related to this view.
			this.stopListening();
		}

		/**
		 * Iterates over all "listeners" properties in {@link template} and replaces
		 * listener definitions with functions which, once executed in a context of
		 * a DOM element, will attach native DOM listeners to elements.
		 *
		 * The execution is performed by {@link Template} class.
		 */
		_prepareTemplateListeners() {
			/**
			 * For a given event name or callback, returns a function which,
			 * once executed in a context of an element, attaches native DOM listener
			 * to the element. The listener executes given callback or fires View's event
			 * of given name.
			 *
			 * @param {String|Function} evtNameOrCallback Event name to be fired on View or callback to execute.
			 * @returns {Function} A function to be executed in the context of an element.
			 */
			var getDOMListenerAttacher = ( evtNameOrCallback ) => {
				/**
				 * Attaches a native DOM listener to given element. The listener executes the
				 * callback or fires View's event.
				 *
				 * Note: If the selector is supplied, it narrows the scope to relevant targets only.
				 * So instead of
				 *
				 *     children: [
				 *         { tag: 'span', listeners: { click: 'foo' } }
				 *         { tag: 'span', listeners: { click: 'foo' } }
				 *     ]
				 *
				 * a single, more efficient listener can be attached that uses **event delegation**:
				 *
				 *     children: [
				 *     	   { tag: 'span' }
				 *     	   { tag: 'span' }
				 *     ],
				 *     listeners: {
				 *     	   'click@span': 'foo',
				 *     }
				 *
				 * @param {HTMLElement} el Element, to which the native DOM Event listener is attached.
				 * @param {String} domEventName The name of native DOM Event.
				 * @param {String} [selector] If provided, the selector narrows the scope to relevant targets only.
				 */
				var attacher = ( el, domEvtName, selector ) => {
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

				return attacher;
			};

			/**
			 * Iterates over "listeners" property in {@link template} definition to recursively
			 * replace each listener declaration with a function which, once executed in a context
			 * of an element, attaches native DOM listener to the element.
			 *
			 * @param {Object} def Template definition.
			 */
			function prepareElementListeners( def ) {
				if ( def.listeners ) {
					let listeners = def.listeners;
					let evtNameOrCallback;

					for ( let domEvtName in listeners ) {
						evtNameOrCallback = listeners[ domEvtName ];

						// Listeners allow definition with an array:
						//
						//    listeners: {
						//        'DOMEvent@selector': [ 'event1', callback ],
						//        'DOMEvent': [ callback, 'event2', 'event3' ]
						//        ...
						//    }
						if ( Array.isArray( evtNameOrCallback ) ) {
							listeners[ domEvtName ] = listeners[ domEvtName ].map(
								evtNameOrCallback => getDOMListenerAttacher( evtNameOrCallback )
							);
						}
						// Listeners allow definition with a string containing event name:
						//
						//    listeners: {
						//       'DOMEvent@selector': 'event1',
						//       'DOMEvent': 'event2'
						//       ...
						//    }
						else {
							listeners[ domEvtName ] = getDOMListenerAttacher( evtNameOrCallback );
						}
					}
				}

				// Repeat recursively for the children.
				if ( def.children ) {
					def.children.map( prepareElementListeners );
				}
			}

			if ( this.template ) {
				prepareElementListeners( this.template );
			}
		}
	}

	utils.extend( View.prototype, DOMEmitterMixin );

	return View;
} );
