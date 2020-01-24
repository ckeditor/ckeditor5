/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TablePropertiesEditing from './tableproperties/tablepropertiesediting';

/**
 * The table properties feature.
 *
 * This is a "glue" plugin which loads the
 * {@link module:table/tableproperties/tablepropertiesediting~TableCellPropertiesEditing table editing feature} and
 * table UI feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableProperties';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TablePropertiesEditing ];
	}
}
