/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/view
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ViewCollection from './viewcollection';
import Template from './template';
import DomEmmiterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import log from '@ckeditor/ckeditor5-utils/src/log';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

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
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class View {
	/**
	 * Creates an instance of the {@link module:ui/view~View} class.
	 *
	 * @param {module:utils/locale~Locale} [locale] The {@link module:core/editor/editor~Editor editor's locale} instance.
	 */
	constructor( locale ) {
		/**
		 * A set of tools to localize the user interface. See {@link module:core/editor/editor~Editor}.
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

		/**
		 * Specifies whether the instance was destroyed using {@link #destroy} method
		 * in the past.
		 *
		 * @private
		 * @readonly
		 * @member {Boolean}
		 */
		this._wasDestroyed = false;

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

		this._addTemplateChildren();

		return ( this._element = this.template.render() );
	}

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
	 *				this.template = new Template( { tag: 'p' } );
	 *
	 *				// Register children.
	 *				this.addChildren( [ this.childA, this.childB ] );
	 *			}
	 *
	 *			init() {
	 *				this.element.appendChild( this.childA.element );
	 *				this.element.appendChild( this.childB.element );
	 *
	 *				return super.init();
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
	 * **Note**: There's no need to add child views if they're used in the
	 * {@link #template} explicitly:
	 *
	 *		class SampleView extends View {
	 *			constructor( locale ) {
	 *				super( locale );
	 *
	 *				this.childA = new SomeChildView( locale );
	 *				this.childB = new SomeChildView( locale );
	 *
	 *				this.template = new Template( {
	 *					tag: 'p',
	 *
 	 *					// These children will be added automatically. There's no
 	 *					// need to call {@link #addChildren} for any of them.
	 *					children: [ this.childA, this.childB ]
	 *				} );
	 *			}
	 *
	 *			...
	 *		}
	 *
	 * @param {module:ui/view~View|Iterable.<module:ui/view~View>} children Children views to be registered.
	 * @returns {Promise}
	 */
	addChildren( children ) {
		if ( !isIterable( children ) ) {
			children = [ children ];
		}

		return Promise.all( children.map( c => this._unboundChildren.add( c ) ) );
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
		/**
		 * The view has already been destroyed. If you see this warning, it means that some piece
		 * of code attempted to destroy it again, which usually may (but not must) be a symptom of
		 * a broken destruction logic in a code that uses this view instance.
		 *
		 * @error ui-view-destroy-again
		 */
		if ( this._wasDestroyed ) {
			log.warn( 'ui-view-destroy-again: The view has already been destroyed.', { view: this } );
		}

		this.stopListening();

		return Promise.all( this._viewCollections.map( c => c.destroy() ) )
			.then( () => {
				this._wasDestroyed = true;
			} );
	}

	/**
	 * Recursively traverses {@link #template} in search of {@link module:ui/view~View}
	 * instances and automatically registers them using {@link #addChildren} method.
	 *
	 * @protected
	 */
	_addTemplateChildren() {
		const search = def => {
			if ( def.children ) {
				for ( const defOrView of def.children ) {
					if ( defOrView instanceof View ) {
						this.addChildren( defOrView );
					} else {
						search( defOrView );
					}
				}
			}
		};

		search( this.template );
	}
}

mix( View, DomEmmiterMixin );
mix( View, ObservableMixin );
