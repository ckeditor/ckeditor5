/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import DocumentListPropertiesEditing from './documentlistproperties/documentlistpropertiesediting';
import ListPropertiesUI from './listproperties/listpropertiesui';

/**
 * The document list properties feature.
 *
 * This is a "glue" plugin that loads the
 * {@link module:list/documentlistproperties/documentlistpropertiesediting~DocumentListPropertiesEditing document list properties
 * editing feature} and the {@link module:list/listproperties/listpropertiesui~ListPropertiesUI list properties UI feature}.
 */
export default class DocumentListProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ DocumentListPropertiesEditing, ListPropertiesUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DocumentListProperties' {
		return 'DocumentListProperties';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ DocumentListProperties.pluginName ]: DocumentListProperties;
	}
}
