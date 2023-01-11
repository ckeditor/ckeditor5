/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetoolbar
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import ImageUtils from './imageutils';
import { isObject } from 'lodash-es';
import type { ImageStyleDropdownDefinition } from './imagestyle/imagestyleui';

/**
 * The image toolbar plugin. It creates and manages the image toolbar (the toolbar displayed when an image is selected).
 *
 * For an overview, check the {@glink features/images/images-overview#image-contextual-toolbar image contextual toolbar} documentation.
 *
 * Instances of toolbar components (e.g. buttons) are created using the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}
 * based on the {@link module:image/image~ImageConfig#toolbar `image.toolbar` configuration option}.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */
export default class ImageToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ WidgetToolbarRepository, ImageUtils ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageToolbar' {
		return 'ImageToolbar';
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		widgetToolbarRepository.register( 'image', {
			ariaLabel: t( 'Image toolbar' ),
			items: normalizeDeclarativeConfig( editor.config.get( 'image.toolbar' ) || [] ),
			getRelatedElement: selection => imageUtils.getClosestSelectedImageWidget( selection )!
		} );
	}
}

/**
 * Convert the dropdown definitions to their keys registered in the ComponentFactory.
 * The registration precess should be handled by the plugin which handles the UI of a particular feature.
 */
function normalizeDeclarativeConfig( config: Array<string | ImageStyleDropdownDefinition> ): Array<string> {
	return config.map( item => isObject( item ) ? item.name : item );
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ImageToolbar.pluginName ]: ImageToolbar;
	}

	interface ImageConfig {

		/**
		 * Items to be placed in the image toolbar.
		 * This option is used by the {@link module:image/imagetoolbar~ImageToolbar} feature.
		 *
		 * Assuming that you use the following features:
		 *
		 * * {@link module:image/imagestyle~ImageStyle} (with a default configuration),
		 * * {@link module:image/imagetextalternative~ImageTextAlternative},
		 * * {@link module:image/imagecaption~ImageCaption},
		 *
		 * the following toolbar items will be available in {@link module:ui/componentfactory~ComponentFactory}:
		 * * `'imageTextAlternative'`,
		 * * `'toggleImageCaption'`,
		 * * {@link module:image/image~ImageConfig#styles buttons provided by the `ImageStyle` plugin},
		 * * {@link module:image/imagestyle/utils~DEFAULT_DROPDOWN_DEFINITIONS drop-downs provided by the `ImageStyle` plugin},
		 *
		 * so you can configure the toolbar like this:
		 *
		 * ```ts
		 * const imageConfig = {
		 * 	toolbar: [
		 * 		'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|',
		 * 		'toggleImageCaption', 'imageTextAlternative'
		 * 	]
		 * };
		 * ```
		 *
		 * Besides that, the `ImageStyle` plugin allows to define a
		 * {@link module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition custom drop-down} while configuring the toolbar.
		 *
		 * The same items can also be used in the {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
		 *
		 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
		 */
		toolbar?: Array<string | ImageStyleDropdownDefinition>;
	}
}
