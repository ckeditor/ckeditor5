/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/ui/imageballoonpanel
 */

import throttle from '@ckeditor/ckeditor5-utils/src/lib/lodash/throttle';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/balloonpanel/balloonpanelview';
import { isImageWidget } from '../utils';

const arrowVOffset = BalloonPanelView.arrowVerticalOffset;
const positions = {
	//	   [text range]
	//	        ^
	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
	south: ( targetRect, balloonRect ) => ( {
		top: targetRect.bottom + arrowVOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 's'
	} ),

	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
	//	        V
	//	   [text range]
	north: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - arrowVOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 'n'
	} )
};

/**
 * Image balloon panel class. It extends {module:ui/balloonpanel/balloonpanelview~BalloonPanelView} by adding helpers
 * to use with image widgets. It sets proper positioning on `scroll` and `resize` events and hides the panel when
 * image is no longer selected or focus is lost.
 *
 * @extends module:ui/balloonpanel/balloonpanelview~BalloonPanelView
 */
export default class ImageBalloonPanelView extends BalloonPanelView {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor.locale );

		this.editor = editor;
		const editingView = editor.editing.view;

		// Hide the balloon if editor had focus and now focus is lost.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, is, was ) => {
			if ( was && !is ) {
				this.detach();
			}
		} );

		// Hide the balloon if no image is currently selected.
		editor.listenTo( editingView, 'render', () => {
			const selectedElement = editingView.selection.getSelectedElement();

			if ( !selectedElement || !isImageWidget( selectedElement ) ) {
				this.detach();
			}
		}, { priority: 'low' } );

		/**
		 * Wraps {@link #_attach} method with throttle function that will fire it not more than every 100ms.
		 * It is used as `scroll` and `resize` callback.
		 *
		 * @private
		 * @member {Function} #_throttledAttach
		 */
		this._throttledAttach = throttle( () => {
			this._attach();
		}, 100 );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Let the focusTracker know about new focusable UI element.
		this.editor.ui.focusTracker.add( this.element );

		return super.init();
	}

	/**
	 * Attaches the panel and enables `scroll` and `resize` listeners.
	 */
	attach() {
		this._attach();
		this.editor.ui.view.listenTo( global.window, 'scroll', this._throttledAttach );
		this.editor.ui.view.listenTo( global.window, 'resize', this._throttledAttach );
	}

	/**
	 * Detaches the panel and disables `scroll` and `resize` listeners.
	 */
	detach() {
		this.hide();
		this.editor.ui.view.stopListening( global.window, 'scroll', this._throttledAttach );
		this.editor.ui.view.stopListening( global.window, 'resize', this._throttledAttach );
	}

	/**
	 * Attaches the panel to the first selection range.
	 *
	 * @private
	 */
	_attach() {
		const editingView = this.editor.editing.view;

		this.attachTo( {
			target: editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ),
			positions: [ positions.north, positions.south ]
		} );
	}
}
