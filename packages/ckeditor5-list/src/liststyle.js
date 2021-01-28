/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststyle
 */

import { Plugin } from 'ckeditor5/src/core';
import ListStyleEditing from './liststyleediting';
import ListStyleUI from './liststyleui';

/**
 * The list style feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/liststyleediting~ListStyleEditing list style editing feature}
 * and the {@link module:list/liststyleui~ListStyleUI list style UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListStyleEditing, ListStyleUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListStyle';
	}
}
