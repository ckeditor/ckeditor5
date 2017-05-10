/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/contextual/contextualtoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '../../panel/balloon/contextualballoon';
import ToolbarView from '../toolbarview';
import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';
import debounce from '@ckeditor/ckeditor5-utils/src/lib/lodash/debounce';

const defaultPositions = BalloonPanelView.defaultPositions;

/**
 * The contextual toolbar.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ContextualToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ui/contextualtoolbar';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		/**
		 * The toolbar view displayed in the balloon.
		 *
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbarView = new ToolbarView( this.editor.locale );

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = this.editor.plugins.get( ContextualBalloon );

		/**
		 * Fires {@link #event:_selectionChangeDebounced} event using `lodash#debounce`.
		 *
		 * This function is stored as a plugin property to make possible to cancel
		 * trailing debounced invocation on destroy.
		 *
		 * @private
		 * @member {Function}
		 */
		this._fireSelectionChangeDebounced = debounce( () => this.fire( '_selectionChangeDebounced' ), 200 );

		// Attach lifecycle actions.
		this._handleSelectionChange();
		this._handleFocusChange();
	}

	/**
	 * Creates toolbar components based on given configuration.
	 * This needs to be done when all plugins will be ready.
	 *
	 * @inheritDoc
	 */
	afterInit() {
		const config = this.editor.config.get( 'contextualToolbar' );
		const factory = this.editor.ui.componentFactory;

		return this.toolbarView.fillFromConfig( config, factory );
	}

	/**
	 * Handles editor focus change and hides panel if it's needed.
	 *
	 * @private
	 */
	_handleFocusChange() {
		const editor = this.editor;

		// Hide the panel View when editor loses focus but no the other way around.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			if ( this._balloon.visibleView === this.toolbarView && !isFocused ) {
				this._hidePanel();
			}
		} );
	}

	/**
	 * Handles {@link module:engine/model/document~Document#selection} change and show or hide toolbar.
	 *
	 * Note that in this case it's better to listen to {@link module:engine/model/document~Document model document}
	 * selection instead of {@link module:engine/view/document~Document view document} selection because the first one
	 * doesn't fire `change` event after text style change (like bold or italic) and toolbar doesn't blink.
	 *
	 * @private
	 */
	_handleSelectionChange() {
		const selection = this.editor.document.selection;

		this.listenTo( selection, 'change:range', ( evt, data ) => {
			// When the selection is not changed by a collaboration and when is not collapsed.
			if ( data.directChange || selection.isCollapsed ) {
				// Hide the toolbar when the selection starts changing.
				this._hidePanel();
			}

			// Fire internal `_selectionChangeDebounced` when the selection stops changing.
			this._fireSelectionChangeDebounced();
		} );

		// Hide the toolbar when the selection stops changing.
		this.listenTo( this, '_selectionChangeDebounced', () => this._showPanel() );
	}

	/**
	 * Adds panel view to the {@link: #_balloon} and attaches panel to the selection.
	 *
	 * Fires {@link #event:beforeShow} event just before displaying the panel.
	 *
	 * @protected
	 * @return {Promise} A promise resolved when the {@link #toolbarView} {@link module:ui/view~View#init} is done.
	 */
	_showPanel() {
		const editingView = this.editor.editing.view;
		let isStopped = false;

		// Do not add toolbar to the balloon stack twice.
		if ( this._balloon.hasView( this.toolbarView ) ) {
			return Promise.resolve();
		}

		// This implementation assumes that only non–collapsed selections gets the contextual toolbar.
		if ( !editingView.isFocused || editingView.selection.isCollapsed ) {
			return Promise.resolve();
		}

		const showPromise = new Promise( ( resolve ) => {
			// If `beforeShow` event is not stopped by any external code then panel will be displayed.
			this.once( 'beforeShow', () => {
				if ( isStopped ) {
					isStopped = false;
					resolve();

					return;
				}

				// Update panel position when selection changes while balloon will be opened
				// (by an external document changes).
				this.listenTo( editingView, 'render', () => {
					this._balloon.updatePosition( this._getBalloonPositionData() );
				} );

				resolve(
					// Add panel to the common editor contextual balloon.
					this._balloon.add( {
						view: this.toolbarView,
						position: this._getBalloonPositionData(),
						balloonClassName: 'ck-toolbar-container'
					} )
				);
			} );
		}, { priority: 'lowest' } );

		// Fire this event to inform that `ContextualToolbar` is going to be shown.
		// Helper function for preventing the panel from being displayed is passed along with the event.
		this.fire( 'beforeShow', () => {
			isStopped = true;
		} );

		return showPromise;
	}

	/**
	 * Removes panel from the {@link: #_balloon}.
	 *
	 * @private
	 */
	_hidePanel() {
		if ( this._balloon.hasView( this.toolbarView ) ) {
			this.stopListening( this.editor.editing.view, 'render' );
			this._balloon.remove( this.toolbarView );
		}
	}

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way balloon is attached
	 * to the selection.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPositionData() {
		const editingView = this.editor.editing.view;

		// Get direction of the selection.
		const isBackward = editingView.selection.isBackward;

		// getBoundingClientRect() makes no sense when the selection spans across number
		// of lines of text. Using getClientRects() allows us to browse micro–ranges
		// that would normally make up the bounding client rect.
		const rangeRects = editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ).getClientRects();

		// Select the proper range rect depending on the direction of the selection.
		const rangeRect = isBackward ? rangeRects.item( 0 ) : rangeRects.item( rangeRects.length - 1 );

		return {
			target: rangeRect,
			positions: isBackward ?
				[ defaultPositions.northWestArrowSouth, defaultPositions.southWestArrowNorth ] :
				[ defaultPositions.southEastArrowNorth, defaultPositions.northEastArrowSouth ]
		};
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._fireSelectionChangeDebounced.cancel();
		this.stopListening();
		super.destroy();
	}

	/**
	 * This event is fired just before the toolbar shows.
	 * Using this event, an external code can prevent ContextualToolbar
	 * from being displayed by calling a `stop` function which is passed along with this event.
	 *
	 * @event beforeShow
	 * @param {Function} stop Calling this function prevents panel from being displayed.
	 */

	/**
	 * This is internal plugin event which is fired 200 ms after model selection last change.
	 * This is to makes easy test debounced action without need to use `setTimeout`.
	 *
	 * @protected
	 * @event _selectionChangeDebounced
	 */
}
