/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ImageEngine from './imageengine.js';
import ModelRange from '../engine/model/range.js';
import MouseDownObserver from './mousedownobserver.js';

/**
 * The image feature.
 *
 * Uses {@link image.ImageEngine}.
 *
 * @memberOf image
 * @extends core.Feature
 */
export default class Image extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const viewDocument = this.editor.editing.view;

		// If mouse down is pressed create selection over whole view element.
		viewDocument.addObserver( MouseDownObserver );
		this.listenTo( viewDocument, 'mousedown', this._onMouseDown, { context: this } );
	}

	/**
	 * Handles `mousedown` event. If image widget is event's target then new selection in model is created around that
	 * element.
	 *
	 * @private
	 * @param {utils.EventInfo} eventInfo
	 * @param {envine.view.observer.DomEventData} domEventData
	 */
	_onMouseDown( eventInfo, domEventData ) {
		const target = domEventData.target;
		const viewDocument = this.editor.editing.view;

		if ( isImageWidget( target ) ) {
			domEventData.preventDefault();

			// Focus editor if is not focused already.
			if ( !viewDocument.isFocused ) {
				viewDocument.focus();
			}

			createModelSelectionOverElement( this.editor, target );
		}
	}
}

// Checks if provided {@link engine.view.Element} is instance of image widget.
//
// @private
// @param {engine.view.Element} viewElement
// @returns {Boolean}
function isImageWidget( viewElement ) {
	return viewElement.isWidget && viewElement.name == 'figure' && viewElement.hasClass( 'image' );
}

// Creates model selection over provided {@link engine.view.Element view Element} and calls
// {@link engine.model.document#engueueChanges} to set new selection in model.
//
// @private
// @param {core.editor.Editor} editor
// @param {core.view.Element} viewElement
function createModelSelectionOverElement( editor, viewElement ) {
	const document = editor.document;
	const modelElement = editor.editing.mapper.toModelElement( viewElement );
	const modelRange = ModelRange.createOn( modelElement );

	document.enqueueChanges( ( ) => {
		document.selection.setRanges( [ modelRange ] );
	} );
}
