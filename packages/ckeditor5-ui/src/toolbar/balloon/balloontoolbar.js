/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/balloon/balloontoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '../../panel/balloon/contextualballoon';
import ToolbarView from '../toolbarview';
import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import normalizeToolbarConfig from '../normalizetoolbarconfig';
import { debounce } from 'lodash-es';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';

const toPx = toUnit( 'px' );

/**
 * The contextual toolbar.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BalloonToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BalloonToolbar';
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
	constructor( editor ) {
		super( editor );

		/**
		 * A cached and normalized `config.balloonToolbar` object.
		 *
		 * @type {module:core/editor/editorconfig~EditorConfig#balloonToolbar}
		 * @private
		 */
		this._balloonConfig = normalizeToolbarConfig( editor.config.get( 'balloonToolbar' ) );

		/**
		 * The toolbar view displayed in the balloon.
		 *
		 * @type {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbarView = this._createToolbarView();

		/**
		 * Tracks the focus of the {@link module:core/editor/editorui~EditorUI#getEditableElement editable element}
		 * and the {@link #toolbarView}. When both are blurred then the toolbar should hide.
		 *
		 * @readonly
		 * @type {module:utils:focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		// Wait for the EditorUI#init. EditableElement is not available before.
		editor.ui.once( 'ready', () => {
			this.focusTracker.add( editor.ui.getEditableElement() );
			this.focusTracker.add( this.toolbarView.element );
		} );

		/**
		 * An instance of the resize observer that allows to respond to changes in editable's geometry
		 * so the toolbar can stay within its boundaries (and group toolbar items that do not fit).
		 *
		 * **Note**: Used only when `shouldNotGroupWhenFull` was **not** set in the
		 * {@link module:core/editor/editorconfig~EditorConfig#balloonToolbar configuration}.
		 *
		 * **Note:** Created in {@link #init}.
		 *
		 * @protected
		 * @member {module:utils/dom/resizeobserver~ResizeObserver}
		 */
		this._resizeObserver = null;

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @type {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * Fires {@link #event:_selectionChangeDebounced} event using `lodash#debounce`.
		 *
		 * This function is stored as a plugin property to make possible to cancel
		 * trailing debounced invocation on destroy.
		 *
		 * @private
		 * @type {Function}
		 */
		this._fireSelectionChangeDebounced = debounce( () => this.fire( '_selectionChangeDebounced' ), 200 );

		// The appearance of the BalloonToolbar method is event–driven.
		// It is possible to stop the #show event and this prevent the toolbar from showing up.
		this.decorate( 'show' );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		// Show/hide the toolbar on editable focus/blur.
		this.listenTo( this.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			const isToolbarVisible = this._balloon.visibleView === this.toolbarView;

			if ( !isFocused && isToolbarVisible ) {
				this.hide();
			} else if ( isFocused ) {
				this.show();
			}
		} );

		// Hide the toolbar when the selection is changed by a direct change or has changed to collapsed.
		this.listenTo( selection, 'change:range', ( evt, data ) => {
			if ( data.directChange || selection.isCollapsed ) {
				this.hide();
			}

			// Fire internal `_selectionChangeDebounced` event to use it for showing
			// the toolbar after the selection stops changing.
			this._fireSelectionChangeDebounced();
		} );

		// Show the toolbar when the selection stops changing.
		this.listenTo( this, '_selectionChangeDebounced', () => {
			if ( this.editor.editing.view.document.isFocused ) {
				this.show();
			}
		} );

		if ( !this._balloonConfig.shouldNotGroupWhenFull ) {
			this.listenTo( editor, 'ready', () => {
				const editableElement = editor.ui.view.editable.element;

				// Set #toolbarView's max-width on the initialization and update it on the editable resize.
				this._resizeObserver = new ResizeObserver( editableElement, () => {
					// The max-width equals 90% of the editable's width for the best user experience.
					// The value keeps the balloon very close to the boundaries of the editable and limits the cases
					// when the balloon juts out from the editable element it belongs to.
					this.toolbarView.maxWidth = toPx( new Rect( editableElement ).width * .9 );
				} );
			} );
		}

		// Listen to the toolbar view and whenever it changes its geometry due to some items being
		// grouped or ungrouped, update the position of the balloon because a shorter/longer toolbar
		// means the balloon could be pointing at the wrong place. Once updated, the balloon will point
		// at the right selection in the content again.
		// https://github.com/ckeditor/ckeditor5/issues/6444
		this.listenTo( this.toolbarView, 'groupedItemsUpdate', () => {
			this._updatePosition();
		} );
	}

	/**
	 * Creates toolbar components based on given configuration.
	 * This needs to be done when all plugins are ready.
	 *
	 * @inheritDoc
	 */
	afterInit() {
		const factory = this.editor.ui.componentFactory;

		this.toolbarView.fillFromConfig( this._balloonConfig, factory );
	}

	/**
	 * Creates the toolbar view instance.
	 *
	 * @private
	 * @returns {module:ui/toolbar/toolbarview~ToolbarView}
	 */
	_createToolbarView() {
		const shouldGroupWhenFull = !this._balloonConfig.shouldNotGroupWhenFull;
		const toolbarView = new ToolbarView( this.editor.locale, {
			shouldGroupWhenFull,
			isFloating: true
		} );

		toolbarView.render();

		return toolbarView;
	}

	/**
	 * Shows the toolbar and attaches it to the selection.
	 *
	 * Fires {@link #event:show} event which can be stopped to prevent the toolbar from showing up.
	 */
	show() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const schema = editor.model.schema;

		// Do not add the toolbar to the balloon stack twice.
		if ( this._balloon.hasView( this.toolbarView ) ) {
			return;
		}

		// Do not show the toolbar when the selection is collapsed.
		if ( selection.isCollapsed ) {
			return;
		}

		// Do not show the toolbar when there is more than one range in the selection and they fully contain selectable elements.
		// See https://github.com/ckeditor/ckeditor5/issues/6443.
		if ( selectionContainsOnlyMultipleSelectables( selection, schema ) ) {
			return;
		}

		// Don not show the toolbar when all components inside are disabled
		// see https://github.com/ckeditor/ckeditor5-ui/issues/269.
		if ( Array.from( this.toolbarView.items ).every( item => item.isEnabled !== undefined && !item.isEnabled ) ) {
			return;
		}

		// Update the toolbar position when the editor ui should be refreshed.
		this.listenTo( this.editor.ui, 'update', () => {
			this._updatePosition();
		} );

		// Add the toolbar to the common editor contextual balloon.
		this._balloon.add( {
			view: this.toolbarView,
			position: this._getBalloonPositionData(),
			balloonClassName: 'ck-toolbar-container'
		} );
	}

	/**
	 * Hides the toolbar.
	 */
	hide() {
		if ( this._balloon.hasView( this.toolbarView ) ) {
			this.stopListening( this.editor.ui, 'update' );
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
		const view = editor.editing.view;
		const viewDocument = view.document;
		const viewSelection = viewDocument.selection;

		// Get direction of the selection.
		const isBackward = viewDocument.selection.isBackward;

		return {
			// Because the target for BalloonPanelView is a Rect (not DOMRange), it's geometry will stay fixed
			// as the window scrolls. To let the BalloonPanelView follow such Rect, is must be continuously
			// computed and hence, the target is defined as a function instead of a static value.
			// https://github.com/ckeditor/ckeditor5-ui/issues/195
			target: () => {
				const range = isBackward ? viewSelection.getFirstRange() : viewSelection.getLastRange();
				const rangeRects = Rect.getDomRangeRects( view.domConverter.viewRangeToDom( range ) );

				// Select the proper range rect depending on the direction of the selection.
				if ( isBackward ) {
					return rangeRects[ 0 ];
				} else {
					// Ditch the zero-width "orphan" rect in the next line for the forward selection if there's
					// another one preceding it. It is not rendered as a selection by the web browser anyway.
					// https://github.com/ckeditor/ckeditor5-ui/issues/308
					if ( rangeRects.length > 1 && rangeRects[ rangeRects.length - 1 ].width === 0 ) {
						rangeRects.pop();
					}

					return rangeRects[ rangeRects.length - 1 ];
				}
			},
			positions: getBalloonPositions( isBackward )
		};
	}

	/**
	 * Updates the position of the {@link #_balloon} to make up for changes:
	 *
	 * * in the geometry of the selection it is attached to (e.g. the selection moved in the viewport or expanded or shrunk),
	 * * or the geometry of the balloon toolbar itself (e.g. the toolbar has grouped or ungrouped some items and it is shorter or longer).
	 *
	 * @private
	 */
	_updatePosition() {
		this._balloon.updatePosition( this._getBalloonPositionData() );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.stopListening();
		this._fireSelectionChangeDebounced.cancel();
		this.toolbarView.destroy();
		this.focusTracker.destroy();

		if ( this._resizeObserver ) {
			this._resizeObserver.destroy();
		}
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
		defaultPositions.northWestArrowSouthMiddleEast,
		defaultPositions.northWestArrowSouthMiddleWest,
		defaultPositions.southWestArrowNorth,
		defaultPositions.southWestArrowNorthWest,
		defaultPositions.southWestArrowNorthEast,
		defaultPositions.southWestArrowNorthMiddleWest,
		defaultPositions.southWestArrowNorthMiddleEast
	] : [
		defaultPositions.southEastArrowNorth,
		defaultPositions.southEastArrowNorthEast,
		defaultPositions.southEastArrowNorthWest,
		defaultPositions.southEastArrowNorthMiddleEast,
		defaultPositions.southEastArrowNorthMiddleWest,
		defaultPositions.northEastArrowSouth,
		defaultPositions.northEastArrowSouthEast,
		defaultPositions.northEastArrowSouthWest,
		defaultPositions.northEastArrowSouthMiddleEast,
		defaultPositions.northEastArrowSouthMiddleWest
	];
}

