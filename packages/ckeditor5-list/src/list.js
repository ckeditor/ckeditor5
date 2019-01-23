/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/list
 */

import ListEditing from './listediting';
import ListUI from './listui';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The list feature.
 *
 * This is a "glue" plugin which loads the {@link module:list/listediting~ListEditing list editing feature}
 * and {@link module:list/listui~ListUI list UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class List extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListEditing, ListUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'List';
	}
}
