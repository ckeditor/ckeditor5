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
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * The basic view class, which represents an HTML element created out of a
 * {@link module:ui/view~View#template}. Views are building blocks of the user interface and handle
 * interaction
 *
 * Views {@link module:ui/view~View#addChildren aggregate} children in
 * {@link module:ui/view~View#createCollection collections} and manage the life cycle of DOM
 * listeners e.g. by handling initialization and destruction.
 *
 * See the {@link module:ui/template~TemplateDefinition} syntax to learn more about shaping view
 * elements, attributes and listeners.
 *
 *		class SampleView extends View {
 *			constructor( locale ) {
 *				super( locale );
 *
 *				const bind = this.bindTemplate;
 *
 *				// Views define their interface (state) using observable attributes.
 *				this.set( 'elementClass', 'bar' );
 *
 *				this.template = new Template( {
 *					tag: 'p',
 *
 *					// The element of the view can be defined with its children.
 *					children: [
 *						'Hello',
 *						{
 *							tag: 'b',
 *							children: [ 'world!' ]
 *						}
 *					],
 *					attributes: {
 *						class: [
 *							'foo',
 *
 *							// Observable attributes control the state of the view in DOM.
 *							bind.to( 'elementClass' )
 *						]
 *					},
 *					on: {
 *						// Views listen to DOM events and propagate them.
 *						click: bind.to( 'clicked' )
 *					}
 *				} );
 *			}
 *		}
 *
 *		const view = new SampleView( locale );
 *
 *		// Each view must be first initialized.
 *		view.init();
 *
 *		// Append <p class="foo bar">Hello<b>world</b></p> to the <body>
 *		document.body.appendChild( view.element );
 *
 *		// Change the class attribute to <p class="foo baz">Hello<b>world</b></p>
 *		view.elementClass = 'baz';
 *
 *		// Respond to the "click" event in DOM by executing a custom action.
 *		view.on( 'clicked', () => {
 *			console.log( 'The view has been clicked!' );
 *		} );
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class View {
	/**
	 * Creates an instance of the {@link module:ui/view~View} class.
	 *
	 * Also see {@link #init}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 */
	constructor( locale ) {
		/**
		 * A set of tools to localize the user interface.
		 *
		 * Also see {@link module:core/editor/editor~Editor#locale}.
		 *
		 * @readonly
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = locale;

		/**
		 * Shorthand for {@link module:utils/locale~Locale#t}.
		 *
		 * Note: If {@link #locale} instance hasn't been passed to the view this method may not
		 * be available.
		 *
		 * @see module:utils/locale~Locale#t
		 * @method
		 */
		this.t = locale && locale.t;

		/**
		 * A flag set `true` after {@link #init initialization}. Because the process can be
		 * asynchronous, this {@link module:utils/observablemixin~Observable observable} flag allows
		 * deferring certain actions until it is finished.
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
		 * Template of this view. It provides the {@link #element} representing
		 * the view in DOM.
		 *
		 * @member {module:ui/template~Template} #template
		 */

		/**
		 * An internal, cached element of this view. See {@link #element}.
		 *
		 * @private
		 * @member {HTMLElement} #_element
		 */

		/**
		 * Cached {@link @link module:ui/template~BindChain bind chain} object created by the
		 * {@link #template}. See {@link #bindTemplate}.
		 *
		 * @private
		 * @member {Object} #_bindTemplate
		 */
	}

	/**
	 * An HTML element of this view. The element is rendered on first reference
	 * by the {@link #template}:
	 *
	 *		class SampleView extends View {
	 *			constructor() {
	 *				super();
	 *
	 *				// A template instance the #element will be created from.
	 *				this.template = new Template( {
	 *					tag: 'p'
	 *
	 *					// ...
	 *				} );
	 *			}
	 *		}
	 *
	 *		const view = new SampleView();
	 *		view.init();
	 *
	 *		// Renders the #template and appends the output to <body>.
	 *		document.body.appendChild( view.element );
	 *
	 * The element of the view can also be assigned directly:
	 *
	 *		view.element = document.querySelector( '#my-container' );
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
	 * Shorthand for {@link module:ui/template~Template.bind}, a binding
	 * {@link module:ui/template~BindChain interface} pre–configured for the view instance.
	 *
	 * It provides {@link module:ui/template~BindChain#to `to()`} and
	 * {@link module:ui/template~BindChain#if `if()`} methods that initialize bindings with
	 * observable attributes and attach DOM listeners.
	 *
	 *		class SampleView extends View {
	 *			constructor( locale ) {
	 *				super( locale );
	 *
	 *				const bind = this.bindTemplate;
	 *
	 *				// These {@link module:utils/observablemixin~Observable observable} attributes will control
	 *				// the state of the view in DOM.
	 *				this.set( {
	 *					elementClass: 'foo',
	 *				 	isEnabled: true
	 *				 } );
	 *
	 *				this.template = new Template( {
	 *					tag: 'p',
	 *
	 *					attributes: {
	 *						// The class HTML attribute will follow elementClass
	 *						// and isEnabled view attributes.
	 *						class: [
	 *							bind.to( 'elementClass' )
	 *							bind.if( 'isEnabled', 'present-when-enabled' )
	 *						]
	 *					},
	 *
	 *					on: {
	 *						// The view will fire the "clicked" event upon clicking <p> in DOM.
	 *						click: bind.to( 'clicked' )
	 *					}
	 *				} );
	 *			}
	 *		}
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
	 * Creates a new collection of views, which can be used as
	 * {@link module:ui/template~Template#children} of this view.
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
	 *		const child = new ChildView( locale );
	 *
	 *		view.init();
	 *
	 *		// It will append <p></p> to the <body>.
	 *		document.body.appendChild( view.element );
	 *
	 *		// From now on the child is nested under its parent, which is also reflected in DOM.
	 *		// <p><child#element></p>
	 *		view.items.add( child );
	 *
	 * @returns {module:ui/viewcollection~ViewCollection} A new collection of view instances.
	 */
	createCollection() {
		const collection = new ViewCollection();

		this._viewCollections.add( collection );

		return collection;
	}

	/**
	 * Registers a new child view under the view instance. Once registered, a child
	 * view is managed by its parent, including {@link #init initization}
	 * and {@link #destroy destruction}.
	 *
	 * To revert this, use {@link #removeChildren}.
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
	 *				// Register the children.
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
	 *		view.init();
	 *
	 *		// Will append <p><childA#element><b></b><childB#element></p>.
	 *		document.body.appendChild( view.element );
	 *
	 * **Note**: There's no need to add child views if they're already referenced in the
	 * {@link #template}:
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
	 *			// ...
	 *		}
	 *
	 * @param {module:ui/view~View|Iterable.<module:ui/view~View>} children Children views to be registered.
	 */
	addChildren( children ) {
		if ( !isIterable( children ) ) {
			children = [ children ];
		}

		children.map( c => this._unboundChildren.add( c ) );
	}

	/**
	 * The opposite of {@link #addChildren}. Removes a child view from this view instance.
	 * Once removed, the child is no longer managed by its parent, e.g. it can safely
	 * become a child of another parent view.
	 *
	 * @see #addChildren
	 * @param {module:ui/view~View|Iterable.<module:ui/view~View>} children Child views to be removed.
	 */
	removeChildren( children ) {
		if ( !isIterable( children ) ) {
			children = [ children ];
		}

		children.map( c => this._unboundChildren.remove( c ) );
	}

	/**
	 * Initializes the view and its children added by {@link #addChildren} and residing in collections
	 * created by the {@link #createCollection} method.
	 *
	 * In general, `init()` is the right place to keep the code which refers to the {@link #element}
	 * and should be executed at the very beginning of the view's life cycle. It is possible to
	 * {@link module:ui/template~Template.extend} the {@link #template} before the first reference of
	 * the {@link #element}. To allow an early customization of the view (e.g. by its parent),
	 * such references should be done in `init()`.
	 *
	 *		class SampleView extends View {
	 *			constructor() {
	 *				this.template = new Template( {
	 *					// ...
	 *				} );
	 *			},
	 *
	 *			init() {
	 *				super.init();
	 *
	 *				function scroll() {
	 *					// A reference to #element would render the #template and make it non-extendable.
	 *					if ( window.scrollY > 0 ) {
	 *						this.element.scrollLeft = 100;
	 *					} else {
	 *						this.element.scrollLeft = 0;
	 *					}
	 *				}
	 *
	 *				this.listenTo( window, 'scroll', () => {
	 *					scroll();
	 *				} );
	 *			}
	 *		}
	 *
	 *		const view = new SampleView();
	 *
	 *		Template.extend( view.template, {
	 *			attributes: {
	 *				class: [
	 *					'additional-class'
	 *				]
	 *			}
	 *		} );
	 *
	 *		// Late initialization allows customization of the view.
	 *		view.init();
	 *
	 * Once initialized, the view becomes {@link #ready}.
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

		// Initialize collections in #_viewCollections.
		this._viewCollections.map( c => c.init() );

		// Spread the word that this view is ready!
		this.ready = true;
	}

	/**
	 * Recursively destroys the view instance and child views added by {@link #addChildren} and
	 * residing in collections created by the {@link #createCollection}.
	 *
	 * Destruction disables all event listeners:
	 * * created on the view, e.g. `view.on( 'event', () => {} )`,
	 * * defined in the {@link #template} for DOM events.
	 */
	destroy() {
		this.stopListening();

		this._viewCollections.map( c => c.destroy() );
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

mix( View, DomEmitterMixin );
mix( View, ObservableMixin );
