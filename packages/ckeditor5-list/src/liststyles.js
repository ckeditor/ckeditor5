/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststyles
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ListStylesEditing from './liststylesediting';
import ListStylesUI from './liststylesui';

/**
 * The to-do list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/liststylesediting~ListStylesEditing list styles editing feature}
 * and the {@link module:list/liststylesolistui~ListStylesUI list styles UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListStyles extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListStylesEditing, ListStylesUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListStyles';
	}
}
