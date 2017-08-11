/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetoolbar
 */

import Template from '@ckeditor/ckeditor5-ui/src/template';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import { isImageWidget } from './image/utils';
import { repositionContextualBalloon, getBalloonPositionData } from './image/ui/utils';

const balloonClassName = 'ck-toolbar-container ck-editor-toolbar-container';

/**
 * The image toolbar class. Creates an image toolbar that shows up when the image widget is selected.
 *
 * Toolbar components are created using the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}
 * based on the {@link module:core/editor/editor~Editor#config configuration} stored under `image.toolbar`.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageToolbar extends Plugin {
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
		return 'ImageToolbar';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const toolbarConfig = editor.config.get( 'image.toolbar' );

		// Don't add the toolbar if there is no configuration.
		if ( !toolbarConfig || !toolbarConfig.length ) {
			return;
		}

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		/**
		 * A `ToolbarView` instance used to display the buttons specific for image
		 * editing.
		 *
		 * @protected
		 * @type {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this._toolbar = new ToolbarView();

		// Add CSS class to the toolbar.
		Template.extend( this._toolbar.template, {
			attributes: {
				class: 'ck-editor-toolbar'
			}
		} );

		// Add buttons to the toolbar.
		this._toolbar.fillFromConfig( toolbarConfig, editor.ui.componentFactory );

		// Show balloon panel each time image widget is selected.
		this.listenTo( editor.editing.view, 'render', () => {
			this._checkIsVisible();
		}, { priority: 'low' } );

		// There is no render method after focus is back in editor, we need to check if balloon panel should be visible.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => {
			this._checkIsVisible();
		}, { priority: 'low' } );
	}

	/**
	 * Checks whether the toolbar should show up or hide depending on the
	 * current selection.
	 *
	 * @private
	 */
	_checkIsVisible() {
		const editor = this.editor;

		if ( !editor.ui.focusTracker.isFocused ) {
			this._hideToolbar();
		} else {
			const editingView = editor.editing.view;
			const selectedElement = editingView.selection.getSelectedElement();

			if ( selectedElement && isImageWidget( selectedElement ) ) {
				this._showToolbar();
			} else {
				this._hideToolbar();
			}
		}
	}

	/**
	 * Shows the {@link #_toolbar} in the {@link #_balloon}.
	 *
	 * @private
	 */
	_showToolbar() {
		const editor = this.editor;

		if ( this._isVisible ) {
			repositionContextualBalloon( editor );
		} else {
			if ( !this._balloon.hasView( this._toolbar ) ) {
				this._balloon.add( {
					view: this._toolbar,
					position: getBalloonPositionData( editor ),
					balloonClassName
				} );
			}
		}
	}

	/**
	 * Removes the {@link #_toolbar} from the {@link #_balloon}.
	 *
	 * @private
	 */
	_hideToolbar() {
		if ( !this._isVisible ) {
			return;
		}

		this._balloon.remove( this._toolbar );
	}

	/**
	 * Returns `true` when the {@link #_toolbar} is the visible view
	 * in the {@link #_balloon}.
	 *
	 * @private
	 * @type {Boolean}
	 */
	get _isVisible() {
		return this._balloon.visibleView == this._toolbar;
	}
}

/**
 * Items to be placed in the image toolbar.
 * The option is used by the {@link module:image/imagetoolbar~ImageToolbar} feature.
 *
 * Assuming that you use the following features:
 *
 * * {@link module:image/imagestyle~ImageStyle} (with a default configuration),
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Three toolbar items will be available in {@link module:ui/componentfactory~ComponentFactory}:
 * `'imageStyleFull'`, `'imageStyleSide'`, and `'imageTextAlternative'` so you can configure the toolbar like this:
 *
 *		const imageConfig = {
 *			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
 *		};
 *
 * Of course, the same buttons can also be used in the
 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
 *
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:image/image~ImageConfig#toolbar
 */
