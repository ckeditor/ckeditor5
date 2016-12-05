/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/widget/widget
 */

import Plugin from '../../core/plugin.js';
import WidgetEngine from './widgetengine.js';
import MouseObserver from '../../engine/view/observer/mouseobserver.js';
import ModelRange from '../../engine/model/range.js';
import { isWidget } from './utils.js';

/**
 * The widget plugin.
 * Adds default {@link module:engine/view/document~Document#event:mousedown mousedown} handling on widget elements.
 *
 * @extends module:core/plugin~Plugin.
 */
export default class Widget extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const viewDocument = this.editor.editing.view;

		// If mouse down is pressed on widget - create selection over whole widget.
		viewDocument.addObserver( MouseObserver );
		this.listenTo( viewDocument, 'mousedown', ( ...args ) => this._onMousedown( ...args ) );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:mousedown mousedown} events on widget elements.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_onMousedown( eventInfo, domEventData ) {
		let widgetElement = domEventData.target;
		const editor = this.editor;
		const viewDocument = editor.editing.view;

		// If target is not a widget element - check if one of the ancestors is.
		if ( !isWidget( widgetElement ) ) {
			widgetElement = widgetElement.findAncestor( element => isWidget( element ) );

			if ( !widgetElement ) {
				return;
			}
		}

		domEventData.preventDefault();

		// Focus editor if is not focused already.
		if ( !viewDocument.isFocused ) {
			viewDocument.focus();
		}

		// Create model selection over widget.
		const modelDocument = editor.document;
		const modelElement = editor.editing.mapper.toModelElement( widgetElement );
		const modelRange = ModelRange.createOn( modelElement );

		modelDocument.enqueueChanges( ( ) => {
			modelDocument.selection.setRanges( [ modelRange ] );
		} );
	}
}
