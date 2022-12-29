/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-line/horizontalline
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';
import HorizontalLineEditing from './horizontallineediting';
import HorizontalLineUI from './horizontallineui';

/**
 * The horizontal line feature.
 *
 * It provides the possibility to insert a horizontal line into the rich-text editor.
 *
 * For a detailed overview, check the {@glink features/horizontal-line Horizontal line feature} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HorizontalLine extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HorizontalLineEditing, HorizontalLineUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HorizontalLine';
	}
}
