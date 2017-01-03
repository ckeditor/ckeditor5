/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetoolbar
 */

import Plugin from 'ckeditor5-core/src/plugin';
import ToolbarView from 'ckeditor5-ui/src/toolbar/toolbarview';
import { isImageWidget } from './utils';
import ImageBalloonPanel from './ui/imageballoonpanel';
/**
 * Image toolbar class. Creates image toolbar placed inside balloon panel that is showed when image widget is selected.
 * Toolbar components are created using editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}
 * based on {@link module:core/editor/editor~Editor#config configuration} stored under `image.toolbar`.
 *
 * @extends module:core/plugin~Plugin.
 */
export default class ImageToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const toolbarConfig = editor.config.get( 'image.toolbar' );

		// Don't add the toolbar if there is no configuration.
		if ( !toolbarConfig ) {
			return;
		}

		this._panel = new ImageBalloonPanel( editor );

		const panel = this._panel;
		const promises = [];
		const toolbar = new ToolbarView();
		panel.content.add( toolbar );

		// Add buttons to the toolbar.
		for ( let name of toolbarConfig ) {
			promises.push( toolbar.items.add( editor.ui.componentFactory.create( name ) ) );
		}

		// Add toolbar to editor's UI.
		promises.push( editor.ui.view.body.add( panel ) );

		// Show toolbar each time image widget is selected.
		editor.listenTo( this.editor.editing.view, 'render', () => {
			this.show();
		} );

		return Promise.all( promises );
	}

	show() {
		const selectedElement = this.editor.editing.view.selection.getSelectedElement();

		if ( selectedElement && isImageWidget( selectedElement ) ) {
			this._panel.attach();
		}
	}

	hide() {
		this._panel.detach();
	}
}
