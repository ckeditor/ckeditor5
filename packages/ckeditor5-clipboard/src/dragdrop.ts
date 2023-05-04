/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/dragdrop
 */

/* globals setTimeout, clearTimeout */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';

import {
	LiveRange,
	MouseObserver,
	type DataTransfer,
	type Element,
	type Range,
	type ViewDocumentMouseDownEvent,
	type ViewDocumentMouseUpEvent,
	type ViewElement,
	type DomEventData,
	type ViewRange
} from '@ckeditor/ckeditor5-engine';

import { Widget, isWidget, type WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';

import {
	env,
	uid,
	global,
	Rect,
	DomEmitterMixin,
	createElement,
	type ObservableChangeEvent,
	type DomEmitter
} from '@ckeditor/ckeditor5-utils';

import type { BlockToolbar } from '@ckeditor/ckeditor5-ui';

import ClipboardPipeline, { type ClipboardContentInsertionEvent, type ViewDocumentClipboardOutputEvent } from './clipboardpipeline';
import ClipboardObserver, {
	type ViewDocumentDragEndEvent,
	type ViewDocumentDragEnterEvent,
	type ViewDocumentDraggingEvent,
	type ViewDocumentDragLeaveEvent,
	type ViewDocumentDragStartEvent,
	type ViewDocumentClipboardInputEvent
} from './clipboardobserver';

import LineView from './lineview';

import { type DebouncedFunc, throttle } from 'lodash-es';

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
	 * A throttled callback updating the drop marker.
	 */
	private _updateDropMarkerThrottled!: DebouncedFunc<( targetRange: Range ) => void>;

	/**
	 * A delayed callback removing the drop marker.
	 */
	private _removeDropMarkerDelayed!: DelayedFunc<() => void>;

	/**
	 * A delayed callback removing draggable attributes.
	 */
	private _clearDraggableAttributesDelayed!: DelayedFunc<() => void>;

	/**
	 * TODO
	 */
	private _dropTargetLineView = new LineView();

	/**
	 * TODO
	 */
	// TODO handle drag from other editor instance
	// TODO configure to use block, inline or both
	private _blockMode: boolean = false;

	/**
	 * TODO
	 */
	private _previewContainer?: HTMLElement;

	/**
	 * TODO
	 */
	private _isBlockDragging = false;

	/**
	 * TODO
	 */
	private _domEmitter: DomEmitter = new ( DomEmitterMixin() )();

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DragDrop' {
		return 'DragDrop';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ClipboardPipeline, Widget ] as const;
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
		this._updateDropMarkerThrottled = throttle( targetRange => this._updateDropMarker( targetRange ), 40 );
		this._removeDropMarkerDelayed = delay( () => this._removeDropMarker(), 40 );
		this._clearDraggableAttributesDelayed = delay( () => this._clearDraggableAttributes(), 40 );

		view.addObserver( ClipboardObserver );
		view.addObserver( MouseObserver );

		this._setupDragging();
		this._setupContentInsertionIntegration();
		this._setupClipboardInputIntegration();
		this._setupDropMarker();
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

		if ( editor.plugins.has( 'BlockToolbar' ) ) {
			const blockToolbar: BlockToolbar = editor.plugins.get( 'BlockToolbar' );
			const element = blockToolbar.buttonView.element!;

			element.setAttribute( 'draggable', 'true' );

			this._domEmitter.listenTo( element, 'dragstart', ( evt, data ) => this._handleBlockDragStart( data ) );
			this._domEmitter.listenTo( global.document, 'dragover', ( evt, data ) => this._handleBlockDragging( data ) );
			this._domEmitter.listenTo( global.document, 'drop', ( evt, data ) => this._handleBlockDragging( data ) );
			this._domEmitter.listenTo( global.document, 'dragend', () => this._handleBlockDragEnd(), { useCapture: true } );
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

		this._domEmitter.stopListening();

		this._updateDropMarkerThrottled.cancel();
		this._removeDropMarkerDelayed.cancel();
		this._clearDraggableAttributesDelayed.cancel();

		return super.destroy();
	}

	/**
	 * Drag and drop events handling.
	 */
	private _setupDragging(): void {
		const editor = this.editor;
		const model = editor.model;
		const modelDocument = model.document;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// The handler for the drag start; it is responsible for setting data transfer object.
		this.listenTo<ViewDocumentDragStartEvent>( viewDocument, 'dragstart', ( evt, data ) => {
			const selection = modelDocument.selection;

			// Don't drag the editable element itself.
			if ( data.target && data.target.is( 'editableElement' ) ) {
				data.preventDefault();

				return;
			}

			// Check if this is dragstart over the widget (but not a nested editable).
			const draggableWidget = data.target ? findDraggableWidget( data.target ) : null;

			if ( draggableWidget ) {
				const modelElement = editor.editing.mapper.toModelElement( draggableWidget )!;

				this._draggedRange = LiveRange.fromRange( model.createRangeOn( modelElement ) );
				this._blockMode = model.schema.isBlock( modelElement );

				// Disable toolbars so they won't obscure the drop area.
				if ( editor.plugins.has( 'WidgetToolbarRepository' ) ) {
					const widgetToolbarRepository: WidgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );

					widgetToolbarRepository.forceDisabled( 'dragDrop' );
				}
			}

			// If this was not a widget we should check if we need to drag some text content.
			else if ( !selection.isCollapsed || ( selection.getFirstPosition()!.parent as Element ).isEmpty ) {
				const blocks = Array.from( selection.getSelectedBlocks() );

				if ( blocks.length > 1 ) {
					this._draggedRange = LiveRange.fromRange( model.createRange(
						model.createPositionBefore( blocks[ 0 ] ),
						model.createPositionAfter( blocks[ blocks.length - 1 ] )
					) );

					model.change( writer => writer.setSelection( this._draggedRange!.toRange() ) );
					this._blockMode = true;
					// TODO block mode for dragging from outside editor? or inline? or both?
				}
				else if ( blocks.length == 1 ) {
					const draggedRange = selection.getFirstRange()!;
					const blockRange = model.createRange(
						model.createPositionBefore( blocks[ 0 ] ),
						model.createPositionAfter( blocks[ 0 ] )
					);

					if (
						draggedRange.start.isTouching( blockRange.start ) &&
						draggedRange.end.isTouching( blockRange.end )
					) {
						this._draggedRange = LiveRange.fromRange( blockRange );
						this._blockMode = true;
					} else {
						this._draggedRange = LiveRange.fromRange( selection.getFirstRange()! );
						this._blockMode = false;
					}
				}
			}

			if ( !this._draggedRange ) {
				data.preventDefault();

				return;
			}

			this._draggingUid = uid();

			data.dataTransfer.effectAllowed = this.isEnabled ? 'copyMove' : 'copy';
			data.dataTransfer.setData( 'application/ckeditor5-dragging-uid', this._draggingUid );

			const draggedSelection = model.createSelection( this._draggedRange.toRange() );
			const content = editor.data.toView( model.getSelectedContent( draggedSelection ) );

			viewDocument.fire<ViewDocumentClipboardOutputEvent>( 'clipboardOutput', {
				dataTransfer: data.dataTransfer,
				content,
				method: 'dragstart'
			} );

			this._updatePreview( data.dataTransfer );

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
			this._removeDropMarkerDelayed();
		} );

		// Handler for moving dragged content over the target area.
		this.listenTo<ViewDocumentDraggingEvent>( viewDocument, 'dragging', ( evt, data ) => {
			if ( !this.isEnabled ) {
				data.dataTransfer.dropEffect = 'none';

				return;
			}

			this._removeDropMarkerDelayed.cancel();

			const { clientX, clientY } = ( data as DomEventData<DragEvent> ).domEvent;
			const targetRange = findDropTargetRange( editor, data.target, data.targetRanges, clientX, clientY, this._blockMode );

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

			/* istanbul ignore else -- @preserve */
			if ( targetRange ) {
				this._updateDropMarkerThrottled( targetRange );
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

		// Update the event target ranges and abort dropping if dropping over itself.
		this.listenTo<ViewDocumentClipboardInputEvent>( viewDocument, 'clipboardInput', ( evt, data ) => {
			if ( data.method != 'drop' ) {
				return;
			}

			const { clientX, clientY } = ( data as DomEventData<DragEvent> ).domEvent;
			const targetRange = findDropTargetRange( editor, data.target, data.targetRanges, clientX, clientY, this._blockMode );

			// The dragging markers must be removed after searching for the target range because sometimes
			// the target lands on the marker itself.
			this._removeDropMarker();

			/* istanbul ignore if -- @preserve */
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
	 * Creates downcast conversion for the drop target marker.
	 */
	private _setupDropMarker(): void {
		const editor = this.editor;

		editor.ui.view.body.add( this._dropTargetLineView );

		// Drop marker conversion for hovering over widgets.
		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'drop-target',
			view: {
				classes: [ 'ck-clipboard-drop-target-range' ]
			}
		} );

		// Drop marker conversion for in text drop target.
		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: 'drop-target',
			view: ( data, { writer } ) => {
				const inText = editor.model.schema.checkChild( data.markerRange.start, '$text' );

				if ( !inText ) {
					if ( data.markerRange.isCollapsed ) {
						this._updateDropTargetLine( data.markerRange );
					} else {
						this._dropTargetLineView.isVisible = false;
					}

					return;
				}

				this._dropTargetLineView.isVisible = false;

				return writer.createUIElement( 'span', { class: 'ck ck-clipboard-drop-target-position' }, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					// Using word joiner to make this marker as high as text and also making text not break on marker.
					domElement.append( '\u2060', domDocument.createElement( 'span' ), '\u2060' );

					return domElement;
				} );
			}
		} );
	}

	/**
	 * TODO
	 */
	private _updateDropTargetLine( range: Range ): void {
		const editing = this.editor.editing;

		const nodeBefore = range.start.nodeBefore as Element | null;
		const nodeAfter = range.start.nodeAfter as Element | null;
		const nodeParent = range.start.parent as Element;

		const viewElementBefore = nodeBefore ? editing.mapper.toViewElement( nodeBefore ) : null;
		const domElementBefore = viewElementBefore ? editing.view.domConverter.mapViewToDom( viewElementBefore ) : null;

		const viewElementAfter = nodeAfter ? editing.mapper.toViewElement( nodeAfter )! : null;
		const domElementAfter = viewElementAfter ? editing.view.domConverter.mapViewToDom( viewElementAfter ) : null;

		const viewElementParent = editing.mapper.toViewElement( nodeParent )!;
		const domElementParent = editing.view.domConverter.mapViewToDom( viewElementParent )!;

		// TODO handle scrollable container
		// const domScrollableRect = new Rect( this._scrollableEditingRootDomAncestor! ).excludeScrollbarsAndBorders();

		const { scrollX, scrollY } = global.window;
		const rectBefore = domElementBefore ? new Rect( domElementBefore ) : null;
		const rectAfter = domElementAfter ? new Rect( domElementAfter ) : null;
		const rectParent = new Rect( domElementParent ).excludeScrollbarsAndBorders();

		const above = rectBefore ? rectBefore.bottom : rectParent.top;
		const below = rectAfter ? rectAfter.top : rectParent.bottom;

		const parentStyle = global.window.getComputedStyle( domElementParent );

		// TODO floating images - calculate top offset from other block that is in document flow
		// TODO add horizontal margins on line sides
		this._dropTargetLineView.set( {
			isVisible: true,
			left: rectParent.left + scrollX + parseFloat( parentStyle.paddingLeft ),
			top: ( above <= below ? ( above + below ) / 2 : below ) + scrollY,
			width: rectParent.width - parseFloat( parentStyle.paddingLeft ) - parseFloat( parentStyle.paddingRight )
		} );
	}

	/**
	 * Updates the drop target marker to the provided range.
	 *
	 * @param targetRange The range to set the marker to.
	 */
	private _updateDropMarker( targetRange: Range ): void {
		const editor = this.editor;
		const markers = editor.model.markers;

		editor.model.change( writer => {
			if ( markers.has( 'drop-target' ) ) {
				if ( !markers.get( 'drop-target' )!.getRange().isEqual( targetRange ) ) {
					writer.updateMarker( 'drop-target', { range: targetRange } );
				}
			} else {
				writer.addMarker( 'drop-target', {
					range: targetRange,
					usingOperation: false,
					affectsData: false
				} );
			}
		} );
	}

	/**
	 * Removes the drop target marker.
	 */
	private _removeDropMarker(): void {
		const model = this.editor.model;

		this._removeDropMarkerDelayed.cancel();
		this._updateDropMarkerThrottled.cancel();
		this._dropTargetLineView.isVisible = false;

		if ( model.markers.has( 'drop-target' ) ) {
			model.change( writer => {
				writer.removeMarker( 'drop-target' );
			} );
		}
	}

	/**
	 * Deletes the dragged content from its original range and clears the dragging state.
	 *
	 * @param moved Whether the move succeeded.
	 */
	private _finalizeDragging( moved: boolean ): void {
		const editor = this.editor;
		const model = editor.model;

		this._removeDropMarker();
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
			model.deleteContent( model.createSelection( this._draggedRange ), { doNotAutoparagraph: true } );
		}

		this._draggedRange.detach();
		this._draggedRange = null;
	}

	/**
	 * TODO
	 */
	private _updatePreview( dataTransfer: DataTransfer ): void {
		const view = this.editor.editing.view;
		const editable = view.document.selection.editableElement!;
		const domEditable = view.domConverter.mapViewToDom( editable )!;
		const computedStyle = global.window.getComputedStyle( domEditable );

		if ( !this._previewContainer ) {
			this._previewContainer = createElement( global.document, 'div', {
				style: 'position: fixed; left: -999999px;'
			} );

			global.document.body.appendChild( this._previewContainer );
		} else {
			this._previewContainer.removeChild( this._previewContainer.firstElementChild! );
		}

		const preview = createElement( global.document, 'div' );

		preview.className = 'ck ck-content';
		preview.style.width = computedStyle.width;

		preview.innerHTML = dataTransfer.getData( 'text/html' );
		dataTransfer.setDragImage( preview, 0, 0 );
		// TODO set x to make dragged widget stick to the mouse cursor

		this._previewContainer.appendChild( preview );
	}

	/**
	 * TODO
	 */
	private _handleBlockDragStart( domEvent: DragEvent ): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		const blocks = Array.from( selection.getSelectedBlocks() );
		const draggedRange = model.createRange(
			model.createPositionBefore( blocks[ 0 ] ),
			model.createPositionAfter( blocks[ blocks.length - 1 ] )
		);

		model.change( writer => writer.setSelection( draggedRange ) );

		this._isBlockDragging = true;

		this.editor.editing.view.getObserver( ClipboardObserver )!.onDomEvent( domEvent );
	}

	/**
	 * TODO
	 */
	private _handleBlockDragging( domEvent: DragEvent ): void {
		const clientX = domEvent.clientX + 100;
		const clientY = domEvent.clientY;
		const target = document.elementFromPoint( clientX, clientY );

		if ( !target || !target.closest( '.ck-editor__editable' ) || !this._isBlockDragging ) {
			return;
		}

		this.editor.editing.view.getObserver( ClipboardObserver )!.onDomEvent( {
			...domEvent,
			type: domEvent.type,
			dataTransfer: domEvent.dataTransfer,
			target,
			clientX,
			clientY,
			preventDefault: () => domEvent.preventDefault(),
			stopPropagation: () => domEvent.stopPropagation()
		} );
	}

	/**
	 * TODO
	 */
	private _handleBlockDragEnd(): void {
		this._isBlockDragging = false;

		// Reset dragging mode even if it started outside the editor (for example dragging image from disc).
		this._blockMode = false;
	}
}

