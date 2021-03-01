/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getSelectedImageWidget } from './image/utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

/**
 * The image toolbar plugin. It creates and manages the image toolbar (the toolbar displayed when an image is selected).
 *
 * For a detailed overview, check the {@glink features/image#image-contextual-toolbar image contextual toolbar} documentation.
 *
 * Instances of toolbar components (e.g. buttons) are created using the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}
 * based on the {@link module:image/image~ImageConfig#toolbar `image.toolbar` configuration option}.
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
		return [ WidgetToolbarRepository ];
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
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		widgetToolbarRepository.register( 'image', {
			ariaLabel: t( 'Image toolbar' ),
			items: editor.config.get( 'image.toolbar' ) || [],
			getRelatedElement: getSelectedImageWidget
		} );
	}
}

/**
 * Items to be placed in the image toolbar.
 * This option is used by the {@link module:image/imagetoolbar~ImageToolbar} feature.
 *
 * Assuming that you use the following features:
 *
 * * {@link module:image/imagestyle~ImageStyle} (with a default configuration),
 * * {@link module:image/imagetextalternative~ImageTextAlternative},
 *
 * three toolbar items will be available in {@link module:ui/componentfactory~ComponentFactory}:
 * `'imageStyle:full'`, `'imageStyle:side'`, and `'imageTextAlternative'` so you can configure the toolbar like this:
 *
 *		const imageConfig = {
 *			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
 *		};
 *
 * Of course, the same buttons can also be used in the
 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
 *
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:image/image~ImageConfig#toolbar
 */
