/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/contextual/contextualtoolbar
 */

import Template from '../../template';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '../../panel/balloon/contextualballoon';
import ToolbarView from '../toolbarview';
import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';
import debounce from '@ckeditor/ckeditor5-utils/src/lib/lodash/debounce';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

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
		return 'ContextualToolbar';
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
		const editor = this.editor;

		/**
		 * The toolbar view displayed in the balloon.
		 *
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbarView = new ToolbarView( editor.locale );

		Template.extend( this.toolbarView.template, {
			attributes: {
				class: [
					'ck-editor-toolbar',
					'ck-toolbar_floating'
				]
			}
		} );

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

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

		// The appearance of the ContextualToolbar method is event–driven.
		// It is possible to stop the #show event and this prevent the toolbar from showing up.
		this.decorate( 'show' );
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

		this.toolbarView.fillFromConfig( config, factory );
	}

	/**
	 * Handles the editor focus change and hides the toolbar if it's needed.
	 *
	 * @private
	 */
	_handleFocusChange() {
		const editor = this.editor;

		// Hide the panel View when editor loses focus but no the other way around.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			if ( this._balloon.visibleView === this.toolbarView && !isFocused ) {
				this.hide();
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
		const editingView = this.editor.editing.view;

		this.listenTo( selection, 'change:range', ( evt, data ) => {
			// When the selection is not changed by a collaboration and when is not collapsed.
			if ( data.directChange || selection.isCollapsed ) {
				// Hide the toolbar when the selection starts changing.
				this.hide();
			}

			// Fire internal `_selectionChangeDebounced` when the selection stops changing.
			this._fireSelectionChangeDebounced();
		} );

		// Hide the toolbar when the selection stops changing.
		this.listenTo( this, '_selectionChangeDebounced', () => {
			// This implementation assumes that only non–collapsed selections gets the contextual toolbar.
			if ( editingView.isFocused && !editingView.selection.isCollapsed ) {
				this.show();
			}
		} );
	}

	/**
	 * Shows the toolbar and attaches it to the selection.
	 *
	 * Fires {@link #event:show} event which can be stopped to prevent the toolbar from showing up.
	 */
	show() {
		// Do not add the toolbar to the balloon stack twice.
		if ( this._balloon.hasView( this.toolbarView ) ) {
			return;
		}

		// Don not show the toolbar when all components inside are disabled
		// see https://github.com/ckeditor/ckeditor5-ui/issues/269.
		if ( Array.from( this.toolbarView.items ).every( item => item.isEnabled !== undefined && !item.isEnabled ) ) {
			return;
		}

		// Update the toolbar position upon #render (e.g. external document changes)
		// while it's visible.
		this.listenTo( this.editor.editing.view, 'render', () => {
			this._balloon.updatePosition( this._getBalloonPositionData() );
		} );

		// Add the toolbar to the common editor contextual balloon.
		this._balloon.add( {
			view: this.toolbarView,
			position: this._getBalloonPositionData(),
			balloonClassName: 'ck-toolbar-container ck-editor-toolbar-container'
		} );
	}

	/**
	 * Hides the toolbar.
	 */
	hide() {
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
		const editor = this.editor;
		const editingView = editor.editing.view;

		// Get direction of the selection.
		const isBackward = editingView.selection.isBackward;

		return {
			// Because the target for BalloonPanelView is a Rect (not DOMRange), it's geometry will stay fixed
			// as the window scrolls. To let the BalloonPanelView follow such Rect, is must be continuously
			// computed and hence, the target is defined as a function instead of a static value.
			// https://github.com/ckeditor/ckeditor5-ui/issues/195
			target: () => {
				const range = editingView.selection.getFirstRange();
				const rangeRects = Rect.getDomRangeRects( editingView.domConverter.viewRangeToDom( range ) );

				// Select the proper range rect depending on the direction of the selection.
				return rangeRects[ isBackward ? 0 : rangeRects.length - 1 ];
			},
			positions: getBalloonPositions( isBackward )
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
	 * This event is fired just before the toolbar shows up. Stopping this event will prevent this.
	 *
	 * @event show
	 */

	/**
	 * This is internal plugin event which is fired 200 ms after model selection last change.
	 * This is to makes easy test debounced action without need to use `setTimeout`.
	 *
	 * @protected
	 * @event _selectionChangeDebounced
	 */
}

// Returns toolbar positions for the given direction of the selection.
//
// @private
// @param {Boolean} isBackward
// @returns {Array.<module:utils/dom/position~Position>}
function getBalloonPositions( isBackward ) {
	const defaultPositions = BalloonPanelView.defaultPositions;

	return isBackward ? [
		defaultPositions.northWestArrowSouth,
		defaultPositions.northWestArrowSouthWest,
		defaultPositions.northWestArrowSouthEast,
		defaultPositions.southWestArrowNorth,
		defaultPositions.southWestArrowNorthWest,
		defaultPositions.southWestArrowNorthEast
	] : [
		defaultPositions.southEastArrowNorth,
		defaultPositions.southEastArrowNorthEast,
		defaultPositions.southEastArrowNorthWest,
		defaultPositions.northEastArrowSouth,
		defaultPositions.northEastArrowSouthEast,
		defaultPositions.northEastArrowSouthWest
	];
}

/**
 * Contextual toolbar configuration. Used by the {@link module:ui/toolbar/contextual/contextualtoolbar~ContextualToolbar}
 * feature.
 *
 *		const config = {
 *			contextualToolbar: [ 'bold', 'italic', 'undo', 'redo' ]
 *		};
 *
 * You can also use `'|'` to create a separator between groups of items:
 *
 *		const config = {
 *			contextualToolbar: [ 'bold', 'italic', | 'undo', 'redo' ]
 *		};
 *
 * Read also about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:core/editor/editorconfig~EditorConfig#contextualToolbar
 */
