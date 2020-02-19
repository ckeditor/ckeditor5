/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/viewcollection
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

/**
 * Collects {@link module:ui/view~View} instances.
 *
 *		const parentView = new ParentView( locale );
 *		const collection = new ViewCollection( locale );
 *
 *		collection.setParent( parentView.element );
 *
 *		const viewA = new ChildView( locale );
 *		const viewB = new ChildView( locale );
 *
 * View collection renders and manages view {@link module:ui/view~View#element elements}:
 *
 *		collection.add( viewA );
 *		collection.add( viewB );
 *
 *		console.log( parentView.element.firsChild ); // -> viewA.element
 *		console.log( parentView.element.lastChild ); // -> viewB.element
 *
 * It {@link module:ui/viewcollection~ViewCollection#delegate propagates} DOM events too:
 *
 *		// Delegate #click and #keydown events from viewA and viewB to the parentView.
 *		collection.delegate( 'click' ).to( parentView );
 *
 *		parentView.on( 'click', ( evt ) => {
 *			console.log( `${ evt.source } has been clicked.` );
 *		} );
 *
 *		// This event will be delegated to the parentView.
 *		viewB.fire( 'click' );
 *
 * **Note**: A view collection can be used directly in the {@link module:ui/template~TemplateDefinition definition}
 * of a {@link module:ui/template~Template template}.
 *
 * @extends module:utils/collection~Collection
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class ViewCollection extends Collection {
	/**
	 * Creates a new instance of the {@link module:ui/viewcollection~ViewCollection}.
	 *
	 * @param {Array.<module:ui/view~View>} [initialItems] The initial items of the collection.
	 */
	constructor( itemsOrLocale = [] ) {
		const locale = itemsOrLocale instanceof Locale ? itemsOrLocale : new Locale();
		const items = itemsOrLocale instanceof Locale ? [] : itemsOrLocale;

		super( items, {
			// An #id Number attribute should be legal and not break the `ViewCollection` instance.
			// https://github.com/ckeditor/ckeditor5-ui/issues/93
			idProperty: 'viewUid'
		} );

		// Handle {@link module:ui/view~View#element} in DOM when a new view is added to the collection.
		this.on( 'add', ( evt, view, index ) => {
			this._renderViewIntoCollectionParent( view, index );
		} );

		// Handle {@link module:ui/view~View#element} in DOM when a view is removed from the collection.
		this.on( 'remove', ( evt, view ) => {
			if ( view.element && this._parentElement ) {
				view.element.remove();
			}
		} );

		/**
		 * The {@link module:core/editor/editor~Editor#locale editor's locale} instance.
		 * See the view {@link module:ui/view~View#locale locale} property.
		 *
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = locale;

		/**
		 * A parent element within which child views are rendered and managed in DOM.
		 *
		 * @protected
		 * @member {HTMLElement}
		 */
		this._parentElement = null;
	}

	/**
	 * Destroys the view collection along with child views.
	 * See the view {@link module:ui/view~View#destroy} method.
	 */
	destroy() {
		this.map( view => view.destroy() );
	}

	/**
	 * Sets the parent HTML element of this collection. When parent is set, {@link #add adding} and
	 * {@link #remove removing} views in the collection synchronizes their
	 * {@link module:ui/view~View#element elements} in the parent element.
	 *
	 * @param {HTMLElement} element A new parent element.
	 */
	setParent( elementOrDocFragment ) {
		this._parentElement = elementOrDocFragment;

		// Take care of the initial collection items passed to the constructor.
		for ( const view of this ) {
			this._renderViewIntoCollectionParent( view );
		}
	}

	/**
	 * Delegates selected events coming from within views in the collection to any
	 * {@link module:utils/emittermixin~Emitter}.
	 *
	 * For the following views and collection:
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
	 * the `eventX` is delegated (fired by) `viewB` and `viewC` along with `customData`:
	 *
	 *		viewA.fire( 'eventX', customData );
	 *
	 * and `eventY` is delegated (fired by) `viewC` along with `customData`:
	 *
	 *		viewA.fire( 'eventY', customData );
	 *
	 * See {@link module:utils/emittermixin~Emitter#delegate}.
	 *
	 * @param {...String} events {@link module:ui/view~View} event names to be delegated to another
	 * {@link module:utils/emittermixin~Emitter}.
	 * @returns {Object}
	 * @returns {Function} return.to A function which accepts the destination of
	 * {@link module:utils/emittermixin~Emitter#delegate delegated} events.
	 */
	delegate( ...events ) {
		if ( !events.length || !isStringArray( events ) ) {
			/**
			 * All event names must be strings.
			 *
			 * @error ui-viewcollection-delegate-wrong-events
			 */
			throw new CKEditorError(
				'ui-viewcollection-delegate-wrong-events: All event names must be strings.',
				this
			);
		}

		return {
			/**
			 * Selects destination for {@link module:utils/emittermixin~Emitter#delegate} events.
			 *
			 * @memberOf module:ui/viewcollection~ViewCollection#delegate
			 * @function module:ui/viewcollection~ViewCollection#delegate.to
			 * @param {module:utils/emittermixin~Emitter} dest An `Emitter` instance which is
			 * the destination for delegated events.
			 */
			to: dest => {
				// Activate delegating on existing views in this collection.
				for ( const view of this ) {
					for ( const evtName of events ) {
						view.delegate( evtName ).to( dest );
					}
				}

				// Activate delegating on future views in this collection.
				this.on( 'add', ( evt, view ) => {
					for ( const evtName of events ) {
						view.delegate( evtName ).to( dest );
					}
				} );

				// Deactivate delegating when view is removed from this collection.
				this.on( 'remove', ( evt, view ) => {
					for ( const evtName of events ) {
						view.stopDelegating( evtName, dest );
					}
				} );
			}
		};
	}

	/**
	 * This method {@link module:ui/view~View#render renders} a new view added to the collection.
	 *
	 * If the {@link #_parentElement parent element} of the collection is set, this method also adds
	 * the view's {@link module:ui/view~View#element} as a child of the parent in DOM at a specified index.
	 *
	 * **Note**: If index is not specified, the view's element is pushed as the last child
	 * of the parent element.
	 *
	 * @private
	 * @param {module:ui/view~View} view A new view added to the collection.
	 * @param {Number} [index] An index the view holds in the collection. When not specified,
	 * the view is added at the end.
	 */
	_renderViewIntoCollectionParent( view, index ) {
		if ( !view.isRendered ) {
			view.render();
		}

		if ( view.element && this._parentElement ) {
			this._parentElement.insertBefore( view.element, this._parentElement.children[ index ] );
		}
	}

	/**
	 * Removes a child view from the collection. If the {@link #setParent parent element} of the
	 * collection has been set, the {@link module:ui/view~View#element element} of the view is also removed
	 * in DOM, reflecting the order of the collection.
	 *
	 * See the {@link #add} method.
	 *
	 * @method #remove
	 * @param {module:ui/view~View|Number|String} subject The view to remove, its id or index in the collection.
	 * @returns {Object} The removed view.
	 */
}

// Check if all entries of the array are of `String` type.
//
// @private
// @param {Array} arr An array to be checked.
// @returns {Boolean}
function isStringArray( arr ) {
	return arr.every( a => typeof a == 'string' );
}
