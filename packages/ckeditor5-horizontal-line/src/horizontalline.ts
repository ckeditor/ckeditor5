/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-line/horizontalline
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';
import HorizontalLineEditing from './horizontallineediting';
import HorizontalLineUI from './horizontallineui';

/**
 * The horizontal line feature.
 *
 * It provides the possibility to insert a horizontal line into the rich-text editor.
 *
 * For a detailed overview, check the {@glink features/horizontal-line Horizontal line feature} documentation.
 */
export default class HorizontalLine extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ HorizontalLineEditing, HorizontalLineUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'HorizontalLine' {
		return 'HorizontalLine';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ HorizontalLine.pluginName ]: HorizontalLine;
	}
}

