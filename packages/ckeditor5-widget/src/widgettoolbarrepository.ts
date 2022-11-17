/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgettoolbarrepository
 */

import {
	Plugin,
	type Editor,
	type EditorUIUpdateEvent,
	type PluginDependencies,
	type ToolbarConfigItem
} from '@ckeditor/ckeditor5-core';

import type { ViewDocumentSelection, ViewElement } from '@ckeditor/ckeditor5-engine';

import {
	BalloonPanelView,
	ContextualBalloon,
	ToolbarView,
	type BaloonToolbarShowEvent,
	type View
} from '@ckeditor/ckeditor5-ui';

import {
	CKEditorError,
	logWarning,
	type ObservableChangeEvent,
	type RectSource
} from '@ckeditor/ckeditor5-utils';

import { isWidget } from './utils';

/**
 * Widget toolbar repository plugin. A central point for registering widget toolbars. This plugin handles the whole
 * toolbar rendering process and exposes a concise API.
 *
 * To add a toolbar for your widget use the {@link ~WidgetToolbarRepository#register `WidgetToolbarRepository#register()`} method.
 *
 * The following example comes from the {@link module:image/imagetoolbar~ImageToolbar} plugin:
 *
 * 		class ImageToolbar extends Plugin {
 *			static get requires() {
 *				return [ WidgetToolbarRepository ];
 *			}
 *
 *			afterInit() {
 *				const editor = this.editor;
 *				const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
 *
 *				widgetToolbarRepository.register( 'image', {
 *					items: editor.config.get( 'image.toolbar' ),
 *					getRelatedElement: getClosestSelectedImageWidget
 *				} );
 *			}
 *		}
 */
