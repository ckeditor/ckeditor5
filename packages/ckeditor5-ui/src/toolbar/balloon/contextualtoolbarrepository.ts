/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/balloon/contextualtoolbarrepository
 */

import {
	Plugin,
	type Editor,
	type ToolbarConfigItem
} from '@ckeditor/ckeditor5-core';

import type { ViewDocumentSelection, ViewElement } from '@ckeditor/ckeditor5-engine';

import {
	CKEditorError,
	logWarning,
	type ObservableChangeEvent, Rect,
	type RectSource
} from '@ckeditor/ckeditor5-utils';

import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';
import ContextualBalloon from '../../panel/balloon/contextualballoon.js';
import ToolbarView, { ToolbarOptions } from '../toolbarview.js';
import type { EditorUIUpdateEvent } from '../../editorui/editorui.js';

/**
 * TODO (extracted from WidgetToolbarRepository
 *
 * Widget toolbar repository plugin. A central point for registering widget toolbars. This plugin handles the whole
 * toolbar rendering process and exposes a concise API.
 *
 * To add a toolbar for your widget use the {@link ~WidgetToolbarRepository#register `WidgetToolbarRepository#register()`} method.
 *
 * The following example comes from the {@link module:image/imagetoolbar~ImageToolbar} plugin:
 *
 * ```ts
 * class ImageToolbar extends Plugin {
 * 	static get requires() {
 * 		return [ WidgetToolbarRepository ];
 * 	}
 *
 * 	afterInit() {
 * 		const editor = this.editor;
 * 		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
 *
 * 		widgetToolbarRepository.register( 'image', {
 * 			items: editor.config.get( 'image.toolbar' ),
 * 			getRelatedElement: getClosestSelectedImageWidget
 * 		} );
 * 	}
 * }
 * ```
 */
export default class ContextualToolbarRepository extends Plugin {
	/**
	 * A map of toolbar definitions.
	 */
	private _toolbarDefinitions = new Map<string, ContextualToolbarDefinition>();

	// private _currentToolbarDefinition