/**
 * Returns fixed selection range for given position and target element.
 */
function findDropTargetRange(
	editor: Editor,
	targetViewElement: ViewElement,
	targetViewRanges: Array<ViewRange> | null,
	clientX: number,
	clientY: number,
	blockMode: boolean
): Range | null {
	const model = editor.model;
	const mapper = editor.editing.mapper;

	const targetModelElement = getClosestMappedModelElement( editor, targetViewElement );
	let modelElement = targetModelElement;

	while ( modelElement ) {
		if ( !blockMode ) {
			if ( model.schema.checkChild( modelElement, '$text' ) ) {
				const targetViewPosition = targetViewRanges ? targetViewRanges[ 0 ].start : null;
				const targetModelPosition = targetViewPosition ? mapper.toModelPosition( targetViewPosition ) : null;

				if ( targetModelPosition ) {
					if ( model.schema.checkChild( targetModelPosition, '$text' ) ) {
						return model.createRange( targetModelPosition );
					}
					else if ( targetViewPosition ) {
						// This is the case of dropping inside a span wrapper of an inline image.
						return findDropTargetRangeForElement( editor,
							getClosestMappedModelElement( editor, targetViewPosition.parent as ViewElement ),
							clientX, clientY
						);
					}
				}
			}
			else if ( model.schema.isInline( modelElement ) ) {
				return findDropTargetRangeForElement( editor, modelElement, clientX, clientY );
			}
		}

		if ( model.schema.isBlock( modelElement ) ) {
			return findDropTargetRangeForElement( editor, modelElement, clientX, clientY );
		}
		else if ( model.schema.checkChild( modelElement, '$block' ) ) {
			const childNodes = Array.from( modelElement.getChildren() )
				.filter( ( node ): node is Element => node.is( 'element' ) && !isFloatingElement( editor, node ) );

			let startIndex = 0;
			let endIndex = childNodes.length;

			while ( startIndex < endIndex - 1 ) {
				const middleIndex = Math.floor( ( startIndex + endIndex ) / 2 );
				const side = findElementSide( editor, childNodes[ middleIndex ], clientX, clientY );

				if ( side == 'before' ) {
					endIndex = middleIndex;
				} else {
					startIndex = middleIndex;
				}
			}

			return findDropTargetRangeForElement( editor, childNodes[ startIndex ], clientX, clientY );
		}

		modelElement = modelElement.parent as Element;
	}

	console.warn( 'none:', targetModelElement.name );

	return null;
}

