/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableCellPropertiesUI from './tablecellpropertiesui';
import TableCellPropertiesEditing from './tablecellproperties/tablecellpropertiesediting';

/**
 * The table cell properties feature.
 *
 * This is a "glue" plugin which loads the
 * {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing table editing feature} and
 * the {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI table UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellProperties';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableCellPropertiesEditing, TableCellPropertiesUI ];
	}
}
