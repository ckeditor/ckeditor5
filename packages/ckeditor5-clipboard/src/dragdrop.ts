/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard/dragdrop
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

import {
	LiveRange,
	MouseObserver,
	type DataTransfer,
	type Element,
	type Model,
	type Range,
	type Position,
	type ViewDocumentMouseDownEvent,
	type ViewDocumentMouseUpEvent,
	type ViewElement,
	type DomEventData
} from '@ckeditor/ckeditor5-engine';

import {
	Widget,
	isWidget,
	type WidgetToolbarRepository
} from '@ckeditor/ckeditor5-widget';

import {
	env,
	uid,
	global,
	createElement,
	DomEmitterMixin,
	delay,
	Rect,
	type DelayedFunc,
	type ObservableChangeEvent,
	type DomEmitter
} from '@ckeditor/ckeditor5-utils';

import ClipboardPipeline, {
	type ClipboardContentInsertionEvent
} from './clipboardpipeline.js';

import ClipboardObserver, {
	type ViewDocumentDragEndEvent,
	type ViewDocumentDragEnterEvent,
	type ViewDocumentDraggingEvent,
	type ViewDocumentDragLeaveEvent,
	type ViewDocumentDragStartEvent,
	type ViewDocumentClipboardInputEvent
} from './clipboardobserver.js';

import DragDropTarget from './dragdroptarget.js';
import DragDropBlockToolbar from './dragdropblocktoolbar.js';

import '../theme/clipboard.css';

// Drag and drop events overview:
//
//                ┌──────────────────┐
//                │     mousedown    │   Sets the draggable attribute.
//                └─────────┬────────┘
//                          │
//                          └─────────────────────┐
//                          │                     │
//                          │           ┌─────────V────────┐
//                          │           │      mouseup     │   Dragging did not start, removes the draggable attribute.
//                          │           └──────────────────┘
//                          │
//                ┌─────────V────────┐   Retrieves the selected model.DocumentFragment
//                │     dragstart    │   and converts it to view.DocumentFragment.
//                └─────────┬────────┘
//                          │
//                ┌─────────V────────┐   Processes view.DocumentFragment to text/html and text/plain
//                │  clipboardOutput │   and stores the results in data.dataTransfer.
//                └─────────┬────────┘
//                          │
//                          │   DOM dragover
//                          ┌────────────┐
//                          │            │
//                ┌─────────V────────┐   │
//                │     dragging     │   │   Updates the drop target marker.
//                └─────────┬────────┘   │
//                          │            │
//            ┌─────────────└────────────┘
//            │             │            │
//            │   ┌─────────V────────┐   │
//            │   │     dragleave    │   │   Removes the drop target marker.
//            │   └─────────┬────────┘   │
//            │             │            │
//        ┌───│─────────────┘            │
//        │   │             │            │
//        │   │   ┌─────────V────────┐   │
//        │   │   │     dragenter    │   │   Focuses the editor view.
//        │   │   └─────────┬────────┘   │
//        │   │             │            │
//        │   │             └────────────┘
//        │   │
//        │   └─────────────┐
//        │   │             │
//        │   │   ┌─────────V────────┐
//        └───┐   │       drop       │   (The default handler of the clipboard pipeline).
//            │   └─────────┬────────┘
//            │             │
//            │   ┌─────────V────────┐   Resolves the final data.targetRanges.
//            │   │  clipboardInput  │   Aborts if dropping on dragged content.
//            │   └─────────┬────────┘
//            │             │
//            │   ┌─────────V────────┐
//            │   │  clipboardInput  │   (The default handler of the clipboard pipeline).
//            │   └─────────┬────────┘
//            │             │
//            │ ┌───────────V───────────┐
//            │ │  inputTransformation  │   (The default handler of the clipboard pipeline).
//            │ └───────────┬───────────┘
//            │             │
//            │  ┌──────────V──────────┐
//            │  │   contentInsertion  │   Updates the document selection to drop range.
//            │  └──────────┬──────────┘
//            │             │
//            │  ┌──────────V──────────┐
//            │  │   contentInsertion  │   (The default handler of the clipboard pipeline).
//            │  └──────────┬──────────┘
//            │             │
//            │  ┌──────────V──────────┐
//            │  │   contentInsertion  │   Removes the content from the original range if the insertion was successful.
//            │  └──────────┬──────────┘
//            │             │
//            └─────────────┐
//                          │
//                ┌─────────V────────┐
//                │      dragend     │   Removes the drop marker and cleans the state.
//                └──────────────────┘
//

