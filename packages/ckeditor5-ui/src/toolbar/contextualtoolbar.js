/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/contextualtoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/contextualballoon';
import ToolbarView from './toolbarview';
import BalloonPanelView from '../panel/balloon/balloonpanelview.js';

/**
 * The contextual toolbar.
 *
 * It uses the {@link module:ui/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ContextualToolbar extends Plugin {
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
		 * @member {module:ui/contextualballoon~ContextualBalloon}
		 */
		this._balloon = this.editor.plugins.get( ContextualBalloon );

		// Attach lifecycle actions.
		this._handleSelectionChange();
		this._handleFocusChange();
	}

	/**
	 * Creates toolbar components based on given configuration.
	 * This need to be done when all plugins will be ready.
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
		this.toolbarView.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			if ( this._balloon.visibleView === this.toolbarView && !isFocused ) {
				this._hidePanel();
			}
		} );
	}

	/**
	 * Handles {@link module:core/editor/editor~Editor#editing} selection change
	 * and show or hide toolbar.
	 *
	 * @private
	 */
	_handleSelectionChange() {
		const toolbarView = this.toolbarView;
		const editingView = this.editor.editing.view;

		// Hide panel when selection is changing.
		toolbarView.listenTo( editingView, 'selectionChange', () => this._hidePanel() );

		// Display panel attached to the selection when selection stops changing.
		toolbarView.listenTo( editingView, 'selectionChangeDone', () => this._showPanel() );
	}

	/**
	 * Adds panel view to the {@link: #_balloon} and attaches panel to the selection.
	 *
	 * @private
	 */
	_showPanel() {
		const editingView = this.editor.editing.view;

		// Do not add panel to the balloon stack twice.
		if ( this._balloon.hasView( this.toolbarView ) ) {
			return;
		}

		// This implementation assumes that only non–collapsed selections gets the contextual toolbar.
		if ( !editingView.isFocused || editingView.selection.isCollapsed ) {
			return;
		}

		// Get direction of the selection.
		const isBackward = editingView.selection.isBackward;

		// getBoundingClientRect() makes no sense when the selection spans across number
		// of lines of text. Using getClientRects() allows us to browse micro–ranges
		// that would normally make up the bounding client rect.
		const rangeRects = editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ).getClientRects();

		// Select the proper range rect depending on the direction of the selection.
		const rangeRect = isBackward ? rangeRects.item( 0 ) : rangeRects.item( rangeRects.length - 1 );

		// Add panel to the common editor contextual balloon.
		this._balloon.add( {
			view: this.toolbarView,
			position: {
				target: rangeRect,
				positions: isBackward ?
					[ positions.backwardSelection, positions.backwardSelectionAlternative ] :
					[ positions.forwardSelection, positions.forwardSelectionAlternative ],
			}
		} );

		// Update panel position when editor content has changed.
		this.toolbarView.listenTo( editingView, 'render', () => {
			if ( this._balloon.visibleView === this.toolbarView ) {
				this._balloon.updatePosition();
			}
		} );
	}

	/**
	 * Removes panel from the {@link: #_balloon}.
	 *
	 * @private
	 */
	_hidePanel() {
		if ( this._balloon.hasView( this.toolbarView ) ) {
			this._balloon.remove( this.toolbarView );
			this.toolbarView.stopListening( this.editor.editing.view, 'render' );
		}
	}
}

// List of available toolbar positions.
const arrowVOffset = BalloonPanelView.arrowVerticalOffset;
const positions = {
	//     [text range]
	//                ^
	//       +-----------------+
	//       |     Balloon     |
	//       +-----------------+
	forwardSelection: ( targetRect, balloonRect ) => ( {
		top: targetRect.bottom + arrowVOffset,
		left: targetRect.right - balloonRect.width / 2,
		name: 's'
	} ),

	//       +-----------------+
	//       |     Balloon     |
	//       +-----------------+
	//                V
	//     [text range]
	forwardSelectionAlternative: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - arrowVOffset,
		left: targetRect.right - balloonRect.width / 2,
		name: 'n'
	} ),

	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
	//	        V
	//	        [text range]
	backwardSelection: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - arrowVOffset,
		left: targetRect.left - balloonRect.width / 2,
		name: 'n'
	} ),

	//       [text range]
	//                  ^
	//         +-----------------+
	//         |     Balloon     |
	//         +-----------------+
	backwardSelectionAlternative: ( targetRect, balloonRect ) => ( {
		top: targetRect.bottom + arrowVOffset,
		left: targetRect.left - balloonRect.width / 2,
		name: 's'
	} )
};
