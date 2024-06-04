/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

import {
	MouseObserver,
	TreeWalker,
	type DomEventData,
	type DowncastSelectionEvent,
	type DowncastWriter,
	type Element,
	type Node,
	type ViewDocumentArrowKeyEvent,
	type ViewDocumentFragment,
	type ViewDocumentMouseDownEvent,
	type ViewElement,
	type Schema,
	type Position,
	type ViewDocumentTabEvent,
	type ViewDocumentKeyDownEvent
} from '@ckeditor/ckeditor5-engine';

import { Delete, type ViewDocumentDeleteEvent } from '@ckeditor/ckeditor5-typing';

import {
	env,
	keyCodes,
	getLocalizedArrowKeyCodeDirection,
	type EventInfo,
	type KeystrokeInfo
} from '@ckeditor/ckeditor5-utils';

import WidgetTypeAround from './widgettypearound/widgettypearound.js';
import verticalNavigationHandler from './verticalnavigation.js';
import { getLabel, isWidget, WIDGET_SELECTED_CLASS_NAME } from './utils.js';

import '../theme/widget.css';

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
 */
export default class Widget extends Plugin {
	/**
	 * Holds previously selected widgets.
	 */
	private _previouslySelected = new Set<ViewElement>();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Widget' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ WidgetTypeAround, Delete ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const t = editor.t;

