/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/contextualballoon
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Controller of common contextual balloon.
 *
 * This class reuses the same {module:ui/view~View} for each contextual balloon panel in the editor UI, makes
 * possible to add multiple views to the same balloon panel (stored in the stack, last one in the stack is visible)
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
		 * Stack of panels injected to the balloon. Last one in the stack is displayed
		 * as content of {@link module:ui/contextualballoon~ContextualBalloon#view}.
		 *
		 * @private
		 * @member {Map} #_stack
		 */
		this._stack = new Map();

		/**
		 * Balloon panel view.
		 *
		 * @member {module:ui:view~View} #view
		 */
	}

	/**
	 * Returns configuration of currently visible panel or `null` when there is no panel in the balloon.
	 *
	 * @returns {module:ui/contextualballoon~Panel|null}
	 */
	get visible() {
		return this._stack.get( this.view.content.get( 0 ) ) || null;
	}

	/**
	 * Adds panel to the stack of opened panels and makes this panel currently visible.
	 *
	 * @param {module:ui/contextualballoon~Panel} panelData Configuration of the panel.
	 */
	add( panelData ) {
		if ( this._stack.get( panelData.view ) ) {
			/**
			 * Trying to add configuration of the same panel more than once.
			 *
			 * @error contextualballoon-add-item-exist
			 */
			throw new CKEditorError( 'contextualballoon-add-panel-exist: Cannot add configuration of existing panel.' );
		}

		// When adding panel to the not empty balloon.
		if ( this.visible ) {
			// Remove displayed content from the view.
			this.view.content.remove( this.visible.view );
		}

		// Add new panel to the stack.
		this._stack.set( panelData.view, panelData );
		// And display it.
		this._showPanel( panelData );
	}

	/**
	 * Removes panel of given {@link: module:ui/view~View} from the stack of panels.
	 * If removed panel was currently displayed then the panel before in the stack will be displayed instead.
	 * When there is no panel in the stack then balloon will hide.
	 *
	 * @param {module:ui/view~View} view View of panel which will be removed from the balloon.
	 */
	remove( view ) {
		if ( !this._stack.get( view ) ) {
			/**
			 * Trying to remove configuration of the panel not defined in the stack.
			 *
			 * @error contextualballoon-remove-panel-not-exist
			 */
			throw new CKEditorError( 'contextualballoon-remove-panel-not-exist: Cannot remove configuration of not existing panel.' );
		}

		// When visible panel is been removed.
		if ( this.visible.view === view ) {
			// We need to remove it from the view content.
			this.view.content.remove( view );

			// And then remove from the stack.
			this._stack.delete( view );

			// Next we need to check if there is other panel in stack to show.
			const lastPanel = Array.from( this._stack ).pop();

			// If it is.
			if ( lastPanel ) {
				// Just show it.
				this._showPanel( lastPanel[ 1 ] );
			// Otherwise.
			} else {
				// Hide balloon panel.
				this.view.hide();
			}
		// Otherwise.
		} else {
			// Just remove given panel from the stack.
			this._stack.delete( view );
		}
	}

	/**
	 * Updates position of balloon panel according to position data
	 * of the first panel in the {#_stack}.
	 */
	updatePosition() {
		this.view.attachTo( this._getBalloonPosition() );
	}

	/**
	 * Sets panel as a content of the balloon and attach balloon using position options of the first panel.
	 *
	 * @private
	 * @param {module:ui/contextualballoon~Panel} panelData Configuration of the panel.
	 */
	_showPanel( panelData ) {
		this.view.content.add( panelData.view );
		this.view.attachTo( this._getBalloonPosition() );
	}

	/**
	 * Returns position options of the first panel in the stack.
	 * This helps to keep panel in the same position.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPosition() {
		return Array.from( this._stack )[ 0 ][ 1 ].position;
	}
}

/**
 * An object describing configuration of single panel added to the balloon.
 *
 * @typedef {Object} module:ui/contextualballoon~Panel
 *
 * @property {module:ui/view~View} view Panel content view.
 * @property {module:utils/dom/position~Options} position Positioning options.
 */
