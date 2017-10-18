/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/panel/balloon/contextualballoon
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BalloonPanelView from './balloonpanelview';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * Provides the common contextual balloon panel for the editor.
 *
 * This plugin allows reusing a single {module:ui/panel/balloon/balloonpanelview~BalloonPanelView} instance
 * to display multiple contextual balloon panels in the editor.
 *
 * Child views of such a panel are stored in the stack and the last one in the stack is visible. When the
 * visible view is removed from the stack, the previous view becomes visible, etc. If there are no more
 * views in the stack, the balloon panel will hide.
 *
 * It simplifies managing the views and helps
 * avoid the unnecessary complexity of handling multiple {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
 * instances in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ContextualBalloon extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ContextualBalloon';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		/**
		 * The common balloon panel view.
		 *
		 * @readonly
		 * @member {module:ui/panel/balloon/balloonpanelview~BalloonPanelView} #view
		 */
		this.view = new BalloonPanelView();

		/**
		 * The {@link module:utils/dom/position~Options#limiter position limiter}
		 * for the {@link #view}, used when no `limiter` has been passed into {@link #add}
		 * or {@link #updatePosition}.
		 *
		 * By default, a function, which obtains the farthest DOM
		 * {@link module:engine/view/rooteditableelement~RootEditableElement}
		 * of the {@link module:engine/view/document~Document#selection}.
		 *
		 * @member {module:utils/dom/position~Options#limiter} #positionLimiter
		 */
		this.positionLimiter = () => {
			const view = this.editor.editing.view;
			const editableElement = view.selection.editableElement;

			if ( editableElement ) {
				return view.domConverter.mapViewToDom( editableElement.root );
			}

			return null;
		};

		/**
		 * Stack of the views injected into the balloon. Last one in the stack is displayed
		 * as a content of {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon#view}.
		 *
		 * @private
		 * @member {Map} #_stack
		 */
		this._stack = new Map();

		// Add balloon panel view to editor `body` collection and wait until view will be ready.
		this.editor.ui.view.body.add( this.view );

		// Editor should be focused when contextual balloon is focused.
		this.editor.ui.focusTracker.add( this.view.element );
	}

	/**
	 * Returns the currently visible view or `null` when there are no
	 * views in the stack.
	 *
	 * @returns {module:ui/view~View|null}
	 */
	get visibleView() {
		const item = this._stack.get( this.view.content.get( 0 ) );

		return item ? item.view : null;
	}

	/**
	 * Returns `true` when the given view is in the stack. Otherwise returns `false`.
	 *
	 * @param {module:ui/view~View} view
	 * @returns {Boolean}
	 */
	hasView( view ) {
		return this._stack.has( view );
	}

	/**
	 * Adds a new view to the stack and makes it visible.
	 *
	 * @param {Object} data Configuration of the view.
	 * @param {module:ui/view~View} [data.view] Content of the balloon.
	 * @param {module:utils/dom/position~Options} [data.position] Positioning options.
	 * @param {String} [data.balloonClassName] Additional css class for {@link #view} added when given view is visible.
	 */
	add( data ) {
		if ( this.hasView( data.view ) ) {
			/**
			 * Trying to add configuration of the same view more than once.
			 *
			 * @error contextualballoon-add-view-exist
			 */
			throw new CKEditorError( 'contextualballoon-add-view-exist: Cannot add configuration of the same view twice.' );
		}

		// When adding view to the not empty balloon.
		if ( this.visibleView ) {
			// Remove displayed content from the view.
			this.view.content.remove( this.visibleView );
		}

		// Add new view to the stack.
		this._stack.set( data.view, data );

		// And display it.
		this._show( data );
	}

	/**
	 * Removes the given view from the stack. If the removed view was visible,
	 * then the view preceding it in the stack will become visible instead.
	 * When there is no view in the stack then balloon will hide.
	 *
	 * @param {module:ui/view~View} view A view to be removed from the balloon.
	 */
	remove( view ) {
		if ( !this.hasView( view ) ) {
			/**
			 * Trying to remove configuration of the view not defined in the stack.
			 *
			 * @error contextualballoon-remove-view-not-exist
			 */
			throw new CKEditorError( 'contextualballoon-remove-view-not-exist: Cannot remove configuration of not existing view.' );
		}

		// When visible view is being removed.
		if ( this.visibleView === view ) {
			// We need to remove it from the view content.
			this.view.content.remove( view );

			// And then remove from the stack.
			this._stack.delete( view );

			// Next we need to check if there is other view in stack to show.
			const last = Array.from( this._stack.values() ).pop();

			// If it is some other view.
			if ( last ) {
				// Just show it.
				this._show( last );
			} else {
				// Hide the balloon panel.
				this.view.hide();
			}
		} else {
			// Just remove given view from the stack.
			this._stack.delete( view );
		}
	}

	/**
	 * Updates the position of the balloon using position data of the first visible view in the stack.
	 * When new position data is given then position data of currently visible panel will be updated.
	 *
	 * @param {module:utils/dom/position~Options} [position] position options.
	 */
	updatePosition( position ) {
		if ( position ) {
			this._stack.get( this.visibleView ).position = position;
		}

		this.view.pin( this._getBalloonPosition() );
	}

	/**
	 * Sets the view as a content of the balloon and attaches balloon using position
	 * options of the first view.
	 *
	 * @private
	 * @param {Object} data Configuration.
	 * @param {module:ui/view~View} [data.view] View to show in the balloon.
	 * @param {String} [data.balloonClassName=''] Additional class name which will added to the {#_balloon} view.
	 */
	_show( { view, balloonClassName = '' } ) {
		this.view.className = balloonClassName;

		this.view.content.add( view );
		this.view.pin( this._getBalloonPosition() );
	}

	/**
	 * Returns position options of the first view in the stack.
	 * This keeps the balloon in the same position when view is changed.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPosition() {
		let position = first( this._stack.values() ).position;

		// Use the default limiter if none has been specified.
		if ( position && !position.limiter ) {
			// Don't modify the original options object.
			position = Object.assign( {}, position, {
				limiter: this.positionLimiter
			} );
		}

		return position;
	}
}
