/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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

import '../theme/globals/globals.css';

/**
 * The basic view class, which represents an HTML element created out of a
 * {@link module:ui/view~View#template}. Views are building blocks of the user interface and handle
 * interaction
 *
 * Views {@link module:ui/view~View#registerChild aggregate} children in
 * {@link module:ui/view~View#createCollection collections} and manage the life cycle of DOM
 * listeners e.g. by handling rendering and destruction.
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
 *				this.setTemplate( {
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
 *		view.render();
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
	 * Also see {@link #render}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 */
	constructor( locale ) {
		/**
		 * An HTML element of the view. `null` until {@link #render rendered}
		 * from the {@link #template}.
		 *
		 *		class SampleView extends View {
		 *			constructor() {
		 *				super();
		 *
		 *				// A template instance the #element will be created from.
		 *				this.setTemplate( {
		 *					tag: 'p'
		 *
		 *					// ...
		 *				} );
		 *			}
		 *		}
		 *
		 *		const view = new SampleView();
		 *
		 *		// Renders the #template.
		 *		view.render();
		 *
		 *		// Append the HTML element of the view to <body>.
		 *		document.body.appendChild( view.element );
		 *
		 * **Note**: The element of the view can also be assigned directly:
		 *
		 *		view.element = document.querySelector( '#my-container' );
		 *
		 * @member {HTMLElement}
		 */
		this.element = null;

		/**
		 * Set `true` when the view has already been {@link module:ui/view~View#render rendered}.
		 *
		 * @readonly
		 * @member {Boolean} #isRendered
		 */
		this.isRendered = false;

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
		 * the view in DOM, which is {@link #render rendered}.
		 *
		 * @member {module:ui/template~Template} #template
		 */

		/**
		 * Cached {@link module:ui/template~BindChain bind chain} object created by the
		 * {@link #template}. See {@link #bindTemplate}.
		 *
		 * @private
		 * @member {Object} #_bindTemplate
		 */

		this.decorate( 'render' );
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
	 *				this.setTemplate( {
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
	 *				this.setTemplate( {
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
	 *		view.render();
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
	 * view is managed by its parent, including {@link #render rendering}
	 * and {@link #destroy destruction}.
	 *
	 * To revert this, use {@link #deregisterChild}.
	 *
	 *		class SampleView extends View {
	 *			constructor( locale ) {
	 *				super( locale );
	 *
	 *				this.childA = new SomeChildView( locale );
	 *				this.childB = new SomeChildView( locale );
	 *
	 *				this.setTemplate( { tag: 'p' } );
	 *
	 *				// Register the children.
	 *				this.registerChild( [ this.childA, this.childB ] );
	 *			}
	 *
	 *			render() {
	 *				super.render();
	 *
	 *				this.element.appendChild( this.childA.element );
	 *				this.element.appendChild( this.childB.element );
	 *			}
	 *		}
	 *
	 *		const view = new SampleView( locale );
	 *
	 *		view.render();
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
	 *				this.setTemplate( {
	 *					tag: 'p',
	 *
 	 *					// These children will be added automatically. There's no
 	 *					// need to call {@link #registerChild} for any of them.
	 *					children: [ this.childA, this.childB ]
	 *				} );
	 *			}
	 *
	 *			// ...
	 *		}
	 *
	 * @param {module:ui/view~View|Iterable.<module:ui/view~View>} children Children views to be registered.
	 */
	registerChild( children ) {
		if ( !isIterable( children ) ) {
			children = [ children ];
		}

		for ( const child of children ) {
			this._unboundChildren.add( child );
		}
	}

	/**
	 * The opposite of {@link #registerChild}. Removes a child view from this view instance.
	 * Once removed, the child is no longer managed by its parent, e.g. it can safely
	 * become a child of another parent view.
	 *
	 * @see #registerChild
	 * @param {module:ui/view~View|Iterable.<module:ui/view~View>} children Child views to be removed.
	 */
	deregisterChild( children ) {
		if ( !isIterable( children ) ) {
			children = [ children ];
		}

		for ( const child of children ) {
			this._unboundChildren.remove( child );
		}
	}

	/**
	 * Sets the {@link #template} of the view with with given definition.
	 *
	 * A shorthand for:
	 *
	 *		view.setTemplate( definition );
	 *
	 * @param {module:ui/template~TemplateDefinition} definition Definition of view's template.
	 */
	setTemplate( definition ) {
		this.template = new Template( definition );
	}

	/**
	 * {@link module:ui/template~Template.extend Extends} the {@link #template} of the view with
	 * with given definition.
	 *
	 * A shorthand for:
	 *
	 *		Template.extend( view.template, definition );
	 *
	 * **Note**: Is requires the {@link #template} to be already set. See {@link #setTemplate}.
	 *
	 * @param {module:ui/template~TemplateDefinition} definition Definition which
	 * extends the {@link #template}.
	 */
	extendTemplate( definition ) {
		Template.extend( this.template, definition );
	}

	/**
	 * Recursively renders the view.
	 *
	 * Once the view is rendered:
	 * * the {@link #element} becomes an HTML element out of {@link #template},
	 * * the {@link #isRendered} flag is set `true`.
	 *
	 * **Note**: The children of the view:
	 * * defined directly in the {@link #template}
	 * * residing in collections created by the {@link #createCollection} method,
	 * * and added by {@link #registerChild}
	 * are also rendered in the process.
	 *
	 * In general, `render()` method is the right place to keep the code which refers to the
	 * {@link #element} and should be executed at the very beginning of the view's life cycle.
	 *
	 * It is possible to {@link module:ui/template~Template.extend} the {@link #template} before
	 * the view is rendered. To allow an early customization of the view (e.g. by its parent),
	 * such references should be done in `render()`.
	 *
	 *		class SampleView extends View {
	 *			constructor() {
	 *				this.setTemplate( {
	 *					// ...
	 *				} );
	 *			},
	 *
	 *			render() {
	 *				// View#element becomes available.
	 *				super.render();
	 *
	 *				// The "scroll" listener depends on #element.
	 *				this.listenTo( window, 'scroll', () => {
	 *					// A reference to #element would render the #template and make it non-extendable.
	 *					if ( window.scrollY > 0 ) {
	 *						this.element.scrollLeft = 100;
	 *					} else {
	 *						this.element.scrollLeft = 0;
	 *					}
	 *				} );
	 *			}
	 *		}
	 *
	 *		const view = new SampleView();
	 *
	 *		// Let's customize the view before it gets rendered.
	 *		view.extendTemplate( {
	 *			attributes: {
	 *				class: [
	 *					'additional-class'
	 *				]
	 *			}
	 *		} );
	 *
	 *		// Late rendering allows customization of the view.
	 *		view.render();
	 */
	render() {
		if ( this.isRendered ) {
			/**
			 * This View has already been rendered.
			 *
			 * @error ui-view-render-rendered
			 */
			throw new CKEditorError( 'ui-view-render-already-rendered: This View has already been rendered.' );
		}

		// Render #element of the view.
		if ( this.template ) {
			this.element = this.template.render();

			// Auto–register view children from #template.
			this.registerChild( this.template.getViews() );
		}

		this.isRendered = true;
	}

	/**
	 * Recursively destroys the view instance and child views added by {@link #registerChild} and
	 * residing in collections created by the {@link #createCollection}.
	 *
	 * Destruction disables all event listeners:
	 * * created on the view, e.g. `view.on( 'event', () => {} )`,
	 * * defined in the {@link #template} for DOM events.
	 */
	destroy() {
		this.stopListening();

		this._viewCollections.map( c => c.destroy() );

		// Template isn't obligatory for views.
		if ( this.template && this.template._revertData ) {
			this.template.revert( this.element );
		}
	}

	/**
	 * Event fired by the {@link #render} method. Actual rendering is executed as a listener to
	 * this event with the default priority.
	 *
	 * See {@link module:utils/observablemixin~ObservableMixin#decorate} for more information and samples.
	 *
	 * @event render
	 */
}

mix( View, DomEmitterMixin );
mix( View, ObservableMixin );
