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
			items: normalizeDeclarativeConfig( editor.config.get( 'image.toolbar' ) as Array<ImageStyleDropdownDefinition> || [] ),
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
}