// Returns "true" when the selection has multiple ranges and each range contains a selectable element
// and nothing else.
//
// @private
// @param {module:engine/model/selection~Selection} selection
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function selectionContainsOnlyMultipleSelectables( selection, schema ) {
	// It doesn't contain multiple objects if there is only one range.
	if ( selection.rangeCount === 1 ) {
		return false;
	}

	return [ ...selection.getRanges() ].every( range => {
		const element = range.getContainedElement();

		return element && schema.isSelectable( element );
	} );
}

/**
 * Contextual toolbar configuration. Used by the {@link module:ui/toolbar/balloon/balloontoolbar~BalloonToolbar}
 * feature.
 *
 * ## Configuring toolbar items
 *
 *		const config = {
 *			balloonToolbar: [ 'bold', 'italic', 'undo', 'redo' ]
 *		};
 *
 * You can also use `'|'` to create a separator between groups of items:
 *
 *		const config = {
 *			balloonToolbar: [ 'bold', 'italic', | 'undo', 'redo' ]
 *		};
 *
 * Read also about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * ## Configuring items grouping
 *
 * You can prevent automatic items grouping by setting the `shouldNotGroupWhenFull` option:
 *
 *		const config = {
 *			balloonToolbar: {
 *				items: [ 'bold', 'italic', 'undo', 'redo' ],
 *				shouldNotGroupWhenFull: true
 *			},
 *		};
 *
 * @member {Array.<String>|Object} module:core/editor/editorconfig~EditorConfig#balloonToolbar
 */