/**
 * The drag and drop feature. It works on top of the {@link module:clipboard/clipboardpipeline~ClipboardPipeline}.
 *
 * Read more about the clipboard integration in the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
 *
 * @internal
 */
export default class DragDrop extends Plugin {
	/**
	 * The live range over the original content that is being dragged.
	 */
	private _draggedRange!: LiveRange | null;

	/**
	 * The UID of current dragging that is used to verify if the drop started in the same editor as the drag start.
	 *
	 * **Note**: This is a workaround for broken 'dragend' events (they are not fired if the source text node got removed).
	 */
	private _draggingUid!: string;

	/**
	 * The reference to the model element that currently has a `draggable` attribute set (it is set while dragging).
	 */
	private _draggableElement!: Element | null;

	/**
	 * A delayed callback removing draggable attributes.
	 */
	private _clearDraggableAttributesDelayed: DelayedFunc<() => void> = delay( () => this._clearDraggableAttributes(), 40 );

	/**
	 * Whether the dragged content can be dropped only in block context.
	 */
	// TODO handle drag from other editor instance
	// TODO configure to use block, inline or both
	private _blockMode: boolean = false;

	/**
	 * DOM Emitter.
	 */
	private _domEmitter: DomEmitter = new ( DomEmitterMixin() )();

	/**
	 * The DOM element used to generate dragged preview image.
	 */
	private _previewContainer?: HTMLElement;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'DragDrop' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ClipboardPipeline, Widget, DragDropTarget, DragDropBlockToolbar ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;

		this._draggedRange = null;
		this._draggingUid = '';
		this._draggableElement = null;

		view.addObserver( ClipboardObserver );
		view.addObserver( MouseObserver );

		this._setupDragging();
		this._setupContentInsertionIntegration();
		this._setupClipboardInputIntegration();
		this._setupDraggableAttributeHandling();

		this.listenTo<ObservableChangeEvent<boolean>>( editor, 'change:isReadOnly', ( evt, name, isReadOnly ) => {
			if ( isReadOnly ) {
				this.forceDisabled( 'readOnlyMode' );
			} else {
				this.clearForceDisabled( 'readOnlyMode' );
			}
		} );

		this.on<ObservableChangeEvent<boolean>>( 'change:isEnabled', ( evt, name, isEnabled ) => {
			if ( !isEnabled ) {
				this._finalizeDragging( false );
			}
		} );

		if ( env.isAndroid ) {
			this.forceDisabled( 'noAndroidSupport' );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		if ( this._draggedRange ) {
			this._draggedRange.detach();
			this._draggedRange = null;
		}

		if ( this._previewContainer ) {
			this._previewContainer.remove();
		}

		this._domEmitter.stopListening();
		this._clearDraggableAttributesDelayed.cancel();

		return super.destroy();
	}

