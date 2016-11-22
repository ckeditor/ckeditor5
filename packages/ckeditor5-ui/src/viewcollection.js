/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '../utils/ckeditorerror.js';
import ObservableMixin from '../utils/observablemixin.js';
import Collection from '../utils/collection.js';
import mix from '../utils/mix.js';

/**
 * Collects {@link ui.View} instances.
 *
 * @memberOf ui
 * @extends utils.Collection
 */
export default class ViewCollection extends Collection {
	/**
	 * Creates a new {@link ui.ViewCollection} instance.
	 *
	 * @param {utils.Locale} [locale] The {@link core.editor.Editor#locale editor's locale} instance.
	 */
	constructor( locale ) {
		super( {
			// An #id Number attribute should be legal and not break the `ViewCollection` instance.
			// https://github.com/ckeditor/ckeditor5-ui/issues/93
			idProperty: 'viewUid'
		} );

		// Handle {@link ui.View#element} in DOM when a new view is added to the collection.
		this.on( 'add', ( evt, view, index ) => {
			if ( this.ready && view.element && this._parentElement ) {
				this._parentElement.insertBefore( view.element, this._parentElement.children[ index ] );
			}
		} );

		// Handle {@link ui.View#element} in DOM when a view is removed from the collection.
		this.on( 'remove', ( evt, view ) => {
			if ( this.ready && view.element && this._parentElement ) {
				view.element.remove();
			}
		} );

		/**
		 * The {@link core.editor.Editor#locale editor's locale} instance.
		 *
		 * @member {utils.Locale} ui.ViewCollection#locale
		 */
		this.locale = locale;

		/**
		 * Set to `true` once the parent's {@link ui.View#ready} is true, which means
		 * that all the views in the collection are also ready (which can be asynchronous).
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} ui.ViewCollection#ready
		 */
		this.set( 'ready', false );

		/**
		 * A parent element within which child views are rendered and managed in DOM.
		 *
		 * @protected
		 * @member {HTMLElement} ui.ViewCollection#_parentElement
		 */
		this._parentElement = null;

		/**
		 * A helper mapping between bound collection items passed to {@link ui.ViewCollection#bindTo}
		 * and view instances. Speeds up the view management.
		 *
		 * @protected
		 * @member {HTMLElement} ui.ViewCollection#_boundItemsToViewsMap
		 */
		this._boundItemsToViewsMap = new Map();
	}

	/**
	 * Initializes child views by injecting {@link ui.View#element} into DOM
	 * and calling {@link ui.View#init}.
	 *
	 * @returns {Promise} A Promise resolved when the initialization process is finished.
	 */
	init() {
		if ( this.ready ) {
			/**
			 * This ViewCollection has already been initialized.
			 *
			 * @error ui-viewcollection-init-reinit
			 */
			throw new CKEditorError( 'ui-viewcollection-init-reinit: This ViewCollection has already been initialized.' );
		}

		const promises = [];

		for ( let view of this ) {
			// Do not render unbound children. They're already in DOM by explicit declaration
			// in Template definition.
			if ( this._parentElement && view.element ) {
				this._parentElement.appendChild( view.element );
			}

			promises.push( view.init() );
		}

		return Promise.all( promises ).then( () => {
			this.ready = true;
		} );
	}

	/**
	 * Destroys the view collection along with child views.
	 *
	 * @returns {Promise} A Promise resolved when the destruction process is finished.
	 */
	destroy() {
		let promises = [];

		for ( let view of this ) {
			promises.push( view.destroy() );
		}

		return Promise.all( promises );
	}

	/**
	 * Adds a child view to the collection. If {@link ui.ViewCollection#ready}, the child view
	 * is also initialized when added.
	 *
	 * @param {ui.View} view A child view.
	 * @param {Number} [index] Index at which the child will be added to the collection.
	 * @returns {Promise} A Promise resolved when the child {@link ui.View#init} is done.
	 */
	add( view, index ) {
		super.add( view, index );

		// {@link ui.View#init} returns `Promise`.
		let promise = Promise.resolve();

		if ( this.ready && !view.ready ) {
			promise = promise.then( () => {
				return view.init();
			} );
		}

		return promise;
	}

	/**
	 * Sets {@link ui.ViewCollection#parent} of this collection.
	 *
	 * @param {HTMLElement} element A new parent.
	 */
	setParent( elementOrDocFragment ) {
		this._parentElement = elementOrDocFragment;
	}

