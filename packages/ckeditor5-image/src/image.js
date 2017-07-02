/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageEngine from './image/imageengine';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ImageTextAlternative from './imagetextalternative';
import { isImageWidget } from './image/utils';

import '../theme/theme.scss';

/**
 * The image plugin.
 *
 * Uses {@link module:image/image/imageengine~ImageEngine}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Image extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine, Widget, ImageTextAlternative ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Image';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const contextualToolbar = editor.plugins.get( 'ContextualToolbar' );

		// If `ContextualToolbar` plugin is loaded, it should be disabled for images
		// which have their own toolbar to avoid duplication.
		// https://github.com/ckeditor/ckeditor5-image/issues/110
		if ( contextualToolbar ) {
			this.listenTo( contextualToolbar, 'beforeShow', ( evt, stop ) => {
				const selectedElement = editor.editing.view.selection.getSelectedElement();

				if ( selectedElement && isImageWidget( selectedElement ) ) {
					stop();
				}
			} );
		}
	}
}
