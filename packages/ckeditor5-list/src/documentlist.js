/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist
 */

import { Plugin } from 'ckeditor5/src/core';
import DocumentListEditing from './documentlist/documentlistediting';
import ListUI from './list/listui';

/**
 * The document list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/documentlist/documentlistediting~DocumentListEditing document list
 * editing feature} and {@link module:list/list/listui~ListUI list UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentList extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DocumentListEditing, ListUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentList';
	}
}