	/**
	 * Drag and drop events handling.
	 */
	private _setupDragging(): void {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const dragDropTarget = editor.plugins.get( DragDropTarget );

		// The handler for the drag start; it is responsible for setting data transfer object.
		this.listenTo<ViewDocumentDragStartEvent>( viewDocument, 'dragstart', ( evt, data ) => {
			// Don't drag the editable element itself.
			if ( data.target?.is( 'editableElement' ) ) {
				data.preventDefault();

				return;
			}

			this._prepareDraggedRange( data.target );

			if ( !this._draggedRange ) {
				data.preventDefault();

				return;
			}

			this._draggingUid = uid();

			data.dataTransfer.effectAllowed = this.isEnabled ? 'copyMove' : 'copy';
			data.dataTransfer.setData( 'application/ckeditor5-dragging-uid', this._draggingUid );

			const draggedSelection = model.createSelection( this._draggedRange.toRange() );
			const clipboardPipeline: ClipboardPipeline = this.editor.plugins.get( 'ClipboardPipeline' );

			clipboardPipeline._fireOutputTransformationEvent( data.dataTransfer, draggedSelection, 'dragstart' );

			const { dataTransfer, domTarget, domEvent } = data;
			const { clientX } = domEvent;

			this._updatePreview( { dataTransfer, domTarget, clientX } );

			data.stopPropagation();

			if ( !this.isEnabled ) {
				this._draggedRange.detach();
				this._draggedRange = null;
				this._draggingUid = '';
			}
		}, { priority: 'low' } );

		// The handler for finalizing drag and drop. It should always be triggered after dragging completes
		// even if it was completed in a different application.
		// Note: This is not fired if source text node got removed while downcasting a marker.
		this.listenTo<ViewDocumentDragEndEvent>( viewDocument, 'dragend', ( evt, data ) => {
			this._finalizeDragging( !data.dataTransfer.isCanceled && data.dataTransfer.dropEffect == 'move' );
		}, { priority: 'low' } );

		// Reset block dragging mode even if dropped outside the editable.
		this._domEmitter.listenTo( global.document, 'dragend', () => {
			this._blockMode = false;
		}, { useCapture: true } );

		// Dragging over the editable.
		this.listenTo<ViewDocumentDragEnterEvent>( viewDocument, 'dragenter', () => {
			if ( !this.isEnabled ) {
				return;
			}

			view.focus();
		} );

		// Dragging out of the editable.
		this.listenTo<ViewDocumentDragLeaveEvent>( viewDocument, 'dragleave', () => {
			// We do not know if the mouse left the editor or just some element in it, so let us wait a few milliseconds
			// to check if 'dragover' is not fired.
			dragDropTarget.removeDropMarkerDelayed();
		} );

		// Handler for moving dragged content over the target area.
		this.listenTo<ViewDocumentDraggingEvent>( viewDocument, 'dragging', ( evt, data ) => {
			if ( !this.isEnabled ) {
				data.dataTransfer.dropEffect = 'none';

				return;
			}

			const { clientX, clientY } = ( data as DomEventData<DragEvent> ).domEvent;

			dragDropTarget.updateDropMarker(
				data.target,
				data.targetRanges,
				clientX,
				clientY,
				this._blockMode,
				this._draggedRange
			);

			// If this is content being dragged from another editor, moving out of current editor instance
			// is not possible until 'dragend' event case will be fixed.
			if ( !this._draggedRange ) {
				data.dataTransfer.dropEffect = 'copy';
			}

			// In Firefox it is already set and effect allowed remains the same as originally set.
			if ( !env.isGecko ) {
				if ( data.dataTransfer.effectAllowed == 'copy' ) {
					data.dataTransfer.dropEffect = 'copy';
				} else if ( [ 'all', 'copyMove' ].includes( data.dataTransfer.effectAllowed ) ) {
					data.dataTransfer.dropEffect = 'move';
				}
			}

			evt.stop();
		}, { priority: 'low' } );
	}

	/**
	 * Integration with the `clipboardInput` event.
	 */
	private _setupClipboardInputIntegration(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const dragDropTarget = editor.plugins.get( DragDropTarget );

		// Update the event target ranges and abort dropping if dropping over itself.
		this.listenTo<ViewDocumentClipboardInputEvent>( viewDocument, 'clipboardInput', ( evt, data ) => {
			if ( data.method != 'drop' ) {
				return;
			}

			const { clientX, clientY } = ( data as DomEventData<DragEvent> ).domEvent;
			const targetRange = dragDropTarget.getFinalDropRange(
				data.target,
				data.targetRanges,
				clientX,
				clientY,
				this._blockMode,
				this._draggedRange
			);

			if ( !targetRange ) {
				this._finalizeDragging( false );
				evt.stop();

				return;
			}

			// Since we cannot rely on the drag end event, we must check if the local drag range is from the current drag and drop
			// or it is from some previous not cleared one.
			if ( this._draggedRange && this._draggingUid != data.dataTransfer.getData( 'application/ckeditor5-dragging-uid' ) ) {
				this._draggedRange.detach();
				this._draggedRange = null;
				this._draggingUid = '';
			}

			// Do not do anything if some content was dragged within the same document to the same position.
			const isMove = getFinalDropEffect( data.dataTransfer ) == 'move';

			if ( isMove && this._draggedRange && this._draggedRange.containsRange( targetRange, true ) ) {
				this._finalizeDragging( false );
				evt.stop();

				return;
			}

			// Override the target ranges with the one adjusted to the best one for a drop.
			data.targetRanges = [ editor.editing.mapper.toViewRange( targetRange ) ];
		}, { priority: 'high' } );
	}