/**
 * TODO
 */
function isFloatingElement( editor: Editor, modelElement: Element ): boolean {
	const mapper = editor.editing.mapper;
	const domConverter = editor.editing.view.domConverter;

	const viewElement = mapper.toViewElement( modelElement )!;
	const domElement = domConverter.mapViewToDom( viewElement )!;

	return global.window.getComputedStyle( domElement ).float != 'none';
}

/**
 * TODO
 */
function findDropTargetRangeForElement( editor: Editor, modelElement: Element, clientX: number, clientY: number ): Range | null {
	const model = editor.model;

	return model.createRange(
		model.createPositionAt(
			modelElement as Element,
			findElementSide( editor, modelElement, clientX, clientY )
		)
	);
}

/**
 * TODO
 */
function findElementSide( editor: Editor, modelElement: Element, clientX: number, clientY: number ): 'before' | 'after' {
	const mapper = editor.editing.mapper;
	const domConverter = editor.editing.view.domConverter;

	const viewElement = mapper.toViewElement( modelElement )!;
	const domElement = domConverter.mapViewToDom( viewElement )!;
	const rect = new Rect( domElement );

	if ( editor.model.schema.isInline( modelElement ) ) {
		return clientX < ( rect.left + rect.right ) / 2 ? 'before' : 'after';
	} else {
		return clientY < ( rect.top + rect.bottom ) / 2 ? 'before' : 'after';
	}
}

