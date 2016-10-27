/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '../utils/ckeditorerror.js';
import ViewCollection from './viewcollection.js';
import Template from './template.js';
import DOMEmitterMixin from './domemittermixin.js';
import ObservableMixin from '../utils/observablemixin.js';
import Collection from '../utils/collection.js';
import mix from '../utils/mix.js';

/**
 * Basic View class.
 *
 * @memberOf ui
 * @mixes DOMEmitterMixin
 * @mixes ObservableMixin
 */
export default class View {
	/**
	 * Creates an instance of the {@link ui.View} class.
	 *
	 * TODO: A simple example how to create one.
	 *
	 * @param {utils.Locale} [locale] The {@link core.editor.Editor#locale editor's locale} instance.
	 */
	constructor( locale ) {
		/**
		 * A set of tools to localize the user interface. See {@link core.editor.Editor#locale}.
		 *
		 * @readonly
		 * @member {utils.Locale} ui.View#locale
		 */
		this.locale = locale;

		/**
		 * Shorthand for {@link utils.Locale#t}.
		 *
		 * Note: If locale instance hasn't been 	passed to the view this method may not be available.
		 *
		 * @see utils.Locale#t
		 * @method ui.View#t
		 */
		this.t = locale && locale.t;

		/**
		 * Set `true` after {@link ui.View#init}, which can be asynchronous.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} ui.View#ready
		 */
		this.set( 'ready', false );

		/**
		 * Collections registered with {@link ui.View#createCollection}.
		 *
		 * @protected
		 * @member {Set.<ui.ViewCollection>} ui.view#_viewCollections
		 */
		this._viewCollections = new Collection();

		// Let the new collection determine the {@link ui.View#ready} state of this view and,
		// accordingly, initialize (or not) children views as they are added in the future.
		this._viewCollections.on( 'add', ( evt, collection ) => {
			collection.bind( 'ready' ).to( this );
		} );

		// Once the collection is removed from the view, the {@link ui.View#ready} binding
		// should be removed.
		this._viewCollections.on( 'remove', ( evt, collection ) => {
			collection.unbind( 'ready' );
		} );

		/**
		 * A collection of view instances, which have been added directly
		 * into the {@link ui.View.template#children}.
		 *
		 * @protected
		 * @member {ui.ViewCollection} ui.view#_unboundChildren
		 */
		this._unboundChildren = this.createCollection();

		/**
		 * Template of this view.
		 *
		 * @member {ui.Template} ui.View#template
		 */

		/**
		 * Element of this view.
		 *
		 * @private
		 * @member {HTMLElement} ui.View.#_element
		 */

		/**
		 * Cached {@link ui.Template} binder object specific for this instance.
		 * See {@link ui.View#bindTemplate}.
		 *
		 * @private
		 * @member {Object} ui.View.#_bindTemplate
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

	/**
	 * @type {HTMLElement}
	 */
	set element( el ) {
		this._element = el;
	}

	/**
	 * Shorthand for {@link ui.Template#bind}, bound to {@link ui.View} on the first access.
	 *
	 * Cached {@link ui.Template#bind} object is stored in {@link ui.View.#_bindTemplate}.
	 *
	 * @method ui.View#bindTemplate
	 */
	get bindTemplate() {
		if ( this._bindTemplate ) {
			return this._bindTemplate;
		}

		return ( this._bindTemplate = Template.bind( this, this ) );
	}

	/**
	 * Creates a new collection of views, which can be used in this view instance
	 * i.e. as a member of {@link ui.TemplateDefinition#children}.
	 *
	 * TODO: An example how to use created collection in a template definition.
	 *
	 * @returns {ui.ViewCollection} A new collection of view instances.
	 */
	createCollection() {
		const collection = new ViewCollection();

		this._viewCollections.add( collection );

		return collection;
	}

	/**
	 * Registers a new child view under this view instance. Once registered, a child
	 * view is managed by its parent, including initialization ({@link ui.view#init})
	 * and destruction ({@link ui.view#destroy}).
	 *
	 * @param {...ui.View} children Children views to be registered.
	 */
	addChild( ...children ) {
		for ( let child of children ) {
			this._unboundChildren.add( child );
		}
	}

	/**
	 * Initializes the view and child views located in {@link ui.View#_viewCollections}.
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
			// Initialize child views in #_viewCollections.
			.then( () => {
				const promises = [];

				for ( let collection of this._viewCollections ) {
					for ( let view of collection ) {
						promises.push( view.init() );
					}
				}

				return Promise.all( promises );
			} )
			// Spread the word that this view is ready!
			.then( () => {
				this.ready = true;
			} );
	}

	/**
	 * Destroys the view instance and child views located in {@link ui.View#_viewCollections}.
	 *
	 * @returns {Promise} A Promise resolved when the destruction process is finished.
	 */
	destroy() {
		this.stopListening();

		let promises = [];

		for ( let collection of this._viewCollections ) {
			for ( let view of collection ) {
				promises.push( view.destroy() );
			}
		}

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

mix( View, DOMEmitterMixin );
mix( View, ObservableMixin );
