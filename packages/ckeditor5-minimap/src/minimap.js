/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module minimap/minimap
 */

import { Plugin } from 'ckeditor5/src/core';
import { global } from 'ckeditor5/src/utils';
import MinimapView from './minimapview';
import {
	cloneEditingViewDomRoot,
	getClientHeight,
	getDomElementRect,
	getPageStyles,
	getScrollable,
	findClosestScrollableAncestor
} from './utils';

// @if CK_DEBUG_MINIMAP // import RectDrawer from '@ckeditor/ckeditor5-utils/tests/_utils/rectdrawer';

import '../theme/minimap.css';

/**
 * The content minimap feature.
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

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		/**
		 * The reference to the view of the minimap.
		 *
		 * @private
		 * @member {module:minimap/minimapview~MinimapView}
		 */
		this._minimapView = null;

		/**
		 * The DOM element closest to the editable element of the editor as returned
		 * by {@link module:core/editor/editorui~EditorUI#getEditableElement}.
		 *
		 * @private
		 * @member {HTMLElement}
		 */
		this._scrollableRootAncestor = null;

		this.listenTo( editor.ui, 'ready', this._onUiReady.bind( this ) );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._minimapView.destroy();
		this._minimapView.element.remove();
	}

	/**
	 * Initializes the minimap view element and starts the layout synchronization
	 * on the editing view `render` event.
	 *
	 * @private
	 */
	_onUiReady() {
		const editor = this.editor;

		// TODO: This will not work with the multi-root editor.
		const editingRootElement = this._editingRootElement = editor.ui.getEditableElement();

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
	 *
	 * @private
	 */
	_initializeMinimapView() {
		const editor = this.editor;
		const locale = editor.locale;
		const useSimplePreview = editor.config.get( 'minimap.useSimplePreview' );
		const minimapContainerElement = editor.config.get( 'minimap.container' );
		const scrollableRootAncestor = this._scrollableRootAncestor;

		// TODO: This should be dynamic, the root width could change as the viewport scales if not fixed unit.
		const editingRootElementWidth = getDomElementRect( this._editingRootElement ).width;
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

			scrollable.scrollBy( 0, Math.round( absoluteScrollProgress ) );
		} );

		// Clicking the minimap -> center the document (scrollable) to the corresponding position.
		minimapView.on( 'click', ( evt, percentage ) => {
			const absoluteScrollProgress = percentage * scrollableRootAncestor.scrollHeight;
			const scrollable = getScrollable( scrollableRootAncestor );

			scrollable.scrollBy( 0, Math.round( absoluteScrollProgress ) );
		} );

		minimapContainerElement.appendChild( minimapView.element );
	}

	/**
	 * @private
	 */
	_syncMinimapToEditingRootScrollPosition() {
		const editingRootElement = this._editingRootElement;
		const minimapView = this._minimapView;

		minimapView.setContentHeight( editingRootElement.offsetHeight );

		const editingRootRect = getDomElementRect( editingRootElement );
		const scrollableRootAncestorRect = getDomElementRect( this._scrollableRootAncestor );
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
		minimapView.setPositionTrackerHeight( scrollableRootAncestorRect.getIntersection( editingRootRect ).height );
		minimapView.setScrollProgress( scrollProgress );
	}
}

/**
 * The configuration of the minimap feature. Introduced by the {@link module:minimap/minimap~Minimap} feature.
 *
 * Read more in {@link module:minimap/minimap~MinimapConfig}.
 *
 * @member {module:minimap/minimap~MinimapConfig} module:core/editor/editorconfig~EditorConfig#minimap
 */

/**
 * The configuration of the {@link module:minimap/minimap~Minimap} feature.
 *
 *		ClassicEditor
 *			.create( {
 *				minimap: ... // Minimap feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface MinimapConfig
 */

/**
 * The DOM element container for the minimap.
 *
 * **Note**: The container must have a fixed `width` and `overflow: hidden` for the minimap to work correctly.
 *
 * @member {HTMLElement} module:minimap/minimap~MinimapConfig#container
 */

/**
 * When set to `true`, the minimap will render content as simple boxes instead of replicating the look of the content (default).
 *
 * @member {Boolean} module:minimap/minimap~MinimapConfig#useSimplePreview
 */

/**
 * Extra CSS class (or classes) that will be set internally on the `<body>` element of the `<iframe>` enclosing the minimap.
 *
 * By default, the minimap feature will attempt to clone all website styles and re-apply them in the `<iframe>` for the best accuracy.
 * However, this may not work if the content of your editor inherits the styles from parent containers, resulting in inconsistent
 * look and imprecise scrolling of the minimap.
 *
 * This optional configuration can address these issues by ensuring the same CSS rules apply to the content of the minimap
 * and the original content of the editor.
 *
 * For instance, consider the following DOM structure:
 *
 *		<div class="website">
 *			<!-- ... -->
 *			<div class="styled-container">
 *				 <!-- ... -->
 *				<div id="editor">
 *					<!-- content of the editor -->
 *				</div>
 *			</div>
 *			<!-- ... -->
 *		</div>
 *
 * and the following CSS styles:
 *
 *		.website p {
 *			font-size: 13px;
 *		}
 *
 *		.styled-container p {
 *			color: #ccc;
 *		}
 *
 * To maintain the consistency of styling (`font-size` and `color` of paragraphs), you will need to pass the CSS class names
 * of these containers:
 *
 *		ClassicEditor
 *			.create( document.getElementById( 'editor' ), {
 *				minimap: {
 *					extraClasses: 'website styled-container'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @member {String} module:minimap/minimap~MinimapConfig#extraClasses
 */
