/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list
 */

import ListEditing from './list/listediting';
import ListUI from './list/listui';

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

/**
 * The list feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/list/listediting~ListEditing list editing feature}
 * and {@link module:list/list/listui~ListUI list UI feature}.
 */
export default class List extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ListEditing, ListUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'List' {
		return 'List';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ List.pluginName ]: List;
	}
}
