/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties
 */

import { Plugin } from 'ckeditor5/src/core';
import DocumentListPropertiesEditing from './documentlistproperties/documentlistpropertiesediting';
import ListPropertiesUI from './listproperties/listpropertiesui';

/**
 * The document list properties feature.
 *
 * This is a "glue" plugin that loads the
 * {@link module:list/documentlistproperties/documentlistpropertiesediting~DocumentListPropertiesEditing document list properties
 * editing feature} and the {@link module:list/listproperties/listpropertiesui~ListPropertiesUI list properties UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DocumentListPropertiesEditing, ListPropertiesUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListProperties';
	}
}
