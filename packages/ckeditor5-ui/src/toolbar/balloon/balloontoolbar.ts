/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/toolbar/balloon/balloontoolbar
 */

import ContextualBalloon from '../../panel/balloon/contextualballoon.js';
import ToolbarView, { type ToolbarViewGroupedItemsUpdateEvent } from '../toolbarview.js';
import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';
import normalizeToolbarConfig from '../normalizetoolbarconfig.js';

import type {
	EditorUIReadyEvent,
	EditorUIUpdateEvent
} from '../../editorui/editorui.js';

import {
	Plugin,
	type Editor,
	type EditorReadyEvent
} from '@ckeditor/ckeditor5-core';

import {
	FocusTracker,
	Rect,
	ResizeObserver,
	env,
	global,
	toUnit,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import {
	Observer,
	type DocumentSelection,
	type DocumentSelectionChangeRangeEvent,
	type Schema
} from '@ckeditor/ckeditor5-engine';

import { debounce, type DebouncedFunction } from 'es-toolkit/compat';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * The contextual toolbar.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export default class BalloonToolbar extends Plugin {
	/**
	 * The toolbar view displayed in the balloon.
	 */
	public readonly toolbarView: ToolbarView;

	/**
	 * Tracks the focus of the {@link module:ui/editorui/editorui~EditorUI#getEditableElement editable element}
	 * and the {@link #toolbarView}. When both are blurred then the toolbar should hide.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * A cached and normalized `config.balloonToolbar` object.
	 */
	private _balloonConfig: ReturnType<typeof normalizeToolbarConfig>;

	/**
	 * An instance of the resize observer that allows to respond to changes in editable's geometry
	 * so the toolbar can stay within its boundaries (and group toolbar items that do not fit).
	 *
	 * **Note**: Used only when `shouldNotGroupWhenFull` was **not** set in the
	 * {@link module:core/editor/editorconfig~EditorConfig#balloonToolbar configuration}.
	 *
	 * **Note:** Created in {@link #init}.
	 */
	private _resizeObserver: ResizeObserver | null = null;

	/**
	 * The contextual balloon plugin instance.
	 */
	private readonly _balloon: ContextualBalloon;

	/**
	 * Fires `_selectionChangeDebounced` event using `es-toolkit#debounce`.
	 *
	 * This event is an internal plugin event which is fired 200 ms after model selection last change.
	 * This is to makes easy test debounced action without need to use `setTimeout`.
	 *
	 * This function is stored as a plugin property to make possible to cancel
	 * trailing debounced invocation on destroy.
	 */
	private readonly _fireSelectionChangeDebounced: DebouncedFunction<() => unknown>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BalloonToolbar' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon ] as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._balloonConfig = normalizeToolbarConfig( editor.config.get( 'balloonToolbar' ) );
		this.toolbarView = this._createToolbarView();
		this.focusTracker = new FocusTracker();

		// Track focusable elements in the toolbar and the editable elements.
		this._trackFocusableEditableElements();
		this.focusTracker.add( this.toolbarView );

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		editor.ui.addToolbar( this.toolbarView, {
			beforeFocus: () => this.show( true ),
			afterBlur: () => this.hide(),
			isContextual: true
		} );

		this._balloon = editor.plugins.get( ContextualBalloon );
		this._fireSelectionChangeDebounced = debounce( () => this.fire( '_selectionChangeDebounced' ), 200 );

		// The appearance of the BalloonToolbar method is event–driven.
		// It is possible to stop the #show event and this prevent the toolbar from showing up.
		this.decorate( 'show' );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		// Show/hide the toolbar on editable focus/blur.
		this.listenTo<ObservableChangeEvent<boolean>>( this.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			const isToolbarVisible = this._balloon.visibleView === this.toolbarView;

			if ( !isFocused && isToolbarVisible ) {
				this.hide();
			} else if ( isFocused ) {
				this.show();
			}
		} );

		// Hide the toolbar when the selection is changed by a direct change or has changed to collapsed.
		this.listenTo<DocumentSelectionChangeRangeEvent>( selection, 'change:range', ( evt, data ) => {
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
			this.listenTo<EditorReadyEvent>( editor, 'ready', () => {
				const editableElement = editor.ui.view.editable.element!;

				// Set #toolbarView's max-width on the initialization and update it on the editable resize.
				this._resizeObserver = new ResizeObserver( editableElement, entry => {
					// The max-width equals 90% of the editable's width for the best user experience.
					// The value keeps the balloon very close to the boundaries of the editable and limits the cases
					// when the balloon juts out from the editable element it belongs to.
					this.toolbarView.maxWidth = toPx( entry.contentRect.width * .9 );
				} );
			} );
		}

		// Listen to the toolbar view and whenever it changes its geometry due to some items being
		// grouped or ungrouped, update the position of the balloon because a shorter/longer toolbar
		// means the balloon could be pointing at the wrong place. Once updated, the balloon will point
		// at the right selection in the content again.
		// https://github.com/ckeditor/ckeditor5/issues/6444
		this.listenTo<ToolbarViewGroupedItemsUpdateEvent>( this.toolbarView, 'groupedItemsUpdate', () => {
			this._updatePosition();
		} );

		// Creates toolbar components based on given configuration.
		// This needs to be done when all plugins are ready.
		editor.ui.once<EditorUIReadyEvent>( 'ready', () => {
			this.toolbarView.fillFromConfig( this._balloonConfig, this.editor.ui.componentFactory );
		} );
	}

	/**
	 * Creates the toolbar view instance.
	 */
	private _createToolbarView() {
		const t = this.editor.locale.t;
		const shouldGroupWhenFull = !this._balloonConfig.shouldNotGroupWhenFull;
		const toolbarView = new ToolbarView( this.editor.locale, {
			shouldGroupWhenFull,
			isFloating: true
		} );

		toolbarView.ariaLabel = t( 'Editor contextual toolbar' );
		toolbarView.render();

		return toolbarView;
	}

	/**
	 * Shows the toolbar and attaches it to the selection.
	 *
	 * Fires {@link #event:show} event which can be stopped to prevent the toolbar from showing up.
	 *
	 * @param showForCollapsedSelection When set `true`, the toolbar will show despite collapsed selection in the
	 * editing view.
	 */
	public show( showForCollapsedSelection: boolean = false ): void {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const schema = editor.model.schema;

		// Do not add the toolbar to the balloon stack twice.
		if ( this._balloon.hasView( this.toolbarView ) ) {
			return;
		}

		// Do not show the toolbar when the selection is collapsed.
		if ( selection.isCollapsed && !showForCollapsedSelection ) {
			return;
		}

		// Do not show the toolbar when there is more than one range in the selection and they fully contain selectable elements.
		// See https://github.com/ckeditor/ckeditor5/issues/6443.
		if ( selectionContainsOnlyMultipleSelectables( selection, schema ) ) {
			return;
		}

		// Do not show the toolbar when all components inside are disabled
		// see https://github.com/ckeditor/ckeditor5-ui/issues/269.
		if ( Array.from( this.toolbarView.items ).every( ( item: any ) => item.isEnabled !== undefined && !item.isEnabled ) ) {
			return;
		}

		// Update the toolbar position when the editor ui should be refreshed.
		this.listenTo<EditorUIUpdateEvent>( this.editor.ui, 'update', () => {
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
	public hide(): void {
		if ( this._balloon.hasView( this.toolbarView ) ) {
			this.stopListening( this.editor.ui, 'update' );
			this._balloon.remove( this.toolbarView );
		}
	}

	/**
	 * Add or remove editable elements to the focus tracker. It watches added and removed roots
	 * and adds or removes their editable elements to the focus tracker.
	 */
	private _trackFocusableEditableElements() {
		const { editor, focusTracker } = this;
		const { editing } = editor;

		editing.view.addObserver( class TrackEditableElements extends Observer {
			/**
			 * @inheritDoc
			 */
			public observe( domElement: HTMLElement ) {
				focusTracker.add( domElement );
			}

			/**
			 * @inheritDoc
			 */
			public stopObserving( domElement: HTMLElement ) {
				focusTracker.remove( domElement );
			}
		} );
	}

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way balloon is attached
	 * to the selection.
	 */
	private _getBalloonPositionData() {
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
				const rangeRects = Rect.getDomRangeRects( view.domConverter.viewRangeToDom( range! ) );

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
			positions: this._getBalloonPositions( isBackward )
		};
	}

	/**
	 * Updates the position of the {@link #_balloon} to make up for changes:
	 *
	 * * in the geometry of the selection it is attached to (e.g. the selection moved in the viewport or expanded or shrunk),
	 * * or the geometry of the balloon toolbar itself (e.g. the toolbar has grouped or ungrouped some items and it is shorter or longer).
	 */
	private _updatePosition() {
		this._balloon.updatePosition( this._getBalloonPositionData() );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
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
	 * Returns toolbar positions for the given direction of the selection.
	 */
	private _getBalloonPositions( isBackward: boolean ) {
		const isSafariIniOS = env.isSafari && env.isiOS;

		// https://github.com/ckeditor/ckeditor5/issues/7707
		const positions = isSafariIniOS ? BalloonPanelView.generatePositions( {
			// 20px when zoomed out. Less then 20px when zoomed in; the "radius" of the native selection handle gets
			// smaller as the user zooms in. No less than the default v-offset, though.
			heightOffset: Math.max(
				BalloonPanelView.arrowHeightOffset,
				Math.round( 20 / global.window.visualViewport!.scale )
			)
		} ) : BalloonPanelView.defaultPositions;

		return isBackward ? [
			positions.northWestArrowSouth,
			positions.northWestArrowSouthWest,
			positions.northWestArrowSouthEast,
			positions.northWestArrowSouthMiddleEast,
			positions.northWestArrowSouthMiddleWest,
			positions.southWestArrowNorth,
			positions.southWestArrowNorthWest,
			positions.southWestArrowNorthEast,
			positions.southWestArrowNorthMiddleWest,
			positions.southWestArrowNorthMiddleEast
		] : [
			positions.southEastArrowNorth,
			positions.southEastArrowNorthEast,
			positions.southEastArrowNorthWest,
			positions.southEastArrowNorthMiddleEast,
			positions.southEastArrowNorthMiddleWest,
			positions.northEastArrowSouth,
			positions.northEastArrowSouthEast,
			positions.northEastArrowSouthWest,
			positions.northEastArrowSouthMiddleEast,
			positions.northEastArrowSouthMiddleWest
		];
	}
}

/**
 * Returns "true" when the selection has multiple ranges and each range contains a selectable element
 * and nothing else.
 */
function selectionContainsOnlyMultipleSelectables( selection: DocumentSelection, schema: Schema ) {
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
 * This event is fired just before the toolbar shows up. Stopping this event will prevent this.
 *
 * @eventName ~BalloonToolbar#show
 */
export type BalloonToolbarShowEvent = {
	name: 'show';
	args: [];
};
