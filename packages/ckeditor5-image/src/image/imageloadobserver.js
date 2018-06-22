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
 * Observes all images added to the {@link module:engine/view/document~Document},
 * fires {@link module:engine/view/document~Document#event:imageLoaded}` event and
 * {@link module:engine/view/view~View#render renders} the View every time when new image
 * has been loaded.
 *
 * **Note:** This event is not fired for images that has been added to the document as `complete` (already loaded).
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
		this._domEmitter = Object.create( DOMEmitterMixin );
	}

	/**
	 * @inheritDoc
	 */
	observe( domRoot, name ) {
		const viewRoot = this.document.getRoot( name );

		viewRoot.on( 'change:children', ( evt, node ) => {
			this.view.once( 'render', () => {
				if ( !node.is( 'element' ) || node.is( 'attributeElement' ) ) {
					return;
				}

				const domNode = this.view.domConverter.mapViewToDom( node );

				for ( const domElement of domNode.querySelectorAll( 'img' ) ) {
					if ( !this._observedElements.has( domElement ) ) {
						this._domEmitter.listenTo( domElement, 'load', ( evt, domEvt ) => this.onDomEvent( domEvt ) );
						this._observedElements.add( domElement );
					}
				}

				// Clean up the list of observed elements from elements that has been removed from the root.
				for ( const domElement of this._observedElements ) {
					if ( !domRoot.contains( domElement ) ) {
						this._domEmitter.stopListening( domElement );
						this._observedElements.delete( domElement );
					}
				}
			} );
		} );
	}

	/**
	 * @inheritDoc
	 */
	onDomEvent( domEvent ) {
		this.view.render();
		this.fire( 'imageLoaded', domEvent );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._domEmitter.stopListening();
		super.destroy();
	}
}

/**
 * Fired when img element has been loaded in one of the editable.
 *
 * Introduced by {@link module:image/image/imageloadobserver~ImageLoadObserver}.
 *
 * @see image/image/imageloadobserver~ImageLoadObserver
 * @event module:engine/view/document~Document#event:imageLoaded
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
