/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgettoolbarrepository
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { isWidget } from './utils';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
 *					getRelatedElement: getSelectedImageWidget
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

		// Disables the default balloon toolbar for all widgets.
		if ( editor.plugins.has( 'BalloonToolbar' ) ) {
			const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

			this.listenTo( balloonToolbar, 'show', evt => {
				if ( isWidgetSelected( editor.editing.view.document.selection ) ) {
					evt.stop();
				}
			}, { priority: 'high' } );
		}

		/**
		 * Flag indicating whether a plugin is enabled or disabled.
		 * A disabled plugin won't show any toolbar.
		 *
		 * Plugin can be simply disabled like that:
		 *
		 *		// Disable the plugin so that no toolbars are visible.
		 *		editor.plugins.get( 'WidgetToolbarRepository' ).isEnabled = false;
		 *
		 * You can also use {@link #forceDisabled} method.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

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

		/**
		 * Holds identifiers for {@link #forceDisabled} mechanism.
		 *
		 * @type {Set.<String>}
		 * @private
		 */
		this._disableStack = new Set();

		this.on( 'change:isEnabled', () => {
			this._updateToolbarsVisibility();
		} );

		this.listenTo( editor.ui, 'update', () => {
			this._updateToolbarsVisibility();
		} );

		// UI#update is not fired after focus is back in editor, we need to check if balloon panel should be visible.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => {
			this._updateToolbarsVisibility();
		}, { priority: 'low' } );
	}

	destroy() {
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
	register( toolbarId, { ariaLabel, items, getRelatedElement, balloonClassName = 'ck-toolbar-container' } ) {
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
			throw new CKEditorError( 'widget-toolbar-duplicated: Toolbar with the given id was already added.', this, { toolbarId } );
		}

		toolbarView.fillFromConfig( items, editor.ui.componentFactory );

		this._toolbarDefinitions.set( toolbarId, {
			view: toolbarView,
			getRelatedElement,
			balloonClassName,
		} );
	}

	/**
	 * Forces the plugin to be disabled.
	 *
	 * Plugin may be disabled by multiple features or algorithms (at once). When disabling a plugin, unique id should be passed
	 * (e.g. feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the plugin.
	 * The plugin becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
	 *
	 * Disabling and enabling a plugin:
	 *
	 *		const plugin = editor.plugins.get( 'WidgetToolbarRepository' );
	 *
	 *		plugin.isEnabled; // -> true
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> false
	 *		plugin.clearForceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> true
	 *
	 * Plugin disabled by multiple features:
	 *
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.forceDisabled( 'OtherFeature' );
	 *		plugin.clearForceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> false
	 *		plugin.clearForceDisabled( 'OtherFeature' );
	 *		plugin.isEnabled; // -> true
	 *
	 * Multiple disabling with the same identifier is redundant:
	 *
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.forceDisabled( 'MyFeature' );
	 *		plugin.clearForceDisabled( 'MyFeature' );
	 *		plugin.isEnabled; // -> true
	 *
	 * **Note:** some plugins or algorithms may have more complex logic when it comes to enabling or disabling certain plugins,
	 * so the plugin might be still disabled after {@link #clearForceDisabled} was used.
	 *
	 * @param {String} id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the plugin.
	 */
	forceDisabled( id ) {
		this._disableStack.add( id );

		if ( this._disableStack.size == 1 ) {
			this.on( 'set:isEnabled', forceDisable, { priority: 'highest' } );
			this.isEnabled = false;
		}
	}

	/**
	 * Clears forced disable previously set through {@link #clearForceDisabled}. See {@link #clearForceDisabled}.
	 *
	 * @param {String} id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
	 */
	clearForceDisabled( id ) {
		this._disableStack.delete( id );

		if ( this._disableStack.size == 0 ) {
			this.off( 'set:isEnabled', forceDisable );
			this.isEnabled = true;
		}
	}

	/**
	 * Iterates over stored toolbars and makes them visible or hidden.
	 *
	 * @private
	 */
	_updateToolbarsVisibility() {
		let maxRelatedElementDepth = 0;
		let deepestRelatedElement = null;
		let deepestToolbarDefinition = null;

		for ( const definition of this._toolbarDefinitions.values() ) {
			const relatedElement = definition.getRelatedElement( this.editor.editing.view.document.selection );

			if ( !this.isEnabled ) {
				if ( this._isToolbarInBalloon( definition ) ) {
					this._hideToolbar( definition );
				}
			} else if ( !this.editor.ui.focusTracker.isFocused ) {
				if ( this._isToolbarVisible( definition ) ) {
					this._hideToolbar( definition );
				}
			} else if ( !relatedElement ) {
				if ( this._isToolbarInBalloon( definition ) ) {
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
			this._showToolbar( deepestToolbarDefinition, deepestRelatedElement );
		}
	}

	/**
	 * Hides the given toolbar.
	 *
	 * @private
	 * @param {module:widget/widgettoolbarrepository~WidgetRepositoryToolbarDefinition} toolbarDefinition
	 */
	_hideToolbar( toolbarDefinition ) {
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
	_showToolbar( toolbarDefinition, relatedElement ) {
		if ( this._isToolbarVisible( toolbarDefinition ) ) {
			repositionContextualBalloon( this.editor, relatedElement );
		} else if ( !this._isToolbarInBalloon( toolbarDefinition ) ) {
			this._balloon.add( {
				view: toolbarDefinition.view,
				position: getBalloonPositionData( this.editor, relatedElement ),
				balloonClassName: toolbarDefinition.balloonClassName,
			} );

			// Update toolbar position each time stack with toolbar view is switched to visible.
			// This is in a case target element has changed when toolbar was in invisible stack
			// e.g. target image was wrapped by a block quote.
			// See https://github.com/ckeditor/ckeditor5-widget/issues/92.
			this.listenTo( this._balloon, 'change:visibleView', () => {
				for ( const definition of this._toolbarDefinitions.values() ) {
					if ( this._isToolbarVisible( definition ) ) {
						const relatedElement = definition.getRelatedElement( this.editor.editing.view.document.selection );
						repositionContextualBalloon( this.editor, relatedElement );
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
	_isToolbarVisible( toolbar ) {
		return this._balloon.visibleView === toolbar.view;
	}

	/**
	 * @private
	 * @param {Object} toolbar
	 * @returns {Boolean}
	 */
	_isToolbarInBalloon( toolbar ) {
		return this._balloon.hasView( toolbar.view );
	}
}

function repositionContextualBalloon( editor, relatedElement ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );
	const position = getBalloonPositionData( editor, relatedElement );

	balloon.updatePosition( position );
}

function getBalloonPositionData( editor, relatedElement ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;

	return {
		target: editingView.domConverter.mapViewToDom( relatedElement ),
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

function isWidgetSelected( selection ) {
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

// Helper function that forces command to be disabled.
function forceDisable( evt ) {
	evt.return = false;
	evt.stop();
}
