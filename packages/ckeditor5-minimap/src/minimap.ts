/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module minimap/minimap
 */

import { Plugin } from 'ckeditor5/src/core';
import { findClosestScrollableAncestor, global } from 'ckeditor5/src/utils';
import MinimapView, { type MinimapDragEvent, type MinimapClickEvent } from './minimapview';
import {
	cloneEditingViewDomRoot,
	getClientHeight,
	getDomElementRect,
	getPageStyles,
	getScrollable
} from './utils';

// @if CK_DEBUG_MINIMAP // const RectDrawer = require( '@ckeditor/ckeditor5-utils/tests/_utils/rectdrawer' ).default;

import '../theme/minimap.css';

/**
 * The content minimap feature.
 */
export default class Minimap extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Minimap' {
		return 'Minimap';
	}

	/**
	 * The reference to the view of the minimap.
	 */
	private _minimapView!: MinimapView | null;

	/**
	 * The DOM element closest to the editable element of the editor as returned
	 * by {@link module:ui/editorui/editorui~EditorUI#getEditableElement}.
	 */
	private _scrollableRootAncestor!: HTMLElement | null;

	/**
	 * The DOM element closest to the editable element of the editor as returned
	 * by {@link module:ui/editorui/editorui~EditorUI#getEditableElement}.
	 */
	private _editingRootElement?: HTMLElement;

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		this._minimapView = null;
		this._scrollableRootAncestor = null;

		this.listenTo( editor.ui, 'ready', this._onUiReady.bind( this ) );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._minimapView!.destroy();
		this._minimapView!.element!.remove();
	}

	/**
	 * Initializes the minimap view element and starts the layout synchronization
	 * on the editing view `render` event.
	 */
	private _onUiReady(): void {
		const editor = this.editor;

		// TODO: This will not work with the multi-root editor.
		const editingRootElement = this._editingRootElement = editor.ui.getEditableElement()!;

		this._scrollableRootAncestor = findClosestScrollableAncestor( editingRootElement );

		// DOM root element is not yet attached to the document.
		if ( !editingRootElement.ownerDocument.body.contains( editingRootElement ) ) {
			editor.ui.once( 'update', this._onUiReady.bind( this ) );

			return;
		}

		this._initializeMinimapView();

		this.listenTo( editor.editing.view, 'render', () => {
			this._syncMinimapToEditingRootScrollPosition();
		} );

		this._syncMinimapToEditingRootScrollPosition();
	}

	/**
	 * Initializes the minimap view and attaches listeners that make it responsive to the environment (document)
	 * but also allow the minimap to control the document (scroll position).
	 */
	private _initializeMinimapView(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const useSimplePreview = editor.config.get( 'minimap.useSimplePreview' );

		// TODO: Throw an error if there is no `minimap` in config.
		const minimapContainerElement = editor.config.get( 'minimap.container' )!;
		const scrollableRootAncestor = this._scrollableRootAncestor!;

		// TODO: This should be dynamic, the root width could change as the viewport scales if not fixed unit.
		const editingRootElementWidth = getDomElementRect( this._editingRootElement! ).width;
		const minimapContainerWidth = getDomElementRect( minimapContainerElement ).width;
		const minimapScaleRatio = minimapContainerWidth / editingRootElementWidth;

		const minimapView = this._minimapView = new MinimapView( {
			locale,
			scaleRatio: minimapScaleRatio,
			pageStyles: getPageStyles(),
			extraClasses: editor.config.get( 'minimap.extraClasses' ),
			useSimplePreview,
			domRootClone: cloneEditingViewDomRoot( editor )
		} );

		minimapView.render();

		// Scrollable ancestor scroll -> minimap position update.
		minimapView.listenTo( global.document, 'scroll', ( evt, data ) => {
			if ( scrollableRootAncestor === global.document.body ) {
				if ( data.target !== global.document ) {
					return;
				}
			} else if ( data.target !== scrollableRootAncestor ) {
				return;
			}

			this._syncMinimapToEditingRootScrollPosition();
		}, { useCapture: true, usePassive: true } );

		// Viewport resize -> minimap position update.
		minimapView.listenTo( global.window, 'resize', () => {
			this._syncMinimapToEditingRootScrollPosition();
		} );

		// Dragging the visible content area -> document (scrollable) position update.
		minimapView.on<MinimapDragEvent>( 'drag', ( evt, movementY ) => {
			let movementYPercentage;

			if ( minimapView.scrollHeight === 0 ) {
				movementYPercentage = 0;
			} else {
				movementYPercentage = movementY / minimapView.scrollHeight;
			}

			const absoluteScrollProgress = movementYPercentage *
				( scrollableRootAncestor.scrollHeight - getClientHeight( scrollableRootAncestor ) );
			const scrollable = getScrollable( scrollableRootAncestor );

			scrollable.scrollBy( 0, Math.round( absoluteScrollProgress ) );
		} );

		// Clicking the minimap -> center the document (scrollable) to the corresponding position.
		minimapView.on<MinimapClickEvent>( 'click', ( evt, percentage ) => {
			const absoluteScrollProgress = percentage * scrollableRootAncestor.scrollHeight;
			const scrollable = getScrollable( scrollableRootAncestor );

			scrollable.scrollBy( 0, Math.round( absoluteScrollProgress ) );
		} );

		minimapContainerElement.appendChild( minimapView.element! );
	}

	/**
	 * @private
	 */
	private _syncMinimapToEditingRootScrollPosition(): void {
		const editingRootElement = this._editingRootElement!;
		const minimapView = this._minimapView!;

		minimapView.setContentHeight( editingRootElement.offsetHeight );

		const editingRootRect = getDomElementRect( editingRootElement );
		const scrollableRootAncestorRect = getDomElementRect( this._scrollableRootAncestor! );
		let scrollProgress;

		// @if CK_DEBUG_MINIMAP // RectDrawer.clear();
		// @if CK_DEBUG_MINIMAP // RectDrawer.draw( scrollableRootAncestorRect, { outlineColor: 'red' }, 'scrollableRootAncestor' );
		// @if CK_DEBUG_MINIMAP // RectDrawer.draw( editingRootRect, { outlineColor: 'green' }, 'editingRoot' );

		// The root is completely visible in the scrollable ancestor.
		if ( scrollableRootAncestorRect.contains( editingRootRect ) ) {
			scrollProgress = 0;
		} else {
			if ( editingRootRect.top > scrollableRootAncestorRect.top ) {
				scrollProgress = 0;
			} else {
				scrollProgress = ( editingRootRect.top - scrollableRootAncestorRect.top ) /
					( scrollableRootAncestorRect.height - editingRootRect.height );

				scrollProgress = Math.max( 0, Math.min( scrollProgress, 1 ) );
			}
		}

		// The intersection helps to change the tracker height when there is a lot of padding around the root.
		// Note: It is **essential** that the height is set first because the progress depends on the correct tracker height.
		minimapView.setPositionTrackerHeight( scrollableRootAncestorRect.getIntersection( editingRootRect )!.height );
		minimapView.setScrollProgress( scrollProgress );
	}
}