	private _balloon!: ContextualBalloon;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ContextualToolbarRepository' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		this.on<ObservableChangeEvent>( 'change:isEnabled', () => {
			this._updateToolbarsVisibility();
		} );

		this.listenTo<EditorUIUpdateEvent>( editor.ui, 'update', () => {
			this._updateToolbarsVisibility();
		} );

		// UI#update is not fired after focus is back in editor, we need to check if balloon panel should be visible.
		this.listenTo<ObservableChangeEvent>( editor.ui.focusTracker, 'change:isFocused', () => {
			this._updateToolbarsVisibility();
		}, { priority: 'low' } );
	}

	public override destroy(): void {
		super.destroy();

		for ( const toolbarConfig of this._toolbarDefinitions.values() ) {
			toolbarConfig.view.destroy();
		}
	}

	/**
	 * TODO
	 *
	 * Registers toolbar in the WidgetToolbarRepository. It renders it in the `ContextualBalloon` based on the value of the invoked
	 * `getRelatedElement` function. Toolbar items are gathered from `items` array.
	 * The balloon's CSS class is by default `ck-toolbar-container` and may be override with the `balloonClassName` option.
	 *
	 * Note: This method should be called in the {@link module:core/plugin~PluginInterface#afterInit `Plugin#afterInit()`}
	 * callback (or later) to make sure that the given toolbar items were already registered by other plugins.
	 *
	 * @param toolbarId An id for the toolbar. Used to
	 * @param options.ariaLabel Label used by assistive technologies to describe this toolbar element.
	 * @param options.items Array of toolbar items.
	 * @param options.toolbarOptions TODO
	 * @param options.getRelatedTarget Callback which returns an element the toolbar should be attached to. TODO
	 * @param options.balloonClassName CSS class for the widget balloon.
	 */
	public register(
		toolbarId: string,
		{
			ariaLabel,
			items,
			removeItems,
			toolbarOptions,
			getRelatedTarget,
			balloonClassName = 'ck-toolbar-container'
		}: {
			ariaLabel?: string;
			items: Array<ToolbarConfigItem>;
			removeItems?: Array<string>;
			toolbarOptions?: ToolbarOptions;
			getRelatedTarget: ( selection: ViewDocumentSelection ) => ( RectSource | ( () => RectSource ) | null );
			balloonClassName?: string;
		}
	): ToolbarView {
		const editor = this.editor;
		const t = editor.t;
		const toolbarView = new ToolbarView( editor.locale, toolbarOptions );

		toolbarView.ariaLabel = ariaLabel || t( 'Contextual toolbar' ); // TODO add to context.json

		// Trying to register a toolbar without any item.
		if ( !items.length ) {
			/**
			 * TODO
			 *
			 * When {@link module:widget/widgettoolbarrepository~WidgetToolbarRepository#register registering} a new widget toolbar, you
			 * need to provide a non-empty array with the items that will be inserted into the toolbar.
			 *
			 * If you see this error when integrating the editor, you likely forgot to configure one of the widget toolbars.
			 *
			 * See for instance:
			 *
			 * * {@link module:table/tableconfig~TableConfig#contentToolbar `config.table.contentToolbar`}
			 * * {@link module:image/imageconfig~ImageConfig#toolbar `config.image.toolbar`}
			 *
			 * @error widget-toolbar-no-items
			 * @param toolbarId The id of the toolbar that has not been configured correctly.
			 */
			logWarning( 'widget-toolbar-no-items', { toolbarId } );

			return toolbarView;
		}

		if ( this._toolbarDefinitions.has( toolbarId ) ) {
			/**
			 * TODO
			 *
			 * Toolbar with the given id was already added.
			 *
			 * @error widget-toolbar-duplicated
			 * @param toolbarId Toolbar id.
			 */
			throw new CKEditorError( 'widget-toolbar-duplicated', this, { toolbarId } );
		}

		const toolbarDefinition = {
			view: toolbarView,
			getRelatedTarget,
			balloonClassName,
			itemsConfig: items,
			initialized: false
		};

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		editor.ui.addToolbar( toolbarView, {
			isContextual: true,
			beforeFocus: () => {
				const relatedTarget = getRelatedTarget( editor.editing.view.document.selection );

				if ( relatedTarget ) {
					this._showToolbar( toolbarDefinition, relatedTarget );
				}
			},
			afterBlur: () => {
				this._hideToolbar( toolbarDefinition );
			}
		} );

		this._toolbarDefinitions.set( toolbarId, toolbarDefinition );

		return toolbarView;
	}

	/**
	 * Iterates over stored toolbars and makes them visible or hidden.
	 */
	private _updateToolbarsVisibility() {
		let maxRelatedElementDepth = 0;
		let deepestRelatedElement = null;
		let deepestToolbarDefinition = null;

		for ( const definition of this._toolbarDefinitions.values() ) {
			const relatedTarget = definition.getRelatedTarget( this.editor.editing.view.document.selection );

			if ( !this.isEnabled || !relatedTarget ) {
				if ( this._isToolbarInBalloon( definition ) ) {
					this._hideToolbar( definition );
				}
			} else if ( !this.editor.ui.focusTracker.isFocused ) {
				if ( this._isToolbarVisible( definition ) ) {
					this._hideToolbar( definition );
				}
			} else {
				// TODO find a better way, now it works by accident.
				const relatedElementDepth = 1; // relatedTarget.getAncestors().length;

				// Many toolbars can express willingness to be displayed but they do not know about
				// each other. Figure out which toolbar is deepest in the view tree to decide which
				// should be displayed. For instance, if a selected image is inside a table cell, display
				// the ImageToolbar rather than the TableToolbar (#60).
				if ( relatedElementDepth > maxRelatedElementDepth ) {
					maxRelatedElementDepth = relatedElementDepth;
					deepestRelatedElement = relatedTarget;
					deepestToolbarDefinition = definition;
				}
			}
		}

		if ( deepestToolbarDefinition ) {
			this._showToolbar( deepestToolbarDefinition, deepestRelatedElement! );
		}
	}

	/**
	 * Hides the given toolbar.
	 */
	private _hideToolbar( toolbarDefinition: ContextualToolbarDefinition ) {
		this._balloon.remove( toolbarDefinition.view );
		this.stopListening( this._balloon, 'change:visibleView' );
	}

	/**
	 * Shows up the toolbar if the toolbar is not visible.
	 * Otherwise, repositions the toolbar's balloon when toolbar's view is the most top view in balloon stack.
	 *
	 * It might happen here that the toolbar's view is under another view. Then do nothing as the other toolbar view
	 * should be still visible after the {@link module:ui/editorui/editorui~EditorUI#event:update}.
	 */
	private _showToolbar(
		toolbarDefinition: ContextualToolbarDefinition,
		relatedTarget: RectSource | ( () => RectSource )
	) {
		if ( this._isToolbarVisible( toolbarDefinition ) ) {
			repositionContextualBalloon( this.editor, relatedTarget );
		} else if ( !this._isToolbarInBalloon( toolbarDefinition ) ) {
			if ( !toolbarDefinition.initialized ) {
				toolbarDefinition.initialized = true;
				toolbarDefinition.view.fillFromConfig( toolbarDefinition.itemsConfig, this.editor.ui.componentFactory );
			}

			this._balloon.add( {
				view: toolbarDefinition.view,
				position: getBalloonPositionData( this.editor, relatedTarget ),
				balloonClassName: toolbarDefinition.balloonClassName
			} );

			// Update toolbar position each time stack with toolbar view is switched to visible.
			// This is in a case target element has changed when toolbar was in invisible stack
			// e.g. target image was wrapped by a block quote.
			// See https://github.com/ckeditor/ckeditor5-widget/issues/92.
			this.listenTo<ObservableChangeEvent>( this._balloon, 'change:visibleView', () => {
				for ( const definition of this._toolbarDefinitions.values() ) {
					if ( this._isToolbarVisible( definition ) ) {
						const selection = this.editor.editing.view.document.selection;
						const relatedTarget = definition.getRelatedTarget( selection );

						repositionContextualBalloon( this.editor, relatedTarget! );
					}
				}
			} );
		}
	}

	private _isToolbarVisible( toolbar: ContextualToolbarDefinition ) {
		return this._balloon.visibleView === toolbar.view;
	}

	private _isToolbarInBalloon( toolbar: ContextualToolbarDefinition ) {
		return this._balloon.hasView( toolbar.view );
	}
}

