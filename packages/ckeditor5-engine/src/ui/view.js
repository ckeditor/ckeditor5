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

CKEDITOR.define( [ 'collection', 'model', 'ui/template' ], function( Collection, Model, Template ) {
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

			this._el = this.render();
			this.attachListeners();

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

			return function( el, updater ) {
				// TODO: Use ES6 default arguments syntax.
				var changeCallback = callback || updater;

				function executeCallback( el, value ) {
					var result = changeCallback( el, value );

					if ( typeof result != 'undefined' ) {
						updater( el, result );
					}
				}

				// Execute callback when the property changes.
				model.on( 'change:' + property, ( evt, value ) => executeCallback( el, value ) );

				// Set the initial state of the view.
				executeCallback( el, model[ property ] );
			};
		}

		/**
		 * Attaches view listeners defined in {@link listeners}.
		 */
		attachListeners() {
			this.listeners.map( l => l.call( this ) );
		}

		/**
		 * Binds native DOM event listener to View event.
		 *
		 * @param {HTMLElement} el DOM element that fires the event.
		 * @param {String} domEvt The name of DOM event the listener listens to.
		 * @param {String} fireEvent The name of the View event fired then DOM event fires.
		 */
		domListener( el, domEvt, fireEvt ) {
			el.addEventListener( domEvt, this.fire.bind( this, fireEvt ) );
		}

		/**
		 * Renders View's {@link el}.
		 *
		 * @returns {HTMLElement}
		 */
		render() {
			this._template = new Template( this.template );

			return this._template.render();
		}

		destroy() {}
	}

	return View;
} );
