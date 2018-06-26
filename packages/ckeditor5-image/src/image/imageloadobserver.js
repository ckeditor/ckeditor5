/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/imageloadobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';
import DOMEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

/**
 * Observes all new images added to the {@link module:engine/view/document~Document},
 * fires {@link module:engine/view/document~Document#event:imageLoaded} and
 * {@link module:engine/view/document~Document#layoutChanged} event every time when the new image
 * has been loaded.
 *
 * **Note:** This event is not fired for images that has been added to the document and rendered as `complete` (already loaded).
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class ImageLoadObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		/**
		 * List of img DOM elements that are observed by this observer.
		 *
		 * @private
		 * @type {Set.<HTMLElement>}
		 */
		this._observedElements = new Set();

		/**
		 * DOM emitter used for listening images `load` event.
		 *
		 * @private
		 * @type {module:utils/dom/emittermixin~DomEmitterMixin}
		 */
		this._domObserver = Object.create( DOMEmitterMixin );
	}

	/**
	 * @inheritDoc
	 */
	observe( domRoot, name ) {
		const viewRoot = this.document.getRoot( name );

		// When there is a change in one of the view element
		// we need to check if there are any new `<img/>` elements to observe.
		viewRoot.on( 'change:children', ( evt, node ) => {
			// Wait for the render to be sure that `<img/>` elements are rendered in the DOM root.
			this.view.once( 'render', () => this._updateObservedElements( domRoot, node ) );
		} );
	}

	/**
	 * Updates the list of observed `<img/>` elements.
	 *
	 * @private
	 * @param {HTMLElement} domRoot DOM root element.
	 * @param {module:engine/view/element~Element} viewNode View element where children have changed.
	 */
	_updateObservedElements( domRoot, viewNode ) {
		if ( !viewNode.is( 'element' ) || viewNode.is( 'attributeElement' ) ) {
			return;
		}

		const domNode = this.view.domConverter.mapViewToDom( viewNode );

		// If there is no `domNode` it means that it was removed from the DOM in the meanwhile.
		if ( !domNode ) {
			return;
		}

		for ( const domElement of domNode.querySelectorAll( 'img' ) ) {
			if ( !this._observedElements.has( domElement ) ) {
				this._domObserver.listenTo( domElement, 'load', ( evt, domEvt ) => this.onDomEvent( domEvt ) );
				this._observedElements.add( domElement );
			}
		}

		// Clean up the list of observed elements from elements that has been removed from the root.
		for ( const domElement of this._observedElements ) {
			if ( !domRoot.contains( domElement ) ) {
				this._domObserver.stopListening( domElement );
				this._observedElements.delete( domElement );
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	onDomEvent( domEvent ) {
		this.document.fire( 'layoutChanged' );
		this.fire( 'imageLoaded', domEvent );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._domObserver.stopListening();
		this._observedElements.clear();
		super.destroy();
	}
}

/**
 * Fired when an <img/> DOM element has been loaded in the DOM root.
 *
 * Introduced by {@link module:image/image/imageloadobserver~ImageLoadObserver}.
 *
 * @see image/image/imageloadobserver~ImageLoadObserver
 * @event module:engine/view/document~Document#event:imageLoaded
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
