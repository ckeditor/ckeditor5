/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/contextualballoon
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import BalloonPanelView from './panel/balloon/balloonpanelview';

/**
 * Common contextual balloon of the Editor.
 *
 * This class reuses the same {module:ui/view~View} for each contextual balloon panel in the editor UI, makes
 * possible to add multiple views to the same balloon (stored in the stack, last one in the stack is visible)
 * and prevents of displaying more than one contextual balloon panel at the same time.
 */
export default class ContextualBalloon {
	/**
	 * Creates ContextualBalloon instance.
	 *
	 * @constructor
	 */
	constructor() {
		/**
		 * Balloon panel view.
		 *
		 * @readonly
		 * @member {module:ui/panel/balloon/balloonpanelview~BalloonPanelView} #view
		 */
		this.view = new BalloonPanelView();

		/**
		 * Stack of the views injected to the balloon. Last one in the stack is displayed
		 * as content of {@link module:ui/contextualballoon~ContextualBalloon#view}.
		 *
		 * @private
		 * @member {Map} #_stack
		 */
		this._stack = new Map();
	}

	/**
	 * Returns configuration of currently visible view or `null` when there is no view in the stack.
	 *
	 * @returns {module:ui/contextualballoon~ViewConfig|null}
	 */
	get visible() {
		return this._stack.get( this.view.content.get( 0 ) ) || null;
	}

	/**
	 * Returns `true` when given view is in the stack otherwise returns `false`.
	 *
	 * @param {module:ui:view~View} view
	 * @returns {Boolean}
	 */
	isViewInStack( view ) {
		return this._stack.has( view );
	}

	/**
	 * Adds view to the stack and makes is visible.
	 *
	 * @param {module:ui/contextualballoon~ViewConfig} data Configuration of the view.
	 */
	add( data ) {
		if ( this.isViewInStack( data.view ) ) {
			/**
			 * Trying to add configuration of the same view more than once.
			 *
			 * @error contextualballoon-add-view-exist
			 */
			throw new CKEditorError( 'contextualballoon-add-view-exist: Cannot add configuration of the same view twice.' );
		}

		// When adding view to the not empty balloon.
		if ( this.visible ) {
			// Remove displayed content from the view.
			this.view.content.remove( this.visible.view );
		}

		// Add new view to the stack.
		this._stack.set( data.view, data );
		// And display it.
		this._show( data );
	}

	/**
	 * Removes given view from the stack. If removed view was visible
	 * then the view before in the stack will be visible instead.
	 * When there is no view in the stack then balloon will hide.
	 *
	 * @param {module:ui/view~View} view View which will be removed from the balloon.
	 */
	remove( view ) {
		if ( !this.isViewInStack( view ) ) {
			/**
			 * Trying to remove configuration of the view not defined in the stack.
			 *
			 * @error contextualballoon-remove-view-not-exist
			 */
			throw new CKEditorError( 'contextualballoon-remove-view-not-exist: Cannot remove configuration of not existing view.' );
		}

		// When visible view is being removed.
		if ( this.visible.view === view ) {
			// We need to remove it from the view content.
			this.view.content.remove( view );

			// And then remove from the stack.
			this._stack.delete( view );

			// Next we need to check if there is other view in stack to show.
			const last = Array.from( this._stack.values() ).pop();

			// If it is.
			if ( last ) {
				// Just show it.
				this._show( last );
			// Otherwise.
			} else {
				// Hide balloon panel.
				this.view.hide();
			}
		// Otherwise.
		} else {
			// Just remove given view from the stack.
			this._stack.delete( view );
		}
	}

	/**
	 * Updates position of balloon panel according to position data
	 * of the first view in the stack.
	 */
	updatePosition() {
		this.view.attachTo( this._getBalloonPosition() );
	}

	/**
	 * Sets view as a content of the balloon and attaches balloon using position options of the first view.
	 *
	 * @private
	 * @param {module:ui/contextualballoon~ViewConfig} data Configuration of the view.
	 */
	_show( data ) {
		this.view.content.add( data.view );
		this.view.attachTo( this._getBalloonPosition() );
	}

	/**
	 * Returns position options of the first view in the stack.
	 * This helps to keep balloon in the same position when view is changed.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPosition() {
		return Array.from( this._stack.values() )[ 0 ].position;
	}
}

/**
 * An object describing configuration of single view added to the balloon stack.
 *
 * @typedef {Object} module:ui/contextualballoon~ViewConfig
 *
 * @property {module:ui/view~View} view Content of the balloon.
 * @property {module:utils/dom/position~Options} position Positioning options.
 */
