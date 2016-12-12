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
import ModelSelection from '../../engine/model/selection.js';
import ModelElement from '../../engine/model/element.js';
import { isWidget } from './utils.js';
import { keyCodes } from '../../utils/keyboard.js';

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

		// Handle custom keydown behaviour.
		this.listenTo( viewDocument, 'keydown', ( ...args ) => this._onKeydown( ...args ), { priority: 'high' } );
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
		const modelElement = editor.editing.mapper.toModelElement( widgetElement );

		editor.document.enqueueChanges( ( ) => {
			this._setSelectionOverElement( modelElement );
		} );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_onKeydown( eventInfo, domEventData  ) {
		const keyCode = domEventData.keyCode;
		const isForward = keyCode == keyCodes.delete || keyCode == keyCodes.arrowdown || keyCode == keyCodes.arrowright;

		// Checks if delete/backspace or arrow keys were handled and then prevents default event behaviour and stops
		// event propagation.
		if ( ( isDeleteKeyCode( keyCode ) && this._handleDelete( isForward ) ) ||
			( isArrowKeyCode( keyCode ) && this._handleArrowKeys( isForward ) ) ) {
			domEventData.preventDefault();
			eventInfo.stop();
		}
	}

	/**
	 * Handles delete keys: backspace and delete.
	 *
	 * @private
	 * @param {Boolean} isForward Set to true if delete was performed in forward direction.
	 * @returns {Boolean|undefined} Returns `true` if keys were handled correctly.
	 */
	_handleDelete( isForward ) {
		const modelDocument = this.editor.document;
		const modelSelection = modelDocument.selection;

		// Do nothing on non-collapsed selection.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		const objectElement = this._getObjectElementNextToSelection( isForward );

		if ( objectElement ) {
			modelDocument.enqueueChanges( () => {
				// Remove previous element if empty.
				const previousNode = modelSelection.anchor.parent;

				if ( previousNode.isEmpty ) {
					const batch = modelDocument.batch();
					batch.remove( previousNode );
				}

				this._setSelectionOverElement( objectElement );
			} );

			return true;
		}
	}

	/**
	 * Handles arrow keys.
	 *
	 * @param {Boolean} isForward Set to true if arrow key should be handled in forward direction.
	 * @returns {Boolean|undefined} Returns `true` if keys were handled correctly.
	 */
	_handleArrowKeys( isForward ) {
		const modelDocument = this.editor.document;
		const schema = modelDocument.schema;
		const modelSelection = modelDocument.selection;
		const objectElement = getSelectedElement( modelSelection );

		// if object element is selected.
		if ( objectElement && schema.objects.has( objectElement.name ) ) {
			const position = isForward ? modelSelection.getLastPosition() : modelSelection.getFirstPosition();
			const newRange = modelDocument.getNearestSelectionRange( position, isForward ? 'forward' : 'backward' );

			if ( newRange ) {
				modelDocument.enqueueChanges( () => {
					modelSelection.setRanges( [ newRange ] );
				} );

				return true;
			}
		}

		// If selection is next to object element.
		// Return if not collapsed.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		const objectElement2 = this._getObjectElementNextToSelection( isForward );

		if ( objectElement2 instanceof ModelElement && modelDocument.schema.objects.has( objectElement2.name ) ) {
			modelDocument.enqueueChanges( () => {
				this._setSelectionOverElement( objectElement2 );
			} );

			return true;
		}
	}

	/**
	 * Sets {@link module:engine/model/selection~Selection document's selection} over given element.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} element
	 */
	_setSelectionOverElement( element ) {
		this.editor.document.selection.setRanges( [ ModelRange.createOn( element ) ] );
	}

	/**
	 * Checks if {@link module:engine/model/element~Element element} placed next to the current
	 * {@link module:engine/model/selection~Selection model selection} exists and is marked in
	 * {@link module:engine/model/schema~Schema schema} as `object`.
	 *
	 * @private
	 * @param {Boolean} forward Direction of checking.
	 * @returns {module:engine/model/element~Element|null}
	 */
	_getObjectElementNextToSelection( forward ) {
		const modelDocument = this.editor.document;
		const schema = modelDocument.schema;
		const modelSelection = modelDocument.selection;
		const dataController = this.editor.data;

		// Clone current selection to use it as a probe. We must leave default selection as it is so it can return
		// to its current state after undo.
		const probe = ModelSelection.createFromSelection( modelSelection );
		dataController.modifySelection( probe, { direction: forward ? 'forward' : 'backward' } );
		const objectElement = forward ? probe.focus.nodeBefore : probe.focus.nodeAfter;

		if ( objectElement instanceof ModelElement && schema.objects.has( objectElement.name ) ) {
			return objectElement;
		}

		return null;
	}
}

// Returns the selected element. {@link module:engine/model/element~Element Element} is considered as selected if there is only
// one range in the selection, and that range contains exactly one element.
// Returns `null` if there is no selected element.
//
// @param {module:engine/model/selection~Selection} modelSelection
// @returns {module:engine/model/element~Element|null}
function getSelectedElement( modelSelection ) {
	if ( modelSelection.rangeCount !== 1 ) {
		return null;
	}

	const range = modelSelection.getFirstRange();
	const nodeAfterStart = range.start.nodeAfter;
	const nodeBeforeEnd = range.end.nodeBefore;

	return ( nodeAfterStart instanceof ModelElement && nodeAfterStart == nodeBeforeEnd ) ? nodeAfterStart : null;
}

// Returns 'true' if provided key code represents one of the arrow keys.
//
// @param {Number} keyCode
// @returns {Boolean}
function isArrowKeyCode( keyCode ) {
	return keyCode == keyCodes.arrowright ||
		keyCode == keyCodes.arrowleft ||
		keyCode == keyCodes.arrowup ||
		keyCode == keyCodes.arrowdown;
}

//Returns 'true' if provided key code represents one of the delete keys: delete or backspace.
//
//@param {Number} keyCode
//@returns {Boolean}
function isDeleteKeyCode( keyCode ) {
	return keyCode == keyCodes.delete || keyCode == keyCodes.backspace;
}
