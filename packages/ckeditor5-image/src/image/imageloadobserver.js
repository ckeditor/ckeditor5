/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageloadobserver
 */

import { Observer } from 'ckeditor5/src/engine';

/**
 * Observes all new images added to the {@link module:engine/view/document~Document},
 * fires {@link module:engine/view/document~Document#event:imageLoaded} and
 * {@link module:engine/view/document~Document#event:layoutChanged} event every time when the new image
 * has been loaded.
 *
 * **Note:** This event is not fired for images that has been added to the document and rendered as `complete` (already loaded).
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class ImageLoadObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	observe( domRoot ) {
		this.listenTo( domRoot, 'load', ( event, domEvent ) => {
			const domElement = domEvent.target;

			if ( this.checkShouldIgnoreEventFromTarget( domElement ) ) {
				return;
			}

			if ( domElement.tagName == 'IMG' ) {
				this._fireEvents( domEvent );
			}
			// Use capture phase for better performance (#4504).
		}, { useCapture: true } );
	}

	/**
	 * Fires {@link module:engine/view/document~Document#event:layoutChanged} and
	 * {@link module:engine/view/document~Document#event:imageLoaded}
	 * if observer {@link #isEnabled is enabled}.
	 *
	 * @protected
	 * @param {Event} domEvent The DOM event.
	 */
	_fireEvents( domEvent ) {
		if ( this.isEnabled ) {
			this.document.fire( 'layoutChanged' );
			this.document.fire( 'imageLoaded', domEvent );
		}
	}
}

/**
 * Fired when an <img/> DOM element has been loaded in the DOM root.
 *
 * Introduced by {@link module:image/image/imageloadobserver~ImageLoadObserver}.
 *
 * @see module:image/image/imageloadobserver~ImageLoadObserver
 * @event module:engine/view/document~Document#event:imageLoaded
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