function repositionContextualBalloon( editor: Editor, relatedTarget: RectSource | ( () => RectSource ) ) {
	const balloon: ContextualBalloon = editor.plugins.get( 'ContextualBalloon' );
	const position = getBalloonPositionData( editor, relatedTarget );

	balloon.updatePosition( position );
}

function getBalloonPositionData( editor: Editor, relatedTarget: RectSource | ( () => RectSource ) ) {
	const defaultPositions = BalloonPanelView.defaultPositions;

	return {
		target: relatedTarget,
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast,
			defaultPositions.viewportStickyNorth
		]
	};
}

/**
 * The toolbar definition object used by the toolbar repository to manage toolbars.
 * It contains information necessary to display the toolbar in the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} and
 * update it during its life (display) cycle.
 */
interface ContextualToolbarDefinition {

	/**
	 * The UI view of the toolbar.
	 */
	view: ToolbarView;

	/**
	 * TODO
	 *
	 * A function that returns an engine {@link module:engine/view/view~View}
	 * element the toolbar is to be attached to. For instance, an image widget or a table widget (or `null` when
	 * there is no such element). The function accepts an instance of {@link module:engine/view/selection~Selection}.
	 */
	getRelatedTarget: ( selection: ViewDocumentSelection ) => RectSource | ( () => RectSource ) | null | undefined;

	/**
	 * CSS class for the widget balloon when a toolbar is displayed.
	 */
	balloonClassName: string;

	itemsConfig: Array<ToolbarConfigItem>;

	initialized: boolean;
}
