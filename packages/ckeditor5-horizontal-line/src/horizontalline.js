/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-line/horizontalline
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HorizontalLineEditing from './horizontallineediting';
import HorizontalLineUI from './horizontallineui';

/**
 * The horizontal line plugin provides a possibility to insert a horizontal line in the rich-text editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HorizontalLine extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HorizontalLineEditing, HorizontalLineUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HorizontalLine';
	}
}