	/**
	 * Integration with the `contentInsertion` event of the clipboard pipeline.
	 */
	private _setupContentInsertionIntegration(): void {
		const clipboardPipeline = this.editor.plugins.get( ClipboardPipeline );

		clipboardPipeline.on<ClipboardContentInsertionEvent>( 'contentInsertion', ( evt, data ) => {
			if ( !this.isEnabled || data.method !== 'drop' ) {
				return;
			}

			// Update the selection to the target range in the same change block to avoid selection post-fixing
			// and to be able to clone text attributes for plain text dropping.
			const ranges = data.targetRanges!.map( viewRange => this.editor.editing.mapper.toModelRange( viewRange ) );

			this.editor.model.change( writer => writer.setSelection( ranges ) );
		}, { priority: 'high' } );

		clipboardPipeline.on<ClipboardContentInsertionEvent>( 'contentInsertion', ( evt, data ) => {
			if ( !this.isEnabled || data.method !== 'drop' ) {
				return;
			}

			// Remove dragged range content, remove markers, clean after dragging.
			const isMove = getFinalDropEffect( data.dataTransfer ) == 'move';

			// Whether any content was inserted (insertion might fail if the schema is disallowing some elements
			// (for example an image caption allows only the content of a block but not blocks themselves.
			// Some integrations might not return valid range (i.e., table pasting).
			const isSuccess = !data.resultRange || !data.resultRange.isCollapsed;

			this._finalizeDragging( isSuccess && isMove );
		}, { priority: 'lowest' } );
	}

	/**
	 * Adds listeners that add the `draggable` attribute to the elements while the mouse button is down so the dragging could start.
	 */
	private _setupDraggableAttributeHandling(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// Add the 'draggable' attribute to the widget while pressing the selection handle.
		// This is required for widgets to be draggable. In Chrome it will enable dragging text nodes.
		this.listenTo<ViewDocumentMouseDownEvent>( viewDocument, 'mousedown', ( evt, data ) => {
			// The lack of data can be caused by editor tests firing fake mouse events. This should not occur
			// in real-life scenarios but this greatly simplifies editor tests that would otherwise fail a lot.
			if ( env.isAndroid || !data ) {
				return;
			}

			this._clearDraggableAttributesDelayed.cancel();

			// Check if this is a mousedown over the widget (but not a nested editable).
			let draggableElement = findDraggableWidget( data.target );

			// Note: There is a limitation that if more than a widget is selected (a widget and some text)
			// and dragging starts on the widget, then only the widget is dragged.

			// If this was not a widget then we should check if we need to drag some text content.
			// In Chrome set a 'draggable' attribute on closest editable to allow immediate dragging of the selected text range.
			// In Firefox this is not needed. In Safari it makes the whole editable draggable (not just textual content).
			// Disabled in read-only mode because draggable="true" + contenteditable="false" results
			// in not firing selectionchange event ever, which makes the selection stuck in read-only mode.
			if ( env.isBlink && !editor.isReadOnly && !draggableElement && !viewDocument.selection.isCollapsed ) {
				const selectedElement = viewDocument.selection.getSelectedElement();

				if ( !selectedElement || !isWidget( selectedElement ) ) {
					draggableElement = viewDocument.selection.editableElement;
				}
			}

			if ( draggableElement ) {
				view.change( writer => {
					writer.setAttribute( 'draggable', 'true', draggableElement! );
				} );

				// Keep the reference to the model element in case the view element gets removed while dragging.
				this._draggableElement = editor.editing.mapper.toModelElement( draggableElement )!;
			}
		} );

		// Remove the draggable attribute in case no dragging started (only mousedown + mouseup).
		this.listenTo<ViewDocumentMouseUpEvent>( viewDocument, 'mouseup', () => {
			if ( !env.isAndroid ) {
				this._clearDraggableAttributesDelayed();
			}
		} );
	}

