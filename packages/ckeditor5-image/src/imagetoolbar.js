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
import ImageBalloon from './image/ui/imageballoon';
import { isImageWidget } from './image/utils';

const balloonClassName = 'ck-toolbar-container ck-editor-toolbar-container';

/**
 * The image toolbar class. Creates an image toolbar that shows up when image widget is selected.
 *
 * Toolbar components are created using editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}
 * based on {@link module:core/editor/editor~Editor#config configuration} stored under `image.toolbar`.
 *
 * The toolbar uses {@link module:image/image/ui/imageballoon~ImageBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageBalloon ];
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
		this.listenTo( this.editor.editing.view, 'render', () => {
			this._checkIsVisible();
		}, { priority: 'low' } );

		// There is no render method after focus is back in editor, we need to check if balloon panel should be visible.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, is, was ) => {
			if ( !was && is ) {
				this._checkIsVisible();
			}
		} );
	}

	/**
	 * Checks whether the toolbar should show up or hide depending on the
	 * current selection.
	 *
	 * @protected
	 */
	_checkIsVisible() {
		const editingView = this.editor.editing.view;
		const selectedElement = editingView.selection.getSelectedElement();
		const balloon = this.editor.plugins.get( 'ImageBalloon' );
		const toolbar = this._toolbar;

		if ( selectedElement && isImageWidget( selectedElement ) ) {
			if ( !balloon.hasView( toolbar ) ) {
				balloon.add( {
					view: toolbar,
					balloonClassName
				} );
			}
		} else if ( balloon.hasView( toolbar ) ) {
			balloon.remove( toolbar );
		}
	}
}
