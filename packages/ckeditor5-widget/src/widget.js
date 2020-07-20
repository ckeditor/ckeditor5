/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver';
import WidgetTypeAround from './widgettypearound/widgettypearound';
import { getLabel, isWidget, WIDGET_SELECTED_CLASS_NAME } from './utils';
import {
	isArrowKeyCode,
	isForwardArrowKeyCode
} from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';

import '../theme/widget.css';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';
import verticalNavigationHandler from './verticalnavigation';

/**
 * The widget plugin. It enables base support for widgets.
 *
 * See {@glink api/widget package page} for more details and documentation.
 *
 * This plugin enables multiple behaviors required by widgets:
 *
 * * The model to view selection converter for the editing pipeline (it handles widget custom selection rendering).
 * If a converted selection wraps around a widget element, that selection is marked as
 * {@link module:engine/view/selection~Selection#isFake fake}. Additionally, the `ck-widget_selected` CSS class
 * is added to indicate that widget has been selected.
 * * The mouse and keyboard events handling on and around widget elements.
 *
 * @extends module:core/plugin~Plugin
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
	static get requires() {
		return [ WidgetTypeAround ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		/**
		 * Holds previously selected widgets.
		 *
		 * @private
		 * @type {Set.<module:engine/view/element~Element>}
		 */
		this._previouslySelected = new Set();

		// Model to view selection converter.
		// Converts selection placed over widget element to fake selection
		this.editor.editing.downcastDispatcher.on( 'selection', ( evt, data, conversionApi ) => {
			// Remove selected class from previously selected widgets.
			this._clearPreviouslySelectedWidgets( conversionApi.writer );

			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;
			const selectedElement = viewSelection.getSelectedElement();
			let lastMarked = null;

			for ( const range of viewSelection.getRanges() ) {
				for ( const value of range ) {
					const node = value.item;

					// Do not mark nested widgets in selected one. See: #57.
					if ( isWidget( node ) && !isChild( node, lastMarked ) ) {
						viewWriter.addClass( WIDGET_SELECTED_CLASS_NAME, node );

						this._previouslySelected.add( node );
						lastMarked = node;

						// Check if widget is a single element selected.
						if ( node == selectedElement ) {
							viewWriter.setSelection( viewSelection.getRanges(), { fake: true, label: getLabel( selectedElement ) } );
						}
					}
				}
			}
		}, { priority: 'low' } );

		// If mouse down is pressed on widget - create selection over whole widget.
		view.addObserver( MouseObserver );
		this.listenTo( viewDocument, 'mousedown', ( ...args ) => this._onMousedown( ...args ) );

		// There are two keydown listeners working on different priorities. This allows other
		// features such as WidgetTypeAround or TableKeyboard to attach their listeners in between
		// and customize the behavior even further in different content/selection scenarios.
		//
		// * The first listener handles changing the selection on arrow key press
		// if the widget is selected or if the selection is next to a widget and the widget
		// should become selected upon the arrow key press.
		//
		// * The second (late) listener makes sure the default browser action on arrow key press is
		// prevented when a widget is selected. This prevents the selection from being moved
		// from a fake selection container.
		this.listenTo( viewDocument, 'keydown', ( ...args ) => {
			this._handleSelectionChangeOnArrowKeyPress( ...args );
		}, { priority: 'high' } );

		this.listenTo( viewDocument, 'keydown', ( ...args ) => {
			this._preventDefaultOnArrowKeyPress( ...args );
		}, { priority: priorities.get( 'high' ) - 20 } );

		this.listenTo( viewDocument, 'keydown', verticalNavigationHandler( this.editor.editing ) );

		// Handle custom delete behaviour.
		this.listenTo( viewDocument, 'delete', ( evt, data ) => {
			if ( this._handleDelete( data.direction == 'forward' ) ) {
				data.preventDefault();
				evt.stop();
			}
		}, { priority: 'high' } );
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
		const view = editor.editing.view;
		const viewDocument = view.document;
		let element = domEventData.target;

		// Do nothing for single or double click inside nested editable.
		if ( isInsideNestedEditable( element ) ) {
			// But at least triple click inside nested editable causes broken selection in Safari.
			// For such event, we select the entire nested editable element.
			// See: https://github.com/ckeditor/ckeditor5/issues/1463.
			if ( env.isSafari && domEventData.domEvent.detail >= 3 ) {
				const mapper = editor.editing.mapper;
				const modelElement = mapper.toModelElement( element );

				this.editor.model.change( writer => {
					domEventData.preventDefault();
					writer.setSelection( modelElement, 'in' );
				} );
			}

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
			view.focus();
		}

		// Create model selection over widget.
		const modelElement = editor.editing.mapper.toModelElement( element );

		this._setSelectionOverElement( modelElement );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events and changes
	 * the model selection when:
	 *
	 * * arrow key is pressed when the widget is selected,
	 * * the selection is next to a widget and the widget should become selected upon the arrow key press.
	 *
	 * See {@link #_preventDefaultOnArrowKeyPress}.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_handleSelectionChangeOnArrowKeyPress( eventInfo, domEventData ) {
		const keyCode = domEventData.keyCode;

		// Checks if the keys were handled and then prevents the default event behaviour and stops
		// the propagation.
		if ( !isArrowKeyCode( keyCode ) ) {
			return;
		}

		const model = this.editor.model;
		const schema = model.schema;
		const modelSelection = model.document.selection;
		const objectElement = modelSelection.getSelectedElement();
		const isForward = isForwardArrowKeyCode( keyCode, this.editor.locale.contentLanguageDirection );

		// If object element is selected.
		if ( objectElement && schema.isObject( objectElement ) ) {
			const position = isForward ? modelSelection.getLastPosition() : modelSelection.getFirstPosition();
			const newRange = schema.getNearestSelectionRange( position, isForward ? 'forward' : 'backward' );

			if ( newRange ) {
				model.change( writer => {
					writer.setSelection( newRange );
				} );

				domEventData.preventDefault();
				eventInfo.stop();
			}

			return;
		}

		// If selection is next to object element.
		// Return if not collapsed.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		const objectElementNextToSelection = this._getObjectElementNextToSelection( isForward );

		if ( objectElementNextToSelection && schema.isObject( objectElementNextToSelection ) ) {
			this._setSelectionOverElement( objectElementNextToSelection );

			domEventData.preventDefault();
			eventInfo.stop();
		}
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events and prevents
	 * the default browser behavior to make sure the fake selection is not being moved from a fake selection
	 * container.
	 *
	 * See {@link #_handleSelectionChangeOnArrowKeyPress}.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_preventDefaultOnArrowKeyPress( eventInfo, domEventData ) {
		const keyCode = domEventData.keyCode;

		// Checks if the keys were handled and then prevents the default event behaviour and stops
		// the propagation.
		if ( !isArrowKeyCode( keyCode ) ) {
			return;
		}

		const model = this.editor.model;
		const schema = model.schema;
		const objectElement = model.document.selection.getSelectedElement();

		// If object element is selected.
		if ( objectElement && schema.isObject( objectElement ) ) {
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

		const modelDocument = this.editor.model.document;
		const modelSelection = modelDocument.selection;

		// Do nothing on non-collapsed selection.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		const objectElement = this._getObjectElementNextToSelection( isForward );

		if ( objectElement ) {
			this.editor.model.change( writer => {
				let previousNode = modelSelection.anchor.parent;

				// Remove previous element if empty.
				while ( previousNode.isEmpty ) {
					const nodeToRemove = previousNode;
					previousNode = nodeToRemove.parent;

					writer.remove( nodeToRemove );
				}

				this._setSelectionOverElement( objectElement );
			} );

			return true;
		}
	}

	/**
	 * Sets {@link module:engine/model/selection~Selection document's selection} over given element.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} element
	 */
	_setSelectionOverElement( element ) {
		this.editor.model.change( writer => {
			writer.setSelection( writer.createRangeOn( element ) );
		} );
	}

	/**
	 * Checks if {@link module:engine/model/element~Element element} placed next to the current
	 * {@link module:engine/model/selection~Selection model selection} exists and is marked in
	 * {@link module:engine/model/schema~Schema schema} as `object`.
	 *
	 * @protected
	 * @param {Boolean} forward Direction of checking.
	 * @returns {module:engine/model/element~Element|null}
	 */
	_getObjectElementNextToSelection( forward ) {
		const model = this.editor.model;
		const schema = model.schema;
		const modelSelection = model.document.selection;

		// Clone current selection to use it as a probe. We must leave default selection as it is so it can return
		// to its current state after undo.
		const probe = model.createSelection( modelSelection );
		model.modifySelection( probe, { direction: forward ? 'forward' : 'backward' } );
		const objectElement = forward ? probe.focus.nodeBefore : probe.focus.nodeAfter;

		if ( !!objectElement && schema.isObject( objectElement ) ) {
			return objectElement;
		}

		return null;
	}

	/**
	 * Removes CSS class from previously selected widgets.
	 *
	 * @private
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 */
	_clearPreviouslySelectedWidgets( writer ) {
		for ( const widget of this._previouslySelected ) {
			writer.removeClass( WIDGET_SELECTED_CLASS_NAME, widget );
		}

		this._previouslySelected.clear();
	}
}

// Returns `true` when element is a nested editable or is placed inside one.
//
// @param {module:engine/view/element~Element}
// @returns {Boolean}
function isInsideNestedEditable( element ) {
	while ( element ) {
		if ( element.is( 'editableElement' ) && !element.is( 'rootElement' ) ) {
			return true;
		}

		// Click on nested widget should select it.
		if ( isWidget( element ) ) {
			return false;
		}

		element = element.parent;
	}

	return false;
}

// Checks whether the specified `element` is a child of the `parent` element.
//
// @param {module:engine/view/element~Element} element An element to check.
// @param {module:engine/view/element~Element|null} parent A parent for the element.
// @returns {Boolean}
function isChild( element, parent ) {
	if ( !parent ) {
		return false;
	}

	return Array.from( element.getAncestors() ).includes( parent );
}
