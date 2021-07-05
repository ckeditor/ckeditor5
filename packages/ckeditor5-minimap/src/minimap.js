/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Plugin } from 'ckeditor5/src/core';
import { global } from 'ckeditor5/src/utils';
import MinimapView from './minimapview';
import {
	cloneDomRoot,
	getClientHeight,
	getDomElementRect,
	getPageStyles,
	getScrollable,
	findClosestScrollableAncestor
} from './utils';
// import { RectDrawer } from './utils';

import '../theme/minimap.css';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class Minimap extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Minimap';
	}

	init() {
		const editor = this.editor;

		/**
		 * TODO
		 */
		this._minimapView = null;

		/**
		 * TODO
		 */
		this._scrollableRootAncestor = null;

		/**
		 * TODO
		 */
		this._minimapContainerElement = editor.config.get( 'minimap.container' );

		this.listenTo( editor.ui, 'ready', this._onUiReady.bind( this ) );
	}

	destroy() {
		this._minimapView.destroy();
		this._minimapView.element.remove();
	}

	_onUiReady() {
		const editor = this.editor;
		const editingRootElement = this._editingRootElement = editor.ui.getEditableElement();

		// DOM root element is not yet attached to the document.
		if ( !editingRootElement.ownerDocument.body.contains( editingRootElement ) ) {
			editor.ui.once( 'update', this._onUiReady.bind( this ) );

			return;
		}

		this._initializeMinimap();

		this.listenTo( editor.editing.view, 'render', () => {
			this._syncMinimapToEditingRootScrollPosition();
		} );

		this._syncMinimapToEditingRootScrollPosition();
	}

	_initializeMinimap() {
		const editor = this.editor;
		const locale = editor.locale;
		const useSimplePreview = editor.config.get( 'minimap.useSimplePreview' );
		const minimapContainerElement = this._minimapContainerElement;
		const editingRootElementWidth = getDomElementRect( this._editingRootElement ).width;
		const minimapContainerWidth = getDomElementRect( minimapContainerElement ).width;
		const minimapScaleRatio = minimapContainerWidth / editingRootElementWidth;
		const scrollableRootAncestor = this._scrollableRootAncestor = findClosestScrollableAncestor( this._editingRootElement );

		const minimapView = this._minimapView = new MinimapView( {
			locale,
			scaleRatio: minimapScaleRatio,
			pageStyles: getPageStyles(),
			extraClasses: editor.config.get( 'minimap.extraClasses' ),
			useSimplePreview,
			domRootClone: cloneDomRoot( editor )
		} );

		minimapView.render();

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

		minimapView.listenTo( global.window, 'resize', () => {
			this._syncMinimapToEditingRootScrollPosition();
		} );

		minimapView.on( 'drag', ( evt, movementY ) => {
			let movementYPercentage;

			if ( minimapView.scrollHeight === 0 ) {
				movementYPercentage = 0;
			} else {
				movementYPercentage = movementY / minimapView.scrollHeight;
			}

			const absoluteScrollProgress = movementYPercentage *
				( scrollableRootAncestor.scrollHeight - getClientHeight( scrollableRootAncestor ) );
			const scrollable = getScrollable( scrollableRootAncestor );

			if ( absoluteScrollProgress < -1000 ) {
				// debugger;
			}

			// console.log( 'absoluteScrollProgress', absoluteScrollProgress, movementYPercentage, minimapView.scrollHeight );
			scrollable.scrollBy( 0, Math.round( absoluteScrollProgress ) );
		} );

		// Clicking the minimap centers the editing root in the position corresponding to the place where the click event was fired.
		minimapView.on( 'click', ( evt, percentage ) => {
			const absoluteScrollProgress = percentage * scrollableRootAncestor.scrollHeight;
			const scrollable = getScrollable( scrollableRootAncestor );

			scrollable.scrollBy( 0, Math.round( absoluteScrollProgress ) );
		} );

		minimapContainerElement.appendChild( minimapView.element );
	}

	_syncMinimapToEditingRootScrollPosition() {
		const editingRootElement = this._editingRootElement;

		this._minimapView.setContentHeight( editingRootElement.offsetHeight );

		const editingRootRect = getDomElementRect( editingRootElement );
		const scrollableRootAncestorRect = getDomElementRect( this._scrollableRootAncestor );
		let scrollProgress;

		// RectDrawer.clear();
		// RectDrawer.draw( scrollableRootAncestorRect, { outlineColor: 'red' }, 'scrollableRootAncestor' );
		// RectDrawer.draw( editingRootRect, { outlineColor: 'green' }, 'editingRoot' );

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

		// console.log( '[Scroll progress] =', scrollProgress );

		// The intersection helps to change the tracker height when there's a lot of padding around the root.
		// Note: It is essential that the height is set first beucase the progress depends on the correct tracker height.
		this._minimapView.setPositionTrackerHeight( scrollableRootAncestorRect.getIntersection( editingRootRect ).height );
		this._minimapView.setScrollProgress( scrollProgress );
	}
}
