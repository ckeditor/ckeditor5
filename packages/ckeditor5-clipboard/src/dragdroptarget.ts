/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/dragdroptarget
 */

import {
	Plugin,
	type Editor
} from '@ckeditor/ckeditor5-core';

import {
	type Element,
	type Range,
	type ViewElement,
	type ViewRange,
	type DowncastWriter,
	type ViewRootEditableElement
} from '@ckeditor/ckeditor5-engine';

import {
	global,
	Rect,
	DomEmitterMixin,
	delay,
	type DelayedFunc,
	type DomEmitter
} from '@ckeditor/ckeditor5-utils';

import LineView from './lineview';

import { type DebouncedFunc, throttle } from 'lodash-es';

/**
 * TODO
 */
export default class DragDropTarget extends Plugin {
	/**
	 * A delayed callback removing the drop marker.
	 *
	 * @internal
	 */
	public readonly removeDropMarkerDelayed: DelayedFunc<() => void> = delay( () => this.removeDropMarker(), 40 );

	/**
	 * A throttled callback updating the drop marker.
	 */
	private readonly _updateDropMarkerThrottled: DebouncedFunc<( targetRange: Range ) => void> = throttle(
		targetRange => this._updateDropMarker( targetRange ), 40
	);

	/**
	 * TODO
	 */
	private _dropTargetLineView = new LineView();

	/**
	 * TODO
	 */
	private _domEmitter: DomEmitter = new ( DomEmitterMixin() )();

	/**
	 * TODO
	 */
	private _domScrollables = new Map<string, HTMLElement>();

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DragDropTarget' {
		return 'DragDropTarget';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._setupDropMarker();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._domEmitter.stopListening();
		this._updateDropMarkerThrottled.cancel();
		this.removeDropMarkerDelayed.cancel();

		return super.destroy();
	}

	/**
	 * TODO
	 *
	 * @internal
	 */
	public updateDropMarker(
		targetViewElement: ViewElement,
		targetViewRanges: Array<ViewRange> | null,
		clientX: number,
		clientY: number,
		blockMode: boolean
	): void {
		this.removeDropMarkerDelayed.cancel();

		const targetRange = findDropTargetRange( this.editor, targetViewElement, targetViewRanges, clientX, clientY, blockMode );

		/* istanbul ignore else -- @preserve */
		if ( targetRange ) {
			this._updateDropMarkerThrottled( targetRange );
		}
	}

	/**
	 * TODO
	 *
	 * @internal
	 */
	public getFinalDropRange(
		targetViewElement: ViewElement,
		targetViewRanges: Array<ViewRange> | null,
		clientX: number,
		clientY: number,
		blockMode: boolean
	): Range | null {
		const targetRange = findDropTargetRange( this.editor, targetViewElement, targetViewRanges, clientX, clientY, blockMode );

		// The dragging markers must be removed after searching for the target range because sometimes
		// the target lands on the marker itself.
		this.removeDropMarker();

		return targetRange;
	}

	/**
	 * Removes the drop target marker.
	 *
	 * @internal
	 */
	public removeDropMarker(): void {
		const model = this.editor.model;

		this.removeDropMarkerDelayed.cancel();
		this._updateDropMarkerThrottled.cancel();
		this._dropTargetLineView.isVisible = false;

		if ( model.markers.has( 'drop-target' ) ) {
			model.change( writer => {
				writer.removeMarker( 'drop-target' );
			} );
		}
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

		// Drop marker conversion for in text and block drop target.
		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: 'drop-target',
			view: ( data, { writer } ) => {
				// Inline drop.
				if ( editor.model.schema.checkChild( data.markerRange.start, '$text' ) ) {
					this._dropTargetLineView.isVisible = false;

					return this._createDropTargetPosition( writer );
				}
				// Block drop.
				else {
					if ( data.markerRange.isCollapsed ) {
						this._updateDropTargetLine( data.markerRange );
					} else {
						this._dropTargetLineView.isVisible = false;
					}
				}
			}
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
	 * TODO
	 */
	private _createDropTargetPosition( writer: DowncastWriter ): ViewElement {
		return writer.createUIElement( 'span', { class: 'ck ck-clipboard-drop-target-position' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			// Using word joiner to make this marker as high as text and also making text not break on marker.
			domElement.append( '\u2060', domDocument.createElement( 'span' ), '\u2060' );

			return domElement;
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

		const domScrollableRect = this._getScrollableRect( viewElementParent );

		const { scrollX, scrollY } = global.window;
		const rectBefore = domElementBefore ? new Rect( domElementBefore ) : null;
		const rectAfter = domElementAfter ? new Rect( domElementAfter ) : null;
		const rectParent = new Rect( domElementParent ).excludeScrollbarsAndBorders();

		const above = rectBefore ? rectBefore.bottom : rectParent.top;
		const below = rectAfter ? rectAfter.top : rectParent.bottom;

		const parentStyle = global.window.getComputedStyle( domElementParent );

		const left = rectParent.left + parseFloat( parentStyle.paddingLeft );
		const top = ( above <= below ? ( above + below ) / 2 : below );

		if ( domScrollableRect.top < top && top < domScrollableRect.bottom ) {
			this._dropTargetLineView.set( {
				isVisible: true,
				left: left + scrollX,
				top: top + scrollY,
				width: rectParent.width - parseFloat( parentStyle.paddingLeft ) - parseFloat( parentStyle.paddingRight )
			} );
		} else {
			this._dropTargetLineView.isVisible = false;
		}
	}

	/**
	 * TODO
	 */
	private _getScrollableRect( viewElement: ViewElement ): Rect {
		const rootName = ( viewElement.root as ViewRootEditableElement ).rootName;

		let domScrollable;

		if ( this._domScrollables.has( rootName ) ) {
			domScrollable = this._domScrollables.get( rootName )!;
		} else {
			const domElement = this.editor.editing.view.domConverter.mapViewToDom( viewElement )!;

			domScrollable = findScrollableElement( domElement );
			this._domScrollables.set( rootName, domScrollable );

			// this._domEmitter.listenTo( domScrollable, 'scroll', () => {
			// 	TODO console.log( 'update line on scroll' );
			// }, { usePassive: true } );
			//
			// this._resizeObserver = new ResizeObserver( domScrollable, () => {
			// 	TODO console.log( 'update line on resize' );
			// } );
		}

		return new Rect( domScrollable ).excludeScrollbarsAndBorders();
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
 * Returns the closest scrollable ancestor DOM element.
 *
 * It is assumed that `domNode` is attached to the document.
 */
function findScrollableElement( domNode: HTMLElement ): HTMLElement {
	let domElement: HTMLElement = domNode;

	do {
		domElement = domElement.parentElement!;

		const overflow = global.window.getComputedStyle( domElement ).overflowY;

		if ( overflow == 'auto' || overflow == 'scroll' ) {
			break;
		}
	} while ( domElement.tagName != 'BODY' );

	return domElement;
}