	/**
	 * Removes the `draggable` attribute from the element that was used for dragging.
	 */
	private _clearDraggableAttributes(): void {
		const editing = this.editor.editing;

		editing.view.change( writer => {
			// Remove 'draggable' attribute.
			if ( this._draggableElement && this._draggableElement.root.rootName != '$graveyard' ) {
				writer.removeAttribute( 'draggable', editing.mapper.toViewElement( this._draggableElement )! );
			}

			this._draggableElement = null;
		} );
	}

	/**
	 * Deletes the dragged content from its original range and clears the dragging state.
	 *
	 * @param moved Whether the move succeeded.
	 */
	private _finalizeDragging( moved: boolean ): void {
		const editor = this.editor;
		const model = editor.model;
		const dragDropTarget = editor.plugins.get( DragDropTarget );

		dragDropTarget.removeDropMarker();
		this._clearDraggableAttributes();

		if ( editor.plugins.has( 'WidgetToolbarRepository' ) ) {
			const widgetToolbarRepository: WidgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );

			widgetToolbarRepository.clearForceDisabled( 'dragDrop' );
		}

		this._draggingUid = '';

		if ( this._previewContainer ) {
			this._previewContainer.remove();
			this._previewContainer = undefined;
		}

		if ( !this._draggedRange ) {
			return;
		}

		// Delete moved content.
		if ( moved && this.isEnabled ) {
			model.change( writer => {
				const selection = model.createSelection( this._draggedRange );

				model.deleteContent( selection, { doNotAutoparagraph: true } );

				// Check result selection if it does not require auto-paragraphing of empty container.
				const selectionParent = selection.getFirstPosition()!.parent as Element;

				if (
					selectionParent.isEmpty &&
					!model.schema.checkChild( selectionParent, '$text' ) &&
					model.schema.checkChild( selectionParent, 'paragraph' )
				) {
					writer.insertElement( 'paragraph', selectionParent, 0 );
				}
			} );
		}

		this._draggedRange.detach();
		this._draggedRange = null;
	}

	/**
	 * Sets the dragged source range based on event target and document selection.
	 */
	private _prepareDraggedRange( target: ViewElement ): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		// Check if this is dragstart over the widget (but not a nested editable).
		const draggableWidget = target ? findDraggableWidget( target ) : null;

		if ( draggableWidget ) {
			const modelElement = editor.editing.mapper.toModelElement( draggableWidget )!;

			this._draggedRange = LiveRange.fromRange( model.createRangeOn( modelElement ) );
			this._blockMode = model.schema.isBlock( modelElement );

			// Disable toolbars so they won't obscure the drop area.
			if ( editor.plugins.has( 'WidgetToolbarRepository' ) ) {
				const widgetToolbarRepository: WidgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );

				widgetToolbarRepository.forceDisabled( 'dragDrop' );
			}

			return;
		}

		// If this was not a widget we should check if we need to drag some text content.
		if ( selection.isCollapsed && !( selection.getFirstPosition()!.parent as Element ).isEmpty ) {
			return;
		}

		const blocks = Array.from( selection.getSelectedBlocks() );
		const draggedRange = selection.getFirstRange()!;

		if ( blocks.length == 0 ) {
			this._draggedRange = LiveRange.fromRange( draggedRange );

			return;
		}

		const blockRange = getRangeIncludingFullySelectedParents( model, blocks );

		if ( blocks.length > 1 ) {
			this._draggedRange = LiveRange.fromRange( blockRange );
			this._blockMode = true;
			// TODO block mode for dragging from outside editor? or inline? or both?
		} else if ( blocks.length == 1 ) {
			const touchesBlockEdges = draggedRange.start.isTouching( blockRange.start ) &&
					draggedRange.end.isTouching( blockRange.end );

			this._draggedRange = LiveRange.fromRange( touchesBlockEdges ? blockRange : draggedRange );
			this._blockMode = touchesBlockEdges;
		}

		model.change( writer => writer.setSelection( this._draggedRange!.toRange() ) );
	}

	/**
	 * Updates the dragged preview image.
	 */
	private _updatePreview( {
		dataTransfer,
		domTarget,
		clientX
	}: {
		dataTransfer: DataTransfer;
		domTarget: HTMLElement;
		clientX: number;
	} ): void {
		const view = this.editor.editing.view;
		const editable = view.document.selection.editableElement!;
		const domEditable = view.domConverter.mapViewToDom( editable )!;
		const computedStyle = global.window.getComputedStyle( domEditable );

		if ( !this._previewContainer ) {
			this._previewContainer = createElement( global.document, 'div', {
				style: 'position: fixed; left: -999999px;'
			} );

			global.document.body.appendChild( this._previewContainer );
		} else if ( this._previewContainer.firstElementChild ) {
			this._previewContainer.removeChild( this._previewContainer.firstElementChild );
		}

		const domRect = new Rect( domEditable );

		// If domTarget is inside the editable root, browsers will display the preview correctly by themselves.
		if ( domEditable.contains( domTarget ) ) {
			return;
		}

		const domEditablePaddingLeft = parseFloat( computedStyle.paddingLeft );
		const preview = createElement( global.document, 'div' );

		preview.className = 'ck ck-content';
		preview.style.width = computedStyle.width;
		preview.style.paddingLeft = `${ domRect.left - clientX + domEditablePaddingLeft }px`;

		/**
		 * Set white background in drag and drop preview if iOS.
		 * Check: https://github.com/ckeditor/ckeditor5/issues/15085
		 */
		if ( env.isiOS ) {
			preview.style.backgroundColor = 'white';
		}

		view.domConverter.setContentOf( preview, dataTransfer.getData( 'text/html' ) );

		dataTransfer.setDragImage( preview, 0, 0 );

		this._previewContainer.appendChild( preview );
	}
}

