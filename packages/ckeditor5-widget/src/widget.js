/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module widget/widget
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import RootEditableElement from '@ckeditor/ckeditor5-engine/src/view/rooteditableelement';
import { isWidget, WIDGET_SELECTED_CLASS_NAME, getLabel } from './utils';
import { keyCodes, getCode, parseKeystroke } from '@ckeditor/ckeditor5-utils/src/keyboard';

import '../theme/theme.scss';

const selectAllKeystrokeCode = parseKeystroke( 'Ctrl+A' );

/**
 * The widget plugin.
 * Registers model to view selection converter for editing pipeline. It is hooked after default selection conversion.
 * If converted selection is placed around widget element, selection is marked as fake. Additionally, proper CSS class
 * is added to indicate that widget has been selected.
 * Adds default {@link module:engine/view/document~Document#event:mousedown mousedown} handling on widget elements.
 *
 * @extends module:core/plugin~Plugin.
 */
export default class Widget extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Widget';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const viewDocument = this.editor.editing.view;

		/**
		 * Holds previously selected widgets.
		 *
		 * @private
		 * @type {Set.<module:engine/view/element~Element>}
		 */
		this._previouslySelected = new Set();

		// Model to view selection converter.
		// Converts selection placed over widget element to fake selection
		this.editor.editing.modelToView.on( 'selection', ( evt, data, consumable, conversionApi ) => {
			// Remove selected class from previously selected widgets.
			this._clearPreviouslySelectedWidgets();

			const viewSelection = conversionApi.viewSelection;
			const selectedElement = viewSelection.getSelectedElement();

			for ( const range of viewSelection.getRanges() ) {
				for ( const value of range ) {
					const node = value.item;

					if ( node.is( 'element' ) && isWidget( node ) ) {
						node.addClass( WIDGET_SELECTED_CLASS_NAME );
						this._previouslySelected.add( node );

						// Check if widget is a single element selected.
						if ( node == selectedElement ) {
							viewSelection.setFake( true, { label: getLabel( selectedElement ) } );
						}
					}
				}
			}
		}, { priority: 'low' } );

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
		const editor = this.editor;
		const viewDocument = editor.editing.view;
		let element = domEventData.target;

		// Do nothing if inside nested editable.
		if ( isInsideNestedEditable( element ) ) {
			return;
		}

		// If target is not a widget element - check if one of the ancestors is.
		if ( !isWidget( element ) ) {
			element = element.findAncestor( isWidget );

			if ( !element ) {
				return;
			}
		}

		domEventData.preventDefault();

		// Focus editor if is not focused already.
		if ( !viewDocument.isFocused ) {
			viewDocument.focus();
		}

		// Create model selection over widget.
		const modelElement = editor.editing.mapper.toModelElement( element );

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
	_onKeydown( eventInfo, domEventData ) {
		const keyCode = domEventData.keyCode;
		const isForward = keyCode == keyCodes.delete || keyCode == keyCodes.arrowdown || keyCode == keyCodes.arrowright;
		let wasHandled = false;

		// Checks if the keys were handled and then prevents the default event behaviour and stops
		// the propagation.
		if ( isDeleteKeyCode( keyCode ) ) {
			wasHandled = this._handleDelete( isForward );
		} else if ( isArrowKeyCode( keyCode ) ) {
			wasHandled = this._handleArrowKeys( isForward );
		} else if ( isSelectAllKeyCode( domEventData ) ) {
			wasHandled = this._selectAllNestedEditableContent() || this._selectAllContent();
		}

		if ( wasHandled ) {
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
		// Do nothing when the read only mode is enabled.
		if ( this.editor.isReadOnly ) {
			return;
		}

		const modelDocument = this.editor.document;
		const modelSelection = modelDocument.selection;

		// Do nothing on non-collapsed selection.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		const objectElement = this._getObjectElementNextToSelection( isForward );

		if ( objectElement ) {
			modelDocument.enqueueChanges( () => {
				const batch = modelDocument.batch();
				let previousNode = modelSelection.anchor.parent;

				// Remove previous element if empty.
				while ( previousNode.isEmpty ) {
					const nodeToRemove = previousNode;
					previousNode = nodeToRemove.parent;

					batch.remove( nodeToRemove );
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
		const objectElement = modelSelection.getSelectedElement();

		// if object element is selected.
		if ( objectElement && schema.objects.has( objectElement.name ) ) {
			const position = isForward ? modelSelection.getLastPosition() : modelSelection.getFirstPosition();
			const newRange = modelDocument.getNearestSelectionRange( position, isForward ? 'forward' : 'backward' );

			if ( newRange ) {
				modelDocument.enqueueChanges( () => {
					modelSelection.setRanges( [ newRange ] );
				} );
			}

			return true;
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
	 * Extends the {@link module:engine/model/selection~Selection document's selection} to span the entire
	 * content of the nested editable if already anchored in one.
	 *
	 * See: {@link module:engine/model/schema~Schema#getLimitElement}.
	 *
	 * @private
	 */
	_selectAllNestedEditableContent() {
		const modelDocument = this.editor.document;
		const modelSelection = modelDocument.selection;
		const schema = modelDocument.schema;
		const limitElement = schema.getLimitElement( modelSelection );

		if ( modelSelection.getFirstRange().root == limitElement ) {
			return false;
		}

		modelDocument.enqueueChanges( () => {
			modelSelection.setIn( limitElement );
		} );

		return true;
	}

	/**
	 * Handles <kbd>CTRL + A</kbd> when widget is selected.
	 *
	 * @private
	 * @returns {Boolean} Returns true if widget was selected and selecting all was handled by this method.
	 */
	_selectAllContent() {
		const modelDocument = this.editor.document;
		const modelSelection = modelDocument.selection;
		const editing = this.editor.editing;
		const viewDocument = editing.view;
		const viewSelection = viewDocument.selection;

		const selectedElement = viewSelection.getSelectedElement();

		// Only widget is selected.
		// https://github.com/ckeditor/ckeditor5-widget/issues/23
		if ( selectedElement && isWidget( selectedElement ) ) {
			const widgetParent = editing.mapper.toModelElement( selectedElement.parent );

			modelDocument.enqueueChanges( () => {
				modelSelection.setRanges( [ ModelRange.createIn( widgetParent ) ] );
			} );

			return true;
		}

		return false;
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

	/**
	 * Removes CSS class from previously selected widgets.
	 * @private
	 */
	_clearPreviouslySelectedWidgets() {
		for ( const widget of this._previouslySelected ) {
			widget.removeClass( WIDGET_SELECTED_CLASS_NAME );
		}

		this._previouslySelected.clear();
	}
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

// Returns 'true' if provided key code represents one of the delete keys: delete or backspace.
//
// @param {Number} keyCode
// @returns {Boolean}
function isDeleteKeyCode( keyCode ) {
	return keyCode == keyCodes.delete || keyCode == keyCodes.backspace;
}

// Returns 'true' if provided (DOM) key event data corresponds with the Ctrl+A keystroke.
//
// @param {module:engine/view/observer/keyobserver~KeyEventData} domEventData
// @returns {Boolean}
function isSelectAllKeyCode( domEventData ) {
	return getCode( domEventData ) == selectAllKeystrokeCode;
}

// Returns `true` when element is a nested editable or is placed inside one.
//
// @param {module:engine/view/element~Element}
// @returns {Boolean}
function isInsideNestedEditable( element ) {
	while ( element ) {
		if ( element instanceof ViewEditableElement && !( element instanceof RootEditableElement ) ) {
			return true;
		}

		element = element.parent;
	}

	return false;
}