/**
 * Returns the closest model element for the specified view element.
 */
function getClosestMappedModelElement( editor: Editor, element: ViewElement ): Element {
	const mapper = editor.editing.mapper;
	const view = editor.editing.view;

	const targetModelElement = mapper.toModelElement( element );

	if ( targetModelElement ) {
		return targetModelElement;
	}

	// Find mapped ancestor if the target is inside not mapped element (for example inline code element).
	const viewPosition = view.createPositionBefore( element );
	const viewElement = mapper.findMappedViewAncestor( viewPosition );

	return mapper.toModelElement( viewElement )!;
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
 * Returns a function wrapper that will trigger a function after a specified wait time.
 * The timeout can be canceled by calling the cancel function on the returned wrapped function.
 * @param func The function to wrap.
 * @param wait The timeout in ms.
 */
function delay<T extends ( ...args: Array<any> ) => any>( func: T, wait: number ): DelayedFunc<T> {
	let timer: ReturnType<typeof setTimeout>;

	function delayed( ...args: Parameters<T> ) {
		delayed.cancel();
		timer = setTimeout( () => func( ...args ), wait );
	}

	delayed.cancel = () => {
		clearTimeout( timer );
	};

	return delayed;
}

interface DelayedFunc<T extends ( ...args: Array<any> ) => any> {
	( ...args: Parameters<T> ): void;
	cancel(): void;
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
