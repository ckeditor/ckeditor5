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
import debounce from '@ckeditor/ckeditor5-utils/src/lib/lodash/debounce';

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
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			if ( this._balloon.visibleView === this.toolbarView && !isFocused ) {
				this._hidePanel();
			}
		} );
	}

	/**
	 * Handles {@link modules:engine/model/document#selection} change and show or hide toolbar.
	 *
	 * Note that in this case it's better to listen to {@link modules:engine/model/document modelDocument}
	 * selection instead of {@link modules:engine/view/document viewDocument} selection because the first one
	 * is not fired when text changes styles like bold or italic and toolbar doesn't blink.
	 *
	 * @private
	 */
	_handleSelectionChange() {
		const selection = this.editor.document.selection;

		// This is internal plugin event which is fired 200 ms after selection last change (lodash#debounce).
		// This is to makes easy test debounced action without need to use `setTimeout`.
		// Because lodash keeps time related stuff in a closure it's not possible to override it
		// by sinon fake timers.
		const fireChangeDoneDebounced = debounce( () => this.fire( '_selectionChangeDone' ), 200 );

		this.listenTo( selection, 'change:range', () => {
			// Hide the toolbar when the selection starts changing.
			this._hidePanel();

			// Show the toolbar attached to the selection when the selection stops changing.
			fireChangeDoneDebounced();
		} );

		this.on( '_selectionChangeDone', () => this._showPanel() );
	}

	/**
	 * Adds panel view to the {@link: #_balloon} and attaches panel to the selection.
	 *
	 * @private
	 */
	_showPanel() {
		const editingView = this.editor.editing.view;

		// Do not add toolbar to the balloon stack twice.
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
	}

	/**
	 * Removes panel from the {@link: #_balloon}.
	 *
	 * @private
	 */
	_hidePanel() {
		if ( this._balloon.hasView( this.toolbarView ) ) {
			this._balloon.remove( this.toolbarView );
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
