/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/contextualtoolbar
 */

import BalloonPanelView from '../panel/balloon/balloonpanelview';
import ToolbarView from './toolbarview';

/**
 * The contextual toolbar. This class displays given editor components
 * inside a panel attached to the selection.
 *
 * Panel is displayed using {@link module:core/editor/editorui~EditorUI#balloon}.
 */
export default class ContextualToolbar {
	/**
	 * Creates an instance of the contextual toolbar class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 */
	constructor( editor ) {
		/**
		 * Editor that the UI belongs to.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor} #editor
		 */
		this.editor = editor;

		/**
		 * Panel content.
		 *
		 * @private
		 * @member {module:ui/toolbar/toolbarview~ToolbarView} #_toolbarView
		 */
		this._toolbarView = new ToolbarView( this.editor.locale );

		// Handle editor action and show or hide toolbar.
		this._handleSelectionChange();
		this._handleFocusChange();
	}

	/**
	 * Adds editor component to the contextual toolbar.
	 *
	 * @param {Array<String>} components List of the toolbar components.
	 * @param {module:ui/componentfactory~ComponentFactory} [factory=core/editor/editorui#componentFactory]
	 * A factory producing toolbar items.
	 */
	addComponents( components, factory = this.editor.ui.componentFactory ) {
		this._toolbarView.fillFromConfig( components, factory );
	}

	/**
	 * Returns true when contextual toolbar panel is currently visible
	 * in {@link module:core/editor/editorui~EditorUI#balloon}.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	get _isVisible() {
		const balloon = this.editor.ui.balloon;

		return balloon.visible && balloon.visible.view === this._toolbarView;
	}

	/**
	 * Handles editor focus change and hides panel if it's needed.
	 *
	 * @protected
	 */
	_handleFocusChange() {
		const editor = this.editor;

		// Hide the panel View when editor loses focus but no the other way around.
		this._toolbarView.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			if ( this._isVisible &&  !isFocused ) {
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
		const toolbarView = this._toolbarView;
		const editingView = this.editor.editing.view;

		// Hide panel when selection is changing.
		toolbarView.listenTo( editingView, 'selectionChange', () => this._hidePanel() );

		// Display panel attached to the selection when selection stops changing.
		toolbarView.listenTo( editingView, 'selectionChangeDone', () => this._showPanel() );
	}

	/**
	 * Adds panel view to the {@link: core/editor/editorui~EditorUI#balloon} and attaches panel to the selection.
	 *
	 * @private
	 */
	_showPanel() {
		const editingView = this.editor.editing.view;
		const balloon = this.editor.ui.balloon;

		// Do not add panel to the balloon stack twice.
		if ( balloon.isPanelInStack( this._toolbarView ) ) {
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
		balloon.add( {
			view: this._toolbarView,
			position: {
				target: rangeRect,
				positions: isBackward ?
					[ positions.backwardSelection, positions.backwardSelectionAlternative ] :
					[ positions.forwardSelection, positions.forwardSelectionAlternative ],
			}
		} );

		// Update panel position when editor content has changed.
		this._toolbarView.listenTo( editingView, 'render', () => {
			if ( this._isVisible ) {
				balloon.updatePosition();
			}
		} );
	}

	/**
	 * Removes panel from the {@link: core/editor/editorui~EditorUI#balloon}.
	 *
	 * @private
	 */
	_hidePanel() {
		const balloon = this.editor.ui.balloon;

		if ( balloon.isPanelInStack( this._toolbarView ) ) {
			balloon.remove( this._toolbarView );
			this._toolbarView.stopListening( this.editor.editing.view, 'render' );
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
