/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/view
 */

import CKEditorError from '../utils/ckeditorerror.js';
import ViewCollection from './viewcollection.js';
import Template from './template.js';
import DomEmmiterMixin from '../utils/dom/emittermixin.js';
import ObservableMixin from '../utils/observablemixin.js';
import Collection from '../utils/collection.js';
import mix from '../utils/mix.js';
import isIterable from '../utils/isiterable.js';

/**
 * Basic View class.
 *
 *		class SampleView extends View {
 *			constructor( locale ) {
 *				super( locale );
 *
 *				this.template = new Template( {
 *					tag: 'p',
 *					children: [
 *						'Hello',
 *						{
 *							tag: 'b',
 *							children: [
 *								'world!'
 *							]
 *						}
 *					],
 *					attributes: {
 *						class: 'foo'
 *					}
 *				} );
 *			}
 *		}
 *
 *		const view = new SampleView( locale );
 *
 *		view.init().then( () => {
 *			// Will append <p class="foo">Hello<b>world</b></p>
 *			document.body.appendChild( view.element );
 *		} );
 *
 * @mixes module:utils/dom/emittermixin~EmmiterMixin
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class View {
	/**
	 * Creates an instance of the {@link module:ui/view~View} class.
	 *
	 * @param {module:utils/locale~Locale} [locale] The {@link module:core/editor~Editor editor's locale} instance.
	 */
	constructor( locale ) {
		/**
		 * A set of tools to localize the user interface. See {@link module:core/editor~Editor}.
		 *
		 * @readonly
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = locale;

		/**
		 * Shorthand for {@link module:utils/locale~Locale#t}.
		 *
		 * Note: If locale instance hasn't been passed to the view this method may not be available.
		 *
		 * @see module:utils/locale~Locale#t
		 * @method
		 */
		this.t = locale && locale.t;

		/**
		 * Set `true` after {@link #init}, which can be asynchronous.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #ready
		 */
		this.set( 'ready', false );

		/**
		 * Collections registered with {@link #createCollection}.
		 *
		 * @protected
		 * @member {Set.<module:ui/viewcollection~ViewCollection>}
		 */
		this._viewCollections = new Collection();

		/**
		 * A collection of view instances, which have been added directly
		 * into the {@link module:ui/template~Template#children}.
		 *
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._unboundChildren = this.createCollection();

		// Pass parent locale to its children.
		this._viewCollections.on( 'add', ( evt, collection ) => {
			collection.locale = locale;
		} );

		/**
		 * Template of this view.
		 *
		 * @member {module:ui/template~Template} #template
		 */

		/**
		 * Element of this view.
		 *
		 * @private
		 * @member {HTMLElement} #_element
		 */

		/**
		 * Cached {@link module:ui/template~Template} binder object specific for this instance.
		 * See {@link #bindTemplate}.
		 *
		 * @private
		 * @member {Object} #_bindTemplate
		 */
	}

	/**
	 * Element of this view. The element is rendered on first reference
	 * using {@link #template} definition.
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

	/**
	 * @type {HTMLElement}
	 */
	set element( el ) {
		this._element = el;
	}

	/**
	 * Shorthand for {@link module:ui/template~Template.bind}, bound to {@link ~View} on the first access.
	 *
	 * Cached {@link module:ui/template~Template.bind} object is stored in {@link #_bindTemplate}.
	 *
	 * @method #bindTemplate
	 */
	get bindTemplate() {
		if ( this._bindTemplate ) {
			return this._bindTemplate;
		}

		return ( this._bindTemplate = Template.bind( this, this ) );
	}

	/**
	 * Creates a new collection of views, which can be used in this view instance,
	 * e.g. as a member of {@link module:ui/template~TemplateDefinition TemplateDefinition} children.
	 *
	 *		class SampleView extends View {
	 *			constructor( locale ) {
	 *				super( locale );
	 *
	 *				this.items = this.createCollection();
 	 *
	 *				this.template = new Template( {
	 *					tag: 'p',
	 *
	 *					// `items` collection will render here.
	 *					children: this.items
	 *				} );
	 *			}
	 *		}
	 *
	 *		const view = new SampleView( locale );
	 *		const anotherView = new AnotherSampleView( locale );
	 *
	 *		view.init().then( () => {
	 *			// Will append <p></p>
	 *			document.body.appendChild( view.element );
	 *
	 *			// `anotherView` becomes a child of the view, which is reflected in DOM
	 *			// <p><anotherView#element></p>
	 *			view.items.add( anotherView );
	 *		} );
	 *
	 * @returns {module:ui/viewcollection~ViewCollection} A new collection of view instances.
	 */
	createCollection() {
		const collection = new ViewCollection();

		this._viewCollections.add( collection );

		return collection;
	}

	/**
	 * Registers a new child view under this view instance. Once registered, a child
	 * view is managed by its parent, including initialization ({@link #init})
	 * and destruction ({@link #destroy}).
	 *
	 *		class SampleView extends View {
	 *			constructor( locale ) {
	 *				super( locale );
	 *
	 *				this.childA = new SomeChildView( locale );
	 *				this.childB = new SomeChildView( locale );
	 *
	 *				// Register children.
	 *				this.addChildren( [ this.childA, this.childB ] );
	 *
	 *				this.template = new Template( {
	 *					tag: 'p',
	 *
	 *					children: [
	 *						// This is where the `childA` will render.
	 *						this.childA,
	 *
	 *						{ tag: 'b' },
	 *
	 *						// This is where the `childB` will render.
	 *						this.childB
	 *					]
	 *				} );
	 *			}
	 *		}
	 *
	 *		const view = new SampleView( locale );
	 *
	 *		view.init().then( () => {
	 *			// Will append <p><childA#element><b></b><childB#element></p>
	 *			document.body.appendChild( view.element );
	 *		} );
	 *
	 * @param {module:ui/view~View|Iterable.<module:ui/view~View>} children Children views to be registered.
	 */
	addChildren( children ) {
		if ( !isIterable( children ) ) {
			children = [ children ];
		}

		for ( let child of children ) {
			this._unboundChildren.add( child );
		}
	}

	/**
	 * Initializes the view and child views located in {@link #_viewCollections}.
	 *
	 * @returns {Promise} A Promise resolved when the initialization process is finished.
	 */
	init() {
		if ( this.ready ) {
			/**
			 * This View has already been initialized.
			 *
			 * @error ui-view-init-reinit
			 */
			throw new CKEditorError( 'ui-view-init-reinit: This View has already been initialized.' );
		}

		return Promise.resolve()
			// Initialize collections in #_viewCollections.
			.then( () => {
				return Promise.all( this._viewCollections.map( c => c.init() ) );
			} )
			// Spread the word that this view is ready!
			.then( () => {
				this.ready = true;
			} );
	}

	/**
	 * Destroys the view instance and child views located in {@link #_viewCollections}.
	 *
	 * @returns {Promise} A Promise resolved when the destruction process is finished.
	 */
	destroy() {
		this.stopListening();

		const promises = this._viewCollections.map( c => c.destroy() );

		this._unboundChildren.clear();
		this._viewCollections.clear();

		if ( this.element ) {
			this.element.remove();
		}

		this.element = this.template = this.locale = this.t =
			this._viewCollections = this._unboundChildren = null;

		return Promise.all( promises );
	}
}

mix( View, DomEmmiterMixin );
mix( View, ObservableMixin );
