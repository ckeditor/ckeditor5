/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/ui/imageballoon
 */

import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { isImageWidget } from '../utils';

/**
 * A balloon used by various image features to display toolbars, editing forms
 * etc.
 *
 * @extends module:ui/panel/balloon/contextualballoon~ContextualBalloon
 */
export default class ImageBalloon extends ContextualBalloon {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageBalloon';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		super.init();

		/**
		 * Stack of the image package views injected into the balloon.
		 *
		 * @private
		 * @member {Map} #_imageStack
		 */
		this._imageStack = new Set();

		// Attach the life cycle actions.
		this._handleEditingRender();
		this._handleFocusChange();
	}

	/**
	 * Adds a new view to the balloon and makes it visible.
	 *
	 * @param {Object} data Configuration of the view.
	 * @param {module:ui/view~View} [data.view] Content of the balloon.
	 * @param {module:utils/dom/position~Options} [data.position] Positioning options. If not specified
	 * a default positioning options are used.
	 * @param {String} [data.balloonClassName] Additional css class for {@link #view} added when given view is visible.
	 */
	add( data ) {
		if ( !data.position ) {
			super.add( Object.assign( {}, data, {
				position: this._getBalloonPositionData()
			} ) );
		} else {
			super.add( data );
		}

		this._imageStack.add( data.view );
	}

	/**
	 * @inheritDoc
	 */
	remove( view ) {
		super.remove( view );

		this._imageStack.delete( view );
	}

	/**
	 * Removes all views from the balloon, and also hides it.
	 */
	clear() {
		for ( const view of this._imageStack ) {
			this.remove( view );
		}

		this._imageStack.clear();
	}

	/**
	 * Starts listening on {@link module:engine/view/document~Document#event:render}
	 * to re–position the balloon.
	 *
	 * @private
	 */
	_handleEditingRender() {
		const editingView = this.editor.editing.view;

		this.listenTo( editingView, 'render', () => {
			if ( !this.visibleView ) {
				return;
			}

			const selectedElement = editingView.selection.getSelectedElement();

			if ( selectedElement && isImageWidget( selectedElement ) ) {
				this.updatePosition( this._getBalloonPositionData() );
			}
		}, { priority: 'lowest' } );
	}

	/**
	 * Observes focus changes in the editor and responds to them by hiding
	 * the balloon when the editor loses focus.
	 *
	 * @private
	 */
	_handleFocusChange() {
		const editor = this.editor;

		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, is ) => {
			if ( !is ) {
				this.clear();
			}
		}, { priority: 'lowest' } );
	}

	/**
	 * Returns positioning options that control the way balloon is attached
	 * to the selected image.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPositionData() {
		const editingView = this.editor.editing.view;
		const defaultPositions = BalloonPanelView.defaultPositions;

		return {
			target: editingView.domConverter.viewToDom( editingView.selection.getSelectedElement() ),
			positions: [
				defaultPositions.northArrowSouth,
				defaultPositions.southArrowNorth
			]
		};
	}
}
