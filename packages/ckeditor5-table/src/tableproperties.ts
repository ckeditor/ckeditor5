/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableproperties
 */

import { Plugin } from 'ckeditor5/src/core.js';

import TablePropertiesEditing from './tableproperties/tablepropertiesediting.js';
import TablePropertiesUI from './tableproperties/tablepropertiesui.js';

/**
 * The table properties feature. Enables support for setting properties of tables (size, border, background, etc.).
 *
 * Read more in the {@glink features/tables/tables-styling Table and cell styling tools} section.
 * See also the {@link module:table/tablecellproperties~TableCellProperties} plugin.
 *
 * This is a "glue" plugin that loads the
 * {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing table properties editing feature} and
 * the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI table properties UI feature}.
 */
export default class TableProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableProperties' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TablePropertiesEditing, TablePropertiesUI ] as const;
	}
}
