import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { isWidget } from './utils';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Widget toolbar repository plugin. A central point for creating widget toolbars. This plugin handles the whole
 * toolbar rendering process and exposes concise API.
 *
 * Creating toolbar for the widget bases on the {@link ~register()} method.
 *
 * This plugin adds to the plugin list directly or indirectly prevents showing up
 * the {@link module:ui/toolbar/balloontoolbar~BalloonToolbar} toolbar and the widget toolbar at the same time.
 *
 * Usage example comes from {@link module:image/imagetoolbar~ImageToolbar}:
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
 *				widgetToolbarRepository.add( {
 *					toolbarItems: editor.config.get( 'image.toolbar' )
 *					visibleWhen: isImageWidgetSelected
 *				} );
 *			}
 *		}
 */
export default class WidgetToolbarRepository extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetToolbarRepository';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

		// Disables the default balloon toolbar for all widgets.
		if ( balloonToolbar ) {
			this.listenTo( balloonToolbar, 'show', evt => {
				if ( isWidgetSelected( editor.editing.view.document.selection ) ) {
					evt.stop();
				}
			}, { priority: 'high' } );
		}

		/**
		 * A map of toolbars.
		 *
		 * @protected
		 * @member {Map.<string,Object>} #_toolbars
		 */
		this._toolbars = new Map();

		/**
		 * @private
		 */
		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		this.listenTo( editor.ui, 'update', () => {
			this._updateToolbarsVisibility();
		} );

		// UI#update is not fired after focus is back in editor, we need to check if balloon panel should be visible.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => {
			this._updateToolbarsVisibility();
		}, { priority: 'low' } );
	}

	/**
	 * Registers toolbar in the WidgetToolbarRepository. It renders it in the `ContextualBalloon` based on the value of the invoked
	 * `visibleWhen` function. Toolbar items are gathered from `toolbarItems` array.
	 * The balloon's CSS class is by default `ck-toolbar-container` and may be override with the `balloonClassName` option.
	 *
	 * Note: This method should be called in the {@link module:core/plugin/Plugin~afterInit} to make sure that plugins for toolbar items
	 * will be already loaded and available in the UI component factory.
	 *
	 * @param {String} toolbarId An id for the toolbar. Used to
	 * @param {Object} options
	 * @param {Array.<String>} options.toolbarItems Array of toolbar items.
	 * @param {Function} options.visibleWhen Callback which specifies when the toolbar should be visible for the widget.
	 * @param {String} [options.balloonClassName='ck-toolbar-container'] CSS class for the widget balloon.
	 */
	register( toolbarId, { toolbarItems, visibleWhen, balloonClassName = 'ck-toolbar-container' } ) {
		const editor = this.editor;
		const toolbarView = new ToolbarView();

		toolbarView.fillFromConfig( toolbarItems, editor.ui.componentFactory );

		if ( this._toolbars.has( toolbarId ) ) {
			/**
			 * Toolbar with the given id was already added.
			 *
			 * @error widget-toolbar-duplicated
			 * @param toolbarId Toolbar id.
			 */
			throw new CKEditorError( 'widget-toolbar-duplicated: Toolbar with the given id was already added.', { toolbarId } );
		}

		this._toolbars.set( toolbarId, {
			view: toolbarView,
			visibleWhen,
			balloonClassName,
		} );
	}

	/**
	 * Removes toolbar with the given toolbarId.
	 *
	 * @param {String} toolbarId Toolbar identificator.
	 */
	deregister( toolbarId ) {
		const toolbar = this._toolbars.get( toolbarId );

		if ( !toolbar ) {
			/**
			 * Toolbar with the given id was already added.
			 *
			 * @error widget-toolbar-does-not-exist
			 * @param toolbarId Toolbar id.
			 */
			throw new CKEditorError( 'widget-toolbar-does-not-exist', { toolbarId } );
		}

		this._hideToolbar( toolbar );
		this._toolbars.delete( toolbarId );
	}

	/**
	 * Returns `true` when a toolbar with the given id is present in the widget toolbar repository.
	 *
	 * @param {String} toolbarId Toolbar identificator.
	 */
	isRegistered( toolbarId ) {
		return this._toolbars.has( toolbarId );
	}

	/**
	 * Iterates over stored toolbars and makes them visible or hidden.
	 *
	 * @private
	 */
	_updateToolbarsVisibility() {
		for ( const toolbar of this._toolbars.values() ) {
			if ( !this.editor.ui.focusTracker.isFocused || !toolbar.visibleWhen( this.editor.editing.view.document.selection ) ) {
				this._hideToolbar( toolbar );
			} else {
				this._showToolbar( toolbar );
			}
		}
	}

	/**
	 * Hides the given toolbar.
	 *
	 * @private
	 * @param {Object} toolbar
	 */
	_hideToolbar( toolbar ) {
		if ( !this._isToolbarVisible( toolbar ) ) {
			return;
		}

		this._balloon.remove( toolbar.view );
	}

	/**
	 * Shows up or repositions the given toolbar.
	 *
	 * @private
	 * @param {Object} toolbar
	 */
	_showToolbar( toolbar ) {
		if ( this._isToolbarVisible( toolbar ) ) {
			repositionContextualBalloon( this.editor );
		} else if ( !this._balloon.hasView( toolbar.view ) ) {
			this._balloon.add( {
				view: toolbar.view,
				position: getBalloonPositionData( this.editor ),
				balloonClassName: toolbar.balloonClassName,
			} );
		}
	}

	/**
	 * @private
	 * @param {Object} toolbar
	 */
	_isToolbarVisible( toolbar ) {
		return this._balloon.visibleView == toolbar.view;
	}
}

function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );
	const position = getBalloonPositionData( editor );

	balloon.updatePosition( position );
}

function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;
	const widget = getParentWidget( editingView.document.selection );

	return {
		target: editingView.domConverter.viewToDom( widget ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast
		]
	};
}

function getParentWidget( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && isWidget( selectedElement ) ) {
		return selectedElement;
	}

	const position = selection.getFirstPosition();
	let parent = position.parent;

	while ( parent ) {
		if ( parent.is( 'element' ) && isWidget( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}
}

function isWidgetSelected( selection ) {
	const viewElement = selection.getSelectedElement();

	return !!( viewElement && isWidget( viewElement ) );
}
