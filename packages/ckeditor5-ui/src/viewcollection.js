/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/viewcollection
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Collects {@link module:ui/view~View} instances.
 *
 * @extends module:utils/collection~Collection
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class ViewCollection extends Collection {
	/**
	 * Creates a new {@link module:ui/viewcollection~ViewCollection} instance.
	 *
	 * @param {module:utils/locale~Locale} [locale] The {@link module:core/editor~Editor editor's locale} instance.
	 */
	constructor( locale ) {
		super( {
			// An #id Number attribute should be legal and not break the `ViewCollection` instance.
			// https://github.com/ckeditor/ckeditor5-ui/issues/93
			idProperty: 'viewUid'
		} );

		// Handle {@link module:ui/view~View#element} in DOM when a new view is added to the collection.
		this.on( 'add', ( evt, view, index ) => {
			if ( view.element && this._parentElement ) {
				this._parentElement.insertBefore( view.element, this._parentElement.children[ index ] );
			}
		} );

		// Handle {@link module:ui/view~View#element} in DOM when a view is removed from the collection.
		this.on( 'remove', ( evt, view ) => {
			if ( view.element && this._parentElement ) {
				view.element.remove();
			}
		} );

		/**
		 * The {@link module:core/editor/editor~Editor editor's locale} instance.
		 *
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = locale;

		/**
		 * Set to `true` once the parent's {@link module:ui/view~View#ready} is true, which means
		 * that all the views in the collection are also ready (which can be asynchronous).
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #ready
		 */
		this.set( 'ready', false );

		/**
		 * A parent element within which child views are rendered and managed in DOM.
		 *
		 * @protected
		 * @member {HTMLElement}
		 */
		this._parentElement = null;
	}

	/**
	 * Initializes child views by injecting {@link module:ui/view~View#element} into DOM
	 * and calling {@link module:ui/view~View#init}.
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

		this.map( v => v.init() );

		this.ready = true;
	}

	/**
	 * Destroys the view collection along with child views.
	 */
	destroy() {
		this.map( v => v.destroy() );
	}

	/**
	 * Adds a child view to the collection. If {@link module:ui/viewcollection~ViewCollection#ready}, the child view
	 * is also initialized when added.
	 *
	 * @param {module:ui/view~View} view A child view.
	 * @param {Number} [index] Index at which the child will be added to the collection.
	 */
	add( view, index ) {
		super.add( view, index );

		if ( this.ready && !view.ready ) {
			view.init();
		}
	}

	/**
	 * Sets {@link #_parentElement} of this collection.
	 *
	 * @param {HTMLElement} element A new parent.
	 */
	setParent( elementOrDocFragment ) {
		this._parentElement = elementOrDocFragment;
	}

	/**
	 * Delegates selected events coming from within the collection to desired {@link module:utils/emittermixin~EmitterMixin}.
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
	 * See {@link module:utils/emittermixin~EmitterMixin#delegate}.
	 *
	 * @param {...String} events {@link module:ui/view~View} event names to be delegated to another
	 * {@link module:utils/emittermixin~EmitterMixin}.
	 * @returns {module:ui/viewcollection~ViewCollection#delegate.to}
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
			 * Selects destination for {@link module:utils/emittermixin~EmitterMixin#delegate} events.
			 *
			 * @memberOf module:ui/viewcollection~ViewCollection#delegate
			 * @function module:ui/viewcollection~ViewCollection#delegate.to
			 * @param {module:utils/emittermixin~EmitterMixin} dest An `EmitterMixin` instance which is
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
