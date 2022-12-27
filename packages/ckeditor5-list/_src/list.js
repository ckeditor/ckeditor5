/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list
 */

import ListEditing from './list/listediting';
import ListUI from './list/listui';

import { Plugin } from 'ckeditor5/src/core';

/**
 * The list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/list/listediting~ListEditing list editing feature}
 * and {@link module:list/list/listui~ListUI list UI feature}.
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

/**
 * The configuration of the {@link module:list/list~List list} feature
 * and the {@link module:list/documentlist~DocumentList document list} feature.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				list:  ... // The list feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface ListConfig
 */

/**
 * The configuration of the {@link module:list/list~List} feature and the {@link module:list/documentlist~DocumentList} feature.
 *
 * Read more in {@link module:list/list~ListConfig}.
 *
 * @member {module:module:list/list~ListConfig} module:core/editor/editorconfig~EditorConfig#list
 */
