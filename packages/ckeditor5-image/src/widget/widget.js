/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from '../../core/plugin.js';
import WidgetEngine from './widgetengine.js';
import MouseObserver from '../../engine/view/observer/mouseobserver.js';
import ModelRange from '../../engine/model/range.js';
import ModelSelection from '../../engine/model/selection.js';
import ModelElement from '../../engine/model/element.js';
import { isWidget } from './utils.js';
import { keyCodes } from '../../utils/keyboard.js';

/**
 * The widget plugin.
 * Adds default {@link engine.view.Document#mousedown mousedown} handling on widget elements.
 *
 * @memberOf image.widget
 * @extends core.Plugin.
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

		// Handle custom keydown behaviour.
		this.listenTo( viewDocument, 'keydown', ( ...args ) => this._onKeydown( ...args ), { priority: 'high' } );
	}

	/**
	 * Handles {@link engine.view.Document#mousedown mousedown} events on widget elements.
	 *
	 * @private
	 * @param {utils.EventInfo} eventInfo
	 * @param {envine.view.observer.DomEventData} domEventData
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
		const modelElement = editor.editing.mapper.toModelElement( widgetElement );

		editor.document.enqueueChanges( ( ) => {
			this._setSelectionOverElement( modelElement );
		} );
	}

	/**
	 * Handles {@link engine.view.Document#keydown keydown} events.
	 *
	 * @private
	 * @param {utils.EventInfo} eventInfo
	 * @param {envine.view.observer.DomEventData} domEventData
	 */
	_onKeydown( eventInfo, domEventData  ) {
		const keyCode = domEventData.keyCode;

		// Handle only delete and backspace.
		if ( keyCode !== keyCodes.delete && keyCode !== keyCodes.backspace ) {
			return;
		}

		const dataController = this.editor.data;
		const modelDocument = this.editor.document;
		const modelSelection = modelDocument.selection;

		// Do nothing on non-collapsed selection.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		// Clone current selection to use it as a probe. We must leave default selection as it is so it can return
		// to its current state after undo.
		const probe = ModelSelection.createFromSelection( modelSelection );
		const isForward = ( keyCode == keyCodes.delete );

		dataController.modifySelection( probe, { direction: isForward ? 'forward' : 'backward' } );

		const objectElement = isForward ? probe.focus.nodeBefore : probe.focus.nodeAfter;

		if ( objectElement instanceof ModelElement && modelDocument.schema.objects.has( objectElement.name ) ) {
			domEventData.preventDefault();
			eventInfo.stop();

			modelDocument.enqueueChanges( () => {
				// Remove previous element if empty.
				const previousNode = probe.anchor.parent;

				if ( previousNode.isEmpty ) {
					const batch = modelDocument.batch();
					batch.remove( previousNode );
				}

				this._setSelectionOverElement( objectElement );
			} );
		}
	}

	/**
	 * Sets {@link engine.model.Selection document's selection} over given element.
	 *
	 * @private
	 * @param {engine.model.Element} element
	 */
	_setSelectionOverElement( element ) {
		this.editor.document.selection.setRanges( [ ModelRange.createOn( element ) ] );
	}
}