	/**
	 * Binds this collection to {@link utils.Collection another collection}. For each item in the
	 * second collection there will be one view instance added to this collection.
	 *
	 * The process can be automatic:
	 *
	 *		// This collection stores items.
	 *		const items = new Collection( { idProperty: 'label' } );
	 *
	 *		// This view collection will become a factory out of the collection of items.
	 *		const views = new ViewCollection( locale );
	 *
	 *		// Activate the binding – since now, this view collection works like a **factory**.
	 *		// Each new item is passed to the FooView constructor like new FooView( locale, item ).
	 *		views.bindTo( items ).as( FooView );
	 *
	 *		// As new items arrive to the collection, each becomes an instance of FooView
	 *		// in the view collection.
	 *		items.add( new Model( { label: 'foo' } ) );
	 *		items.add( new Model( { label: 'bar' } ) );
	 *
	 *		console.log( views.length == 2 );
	 *
	 *		// View collection is updated as the model is removed.
	 *		items.remove( 0 );
	 *		console.log( views.length == 1 );
	 *
	 * or the factory can be driven by a custom callback:
	 *
	 *		// This collection stores any kind of data.
	 *		const data = new Collection();
	 *
	 *		// This view collection will become a custom factory for the data.
	 *		const views = new ViewCollection( locale );
	 *
	 *		// Activate the binding – the **factory** is driven by a custom callback.
	 *		views.bindTo( data ).as( item => {
	 *			if ( !item.foo ) {
	 *				return null;
	 *			} else if ( item.foo == 'bar' ) {
	 *				return new BarView();
	 *			} else {
	 *				return new DifferentView();
	 *			}
	 *		} );
	 *
	 *		// As new data arrive to the collection, each is handled individually by the callback.
	 *		// This will produce BarView.
	 *		data.add( { foo: 'bar' } );
	 *
	 *		// And this one will become DifferentView.
	 *		data.add( { foo: 'baz' } );
	 *
	 *		// Also there will be no view for data lacking the `foo` property.
	 *		data.add( {} );
	 *
	 *		console.log( controllers.length == 2 );
	 *
	 *		// View collection is also updated as the data is removed.
	 *		data.remove( 0 );
	 *		console.log( controllers.length == 1 );
	 *
	 * @param {utils.Collection} collection A collection to be bound.
	 * @returns {ui.ViewCollection.bindTo#as}
	 */
	bindTo( collection ) {
		return {
			/**
			 * Determines the output view of the binding.
			 *
			 * @method ui.ViewCollection.bindTo#as
			 * @param {Function|ui.View} CallbackOrViewClass Specifies the constructor of the view to be used or
			 * a custom callback function which produces views.
			 */
			as: ( CallbackOrViewClass ) => {
				let createView;

				if ( CallbackOrViewClass.prototype ) {
					createView = ( item ) => {
						const viewInstance = new CallbackOrViewClass( this.locale, item );

						this._boundItemsToViewsMap.set( item, viewInstance );

						return viewInstance;
					};
				} else {
					createView = ( item ) => {
						const viewInstance = CallbackOrViewClass( item );

						this._boundItemsToViewsMap.set( item, viewInstance );

						return viewInstance;
					};
				}

				// Load the initial content of the collection.
				for ( let item of collection ) {
					this.add( createView( item ) );
				}

				// Synchronize views as new items are added to the collection.
				this.listenTo( collection, 'add', ( evt, item, index ) => {
					this.add( createView( item ), index );
				} );

				// Synchronize views as items are removed from the collection.
				this.listenTo( collection, 'remove', ( evt, item ) => {
					this.remove( this._boundItemsToViewsMap.get( item ) );

					this._boundItemsToViewsMap.delete( item );
				} );
			}
		};
	}

	/**
	 * Delegates selected events coming from within the collection to desired {@link utils.Emitter}.
	 *
	 * For instance:
	 *
	 *		const viewA = new View();
	 *		const viewB = new View();
	 *		const viewC = new View();
	 *
	 *		const views = parentView.createCollection();
	 *
	 *		views.delegate( 'eventX' ).to( viewB );
	 *		views.delegate( 'eventX', 'eventY' ).to( viewC );
	 *
	 *		views.add( viewA );
	 *
	 * then `eventX` is delegated (fired by) `viewB` and `viewC` along with `customData`:
	 *
	 *		viewA.fire( 'eventX', customData );
	 *
	 * and `eventY` is delegated (fired by) `viewC` along with `customData`:
	 *
	 *		viewA.fire( 'eventY', customData );
	 *
	 * See {@link utils.EmitterMixin#delegate}.
	 *
	 * @param {...String} events {@link ui.View} event names to be delegated to another {@link utils.Emitter}.
	 * @returns {ui.ViewCollection.delegate#to}
	 */
	delegate( ...events ) {
		if ( !events.length || !isStringArray( events ) ) {
			/**
			 * All event names must be strings.
			 *
			 * @error ui-viewcollection-delegate-wrong-events
			 */
			throw new CKEditorError( 'ui-viewcollection-delegate-wrong-events: All event names must be strings.' );
		}

		return {
			/**
			 * Selects destination for {@link utils.EmitterMixin#delegate} events.
			 *
			 * @method ui.ViewCollection.delegate#to
			 * @param {utils.EmitterMixin} dest An `EmitterMixin` instance which is the destination for delegated events.
			 */
			to: ( dest ) => {
				// Activate delegating on existing views in this collection.
				for ( let view of this ) {
					for ( let evtName of events ) {
						view.delegate( evtName ).to( dest );
					}
				}

				// Activate delegating on future views in this collection.
				this.on( 'add', ( evt, view ) => {
					for ( let evtName of events ) {
						view.delegate( evtName ).to( dest );
					}
				} );

				// Deactivate delegating when view is removed from this collection.
				this.on( 'remove', ( evt, view ) => {
					for ( let evtName of events ) {
						view.stopDelegating( evtName, dest );
					}
				} );
			}
		};
	}
}

mix( Collection, ObservableMixin );

// Check if all entries of the array are of `String` type.
//
// @private
// @param {Array} arr An array to be checked.
// @returns {Boolean}
function isStringArray( arr ) {
	return arr.every( a => typeof a == 'string' );
}
