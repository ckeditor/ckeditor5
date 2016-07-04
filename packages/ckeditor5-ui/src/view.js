/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Model from './model.js';
import Collection from '../utils/collection.js';
import Region from './region.js';
import Template from './template.js';
import CKEditorError from '../utils/ckeditorerror.js';
import DOMEmitterMixin from './domemittermixin.js';
import mix from '../utils/mix.js';

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
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 */
	constructor( locale ) {
		/**
		 * Model of this view.
		 *
		 * @member {ui.Model} ui.View#model
		 */
		this.model = new Model();

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
		 * @member {ui.Template} ui.View#template
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
		 * Cached {@link ui.Template} binder object specific for this instance.
		 * See {@link ui.View#bind}.
		 *
		 * @private
		 * @member {Object} ui.View.#_bind
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

		return ( this._element = this.template.render() );
	}

	set element( el ) {
		this._element = el;
	}

	/**
	 * Shorthand for {@link ui.Template#bind}, bound to {@link ui.View#model}
	 * and {@link ui.View} on the first access.
	 *
	 * Cached {@link ui.Template#bind} object is stored in {@link ui.View.#_bind}.
	 *
	 * @method ui.View#bind
	 */
	get bind() {
		if ( this._bind ) {
			return this._bind;
		}

		return ( this._bind = Template.bind( this.model, this ) );
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
		this._regionSelectors = this._element = null;
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
}

mix( View, DOMEmitterMixin );

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