export default class WidgetToolbarRepository extends Plugin {
	private _toolbarDefinitions!: Map<string, WidgetRepositoryToolbarDefinition>;
	private _balloon!: ContextualBalloon;

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'WidgetToolbarRepository' {
		return 'WidgetToolbarRepository';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Disables the default balloon toolbar for all widgets.
		if ( editor.plugins.has( 'BalloonToolbar' ) ) {
			const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

			this.listenTo<BaloonToolbarShowEvent>( balloonToolbar, 'show', evt => {
				if ( isWidgetSelected( editor.editing.view.document.selection ) ) {
					evt.stop();
				}
			}, { priority: 'high' } );
		}

		/**
		 * A map of toolbar definitions.
		 *
		 * @protected
		 * @member {Map.<String,module:widget/widgettoolbarrepository~WidgetRepositoryToolbarDefinition>} #_toolbarDefinitions
		 */
		this._toolbarDefinitions = new Map();

		/**
		 * @private
		 */
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
	 * Registers toolbar in the WidgetToolbarRepository. It renders it in the `ContextualBalloon` based on the value of the invoked
	 * `getRelatedElement` function. Toolbar items are gathered from `items` array.
	 * The balloon's CSS class is by default `ck-toolbar-container` and may be override with the `balloonClassName` option.
	 *
	 * Note: This method should be called in the {@link module:core/plugin~PluginInterface#afterInit `Plugin#afterInit()`}
	 * callback (or later) to make sure that the given toolbar items were already registered by other plugins.
	 *
	 * @param {String} toolbarId An id for the toolbar. Used to
	 * @param {Object} options
	 * @param {String} [options.ariaLabel] Label used by assistive technologies to describe this toolbar element.
	 * @param {Array.<String>} options.items Array of toolbar items.
	 * @param {Function} options.getRelatedElement Callback which returns an element the toolbar should be attached to.
	 * @param {String} [options.balloonClassName='ck-toolbar-container'] CSS class for the widget balloon.
	 */
	public register(
		toolbarId: string,
		{ ariaLabel, items, getRelatedElement, balloonClassName = 'ck-toolbar-container' }: {
			ariaLabel?: string;
			items: Array<ToolbarConfigItem>;
			getRelatedElement: ( selection: ViewDocumentSelection ) => ViewElement;
			balloonClassName?: string;
		}
	): void {
		// Trying to register a toolbar without any item.
		if ( !items.length ) {
			/**
			 * When {@link #register registering} a new widget toolbar, you need to provide a non-empty array with
			 * the items that will be inserted into the toolbar.
			 *
			 * If you see this error when integrating the editor, you likely forgot to configure one of the widget toolbars.
			 *
			 * See for instance:
			 *
			 * * {@link module:table/table~TableConfig#contentToolbar `config.table.contentToolbar`}
			 * * {@link module:image/image~ImageConfig#toolbar `config.image.toolbar`}
			 *
			 * @error widget-toolbar-no-items
			 * @param {String} toolbarId The id of the toolbar that has not been configured correctly.
			 */
			logWarning( 'widget-toolbar-no-items', { toolbarId } );

			return;
		}

		const editor = this.editor;
		const t = editor.t;
		const toolbarView = new ToolbarView( editor.locale );

		toolbarView.ariaLabel = ariaLabel || t( 'Widget toolbar' );

		if ( this._toolbarDefinitions.has( toolbarId ) ) {
			/**
			 * Toolbar with the given id was already added.
			 *
			 * @error widget-toolbar-duplicated
			 * @param toolbarId Toolbar id.
			 */
			throw new CKEditorError( 'widget-toolbar-duplicated', this, { toolbarId } );
		}

		toolbarView.fillFromConfig( items, editor.ui.componentFactory );

		const toolbarDefinition = {
			view: toolbarView,
			getRelatedElement,
			balloonClassName
		};

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		editor.ui.addToolbar( toolbarView, {
			isContextual: true,
			beforeFocus: () => {
				const relatedElement = getRelatedElement( editor.editing.view.document.selection );

				if ( relatedElement ) {
					this._showToolbar( toolbarDefinition, relatedElement );
				}
			},
			afterBlur: () => {
				this._hideToolbar( toolbarDefinition );
			}
		} );

		this._toolbarDefinitions.set( toolbarId, toolbarDefinition );
	}

	/**
	 * Iterates over stored toolbars and makes them visible or hidden.
	 *
	 * @private
	 */
	private _updateToolbarsVisibility() {
		let maxRelatedElementDepth = 0;
		let deepestRelatedElement = null;
		let deepestToolbarDefinition = null;

		for ( const definition of this._toolbarDefinitions.values() ) {
			const relatedElement = definition.getRelatedElement( this.editor.editing.view.document.selection );

			if ( !this.isEnabled || !relatedElement ) {
				if ( this._isToolbarInBalloon( definition ) ) {
					this._hideToolbar( definition );
				}
			} else if ( !this.editor.ui.focusTracker.isFocused ) {
				if ( this._isToolbarVisible( definition ) ) {
					this._hideToolbar( definition );
				}
			} else {
				const relatedElementDepth = relatedElement.getAncestors().length;

				// Many toolbars can express willingness to be displayed but they do not know about
				// each other. Figure out which toolbar is deepest in the view tree to decide which
				// should be displayed. For instance, if a selected image is inside a table cell, display
				// the ImageToolbar rather than the TableToolbar (#60).
				if ( relatedElementDepth > maxRelatedElementDepth ) {
					maxRelatedElementDepth = relatedElementDepth;
					deepestRelatedElement = relatedElement;
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
	 *
	 * @private
	 * @param {module:widget/widgettoolbarrepository~WidgetRepositoryToolbarDefinition} toolbarDefinition
	 */
	private _hideToolbar( toolbarDefinition: WidgetRepositoryToolbarDefinition ) {
		this._balloon.remove( toolbarDefinition.view );
		this.stopListening( this._balloon, 'change:visibleView' );
	}

	/**
	 * Shows up the toolbar if the toolbar is not visible.
	 * Otherwise, repositions the toolbar's balloon when toolbar's view is the most top view in balloon stack.
	 *
	 * It might happen here that the toolbar's view is under another view. Then do nothing as the other toolbar view
	 * should be still visible after the {@link module:core/editor/editorui~EditorUI#event:update}.
	 *
	 * @private
	 * @param {module:widget/widgettoolbarrepository~WidgetRepositoryToolbarDefinition} toolbarDefinition
	 * @param {module:engine/view/element~Element} relatedElement
	 */
	private _showToolbar( toolbarDefinition: WidgetRepositoryToolbarDefinition, relatedElement: ViewElement ) {
		if ( this._isToolbarVisible( toolbarDefinition ) ) {
			repositionContextualBalloon( this.editor, relatedElement );
		} else if ( !this._isToolbarInBalloon( toolbarDefinition ) ) {
			this._balloon.add( {
				view: toolbarDefinition.view,
				position: getBalloonPositionData( this.editor, relatedElement ),
				balloonClassName: toolbarDefinition.balloonClassName
			} );

			// Update toolbar position each time stack with toolbar view is switched to visible.
			// This is in a case target element has changed when toolbar was in invisible stack
			// e.g. target image was wrapped by a block quote.
			// See https://github.com/ckeditor/ckeditor5-widget/issues/92.
			this.listenTo<ObservableChangeEvent>( this._balloon, 'change:visibleView', () => {
				for ( const definition of this._toolbarDefinitions.values() ) {
					if ( this._isToolbarVisible( definition ) ) {
						const relatedElement = definition.getRelatedElement( this.editor.editing.view.document.selection );
						repositionContextualBalloon( this.editor, relatedElement! );
					}
				}
			} );
		}
	}

	/**
	 * @private
	 * @param {Object} toolbar
	 * @returns {Boolean}
	 */
	private _isToolbarVisible( toolbar: WidgetRepositoryToolbarDefinition ) {
		return this._balloon.visibleView === toolbar.view;
	}

	/**
	 * @private
	 * @param {Object} toolbar
	 * @returns {Boolean}
	 */
	private _isToolbarInBalloon( toolbar: WidgetRepositoryToolbarDefinition ) {
		return this._balloon.hasView( toolbar.view );
	}
}

function repositionContextualBalloon( editor: Editor, relatedElement: ViewElement ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );
	const position = getBalloonPositionData( editor, relatedElement );

	balloon.updatePosition( position );
}

function getBalloonPositionData( editor: Editor, relatedElement: ViewElement ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;

	return {
		target: editingView.domConverter.mapViewToDom( relatedElement ) as RectSource | undefined,
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

function isWidgetSelected( selection: ViewDocumentSelection ) {
	const viewElement = selection.getSelectedElement();

	return !!( viewElement && isWidget( viewElement ) );
}

/**
 * The toolbar definition object used by the toolbar repository to manage toolbars.
 * It contains information necessary to display the toolbar in the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} and
 * update it during its life (display) cycle.
 *
 * @typedef {Object} module:widget/widgettoolbarrepository~WidgetRepositoryToolbarDefinition
 *
 * @property {module:ui/view~View} view The UI view of the toolbar.
 * @property {Function} getRelatedElement A function that returns an engine {@link module:engine/view/view~View}
 * element the toolbar is to be attached to. For instance, an image widget or a table widget (or `null` when
 * there is no such element). The function accepts an instance of {@link module:engine/view/selection~Selection}.
 * @property {String} balloonClassName CSS class for the widget balloon when a toolbar is displayed.
 */
interface WidgetRepositoryToolbarDefinition {
	view: View;
	getRelatedElement: ( selection: ViewDocumentSelection ) => ViewElement | null | undefined;
	balloonClassName: string;
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ WidgetToolbarRepository.pluginName ]: WidgetToolbarRepository;
	}
}
