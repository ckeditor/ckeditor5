/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ImageEngine from './imageengine.js';
import ModelRange from '../engine/model/range.js';
import MouseObserver from '../engine/view/observer/mouseobserver.js';
import { isImageWidget } from './utils.js';

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
		viewDocument.addObserver( MouseObserver );
		this.listenTo( viewDocument, 'mousedown', ( ...args ) => this._onMousedown( ...args ) );
	}

	/**
	 * Handles `mousedown` event.
	 *
	 * @private
	 * @param {utils.EventInfo} eventInfo
	 * @param {envine.view.observer.DomEventData} domEventData
	 */
	_onMousedown( eventInfo, domEventData ) {
		let widgetElement = domEventData.target;
		const viewDocument = this.editor.editing.view;

		// If target is not a widgetElement - check if one of the parents is.
		if ( !isImageWidget( widgetElement ) ) {
			widgetElement = widgetElement.findAncestor( element => isImageWidget( element ) );

			if ( !widgetElement ) {
				return;
			}
		}

		domEventData.preventDefault();

		// Focus editor if is not focused already.
		if ( !viewDocument.isFocused ) {
			viewDocument.focus();
		}

		createModelSelectionOverElement( this.editor, widgetElement );
	}
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