		// Model to view selection converter.
		// Converts selection placed over widget element to fake selection.
		//
		// By default, the selection is downcasted by the engine to surround the attribute element, even though its only
		// child is an inline widget. A similar thing also happens when a collapsed marker is rendered as a UI element
		// next to an inline widget: the view selection contains both the widget and the marker.
		//
		// This prevents creating a correct fake selection when this inline widget is selected. Normalize the selection
		// in these cases based on the model:
		//
		//		[<attributeElement><inlineWidget /></attributeElement>] -> <attributeElement>[<inlineWidget />]</attributeElement>
		//		[<uiElement></uiElement><inlineWidget />] -> <uiElement></uiElement>[<inlineWidget />]
		//
		// Thanks to this:
		//
		// * fake selection can be set correctly,
		// * any logic depending on (View)Selection#getSelectedElement() also works OK.
		//
		// See https://github.com/ckeditor/ckeditor5/issues/9524.
		this.editor.editing.downcastDispatcher.on<DowncastSelectionEvent>( 'selection', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const modelSelection = data.selection;

			// The collapsed selection can't contain any widget.
			if ( modelSelection.isCollapsed ) {
				return;
			}

			const selectedModelElement = modelSelection.getSelectedElement();

			if ( !selectedModelElement ) {
				return;
			}

			const selectedViewElement = editor.editing.mapper.toViewElement( selectedModelElement )!;

			if ( !isWidget( selectedViewElement ) ) {
				return;
			}

			if ( !conversionApi.consumable.consume( modelSelection, 'selection' ) ) {
				return;
			}

			viewWriter.setSelection( viewWriter.createRangeOn( selectedViewElement ), {
				fake: true,
				label: getLabel( selectedViewElement )
			} );
		} );

		// Mark all widgets inside the selection with the css class.
		// This handler is registered at the 'low' priority so it's triggered after the real selection conversion.
		this.editor.editing.downcastDispatcher.on<DowncastSelectionEvent>( 'selection', ( evt, data, conversionApi ) => {
			// Remove selected class from previously selected widgets.
			this._clearPreviouslySelectedWidgets( conversionApi.writer );

			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;

			let lastMarked = null;

			for ( const range of viewSelection.getRanges() ) {
				// Note: There could be multiple selected widgets in a range but no fake selection.
				// All of them must be marked as selected, for instance [<widget></widget><widget></widget>]
				for ( const value of range ) {
					const node = value.item as ViewElement;
					// Do not mark nested widgets in selected one. See: #4594
					if ( isWidget( node ) && !isChild( node, lastMarked ) ) {
						viewWriter.addClass( WIDGET_SELECTED_CLASS_NAME, node );
						this._previouslySelected.add( node );
						lastMarked = node;
					}
				}
			}
		}, { priority: 'low' } );

		// If mouse down is pressed on widget - create selection over whole widget.
		view.addObserver( MouseObserver );
		this.listenTo<ViewDocumentMouseDownEvent>( viewDocument, 'mousedown', ( ...args ) => this._onMousedown( ...args ) );

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
		this.listenTo<ViewDocumentArrowKeyEvent>( viewDocument, 'arrowKey', ( ...args ) => {
			this._handleSelectionChangeOnArrowKeyPress( ...args );
		}, { context: [ isWidget, '$text' ] } );

		this.listenTo<ViewDocumentArrowKeyEvent>( viewDocument, 'arrowKey', ( ...args ) => {
			this._preventDefaultOnArrowKeyPress( ...args );
		}, { context: '$root' } );

		this.listenTo<ViewDocumentArrowKeyEvent>(
			viewDocument,
			'arrowKey',
			verticalNavigationHandler( this.editor.editing ),
			{ context: '$text' }
		);

		// Handle custom delete behaviour.
		this.listenTo<ViewDocumentDeleteEvent>( viewDocument, 'delete', ( evt, data ) => {
			if ( this._handleDelete( data.direction == 'forward' ) ) {
				data.preventDefault();
				evt.stop();
			}
		}, { context: '$root' } );

		// Handle Tab key while a widget is selected.
		this.listenTo<ViewDocumentTabEvent>( viewDocument, 'tab', ( evt, data ) => {
			// This event could be triggered from inside the widget, but we are interested
			// only when the widget is selected itself.
			if ( evt.eventPhase != 'atTarget' ) {
				return;
			}

			if ( data.shiftKey ) {
				return;
			}

			if ( this._selectFirstNestedEditable() ) {
				data.preventDefault();
				evt.stop();
			}
		}, { context: isWidget, priority: 'low' } );

		// Handle Shift+Tab key while caret inside a widget editable.
		this.listenTo<ViewDocumentTabEvent>( viewDocument, 'tab', ( evt, data ) => {
			if ( !data.shiftKey ) {
				return;
			}

			if ( this._selectAncestorWidget() ) {
				data.preventDefault();
				evt.stop();
			}
		}, { priority: 'low' } );

		// Handle Esc key while inside a nested editable.
		this.listenTo<ViewDocumentKeyDownEvent>( viewDocument, 'keydown', ( evt, data ) => {
			if ( data.keystroke != keyCodes.esc ) {
				return;
			}

			if ( this._selectAncestorWidget() ) {
				data.preventDefault();
				evt.stop();
			}
		}, { priority: 'low' } );

		// Add the information about the keystrokes to the accessibility database.
		editor.accessibility.addKeystrokeInfoGroup( {
			id: 'widget',
			label: t( 'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)' ),
			keystrokes: [
				{
					label: t( 'Move focus from an editable area back to the parent widget' ),
					keystroke: 'Esc'
				},
				{
					label: t( 'Insert a new paragraph directly after a widget' ),
					keystroke: 'Enter'
				},
				{
					label: t( 'Insert a new paragraph directly before a widget' ),
					keystroke: 'Shift+Enter'
				},
				{
					label: t( 'Move the caret to allow typing directly before a widget' ),
					keystroke: [ [ 'arrowup' ], [ 'arrowleft' ] ]
				},
				{
					label: t( 'Move the caret to allow typing directly after a widget' ),
					keystroke: [ [ 'arrowdown' ], [ 'arrowright' ] ]
				}
			]
		} );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:mousedown mousedown} events on widget elements.
	 */
	private _onMousedown( eventInfo: EventInfo, domEventData: DomEventData<MouseEvent> ) {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		let element: ViewElement | null = domEventData.target;

		// If triple click should select entire paragraph.
		if ( domEventData.domEvent.detail >= 3 ) {
			if ( this._selectBlockContent( element ) ) {
				domEventData.preventDefault();
			}

			return;
		}

		// Do nothing for single or double click inside nested editable.
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

		// On Android selection would jump to the first table cell, on other devices
		// we can't block it (and don't need to) because of drag and drop support.
		if ( env.isAndroid ) {
			domEventData.preventDefault();
		}

		// Focus editor if is not focused already.
		if ( !viewDocument.isFocused ) {
			view.focus();
		}

		// Create model selection over widget.
		const modelElement = editor.editing.mapper.toModelElement( element );

		this._setSelectionOverElement( modelElement! );
	}

	/**
	 * Selects entire block content, e.g. on triple click it selects entire paragraph.
	 */
	private _selectBlockContent( element: ViewElement ): boolean {
		const editor = this.editor;
		const model = editor.model;
		const mapper = editor.editing.mapper;
		const schema = model.schema;

		const viewElement = mapper.findMappedViewAncestor( this.editor.editing.view.createPositionAt( element, 0 ) );
		const modelElement = findTextBlockAncestor( mapper.toModelElement( viewElement )!, model.schema );

		if ( !modelElement ) {
			return false;
		}

		model.change( writer => {
			const nextTextBlock = !schema.isLimit( modelElement ) ?
				findNextTextBlock( writer.createPositionAfter( modelElement ), schema ) :
				null;

			const start = writer.createPositionAt( modelElement, 0 );
			const end = nextTextBlock ?
				writer.createPositionAt( nextTextBlock, 0 ) :
				writer.createPositionAt( modelElement, 'end' );

			writer.setSelection( writer.createRange( start, end ) );
		} );

		return true;
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events and changes
	 * the model selection when:
	 *
	 * * arrow key is pressed when the widget is selected,
	 * * the selection is next to a widget and the widget should become selected upon the arrow key press.
	 *
	 * See {@link #_preventDefaultOnArrowKeyPress}.
	 */
	private _handleSelectionChangeOnArrowKeyPress( eventInfo: EventInfo, domEventData: DomEventData & KeystrokeInfo ) {
		const keyCode = domEventData.keyCode;

		const model = this.editor.model;
		const schema = model.schema;
		const modelSelection = model.document.selection;
		const objectElement = modelSelection.getSelectedElement();
		const direction = getLocalizedArrowKeyCodeDirection( keyCode, this.editor.locale.contentLanguageDirection );
		const isForward = direction == 'down' || direction == 'right';
		const isVerticalNavigation = direction == 'up' || direction == 'down';

		// If object element is selected.
		if ( objectElement && schema.isObject( objectElement ) ) {
			const position = isForward ? modelSelection.getLastPosition() : modelSelection.getFirstPosition();
			const newRange = schema.getNearestSelectionRange( position!, isForward ? 'forward' : 'backward' );

			if ( newRange ) {
				model.change( writer => {
					writer.setSelection( newRange );
				} );

				domEventData.preventDefault();
				eventInfo.stop();
			}

			return;
		}

		// Handle collapsing of the selection when there is any widget on the edge of selection.
		// This is needed because browsers have problems with collapsing such selection.
		if ( !modelSelection.isCollapsed && !domEventData.shiftKey ) {
			const firstPosition = modelSelection.getFirstPosition();
			const lastPosition = modelSelection.getLastPosition();

			const firstSelectedNode = firstPosition!.nodeAfter;
			const lastSelectedNode = lastPosition!.nodeBefore;

			if ( firstSelectedNode && schema.isObject( firstSelectedNode ) || lastSelectedNode && schema.isObject( lastSelectedNode ) ) {
				model.change( writer => {
					writer.setSelection( isForward ? lastPosition : firstPosition );
				} );

				domEventData.preventDefault();
				eventInfo.stop();
			}

			return;
		}

		// Return if not collapsed.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		// If selection is next to object element.

		const objectElementNextToSelection = this._getObjectElementNextToSelection( isForward );

		if ( objectElementNextToSelection && schema.isObject( objectElementNextToSelection ) ) {
			// Do not select an inline widget while handling up/down arrow.
			if ( schema.isInline( objectElementNextToSelection ) && isVerticalNavigation ) {
				return;
			}

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
	 */
	private _preventDefaultOnArrowKeyPress( eventInfo: EventInfo, domEventData: DomEventData ) {
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
	 * @param isForward Set to true if delete was performed in forward direction.
	 * @returns Returns `true` if keys were handled correctly.
	 */
	private _handleDelete( isForward: boolean ) {
		const modelDocument = this.editor.model.document;
		const modelSelection = modelDocument.selection;

		// Do nothing when the read only mode is enabled.
		if ( !this.editor.model.canEditAt( modelSelection ) ) {
			return;
		}

		// Do nothing on non-collapsed selection.
		if ( !modelSelection.isCollapsed ) {
			return;
		}

		const objectElement = this._getObjectElementNextToSelection( isForward );

		if ( objectElement ) {
			this.editor.model.change( writer => {
				let previousNode = modelSelection.anchor!.parent;

				// Remove previous element if empty.
				while ( previousNode.isEmpty ) {
					const nodeToRemove = previousNode;
					previousNode = nodeToRemove.parent!;

					writer.remove( nodeToRemove as Element );
				}

				this._setSelectionOverElement( objectElement );
			} );

			return true;
		}
	}

	/**
	 * Sets {@link module:engine/model/selection~Selection document's selection} over given element.
	 *
	 * @internal
	 */
	public _setSelectionOverElement( element: Node ): void {
		this.editor.model.change( writer => {
			writer.setSelection( writer.createRangeOn( element ) );
		} );
	}

	/**
	 * Checks if {@link module:engine/model/element~Element element} placed next to the current
	 * {@link module:engine/model/selection~Selection model selection} exists and is marked in
	 * {@link module:engine/model/schema~Schema schema} as `object`.
	 *
	 * @internal
	 * @param forward Direction of checking.
	 */
	public _getObjectElementNextToSelection( forward: boolean ): Element | null {
		const model = this.editor.model;
		const schema = model.schema;
		const modelSelection = model.document.selection;

		// Clone current selection to use it as a probe. We must leave default selection as it is so it can return
		// to its current state after undo.
		const probe = model.createSelection( modelSelection );
		model.modifySelection( probe, { direction: forward ? 'forward' : 'backward' } );

		// The selection didn't change so there is nothing there.
		if ( probe.isEqual( modelSelection ) ) {
			return null;
		}

		const objectElement = forward ? probe.focus!.nodeBefore : probe.focus!.nodeAfter;

		if ( !!objectElement && schema.isObject( objectElement ) ) {
			return objectElement as Element;
		}

		return null;
	}

	/**
	 * Removes CSS class from previously selected widgets.
	 */
	private _clearPreviouslySelectedWidgets( writer: DowncastWriter ) {
		for ( const widget of this._previouslySelected ) {
			writer.removeClass( WIDGET_SELECTED_CLASS_NAME, widget );
		}

		this._previouslySelected.clear();
	}

	/**
	 * Moves the document selection into the first nested editable.
	 */
	private _selectFirstNestedEditable(): boolean {
		const editor = this.editor;
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		for ( const item of viewDocument.selection.getFirstRange()!.getItems() ) {
			if ( item.is( 'editableElement' ) ) {
				const modelElement = editor.editing.mapper.toModelElement( item );

				/* istanbul ignore next -- @preserve */
				if ( !modelElement ) {
					continue;
				}

				const position = editor.model.createPositionAt( modelElement, 0 );
				const newRange = editor.model.schema.getNearestSelectionRange( position, 'forward' );

				editor.model.change( writer => {
					writer.setSelection( newRange );
				} );

				return true;
			}
		}

		return false;
	}

	/**
	 * Updates the document selection so that it selects first ancestor widget.
	 */
	private _selectAncestorWidget(): boolean {
		const editor = this.editor;
		const mapper = editor.editing.mapper;
		const selection = editor.editing.view.document.selection;

		const positionParent = selection.getFirstPosition()!.parent;

		const positionParentElement = positionParent.is( '$text' ) ?
			positionParent.parent as ViewElement :
			positionParent as ViewElement;

		const viewElement = positionParentElement.findAncestor( isWidget );

		if ( !viewElement ) {
			return false;
		}

		const modelElement = mapper.toModelElement( viewElement );

		/* istanbul ignore next -- @preserve */
		if ( !modelElement ) {
			return false;
		}

		editor.model.change( writer => {
			writer.setSelection( modelElement, 'on' );
		} );

		return true;
	}
}

/**
 * Returns `true` when element is a nested editable or is placed inside one.
 */
function isInsideNestedEditable( element: ViewElement ) {
	let currentElement: ViewElement | ViewDocumentFragment | null = element;

	while ( currentElement ) {
		if ( currentElement.is( 'editableElement' ) && !currentElement.is( 'rootElement' ) ) {
			return true;
		}

		// Click on nested widget should select it.
		if ( isWidget( currentElement ) ) {
			return false;
		}

		currentElement = currentElement.parent;
	}

	return false;
}

/**
 * Checks whether the specified `element` is a child of the `parent` element.
 *
 * @param element An element to check.
 * @param parent A parent for the element.
 */
function isChild( element: ViewElement, parent: ViewElement | null ) {
	if ( !parent ) {
		return false;
	}

	return Array.from( element.getAncestors() ).includes( parent );
}

/**
 * Returns nearest text block ancestor.
 */
function findTextBlockAncestor( modelElement: Element, schema: Schema ): Element | null {
	for ( const element of modelElement.getAncestors( { includeSelf: true, parentFirst: true } ) ) {
		if ( schema.checkChild( element as Element, '$text' ) ) {
			return element as Element;
		}

		// Do not go beyond nested editable.
		if ( schema.isLimit( element ) && !schema.isObject( element ) ) {
			break;
		}
	}

	return null;
}

/**
 * Returns next text block where could put selection.
 */
function findNextTextBlock( position: Position, schema: Schema ): Element | null {
	const treeWalker = new TreeWalker( { startPosition: position } );

	for ( const { item } of treeWalker ) {
		if ( schema.isLimit( item ) || !item.is( 'element' ) ) {
			return null;
		}

		if ( schema.checkChild( item, '$text' ) ) {
			return item;
		}
	}

	return null;
}
