/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststyle
 */

import { Plugin } from 'ckeditor5/src/core';
import ListStyleEditing from './liststyle/liststyleediting';
import ListStyleUI from './liststyle/liststyleui';

/**
 * The list style feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/liststyle/liststyleediting~ListStyleEditing list style editing feature}
 * and the {@link module:list/liststyle/liststyleui~ListStyleUI list style UI feature}.
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