/**
 * Returns the drop effect that should be a result of dragging the content.
 * This function is handling a quirk when checking the effect in the 'drop' DOM event.
 */
function getFinalDropEffect( dataTransfer: DataTransfer ): DataTransfer[ 'dropEffect' ] {
	if ( env.isGecko ) {
		return dataTransfer.dropEffect;
	}

	return [ 'all', 'copyMove' ].includes( dataTransfer.effectAllowed ) ? 'move' : 'copy';
}

/**
 * Returns a widget element that should be dragged.
 */
function findDraggableWidget( target: ViewElement ): ViewElement | null {
	// This is directly an editable so not a widget for sure.
	if ( target.is( 'editableElement' ) ) {
		return null;
	}

	// TODO: Let's have a isWidgetSelectionHandleDomElement() helper in ckeditor5-widget utils.
	if ( target.hasClass( 'ck-widget__selection-handle' ) ) {
		return target.findAncestor( isWidget );
	}

	// Direct hit on a widget.
	if ( isWidget( target ) ) {
		return target;
	}

	// Find closest ancestor that is either a widget or an editable element...
	const ancestor = target.findAncestor( node => isWidget( node ) || node.is( 'editableElement' ) )!;

	// ...and if closer was the widget then enable dragging it.
	if ( isWidget( ancestor ) ) {
		return ancestor;
	}

	return null;
}

/**
 * Recursively checks if common parent of provided elements doesn't have any other children. If that's the case,
 * it returns range including this parent. Otherwise, it returns only the range from first to last element.
 *
 * Example:
 *
 * <blockQuote>
 *   <paragraph>[Test 1</paragraph>
 *   <paragraph>Test 2</paragraph>
 *   <paragraph>Test 3]</paragraph>
 * <blockQuote>
 *
 * Because all elements inside the `blockQuote` are selected, the range is extended to include the `blockQuote` too.
 * If only first and second paragraphs would be selected, the range would not include it.
 */
function getRangeIncludingFullySelectedParents( model: Model, elements: Array<Element> ): Range {
	const firstElement = elements[ 0 ];
	const lastElement = elements[ elements.length - 1 ];
	const parent = firstElement.getCommonAncestor( lastElement );
	const startPosition: Position = model.createPositionBefore( firstElement );
	const endPosition: Position = model.createPositionAfter( lastElement );

	if (
		parent &&
		parent.is( 'element' ) &&
		!model.schema.isLimit( parent )
	) {
		const parentRange = model.createRangeOn( parent );
		const touchesStart = startPosition.isTouching( parentRange.start );
		const touchesEnd = endPosition.isTouching( parentRange.end );

		if ( touchesStart && touchesEnd ) {
			// Selection includes all elements in the parent.
			return getRangeIncludingFullySelectedParents( model, [ parent ] );
		}
	}

	return model.createRange( startPosition, endPosition );
}
